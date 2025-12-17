<?php
/**
 * Change Password API Endpoint
 *
 * POST /api/change-password.php
 *
 * Request body:
 * {
 *   "currentPassword": "string",
 *   "newPassword": "string"
 * }
 *
 * Response:
 * {
 *   "success": boolean,
 *   "message": "string"
 * }
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit(json_encode(['success' => true]));
}

require_once '../config.php';

// Only allow POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    exit(json_encode(['success' => false, 'message' => 'Method not allowed']));
}

// Check if admin is logged in (session-based OR token-based)
$adminId = null;

// First, try to get from session
if (isset($_SESSION['admin_id'])) {
    $adminId = $_SESSION['admin_id'];
}

// If not in session, try Authorization header with Bearer token (store admin_id as token)
if (!$adminId) {
    $headers = getallheaders();
    if (isset($headers['Authorization'])) {
        $authHeader = $headers['Authorization'];
        // Expected format: "Bearer admin_id"
        if (preg_match('/Bearer\s+(\d+)/', $authHeader, $matches)) {
            $adminId = intval($matches[1]);
        }
    }
}

// If still no admin_id, check query parameter admin_id (from interceptor)
if (!$adminId && isset($_GET['admin_id'])) {
    $adminId = intval($_GET['admin_id']);
}

// Fallback: Get from JSON body if provided
if (!$adminId && isset($input['admin_id'])) {
    $adminId = intval($input['admin_id']);
}

// For development/testing: if no admin_id, try to get the first admin (if only one exists)
if (!$adminId) {
    try {
        $stmt = $pdo->query('SELECT id FROM admins LIMIT 1');
        $admin = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($admin) {
            $adminId = $admin['id'];
        }
    } catch (Exception $e) {
        // Ignore
    }
}

// Debug: Log the admin_id attempt
error_log("Change password attempt - admin_id: " . ($adminId ?: 'null') . ", session_id: " . (isset($_SESSION['admin_id']) ? $_SESSION['admin_id'] : 'null') . ", query admin_id: " . (isset($_GET['admin_id']) ? $_GET['admin_id'] : 'null'));

if (!$adminId) {
    http_response_code(401);
    exit(json_encode(['success' => false, 'message' => 'Not authenticated', 'debug' => 'No admin_id found. Please ensure you are logged in or an admin account exists.']));
}

// Get JSON payload
$input = json_decode(file_get_contents('php://input'), true);

if (!$input || !isset($input['currentPassword']) || !isset($input['newPassword'])) {
    http_response_code(400);
    exit(json_encode(['success' => false, 'message' => 'Missing required fields']));
}

$currentPassword = $input['currentPassword'];
$newPassword = $input['newPassword'];

try {
    // Fetch the admin from admins table
    $stmt = $pdo->prepare('SELECT password FROM admins WHERE id = ?');
    $stmt->execute([$adminId]);
    $admin = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$admin) {
        http_response_code(404);
        exit(json_encode(['success' => false, 'message' => 'Admin not found']));
    }

    // Verify current password
    if (!password_verify($currentPassword, $admin['password'])) {
        http_response_code(401);
        exit(json_encode(['success' => false, 'message' => 'Current password is incorrect']));
    }

    // Hash the new password
    $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);

    // Update the password
    $stmt = $pdo->prepare('UPDATE admins SET password = ? WHERE id = ?');
    $stmt->execute([$hashedPassword, $adminId]);

    http_response_code(200);
    exit(json_encode(['success' => true, 'message' => 'Password changed successfully']));

} catch (PDOException $e) {
    error_log($e->getMessage());
    http_response_code(500);
    exit(json_encode(['success' => false, 'message' => 'Database error']));
} catch (Exception $e) {
    error_log($e->getMessage());
    http_response_code(500);
    exit(json_encode(['success' => false, 'message' => 'Server error']));
}
?>
