-- ==========================================
-- SIPAS (Sistem Informasi Pengawasan & Pendampingan Akademik Sekolah)
-- SQL DATABASE SCHEMA & SEED DATA
-- Target DBMS: PostgreSQL / MySQL / CockroachDB / Cloud SQL
-- ==========================================

-- ------------------------------------------
-- 1. DROP TABLES IF EXISTS (For Clean Reset)
-- ------------------------------------------
DROP TABLE IF EXISTS document_infos CASCADE;
DROP TABLE IF EXISTS findings CASCADE;
DROP TABLE IF EXISTS program_guidances CASCADE;
DROP TABLE IF EXISTS managerial_supervisions CASCADE;
DROP TABLE IF EXISTS academic_supervisions CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS schools CASCADE;

-- ------------------------------------------
-- 2. CREATE TABLE DEFINITIONS
-- ------------------------------------------

-- Table: schools (Sekolah Binaan)
CREATE TABLE schools (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    npsn VARCHAR(50) UNIQUE NOT NULL,
    kepala_sekolah VARCHAR(255) NOT NULL,
    akreditasi VARCHAR(5) NOT NULL DEFAULT 'B',
    guru_count INTEGER NOT NULL DEFAULT 0,
    murid_count INTEGER NOT NULL DEFAULT 0,
    address TEXT NOT NULL,
    lat NUMERIC(10, 7),
    lng NUMERIC(10, 7),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: users (Pengguna Sistem SIPAS)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL, -- Di produksi sebaiknya menggunakan hash (bcrypt/argon2)
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL, -- 'pengawas', 'kepsek', 'dinas'
    school_id VARCHAR(50) REFERENCES schools(id) ON DELETE SET NULL,
    nip VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: academic_supervisions (Supervisi Akademik Pembelajaran)
CREATE TABLE academic_supervisions (
    id VARCHAR(50) PRIMARY KEY,
    school_id VARCHAR(50) NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    teacher_name VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    
    -- Skor Komponen (Skala 1 - 100)
    score_administrasi NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    score_apersepsi NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    score_penguasaan_materi NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    score_metode_pembelajaran NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    score_evaluasi NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    score_pemanfaatan_tik NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    
    average_score NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    notes TEXT,
    recommendation TEXT,
    status VARCHAR(100) NOT NULL DEFAULT 'STABIL',
    document_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: managerial_supervisions (Supervisi Manajerial SNP)
CREATE TABLE managerial_supervisions (
    id VARCHAR(50) PRIMARY KEY,
    school_id VARCHAR(50) NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    
    -- Skor 8 Standar Nasional Pendidikan (SNP) (Skala 1 - 100)
    score_standar_isi NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    score_standar_proses NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    score_standar_kelulusan NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    score_standar_pendidik NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    score_standar_sarpras NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    score_standar_pengelolaan NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    score_standar_pembiayaan NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    score_standar_penilaian NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    
    average_score NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    notes TEXT,
    recommendation TEXT,
    implementation_status VARCHAR(100) NOT NULL DEFAULT 'PERLU BINAAN',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: program_guidances (Pembinaan & Kegiatan Terjadwal)
CREATE TABLE program_guidances (
    id VARCHAR(50) PRIMARY KEY,
    school_id VARCHAR(50) NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    target VARCHAR(255) NOT NULL,
    date_scheduled DATE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Belum', -- 'Belum', 'Proses', 'Selesai'
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: findings (Temuan Masalah & Tindak Lanjut)
CREATE TABLE findings (
    id VARCHAR(50) PRIMARY KEY,
    school_id VARCHAR(50) NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    problem TEXT NOT NULL,
    root_cause TEXT NOT NULL,
    recommendation TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Belum ditindaklanjuti', -- 'Belum ditindaklanjuti', 'Proses', 'Selesai'
    date_added DATE NOT NULL,
    date_target DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: document_infos (Repository Dokumen Sekolah)
CREATE TABLE document_infos (
    id VARCHAR(50) PRIMARY KEY,
    school_id VARCHAR(50) NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL, -- 'Kurikulum', 'Keuangan', 'Kesiswaan', 'Sarpras', 'Umum'
    date_uploaded DATE NOT NULL,
    size VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- ------------------------------------------
-- 3. INSERT INITIAL SEED DATA
-- ------------------------------------------

-- Seed: Schools
INSERT INTO schools (id, name, npsn, kepala_sekolah, akreditasi, guru_count, murid_count, address, lat, lng) VALUES
('school-1', 'SMAN 1 Kota Utama', '20198471', 'Drs. H. Bambang Wijanarko, M.Pd.', 'A', 42, 780, 'Jl. Pendidikan No. 12, Pusat Kota', -6.2088, 106.8456),
('school-2', 'SMAS Harapan Bangsa', '20198472', 'Dra. Endang Lestari, M.Si.', 'A', 35, 620, 'Jl. Kemerdekaan Barat No. 45', -6.2188, 106.8556),
('school-3', 'SMAN 3 Merdeka', '20198473', 'Ahmad Syafii, S.Pd., M.A.', 'B', 28, 490, 'Jl. Pahlawan Perjuangan Gg. 5', -6.2288, 106.8656),
('school-4', 'SMA Tunas Mulia', '20198474', 'Dr. Irwan Setiawan, M.Sc.', 'A', 31, 550, 'Kawasan Edupark Sentosa Blok C', -6.1988, 106.8356);

-- Seed: Users
INSERT INTO users (email, password, name, role, school_id, nip) VALUES
('pengawas@sipas.go.id', 'pengawas123', 'Drs. Hermawan, M.Pd', 'pengawas', NULL, '19740523 200003 1 002'),
('kepsek@sipas.go.id', 'kepsek123', 'Drs. H. Bambang Wijanarko, M.Pd.', 'kepsek', 'school-1', '19681112 199401 1 003'),
('dinas@pendidikan.go.id', 'dinas123', 'Admin Dinas Pendidikan', 'dinas', NULL, NULL);

-- Seed: Academic Supervisions
INSERT INTO academic_supervisions (id, school_id, teacher_name, subject, date, score_administrasi, score_apersepsi, score_penguasaan_materi, score_metode_pembelajaran, score_evaluasi, score_pemanfaatan_tik, average_score, notes, recommendation, status, document_name) VALUES
('acad-1', 'school-1', 'Budi Santoso, S.Pd', 'Matematika', '2026-05-10', 90, 85, 92, 88, 85, 95, 89.16, 'Penyampaian materi sangat interaktif menggunakan GeoGebra.', 'Pertahankan dan tularkan pemanfaatan GeoGebra ke guru mapel serumpun.', 'STABIL', 'Supervisi_Matematika_Budi_Santoso.pdf'),
('acad-2', 'school-1', 'Siti Rahma, S.Pd', 'Bahasa Inggris', '2026-05-12', 85, 80, 88, 85, 80, 80, 83.00, 'Rencana pembelajaran lengkap, manajemen kelas perlu ditingkatkan.', 'Sering melakukan interaksi aktif dengan murid di barisan belakang.', 'STABIL', 'Supervisi_B_Inggris_Siti.pdf'),
('acad-3', 'school-2', 'Andi Wijaya, S.Pd', 'Fisika', '2026-05-14', 78, 75, 80, 75, 78, 70, 76.00, 'Penguasaan materi baik, namun penggunaan TIK masih minim.', 'Ikuti pelatihan pembelajaran digital berbasis TIK di MGMP.', 'PERLU BINAAN', 'Supervisi_Fisika_Andi.pdf');

-- Seed: Managerial Supervisions
INSERT INTO managerial_supervisions (id, school_id, date, score_standar_isi, score_standar_proses, score_standar_kelulusan, score_standar_pendidik, score_standar_sarpras, score_standar_pengelolaan, score_standar_pembiayaan, score_standar_penilaian, average_score, notes, recommendation, implementation_status) VALUES
('man-1', 'school-1', '2026-04-20', 88, 85, 90, 82, 85, 88, 84, 86, 86.00, 'Secara umum, delapan Standar Nasional Pendidikan telah terpenuhi dengan sangat memuaskan.', 'Optimalkan pemeliharaan sarana laboratorium komputer secara rutin.', 'STABIL'),
('man-2', 'school-2', '2026-04-25', 82, 80, 85, 78, 80, 82, 75, 80, 80.25, 'Administrasi kurikulum dan KTSP lengkap. Sarana olahraga indoor masih terbatas.', 'Ajukan perbaikan/rehabilitasi fasilitas lapangan olahraga ke komite.', 'STABIL'),
('man-3', 'school-3', '2026-05-02', 72, 70, 75, 68, 62, 70, 68, 70, 69.37, 'Beberapa laboratorium belum terawat dengan optimal. Kualifikasi guru masih ada yang belum sertifikasi.', 'Segera daftarkan guru non-sertifikasi ke program PPG Jabatan.', 'PERLU BINAAN');

-- Seed: Program Guidances
INSERT INTO program_guidances (id, school_id, title, target, date_scheduled, status, notes) VALUES
('prog-1', 'school-1', 'Workshop Penyusunan KOSP', 'Semua Guru SMAN 1', '2026-07-05', 'Belum', 'Persiapan kurikulum merdeka tahun ajaran baru.'),
('prog-2', 'school-2', 'Diseminasi Media Pembelajaran Interaktif', 'Guru Mapel IPA', '2026-06-25', 'Proses', 'Pelatihan Canva for Education dan Google Classroom.'),
('prog-3', 'school-3', 'Bimbingan Teknis Akreditasi Sekolah', 'Tim Akreditasi SMAN 3', '2026-05-18', 'Selesai', 'Mempersiapkan dokumen dan upload SISPENA.');

-- Seed: Findings
INSERT INTO findings (id, school_id, problem, root_cause, recommendation, status, date_added, date_target) VALUES
('find-1', 'school-1', 'Buku teks utama mata pelajaran Informatika Kurikulum Merdeka masih belum mencukupi.', 'Keterlambatan distribusi dari penerbit pusat.', 'Sekolah mengunduh modul PDF resmi dan mencetaknya sementara menggunakan dana BOS.', 'Proses', '2026-05-10', '2026-07-15'),
('find-2', 'school-2', 'Beberapa guru belum menyusun modul ajar lengkap di awal semester.', 'Kurangnya pemahaman guru dalam merumuskan tujuan pembelajaran terintegrasi profil Pancasila.', 'Adakan in-house training penyusunan Modul Ajar dan dampingi guru secara berkala.', 'Belum ditindaklanjuti', '2026-05-15', '2026-06-30'),
('find-3', 'school-3', 'Alat praktikum laboratorium Biologi banyak yang rusak dan tidak bisa digunakan.', 'Kurangnya perawatan berkala dan minimnya inventarisasi lab.', 'Alokasikan RKAS untuk pemeliharaan rutin laboratorium dan tunjuk laboran khusus.', 'Selesai', '2026-04-05', '2026-05-05');

-- Seed: Document Infos
INSERT INTO document_infos (id, school_id, filename, category, date_uploaded, size) VALUES
('doc-1', 'school-1', 'KOSP_SMAN1_2026.pdf', 'Kurikulum', '2026-05-01', '4.2 MB'),
('doc-2', 'school-1', 'Laporan_Keuangan_BOS_Q1.xlsx', 'Keuangan', '2026-04-15', '1.8 MB'),
('doc-3', 'school-2', 'Tata_Tertib_Siswa_2026.pdf', 'Kesiswaan', '2026-05-10', '850 KB'),
('doc-4', 'school-3', 'Inventaris_Sarpras_SMAN3.xlsx', 'Sarpras', '2026-05-12', '2.1 MB');
