<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: GET, POST, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

require_once '../config.php';

$method = $_SERVER['REQUEST_METHOD'];

try {
    if ($method === 'GET') {
        $certificates = $pdo->query("SELECT cert.*, s.name as student_name, c.name as course_name FROM certificates cert LEFT JOIN students s ON cert.student_id = s.id LEFT JOIN courses c ON cert.course_id = c.id ORDER BY cert.created_at DESC")->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(['success' => true, 'data' => $certificates]);
    }
    elseif ($method === 'POST') {
        // Expect JSON payload similar to admin's form
        $data = json_decode(file_get_contents('php://input'), true);
        if (!$data) {
            // fallback to form-encoded
            $data = $_POST;
        }
        // generate certificate code
        $code = 'CERT-' . date('Y') . '-' . str_pad(rand(1, 9999), 4, '0', STR_PAD_LEFT);
        $stmt = $pdo->prepare("INSERT INTO certificates (student_id, course_id, certificate_code, issue_date, status, created_at) VALUES (?, ?, ?, ?, ?, NOW())");
        $stmt->execute([
            $data['student_id'],
            $data['course_id'],
            $code,
            $data['issue_date'],
            $data['status'] ?? 'Issued'
        ]);
        echo json_encode(['success' => true, 'message' => 'Certificate issued', 'code' => $code]);
    }
    elseif ($method === 'DELETE') {
        $id = $_GET['id'];
        $stmt = $pdo->prepare("DELETE FROM certificates WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode(['success' => true, 'message' => 'Certificate deleted']);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
