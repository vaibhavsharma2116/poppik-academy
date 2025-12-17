<?php
require_once 'config.php';

$message = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['action'])) {
        if ($_POST['action'] === 'add') {
            $stmt = $pdo->prepare("INSERT INTO blogs (title, excerpt, content, author, category, status) VALUES (?, ?, ?, ?, ?, ?)");
            $stmt->execute([
                $_POST['title'],
                $_POST['excerpt'],
                $_POST['content'],
                $_POST['author'],
                $_POST['category'],
                $_POST['status']
            ]);
            $message = 'Blog post added successfully!';
        } elseif ($_POST['action'] === 'edit') {
            $stmt = $pdo->prepare("UPDATE blogs SET title = ?, excerpt = ?, content = ?, author = ?, category = ?, status = ? WHERE id = ?");
            $stmt->execute([
                $_POST['title'],
                $_POST['excerpt'],
                $_POST['content'],
                $_POST['author'],
                $_POST['category'],
                $_POST['status'],
                $_POST['id']
            ]);
            $message = 'Blog post updated successfully!';
        } elseif ($_POST['action'] === 'delete') {
            $stmt = $pdo->prepare("DELETE FROM blogs WHERE id = ?");
            $stmt->execute([$_POST['id']]);
            $message = 'Blog post deleted successfully!';
        }
    }
}

$blogs = $pdo->query("SELECT * FROM blogs ORDER BY created_at DESC")->fetchAll();

include 'includes/header.php';
?>

<div class="page-header">
    <h1>Blogs</h1>
    <button class="btn btn-primary" onclick="openModal('addModal')">
        <span class="material-icons">add</span>
        Add Blog Post
    </button>
</div>

<?php if ($message): ?>
    <div class="alert alert-success"><?= $message ?></div>
<?php endif; ?>

<div class="content-card">
    <?php if (empty($blogs)): ?>
        <div class="empty-state">
            <span class="material-icons">description</span>
            <p>No blog posts yet</p>
        </div>
    <?php else: ?>
        <table class="data-table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Title</th>
                    <th>Author</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                <?php foreach ($blogs as $blog): ?>
                    <tr>
                        <td><?= $blog['id'] ?></td>
                        <td><?= htmlspecialchars($blog['title']) ?></td>
                        <td><?= htmlspecialchars($blog['author'] ?? '-') ?></td>
                        <td><?= htmlspecialchars($blog['category'] ?? '-') ?></td>
                        <td><span class="status-badge <?= strtolower($blog['status']) ?>"><?= $blog['status'] ?></span></td>
                        <td><?= date('M d, Y', strtotime($blog['created_at'])) ?></td>
                        <td class="actions">
                            <button class="action-btn edit" onclick="editBlog(<?= htmlspecialchars(json_encode($blog)) ?>)">
                                <span class="material-icons">edit</span>
                            </button>
                            <form method="POST" style="display:inline;" onsubmit="return confirmDelete('Delete this blog post?')">
                                <input type="hidden" name="action" value="delete">
                                <input type="hidden" name="id" value="<?= $blog['id'] ?>">
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
    <div class="modal" style="max-width:600px;">
        <div class="modal-header">
            <h2>Add Blog Post</h2>
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
                    <label>Excerpt</label>
                    <textarea name="excerpt" rows="2"></textarea>
                </div>
                <div class="form-group">
                    <label>Content</label>
                    <textarea name="content" rows="5"></textarea>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Author</label>
                        <input type="text" name="author">
                    </div>
                    <div class="form-group">
                        <label>Category</label>
                        <select name="category">
                            <option value="Beauty">Beauty</option>
                            <option value="Lifestyle">Lifestyle</option>
                            <option value="Wellness">Wellness</option>
                            <option value="Tips">Tips</option>
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label>Status</label>
                    <select name="status">
                        <option value="Draft">Draft</option>
                        <option value="Published">Published</option>
                    </select>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" onclick="closeModal('addModal')">Cancel</button>
                <button type="submit" class="btn btn-primary">Add Blog Post</button>
            </div>
        </form>
    </div>
</div>

<div class="modal-overlay" id="editModal">
    <div class="modal" style="max-width:600px;">
        <div class="modal-header">
            <h2>Edit Blog Post</h2>
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
                    <label>Excerpt</label>
                    <textarea name="excerpt" id="edit_excerpt" rows="2"></textarea>
                </div>
                <div class="form-group">
                    <label>Content</label>
                    <textarea name="content" id="edit_content" rows="5"></textarea>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Author</label>
                        <input type="text" name="author" id="edit_author">
                    </div>
                    <div class="form-group">
                        <label>Category</label>
                        <select name="category" id="edit_category">
                            <option value="Beauty">Beauty</option>
                            <option value="Lifestyle">Lifestyle</option>
                            <option value="Wellness">Wellness</option>
                            <option value="Tips">Tips</option>
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label>Status</label>
                    <select name="status" id="edit_status">
                        <option value="Draft">Draft</option>
                        <option value="Published">Published</option>
                    </select>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" onclick="closeModal('editModal')">Cancel</button>
                <button type="submit" class="btn btn-primary">Update Blog Post</button>
            </div>
        </form>
    </div>
</div>

<script>
function editBlog(blog) {
    document.getElementById('edit_id').value = blog.id;
    document.getElementById('edit_title').value = blog.title;
    document.getElementById('edit_excerpt').value = blog.excerpt || '';
    document.getElementById('edit_content').value = blog.content || '';
    document.getElementById('edit_author').value = blog.author || '';
    document.getElementById('edit_category').value = blog.category || 'Beauty';
    document.getElementById('edit_status').value = blog.status || 'Draft';
    openModal('editModal');
}
</script>

<?php include 'includes/footer.php'; ?>
