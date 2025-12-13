<?php
// Simple router for PHP built-in server.
// Usage: php -S localhost:8000 router.php

// Decode request path
$uri = urldecode(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH));

// If the requested file exists in the project root, let the server serve it
$projectPath = __DIR__ . $uri;
if ($uri !== '/' && file_exists($projectPath) && is_file($projectPath)) {
    return false; // serve the requested resource as-is
}

// If the request is for /api/*, map to php-admin/api/*
if (strpos($uri, '/api/') === 0) {
    $apiPath = __DIR__ . '/php-admin' . $uri;
    if (file_exists($apiPath) && is_file($apiPath)) {
        // Execute the API script
        require $apiPath;
        return true;
    }
    // Not found under php-admin; return 404
    http_response_code(404);
    header('Content-Type: text/plain');
    echo "404 Not Found: $uri";
    return true;
}

// Fallback: serve index.html from src for SPA routes if it exists
$spaIndex = __DIR__ . '/src/index.html';
if (file_exists($spaIndex)) {
    // Serve index.html for any non-file route to support client-side routing
    require $spaIndex;
    return true;
}

// Default 404
http_response_code(404);
header('Content-Type: text/plain');
echo "404 Not Found";
