<?php
require_once 'config.php';

$message = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['action'])) {
        if ($_POST['action'] === 'add') {
            $stmt = $pdo->prepare("INSERT INTO students (name, email, phone, course_id, status) VALUES (?, ?, ?, ?, ?)");
            $stmt->execute([
                $_POST['name'],
                $_POST['email'],
                $_POST['phone'],
                $_POST['course_id'] ?: null,
                $_POST['status']
            ]);
            $message = 'Student added successfully!';
        } elseif ($_POST['action'] === 'edit') {
            $stmt = $pdo->prepare("UPDATE students SET name = ?, email = ?, phone = ?, course_id = ?, status = ? WHERE id = ?");
            $stmt->execute([
                $_POST['name'],
                $_POST['email'],
                $_POST['phone'],
                $_POST['course_id'] ?: null,
                $_POST['status'],
                $_POST['id']
            ]);
            $message = 'Student updated successfully!';
        } elseif ($_POST['action'] === 'delete') {
            $stmt = $pdo->prepare("DELETE FROM students WHERE id = ?");
            $stmt->execute([$_POST['id']]);
            $message = 'Student deleted successfully!';
        }
    }
}

$students = $pdo->query("SELECT s.*, c.name as course_name FROM students s LEFT JOIN courses c ON s.course_id = c.id ORDER BY s.created_at DESC")->fetchAll();
$courses = $pdo->query("SELECT * FROM courses WHERE status = 'Active'")->fetchAll();

include 'includes/header.php';
?>

<div class="page-header">
    <h1>Students</h1>
    <button class="btn btn-primary" onclick="openModal('addModal')">
        <span class="material-icons">add</span>
        Add Student
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
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Course</th>
                <th>Status</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody>
            <?php if (empty($students)): ?>
                <tr><td colspan="7" class="no-data">No students yet</td></tr>
            <?php else: ?>
                <?php foreach ($students as $student): ?>
                    <tr>
                        <td><?= $student['id'] ?></td>
                        <td><?= htmlspecialchars($student['name']) ?></td>
                        <td><?= htmlspecialchars($student['email']) ?></td>
                        <td><?= htmlspecialchars($student['phone'] ?? '-') ?></td>
                        <td><?= htmlspecialchars($student['course_name'] ?? '-') ?></td>
                        <td><span class="status-badge <?= strtolower($student['status']) ?>"><?= $student['status'] ?></span></td>
                        <td class="actions">
                            <button class="action-btn edit" onclick="editStudent(<?= htmlspecialchars(json_encode($student)) ?>)">
                                <span class="material-icons">edit</span>
                            </button>
                            <form method="POST" style="display:inline;" onsubmit="return confirmDelete('Delete this student?')">
                                <input type="hidden" name="action" value="delete">
                                <input type="hidden" name="id" value="<?= $student['id'] ?>">
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
            <h2>Add Student</h2>
            <button class="modal-close" onclick="closeModal('addModal')">&times;</button>
        </div>
        <form method="POST">
            <div class="modal-body">
                <input type="hidden" name="action" value="add">
                <div class="form-row">
                    <div class="form-group">
                        <label>Name</label>
                        <input type="text" name="name" required>
                    </div>
                    <div class="form-group">
                        <label>Email</label>
                        <input type="email" name="email" required>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Phone</label>
                        <input type="text" name="phone">
                    </div>
                    <div class="form-group">
                        <label>Course</label>
                        <select name="course_id">
                            <option value="">Select Course</option>
                            <?php foreach ($courses as $course): ?>
                                <option value="<?= $course['id'] ?>"><?= htmlspecialchars($course['name']) ?></option>
                            <?php endforeach; ?>
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label>Status</label>
                    <select name="status">
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                    </select>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" onclick="closeModal('addModal')">Cancel</button>
                <button type="submit" class="btn btn-primary">Add Student</button>
            </div>
        </form>
    </div>
</div>

<div class="modal-overlay" id="editModal">
    <div class="modal">
        <div class="modal-header">
            <h2>Edit Student</h2>
            <button class="modal-close" onclick="closeModal('editModal')">&times;</button>
        </div>
        <form method="POST">
            <div class="modal-body">
                <input type="hidden" name="action" value="edit">
                <input type="hidden" name="id" id="edit_id">
                <div class="form-row">
                    <div class="form-group">
                        <label>Name</label>
                        <input type="text" name="name" id="edit_name" required>
                    </div>
                    <div class="form-group">
                        <label>Email</label>
                        <input type="email" name="email" id="edit_email" required>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Phone</label>
                        <input type="text" name="phone" id="edit_phone">
                    </div>
                    <div class="form-group">
                        <label>Course</label>
                        <select name="course_id" id="edit_course_id">
                            <option value="">Select Course</option>
                            <?php foreach ($courses as $course): ?>
                                <option value="<?= $course['id'] ?>"><?= htmlspecialchars($course['name']) ?></option>
                            <?php endforeach; ?>
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label>Status</label>
                    <select name="status" id="edit_status">
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                    </select>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" onclick="closeModal('editModal')">Cancel</button>
                <button type="submit" class="btn btn-primary">Update Student</button>
            </div>
        </form>
    </div>
</div>

<script>
function editStudent(student) {
    document.getElementById('edit_id').value = student.id;
    document.getElementById('edit_name').value = student.name;
    document.getElementById('edit_email').value = student.email;
    document.getElementById('edit_phone').value = student.phone || '';
    document.getElementById('edit_course_id').value = student.course_id || '';
    document.getElementById('edit_status').value = student.status || 'Active';
    openModal('editModal');
}
</script>

<?php include 'includes/footer.php'; ?>
