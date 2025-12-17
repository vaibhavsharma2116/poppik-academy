
<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

require_once '../config.php';

$method = $_SERVER['REQUEST_METHOD'];

try {
    if ($method === 'GET') {
        $courses = $pdo->query("SELECT id, name, description, duration, category, status, image FROM courses WHERE status = 'Active' ORDER BY created_at DESC")->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(['success' => true, 'data' => $courses]);
    } 
    elseif ($method === 'POST') {
        $data = json_decode(file_get_contents('php://input'), true);

        // Handle optional base64 image upload (frontend sends dataURL)
        $imageFilename = null;
        if (!empty($data['image']) && preg_match('/^data:(image\/[a-zA-Z]+);base64,/', $data['image'], $m)) {
            $mime = $m[1];
            $base64 = substr($data['image'], strpos($data['image'], ',') + 1);
            $decoded = base64_decode($base64);
            if ($decoded !== false) {
                $ext = '';
                switch ($mime) {
                    case 'image/jpeg': $ext = 'jpg'; break;
                    case 'image/png': $ext = 'png'; break;
                    case 'image/gif': $ext = 'gif'; break;
                    default: $ext = 'bin'; break;
                }
                $imageFilename = time() . '_' . bin2hex(random_bytes(6)) . '.' . $ext;
                $targetPath = __DIR__ . '/../uploads/courses/' . $imageFilename;
                file_put_contents($targetPath, $decoded);
            }
        }

        if ($imageFilename) {
            $stmt = $pdo->prepare("INSERT INTO courses (name, description, duration, category, status, image) VALUES (?, ?, ?, ?, ?, ?)");
            $stmt->execute([$data['name'], $data['description'], $data['duration'], $data['category'], $data['status'], $imageFilename]);
        } else {
            $stmt = $pdo->prepare("INSERT INTO courses (name, description, duration, category, status) VALUES (?, ?, ?, ?, ?)");
            $stmt->execute([$data['name'], $data['description'], $data['duration'], $data['category'], $data['status']]);
        }

        echo json_encode(['success' => true, 'message' => 'Course added successfully']);
    }
    elseif ($method === 'PUT') {
        $id = $_GET['id'];
        $data = json_decode(file_get_contents('php://input'), true);

        // Handle optional base64 image for updates
        $imageFilename = null;
        if (!empty($data['image']) && preg_match('/^data:(image\/[a-zA-Z]+);base64,/', $data['image'], $m)) {
            $mime = $m[1];
            $base64 = substr($data['image'], strpos($data['image'], ',') + 1);
            $decoded = base64_decode($base64);
            if ($decoded !== false) {
                $ext = '';
                switch ($mime) {
                    case 'image/jpeg': $ext = 'jpg'; break;
                    case 'image/png': $ext = 'png'; break;
                    case 'image/gif': $ext = 'gif'; break;
                    default: $ext = 'bin'; break;
                }
                $imageFilename = time() . '_' . bin2hex(random_bytes(6)) . '.' . $ext;
                $targetPath = __DIR__ . '/../uploads/courses/' . $imageFilename;
                file_put_contents($targetPath, $decoded);
            }
        }

        if ($imageFilename) {
            $stmt = $pdo->prepare("UPDATE courses SET name = ?, description = ?, duration = ?, category = ?, status = ?, image = ? WHERE id = ?");
            $stmt->execute([$data['name'], $data['description'], $data['duration'], $data['category'], $data['status'], $imageFilename, $id]);
        } else {
            $stmt = $pdo->prepare("UPDATE courses SET name = ?, description = ?, duration = ?, category = ?, status = ? WHERE id = ?");
            $stmt->execute([$data['name'], $data['description'], $data['duration'], $data['category'], $data['status'], $id]);
        }

        echo json_encode(['success' => true, 'message' => 'Course updated successfully']);
    }
    elseif ($method === 'DELETE') {
        $id = $_GET['id'];
        $stmt = $pdo->prepare("DELETE FROM courses WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode(['success' => true, 'message' => 'Course deleted successfully']);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
