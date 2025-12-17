<?php
require_once 'config.php';

// Simple mapping UI to assign uploaded video files to videos DB rows missing video_url
// Usage: open in browser while php server is running: /map_videos.php

$baseUrl = getenv('BASE_URL') ?: null;
if (!$baseUrl) {
    $scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
    $host = $_SERVER['HTTP_HOST'] ?? ($_SERVER['SERVER_NAME'] ?? 'localhost');
    $baseUrl = $scheme . '://' . $host;
}

$uploadsDir = __DIR__ . '/uploads/videos';
$files = [];
if (is_dir($uploadsDir)) {
    foreach (scandir($uploadsDir) as $f) {
        if ($f === '.' || $f === '..') continue;
        if (is_file($uploadsDir . '/' . $f)) $files[] = $f;
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['mapping'])) {
    $mappings = $_POST['mapping'];
    $logDir = __DIR__ . '/tmp';
    if (!is_dir($logDir)) @mkdir($logDir, 0755, true);
    $logFile = $logDir . '/map_videos.log';
    $out = [];
    foreach ($mappings as $videoId => $filename) {
        $videoId = intval($videoId);
        if (!$videoId) continue;
        $filename = trim($filename);
        if ($filename === '') continue; // skip
        $url = rtrim($baseUrl, '/') . '/uploads/videos/' . $filename;
        try {
            $stmt = $pdo->prepare('UPDATE videos SET video_url = ? WHERE id = ?');
            $stmt->execute([$url, $videoId]);
            $out[] = "Updated id={$videoId} -> {$url}";
            @file_put_contents($logFile, "[".date('c')."] Updated id={$videoId} url={$url}\n", FILE_APPEND);
        } catch (Exception $e) {
            $out[] = "Error id={$videoId}: " . $e->getMessage();
            @file_put_contents($logFile, "[".date('c')."] ERROR id={$videoId} error=".$e->getMessage()."\n", FILE_APPEND);
        }
    }
    echo '<h3>Results</h3><pre>' . htmlspecialchars(implode("\n", $out)) . '</pre>';
    echo '<p><a href="map_videos.php">Back</a></p>';
    exit;
}

$videos = $pdo->query("SELECT id, title, created_at, thumbnail FROM videos WHERE video_url IS NULL OR video_url = '' ORDER BY created_at DESC")->fetchAll();

?>
<!doctype html>
<html>
<head>
    <meta charset="utf-8">
    <title>Map uploaded files to videos</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ddd; padding: 8px; }
        th { background: #f5f5f5; }
        select { width: 100%; }
        .note { margin: 12px 0; color: #555; }
    </style>
</head>
<body>
    <h1>Map uploaded files to videos</h1>
    <p class="note">Select a file for each video row (or leave blank to skip). Click Apply to update DB. Uses BASE_URL or current host to build public URL.</p>

    <form method="post">
        <table>
            <thead>
                <tr><th>ID</th><th>Title</th><th>Created At</th><th>Thumbnail</th><th>Assign file</th></tr>
            </thead>
            <tbody>
            <?php if (count($videos) === 0): ?>
                <tr><td colspan="5">No videos without video_url found.</td></tr>
            <?php else: foreach ($videos as $v): ?>
                <tr>
                    <td><?= htmlspecialchars($v['id']) ?></td>
                    <td><?= htmlspecialchars($v['title']) ?></td>
                    <td><?= htmlspecialchars($v['created_at']) ?></td>
                    <td><?php if ($v['thumbnail']): ?><img src="<?= htmlspecialchars($v['thumbnail']) ?>" style="height:40px"><?php endif; ?></td>
                    <td>
                        <select name="mapping[<?= intval($v['id']) ?>]">
                            <option value="">-- skip --</option>
                            <?php foreach ($files as $f): ?>
                                <option value="<?= htmlspecialchars($f) ?>"><?= htmlspecialchars($f) ?></option>
                            <?php endforeach; ?>
                        </select>
                    </td>
                </tr>
            <?php endforeach; endif; ?>
            </tbody>
        </table>
        <p style="margin-top:12px"><button type="submit">Apply mappings</button></p>
    </form>
    <p><a href="video-hub.php">Back to admin</a></p>
</body>
</html>
