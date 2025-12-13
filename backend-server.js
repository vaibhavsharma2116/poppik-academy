const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const app = express();
app.use(cors());
// Increase body size limits to support large uploads (base64 images, large JSON)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Serve uploaded static assets (images, files) from php-admin/uploads
app.use('/uploads', express.static(path.join(__dirname, 'php-admin', 'uploads')));

// Multer in-memory storage for handling file uploads without writing to disk
const upload = multer({ storage: multer.memoryStorage() });

const PORT = process.env.PORT || 8000;

// DB clients (lazy)
let dbClient = null;
let dbType = null; // 'mysql' or 'sqlite'
// Feature detection flags for schema differences
let coursesHasStudents = false;
let coursesHasSlug = false;

async function initDb() {
  const driver = (process.env.DB_DRIVER || '').toLowerCase();
  if (driver === 'mysql') {
    // Try to connect to MySQL via mysql2
    try {
      const mysql = require('mysql2/promise');
      const pool = await mysql.createPool({
        host: process.env.DB_HOST || '127.0.0.1',
        port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306,
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASS || '',
        database: process.env.DB_NAME || 'poppik_academy',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
      });
      dbClient = pool;
      dbType = 'mysql';
      console.log('Connected to MySQL via mysql2');
      // detect optional columns
      try {
        const [cols] = await dbClient.execute(
          'SELECT COUNT(*) as cnt FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?',
          [process.env.DB_NAME || 'poppik_academy', 'courses', 'students']
        );
        coursesHasStudents = !!(cols && cols[0] && cols[0].cnt > 0);
        try {
          const [cols2] = await dbClient.execute(
            'SELECT COUNT(*) as cnt FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?',
            [process.env.DB_NAME || 'poppik_academy', 'courses', 'slug']
          );
          coursesHasSlug = !!(cols2 && cols2[0] && cols2[0].cnt > 0);
        } catch (e) {
          coursesHasSlug = false;
        }
      } catch (e) {
        coursesHasStudents = false;
      }
      return;
    } catch (err) {
      console.error('MySQL connection failed, falling back to SQLite:', err.message);
    }
  }

  // Fallback to SQLite DB file used by `php-admin` if available
  try {
    const sqlite3 = require('sqlite3');
    const { open } = require('sqlite');
    const dbPath = path.resolve(__dirname, 'php-admin', 'data', 'db.sqlite');
    // Ensure directory exists
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const db = await open({ filename: dbPath, driver: sqlite3.Database });
    dbClient = db;
    dbType = 'sqlite';
    console.log('Connected to SQLite DB at', dbPath);
    // detect optional columns in sqlite
    try {
      const info = await dbClient.all("PRAGMA table_info('courses')");
      coursesHasStudents = Array.isArray(info) && info.some((r) => r.name === 'students');
      coursesHasSlug = Array.isArray(info) && info.some((r) => r.name === 'slug');
    } catch (e) {
      coursesHasStudents = false;
    }
  } catch (err) {
    console.error('Failed to open SQLite DB:', err.message);
    dbClient = null;
    dbType = null;
  }
}

function isDbReady() {
  return dbClient !== null && (dbType === 'mysql' || dbType === 'sqlite');
}

// Helper query functions
async function queryAll(sql, params = []) {
  if (!isDbReady()) throw new Error('Database not initialized');
  if (dbType === 'mysql') {
    const [rows] = await dbClient.execute(sql, params);
    return rows;
  } else {
    return dbClient.all(sql, params);
  }
}

async function queryOne(sql, params = []) {
  if (!isDbReady()) throw new Error('Database not initialized');
  if (dbType === 'mysql') {
    const [rows] = await dbClient.execute(sql, params);
    return rows[0] || null;
  } else {
    return dbClient.get(sql, params);
  }
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Backend is running', db: dbType || 'none' });
});

// Generic helpers mapping endpoints to table names
app.get('/api/hero-sliders.php', async (req, res) => {
  try {
    const rows = await queryAll('SELECT * FROM hero_sliders ORDER BY sort_order DESC');
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Create a hero slider. Supports multipart upload when `?upload=1` (field `image_file`) or regular JSON body.
app.post('/api/hero-sliders.php', upload.single('image_file'), async (req, res) => {
  try {
    // Upload flow: save file and return URL
    if (req.query && String(req.query.upload) === '1') {
      let title = req.body.title || '';
      let subtitle = req.body.subtitle || '';
      let button_text = req.body.button_text || '';
      let button_link = req.body.button_link || '';
      let sort_order = req.body.sort_order || 0;
      let status = req.body.status || 'Active';
      let imageUrl = '';

      if (req.file && req.file.buffer) {
        const uploadsDir = path.join(__dirname, 'php-admin', 'uploads', 'hero-sliders');
        if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
        let ext = path.extname(req.file.originalname || '') || '';
        if (!ext) {
          const mime = (req.file.mimetype || '').split('/')[1] || '';
          if (mime) ext = '.' + mime.replace(/[^a-z0-9]/gi, '');
        }
        const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
        const outPath = path.join(uploadsDir, filename);
        fs.writeFileSync(outPath, req.file.buffer);
        if (!title && req.file.originalname) title = req.file.originalname;
        imageUrl = `/uploads/hero-sliders/${filename}`;
      } else if (req.body.image) {
        imageUrl = req.body.image;
      }

      if (dbType === 'mysql') {
        const [result] = await dbClient.execute(
          'INSERT INTO hero_sliders (title, subtitle, image, button_text, button_link, sort_order, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())',
          [title || '', subtitle || '', imageUrl || '', button_text || '', button_link || '', sort_order || 0, status || 'Active']
        );
        const insertId = result.insertId || null;
        return res.json({ success: true, id: insertId, url: imageUrl });
      } else {
        const result = await dbClient.run(
          'INSERT INTO hero_sliders (title, subtitle, image, button_text, button_link, sort_order, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, datetime("now"))',
          [title || '', subtitle || '', imageUrl || '', button_text || '', button_link || '', sort_order || 0, status || 'Active']
        );
        const insertId = result.lastID || null;
        return res.json({ success: true, id: insertId, url: imageUrl });
      }
    }

    // JSON flow
    const { title, subtitle, image, button_text, button_link, sort_order, status } = req.body || {};
    if (!title) return res.status(400).json({ success: false, message: 'title is required' });

    if (dbType === 'mysql') {
      const [result] = await dbClient.execute(
        'INSERT INTO hero_sliders (title, subtitle, image, button_text, button_link, sort_order, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())',
        [title || '', subtitle || '', image || '', button_text || '', button_link || '', sort_order || 0, status || 'Active']
      );
      const insertId = result.insertId || null;
      return res.json({ success: true, id: insertId });
    } else {
      const result = await dbClient.run(
        'INSERT INTO hero_sliders (title, subtitle, image, button_text, button_link, sort_order, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, datetime("now"))',
        [title || '', subtitle || '', image || '', button_text || '', button_link || '', sort_order || 0, status || 'Active']
      );
      const insertId = result.lastID || null;
      return res.json({ success: true, id: insertId });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Update a hero slider
app.put('/api/hero-sliders.php', async (req, res) => {
  try {
    const id = req.query.id;
    if (!id) return res.status(400).json({ success: false, message: 'id is required' });
    const body = req.body || {};
    const updates = [];
    const params = [];
    if (body.title !== undefined) { updates.push('title = ?'); params.push(body.title); }
    if (body.subtitle !== undefined) { updates.push('subtitle = ?'); params.push(body.subtitle); }
    if (body.image !== undefined) { updates.push('image = ?'); params.push(body.image); }
    if (body.button_text !== undefined) { updates.push('button_text = ?'); params.push(body.button_text); }
    if (body.button_link !== undefined) { updates.push('button_link = ?'); params.push(body.button_link); }
    if (body.sort_order !== undefined) { updates.push('sort_order = ?'); params.push(body.sort_order); }
    if (body.status !== undefined) { updates.push('status = ?'); params.push(body.status); }

    if (updates.length === 0) return res.status(400).json({ success: false, message: 'no fields to update' });

    params.push(id);
    const sql = `UPDATE hero_sliders SET ${updates.join(', ')} WHERE id = ?`;
    if (dbType === 'mysql') {
      await dbClient.execute(sql, params);
    } else {
      await dbClient.run(sql, params);
    }
    const updated = await queryOne('SELECT * FROM hero_sliders WHERE id = ?', [id]);
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Delete a hero slider by id
app.delete('/api/hero-sliders.php', async (req, res) => {
  try {
    const id = req.query.id;
    if (!id) return res.status(400).json({ success: false, message: 'id is required' });

    // attempt to delete local uploaded file if present
    try {
      const row = await queryOne('SELECT * FROM hero_sliders WHERE id = ?', [id]);
      if (row && row.image) {
        let img = row.image || '';
        img = img.replace(/\\/g, '/');
        const uploadsIndex = img.indexOf('/uploads/');
        let localPath = null;
        if (uploadsIndex !== -1) {
          const rel = img.slice(uploadsIndex + 1);
          localPath = path.join(__dirname, rel);
        } else if (img.startsWith('uploads/') || img.startsWith('php-admin/uploads/')) {
          localPath = path.join(__dirname, img.replace(/^php-admin\//, ''));
        }
        if (localPath && fs.existsSync(localPath)) {
          try { fs.unlinkSync(localPath); } catch (e) { /* ignore */ }
        }
      }
    } catch (e) { /* ignore */ }

    if (dbType === 'mysql') {
      await dbClient.execute('DELETE FROM hero_sliders WHERE id = ?', [id]);
    } else {
      await dbClient.run('DELETE FROM hero_sliders WHERE id = ?', [id]);
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/courses.php', async (req, res) => {
  try {
    const rows = await queryAll('SELECT * FROM courses');
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Create a new course (JSON body)
app.post('/api/courses.php', async (req, res) => {
  try {
    const body = req.body || {};
    const name = body.name || body.title || '';
    const description = body.description || '';
    const duration = body.duration || '';
    const category = body.category || '';
    const students = body.students || 0;
    const status = body.status || 'Active';
    const slug = body.slug || (name ? String(name).toLowerCase().replace(/[^a-z0-9]+/g, '-') : '');

    if (!name) return res.status(400).json({ success: false, message: 'name is required' });

    // Build INSERT dynamically depending on which optional columns exist
    const cols = ['name', 'description', 'duration', 'category'];
    const placeholders = ['?', '?', '?', '?'];
    const params = [name, description, duration, category];

    if (coursesHasStudents) {
      cols.push('students');
      placeholders.push('?');
      params.push(students);
    }

    cols.push('status');
    placeholders.push('?');
    params.push(status);

    if (coursesHasSlug) {
      cols.push('slug');
      placeholders.push('?');
      params.push(slug);
    }

    if (dbType === 'mysql') {
      const sql = `INSERT INTO courses (${cols.join(', ')}, created_at) VALUES (${placeholders.join(', ')}, NOW())`;
      const [result] = await dbClient.execute(sql, params);
      const insertId = result.insertId || null;
      return res.json({ success: true, id: insertId });
    } else {
      const sql = `INSERT INTO courses (${cols.join(', ')}, created_at) VALUES (${placeholders.join(', ')}, datetime("now"))`;
      const result = await dbClient.run(sql, params);
      const insertId = result.lastID || null;
      return res.json({ success: true, id: insertId });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Update course — pass id as query param and JSON body with fields to update
app.put('/api/courses.php', async (req, res) => {
  try {
    const id = req.query.id;
    if (!id) return res.status(400).json({ success: false, message: 'id is required' });
    const body = req.body || {};
    const updates = [];
    const params = [];
    if (body.name !== undefined) { updates.push('name = ?'); params.push(body.name); }
    if (body.description !== undefined) { updates.push('description = ?'); params.push(body.description); }
    if (body.duration !== undefined) { updates.push('duration = ?'); params.push(body.duration); }
    if (body.category !== undefined) { updates.push('category = ?'); params.push(body.category); }
    if (body.students !== undefined && coursesHasStudents) { updates.push('students = ?'); params.push(body.students); }
    if (body.status !== undefined) { updates.push('status = ?'); params.push(body.status); }
    if (body.slug !== undefined && coursesHasSlug) { updates.push('slug = ?'); params.push(body.slug); }

    if (updates.length === 0) return res.status(400).json({ success: false, message: 'no fields to update' });

    params.push(id);
    const sql = `UPDATE courses SET ${updates.join(', ')} WHERE id = ?`;

    if (dbType === 'mysql') {
      await dbClient.execute(sql, params);
    } else {
      await dbClient.run(sql, params);
    }

    const updated = await queryOne('SELECT * FROM courses WHERE id = ?', [id]);
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Delete a course by id: /api/courses.php?id=123
app.delete('/api/courses.php', async (req, res) => {
  try {
    const id = req.query.id;
    if (!id) return res.status(400).json({ success: false, message: 'id is required' });

    if (dbType === 'mysql') {
      await dbClient.execute('DELETE FROM courses WHERE id = ?', [id]);
    } else {
      await dbClient.run('DELETE FROM courses WHERE id = ?', [id]);
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/gallery.php', async (req, res) => {
  try {
    const rows = await queryAll('SELECT * FROM gallery');
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Create gallery item
// Handle gallery POSTs. If `?upload=1` is provided expect a multipart upload
// with field `image_file` and optional `title` in the body. We convert file
// to base64 and store it in DB (no local file writes). For regular JSON
// POSTs (no upload query) the existing behavior (title+image) is supported.
app.post('/api/gallery.php', upload.fields([{ name: 'image_file', maxCount: 1 }, { name: 'video_file', maxCount: 1 }]), async (req, res, next) => {
  try {
    // If upload=1, expect multipart/form-data with `image_file`
    if (req.query && String(req.query.upload) === '1') {
      // Title is optional for upload; admin UI may upload file first then set title.
      let title = req.body.title || '';

      // Either file was uploaded (image_file or video_file) or client sent `image` field as data URL
      let imageUrl = '';
      // multer.fields puts files into req.files as arrays
      if (req.files && req.files['image_file'] && req.files['image_file'][0]) {
        const f = req.files['image_file'][0];
        const uploadsDir = path.join(__dirname, 'php-admin', 'uploads', 'gallery');
        if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
        let ext = path.extname(f.originalname || '') || '';
        if (!ext) {
          const mime = (f.mimetype || '').split('/')[1] || '';
          if (mime) ext = '.' + mime.replace(/[^a-z0-9]/gi, '');
        }
        const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
        const outPath = path.join(uploadsDir, filename);
        fs.writeFileSync(outPath, f.buffer);
        if (!title && f.originalname) title = f.originalname;
        imageUrl = `/uploads/gallery/${filename}`;
      } else if (req.files && req.files['video_file'] && req.files['video_file'][0]) {
        // uploaded video file — save to uploads/videos and return URL for frontend to set video_url
        const f = req.files['video_file'][0];
        const uploadsDir = path.join(__dirname, 'php-admin', 'uploads', 'videos');
        if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
        let ext = path.extname(f.originalname || '') || '';
        if (!ext) {
          const mime = (f.mimetype || '').split('/')[1] || '';
          if (mime) ext = '.' + mime.replace(/[^a-z0-9]/gi, '');
        }
        const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
        const outPath = path.join(uploadsDir, filename);
        fs.writeFileSync(outPath, f.buffer);
        imageUrl = `/uploads/videos/${filename}`;
      } else if (req.body.image) {
        // Client provided an image string (data URL or existing URL) — store as-is
        imageUrl = req.body.image;
      }

      if (!imageUrl) return res.status(400).json({ success: false, message: 'image is required' });

      const category = req.body.category || '';
      const sort_order = req.body.sort_order || 0;
      const status = req.body.status || 'Active';

      if (dbType === 'mysql') {
        const [result] = await dbClient.execute(
          'INSERT INTO gallery (title, image, category, sort_order, status, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
          [title, imageUrl, category, sort_order, status]
        );
        const insertId = result.insertId || null;
        // Return url so frontend sets blog.image = url
        return res.json({ success: true, id: insertId, url: imageUrl });
      } else {
        const result = await dbClient.run(
          'INSERT INTO gallery (title, image, category, sort_order, status, created_at) VALUES (?, ?, ?, ?, ?, datetime("now"))',
          [title, imageUrl, category, sort_order, status]
        );
        const insertId = result.lastID || null;
        return res.json({ success: true, id: insertId, url: imageUrl });
      }
    }

    // Not an upload request — pass through to the JSON handler defined below
    return next();
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

  // Create gallery item (JSON body) — accepts `{ title, image, category, sort_order, status }`
  app.post('/api/gallery.php', async (req, res) => {
    try {
      const { title, image, category, sort_order, status } = req.body || {};
      if (!image) return res.status(400).json({ success: false, message: 'image is required' });

      if (dbType === 'mysql') {
        const [result] = await dbClient.execute(
          'INSERT INTO gallery (title, image, category, sort_order, status, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
          [title || '', image || '', category || '', sort_order || 0, status || 'Active']
        );
        const insertId = result.insertId || null;
        return res.json({ success: true, id: insertId, url: image });
      } else {
        const result = await dbClient.run(
          'INSERT INTO gallery (title, image, category, sort_order, status, created_at) VALUES (?, ?, ?, ?, ?, datetime("now"))',
          [title || '', image || '', category || '', sort_order || 0, status || 'Active']
        );
        const insertId = result.lastID || null;
        return res.json({ success: true, id: insertId, url: image });
      }
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

// Update gallery item (expects JSON body with `id`)
app.put('/api/gallery.php', async (req, res) => {
  try {
    const { id, title, image, category, sort_order, status } = req.body;
    if (!id) return res.status(400).json({ success: false, message: 'id is required' });
    // Update all provided fields (simple approach)
    if (dbType === 'mysql') {
      await dbClient.execute(
        'UPDATE gallery SET title = ?, image = ?, category = ?, sort_order = ?, status = ? WHERE id = ?',
        [title || null, image || null, category || null, sort_order || 0, status || null, id]
      );
    } else {
      await dbClient.run(
        'UPDATE gallery SET title = ?, image = ?, category = ?, sort_order = ?, status = ? WHERE id = ?',
        [title || null, image || null, category || null, sort_order || 0, status || null, id]
      );
    }
    const updated = await queryOne('SELECT * FROM gallery WHERE id = ?', [id]);
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Delete a gallery item by id: /api/gallery.php?id=123
app.delete('/api/gallery.php', async (req, res) => {
  try {
    const id = req.query.id;
    if (!id) return res.status(400).json({ success: false, message: 'id is required' });

    // Try to remove the uploaded file from disk if it points to /uploads/
    try {
      const row = await queryOne('SELECT * FROM gallery WHERE id = ?', [id]);
      if (row && row.image) {
        let img = row.image || '';
        img = img.replace(/\\\\/g, '/');
        // Normalize any php-admin prefix
        img = img.replace(/^php-admin\//, '');
        // If the image refers to uploads path, convert to local path
        const uploadsIndex = img.indexOf('/uploads/');
        let localPath = null;
        if (uploadsIndex !== -1) {
          const rel = img.slice(uploadsIndex + 1); // remove leading '/'
          localPath = path.join(__dirname, rel);
        } else if (img.startsWith('uploads/') || img.startsWith('php-admin/uploads/')) {
          localPath = path.join(__dirname, img.replace(/^php-admin\//, ''));
        }
        if (localPath && fs.existsSync(localPath)) {
          try { fs.unlinkSync(localPath); } catch (e) { /* ignore file deletion errors */ }
        }
      }
    } catch (err) {
      // ignore errors when trying to delete file, continue with DB deletion
    }

    if (dbType === 'mysql') {
      await dbClient.execute('DELETE FROM gallery WHERE id = ?', [id]);
    } else {
      await dbClient.run('DELETE FROM gallery WHERE id = ?', [id]);
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/partners.php', async (req, res) => {
  try {
    const rows = await queryAll('SELECT * FROM partners');
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Create a partner. Supports multipart file upload when `?upload=1` (field
// `image_file`) or regular JSON body. This maps input `url` -> DB `website`
// and `image` -> DB `logo` so legacy clients continue to work.
app.post('/api/partners.php', upload.single('image_file'), async (req, res) => {
  try {
    // If upload=1, expect multipart/form-data with `image_file` and optional fields
    if (req.query && String(req.query.upload) === '1') {
      let name = req.body.name || '';
      let website = req.body.website || req.body.url || '';
      let description = req.body.description || '';
      let sort_order = req.body.sort_order || 0;
      let status = req.body.status || 'Active';
      let logoPath = '';

      if (req.file && req.file.buffer) {
        const uploadsDir = path.join(__dirname, 'php-admin', 'uploads', 'partners');
        if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
        let ext = path.extname(req.file.originalname || '') || '';
        if (!ext) {
          const mime = (req.file.mimetype || '').split('/')[1] || '';
          if (mime) ext = '.' + mime.replace(/[^a-z0-9]/gi, '');
        }
        const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
        const outPath = path.join(uploadsDir, filename);
        fs.writeFileSync(outPath, req.file.buffer);
        if (!name && req.file.originalname) name = req.file.originalname;
        logoPath = `/uploads/partners/${filename}`;
      }

      if (dbType === 'mysql') {
        const [result] = await dbClient.execute(
          'INSERT INTO partners (name, logo, website, description, sort_order, status, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
          [name, logoPath, website, description, sort_order, status]
        );
        const insertId = result.insertId || null;
        return res.json({ success: true, id: insertId, logo: logoPath });
      } else {
        const result = await dbClient.run(
          'INSERT INTO partners (name, logo, website, description, sort_order, status, created_at) VALUES (?, ?, ?, ?, ?, ?, datetime("now"))',
          [name, logoPath, website, description, sort_order, status]
        );
        const insertId = result.lastID || null;
        return res.json({ success: true, id: insertId, logo: logoPath });
      }
    }

    // Regular JSON POST — accept either `website` or legacy `url`, and `logo` or `image`.
    const body = req.body || {};
    const name = body.name;
    const website = body.website || body.url || '';
    const description = body.description || '';
    let logo = body.logo || body.image || '';
    const sort_order = body.sort_order || 0;
    const status = body.status || 'Active';

    if (!name) return res.status(400).json({ success: false, message: 'name is required' });

    // If client sent a data URL (base64) for the logo or very large string,
    // save it to disk and store a URL instead of writing long data into DB.
    let logoPath = '';
    try {
      if (typeof logo === 'string' && (logo.startsWith('data:') || logo.length > 2000)) {
        const m = /^data:([a-zA-Z0-9\-\/]+);base64,(.*)$/.exec(logo);
        let buf = null;
        let ext = '';
        if (m) {
          const mime = m[1];
          const b64 = m[2];
          buf = Buffer.from(b64, 'base64');
          const mimeExt = mime.split('/')[1] || 'bin';
          ext = '.' + mimeExt.replace(/[^a-z0-9]/gi, '');
        } else {
          // fallback: treat entire string as base64
          try { buf = Buffer.from(logo, 'base64'); ext = '.bin'; } catch (e) { buf = null; }
        }
        if (buf) {
          const uploadsDir = path.join(__dirname, 'php-admin', 'uploads', 'partners');
          if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
          const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
          const outPath = path.join(uploadsDir, filename);
          fs.writeFileSync(outPath, buf);
          logoPath = `/uploads/partners/${filename}`;
          logo = logoPath;
        }
      }
    } catch (e) {
      // ignore and fall back to inserting raw value (DB may reject if too long)
    }

    if (dbType === 'mysql') {
      const [result] = await dbClient.execute(
        'INSERT INTO partners (name, logo, website, description, sort_order, status, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
        [name || '', logo || '', website || '', description || '', sort_order || 0, status || 'Active']
      );
      const insertId = result.insertId || null;
      res.json({ success: true, id: insertId });
    } else {
      const result = await dbClient.run(
        'INSERT INTO partners (name, logo, website, description, sort_order, status, created_at) VALUES (?, ?, ?, ?, ?, ?, datetime("now"))',
        [name || '', logo || '', website || '', description || '', sort_order || 0, status || 'Active']
      );
      const insertId = result.lastID || null;
      res.json({ success: true, id: insertId });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Update an existing partner. Pass `id` as query param and JSON body with
// fields to update (e.g., `name`, `url`, `image`, `sort_order`, `status`).
app.put('/api/partners.php', async (req, res) => {
  try {
    const id = req.query.id;
    if (!id) return res.status(400).json({ success: false, message: 'id is required' });
    const body = req.body || {};
    const name = body.name;
    const website = body.website !== undefined ? body.website : (body.url !== undefined ? body.url : undefined);
    let logo = body.logo !== undefined ? body.logo : (body.image !== undefined ? body.image : undefined);
    const sort_order = body.sort_order;
    const status = body.status;

    // If client sent large base64 logo in update, save to disk and update value
    try {
      if (typeof logo === 'string' && (logo.startsWith('data:') || logo.length > 2000)) {
        const m = /^data:([a-zA-Z0-9\-\/]+);base64,(.*)$/.exec(logo);
        let buf = null;
        let ext = '';
        if (m) {
          const mime = m[1];
          const b64 = m[2];
          buf = Buffer.from(b64, 'base64');
          const mimeExt = mime.split('/')[1] || 'bin';
          ext = '.' + mimeExt.replace(/[^a-z0-9]/gi, '');
        } else {
          try { buf = Buffer.from(logo, 'base64'); ext = '.bin'; } catch (e) { buf = null; }
        }
        if (buf) {
          const uploadsDir = path.join(__dirname, 'php-admin', 'uploads', 'partners');
          if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
          const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
          const outPath = path.join(uploadsDir, filename);
          fs.writeFileSync(outPath, buf);
          logo = `/uploads/partners/${filename}`;
        }
      }
    } catch (e) {
      // ignore and continue
    }

    const updates = [];
    const params = [];
    if (name !== undefined) { updates.push('name = ?'); params.push(name); }
    if (website !== undefined) { updates.push('website = ?'); params.push(website); }
    if (logo !== undefined) { updates.push('logo = ?'); params.push(logo); }
    if (sort_order !== undefined) { updates.push('sort_order = ?'); params.push(sort_order); }
    if (status !== undefined) { updates.push('status = ?'); params.push(status); }

    if (updates.length === 0) return res.status(400).json({ success: false, message: 'no fields to update' });

    params.push(id);
    const sql = `UPDATE partners SET ${updates.join(', ')} WHERE id = ?`;

    if (dbType === 'mysql') {
      await dbClient.execute(sql, params);
    } else {
      await dbClient.run(sql, params);
    }

    const updated = await queryOne('SELECT * FROM partners WHERE id = ?', [id]);
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Delete a partner by id: /api/partners.php?id=123
app.delete('/api/partners.php', async (req, res) => {
  try {
    const id = req.query.id;
    if (!id) return res.status(400).json({ success: false, message: 'id is required' });

    // Try to remove the uploaded logo file from disk if it points to /uploads/
    try {
      const row = await queryOne('SELECT * FROM partners WHERE id = ?', [id]);
      if (row && row.logo) {
        let logo = row.logo || '';
        logo = logo.replace(/\\/g, '/');
        const uploadsIndex = logo.indexOf('/uploads/');
        let localPath = null;
        if (uploadsIndex !== -1) {
          const rel = logo.slice(uploadsIndex + 1); // remove leading '/'
          localPath = path.join(__dirname, rel);
        } else if (logo.startsWith('uploads/') || logo.startsWith('php-admin/uploads/')) {
          localPath = path.join(__dirname, logo.replace(/^php-admin\//, ''));
        }
        if (localPath && fs.existsSync(localPath)) {
          try { fs.unlinkSync(localPath); } catch (e) { /* ignore file deletion errors */ }
        }
      }
    } catch (err) {
      // ignore errors when trying to delete file, continue with DB deletion
    }

    if (dbType === 'mysql') {
      await dbClient.execute('DELETE FROM partners WHERE id = ?', [id]);
    } else {
      await dbClient.run('DELETE FROM partners WHERE id = ?', [id]);
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/blogs.php', async (req, res) => {
  try {
    const rows = await queryAll('SELECT * FROM blogs');
    // Convert local upload image paths to base64 data URLs so frontend can
    // display images without needing cross-origin requests to another port.
    const mapped = await Promise.all(rows.map(async (r) => {
      const item = Object.assign({}, r);
      try {
        const img = item.image || '';
        if (img) {
          let localPath = null;
          if (/^https?:\/\//i.test(img)) {
            try {
              const u = new URL(img);
              // If URL path includes uploads, map to php-admin uploads
              const idx = u.pathname.indexOf('/uploads/');
              if (idx !== -1) {
                const rel = u.pathname.slice(idx + 1); // remove leading '/'
                localPath = path.join(__dirname, rel);
              }
            } catch (err) {
              localPath = null;
            }
          } else {
            const idx = img.indexOf('/uploads/');
            if (idx !== -1) {
              const rel = img.slice(idx + 1); // 'uploads/...'
              localPath = path.join(__dirname, rel);
            } else if (img.startsWith('php-admin')) {
              localPath = path.join(__dirname, img);
            }
          }

          if (localPath && fs.existsSync(localPath)) {
            try {
              const buf = fs.readFileSync(localPath);
              const ext = path.extname(localPath).toLowerCase();
              const mimeMap = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.webp': 'image/webp' };
              const mime = mimeMap[ext] || 'application/octet-stream';
              item.image = `data:${mime};base64,${buf.toString('base64')}`;
            } catch (err) {
              // leave image as-is on read error
            }
          }
        }
      } catch (err) {
        // ignore per-item errors
      }
      return item;
    }));

    res.json({ success: true, data: mapped });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Create a blog post. Accepts JSON body with fields: title, content, excerpt,
// image (can be a data:<mime>;base64,... string), author, category, status.
app.post('/api/blogs.php', async (req, res) => {
  try {
    const { title, content, excerpt, image, author, category, status } = req.body;
    // Title is required for a blog post; image is optional (can be uploaded separately).
    if (!title) return res.status(400).json({ success: false, message: 'title is required' });

    if (dbType === 'mysql') {
      const [result] = await dbClient.execute(
        'INSERT INTO blogs (title, content, excerpt, image, author, category, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())',
        [title, content || '', excerpt || '', image || '', author || '', category || '', status || 'Published']
      );
      const insertId = result.insertId || null;
      res.json({ success: true, id: insertId });
    } else {
      const result = await dbClient.run(
        'INSERT INTO blogs (title, content, excerpt, image, author, category, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, datetime("now"))',
        [title, content || '', excerpt || '', image || '', author || '', category || '', status || 'Published']
      );
      const insertId = result.lastID || null;
      res.json({ success: true, id: insertId });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Update an existing blog post. Pass `id` as query param and JSON body with
// fields to update. If `image` is provided and is a data URL it will be
// stored directly in the DB.
app.put('/api/blogs.php', async (req, res) => {
  try {
    const id = req.query.id;
    if (!id) return res.status(400).json({ success: false, message: 'id is required' });
    const { title, content, excerpt, image, author, category, status } = req.body;

    // Build simple update - set fields provided
    const updates = [];
    const params = [];
    if (title !== undefined) { updates.push('title = ?'); params.push(title); }
    if (content !== undefined) { updates.push('content = ?'); params.push(content); }
    if (excerpt !== undefined) { updates.push('excerpt = ?'); params.push(excerpt); }
    if (image !== undefined) { updates.push('image = ?'); params.push(image); }
    if (author !== undefined) { updates.push('author = ?'); params.push(author); }
    if (category !== undefined) { updates.push('category = ?'); params.push(category); }
    if (status !== undefined) { updates.push('status = ?'); params.push(status); }

    if (updates.length === 0) return res.status(400).json({ success: false, message: 'no fields to update' });

    params.push(id);
    const sql = `UPDATE blogs SET ${updates.join(', ')} WHERE id = ?`;

    if (dbType === 'mysql') {
      await dbClient.execute(sql, params);
      const updated = await queryOne('SELECT * FROM blogs WHERE id = ?', [id]);
      res.json({ success: true, data: updated });
    } else {
      await dbClient.run(sql, params);
      const updated = await queryOne('SELECT * FROM blogs WHERE id = ?', [id]);
      res.json({ success: true, data: updated });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Delete a blog post by id: /api/blogs.php?id=123
app.delete('/api/blogs.php', async (req, res) => {
  try {
    const id = req.query.id;
    if (!id) return res.status(400).json({ success: false, message: 'id is required' });

    if (dbType === 'mysql') {
      await dbClient.execute('DELETE FROM blogs WHERE id = ?', [id]);
    } else {
      await dbClient.run('DELETE FROM blogs WHERE id = ?', [id]);
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/videos.php', async (req, res) => {
  try {
    const rows = await queryAll('SELECT * FROM videos');
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Create a video. Supports multipart thumbnail upload (field `thumbnail_file`)
// or JSON `thumbnail` (URL or data URL), plus `title, description, video_url, category, duration, status`.
app.post('/api/videos.php', upload.fields([{ name: 'thumbnail_file', maxCount: 1 }, { name: 'image_file', maxCount: 1 }, { name: 'video_file', maxCount: 1 }]), async (req, res) => {
  try {
    // If a multipart upload with thumbnail_file was used, save and use it
    let thumbnail = '';
    if (req.query && String(req.query.upload) === '1') {
      // Accept multipart/form-data with optional fields
      const title = req.body.title || '';
      const description = req.body.description || '';
      const video_url = req.body.video_url || '';
      const category = req.body.category || '';
      const duration = req.body.duration || '';
      const status = req.body.status || 'Active';

      if (req.file && req.file.buffer) {
        const uploadsDir = path.join(__dirname, 'php-admin', 'uploads', 'videos');
        if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
        let ext = path.extname(req.file.originalname || '') || '';
        if (!ext) {
          const mime = (req.file.mimetype || '').split('/')[1] || '';
          if (mime) ext = '.' + mime.replace(/[^a-z0-9]/gi, '');
        }
        const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
        const outPath = path.join(uploadsDir, filename);
        fs.writeFileSync(outPath, req.file.buffer);
        thumbnail = `/uploads/videos/${filename}`;
      }

      if (dbType === 'mysql') {
        const [result] = await dbClient.execute(
          'INSERT INTO videos (title, description, video_url, thumbnail, category, duration, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())',
          [title, description, video_url, thumbnail, category, duration, status]
        );
        const insertId = result.insertId || null;
        return res.json({ success: true, id: insertId, thumbnail });
      } else {
        const result = await dbClient.run(
          'INSERT INTO videos (title, description, video_url, thumbnail, category, duration, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, datetime("now"))',
          [title, description, video_url, thumbnail, category, duration, status]
        );
        const insertId = result.lastID || null;
        return res.json({ success: true, id: insertId, thumbnail });
      }
    }

    // Regular JSON POST
    const { title, description, video_url, thumbnail: thumbField, category, duration, status } = req.body || {};
    if (!title) return res.status(400).json({ success: false, message: 'title is required' });

    let finalThumbnail = thumbField || '';
    // If thumbnail is a data URL or very long, save to disk and use URL
    try {
      if (typeof finalThumbnail === 'string' && (finalThumbnail.startsWith('data:') || finalThumbnail.length > 2000)) {
        const m = /^data:([a-zA-Z0-9\-\/]+);base64,(.*)$/.exec(finalThumbnail);
        let buf = null;
        let ext = '';
        if (m) {
          const mime = m[1];
          const b64 = m[2];
          buf = Buffer.from(b64, 'base64');
          const mimeExt = mime.split('/')[1] || 'bin';
          ext = '.' + mimeExt.replace(/[^a-z0-9]/gi, '');
        } else {
          try { buf = Buffer.from(finalThumbnail, 'base64'); ext = '.bin'; } catch (e) { buf = null; }
        }
        if (buf) {
          const uploadsDir = path.join(__dirname, 'php-admin', 'uploads', 'videos');
          if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
          const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
          const outPath = path.join(uploadsDir, filename);
          fs.writeFileSync(outPath, buf);
          finalThumbnail = `/uploads/videos/${filename}`;
        }
      }
    } catch (e) {
      // continue with original value if saving fails
    }

    if (dbType === 'mysql') {
      const [result] = await dbClient.execute(
        'INSERT INTO videos (title, description, video_url, thumbnail, category, duration, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())',
        [title || '', description || '', video_url || '', finalThumbnail || '', category || '', duration || '', status || 'Active']
      );
      const insertId = result.insertId || null;
      res.json({ success: true, id: insertId });
    } else {
      const result = await dbClient.run(
        'INSERT INTO videos (title, description, video_url, thumbnail, category, duration, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, datetime("now"))',
        [title || '', description || '', video_url || '', finalThumbnail || '', category || '', duration || '', status || 'Active']
      );
      const insertId = result.lastID || null;
      res.json({ success: true, id: insertId });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Delete a video by id: /api/videos.php?id=123
app.delete('/api/videos.php', async (req, res) => {
  try {
    const id = req.query.id;
    if (!id) return res.status(400).json({ success: false, message: 'id is required' });

    // Attempt to delete any local thumbnail file referenced in the record
    try {
      const row = await queryOne('SELECT * FROM videos WHERE id = ?', [id]);
      if (row && row.thumbnail) {
        let thumb = row.thumbnail || '';
        thumb = thumb.replace(/\\/g, '/');
        const uploadsIndex = thumb.indexOf('/uploads/');
        let localPath = null;
        if (uploadsIndex !== -1) {
          const rel = thumb.slice(uploadsIndex + 1);
          localPath = path.join(__dirname, rel);
        } else if (thumb.startsWith('uploads/') || thumb.startsWith('php-admin/uploads/')) {
          localPath = path.join(__dirname, thumb.replace(/^php-admin\//, ''));
        }
        if (localPath && fs.existsSync(localPath)) {
          try { fs.unlinkSync(localPath); } catch (e) { /* ignore */ }
        }
      }
    } catch (e) {
      // ignore thumbnail deletion errors
    }

    if (dbType === 'mysql') {
      await dbClient.execute('DELETE FROM videos WHERE id = ?', [id]);
    } else {
      await dbClient.run('DELETE FROM videos WHERE id = ?', [id]);
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/stats.php', async (req, res) => {
  try {
    const totalCourses = await queryOne('SELECT COUNT(*) AS c FROM courses');
    const totalStudents = await queryOne('SELECT COUNT(*) AS c FROM students');
    const totalVideos = await queryOne('SELECT COUNT(*) AS c FROM videos');
    res.json({
      success: true,
      data: {
        totalCourses: totalCourses ? totalCourses.c : 0,
        totalStudents: totalStudents ? totalStudents.c : 0,
        totalVideos: totalVideos ? totalVideos.c : 0
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Simple queries endpoint (list + submit)
app.get('/api/queries.php', async (req, res) => {
  try {
    const rows = await queryAll('SELECT * FROM queries ORDER BY created_at DESC');
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/queries.php', async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;
    if (!name || !email || !message) return res.status(400).json({ success: false, message: 'name, email and message required' });
    if (dbType === 'mysql') {
      await dbClient.execute('INSERT INTO queries (name, email, phone, subject, message, status) VALUES (?, ?, ?, ?, ?, ?)', [name, email, phone || '', subject || '', message, 'Pending']);
    } else {
      await dbClient.run('INSERT INTO queries (name, email, phone, subject, message, status, created_at) VALUES (?, ?, ?, ?, ?, ?, datetime("now"))', [name, email, phone || '', subject || '', message, 'Pending']);
    }
    res.json({ success: true, message: 'Query submitted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Login: verify against admins table using bcryptjs if possible
const bcrypt = require('bcryptjs');
app.post('/api/login.php', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: 'email and password required' });
    const row = await queryOne('SELECT * FROM admins WHERE email = ?', [email]);
    if (!row) return res.status(401).json({ success: false, message: 'Invalid credentials' });
    const hashed = row.password;
    const ok = hashed ? bcrypt.compareSync(password, hashed) : false;
    if (ok) {
      res.json({ success: true, adminId: row.id, message: 'Login successful' });
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/change-password.php', async (req, res) => {
  try {
    const { email, oldPassword, newPassword } = req.body;
    if (!email || !oldPassword || !newPassword) return res.status(400).json({ success: false, message: 'email, oldPassword and newPassword required' });
    const row = await queryOne('SELECT * FROM admins WHERE email = ?', [email]);
    if (!row) return res.status(404).json({ success: false, message: 'Admin not found' });
    const ok = bcrypt.compareSync(oldPassword, row.password);
    if (!ok) return res.status(401).json({ success: false, message: 'Old password incorrect' });
    const newHash = bcrypt.hashSync(newPassword, 10);
    if (dbType === 'mysql') {
      await dbClient.execute('UPDATE admins SET password = ? WHERE id = ?', [newHash, row.id]);
    } else {
      await dbClient.run('UPDATE admins SET password = ? WHERE id = ?', [newHash, row.id]);
    }
    res.json({ success: true, message: 'Password changed successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/certificates.php', async (req, res) => {
  try {
    const rows = await queryAll('SELECT * FROM certificates');
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/auth-check.php', async (req, res) => {
  // Simple endpoint; you can expand with JWT/session checks
  res.json({ success: true, authenticated: true });
});

// Start server after DB init
initDb().then(async () => {
  // If running with MySQL, ensure `logo` column can hold long base64 strings.
  if (dbType === 'mysql') {
    try {
      await dbClient.execute('ALTER TABLE partners MODIFY logo LONGTEXT');
      console.log('Ensured partners.logo is LONGTEXT');
    } catch (e) {
      // ignore: either column already large enough or ALTER not permitted
    }
  }

  app.listen(PORT, () => {
    console.log(`🚀 Backend server running at http://localhost:${PORT}`);
    console.log('Available endpoints:');
    console.log('  GET  /api/health');
    console.log('  GET  /api/hero-sliders.php');
    console.log('  GET  /api/courses.php');
    console.log('  GET  /api/gallery.php');
    console.log('  GET  /api/partners.php');
    console.log('  GET  /api/blogs.php');
    console.log('  GET  /api/videos.php');
    console.log('  GET  /api/stats.php');
    console.log('  POST /api/login.php');
    console.log('  GET  /api/queries.php');
    console.log('  POST /api/queries.php');
    console.log('  POST /api/change-password.php');
    console.log('  GET  /api/certificates.php');
    console.log('  GET  /api/auth-check.php');
    console.log('DB type:', dbType);
  });
}).catch(err => {
  console.error('Failed to initialize DB:', err.message);
  process.exit(1);
});

