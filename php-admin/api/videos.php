
<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../config.php';

$method = $_SERVER['REQUEST_METHOD'];

try {
    switch ($method) {
        case 'GET':
            $stmt = $pdo->query("SELECT * FROM videos WHERE status = 'Active' ORDER BY created_at DESC");
            $videos = $stmt->fetchAll();
            echo json_encode(['success' => true, 'data' => $videos]);
            break;

        case 'POST':
            $data = json_decode(file_get_contents('php://input'), true);
            $stmt = $pdo->prepare("INSERT INTO videos (title, description, video_url, thumbnail, category, duration, status) VALUES (?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([
                $data['title'],
                $data['description'] ?? '',
                $data['video_url'] ?? '',
                $data['thumbnail'] ?? '',
                $data['category'] ?? 'Beauty',
                $data['duration'] ?? '',
                $data['status'] ?? 'Active'
            ]);
            echo json_encode(['success' => true, 'message' => 'Video added successfully']);
            break;

        case 'PUT':
            $data = json_decode(file_get_contents('php://input'), true);
            $id = $_GET['id'] ?? null;
            if ($id) {
                $stmt = $pdo->prepare("UPDATE videos SET title = ?, description = ?, video_url = ?, thumbnail = ?, category = ?, duration = ?, status = ? WHERE id = ?");
                $stmt->execute([
                    $data['title'],
                    $data['description'] ?? '',
                    $data['video_url'] ?? '',
                    $data['thumbnail'] ?? '',
                    $data['category'] ?? 'Beauty',
                    $data['duration'] ?? '',
                    $data['status'] ?? 'Active',
                    $id
                ]);
                echo json_encode(['success' => true, 'message' => 'Video updated successfully']);
            }
            break;

        case 'DELETE':
            $id = $_GET['id'] ?? null;
            if ($id) {
                $stmt = $pdo->prepare("DELETE FROM videos WHERE id = ?");
                $stmt->execute([$id]);
                echo json_encode(['success' => true, 'message' => 'Video deleted successfully']);
            }
            break;
    }
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>
