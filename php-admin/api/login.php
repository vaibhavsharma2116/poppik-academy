<?php
/**
 * Admin Login API Endpoint
 *
 * POST /api/login.php
 *
 * Request body:
 * {
 *   "email": "string",
 *   "password": "string"
 * }
 *
 * Response:
 * {
 *   "success": boolean,
 *   "message": "string",
 *   "adminId": number (if success)
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

// Get JSON payload
$input = json_decode(file_get_contents('php://input'), true);

if (!$input || !isset($input['email']) || !isset($input['password'])) {
    http_response_code(400);
    exit(json_encode(['success' => false, 'message' => 'Missing email or password']));
}

$email = $input['email'];
$password = $input['password'];

try {
    // Fetch admin by email
    $stmt = $pdo->prepare('SELECT id, password FROM admins WHERE email = ?');
    $stmt->execute([$email]);
    $admin = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$admin || !password_verify($password, $admin['password'])) {
        http_response_code(401);
        exit(json_encode(['success' => false, 'message' => 'Invalid email or password']));
    }

    // Set session
    $_SESSION['admin_id'] = $admin['id'];
    $_SESSION['admin_email'] = $email;

    http_response_code(200);
    exit(json_encode([
        'success' => true,
        'message' => 'Login successful',
        'adminId' => $admin['id']
    ]));

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
