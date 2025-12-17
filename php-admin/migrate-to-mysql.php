<?php
// Migration helper: copies data from the local SQLite DB to MySQL using config.php settings.
// Usage: set DB_DRIVER=mysql and DB_HOST/DB_NAME/DB_USER/DB_PASS in environment or edit config.php, then run:
// php migrate-to-mysql.php

require_once __DIR__ . '/config.php';

// Determine DB driver from environment or the `$dbDriver` set by config.php
$dbDriver = getenv('DB_DRIVER') ?: (isset($dbDriver) ? $dbDriver : null);

// Ensure we have a path to the local SQLite file (used as the source for migration)
if (!defined('DB_PATH')) {
    define('DB_PATH', __DIR__ . '/database.sqlite');
}

if (strtolower((string)$dbDriver) !== 'mysql') {
    echo "Please set DB_DRIVER to 'mysql' in environment or .env before running this migration.\n";
    exit(1);
}

// Connect to SQLite source
if (!file_exists(DB_PATH)) {
    echo "SQLite DB not found at " . DB_PATH . "\n";
    exit(1);
}

try {
    $sqlite = new PDO('sqlite:' . DB_PATH);
    $sqlite->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $sqlite->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    die("SQLite connection failed: " . $e->getMessage() . "\n");
}

// Connect to MySQL target (config.php already created $pdo for MySQL)
try {
    $mysql = $pdo; // from config.php
} catch (Exception $e) {
    die("MySQL connection not available: " . $e->getMessage() . "\n");
}

// Ensure tables exist in MySQL
createTables($mysql);

$tables = [
    'courses','students','certificates','queries','hero_sliders','gallery','blogs','videos','partners','settings'
];

foreach ($tables as $table) {
    echo "Migrating table: $table ... ";
    try {
        $rows = $sqlite->query("SELECT * FROM $table")->fetchAll(PDO::FETCH_ASSOC);
    } catch (Exception $e) {
        echo "skip (not in sqlite)\n";
        continue;
    }

    if (count($rows) === 0) {
        echo "no rows\n";
        continue;
    }

    // Build insert statement using columns from first row
    $columns = array_keys($rows[0]);
    $colList = implode(', ', array_map(function($c){ return "`$c`"; }, $columns));
    $placeholders = implode(', ', array_fill(0, count($columns), '?'));
    $insertSql = "INSERT INTO `$table` ($colList) VALUES ($placeholders)";
    $stmt = $mysql->prepare($insertSql);

    $mysql->beginTransaction();
    $count = 0;
    foreach ($rows as $r) {
        $values = array_values($r);
        try {
            $stmt->execute($values);
            $count++;
        } catch (Exception $e) {
            // ignore duplicates or errors and continue
        }
    }
    $mysql->commit();
    echo "done ($count rows)\n";
}

echo "Migration complete.\n";

?>
