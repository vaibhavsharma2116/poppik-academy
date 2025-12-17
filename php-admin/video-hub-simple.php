<?php
require_once 'config.php';
include 'includes/header.php';
?>

<div class="page-header">
    <h1>Simple Video Upload (No Node required)</h1>
    <p>Use this page to upload a video file and create the videos DB row in one step.</p>
</div>

<div class="content-card">
    <form id="videoForm">
        <div class="form-group">
            <label>Title</label>
            <input type="text" name="title" id="title" required>
        </div>
        <div class="form-group">
            <label>Description</label>
            <textarea name="description" id="description"></textarea>
        </div>
        <div class="form-group">
            <label>Video file</label>
            <input type="file" name="video_file" id="video_file" accept="video/*" required>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Category</label>
                <select id="category" name="category">
                    <option value="Beauty">Beauty</option>
                    <option value="Lifestyle">Lifestyle</option>
                    <option value="Wellness">Wellness</option>
                    <option value="Tutorial">Tutorial</option>
                </select>
            </div>
            <div class="form-group">
                <label>Duration</label>
                <input type="text" id="duration" name="duration" placeholder="e.g. 00:14">
            </div>
        </div>
        <div class="form-group">
            <label>Status</label>
            <select id="status" name="status">
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
            </select>
        </div>

        <div class="form-actions">
            <button type="submit" class="btn btn-primary">Upload & Create</button>
        </div>
    </form>

    <div id="result" style="margin-top:16px;"></div>
</div>

<script>
document.getElementById('videoForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const title = document.getElementById('title').value.trim();
    const description = document.getElementById('description').value.trim();
    const fileInput = document.getElementById('video_file');
    const category = document.getElementById('category').value;
    const duration = document.getElementById('duration').value;
    const status = document.getElementById('status').value;

    if (!fileInput.files || fileInput.files.length === 0) {
        alert('Select a video file');
        return;
    }

    const fd = new FormData();
    fd.append('video_file', fileInput.files[0], fileInput.files[0].name);
    // ask backend to create a videos row in the same request
    fd.append('create_record', '1');
    fd.append('title', title);
    fd.append('description', description);
    fd.append('category', category);
    fd.append('duration', duration);
    fd.append('status', status);

    const resultEl = document.getElementById('result');
    resultEl.innerText = 'Uploading...';

    try {
        const resp = await fetch('api/gallery.php?upload=1', {
            method: 'POST',
            body: fd
        });
        const json = await resp.json();
        if (json && json.success && json.url) {
            let msg = 'Upload successful. Video URL: ' + json.url;
            if (json.id) msg += '\nCreated video id: ' + json.id;
            resultEl.innerText = msg;
            // Optionally redirect back to admin list
        } else {
            resultEl.innerText = 'Upload failed: ' + (json && json.message ? json.message : JSON.stringify(json));
        }
    } catch (err) {
        console.error(err);
        resultEl.innerText = 'Upload error: ' + err.message;
    }
});
</script>

<?php include 'includes/footer.php'; ?>
