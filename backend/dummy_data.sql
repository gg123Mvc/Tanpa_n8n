-- ============================================================
-- DUMMY DATA UNTUK TESTING SISTEM SPMB (SUPABASE POSTGRESQL)
-- Jalankan script ini di SQL Editor Supabase setelah supabase_schema.sql
-- ============================================================
-- Akun Login yang Siap Digunakan:
-- 1. Super Admin : admin@madrasah.id       / admin123
-- 2. Admin       : verifikator@madrasah.id  / verifikator123
-- 3. Calon Siswa : budi.santoso@email.com   / Test1234
-- 4. Calon Siswa : siti.nurhaliza@email.com / Test1234
-- 5. Calon Siswa : ahmad.wijaya@email.com   / Test1234
-- ============================================================

-- 1. Dummy Admin Users
INSERT INTO admin_users (id, username, email, password, role, created_at)
VALUES
(1, 'admin', 'admin@madrasah.id', '$2a$10$DHl3XL2kXfSToo85tWPfguZI.VDEdChG6h3lC3tRbvSXaoixcHsPm', 'super_admin', NOW()),
(2, 'verifikator', 'verifikator@madrasah.id', '$2a$10$4hsognktNTiF6ej8W0Q3LOMcquaIsc1iF4agvPVhWRVwfCdyWTeL2', 'admin', NOW())
ON CONFLICT (id) DO UPDATE SET
  username = EXCLUDED.username,
  email = EXCLUDED.email,
  password = EXCLUDED.password,
  role = EXCLUDED.role;

-- 2. Dummy Announcements (Pengumuman)
INSERT INTO announcements (id, title, content, created_by, created_at)
VALUES
(
  1,
  'Jadwal SPMB 2026',
  'Berikut jadwal lengkap Penerimaan Murid Baru 2026:

📅 Pendaftaran: 1 - 30 Juni 2026
📝 Tes Tulis: 15 - 20 Juli 2026
📢 Pengumuman: 25 Juli 2026
📋 Daftar Ulang: 1 - 5 Agustus 2026

Jangan lewatkan jadwal penting ini!',
  1,
  NOW()
),
(
  2,
  'Informasi Biaya Pendaftaran',
  'Biaya Pendaftaran SPMB 2026:

💳 Biaya Pendaftaran: Rp 100.000
🏢 Biaya Pembangunan: Rp 2.000.000 (bisa dicicil)
📚 SPP: Rp 300.000/bulan

Ada program beasiswa untuk siswa berprestasi!
Hubungi panitia untuk detail lebih lanjut.',
  1,
  NOW()
),
(
  3,
  'Tata Tertib Peserta SPMB',
  'Peserta SPMB wajib memahami dan mematuhi tata tertib berikut:

✓ Hadir tepat waktu
✓ Berpakaian rapi dan sopan
✓ Membawa semua dokumen yang diperlukan
✓ Tidak ada kecurangan dalam ujian
✓ Mematuhi protokol kesehatan dan arahan panitia

Pelanggaran akan mengakibatkan pembatalan pendaftaran.',
  1,
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  created_by = EXCLUDED.created_by;

-- 3. Dummy Users (Calon Siswa)
-- Password semua siswa: Test1234
INSERT INTO users (id, registration_number, full_name, email, whatsapp, password, registration_status, created_at)
VALUES
(1, 'SPMB-2026-001', 'Budi Santoso',    'budi.santoso@email.com',    '081234567890', '$2a$10$qzhPkOR7QUclm/5x.mr5MeoBm16yeYoJG1mXkGPu4nQGXgPcBigde', 'pending',  NOW()),
(2, 'SPMB-2026-002', 'Siti Nurhaliza',  'siti.nurhaliza@email.com',  '081234567891', '$2a$10$qzhPkOR7QUclm/5x.mr5MeoBm16yeYoJG1mXkGPu4nQGXgPcBigde', 'pending',  NOW()),
(3, 'SPMB-2026-003', 'Ahmad Wijaya',    'ahmad.wijaya@email.com',    '081234567892', '$2a$10$qzhPkOR7QUclm/5x.mr5MeoBm16yeYoJG1mXkGPu4nQGXgPcBigde', 'accepted', NOW())
ON CONFLICT (id) DO UPDATE SET
  registration_number = EXCLUDED.registration_number,
  full_name = EXCLUDED.full_name,
  email = EXCLUDED.email,
  whatsapp = EXCLUDED.whatsapp,
  password = EXCLUDED.password,
  registration_status = EXCLUDED.registration_status;

-- 4. Dummy Personal Data (Data Pribadi)
INSERT INTO personal_data (user_id, nisn, nik, full_name, gender, birth_place, birth_date, religion, child_number, siblings_count, full_address, auto_saved, created_at)
VALUES
(1, '1234567890', '1234567890123456', 'Budi Santoso',   'laki-laki', 'Jakarta',  '2006-01-15', 'Islam', 1, 2, 'Jl. Merdeka No. 123, Jakarta Pusat', true, NOW()),
(2, '1234567891', '1234567891123456', 'Siti Nurhaliza', 'perempuan', 'Bandung',  '2006-03-20', 'Islam', 2, 3, 'Jl. Sudirman No. 456, Bandung',      true, NOW()),
(3, '1234567892', '1234567892123456', 'Ahmad Wijaya',   'laki-laki', 'Surabaya', '2005-06-10', 'Islam', 1, 1, 'Jl. Ahmad Yani No. 789, Surabaya',   true, NOW())
ON CONFLICT (user_id) DO UPDATE SET
  nisn = EXCLUDED.nisn,
  nik = EXCLUDED.nik,
  full_name = EXCLUDED.full_name,
  gender = EXCLUDED.gender,
  birth_place = EXCLUDED.birth_place,
  birth_date = EXCLUDED.birth_date,
  religion = EXCLUDED.religion,
  child_number = EXCLUDED.child_number,
  siblings_count = EXCLUDED.siblings_count,
  full_address = EXCLUDED.full_address,
  auto_saved = EXCLUDED.auto_saved;

-- 5. Dummy Parent Data (Data Orang Tua / Wali)
INSERT INTO parent_data (user_id, father_name, father_occupation, father_education, mother_name, mother_occupation, mother_education, guardian_name, guardian_phone, family_income, parent_address, created_at)
VALUES
(1, 'Santoso Wijaya', 'PNS',         'S1',  'Siti Rahayu',     'Ibu Rumah Tangga', 'SMA', NULL,           NULL,           'Rp 5 - 10 juta',  'Jl. Merdeka No. 123, Jakarta Pusat', NOW()),
(2, 'Nurdin Ahmad',   'Swasta',      'S1',  'Nuraini Hanifah', 'Guru',             'S1',  'Toto Cahyono', '081234567893', 'Rp 10 - 20 juta', 'Jl. Sudirman No. 456, Bandung',      NOW()),
(3, 'Wijaya Kusuma',  'Wiraswasta',  'SMA', 'Kusuma Dewi',     'Ibu Rumah Tangga', 'SMA', NULL,           NULL,           'Rp 1 - 5 juta',   'Jl. Ahmad Yani No. 789, Surabaya',   NOW())
ON CONFLICT (user_id) DO UPDATE SET
  father_name = EXCLUDED.father_name,
  father_occupation = EXCLUDED.father_occupation,
  father_education = EXCLUDED.father_education,
  mother_name = EXCLUDED.mother_name,
  mother_occupation = EXCLUDED.mother_occupation,
  mother_education = EXCLUDED.mother_education,
  guardian_name = EXCLUDED.guardian_name,
  guardian_phone = EXCLUDED.guardian_phone,
  family_income = EXCLUDED.family_income,
  parent_address = EXCLUDED.parent_address;

-- 6. Dummy School Data (Data Asal Sekolah)
INSERT INTO school_data (user_id, school_name, npsn, school_address, graduation_year, diploma_number, average_score, major_choice, created_at)
VALUES
(1, 'SMP Negeri 1 Jakarta',   '20104001', 'Jl. Pendidikan No. 1, Jakarta',   '2026', 'SKL/2026/001', 8.5, 'IPA',         NOW()),
(2, 'SMP Negeri 5 Bandung',   '20304005', 'Jl. Pendidikan No. 5, Bandung',   '2026', 'SKL/2026/002', 8.8, 'IPS',         NOW()),
(3, 'SMP Negeri 10 Surabaya', '20604010', 'Jl. Pendidikan No. 10, Surabaya', '2023', 'SKL/2023/003', 7.9, 'Keagamaan',   NOW())
ON CONFLICT (user_id) DO UPDATE SET
  school_name = EXCLUDED.school_name,
  npsn = EXCLUDED.npsn,
  school_address = EXCLUDED.school_address,
  graduation_year = EXCLUDED.graduation_year,
  diploma_number = EXCLUDED.diploma_number,
  average_score = EXCLUDED.average_score,
  major_choice = EXCLUDED.major_choice;

-- 7. Dummy Chat History (Riwayat Chat AI Agent)
INSERT INTO chat_history (user_id, message, response, message_type, created_at)
VALUES
(1, 'Apa syarat pendaftaran SPMB?',    'Syarat pendaftaran SPMB adalah lulusan SMP/MTs, memiliki NISN dan NIK, usia maksimal 21 tahun, sehat fisik dan mental.', 'ai_agent', NOW()),
(1, 'Bagaimana cara upload dokumen?', 'Anda dapat upload dokumen di Step 5. Klik atau drag file ke area upload, pilih jenis dokumen, dan tunggu hingga selesai.', 'ai_agent', NOW()),
(2, 'Berapa biaya pendaftaran?',       'Biaya pendaftaran SPMB 2026 adalah Rp 100.000 untuk biaya registrasi.', 'ai_agent', NOW());

-- 8. Sinkronisasi Sequence ID (PENTING untuk PostgreSQL agar auto-increment ID berlanjut dengan benar)
SELECT setval(pg_get_serial_sequence('admin_users', 'id'), COALESCE((SELECT MAX(id) FROM admin_users), 1));
SELECT setval(pg_get_serial_sequence('announcements', 'id'), COALESCE((SELECT MAX(id) FROM announcements), 1));
SELECT setval(pg_get_serial_sequence('users', 'id'), COALESCE((SELECT MAX(id) FROM users), 1));
SELECT setval(pg_get_serial_sequence('personal_data', 'id'), COALESCE((SELECT MAX(id) FROM personal_data), 1));
SELECT setval(pg_get_serial_sequence('parent_data', 'id'), COALESCE((SELECT MAX(id) FROM parent_data), 1));
SELECT setval(pg_get_serial_sequence('school_data', 'id'), COALESCE((SELECT MAX(id) FROM school_data), 1));
SELECT setval(pg_get_serial_sequence('chat_history', 'id'), COALESCE((SELECT MAX(id) FROM chat_history), 1));

-- ============================================================
-- Ringkasan Verifikasi Data di Supabase
-- ============================================================
SELECT
  (SELECT COUNT(*) FROM admin_users)   AS total_admin,
  (SELECT COUNT(*) FROM users)         AS total_siswa,
  (SELECT COUNT(*) FROM announcements) AS total_pengumuman,
  'Dummy data berhasil disimpan di Supabase! Semua akun siap digunakan.' AS status;
