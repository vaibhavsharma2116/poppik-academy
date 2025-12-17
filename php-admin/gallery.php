<?php
require_once 'config.php';

$message = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['action'])) {
        if ($_POST['action'] === 'add') {
            $stmt = $pdo->prepare("INSERT INTO gallery (title, image, category, sort_order, status) VALUES (?, ?, ?, ?, ?)");
            $stmt->execute([
                $_POST['title'],
                $_POST['image'],
                $_POST['category'],
                $_POST['sort_order'] ?: 0,
                $_POST['status']
            ]);
            $message = 'Image added successfully!';
        } elseif ($_POST['action'] === 'edit') {
            $stmt = $pdo->prepare("UPDATE gallery SET title = ?, image = ?, category = ?, sort_order = ?, status = ? WHERE id = ?");
            $stmt->execute([
                $_POST['title'],
                $_POST['image'],
                $_POST['category'],
                $_POST['sort_order'] ?: 0,
                $_POST['status'],
                $_POST['id']
            ]);
            $message = 'Image updated successfully!';
        } elseif ($_POST['action'] === 'delete') {
            $stmt = $pdo->prepare("DELETE FROM gallery WHERE id = ?");
            $stmt->execute([$_POST['id']]);
            $message = 'Image deleted successfully!';
        }
    }
}

$images = $pdo->query("SELECT * FROM gallery ORDER BY sort_order ASC")->fetchAll();

include 'includes/header.php';
?>

<div class="page-header">
    <h1>Gallery</h1>
    <button class="btn btn-primary" onclick="openModal('addModal')">
        <span class="material-icons">add_photo_alternate</span>
        Add Image
    </button>
</div>

<?php if ($message): ?>
    <div class="alert alert-success"><?= $message ?></div>
<?php endif; ?>

<div class="content-card">
    <?php if (empty($images)): ?>
        <div class="empty-state">
            <span class="material-icons">collections</span>
            <p>No images in gallery yet</p>
        </div>
    <?php else: ?>
        <table class="data-table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Title</th>
                    <th>Image URL</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                <?php foreach ($images as $image): ?>
                    <tr>
                        <td><?= $image['id'] ?></td>
                        <td><?= htmlspecialchars($image['title'] ?? '-') ?></td>
                        <td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;"><?= htmlspecialchars($image['image']) ?></td>
                        <td><?= htmlspecialchars($image['category'] ?? '-') ?></td>
                        <td><span class="status-badge <?= strtolower($image['status']) ?>"><?= $image['status'] ?></span></td>
                        <td class="actions">
                            <button class="action-btn edit" onclick="editImage(<?= htmlspecialchars(json_encode($image)) ?>)">
                                <span class="material-icons">edit</span>
                            </button>
                            <form method="POST" style="display:inline;" onsubmit="return confirmDelete('Delete this image?')">
                                <input type="hidden" name="action" value="delete">
                                <input type="hidden" name="id" value="<?= $image['id'] ?>">
                                <button type="submit" class="action-btn delete">
                                    <span class="material-icons">delete</span>
                                </button>
                            </form>
                        </td>
                    </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
    <?php endif; ?>
</div>

<div class="modal-overlay" id="addModal">
    <div class="modal">
        <div class="modal-header">
            <h2>Add Image</h2>
            <button class="modal-close" onclick="closeModal('addModal')">&times;</button>
        </div>
        <form method="POST">
            <div class="modal-body">

                <div class="form-group">
                    <label>Image URL</label>
                    <input type="text" name="image" required placeholder="https://...">
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Category</label>
                        <select name="category">
                            <option value="Beauty">Beauty</option>
                            <option value="Lifestyle">Lifestyle</option>
                            <option value="Wellness">Wellness</option>
                            <option value="Events">Events</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Sort Order</label>
                        <input type="number" name="sort_order" value="0">
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
                <button type="submit" class="btn btn-primary">Add Image</button>
            </div>
        </form>
    </div>
</div>

<div class="modal-overlay" id="editModal">
    <div class="modal">
        <div class="modal-header">
            <h2>Edit Image</h2>
            <button class="modal-close" onclick="closeModal('editModal')">&times;</button>
        </div>
        <form method="POST">
            <div class="modal-body">
                <input type="hidden" name="action" value="edit">
                <input type="hidden" name="id" id="edit_id">
                <div class="form-group">
                    <label>Title</label>
                    <input type="text" name="title" id="edit_title">
                </div>
                <div class="form-group">
                    <label>Image URL</label>
                    <input type="text" name="image" id="edit_image" required>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Category</label>
                        <select name="category" id="edit_category">
                            <option value="Beauty">Beauty</option>
                            <option value="Lifestyle">Lifestyle</option>
                            <option value="Wellness">Wellness</option>
                            <option value="Events">Events</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Sort Order</label>
                        <input type="number" name="sort_order" id="edit_sort_order">
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
                <button type="submit" class="btn btn-primary">Update Image</button>
            </div>
        </form>
    </div>
</div>

<script>
function editImage(image) {
    document.getElementById('edit_id').value = image.id;
    document.getElementById('edit_title').value = image.title || '';
    document.getElementById('edit_image').value = image.image;
    document.getElementById('edit_category').value = image.category || 'Beauty';
    document.getElementById('edit_sort_order').value = image.sort_order || 0;
    document.getElementById('edit_status').value = image.status || 'Active';
    openModal('editModal');
}
</script>

<?php include 'includes/footer.php'; ?>
