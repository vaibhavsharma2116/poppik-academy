<?php
require_once 'config.php';

$message = '';
$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['action'])) {
        if ($_POST['action'] === 'add') {
            $stmt = $pdo->prepare("INSERT INTO courses (name, description, duration, category, status) VALUES (?, ?, ?, ?, ?)");
            $stmt->execute([
                $_POST['name'],
                $_POST['description'],
                $_POST['duration'],
                $_POST['category'],
                $_POST['status']
            ]);
            $message = 'Course added successfully!';
        } elseif ($_POST['action'] === 'edit') {
            $stmt = $pdo->prepare("UPDATE courses SET name = ?, description = ?, duration = ?, category = ?, status = ? WHERE id = ?");
            $stmt->execute([
                $_POST['name'],
                $_POST['description'],
                $_POST['duration'],
                $_POST['category'],
                $_POST['status'],
                $_POST['id']
            ]);
            $message = 'Course updated successfully!';
        } elseif ($_POST['action'] === 'delete') {
            $stmt = $pdo->prepare("DELETE FROM courses WHERE id = ?");
            $stmt->execute([$_POST['id']]);
            $message = 'Course deleted successfully!';
        }
    }
}

$courses = $pdo->query("SELECT * FROM courses ORDER BY created_at DESC")->fetchAll();

include 'includes/header.php';
?>

<div class="page-header">
    <h1>Courses</h1>
    <button class="btn btn-primary" onclick="openModal('addModal')">
        <span class="material-icons">add</span>
        Add Course
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
                <th>Course Name</th>
                <th>Category</th>
                <th>Duration</th>
                <th>Status</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody>
            <?php if (empty($courses)): ?>
                <tr><td colspan="6" class="no-data">No courses yet</td></tr>
            <?php else: ?>
                <?php foreach ($courses as $course): ?>
                    <tr>
                        <td><?= $course['id'] ?></td>
                        <td><?= htmlspecialchars($course['name']) ?></td>
                        <td><?= htmlspecialchars($course['category'] ?? '-') ?></td>
                        <td><?= htmlspecialchars($course['duration'] ?? '-') ?></td>
                        <td><span class="status-badge <?= strtolower($course['status']) ?>"><?= $course['status'] ?></span></td>
                        <td class="actions">
                            <button class="action-btn edit" onclick="editCourse(<?= htmlspecialchars(json_encode($course)) ?>)">
                                <span class="material-icons">edit</span>
                            </button>
                            <form method="POST" style="display:inline;" onsubmit="return confirmDelete('Delete this course?')">
                                <input type="hidden" name="action" value="delete">
                                <input type="hidden" name="id" value="<?= $course['id'] ?>">
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
            <h2>Add Course</h2>
            <button class="modal-close" onclick="closeModal('addModal')">&times;</button>
        </div>
        <form method="POST">
            <div class="modal-body">
                <input type="hidden" name="action" value="add">
                <div class="form-group">
                    <label>Course Name</label>
                    <input type="text" name="name" required>
                </div>
                <div class="form-group">
                    <label>Description</label>
                    <textarea name="description"></textarea>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Duration</label>
                        <input type="text" name="duration" placeholder="e.g. 3 months">
                    </div>
                    <div class="form-group">
                        <label>Category</label>
                        <select name="category">
                            <option value="Beauty">Beauty</option>
                            <option value="Lifestyle">Lifestyle</option>
                            <option value="Wellness">Wellness</option>
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
                <button type="submit" class="btn btn-primary">Add Course</button>
            </div>
        </form>
    </div>
</div>

<div class="modal-overlay" id="editModal">
    <div class="modal">
        <div class="modal-header">
            <h2>Edit Course</h2>
            <button class="modal-close" onclick="closeModal('editModal')">&times;</button>
        </div>
        <form method="POST">
            <div class="modal-body">
                <input type="hidden" name="action" value="edit">
                <input type="hidden" name="id" id="edit_id">
                <div class="form-group">
                    <label>Course Name</label>
                    <input type="text" name="name" id="edit_name" required>
                </div>
                <div class="form-group">
                    <label>Description</label>
                    <textarea name="description" id="edit_description"></textarea>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Duration</label>
                        <input type="text" name="duration" id="edit_duration">
                    </div>
                    <div class="form-group">
                        <label>Category</label>
                        <select name="category" id="edit_category">
                            <option value="Beauty">Beauty</option>
                            <option value="Lifestyle">Lifestyle</option>
                            <option value="Wellness">Wellness</option>
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
                <button type="submit" class="btn btn-primary">Update Course</button>
            </div>
        </form>
    </div>
</div>

<script>
function editCourse(course) {
    document.getElementById('edit_id').value = course.id;
    document.getElementById('edit_name').value = course.name;
    document.getElementById('edit_description').value = course.description || '';
    document.getElementById('edit_duration').value = course.duration || '';
    document.getElementById('edit_category').value = course.category || 'Beauty';
    document.getElementById('edit_status').value = course.status || 'Active';
    openModal('editModal');
}
</script>

<?php include 'includes/footer.php'; ?>
