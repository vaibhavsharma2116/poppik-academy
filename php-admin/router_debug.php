<?php
// Debug router for PHP built-in server - returns JSON about requested path
// Use: php -S localhost:8000 router_debug.php
$path = parse_url($_SERVER["REQUEST_URI"], PHP_URL_PATH);
$full = realpath(__DIR__ . $path);
$exists = file_exists(__DIR__ . $path);
$is_file = is_file(__DIR__ . $path);
header('Content-Type: application/json');
echo json_encode([
    'request_uri' => $_SERVER['REQUEST_URI'],
    'script_name' => $_SERVER['SCRIPT_NAME'],
    'cwd' => getcwd(),
    'docroot' => __DIR__,
    'path' => $path,
    'full_resolved' => $full === false ? null : $full,
    'exists' => $exists,
    'is_file' => $is_file,
    'dir_listing_sample' => array_slice(scandir(__DIR__), 0, 20),
]);
