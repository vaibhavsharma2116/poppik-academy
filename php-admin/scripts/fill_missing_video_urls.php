<?php
// Script: fill_missing_video_urls.php
// Attempts to auto-fill empty video_url columns by matching uploaded files
// to videos rows by proximity of file mtime and videos.created_at.

require_once __DIR__ . '/../config.php';

$uploadsDir = __DIR__ . '/../uploads/videos';
$logDir = __DIR__ . '/../tmp';
if (!is_dir($logDir)) @mkdir($logDir, 0755, true);
$logFile = $logDir . '/repair_videos.log';

function logMsg($msg) {
    global $logFile;
    $line = "[".date('c')."] " . $msg . "\n";
    echo $line;
    @file_put_contents($logFile, $line, FILE_APPEND);
}

if (!is_dir($uploadsDir)) {
    logMsg("Uploads directory not found: $uploadsDir");
    exit(1);
}

$files = array_values(array_filter(scandir($uploadsDir), function($f) use ($uploadsDir) {
    return !in_array($f, ['.', '..']) && is_file($uploadsDir . '/' . $f);
}));

if (count($files) === 0) {
    logMsg('No files found in uploads/videos');
    exit(0);
}

// Fetch videos with empty video_url
$stmt = $pdo->query("SELECT id, title, created_at FROM videos WHERE video_url IS NULL OR video_url = '' ORDER BY created_at DESC");
$rows = $stmt->fetchAll();

if (count($rows) === 0) {
    logMsg('No videos rows with empty video_url found.');
    exit(0);
}

// Build index of candidate rows by timestamp
$candidates = [];
foreach ($rows as $r) {
    $ts = strtotime($r['created_at']);
    if (!$ts) $ts = 0;
    $candidates[] = ['id' => $r['id'], 'title' => $r['title'], 'ts' => $ts];
}

$baseUrl = 'http://localhost:8000/uploads/videos/';
$matched = 0;
$skipped = 0;

foreach ($files as $file) {
    $path = $uploadsDir . '/' . $file;
    $mtime = filemtime($path);
    if (!$mtime) $mtime = 0;

    // find candidates within +/- 600 seconds (10 minutes)
    $near = array_filter($candidates, function($c) use ($mtime) {
        return abs($c['ts'] - $mtime) <= 600;
    });

    if (count($near) === 1) {
        $c = array_values($near)[0];
        $url = $baseUrl . $file;
        try {
            $upd = $pdo->prepare("UPDATE videos SET video_url = ? WHERE id = ?");
            $upd->execute([$url, $c['id']]);
            logMsg("Updated video id={$c['id']} title=".json_encode($c['title'])." with url=".json_encode($url));
            $matched++;
        } catch (Exception $e) {
            logMsg("ERROR updating id={$c['id']}: " . $e->getMessage());
            $skipped++;
        }
    } elseif (count($near) > 1) {
        // ambiguous, skip and log
        $ids = implode(',', array_map(function($x){return $x['id'];}, $near));
        logMsg("Ambiguous match for file $file -> candidate ids: $ids; skipping");
        $skipped++;
    } else {
        logMsg("No candidate video row close to file $file (mtime=".date('c',$mtime).")");
        $skipped++;
    }
}

logMsg("Done. matched={$matched}, skipped={$skipped}");

exit(0);
