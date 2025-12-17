<?php
require_once 'config.php';

$message = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['action'])) {
        if ($_POST['action'] === 'add') {
            $code = 'CERT-' . date('Y') . '-' . str_pad(rand(1, 9999), 4, '0', STR_PAD_LEFT);
            $stmt = $pdo->prepare("INSERT INTO certificates (student_id, course_id, certificate_code, issue_date, status) VALUES (?, ?, ?, ?, ?)");
            $stmt->execute([
                $_POST['student_id'],
                $_POST['course_id'],
                $code,
                $_POST['issue_date'],
                $_POST['status']
            ]);
            $message = 'Certificate issued successfully! Code: ' . $code;
        } elseif ($_POST['action'] === 'delete') {
            $stmt = $pdo->prepare("DELETE FROM certificates WHERE id = ?");
            $stmt->execute([$_POST['id']]);
            $message = 'Certificate deleted successfully!';
        }
    }
}

$certificates = $pdo->query("SELECT cert.*, s.name as student_name, c.name as course_name 
    FROM certificates cert 
    LEFT JOIN students s ON cert.student_id = s.id 
    LEFT JOIN courses c ON cert.course_id = c.id 
    ORDER BY cert.created_at DESC")->fetchAll();
$students = $pdo->query("SELECT * FROM students WHERE status = 'Active'")->fetchAll();
$courses = $pdo->query("SELECT * FROM courses WHERE status = 'Active'")->fetchAll();

include 'includes/header.php';
?>

<div class="page-header">
    <h1>Certificates</h1>
    <button class="btn btn-primary" onclick="openModal('addModal')">
        <span class="material-icons">add</span>
        Issue Certificate
    </button>
</div>

<?php if ($message): ?>
    <div class="alert alert-success"><?= $message ?></div>
<?php endif; ?>

<div class="content-card">
    <table class="data-table">
        <thead>
            <tr>
                <th>ID</th>
                <th>Certificate Code</th>
                <th>Student</th>
                <th>Course</th>
                <th>Issue Date</th>
                <th>Status</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody>
            <?php if (empty($certificates)): ?>
                <tr><td colspan="7" class="no-data">No certificates yet</td></tr>
            <?php else: ?>
                <?php foreach ($certificates as $cert): ?>
                    <tr>
                        <td><?= $cert['id'] ?></td>
                        <td><strong><?= htmlspecialchars($cert['certificate_code']) ?></strong></td>
                        <td><?= htmlspecialchars($cert['student_name'] ?? '-') ?></td>
                        <td><?= htmlspecialchars($cert['course_name'] ?? '-') ?></td>
                        <td><?= $cert['issue_date'] ?></td>
                        <td><span class="status-badge <?= strtolower($cert['status']) ?>"><?= $cert['status'] ?></span></td>
                        <td class="actions">
                            <button class="action-btn view" title="View">
                                <span class="material-icons">visibility</span>
                            </button>
                            <form method="POST" style="display:inline;" onsubmit="return confirmDelete('Delete this certificate?')">
                                <input type="hidden" name="action" value="delete">
                                <input type="hidden" name="id" value="<?= $cert['id'] ?>">
                                <button type="submit" class="action-btn delete">
                                    <span class="material-icons">delete</span>
                                </button>
                            </form>
                        </td>
                    </tr>
                <?php endforeach; ?>
            <?php endif; ?>
        </tbody>
    </table>
</div>

<div class="modal-overlay" id="addModal">
    <div class="modal">
        <div class="modal-header">
            <h2>Issue Certificate</h2>
            <button class="modal-close" onclick="closeModal('addModal')">&times;</button>
        </div>
        <form method="POST">
            <div class="modal-body">
                <input type="hidden" name="action" value="add">
                <div class="form-group">
                    <label>Student</label>
                    <select name="student_id" required>
                        <option value="">Select Student</option>
                        <?php foreach ($students as $student): ?>
                            <option value="<?= $student['id'] ?>"><?= htmlspecialchars($student['name']) ?> (<?= htmlspecialchars($student['email']) ?>)</option>
                        <?php endforeach; ?>
                    </select>
                </div>
                <div class="form-group">
                    <label>Course</label>
                    <select name="course_id" required>
                        <option value="">Select Course</option>
                        <?php foreach ($courses as $course): ?>
                            <option value="<?= $course['id'] ?>"><?= htmlspecialchars($course['name']) ?></option>
                        <?php endforeach; ?>
                    </select>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Issue Date</label>
                        <input type="date" name="issue_date" value="<?= date('Y-m-d') ?>" required>
                    </div>
                    <div class="form-group">
                        <label>Status</label>
                        <select name="status">
                            <option value="Issued">Issued</option>
                            <option value="Pending">Pending</option>
                        </select>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" onclick="closeModal('addModal')">Cancel</button>
                <button type="submit" class="btn btn-primary">Issue Certificate</button>
            </div>
        </form>
    </div>
</div>

<?php include 'includes/footer.php'; ?>
