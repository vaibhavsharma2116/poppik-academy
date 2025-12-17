<?php
/**
 * Debug: Check Authentication Status
 *
 * GET /api/auth-check.php
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once '../config.php';

$response = [
    'session_admin_id' => $_SESSION['admin_id'] ?? null,
    'query_admin_id' => $_GET['admin_id'] ?? null,
    'all_headers' => getallheaders(),
    'all_session_vars' => $_SESSION,
    'timestamp' => date('Y-m-d H:i:s')
];

exit(json_encode($response, JSON_PRETTY_PRINT));
?>
