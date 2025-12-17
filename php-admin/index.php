<?php
require_once 'config.php';

$stats = getStats($pdo);
$recentStudents = $pdo->query("SELECT s.*, c.name as course_name FROM students s LEFT JOIN courses c ON s.course_id = c.id ORDER BY s.created_at DESC LIMIT 5")->fetchAll();
$recentQueries = $pdo->query("SELECT * FROM queries ORDER BY created_at DESC LIMIT 5")->fetchAll();

include 'includes/header.php';
?>

<div class="page-header">
    <h1>Dashboard</h1>
    <div class="admin-info">
        <span class="material-icons">account_circle</span>
        <span>Admin</span>
    </div>
</div>

<div class="stats-grid">
    <div class="stat-card">
        <div class="stat-icon blue">
            <span class="material-icons">menu_book</span>
        </div>
        <div class="stat-count"><?= $stats['courses'] ?></div>
        <div class="stat-label">Courses</div>
    </div>
    <div class="stat-card">
        <div class="stat-icon pink">
            <span class="material-icons">people</span>
        </div>
        <div class="stat-count"><?= $stats['students'] ?></div>
        <div class="stat-label">Students</div>
    </div>
    <div class="stat-card">
        <div class="stat-icon purple">
            <span class="material-icons">workspace_premium</span>
        </div>
        <div class="stat-count"><?= $stats['certificates'] ?></div>
        <div class="stat-label">Certificates</div>
    </div>
    <div class="stat-card">
        <div class="stat-icon green">
            <span class="material-icons">contact_support</span>
        </div>
        <div class="stat-count"><?= $stats['queries'] ?></div>
        <div class="stat-label">Pending Queries</div>
    </div>
    <div class="stat-card">
        <div class="stat-icon cyan">
            <span class="material-icons">edit_note</span>
        </div>
        <div class="stat-count"><?= $stats['blogs'] ?></div>
        <div class="stat-label">Blogs</div>
    </div>
    <div class="stat-card">
        <div class="stat-icon orange">
            <span class="material-icons">groups</span>
        </div>
        <div class="stat-count"><?= $stats['partners'] ?></div>
        <div class="stat-label">Partners</div>
    </div>
</div>

<div class="tables-grid">
    <div class="content-card">
        <h2 class="card-title">Recent Students</h2>
        <table class="data-table">
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                <?php if (empty($recentStudents)): ?>
                    <tr><td colspan="3" class="no-data">No students yet</td></tr>
                <?php else: ?>
                    <?php foreach ($recentStudents as $student): ?>
                        <tr>
                            <td><?= htmlspecialchars($student['name']) ?></td>
                            <td><?= htmlspecialchars($student['email']) ?></td>
                            <td><span class="status-badge <?= strtolower($student['status']) ?>"><?= $student['status'] ?></span></td>
                        </tr>
                    <?php endforeach; ?>
                <?php endif; ?>
            </tbody>
        </table>
    </div>

    <div class="content-card">
        <h2 class="card-title">Recent Queries</h2>
        <table class="data-table">
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Subject</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                <?php if (empty($recentQueries)): ?>
                    <tr><td colspan="3" class="no-data">No queries yet</td></tr>
                <?php else: ?>
                    <?php foreach ($recentQueries as $query): ?>
                        <tr>
                            <td><?= htmlspecialchars($query['name']) ?></td>
                            <td><?= htmlspecialchars($query['subject'] ?? '-') ?></td>
                            <td><span class="status-badge <?= strtolower($query['status']) ?>"><?= $query['status'] ?></span></td>
                        </tr>
                    <?php endforeach; ?>
                <?php endif; ?>
            </tbody>
        </table>
    </div>
</div>

<?php include 'includes/footer.php'; ?>
