
<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

require_once '../config.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    if ($method === 'GET') {
        $stmt = $pdo->query("SELECT * FROM partners WHERE status = 'Active' ORDER BY sort_order ASC");
        $partners = $stmt->fetchAll();

        // Build absolute base URL for returned logo paths
        $scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
        $host = $_SERVER['HTTP_HOST'] ?? 'localhost';
        $baseUrl = $scheme . '://' . $host;

        foreach ($partners as &$p) {
            if (!empty($p['logo']) && !preg_match('#^https?://#i', $p['logo'])) {
                // normalize slashes and remove any leading 'php-admin/' prefix if stored that way
                $logoPath = str_replace('\\', '/', $p['logo']);
                $logoPath = preg_replace('#^php-admin/#', '', $logoPath);
                if ($logoPath[0] !== '/') $logoPath = '/' . $logoPath;
                $p['logo'] = $baseUrl . $logoPath;
            }
        }

        echo json_encode(['success' => true, 'data' => $partners]);
    }
    elseif ($method === 'POST') {
        $data = json_decode(file_get_contents('php://input'), true);
        // Handle logo: if client supplied a data URL (base64), decode and save file
        $logoValue = $data['logo'] ?? '';
        if (is_string($logoValue) && strpos($logoValue, 'data:') === 0) {
            // create uploads/partners directory if not exists
            $uploadDir = __DIR__ . '/../uploads/partners';
            if (!is_dir($uploadDir)) mkdir($uploadDir, 0755, true);

            // parse base64
            if (preg_match('/^data:(image\/[a-zA-Z]+);base64,(.*)$/', $logoValue, $matches)) {
                $mime = $matches[1];
                $b64 = $matches[2];
                $ext = 'png';
                if (strpos($mime, '/') !== false) $ext = explode('/', $mime)[1];
                $ext = strtolower(preg_replace('/[^a-z0-9]/', '', $ext));
                $filename = 'partner_' . uniqid() . '.' . $ext;
                $filePath = $uploadDir . '/' . $filename;
                file_put_contents($filePath, base64_decode($b64));
                // store a web-friendly relative path
                // store a relative, web-friendly path (no leading project folder)
                $logoValue = 'uploads/partners/' . $filename;
            }
        }

        $stmt = $pdo->prepare("INSERT INTO partners (name, logo, website, description, sort_order, status) VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->execute([
            $data['name'],
            $logoValue,
            $data['website'] ?? '',
            $data['description'] ?? '',
            $data['sort_order'] ?? 0,
            $data['status'] ?? 'Active'
        ]);
        echo json_encode(['success' => true, 'id' => $pdo->lastInsertId()]);
    }
    elseif ($method === 'PUT') {
        $id = $_GET['id'] ?? null;
        $data = json_decode(file_get_contents('php://input'), true);
        // Handle logo similarly on update
        $logoValue = $data['logo'] ?? '';
        if (is_string($logoValue) && strpos($logoValue, 'data:') === 0) {
            $uploadDir = __DIR__ . '/../uploads/partners';
            if (!is_dir($uploadDir)) mkdir($uploadDir, 0755, true);
            if (preg_match('/^data:(image\/[a-zA-Z]+);base64,(.*)$/', $logoValue, $matches)) {
                $mime = $matches[1];
                $b64 = $matches[2];
                $ext = 'png';
                if (strpos($mime, '/') !== false) $ext = explode('/', $mime)[1];
                $ext = strtolower(preg_replace('/[^a-z0-9]/', '', $ext));
                $filename = 'partner_' . uniqid() . '.' . $ext;
                $filePath = $uploadDir . '/' . $filename;
                file_put_contents($filePath, base64_decode($b64));
                // store a relative, web-friendly path (no leading project folder)
                $logoValue = 'uploads/partners/' . $filename;
            }
        }

        $stmt = $pdo->prepare("UPDATE partners SET name = ?, logo = ?, website = ?, description = ?, sort_order = ?, status = ? WHERE id = ?");
        $stmt->execute([
            $data['name'],
            $logoValue,
            $data['website'] ?? '',
            $data['description'] ?? '',
            $data['sort_order'] ?? 0,
            $data['status'] ?? 'Active',
            $id
        ]);
        echo json_encode(['success' => true]);
    }
    elseif ($method === 'DELETE') {
        $id = $_GET['id'] ?? null;
        $stmt = $pdo->prepare("DELETE FROM partners WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode(['success' => true]);
    }
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>
