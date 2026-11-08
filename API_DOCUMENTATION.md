# 🔌 SPMB API Reference

## Base URL
```
Development: http://localhost:5000/api
Production: https://api.madrasah.id/api
```

## Authentication
Semua endpoint (kecuali register/login) memerlukan JWT token di header:
```
Authorization: Bearer {token}
```

---

## 📝 Authentication Endpoints

### 1. Register
Membuat akun baru untuk calon siswa

```http
POST /auth/register
Content-Type: application/json

{
  "full_name": "Budi Santoso",
  "email": "budi@example.com",
  "whatsapp": "0812345678",
  "password": "Password123",
  "confirmPassword": "Password123"
}
```

**Response Success (201):**
```json
{
  "success": true,
  "message": "Registrasi berhasil",
  "data": {
    "userId": 1,
    "registrationNumber": "SPMB-2026-001",
    "email": "budi@example.com",
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Response Error (400/409):**
```json
{
  "success": false,
  "message": "Email sudah terdaftar"
}
```

---

### 2. Login
Masuk ke akun yang sudah ada

```http
POST /auth/login
Content-Type: application/json

{
  "email": "budi@example.com",
  "password": "Password123"
}
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Login berhasil",
  "data": {
    "userId": 1,
    "email": "budi@example.com",
    "fullName": "Budi Santoso",
    "registrationNumber": "SPMB-2026-001",
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

---

### 3. Get Current User
Mendapatkan info user yang sedang login

```http
GET /auth/me
Authorization: Bearer {token}
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Data user berhasil diambil",
  "data": {
    "id": 1,
    "email": "budi@example.com",
    "full_name": "Budi Santoso",
    "registration_number": "SPMB-2026-001",
    "registration_status": "pending",
    "registration_date": "2026-05-11T10:30:00Z"
  }
}
```

---

### 4. Change Password
Mengubah password user

```http
POST /auth/change-password
Authorization: Bearer {token}
Content-Type: application/json

{
  "oldPassword": "Password123",
  "newPassword": "NewPassword456",
  "confirmNewPassword": "NewPassword456"
}
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Password berhasil diubah",
  "data": {}
}
```

---

## 📋 Form Data Endpoints

### 5. Save Personal Data (Step 2)

```http
POST /form/personal-data
Authorization: Bearer {token}
Content-Type: application/json

{
  "nisn": "1234567890",
  "nik": "1234567890123456",
  "full_name": "Budi Santoso",
  "gender": "laki-laki",
  "birth_place": "Jakarta",
  "birth_date": "2006-01-15",
  "religion": "Islam",
  "child_number": 1,
  "siblings_count": 2,
  "full_address": "Jl. Merdeka No. 123, Jakarta Pusat"
}
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Data pribadi tersimpan",
  "data": {
    "auto_saved": true,
    "timestamp": "2026-05-11T10:35:00Z"
  }
}
```

---

### 6. Get Personal Data

```http
GET /form/personal-data
Authorization: Bearer {token}
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Data pribadi berhasil diambil",
  "data": {
    "id": 1,
    "user_id": 1,
    "nisn": "1234567890",
    "nik": "1234567890123456",
    "full_name": "Budi Santoso",
    "gender": "laki-laki",
    "birth_place": "Jakarta",
    "birth_date": "2006-01-15",
    "religion": "Islam",
    "child_number": 1,
    "siblings_count": 2,
    "full_address": "Jl. Merdeka No. 123, Jakarta Pusat",
    "auto_saved": true,
    "auto_save_time": "2026-05-11T10:35:00Z"
  }
}
```

---

### 7. Save Parent Data (Step 3)

```http
POST /form/parent-data
Authorization: Bearer {token}
Content-Type: application/json

{
  "father_name": "Santoso Wijaya",
  "father_occupation": "PNS",
  "father_education": "S1",
  "mother_name": "Siti Rahayu",
  "mother_occupation": "Ibu Rumah Tangga",
  "mother_education": "SMA",
  "guardian_name": "",
  "guardian_phone": "",
  "family_income": "Rp 5 - 10 juta",
  "parent_address": "Jl. Merdeka No. 123, Jakarta Pusat"
}
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Data orang tua tersimpan",
  "data": {}
}
```

---

### 8. Save School Data (Step 4)

```http
POST /form/school-data
Authorization: Bearer {token}
Content-Type: application/json

{
  "school_name": "SMP Negeri 1 Jakarta",
  "npsn": "20104001",
  "school_address": "Jl. Pendidikan No. 1, Jakarta",
  "graduation_year": "2026",
  "diploma_number": "SKL/2026/001",
  "average_score": "8.5",
  "major_choice": "IPA"
}
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Data sekolah tersimpan",
  "data": {}
}
```

---

### 9. Get All Registration Data

```http
GET /form/all-data
Authorization: Bearer {token}
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Data pendaftaran berhasil diambil",
  "data": {
    "user": {
      "id": 1,
      "full_name": "Budi Santoso",
      "email": "budi@example.com",
      "whatsapp": "+6281234567890",
      "registration_status": "pending",
      "registration_date": "2026-05-11T10:30:00Z"
    },
    "personal_data": { ... },
    "parent_data": { ... },
    "school_data": { ... },
    "documents": [ ... ]
  }
}
```

---

## 📄 Document Upload Endpoints

### 10. Upload Document (Step 5)

```http
POST /documents/upload
Authorization: Bearer {token}
Content-Type: multipart/form-data

Form Data:
- file: [binary file]
- document_type: photo|family_card|birth_certificate|report_card|diploma
```

**Response Success (201):**
```json
{
  "success": true,
  "message": "Dokumen berhasil diupload",
  "data": {
    "document_type": "photo",
    "file_name": "1715425400123-456789.jpg",
    "file_size": 245632,
    "file_path": "uploads/1715425400123-456789.jpg"
  }
}
```

**Document Types:**
- `photo` - Pas Foto (3x4 atau 4x6)
- `family_card` - Kartu Keluarga
- `birth_certificate` - Akta Kelahiran
- `report_card` - Raport (SMP)
- `diploma` - SKL / Ijazah

---

### 11. Get Uploaded Documents

```http
GET /documents/list
Authorization: Bearer {token}
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Dokumen berhasil diambil",
  "data": [
    {
      "id": 1,
      "document_type": "photo",
      "file_name": "1715425400123-456789.jpg",
      "file_size": 245632,
      "file_path": "uploads/1715425400123-456789.jpg",
      "upload_date": "2026-05-11T10:35:00Z"
    },
    {
      "id": 2,
      "document_type": "family_card",
      "file_name": "1715425500123-456790.pdf",
      "file_size": 512345,
      "file_path": "uploads/1715425500123-456790.pdf",
      "upload_date": "2026-05-11T10:36:00Z"
    }
  ]
}
```

---

### 12. Delete Document

```http
DELETE /documents/{documentId}
Authorization: Bearer {token}
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Dokumen berhasil dihapus",
  "data": {}
}
```

---

### 13. Submit Registration (Step 6)

```http
POST /documents/submit
Authorization: Bearer {token}
Content-Type: application/json

{
  "confirmation_agreed": true
}
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Pendaftaran berhasil disubmit",
  "data": {
    "status": "pending",
    "message": "Pendaftaran berhasil disubmit menunggu verifikasi admin"
  }
}
```

---

### 14. Get Registration Status

```http
GET /documents/status
Authorization: Bearer {token}
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Status pendaftaran berhasil diambil",
  "data": {
    "registration_number": "SPMB-2026-001",
    "registration_status": "pending|revision|accepted|rejected",
    "registration_date": "2026-05-11T10:30:00Z",
    "revision_notes": {
      "id": 1,
      "admin_name": "Admin",
      "revision_message": "Harap perbaiki data NISN",
      "fields_to_revise": ["nisn", "diploma"],
      "created_at": "2026-05-11T12:00:00Z"
    }
  }
}
```

---

## 🤖 AI Agent Endpoints

### 15. Send Message to AI

```http
POST /ai-agent/message
Authorization: Bearer {token}
Content-Type: application/json

{
  "message": "Apa syarat pendaftaran?"
}
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Pesan berhasil dikirim",
  "data": {
    "user_message": "Apa syarat pendaftaran?",
    "ai_response": "Syarat pendaftaran SPMB adalah...",
    "timestamp": "2026-05-11T10:40:00Z"
  }
}
```

---

### 16. Get Chat History

```http
GET /ai-agent/history
Authorization: Bearer {token}
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Chat history berhasil diambil",
  "data": [
    {
      "user_id": 1,
      "message": "Apa syarat pendaftaran?",
      "response": "Syarat pendaftaran SPMB adalah...",
      "message_type": "ai_agent",
      "created_at": "2026-05-11T10:40:00Z"
    }
  ]
}
```

---

### 17. Clear Chat History

```http
DELETE /ai-agent/history
Authorization: Bearer {token}
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Chat history berhasil dihapus",
  "data": {}
}
```

---

## 📊 Dashboard Endpoints

### 18. Get Dashboard Data

```http
GET /dashboard/data
Authorization: Bearer {token}
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Dashboard data berhasil diambil",
  "data": {
    "user": {
      "full_name": "Budi Santoso",
      "email": "budi@example.com",
      "registration_number": "SPMB-2026-001",
      "registration_status": "pending",
      "registration_date": "2026-05-11T10:30:00Z"
    },
    "completion": {
      "personal_data": true,
      "parent_data": true,
      "school_data": true,
      "documents": false,
      "completion_percentage": 75
    },
    "announcements": [
      {
        "id": 1,
        "title": "Jadwal SPMB 2026",
        "content": "...",
        "created_at": "2026-05-11T08:00:00Z"
      }
    ]
  }
}
```

---

### 19. Get Announcements

```http
GET /dashboard/announcements
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Pengumuman berhasil diambil",
  "data": [
    {
      "id": 1,
      "title": "Jadwal SPMB 2026",
      "content": "...",
      "created_at": "2026-05-11T08:00:00Z"
    }
  ]
}
```

---

## ❌ Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validasi gagal: Email harus diisi"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Token tidak valid atau expired"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Anda tidak memiliki akses"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "User tidak ditemukan"
}
```

### 409 Conflict
```json
{
  "success": false,
  "message": "Email sudah terdaftar"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Terjadi kesalahan di server"
}
```

---

## 📝 Validation Rules

### Email
- Format valid: `username@domain.com`
- Harus unik di database

### Password
- Minimal 8 karakter
- Sebaiknya mix uppercase, lowercase, number

### NISN
- 10 digit numerik

### NIK
- 16 digit numerik

### Phone (WhatsApp)
- Format Indonesia: 0812xxxxx atau +6281xxxxx
- Valid untuk provider lokal

### File Upload
- Format: JPG, PNG, PDF
- Maksimal: 5MB per file

---

## 🔐 Rate Limiting

API dibatasi untuk mencegah abuse:
- 100 requests per 15 menit per IP
- Login: 5 attempts per 15 menit
- File upload: 10 files per jam

---

**API Documentation Version 1.0.0**
**Last Updated: May 11, 2026**
