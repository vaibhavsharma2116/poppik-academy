
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
            $stmt = $pdo->query("SELECT * FROM gallery WHERE status = 'Active' ORDER BY sort_order ASC");
            $gallery = $stmt->fetchAll();
            echo json_encode(['success' => true, 'data' => $gallery]);
            break;

        case 'POST':
                // support file upload via multipart form-data when ?upload=1
                if (isset($_GET['upload'])) {
                    // Image upload
                    if (isset($_FILES['image_file'])) {
                        $uploadsDir = __DIR__ . '/../uploads/gallery';
                        if (!is_dir($uploadsDir)) mkdir($uploadsDir, 0755, true);
                        $file = $_FILES['image_file'];
                        $ext = pathinfo($file['name'], PATHINFO_EXTENSION);
                        $name = uniqid('gallery_') . '.' . $ext;
                        $dest = $uploadsDir . '/' . $name;
                        if (move_uploaded_file($file['tmp_name'], $dest)) {
                            // Prefer configured BASE_URL for hosted environments, fallback to detected host
                            $envBase = getenv('BASE_URL') ?: null;
                            if ($envBase) {
                                $baseUrl = rtrim($envBase, '/');
                            } else {
                                $scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
                                $host = $_SERVER['HTTP_HOST'];
                                $baseUrl = $scheme . '://' . $host;
                            }
                            $url = $baseUrl . '/uploads/gallery/' . $name;

                            // Optional: if the client sends create_record=1 in the same multipart POST,
                            // create a gallery DB row immediately to simplify single-request uploads.
                            $insertedId = null;
                            if (isset($_POST['create_record']) && $_POST['create_record'] == '1') {
                                $title = $_POST['title'] ?? '';
                                $category = $_POST['category'] ?? 'General';
                                $sort_order = intval($_POST['sort_order'] ?? 0);
                                $status = $_POST['status'] ?? 'Active';
                                $stmtIns = $pdo->prepare("INSERT INTO gallery (title, image, category, sort_order, status, created_at) VALUES (?, ?, ?, ?, ?, NOW())");
                                $stmtIns->execute([$title, $url, $category, $sort_order, $status]);
                                $insertedId = $pdo->lastInsertId();
                            }

                            $resp = ['success' => true, 'url' => $url];
                            if ($insertedId) $resp['id'] = (int)$insertedId;
                            echo json_encode($resp);
                        } else {
                            echo json_encode(['success' => false, 'message' => 'Image upload failed']);
                        }
                        break;
                    }

                    // Video upload (support field name: video_file)
                    if (isset($_FILES['video_file'])) {
                        $uploadsDir = __DIR__ . '/../uploads/videos';
                        if (!is_dir($uploadsDir)) mkdir($uploadsDir, 0755, true);
                        $file = $_FILES['video_file'];
                        $ext = pathinfo($file['name'], PATHINFO_EXTENSION);
                        $name = uniqid('video_') . '.' . $ext;
                        $dest = $uploadsDir . '/' . $name;
                        if (move_uploaded_file($file['tmp_name'], $dest)) {
                            // Use configured BASE_URL when available (for hosting); otherwise derive from request
                            $envBase = getenv('BASE_URL') ?: null;
                            if ($envBase) {
                                $baseUrl = rtrim($envBase, '/');
                            } else {
                                $scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
                                $host = $_SERVER['HTTP_HOST'];
                                $baseUrl = $scheme . '://' . $host;
                            }
                            $url = $baseUrl . '/uploads/videos/' . $name;
                            // Optionally create a videos DB record in one step when create_record=1
                            $insertedId = null;
                            if (isset($_POST['create_record']) && $_POST['create_record'] == '1') {
                                $title = $_POST['title'] ?? '';
                                $description = $_POST['description'] ?? '';
                                $thumbnail = $_POST['thumbnail'] ?? '';
                                $category = $_POST['category'] ?? 'Beauty';
                                $duration = $_POST['duration'] ?? '';
                                $status = $_POST['status'] ?? 'Active';
                                try {
                                    $stmtIns = $pdo->prepare("INSERT INTO videos (title, description, video_url, thumbnail, category, duration, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())");
                                    $stmtIns->execute([$title, $description, $url, $thumbnail, $category, $duration, $status]);
                                    $insertedId = $pdo->lastInsertId();
                                    // Log successful insertion
                                    $logDir = __DIR__ . '/../tmp';
                                    if (!is_dir($logDir)) @mkdir($logDir, 0755, true);
                                    $logFile = $logDir . '/gallery_uploads.log';
                                    $entry = "[".date('c')."] INSERT video id={$insertedId} title=".json_encode($title)." url=".json_encode($url)."\n";
                                    @file_put_contents($logFile, $entry, FILE_APPEND);
                                } catch (Exception $e) {
                                    $logDir = __DIR__ . '/../tmp';
                                    if (!is_dir($logDir)) @mkdir($logDir, 0755, true);
                                    $logFile = $logDir . '/gallery_uploads.log';
                                    $entry = "[".date('c')."] INSERT ERROR title=".json_encode($title)." url=".json_encode($url)." error=".json_encode($e->getMessage())."\n";
                                    @file_put_contents($logFile, $entry, FILE_APPEND);
                                }
                            }
                            $resp = ['success' => true, 'url' => $url];
                            if ($insertedId) $resp['id'] = (int)$insertedId;
                            echo json_encode($resp);
                        } else {
                            echo json_encode(['success' => false, 'message' => 'Video upload failed']);
                        }
                        break;
                    }
                }

                $data = json_decode(file_get_contents('php://input'), true);
                $stmt = $pdo->prepare("INSERT INTO gallery (title, image, category, sort_order, status) VALUES (?, ?, ?, ?, ?)");
                $stmt->execute([
                    $data['title'] ?? '',
                    $data['image'] ?? '',
                    $data['category'] ?? 'General',
                    $data['sort_order'] ?? 0,
                    $data['status'] ?? 'Active'
                ]);
                echo json_encode(['success' => true, 'message' => 'Image added successfully']);
            break;

        case 'PUT':
            $id = $_GET['id'] ?? null;
            $data = json_decode(file_get_contents('php://input'), true);
            $stmt = $pdo->prepare("UPDATE gallery SET title = ?, image = ?, category = ?, sort_order = ?, status = ? WHERE id = ?");
            $stmt->execute([
                $data['title'] ?? '',
                $data['image'],
                $data['category'] ?? 'General',
                $data['sort_order'] ?? 0,
                $data['status'] ?? 'Active',
                $id
            ]);
            echo json_encode(['success' => true, 'message' => 'Image updated successfully']);
            break;

        case 'DELETE':
            $id = $_GET['id'] ?? null;
            $stmt = $pdo->prepare("DELETE FROM gallery WHERE id = ?");
            $stmt->execute([$id]);
            echo json_encode(['success' => true, 'message' => 'Image deleted successfully']);
            break;

        default:
            http_response_code(405);
            echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
