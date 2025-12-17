<?php
require_once 'config.php';

$message = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['action'])) {
        if ($_POST['action'] === 'add') {
            $stmt = $pdo->prepare("INSERT INTO hero_sliders (title, subtitle, button_text, button_link, sort_order, status) VALUES (?, ?, ?, ?, ?, ?)");
            $stmt->execute([
                $_POST['title'],
                $_POST['subtitle'],
                $_POST['button_text'],
                $_POST['button_link'],
                $_POST['sort_order'] ?: 0,
                $_POST['status']
            ]);
            $message = 'Slider added successfully!';
        } elseif ($_POST['action'] === 'edit') {
            $stmt = $pdo->prepare("UPDATE hero_sliders SET title = ?, subtitle = ?, button_text = ?, button_link = ?, sort_order = ?, status = ? WHERE id = ?");
            $stmt->execute([
                $_POST['title'],
                $_POST['subtitle'],
                $_POST['button_text'],
                $_POST['button_link'],
                $_POST['sort_order'] ?: 0,
                $_POST['status'],
                $_POST['id']
            ]);
            $message = 'Slider updated successfully!';
        } elseif ($_POST['action'] === 'delete') {
            $stmt = $pdo->prepare("DELETE FROM hero_sliders WHERE id = ?");
            $stmt->execute([$_POST['id']]);
            $message = 'Slider deleted successfully!';
        }
    }
}

$sliders = $pdo->query("SELECT * FROM hero_sliders ORDER BY sort_order ASC")->fetchAll();

include 'includes/header.php';
?>

<div class="page-header">
    <h1>Hero Sliders</h1>
    <button class="btn btn-primary" onclick="openModal('addModal')">
        <span class="material-icons">add</span>
        Add Slider
    </button>
</div>

<?php if ($message): ?>
    <div class="alert alert-success"><?= $message ?></div>
<?php endif; ?>

<div class="content-card">
    <?php if (empty($sliders)): ?>
        <div class="empty-state">
            <span class="material-icons">view_carousel</span>
            <p>No hero sliders yet</p>
        </div>
    <?php else: ?>
        <table class="data-table">
            <thead>
                <tr>
                    <th>Order</th>
                    <th>Title</th>
                    <th>Subtitle</th>
                    <th>Button</th>
                    <th>Status</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                <?php foreach ($sliders as $slider): ?>
                    <tr>
                        <td><?= $slider['sort_order'] ?></td>
                        <td><?= htmlspecialchars($slider['title']) ?></td>
                        <td><?= htmlspecialchars($slider['subtitle'] ?? '-') ?></td>
                        <td><?= htmlspecialchars($slider['button_text'] ?? '-') ?></td>
                        <td><span class="status-badge <?= strtolower($slider['status']) ?>"><?= $slider['status'] ?></span></td>
                        <td class="actions">
                            <button class="action-btn edit" onclick="editSlider(<?= htmlspecialchars(json_encode($slider)) ?>)">
                                <span class="material-icons">edit</span>
                            </button>
                            <form method="POST" style="display:inline;" onsubmit="return confirmDelete('Delete this slider?')">
                                <input type="hidden" name="action" value="delete">
                                <input type="hidden" name="id" value="<?= $slider['id'] ?>">
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
            <h2>Add Slider</h2>
            <button class="modal-close" onclick="closeModal('addModal')">&times;</button>
        </div>
        <form method="POST">
            <div class="modal-body">
                <input type="hidden" name="action" value="add">
                <div class="form-group">
                    <label>Title</label>
                    <input type="text" name="title" required>
                </div>
                <div class="form-group">
                    <label>Subtitle</label>
                    <textarea name="subtitle"></textarea>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Button Text</label>
                        <input type="text" name="button_text">
                    </div>
                    <div class="form-group">
                        <label>Button Link</label>
                        <input type="text" name="button_link">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Sort Order</label>
                        <input type="number" name="sort_order" value="0">
                    </div>
                    <div class="form-group">
                        <label>Status</label>
                        <select name="status">
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                        </select>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" onclick="closeModal('addModal')">Cancel</button>
                <button type="submit" class="btn btn-primary">Add Slider</button>
            </div>
        </form>
    </div>
</div>

<div class="modal-overlay" id="editModal">
    <div class="modal">
        <div class="modal-header">
            <h2>Edit Slider</h2>
            <button class="modal-close" onclick="closeModal('editModal')">&times;</button>
        </div>
        <form method="POST">
            <div class="modal-body">
                <input type="hidden" name="action" value="edit">
                <input type="hidden" name="id" id="edit_id">
                <div class="form-group">
                    <label>Title</label>
                    <input type="text" name="title" id="edit_title" required>
                </div>
                <div class="form-group">
                    <label>Subtitle</label>
                    <textarea name="subtitle" id="edit_subtitle"></textarea>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Button Text</label>
                        <input type="text" name="button_text" id="edit_button_text">
                    </div>
                    <div class="form-group">
                        <label>Button Link</label>
                        <input type="text" name="button_link" id="edit_button_link">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Sort Order</label>
                        <input type="number" name="sort_order" id="edit_sort_order">
                    </div>
                    <div class="form-group">
                        <label>Status</label>
                        <select name="status" id="edit_status">
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                        </select>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" onclick="closeModal('editModal')">Cancel</button>
                <button type="submit" class="btn btn-primary">Update Slider</button>
            </div>
        </form>
    </div>
</div>

<script>
function editSlider(slider) {
    document.getElementById('edit_id').value = slider.id;
    document.getElementById('edit_title').value = slider.title;
    document.getElementById('edit_subtitle').value = slider.subtitle || '';
    document.getElementById('edit_button_text').value = slider.button_text || '';
    document.getElementById('edit_button_link').value = slider.button_link || '';
    document.getElementById('edit_sort_order').value = slider.sort_order || 0;
    document.getElementById('edit_status').value = slider.status || 'Active';
    openModal('editModal');
}
</script>

<?php include 'includes/footer.php'; ?>
