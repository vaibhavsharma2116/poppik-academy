
<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

require_once '../config.php';

$method = $_SERVER['REQUEST_METHOD'];

try {
    if ($method === 'GET') {
        $students = $pdo->query("SELECT s.*, c.name as course_name FROM students s LEFT JOIN courses c ON s.course_id = c.id ORDER BY s.created_at DESC")->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(['success' => true, 'data' => $students]);
    }
    elseif ($method === 'POST') {
        $data = json_decode(file_get_contents('php://input'), true);
        $stmt = $pdo->prepare("INSERT INTO students (name, email, phone, course_id, status) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([$data['name'], $data['email'], $data['phone'], $data['course_id'], $data['status']]);
        echo json_encode(['success' => true, 'message' => 'Student added successfully']);
    }
    elseif ($method === 'PUT') {
        $id = $_GET['id'];
        $data = json_decode(file_get_contents('php://input'), true);
        $stmt = $pdo->prepare("UPDATE students SET name = ?, email = ?, phone = ?, course_id = ?, status = ? WHERE id = ?");
        $stmt->execute([$data['name'], $data['email'], $data['phone'], $data['course_id'], $data['status'], $id]);
        echo json_encode(['success' => true, 'message' => 'Student updated successfully']);
    }
    elseif ($method === 'DELETE') {
        $id = $_GET['id'];
        $stmt = $pdo->prepare("DELETE FROM students WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode(['success' => true, 'message' => 'Student deleted successfully']);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
