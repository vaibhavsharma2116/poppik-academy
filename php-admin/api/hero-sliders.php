
<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

require_once '../config.php';

$method = $_SERVER['REQUEST_METHOD'];

try {
    if ($method === 'GET') {
        $sliders = $pdo->query("SELECT * FROM hero_sliders WHERE status = 'Active' ORDER BY sort_order ASC")->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(['success' => true, 'data' => $sliders]);
    } 
    elseif ($method === 'POST') {
        $data = json_decode(file_get_contents('php://input'), true);
        if (!is_array($data)) {
            $data = [];
        }
        $stmt = $pdo->prepare("INSERT INTO hero_sliders (title, subtitle, image, button_text, button_link, sort_order, status) VALUES (?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([
            $data['title'] ?? '', 
            $data['subtitle'] ?? '', 
            $data['image'] ?? '', 
            $data['button_text'] ?? '', 
            $data['button_link'] ?? '', 
            $data['sort_order'] ?? 0, 
            $data['status'] ?? 'Active'
        ]);
        echo json_encode(['success' => true, 'message' => 'Slider added successfully']);
    }
    elseif ($method === 'PUT') {
        $id = $_GET['id'];
        $data = json_decode(file_get_contents('php://input'), true);
        if (!is_array($data)) {
            $data = [];
        }
        $stmt = $pdo->prepare("UPDATE hero_sliders SET title = ?, subtitle = ?, image = ?, button_text = ?, button_link = ?, sort_order = ?, status = ? WHERE id = ?");
        $stmt->execute([
            $data['title'] ?? '', 
            $data['subtitle'] ?? '', 
            $data['image'] ?? '', 
            $data['button_text'] ?? '', 
            $data['button_link'] ?? '', 
            $data['sort_order'] ?? 0, 
            $data['status'] ?? 'Active', 
            $id
        ]);
        echo json_encode(['success' => true, 'message' => 'Slider updated successfully']);
    }
    elseif ($method === 'DELETE') {
        $id = $_GET['id'];
        $stmt = $pdo->prepare("DELETE FROM hero_sliders WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode(['success' => true, 'message' => 'Slider deleted successfully']);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
