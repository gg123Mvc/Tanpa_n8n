-- Database untuk Sistem SPMB Madrasah Aliyah
-- Pastikan database sudah dibuat di MySQL

USE spmb_madrasah;

-- Tabel Users (Akun Pendaftar)
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  registration_number VARCHAR(20) UNIQUE,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  whatsapp VARCHAR(15) NOT NULL,
  password VARCHAR(255) NOT NULL,
  registration_status ENUM('pending', 'revision', 'accepted', 'rejected') DEFAULT 'pending',
  registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabel Personal Data (Data Pribadi Calon Siswa)
CREATE TABLE personal_data (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  nisn VARCHAR(10),
  nik VARCHAR(16),
  full_name VARCHAR(100),
  gender ENUM('laki-laki', 'perempuan'),
  birth_place VARCHAR(100),
  birth_date DATE,
  religion VARCHAR(50),
  child_number INT,
  siblings_count INT,
  full_address TEXT,
  auto_saved BOOLEAN DEFAULT false,
  auto_save_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabel Parent Data (Data Orang Tua / Wali)
CREATE TABLE parent_data (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  father_name VARCHAR(100),
  father_occupation VARCHAR(100),
  father_education VARCHAR(100),
  mother_name VARCHAR(100),
  mother_occupation VARCHAR(100),
  mother_education VARCHAR(100),
  guardian_name VARCHAR(100),
  guardian_phone VARCHAR(15),
  family_income VARCHAR(100),
  parent_address TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabel School Data (Data Sekolah Asal)
CREATE TABLE school_data (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  school_name VARCHAR(150),
  npsn VARCHAR(10),
  school_address TEXT,
  graduation_year VARCHAR(4),
  diploma_number VARCHAR(50),
  average_score DECIMAL(3, 2),
  major_choice ENUM('IPA', 'IPS', 'Keagamaan') DEFAULT 'IPA',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabel Documents (Dokumen Upload)
CREATE TABLE documents (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  document_type ENUM('photo', 'family_card', 'birth_certificate', 'report_card', 'diploma') NOT NULL,
  file_path VARCHAR(255),
  file_name VARCHAR(255),
  file_size INT,
  upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_doc_per_user (user_id, document_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabel Registration Revision Notes (Catatan Revisi)
CREATE TABLE revision_notes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  admin_name VARCHAR(100),
  revision_message TEXT,
  fields_to_revise JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabel Admin Users
CREATE TABLE admin_users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'super_admin') DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabel Chat History (AI Agent & Support)
CREATE TABLE chat_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  message TEXT NOT NULL,
  response TEXT,
  message_type ENUM('ai_agent', 'support') DEFAULT 'ai_agent',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabel Announcements (Pengumuman SPMB)
CREATE TABLE announcements (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES admin_users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create indexes
CREATE INDEX idx_user_email ON users(email);
CREATE INDEX idx_user_status ON users(registration_status);
CREATE INDEX idx_user_registration_date ON users(registration_date);
CREATE INDEX idx_personal_data_user ON personal_data(user_id);
CREATE INDEX idx_parent_data_user ON parent_data(user_id);
CREATE INDEX idx_school_data_user ON school_data(user_id);
CREATE INDEX idx_documents_user ON documents(user_id);
CREATE INDEX idx_revision_notes_user ON revision_notes(user_id);
CREATE INDEX idx_chat_history_user ON chat_history(user_id);

-- Tabel Knowledge Base (AI Agent)
CREATE TABLE knowledge_base (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category VARCHAR(100),
    title VARCHAR(255),
    content TEXT,
    status ENUM('active','inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed Data untuk Knowledge Base
INSERT INTO knowledge_base (category, title, content) VALUES
('Profil', 'Akreditasi', 'Terakreditasi B'),
('Profil', 'Alamat', 'berlokasi di Jl. KH. Wahid Hasyim, Mertapada Wetan, Kec. Astana Japura, Kabupaten Cirebon, Jawa Barat'),
('Jurusan', 'Pilihan Jurusan', 'IPA, IPS, Keagamaan'),
('Biaya', 'Rincian Biaya', 'Daftar 100rb, Bangunan 2jt (cicil), SPP 300rb/bln'),
('Jadwal', 'Jadwal PMB', 'Daftar Juni, Tes Juli, Pengumuman Juli, Daftar Ulang Agustus'),
('Persyaratan', 'Syarat Pendaftaran', 'Lulus SMP, NISN/NIK valid, maks 21 thn'),
('Dokumen', 'Dokumen yang Dibutuhkan', 'KK, Akta, Rapor 7-9, Ijazah'),
('Kontak', 'Informasi Kontak', 'WA 0812-3456-7890, spmb@binacendekia.sch.id'),
('FAQ', 'Cara Daftar', 'Buat akun -> Isi Biodata (S2) -> Orang Tua (S3) -> Sekolah Asal (S4) -> Upload Dokumen (S5) -> Review (S6)');
