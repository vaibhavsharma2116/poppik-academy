<?php
// Simple DB connection checker. Run from CLI: php check_db.php
// Or open in browser after starting PHP server: http://localhost:8000/check_db.php

// Load environment (config.php handles .env loading)
try {
    require_once __DIR__ . '/config.php';
} catch (Throwable $e) {
    echo "Config load failed: " . $e->getMessage() . PHP_EOL;
    exit(1);
}

try {
    // run a simple query
    $row = $pdo->query('SELECT DATABASE() as db, VERSION() as ver')->fetch();
    if ($row) {
        echo "Connected to DB: " . ($row['db'] ?? '(unknown)') . PHP_EOL;
        echo "MySQL version: " . ($row['ver'] ?? '(unknown)') . PHP_EOL;
        exit(0);
    }
    echo "Connected but query returned no rows" . PHP_EOL;
} catch (Throwable $e) {
    echo "PDO query failed: " . $e->getMessage() . PHP_EOL;
    exit(1);
}
