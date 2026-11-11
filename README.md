# 🎓 Sistem Pendaftaran Penerimaan Murid Baru (SPMB) Madrasah Aliyah

Sistem aplikasi web modern untuk proses pendaftaran calon siswa baru di Madrasah Aliyah menggunakan Multi Step Form, validasi lengkap, dan AI Agent chatbot.

## 📋 Daftar Isi

- [Fitur Utama](#fitur-utama)
- [Teknologi](#teknologi)
- [Struktur Proyek](#struktur-proyek)
- [Setup & Instalasi](#setup--instalasi)
- [Panduan Menggunakan](#panduan-menggunakan)
- [API Documentation](#api-documentation)
- [Database](#database)

---

## ✨ Fitur Utama

### Frontend Features
- ✅ Multi Step Form (7 steps) dengan Progress Indicator
- ✅ Auto-Save Form Data setiap 3 detik
- ✅ Validasi Real-time per field
- ✅ File Upload dengan Drag & Drop
- ✅ Preview Dokumen
- ✅ Responsive Design (Mobile, Tablet, Desktop)
- ✅ Smooth Animations & Transitions
- ✅ AI Agent Floating Chat seperti WhatsApp
- ✅ Dashboard Calon Siswa
- ✅ Status Tracking Pendaftaran

### Backend Features
- ✅ RESTful API dengan Express.js
- ✅ Authentication dengan JWT
- ✅ Password Hashing dengan Bcrypt
- ✅ File Upload Management
- ✅ Input Validation lengkap
- ✅ Error Handling & Logging
- ✅ CORS Configuration
- ✅ Database Connection Pooling

### AI Agent Features
- ✅ Chatbot dengan Gemini API
- ✅ Fallback Responses
- ✅ Chat History Management
- ✅ Real-time Messaging
- ✅ Contextual Answers

---

## 🛠 Teknologi

### Frontend
- **React 18** - UI Library
- **Vite** - Build Tool
- **Tailwind CSS** - Styling
- **Axios** - HTTP Client
- **Zustand** - State Management
- **React Hot Toast** - Notifications
- **React Icons** - Icon Library

### Backend
- **Node.js** - Runtime
- **Express.js** - Web Framework
- **MySQL 2** - Database Driver
- **JWT** - Authentication
- **Bcrypt** - Password Hashing
- **Multer** - File Upload
- **Axios** - HTTP Client for APIs

### Database
- **MySQL 8.0+** - Relational Database

---

## 📁 Struktur Proyek

```
Ma/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── formController.js
│   │   │   ├── documentController.js
│   │   │   ├── aiAgentController.js
│   │   │   └── dashboardController.js
│   │   ├── models/
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── formRoutes.js
│   │   │   ├── documentRoutes.js
│   │   │   ├── aiAgentRoutes.js
│   │   │   └── dashboardRoutes.js
│   │   ├── middleware/
│   │   │   └── auth.js
│   │   ├── utils/
│   │   │   ├── jwt.js
│   │   │   ├── validators.js
│   │   │   └── errors.js
│   │   └── server.js
│   ├── uploads/
│   ├── database.sql
│   ├── package.json
│   ├── .env
│   └── .gitignore
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── FormSPMB/
│   │   │   │   ├── StepIndicator.jsx
│   │   │   │   ├── Step1Registration.jsx
│   │   │   │   ├── Step2PersonalData.jsx
│   │   │   │   ├── Step3ParentData.jsx
│   │   │   │   ├── Step4SchoolData.jsx
│   │   │   │   ├── Step5UploadDocuments.jsx
│   │   │   │   ├── Step6ReviewConfirmation.jsx
│   │   │   │   └── Step7SuccessPage.jsx
│   │   │   └── Common/
│   │   │       └── AIAgentChat.jsx
│   │   ├── context/
│   │   │   └── store.js (Zustand Stores)
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── styles/
│   │   │   └── index.css
│   │   ├── utils/
│   │   │   ├── api.js
│   │   │   └── validation.js
│   │   ├── assets/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── public/
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── package.json
│   ├── .env
│   └── .gitignore
│
└── logo_ma.jpg
```

---

## 🚀 Setup & Instalasi

### Prerequisites
- Node.js v16+ & npm
- MySQL Server 8.0+
- Git
- XAMPP (untuk MySQL lokal)

### 1️⃣ Database Setup

1. Buka phpMyAdmin di http://localhost/phpmyadmin
2. Buat database baru: `spmb_madrasah`
3. Import file `backend/database.sql` ke database
4. Verifikasi tabel sudah dibuat

```bash
# Atau via MySQL CLI
mysql -u root -p
CREATE DATABASE spmb_madrasah;
USE spmb_madrasah;
SOURCE ./backend/database.sql;
```

### 2️⃣ Backend Setup

```bash
# Navigate ke folder backend
cd backend

# Install dependencies
npm install

# Copy dan edit .env file
cp .env.example .env
# Edit .env dengan konfigurasi lokal Anda

# Start development server
npm run dev
# Server akan berjalan di http://localhost:5000
```

**Konfigurasi .env Backend:**
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=spmb_madrasah
JWT_SECRET=your_secret_key_here
AI_API_KEY=your_gemini_api_key_here
```

### 3️⃣ Frontend Setup

```bash
# Navigate ke folder frontend
cd frontend

# Install dependencies
npm install

# Copy dan edit .env file
cp .env.example .env

# Start development server
npm run dev
# Frontend akan berjalan di http://localhost:5173
```

**Konfigurasi .env Frontend:**
```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=SPMB Madrasah Aliyah
```

### 4️⃣ Build untuk Production

```bash
# Frontend
cd frontend
npm run build
# Output: dist/

# Serve backend
cd backend
npm run start
```

---

## 📖 Panduan Menggunakan

### Alur Pendaftaran (Calon Siswa)

1. **Step 1 - Registrasi Akun**
   - Input: Nama, Email, WhatsApp, Password
   - Validasi: Email unik, password minimal 8 karakter
   - Output: Akun terbuat, token JWT tersimpan

2. **Step 2 - Data Pribadi**
   - Input: NISN, NIK, Nama, Gender, TTL, Agama, Alamat
   - Fitur: Auto-save setiap 3 detik
   - Output: Data tersimpan di database

3. **Step 3 - Data Orang Tua**
   - Input: Data Ayah, Ibu, Wali, Penghasilan
   - Output: Data orang tua tersimpan

4. **Step 4 - Data Sekolah Asal**
   - Input: Nama, NPSN, Alamat, Tahun Lulus, Jurusan
   - Output: Data sekolah tersimpan

5. **Step 5 - Upload Dokumen**
   - Dokumen: Pas Foto, KK, Akta, Raport, SKL/Ijazah
   - Fitur: Drag & drop, preview, progress bar
   - Output: File tersimpan di `uploads/`

6. **Step 6 - Review & Konfirmasi**
   - Review: Seluruh data yang diisi
   - Konfirmasi: Pernyataan kebenaran data
   - Output: Tombol Submit

7. **Step 7 - Sukses**
   - Info: Nomor pendaftaran, Status, Tanggal
   - Opsi: Download bukti, Dashboard, Chat AI

### AI Agent Chat

- Tekan tombol floating chat di pojok kanan bawah
- Tanya tentang: syarat, cara upload, jurusan, biaya, jadwal
- AI akan memberikan jawaban atau arahkan ke admin

---

## 🔌 API Documentation

### Authentication

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "full_name": "Nama Lengkap",
  "email": "email@example.com",
  "whatsapp": "0812345678",
  "password": "password123",
  "confirmPassword": "password123"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "email@example.com",
  "password": "password123"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer {token}
```

### Form Data

#### Save Personal Data
```http
POST /api/form/personal-data
Authorization: Bearer {token}
Content-Type: application/json

{
  "nisn": "1234567890",
  "nik": "1234567890123456",
  "full_name": "Nama Lengkap",
  "gender": "laki-laki",
  "birth_place": "Jakarta",
  "birth_date": "2006-01-15",
  "religion": "Islam",
  "full_address": "Jl. Contoh No. 123"
}
```

#### Get Personal Data
```http
GET /api/form/personal-data
Authorization: Bearer {token}
```

### Document Upload

#### Upload File
```http
POST /api/documents/upload
Authorization: Bearer {token}
Content-Type: multipart/form-data

Form Data:
- file: <binary file>
- document_type: photo|family_card|birth_certificate|report_card|diploma
```

#### Get Uploaded Documents
```http
GET /api/documents/list
Authorization: Bearer {token}
```

#### Submit Registration
```http
POST /api/documents/submit
Authorization: Bearer {token}
Content-Type: application/json

{
  "confirmation_agreed": true
}
```

### AI Agent

#### Send Message
```http
POST /api/ai-agent/message
Authorization: Bearer {token}
Content-Type: application/json

{
  "message": "Apa syarat pendaftaran?"
}
```

#### Get Chat History
```http
GET /api/ai-agent/history
Authorization: Bearer {token}
```

---

## 🗄 Database

### Tables

1. **users** - Data akun pendaftar
2. **personal_data** - Data pribadi siswa
3. **parent_data** - Data orang tua/wali
4. **school_data** - Data sekolah asal
5. **documents** - File dokumen upload
6. **revision_notes** - Catatan revisi dari admin
7. **chat_history** - Riwayat chat AI & support
8. **announcements** - Pengumuman SPMB
9. **admin_users** - Akun admin

### Relationships

```
users (1) ─── (1) personal_data
         ├─── (1) parent_data
         ├─── (1) school_data
         ├─── (N) documents
         ├─── (N) revision_notes
         └─── (N) chat_history
```

---

## 🐛 Troubleshooting

### Database Connection Error
```
Error: Can't connect to MySQL server
```
**Solution:**
- Pastikan MySQL server berjalan
- Check `DB_HOST`, `DB_USER`, `DB_PASSWORD` di .env
- Verifikasi database `spmb_madrasah` sudah dibuat

### CORS Error
```
Access to XMLHttpRequest has been blocked by CORS policy
```
**Solution:**
- Pastikan `FRONTEND_URL` di backend .env sesuai
- Check CORS middleware di `src/middleware/auth.js`
- Restart backend server

### File Upload Error
```
File type not allowed atau File too large
```
**Solution:**
- Pastikan file JPG, PNG, atau PDF
- Maksimal ukuran 5MB per file
- Check folder `uploads/` writable

### AI Agent Not Responding
```
AI API Error
```
**Solution:**
- Check `AI_API_KEY` di .env sudah benar
- Verify Gemini API quota & usage
- System akan fallback ke jawaban standar

---

## 📝 Fitur Lanjutan (Future)

- [ ] Admin Dashboard untuk verifikasi
- [ ] Payment Gateway Integration
- [ ] Email Notification System
- [ ] SMS Notification Gateway
- [ ] Print Bukti Pendaftaran (PDF)
- [ ] Test Online Terintegrasi
- [ ] Result Announcement System
- [ ] Mobile App (React Native)

---

## 📄 License

Private Project - Madrasah Aliyah

---

## 👥 Support

Untuk bantuan dan pertanyaan, hubungi:
- 📧 Email: spmb@madrasah.id
- 📱 WhatsApp: +62 812 345 678
- 💬 Chat AI: Gunakan fitur chat yang tersedia

---

**Dibuat dengan ❤️ untuk Madrasah Aliyah | v1.0.0**
