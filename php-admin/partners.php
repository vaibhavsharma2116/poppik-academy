<?php
require_once 'config.php';

$message = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['action'])) {
        if ($_POST['action'] === 'add') {
            $stmt = $pdo->prepare("INSERT INTO partners (name, logo, website, description, sort_order, status) VALUES (?, ?, ?, ?, ?, ?)");
            $stmt->execute([
                $_POST['name'],
                $_POST['logo'],
                $_POST['website'],
                $_POST['description'],
                $_POST['sort_order'] ?: 0,
                $_POST['status']
            ]);
            $message = 'Partner added successfully!';
        } elseif ($_POST['action'] === 'edit') {
            $stmt = $pdo->prepare("UPDATE partners SET name = ?, logo = ?, website = ?, description = ?, sort_order = ?, status = ? WHERE id = ?");
            $stmt->execute([
                $_POST['name'],
                $_POST['logo'],
                $_POST['website'],
                $_POST['description'],
                $_POST['sort_order'] ?: 0,
                $_POST['status'],
                $_POST['id']
            ]);
            $message = 'Partner updated successfully!';
        } elseif ($_POST['action'] === 'delete') {
            $stmt = $pdo->prepare("DELETE FROM partners WHERE id = ?");
            $stmt->execute([$_POST['id']]);
            $message = 'Partner deleted successfully!';
        }
    }
}

$partners = $pdo->query("SELECT * FROM partners ORDER BY sort_order ASC")->fetchAll();

include 'includes/header.php';
?>

<div class="page-header">
    <h1>Partners</h1>
    <button class="btn btn-primary" onclick="openModal('addModal')">
        <span class="material-icons">add</span>
        Add Partner
    </button>
</div>

<?php if ($message): ?>
    <div class="alert alert-success"><?= $message ?></div>
<?php endif; ?>

<div class="content-card">
    <?php if (empty($partners)): ?>
        <div class="empty-state">
            <span class="material-icons">handshake</span>
            <p>No partners yet</p>
        </div>
    <?php else: ?>
        <table class="data-table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Website</th>
                    <th>Status</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                <?php foreach ($partners as $partner): ?>
                    <tr>
                        <td><?= $partner['id'] ?></td>
                        <td><?= htmlspecialchars($partner['name']) ?></td>
                        <td><?= htmlspecialchars($partner['website'] ?? '-') ?></td>
                        <td><span class="status-badge <?= strtolower($partner['status']) ?>"><?= $partner['status'] ?></span></td>
                        <td class="actions">
                            <button class="action-btn edit" onclick="editPartner(<?= htmlspecialchars(json_encode($partner)) ?>)">
                                <span class="material-icons">edit</span>
                            </button>
                            <form method="POST" style="display:inline;" onsubmit="return confirmDelete('Delete this partner?')">
                                <input type="hidden" name="action" value="delete">
                                <input type="hidden" name="id" value="<?= $partner['id'] ?>">
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
            <h2>Add Partner</h2>
            <button class="modal-close" onclick="closeModal('addModal')">&times;</button>
        </div>
        <form method="POST">
            <div class="modal-body">
                <input type="hidden" name="action" value="add">
                <div class="form-group">
                    <label>Partner Name</label>
                    <input type="text" name="name" required>
                </div>
                <div class="form-group">
                    <label>Logo URL</label>
                    <input type="text" name="logo" placeholder="https://...">
                </div>
                <div class="form-group">
                    <label>Website</label>
                    <input type="text" name="website" placeholder="https://...">
                </div>
                <div class="form-group">
                    <label>Description</label>
                    <textarea name="description"></textarea>
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
                <button type="submit" class="btn btn-primary">Add Partner</button>
            </div>
        </form>
    </div>
</div>

<div class="modal-overlay" id="editModal">
    <div class="modal">
        <div class="modal-header">
            <h2>Edit Partner</h2>
            <button class="modal-close" onclick="closeModal('editModal')">&times;</button>
        </div>
        <form method="POST">
            <div class="modal-body">
                <input type="hidden" name="action" value="edit">
                <input type="hidden" name="id" id="edit_id">
                <div class="form-group">
                    <label>Partner Name</label>
                    <input type="text" name="name" id="edit_name" required>
                </div>
                <div class="form-group">
                    <label>Logo URL</label>
                    <input type="text" name="logo" id="edit_logo">
                </div>
                <div class="form-group">
                    <label>Website</label>
                    <input type="text" name="website" id="edit_website">
                </div>
                <div class="form-group">
                    <label>Description</label>
                    <textarea name="description" id="edit_description"></textarea>
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
                <button type="submit" class="btn btn-primary">Update Partner</button>
            </div>
        </form>
    </div>
</div>

<script>
function editPartner(partner) {
    document.getElementById('edit_id').value = partner.id;
    document.getElementById('edit_name').value = partner.name;
    document.getElementById('edit_logo').value = partner.logo || '';
    document.getElementById('edit_website').value = partner.website || '';
    document.getElementById('edit_description').value = partner.description || '';
    document.getElementById('edit_sort_order').value = partner.sort_order || 0;
    document.getElementById('edit_status').value = partner.status || 'Active';
    openModal('editModal');
}
</script>

<?php include 'includes/footer.php'; ?>
