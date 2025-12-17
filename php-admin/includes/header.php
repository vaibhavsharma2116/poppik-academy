<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Poppik Academy - Admin Panel</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
    <link rel="stylesheet" href="assets/css/admin.css">
</head>
<body>
    <div class="admin-layout">
        <aside class="sidebar">
            <div class="sidebar-header">
                <h1 class="logo">Poppik <span>ACADEMY</span></h1>
            </div>
            <nav class="sidebar-nav">
                <a href="index.php" class="nav-item <?= basename($_SERVER['PHP_SELF']) == 'index.php' ? 'active' : '' ?>">
                    <span class="material-icons">home</span>
                    <span class="nav-label">Dashboard</span>
                </a>
                <a href="courses.php" class="nav-item <?= basename($_SERVER['PHP_SELF']) == 'courses.php' ? 'active' : '' ?>">
                    <span class="material-icons">menu_book</span>
                    <span class="nav-label">Courses</span>
                </a>
                <a href="students.php" class="nav-item <?= basename($_SERVER['PHP_SELF']) == 'students.php' ? 'active' : '' ?>">
                    <span class="material-icons">people</span>
                    <span class="nav-label">Students</span>
                </a>
                <a href="certificates.php" class="nav-item <?= basename($_SERVER['PHP_SELF']) == 'certificates.php' ? 'active' : '' ?>">
                    <span class="material-icons">verified</span>
                    <span class="nav-label">Certificates</span>
                </a>
                <a href="queries.php" class="nav-item <?= basename($_SERVER['PHP_SELF']) == 'queries.php' ? 'active' : '' ?>">
                    <span class="material-icons">help_outline</span>
                    <span class="nav-label">Queries</span>
                </a>
                <a href="hero-sliders.php" class="nav-item <?= basename($_SERVER['PHP_SELF']) == 'hero-sliders.php' ? 'active' : '' ?>">
                    <span class="material-icons">view_carousel</span>
                    <span class="nav-label">Hero Sliders</span>
                </a>
                <a href="gallery.php" class="nav-item <?= basename($_SERVER['PHP_SELF']) == 'gallery.php' ? 'active' : '' ?>">
                    <span class="material-icons">collections</span>
                    <span class="nav-label">Gallery</span>
                </a>
                <a href="blogs.php" class="nav-item <?= basename($_SERVER['PHP_SELF']) == 'blogs.php' ? 'active' : '' ?>">
                    <span class="material-icons">description</span>
                    <span class="nav-label">Blogs</span>
                </a>
                <a href="video-hub.php" class="nav-item <?= basename($_SERVER['PHP_SELF']) == 'video-hub.php' ? 'active' : '' ?>">
                    <span class="material-icons">smart_display</span>
                    <span class="nav-label">Video Hub</span>
                </a>
                <a href="partners.php" class="nav-item <?= basename($_SERVER['PHP_SELF']) == 'partners.php' ? 'active' : '' ?>">
                    <span class="material-icons">handshake</span>
                    <span class="nav-label">Partners</span>
                </a>
                <a href="settings.php" class="nav-item <?= basename($_SERVER['PHP_SELF']) == 'settings.php' ? 'active' : '' ?>">
                    <span class="material-icons">settings</span>
                    <span class="nav-label">Settings</span>
                </a>
            </nav>
        </aside>
        <main class="main-content">
