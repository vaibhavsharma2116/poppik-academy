<?php
/**
 * Check if admins table and accounts exist
 */

require_once 'config.php';

try {
    // Check if table exists
    $stmt = $pdo->query("SHOW TABLES LIKE 'admins'");
    if ($stmt->rowCount() === 0) {
        echo "ERROR: admins table does not exist!\n";
        echo "Run: mysql -u root -p poppik_academy < ../sql/create_admin_table.sql\n";
        exit(1);
    }

    // Count admins
    $stmt = $pdo->query('SELECT COUNT(*) as count FROM admins');
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    $count = $result['count'] ?? 0;

    echo "Found $count admin(s) in database\n";

    if ($count === 0) {
        echo "\nNo admins found! Creating default admin...\n";
        $email = 'admin@poppik.com';
        $password = 'admin123';
        $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

        $stmt = $pdo->prepare('INSERT INTO admins (email, password, name) VALUES (?, ?, ?)');
        $stmt->execute([$email, $hashedPassword, 'Site Admin']);

        echo "✓ Admin created successfully!\n";
        echo "  Email: $email\n";
        echo "  Password: $password\n";
    } else {
        // List all admins
        echo "\nAdmins in database:\n";
        $stmt = $pdo->query('SELECT id, email, name FROM admins');
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            echo "  ID: {$row['id']}, Email: {$row['email']}, Name: {$row['name']}\n";
        }
    }

} catch (PDOException $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
    exit(1);
}
?>
