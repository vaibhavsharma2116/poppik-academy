<?php
require_once 'config.php';

$message = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['action'])) {
        if ($_POST['action'] === 'update_status') {
            $stmt = $pdo->prepare("UPDATE queries SET status = ? WHERE id = ?");
            $stmt->execute([$_POST['status'], $_POST['id']]);
            $message = 'Query status updated!';
        } elseif ($_POST['action'] === 'delete') {
            $stmt = $pdo->prepare("DELETE FROM queries WHERE id = ?");
            $stmt->execute([$_POST['id']]);
            $message = 'Query deleted successfully!';
        }
    }
}

$queries = $pdo->query("SELECT * FROM queries ORDER BY id ASC")->fetchAll();

include 'includes/header.php';
?>

<div class="page-header">
    <h1>Queries</h1>
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
                <th>Subject</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody>
            <?php if (empty($queries)): ?>
                <tr><td colspan="7" class="no-data">No queries yet</td></tr>
            <?php else: ?>
                <?php foreach ($queries as $query): ?>
                    <tr>
                        <td><?= $query['id'] ?></td>
                        <td><?= htmlspecialchars($query['name']) ?></td>
                        <td><?= htmlspecialchars($query['email']) ?></td>
                        <td><?= htmlspecialchars($query['subject'] ?? '-') ?></td>
                        <td>
                            <form method="POST" style="display:inline;">
                                <input type="hidden" name="action" value="update_status">
                                <input type="hidden" name="id" value="<?= $query['id'] ?>">
                                <select name="status" onchange="this.form.submit()" class="status-select">
                                    <option value="Pending" <?= $query['status'] === 'Pending' ? 'selected' : '' ?>>Pending</option>
                                    <option value="In Progress" <?= $query['status'] === 'In Progress' ? 'selected' : '' ?>>In Progress</option>
                                    <option value="Resolved" <?= $query['status'] === 'Resolved' ? 'selected' : '' ?>>Resolved</option>
                                </select>
                            </form>
                        </td>
                        <td><?= date('M d, Y', strtotime($query['created_at'])) ?></td>
                        <td class="actions">
                            <button class="action-btn view" onclick="viewQuery(<?= htmlspecialchars(json_encode($query)) ?>)">
                                <span class="material-icons">visibility</span>
                            </button>
                            <form method="POST" style="display:inline;" onsubmit="return confirmDelete('Delete this query?')">
                                <input type="hidden" name="action" value="delete">
                                <input type="hidden" name="id" value="<?= $query['id'] ?>">
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

<div class="modal-overlay" id="viewModal">
    <div class="modal">
        <div class="modal-header">
            <h2>Query Details</h2>
            <button class="modal-close" onclick="closeModal('viewModal')">&times;</button>
        </div>
        <div class="modal-body">
            <p><strong>Name:</strong> <span id="view_name"></span></p>
            <p><strong>Email:</strong> <span id="view_email"></span></p>
            <p><strong>Phone:</strong> <span id="view_phone"></span></p>
            <p><strong>Subject:</strong> <span id="view_subject"></span></p>
            <p><strong>Message:</strong></p>
            <p id="view_message" style="background:#f8fafc;padding:15px;border-radius:8px;"></p>
        </div>
        <div class="modal-footer">
            <button type="button" class="btn btn-secondary" onclick="closeModal('viewModal')">Close</button>
        </div>
    </div>
</div>

<style>
.status-select {
    padding: 4px 8px;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    font-size: 12px;
    background: #fff;
}
</style>

<script>
function viewQuery(query) {
    document.getElementById('view_name').textContent = query.name;
    document.getElementById('view_email').textContent = query.email;
    document.getElementById('view_phone').textContent = query.phone || '-';
    document.getElementById('view_subject').textContent = query.subject || '-';
    document.getElementById('view_message').textContent = query.message || 'No message';
    openModal('viewModal');
}
</script>

<?php include 'includes/footer.php'; ?>
