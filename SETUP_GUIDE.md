# 📚 Setup & Implementation Guide

## Panduan Lengkap Setup Sistem SPMB Madrasah Aliyah

---

## 1️⃣ Setup Awal (Pre-Installation)

### System Requirements
- **Windows 10/11** atau **Linux**
- **RAM:** Minimal 4GB
- **Disk Space:** 2GB
- **Node.js:** v16 LTS atau lebih tinggi
- **MySQL:** v8.0 atau lebih tinggi

### Install Prerequisites

#### Windows:

1. **Install Node.js**
   - Download: https://nodejs.org/ (LTS)
   - Run installer, accept terms
   - Verify: `node -v` dan `npm -v`

2. **XAMPP Setup**
   - Download: https://www.apachefriends.org/
   - Install di `C:\xampp`
   - Start Apache & MySQL dari Control Panel
   - Access phpMyAdmin: http://localhost/phpmyadmin

3. **Text Editor/IDE**
   - VS Code: https://code.visualstudio.com/
   - Extensions: ES7+ React/Redux, Thunder Client

---

## 2️⃣ Database Configuration

### Step-by-step MySQL Setup

1. **Buka phpMyAdmin**
   ```
   URL: http://localhost/phpmyadmin
   Username: root
   Password: (kosong)
   ```

2. **Buat Database**
   ```sql
   CREATE DATABASE spmb_madrasah CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

3. **Import Schema**
   - Buka database `spmb_madrasah`
   - Tab "Import"
   - Browse file `backend/database.sql`
   - Click "Go"

4. **Verify Tables**
   ```sql
   USE spmb_madrasah;
   SHOW TABLES;
   ```

   Harus ada 9 tabel:
   - users
   - personal_data
   - parent_data
   - school_data
   - documents
   - revision_notes
   - chat_history
   - announcements
   - admin_users

5. **Create Admin User**
   ```sql
   INSERT INTO admin_users (username, email, password, role) VALUES (
     'admin',
     'admin@madrasah.id',
     '$2a$10$...',  -- bcrypt hash dari "admin123"
     'super_admin'
   );
   ```

---

## 3️⃣ Backend Installation & Setup

### Step 1: Navigate to Backend
```bash
cd c:\xampp\htdocs\Ma\backend
```

### Step 2: Install Dependencies
```bash
npm install
```

Ini akan install:
- express (framework)
- mysql2 (database driver)
- dotenv (environment variables)
- bcryptjs (password hashing)
- jsonwebtoken (authentication)
- multer (file upload)
- axios (HTTP requests)
- cors (cross-origin)
- express-validator (validation)

### Step 3: Environment Variables
Edit `.env` file:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=spmb_madrasah
DB_PORT=3306

# JWT
JWT_SECRET=your_super_secret_key_change_in_production_abc123xyz
JWT_EXPIRY=7d

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_FOLDER=./uploads

# AI Agent
AI_API_KEY=your_gemini_api_key_here
AI_MODEL=gemini-pro

# Frontend
FRONTEND_URL=http://localhost:5173
```

### Step 4: Create Uploads Folder
```bash
mkdir uploads
```

### Step 5: Start Backend Server
```bash
npm run dev
```

**Expected Output:**
```
🚀 Server berjalan di http://localhost:5000
📝 Environment: development
```

### Step 6: Test Backend
Buka Terminal baru, test endpoint:
```bash
# Health check
curl http://localhost:5000/api/health

# Response
{"status":"OK","timestamp":"2026-05-11T..."}
```

---

## 4️⃣ Frontend Installation & Setup

### Step 1: Open New Terminal
```bash
cd c:\xampp\htdocs\Ma\frontend
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Environment Variables
Edit `.env` file:

```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=SPMB Madrasah Aliyah
```

### Step 4: Start Frontend Dev Server
```bash
npm run dev
```

**Expected Output:**
```
VITE v5.0.0  ready in 234 ms

➜  Local:   http://localhost:5173/
➜  Press h to show help
```

### Step 5: Access Application
Buka browser: **http://localhost:5173**

Harus melihat form SPMB dengan Step 1 - Registrasi Akun

---

## 5️⃣ Testing Application

### Test User Registration
1. Isi form Step 1:
   - Nama: Budi Santoso
   - Email: budi@example.com
   - WhatsApp: 081234567890
   - Password: Test123456
   - Confirm: Test123456

2. Klik "Lanjut ke Step Berikutnya"

3. Jika berhasil → Navigasi ke Step 2

### Check Database
```bash
# Terminal baru
mysql -u root spmb_madrasah
SELECT * FROM users;
```

### Check Backend Logs
Terminal backend akan menampilkan logs real-time:
```
GET /api/health 200 5.234ms
POST /api/auth/register 201 125.543ms
INSERT users: budi@example.com
```

---

## 6️⃣ Konfigurasi Advanced

### Custom Email Sender (Optional)
Tambah ke `.env` backend:
```env
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@madrasah.id
```

Implementasi di `controllers/authController.js`:
```javascript
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Send registration email
await transporter.sendMail({
  from: process.env.EMAIL_FROM,
  to: email,
  subject: 'Konfirmasi Pendaftaran SPMB',
  html: `...`
});
```

### Custom Branding
Edit `frontend/src/App.jsx`:
```javascript
// Ganti logo
<img src="/path/to/your/logo.png" alt="Logo" />

// Ganti colors di tailwind.config.js
colors: {
  primary: {
    600: '#your-color'
  }
}
```

### Database Backup
```bash
# Backup
mysqldump -u root spmb_madrasah > backup.sql

# Restore
mysql -u root spmb_madrasah < backup.sql
```

---

## 7️⃣ Production Deployment

### Build Frontend
```bash
cd frontend
npm run build
```

Output: `frontend/dist/`

### Deploy to Server

#### Option 1: Vercel (Frontend)
```bash
npm install -g vercel
vercel
```

#### Option 2: Railway/Heroku (Backend)
```bash
# Heroku
heroku create pmb-madrasah
heroku config:set NODE_ENV=production
git push heroku main
```

#### Option 3: Self-Hosted
```bash
# Build
npm run build

# Start with PM2
npm install -g pm2
pm2 start src/server.js --name pmb-api
pm2 save
pm2 startup

# Serve frontend with Nginx
```

### Update Environment for Production
Backend `.env`:
```env
NODE_ENV=production
JWT_SECRET=use-really-long-random-key
FRONTEND_URL=https://your-domain.com
```

---

## 🐛 Common Issues & Solutions

### Issue 1: "Can't connect to MySQL server"
```
Error: connect ECONNREFUSED 127.0.0.1:3306
```

**Solution:**
```bash
# Windows
# 1. Buka XAMPP Control Panel
# 2. Klik "Start" untuk MySQL
# 3. atau gunakan Services:
net start MySQL80
```

### Issue 2: "CORS Policy Error"
```
Access to XMLHttpRequest blocked by CORS
```

**Solution:**
```bash
# Pastikan backend .env:
FRONTEND_URL=http://localhost:5173

# Restart backend server
npm run dev
```

### Issue 3: "File upload fails"
```
MulterError: File too large
```

**Solution:**
```bash
# Check .env MAX_FILE_SIZE
# Maksimal 5MB = 5242880 bytes
# Update di formik validation

# Check folder permissions
chmod 755 uploads/
```

### Issue 4: "AI Agent tidak respond"
```
Error calling Gemini API
```

**Solution:**
```bash
# Verify API Key
echo $AI_API_KEY

# Test API
curl "https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=YOUR_KEY"

# Fallback akan aktif otomatis
```

### Issue 5: "Token expired / unauthorized"
```
401: Token tidak valid atau expired
```

**Solution:**
```javascript
// Frontend auto-login jika ada token lama:
const token = localStorage.getItem('token');
if (token) {
  checkAuth(); // verify dan refresh
}
```

---

## 📊 Monitoring & Maintenance

### Check Server Status
```bash
# Frontend health
curl http://localhost:5173/

# Backend health
curl http://localhost:5000/api/health

# Database status
mysql -u root -e "SELECT DATABASE();"
```

### View Logs
```bash
# Backend logs
tail -f backend/logs/app.log

# Database logs
tail -f /var/log/mysql/error.log  # Linux
# Windows: Event Viewer
```

### Performance Tips
1. Enable gzip compression
2. Use database indexes
3. Implement caching (Redis)
4. Optimize images
5. Use CDN for static files

---

## 🔐 Security Best Practices

### Password Security
```javascript
// Hash strength
const salt = await bcrypt.genSalt(10); // Minimal 10
const hash = await bcrypt.hash(password, salt);

// Min 8 characters, mix uppercase, lowercase, number
const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
```

### API Security
```javascript
// Rate limiting
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 100 // 100 requests
});
app.use('/api/', limiter);

// Input validation
const { body, validationResult } = require('express-validator');
```

### File Upload Security
```javascript
// Whitelist file types
const allowedMimes = ['image/jpeg', 'image/png', 'application/pdf'];

// Scan for malware (optional)
const NodeClam = require('clamscan');
```

---

## 📝 Next Steps

1. ✅ Database setup
2. ✅ Backend running
3. ✅ Frontend running
4. ⬜ Create admin dashboard
5. ⬜ Setup email notifications
6. ⬜ Deploy to production
7. ⬜ Monitor & maintain

---

**Last Updated: May 11, 2026**
**Version: 1.0.0**
