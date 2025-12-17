<?php
/**
 * Quick Admin Creation Script
 *
 * Usage: php create_admin.php
 *
 * This script creates a default admin account with:
 * - Email: admin@poppik.com
 * - Password: admin123
 */

require_once 'config.php';

try {
    // Check if table exists
    $stmt = $pdo->query("SHOW TABLES LIKE 'admins'");
    if ($stmt->rowCount() === 0) {
        echo "Error: admins table does not exist.\n";
        echo "Please run: mysql -u root -p poppik_academy < sql/create_admin_table.sql\n";
        exit(1);
    }

    // Create admin account
    $email = 'admin@poppik.com';
    $password = 'admin123';
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

    // Check if admin already exists
    $stmt = $pdo->prepare('SELECT id FROM admins WHERE email = ?');
    $stmt->execute([$email]);
    if ($stmt->fetch()) {
        echo "Admin already exists with email: $email\n";
        exit(1);
    }

    // Insert admin
    $stmt = $pdo->prepare('INSERT INTO admins (email, password, name) VALUES (?, ?, ?)');
    $stmt->execute([$email, $hashedPassword, 'Site Admin']);

    echo "Admin created successfully!\n";
    echo "Email: $email\n";
    echo "Password: $password\n";
    echo "\nLogin at: http://localhost:5000/admin/login\n";

} catch (PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
    exit(1);
}
?>
