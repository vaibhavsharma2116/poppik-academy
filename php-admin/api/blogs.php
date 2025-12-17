
<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../config.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    if ($method === 'GET') {
        $stmt = $pdo->query("SELECT * FROM blogs WHERE status = 'Published' ORDER BY created_at DESC");
        $blogs = $stmt->fetchAll();
        echo json_encode(['success' => true, 'data' => $blogs]);
    }
    elseif ($method === 'POST') {
        $data = json_decode(file_get_contents('php://input'), true);
        $stmt = $pdo->prepare("INSERT INTO blogs (title, excerpt, content, image, author, category, status) VALUES (?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([
            $data['title'],
            $data['excerpt'] ?? '',
            $data['content'] ?? '',
            $data['image'] ?? '',
            $data['author'] ?? '',
            $data['category'] ?? 'Beauty',
            $data['status'] ?? 'Published'
        ]);
        echo json_encode(['success' => true, 'id' => $pdo->lastInsertId()]);
    }
    elseif ($method === 'PUT') {
        $id = $_GET['id'] ?? null;
        $data = json_decode(file_get_contents('php://input'), true);
        $stmt = $pdo->prepare("UPDATE blogs SET title = ?, excerpt = ?, content = ?, image = ?, author = ?, category = ?, status = ? WHERE id = ?");
        $stmt->execute([
            $data['title'],
            $data['excerpt'] ?? '',
            $data['content'] ?? '',
            $data['image'] ?? '',
            $data['author'] ?? '',
            $data['category'] ?? 'Beauty',
            $data['status'] ?? 'Published',
            $id
        ]);
        echo json_encode(['success' => true]);
    }
    elseif ($method === 'DELETE') {
        $id = $_GET['id'] ?? null;
        $stmt = $pdo->prepare("DELETE FROM blogs WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode(['success' => true]);
    }
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>
