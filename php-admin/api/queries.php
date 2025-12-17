<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../config.php';

try {
    $method = $_SERVER['REQUEST_METHOD'];
    if ($method === 'GET') {
        // return all queries ordered by ID (ascending) so they're shown in ID sequence
        $stmt = $pdo->query("SELECT * FROM queries ORDER BY id ASC");
        $data = $stmt->fetchAll();
        echo json_encode(['success' => true, 'data' => $data]);
        exit;
    }

    if ($method === 'POST') {
        // Accept JSON body
        $body = json_decode(file_get_contents('php://input'), true);
        if (!$body) $body = $_POST;

        $name = $body['name'] ?? '';
        $email = $body['email'] ?? '';
        $phone = $body['phone'] ?? '';
        $subject = $body['subject'] ?? '';
        $message = $body['message'] ?? '';

        if (empty($name) || empty($email) || empty($message)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Name, email and message are required']);
            exit;
        }

        $stmt = $pdo->prepare("INSERT INTO queries (name, email, phone, subject, message, status, created_at) VALUES (?, ?, ?, ?, ?, 'Pending', NOW())");
        $stmt->execute([$name, $email, $phone, $subject, $message]);
        $id = $pdo->lastInsertId();

        echo json_encode(['success' => true, 'message' => 'Query submitted', 'id' => $id]);
        exit;
    }

    // other methods not implemented
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}

?>
