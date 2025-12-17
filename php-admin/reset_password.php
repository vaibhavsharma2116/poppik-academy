<?php
/**
 * Reset Admin Password
 *
 * This script resets the password for admin@example.com to admin123
 */

require_once 'config.php';

try {
    $email = 'admin@example.com';
    $newPassword = 'admin123';
    $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);

    // Update password
    $stmt = $pdo->prepare('UPDATE admins SET password = ? WHERE email = ?');
    $stmt->execute([$hashedPassword, $email]);

    if ($stmt->rowCount() > 0) {
        echo "✓ Password reset successfully!\n";
        echo "  Email: $email\n";
        echo "  New Password: $newPassword\n";
        echo "\nLogin at: http://localhost:5000/admin/login\n";
    } else {
        echo "ERROR: Admin not found with email: $email\n";
    }

} catch (PDOException $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
    exit(1);
}
?>
