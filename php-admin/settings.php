<?php
require_once 'config.php';

$message = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    foreach ($_POST as $key => $value) {
        if ($key !== 'action') {
            $stmt = $pdo->prepare("INSERT OR REPLACE INTO settings (setting_key, setting_value) VALUES (?, ?)");
            $stmt->execute([$key, $value]);
        }
    }
    $message = 'Settings saved successfully!';
}

$settingsData = $pdo->query("SELECT * FROM settings")->fetchAll();
$settings = [];
foreach ($settingsData as $s) {
    $settings[$s['setting_key']] = $s['setting_value'];
}

include 'includes/header.php';
?>

<div class="page-header">
    <h1>Settings</h1>
</div>

<?php if ($message): ?>
    <div class="alert alert-success"><?= $message ?></div>
<?php endif; ?>

<form method="POST">
    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px;">
        <div class="content-card">
            <h2 class="card-title">General Settings</h2>
            <div class="form-group">
                <label>Site Name</label>
                <input type="text" name="site_name" value="<?= htmlspecialchars($settings['site_name'] ?? 'Poppik Academy') ?>">
            </div>
            <div class="form-group">
                <label>Site Tagline</label>
                <input type="text" name="site_tagline" value="<?= htmlspecialchars($settings['site_tagline'] ?? 'Educate. Empower. Elevate.') ?>">
            </div>
            <div class="form-group">
                <label>Contact Email</label>
                <input type="email" name="contact_email" value="<?= htmlspecialchars($settings['contact_email'] ?? '') ?>">
            </div>
            <div class="form-group">
                <label>Contact Phone</label>
                <input type="text" name="contact_phone" value="<?= htmlspecialchars($settings['contact_phone'] ?? '') ?>">
            </div>
            <div class="form-group">
                <label>Address</label>
                <textarea name="address" rows="3"><?= htmlspecialchars($settings['address'] ?? '') ?></textarea>
            </div>
        </div>

        <div class="content-card">
            <h2 class="card-title">Social Media</h2>
            <div class="form-group">
                <label>Facebook URL</label>
                <input type="text" name="facebook_url" value="<?= htmlspecialchars($settings['facebook_url'] ?? '') ?>" placeholder="https://facebook.com/...">
            </div>
            <div class="form-group">
                <label>Instagram URL</label>
                <input type="text" name="instagram_url" value="<?= htmlspecialchars($settings['instagram_url'] ?? '') ?>" placeholder="https://instagram.com/...">
            </div>
            <div class="form-group">
                <label>YouTube URL</label>
                <input type="text" name="youtube_url" value="<?= htmlspecialchars($settings['youtube_url'] ?? '') ?>" placeholder="https://youtube.com/...">
            </div>
            <div class="form-group">
                <label>LinkedIn URL</label>
                <input type="text" name="linkedin_url" value="<?= htmlspecialchars($settings['linkedin_url'] ?? '') ?>" placeholder="https://linkedin.com/...">
            </div>
            <div class="form-group">
                <label>Twitter URL</label>
                <input type="text" name="twitter_url" value="<?= htmlspecialchars($settings['twitter_url'] ?? '') ?>" placeholder="https://twitter.com/...">
            </div>
        </div>
    </div>

    <div style="margin-top: 20px; text-align: right;">
        <button type="submit" class="btn btn-primary">
            <span class="material-icons">save</span>
            Save Settings
        </button>
    </div>
</form>

<?php include 'includes/footer.php'; ?>
