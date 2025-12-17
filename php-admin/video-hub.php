<?php
require_once 'config.php';

$message = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['action'])) {
        if ($_POST['action'] === 'add') {
            $stmt = $pdo->prepare("INSERT INTO videos (title, description, video_url, category, duration, status) VALUES (?, ?, ?, ?, ?, ?)");
            $stmt->execute([
                $_POST['title'],
                $_POST['description'],
                $_POST['video_url'],
                $_POST['category'],
                $_POST['duration'],
                $_POST['status']
            ]);
            $message = 'Video added successfully!';
        } elseif ($_POST['action'] === 'edit') {
            $stmt = $pdo->prepare("UPDATE videos SET title = ?, description = ?, video_url = ?, category = ?, duration = ?, status = ? WHERE id = ?");
            $stmt->execute([
                $_POST['title'],
                $_POST['description'],
                $_POST['video_url'],
                $_POST['category'],
                $_POST['duration'],
                $_POST['status'],
                $_POST['id']
            ]);
            $message = 'Video updated successfully!';
        } elseif ($_POST['action'] === 'delete') {
            $stmt = $pdo->prepare("DELETE FROM videos WHERE id = ?");
            $stmt->execute([$_POST['id']]);
            $message = 'Video deleted successfully!';
        }
    }
}

$videos = $pdo->query("SELECT * FROM videos ORDER BY created_at DESC")->fetchAll();

include 'includes/header.php';
?>

<div class="page-header">
    <h1>Video Hub</h1>
    <button class="btn btn-primary" onclick="openModal('addModal')">
        <span class="material-icons">video_call</span>
        Add Video
    </button>
</div>

<?php if ($message): ?>
    <div class="alert alert-success"><?= $message ?></div>
<?php endif; ?>

<div class="content-card">
    <?php if (empty($videos)): ?>
        <div class="empty-state">
            <span class="material-icons">smart_display</span>
            <p>No videos yet</p>
        </div>
    <?php else: ?>
        <table class="data-table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Duration</th>
                    <th>Status</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                <?php foreach ($videos as $video): ?>
                    <tr>
                        <td><?= $video['id'] ?></td>
                        <td><?= htmlspecialchars($video['title']) ?></td>
                        <td><?= htmlspecialchars($video['category'] ?? '-') ?></td>
                        <td><?= htmlspecialchars($video['duration'] ?? '-') ?></td>
                        <td><span class="status-badge <?= strtolower($video['status']) ?>"><?= $video['status'] ?></span></td>
                        <td class="actions">
                            <button class="action-btn edit" onclick="editVideo(<?= htmlspecialchars(json_encode($video)) ?>)">
                                <span class="material-icons">edit</span>
                            </button>
                            <form method="POST" style="display:inline;" onsubmit="return confirmDelete('Delete this video?')">
                                <input type="hidden" name="action" value="delete">
                                <input type="hidden" name="id" value="<?= $video['id'] ?>">
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
            <h2>Add Video</h2>
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
                    <label>Description</label>
                    <textarea name="description"></textarea>
                </div>
                <div class="form-group">
                    <label>Video URL</label>
                    <input type="text" name="video_url" placeholder="YouTube or Video URL">
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Category</label>
                        <select name="category">
                            <option value="Beauty">Beauty</option>
                            <option value="Lifestyle">Lifestyle</option>
                            <option value="Wellness">Wellness</option>
                            <option value="Tutorial">Tutorial</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Duration</label>
                        <input type="text" name="duration" placeholder="e.g. 10:30">
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
                <button type="submit" class="btn btn-primary">Add Video</button>
            </div>
        </form>
    </div>
</div>

<div class="modal-overlay" id="editModal">
    <div class="modal">
        <div class="modal-header">
            <h2>Edit Video</h2>
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
                    <label>Description</label>
                    <textarea name="description" id="edit_description"></textarea>
                </div>
                <div class="form-group">
                    <label>Video URL</label>
                    <input type="text" name="video_url" id="edit_video_url">
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Category</label>
                        <select name="category" id="edit_category">
                            <option value="Beauty">Beauty</option>
                            <option value="Lifestyle">Lifestyle</option>
                            <option value="Wellness">Wellness</option>
                            <option value="Tutorial">Tutorial</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Duration</label>
                        <input type="text" name="duration" id="edit_duration">
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
                <button type="submit" class="btn btn-primary">Update Video</button>
            </div>
        </form>
    </div>
</div>

<script>
function editVideo(video) {
    document.getElementById('edit_id').value = video.id;
    document.getElementById('edit_title').value = video.title;
    document.getElementById('edit_description').value = video.description || '';
    document.getElementById('edit_video_url').value = video.video_url || '';
    document.getElementById('edit_category').value = video.category || 'Beauty';
    document.getElementById('edit_duration').value = video.duration || '';
    document.getElementById('edit_status').value = video.status || 'Active';
    openModal('editModal');
}
</script>

<?php include 'includes/footer.php'; ?>
