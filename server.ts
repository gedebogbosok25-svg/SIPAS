import express, { Request, Response } from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;
const DB_FILE = path.join(process.cwd(), "data_db.json");

app.use(express.json());

// -------------------------------------------------------------
// DUMMY INITIAL DATA SEEDING (Sistem Informasi Pengawas Sekolah)
// -------------------------------------------------------------
const INITIAL_DB = {
  schools: [
    {
      id: "school-1",
      name: "SMAN 1 Sepaku (IKN Nusantara)",
      npsn: "30401221",
      kepalaSekolah: "Drs. H. Bambang Wijanarko, M.Pd.",
      akreditasi: "A",
      guruCount: 38,
      muridCount: 520,
      address: "Jl. Negara No. 12, Sepaku, Penajam Paser Utara",
      lat: -0.9152,
      lng: 116.7825
    },
    {
      id: "school-2",
      name: "SMAN 3 Balikpapan",
      npsn: "30401889",
      kepalaSekolah: "Hj. Retno Wardani, S.Pd., M.Si.",
      akreditasi: "A",
      guruCount: 45,
      muridCount: 680,
      address: "Jl. Jenderal Sudirman No. 44, Balikpapan",
      lat: -1.2654,
      lng: 116.8312
    },
    {
      id: "school-3",
      name: "SMA Negeri 1 Penajam",
      npsn: "30401005",
      kepalaSekolah: "Ir. Ahmad Sholikhin, M.T.",
      akreditasi: "B",
      guruCount: 32,
      muridCount: 410,
      address: "Jl. Propinsi Km. 9, Penajam",
      lat: -1.2428,
      lng: 116.7410
    },
    {
      id: "school-4",
      name: "SMAS Katolik Adi Sucipto",
      npsn: "30405211",
      kepalaSekolah: "Suster Maria Anastasia, M.Sc.",
      akreditasi: "A",
      guruCount: 20,
      muridCount: 220,
      address: "Jl. Mayor TNI AD No. 10, Balikpapan Tengah",
      lat: -1.2505,
      lng: 116.8450
    }
  ],
  supervisions_academic: [
    {
      id: "sa-1",
      schoolId: "school-1",
      teacherName: "Sri Wahyuni, S.Pd.",
      subject: "Matematika Peminatan (Kelas XI)",
      date: "2026-05-12",
      scores: {
        administrasi: 88,
        apersepsi: 85,
        penguasaanMateri: 90,
        metodePembelajaran: 82,
        evaluasi: 80,
        pemanfaatanTIK: 85
      },
      averageScore: 85,
      notes: "Pembelajaran berlangsung aktif. Guru sudah mengintegrasikan Canva dalam persentase, namun asesmen formatif akhir sesi masih perlu diperkuat menggunakan kuis interaktif.",
      recommendation: "Metode pembelajaran interaktif perlu diperluas dengan melibatkan game kognitif ringan untuk mengurangi tingkat kejenuhan siswa di jam terakhir.",
      status: "Selesai",
      documentName: "RPP_Pertidaksamaan_Trigonometri_Sri.pdf"
    },
    {
      id: "sa-2",
      schoolId: "school-3",
      teacherName: "Budi Santoso, S.Kom.",
      subject: "Informatika (Kelas X)",
      date: "2026-06-05",
      scores: {
        administrasi: 72,
        apersepsi: 78,
        penguasaanMateri: 85,
        metodePembelajaran: 70,
        evaluasi: 65,
        pemanfaatanTIK: 92
      },
      averageScore: 77,
      notes: "Administrasi RPP belum lengkap (belum ditandatangani kepala sekolah dan belum ada modul ajar terdiferensiasi). Evaluasi praktik kurang mendetail.",
      recommendation: "Lengkapi administrasi modul ajar seminggu sebelum kelas. Ikuti pelatihan MGMP mengenai penyusunan instrumen penilaian autentik berbasis rubrik.",
      status: "Proses",
      documentName: "Modul_Ajar_Informatika_Budi.pdf"
    }
  ],
  supervisions_managerial: [
    {
      id: "sm-1",
      schoolId: "school-1",
      date: "2026-04-18",
      scores: {
        standarIsi: 90,
        standarProses: 88,
        standarKelulusan: 92,
        standarPendidik: 85,
        standarSarpras: 95,
        standarPengelolaan: 90,
        standarPembiayaan: 85,
        standarPenilaian: 84
      },
      averageScore: 88.6,
      notes: "Evaluasi anggaran RKAS menunjukkan penyerapan dana BOS sebesar 78% pada Semester I. Sarana prasarana sekolah IKN sangat lengkap berkat program subsidi percepatan.",
      recommendation: "Lakukan optimalisasi pembiayaan untuk peningkatan kompetensi digital guru bersertifikat nasional melalui pelatihan mandiri di PMM (Platform Merdeka Mengajar).",
      implementationStatus: "Selesai"
    },
    {
      id: "sm-2",
      schoolId: "school-3",
      date: "2026-05-20",
      scores: {
        standarIsi: 75,
        standarProses: 72,
        standarKelulusan: 78,
        standarPendidik: 70,
        standarSarpras: 64,
        standarPengelolaan: 72,
        standarPembiayaan: 80,
        standarPenilaian: 71
      },
      averageScore: 72.8,
      notes: "Sekolah menghadapi keterbatasan laboratorium komputer dan bahan ajar Kurikulum Merdeka yang belum seragam di kelas XI dan XII.",
      recommendation: "Mengajukan DAK Fisik sarana pendidikan ke Dinas, serta merevisi RKAS untuk mengalokasikan anggaran pembelian buku guru/siswa pendukung.",
      implementationStatus: "Belum ditindaklanjuti"
    }
  ],
  programs_guidance: [
    {
      id: "pg-1",
      schoolId: "school-1",
      title: "Penyusunan KOSP Kurikulum Merdeka Mandiri Berbagi",
      target: "Tersusunnya dokumen KOSP yang selaras dengan tantangan smart city IKN",
      dateScheduled: "2026-07-10",
      status: "Belum",
      notes: "-"
    },
    {
      id: "pg-2",
      schoolId: "school-2",
      title: "Workshop Penerapan Asesmen Diagnostik & Terdiferensiasi",
      target: "Seluruh guru SMAN 3 Balikpapan menguasai instrumen asesmen awal",
      dateScheduled: "2026-07-15",
      status: "Belum",
      notes: "-"
    },
    {
      id: "pg-3",
      schoolId: "school-3",
      title: "Bimbingan Finansial & Administrasi BOS Daerah",
      target: "Laporan pertanggungjawaban nihil temuan dan tepat sasaran",
      dateScheduled: "2026-06-12",
      status: "Selesai",
      notes: "Sangat positif. Diikuti oleh bendahara BOS dan komite sekolah."
    }
  ],
  findings: [
    {
      id: "fd-1",
      schoolId: "school-3",
      problem: "Kurang optimalnya pembelajaran IPA/Fisika secara praktikum",
      rootCause: "Alat praktikum rusak ringan di gudang dan guru kurang percaya diri mengoperasikan kit laboratorium.",
      recommendation: "Lakukan inventarisasi alat, alokasikan biaya perbaikan dari dana BOS, serta pengawas menjadwalkan pembinaan lab pekan depan.",
      status: "Proses",
      dateAdded: "2026-05-20",
      dateTarget: "2026-08-30"
    },
    {
      id: "fd-2",
      schoolId: "school-4",
      problem: "Kelengkapan Modul Proyek Penguatan Profil Pelajar Pancasila (P5) rendah",
      rootCause: "Guru kelas X kewalahan merancang tema kebhinekaan global yang relevan karena keterbatasan literatur.",
      recommendation: "Terapkan benchmarking karya P5 ke sekolah penggerak atau SMAN 1 Sepaku, dan rancang tema kearifan lokal Kalimantan Timur.",
      status: "Belum ditindaklanjuti",
      dateAdded: "2026-06-01",
      dateTarget: "2026-10-15"
    }
  ],
  documents: [
    {
      id: "doc-1",
      schoolId: "school-1",
      filename: "KOSP_SMAN_1_Sepaku_2026.pdf",
      category: "Kurikulum",
      dateUploaded: "2026-05-01",
      size: "2.4 MB"
    },
    {
      id: "doc-2",
      schoolId: "school-3",
      filename: "RKAS_SMAN_1_Penajam_2026_Revisi.xlsx",
      category: "Keuangan",
      dateUploaded: "2026-05-15",
      size: "1.1 MB"
    }
  ],
  users: [
    {
      email: "pengawas@sipas.go.id",
      password: "pengawas123",
      name: "Drs. Hermawan, M.Pd",
      role: "pengawas",
      nip: "19740523 200003 1 002"
    },
    {
      email: "kepsek@sipas.go.id",
      password: "kepsek123",
      name: "Drs. H. Bambang Wijanarko, M.Pd.",
      role: "kepsek",
      schoolId: "school-1"
    },
    {
      email: "dinas@pendidikan.go.id",
      password: "dinas123",
      name: "Admin Dinas Pendidikan",
      role: "dinas"
    }
  ]
};

// -------------------------------------------------------------
// HELPER FUNCTIONS FOR DATABASE OPERATIONS
// -------------------------------------------------------------
function readDB() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(INITIAL_DB, null, 2), "utf8");
      return INITIAL_DB;
    }
    const content = fs.readFileSync(DB_FILE, "utf8");
    const parsed = JSON.parse(content);
    // Ensure users array exists in the current DB file
    if (!parsed.users) {
      parsed.users = INITIAL_DB.users;
      fs.writeFileSync(DB_FILE, JSON.stringify(parsed, null, 2), "utf8");
    }
    return parsed;
  } catch (error) {
    console.error("Error reading database file, returning default memory db:", error);
    return INITIAL_DB;
  }
}

function writeDB(data: any) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf8");
  } catch (error) {
    console.error("Error writing database file:", error);
  }
}

// Ensure the db file is generated right at load time
readDB();

// -------------------------------------------------------------
// AI MODEL CONFIGURATION (GEMINI 3.5 FLASH)
// -------------------------------------------------------------
let aiClient: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      console.warn("WARNING: GEMINI_API_KEY environment variable is not set. AI Features will fall back to smart local algorithms.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key || "MOCK_KEY",
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
  }
  return aiClient;
}

// -------------------------------------------------------------
// REST API ENDPOINTS
// -------------------------------------------------------------

// --- USER AUTHENTICATION ---
app.post("/api/login", (req: Request, res: Response) => {
  const db = readDB();
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ status: "error", message: "Email dan kata sandi wajib diisi." });
    return;
  }

  const user = db.users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());

  if (!user || user.password !== password) {
    res.status(401).json({ status: "error", message: "Email atau kata sandi tidak benar!" });
    return;
  }

  // Do not send password to the client
  const { password: _, ...safeUser } = user;
  res.json({ status: "success", user: safeUser });
});

// --- SCHOOLS MANAGER ---
app.get("/api/schools", (req: Request, res: Response) => {
  const db = readDB();
  res.json(db.schools);
});

app.post("/api/schools", (req: Request, res: Response) => {
  const db = readDB();
  const newSchool = {
    id: `school-${Date.now()}`,
    name: req.body.name || "Sekolah Baru",
    npsn: req.body.npsn || "00000000",
    kepalaSekolah: req.body.kepalaSekolah || "-",
    akreditasi: req.body.akreditasi || "B",
    guruCount: Number(req.body.guruCount) || 0,
    muridCount: Number(req.body.muridCount) || 0,
    address: req.body.address || "-",
    lat: Number(req.body.lat) || -1.24,
    lng: Number(req.body.lng) || 116.7
  };
  db.schools.push(newSchool);
  writeDB(db);
  res.status(201).json(newSchool);
});

app.delete("/api/schools/:id", (req: Request, res: Response) => {
  const db = readDB();
  db.schools = db.schools.filter((s: any) => s.id !== req.params.id);
  db.supervisions_academic = db.supervisions_academic.filter((s: any) => s.schoolId !== req.params.id);
  db.supervisions_managerial = db.supervisions_managerial.filter((s: any) => s.schoolId !== req.params.id);
  db.programs_guidance = db.programs_guidance.filter((s: any) => s.schoolId !== req.params.id);
  db.findings = db.findings.filter((s: any) => s.schoolId !== req.params.id);
  db.documents = db.documents.filter((s: any) => s.schoolId !== req.params.id);
  writeDB(db);
  res.json({ success: true });
});

// --- ACADEMIC SUPERVISION ---
app.get("/api/supervisions/academic", (req: Request, res: Response) => {
  const db = readDB();
  res.json(db.supervisions_academic);
});

app.post("/api/supervisions/academic", (req: Request, res: Response) => {
  const db = readDB();
  const scores = {
    administrasi: Number(req.body.scores?.administrasi) || 80,
    apersepsi: Number(req.body.scores?.apersepsi) || 80,
    penguasaanMateri: Number(req.body.scores?.penguasaanMateri) || 80,
    metodePembelajaran: Number(req.body.scores?.metodePembelajaran) || 80,
    evaluasi: Number(req.body.scores?.evaluasi) || 80,
    pemanfaatanTIK: Number(req.body.scores?.pemanfaatanTIK) || 80
  };
  const averageScore = Math.round(
    Object.values(scores).reduce((a, b) => a + b, 0) / Object.keys(scores).length
  );

  const newSA = {
    id: `sa-${Date.now()}`,
    schoolId: req.body.schoolId,
    teacherName: req.body.teacherName || "Nama Guru",
    subject: req.body.subject || "Mata Pelajaran",
    date: req.body.date || new Date().toISOString().split('T')[0],
    scores,
    averageScore,
    notes: req.body.notes || "Tidak ada catatan.",
    recommendation: req.body.recommendation || "Rekomendasi default kelompok belajar.",
    status: req.body.status || "Selesai",
    documentName: req.body.documentName || "rpp_dummy_sipas.pdf"
  };

  db.supervisions_academic.push(newSA);
  writeDB(db);
  res.status(201).json(newSA);
});

// --- MANAGERIAL SUPERVISION ---
app.get("/api/supervisions/managerial", (req: Request, res: Response) => {
  const db = readDB();
  res.json(db.supervisions_managerial);
});

app.post("/api/supervisions/managerial", (req: Request, res: Response) => {
  const db = readDB();
  const scores = {
    standarIsi: Number(req.body.scores?.standarIsi) || 80,
    standarProses: Number(req.body.scores?.standarProses) || 80,
    standarKelulusan: Number(req.body.scores?.standarKelulusan) || 80,
    standarPendidik: Number(req.body.scores?.standarPendidik) || 80,
    standarSarpras: Number(req.body.scores?.standarSarpras) || 80,
    standarPengelolaan: Number(req.body.scores?.standarPengelolaan) || 80,
    standarPembiayaan: Number(req.body.scores?.standarPembiayaan) || 80,
    standarPenilaian: Number(req.body.scores?.standarPenilaian) || 80
  };
  const averageScore = Number((Object.values(scores).reduce((a, b) => a + b, 0) / Object.keys(scores).length).toFixed(1));

  const newSM = {
    id: `sm-${Date.now()}`,
    schoolId: req.body.schoolId,
    date: req.body.date || new Date().toISOString().split('T')[0],
    scores,
    averageScore,
    notes: req.body.notes || "Catatan manajerial pengawas.",
    recommendation: req.body.recommendation || "Fokus perbaikan pemenuhan sarpras laboratorium.",
    implementationStatus: req.body.implementationStatus || "Belum ditindaklanjuti"
  };

  db.supervisions_managerial.push(newSM);
  writeDB(db);
  res.status(201).json(newSM);
});

// --- PROGRAMS GUIDANCE ---
app.get("/api/programs", (req: Request, res: Response) => {
  const db = readDB();
  res.json(db.programs_guidance);
});

app.post("/api/programs", (req: Request, res: Response) => {
  const db = readDB();
  const newProgram = {
    id: `pg-${Date.now()}`,
    schoolId: req.body.schoolId,
    title: req.body.title || "Program Pembinaan Baru",
    target: req.body.target || "Indikator Ketercapaian Mutu",
    dateScheduled: req.body.dateScheduled || new Date().toISOString().split('T')[0],
    status: req.body.status || "Belum",
    notes: req.body.notes || "-"
  };
  db.programs_guidance.push(newProgram);
  writeDB(db);
  res.status(201).json(newProgram);
});

app.put("/api/programs/:id", (req: Request, res: Response) => {
  const db = readDB();
  const index = db.programs_guidance.findIndex((p: any) => p.id === req.params.id);
  if (index !== -1) {
    db.programs_guidance[index] = {
      ...db.programs_guidance[index],
      ...req.body
    };
    writeDB(db);
    res.json(db.programs_guidance[index]);
  } else {
    res.status(404).json({ error: "Program not found" });
  }
});

// --- FINDINGS & RECOMMENDATIONS ---
app.get("/api/findings", (req: Request, res: Response) => {
  const db = readDB();
  res.json(db.findings);
});

app.post("/api/findings", (req: Request, res: Response) => {
  const db = readDB();
  const newFinding = {
    id: `fd-${Date.now()}`,
    schoolId: req.body.schoolId,
    problem: req.body.problem || "Masalah yang teridentifikasi",
    rootCause: req.body.rootCause || "Belum dianalisis akar masalahnya",
    recommendation: req.body.recommendation || "Rekomendasi perbaikan otomatis",
    status: req.body.status || "Belum ditindaklanjuti",
    dateAdded: req.body.dateAdded || new Date().toISOString().split('T')[0],
    dateTarget: req.body.dateTarget || ""
  };
  db.findings.push(newFinding);
  writeDB(db);
  res.status(201).json(newFinding);
});

app.put("/api/findings/:id", (req: Request, res: Response) => {
  const db = readDB();
  const index = db.findings.findIndex((f: any) => f.id === req.params.id);
  if (index !== -1) {
    db.findings[index] = {
      ...db.findings[index],
      ...req.body
    };
    writeDB(db);
    res.json(db.findings[index]);
  } else {
    res.status(404).json({ error: "Finding not found" });
  }
});

// --- DOCUMENTS MANAGER ---
app.get("/api/documents", (req: Request, res: Response) => {
  const db = readDB();
  res.json(db.documents);
});

app.post("/api/documents", (req: Request, res: Response) => {
  const db = readDB();
  const newDoc = {
    id: `doc-${Date.now()}`,
    schoolId: req.body.schoolId || "school-1",
    filename: req.body.filename || "dokumen_unggah.pdf",
    category: req.body.category || "Umum",
    dateUploaded: new Date().toISOString().split('T')[0],
    size: req.body.size || "1.5 MB"
  };
  db.documents.push(newDoc);
  writeDB(db);
  res.status(201).json(newDoc);
});

// --- DIRECT DATABASE EXPORTER (FOR PDF/EXCEL SCHEMA MAPPING) ---
app.get("/api/sipas/stats", (req: Request, res: Response) => {
  const db = readDB();
  const schoolCount = db.schools.length;
  const saCount = db.supervisions_academic.length;
  const smCount = db.supervisions_managerial.length;
  const programCount = db.programs_guidance.length;
  const unresolvedFindings = db.findings.filter((f: any) => f.status !== "Selesai").length;

  // Compute standard scores
  const snpAverage = {
    standarIsi: 0,
    standarProses: 0,
    standarKelulusan: 0,
    standarPendidik: 0,
    standarSarpras: 0,
    standarPengelolaan: 0,
    standarPembiayaan: 0,
    standarPenilaian: 0
  };

  db.supervisions_managerial.forEach((sm: any) => {
    Object.keys(snpAverage).forEach((key) => {
      (snpAverage as any)[key] += sm.scores[key] || 0;
    });
  });

  const managerialCount = db.supervisions_managerial.length || 1;
  Object.keys(snpAverage).forEach((key) => {
    (snpAverage as any)[key] = Number(((snpAverage as any)[key] / managerialCount).toFixed(1));
  });

  res.json({
    schoolCount,
    academicSupervisionCount: saCount,
    managerialSupervisionCount: smCount,
    programCount,
    unresolvedFindings,
    snpAverage
  });
});

// --- 10. AI ASSISTANT IMPLEMENTATION (GEMINI INTEGRATION) ---
app.post("/api/ai/analyze", async (req: Request, res: Response) => {
  const { schoolId, actionMode } = req.body;
  const db = readDB();

  const school = db.schools.find((s: any) => s.id === schoolId);
  if (!school) {
    return res.status(404).json({ error: "Sekolah tidak ditemukan" });
  }

  // Gather all specific details of targeted school
  const academicReports = db.supervisions_academic.filter((s: any) => s.schoolId === schoolId);
  const managerialReports = db.supervisions_managerial.filter((s: any) => s.schoolId === schoolId);
  const schoolFindings = db.findings.filter((s: any) => s.schoolId === schoolId);

  // Fallback check if Gemini Key is not configured
  const apiKey = process.env.GEMINI_API_KEY;

  const schoolDataFormatted = `
  Nama Sekolah: ${school.name}
  NPSN: ${school.npsn}
  Akreditasi: ${school.akreditasi}
  Kepala Sekolah: ${school.kepalaSekolah}
  Jumlah Guru: ${school.guruCount}, Jumlah Siswa: ${school.muridCount}
  
  === Riwayat Supervisi Akademik Guru ===
  ${academicReports.length === 0 ? "Belum ada supervisi akademik" : academicReports.map((r: any) => `
  - Guru: ${r.teacherName}, Mapel: ${r.subject} (${r.date})
    Nilai Rata-rata: ${r.averageScore}/100.
    Rincian Nilai: Administrasi(${r.scores.administrasi}), Apersepsi(${r.scores.apersepsi}), Penguasaan Materi(${r.scores.penguasaanMateri}), Metode(${r.scores.metodePembelajaran}), Evaluasi(${r.scores.evaluasi}), TIK(${r.scores.pemanfaatanTIK})
    Catatan: ${r.notes}
  `).join("\n")}

  === Riwayat Capaian 8 Standar Nasional Pendidikan (Supervisi Manajerial) ===
  ${managerialReports.length === 0 ? "Belum ada supervisi manajerial" : managerialReports.map((r: any) => `
  - Tanggal Supervisi: ${r.date}
    Nilai Rata-rata SNP: ${r.averageScore}/100
    Rincian Standar:
    1. Standar Isi: ${r.scores.standarIsi}
    2. Standar Proses: ${r.scores.standarProses}
    3. Standar Kompetensi Lulusan: ${r.scores.standarKelulusan}
    4. Standar Pendidik & Tendik: ${r.scores.standarPendidik}
    5. Standar Sarpras: ${r.scores.standarSarpras}
    6. Standar Pengelolaan: ${r.scores.standarPengelolaan}
    7. Standar Pembiayaan: ${r.scores.standarPembiayaan}
    8. Standar Penilaian: ${r.scores.standarPenilaian}
    Temuan/Catatan: ${r.notes}
  `).join("\n")}

  === Temuan Kasus/Masalah di Lapangan ===
  ${schoolFindings.length === 0 ? "Tidak ada temuan masalah aktif" : schoolFindings.map((f: any) => `
  - Masalah: ${f.problem} (Status: ${f.status})
    Akar Masalah: ${f.rootCause}
    Solusi Awal: ${f.recommendation}
  `).join("\n")}
  `;

  let prompt = "";
  if (actionMode === "full_analysis") {
    prompt = `Sebagai AI Konsultan Pengawas Sekolah Senior dalam sistem SIPAS Indonesia, buatkan analisis komprehensif, evaluasi mutu, dan program taktis pembinaan berdasarkan data sekolah berikut:
    ${schoolDataFormatted}
    
    Format Laporan Output yang diinginkan:
    1. **ANALISIS SWOT SINGKAT** (Komentari kekuatan sarpras/guru/kepsek, kelemahan, peluang, ancaman).
    2. **REKOMENDASI PROGRAM PEMBINAAN UTAMA** (Maksimal 3 usulan bimbingan taktis, dengan kriteria target & strategi pelaksanaannya).
    3. **RENCANA TINDAK LANJUT SUPERVISI** (Penyelesaian temuan aktif, alokasi anggaran dana BOS, dsb).
    Tuliskan analisis dalam Bahasa Indonesia yang formal, berwibawa, dan sangat solutif.`;
  } else if (actionMode === "guidance_plan") {
    prompt = `Rancanglah sebuah 'Rencana Tindak Lanjut & Program Kerja Pembinaan Tahunan' formal untuk Pengawas Sekolah di ${school.name} berdasarkan potret mutu berikut:
    ${schoolDataFormatted}
    
    Harap sertakan usulan:
    - Judul Program Pembinaan Utama
    - Target Indikator Keberhasilan yang SMART
    - Timeline pelaksanaan taktis (Semester 1 / Semester 2)
    - Petunjuk implementasi khusus perbaikan RPP terdiferensiasi (sesuai Kurikulum Merdeka) atau optimalisasi Laboratorium.
    Gunakan format Markdown Indonesia yang rapih, terstruktur dengan list point.`;
  } else {
    prompt = `Buatkan draf 'Laporan Ringkasan Kunjungan Pengawasan & Supervisi Resmi' untuk Kepala Dinas Pendidikan Kabupaten/Kota daerah dari ${school.name} yang merangkum hasil inspeksi berikut:
    ${schoolDataFormatted}
    
    Draf harus berisi:
    1. **Ringkasan Kondisi Sekolah Binaan**
    2. **Evaluasi Capaian Standar Nasional Pendidikan (SNP) Terendah & Tertinggi**
    3. **Rekomendasi Kebijakan untuk Dinas Pendidikan** (Apakah mendesak bantuan rehabilitasi fisik sarpras atau program pelatihan terpusat).
    Tuliskan dalam gaya memo dinas pemerintahan Bahasa Indonesia yang bersih.`;
  }

  if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey === "MOCK_KEY") {
    // Elegant local fallback text generation if API Key is not populated, preventing any crash!
    const scores = academicReports.length > 0 ? academicReports[0].scores : { evaluasi: 70, pemanfaatanTIK: 75 };
    const problemStr = schoolFindings.length > 0 ? schoolFindings[0].problem : "distribusi modul ajar";
    
    let fallbackText = "";
    if (actionMode === "full_analysis") {
      fallbackText = `### 📑 LAPORAN ANALISIS MUTU MANDIRI (SIPAS LOKAL) - ${school.name}

**1. Analisis SWOT Potret Mutu Pendidikan**
*   **Strengths (Kekuatan):** Kepemimpinan sekolah oleh ${school.kepalaSekolah} dinilai solid. Dukungan sarana penunjang kognitif di sekolah tergolong kooperatif.
*   **Weaknesses (Kelemahan):** Integrasi instrumen evaluasi pembelajaran mandiri guru masih moderat (Rata-rata Penilaian: ${scores.evaluasi}/100) dan penguasaan TIK pembelajaran bervariasi (${scores.pemanfaatanTIK}/100).
*   **Opportunities (Peluang):** Implementasi program pendampingan Kurikulum Merdeka Mandiri Berbagi yang didukung Dinas Pendidikan.
*   **Threats (Ancaman):** Kesenjangan pemahaman kurikulum operasional jika tidak dilakukan bimbingan berkelanjutan bagi guru-guru senior.

**2. Rekomendasi Program Pembinaan Pengawas (Tahun Pelajaran 2026/2027)**
*   **Program I:** *Workshop Klinik Desain Pembelajaran Terdiferensiasi*. Target: 100% Guru mampu menyusun Modul Ajar adaptif.
*   **Program II:** *Peningkatan Kapasitas Tata Kelola Laboratorium & Alat Bantu TIK*. Sasaran target: Mengaktifkan pemanfaatan Chromebook bantuan pemerintah daerah.

**3. Rencana Tindak Lanjut Temuan**
*   Segera tindak lanjuti temuan mengenai *"${problemStr}"*.
*   Revisi alokasi RKAS Dana BOS Semester II agar berfokus pada buku ajar cetak guru dan pemeliharaan alat praktikum IPA yang rusak.`;
    } else if (actionMode === "guidance_plan") {
      fallbackText = `### 📅 RENCANA TINDAK LANJUT PEMBINAAN DAN SUPERVISI - ${school.name}

**Rekomendasi Utama Pembinaan Akademik & Manajerial:**

1.  **Judul Program:** Pendampingan Penyusunan Asesmen Diagnostik Pembelajaran Berbasis Data.
    *   **Target Indikator:** Guru secara mandiri merancang LKPD (Lembar Kerja Peserta Didik) berbasis tingkat kepahaman individu siswa.
    *   **Timeline:** Awal Semester Ganjil 2026 (Juli - Agustus).
    *   **Modul Kerja:** Melatih penggunaan akun belajar.id dan Google Form sebagai instrumen pre-test interaktif.

2.  **Judul Program:** Supervisi Manajerial: Pemantapan RKAS Akuntabel & Pemenuhan Standar Sarana Prasarana.
    *   **Target Indikator:** 100% Anggaran BOS teralokasi sesuai skala prioritas rapor pendidikan tahun sebelumnya.
    *   **Timeline:** Oktober 2026.
    *   **Pelaksana:** Pengawas Sekolah bersinergi dengan Bendahara BOS dan Komite Sekolah.`;
    } else {
      fallbackText = `### ✉️ DRAF MEMO LAPORAN RESMI KEPADA DINAS PENDIDIKAN
**Hal:** *Laporan Hasil Supervisi Pengawasan Mutu Sekolah Binaan – ${school.name}*

Kepada Yth.
**Kepala Dinas Pendidikan & Kebudayaan Kabupaten/Kota**

Melalui laporan SIPAS ini, Pengawas Sekolah melaporkan potret capaian supervisi manajerial dan akademik di ${school.name} dengan ringkasan sebagai berikut:

1.  **Potret Capaian Akademik:** Nilai supervisi pembelajaran guru berada di kisaran rata-rata yang cukup memuaskan. Guru pengajar atas nama Ibu/Bapak pendidik terus dibina memperkuat metode student-centered active learning.
2.  **Kondisi Standar Nasional Pendidikan (SNP):** Prioritas kebutuhan sarana penunjang fisik di sekolah ini adalah bantuan penataan ruang kelas dan pemutakhiran pustaka Kurikulum Merdeka.
3.  **Rekomendasi Kebijakan Makro:** Mohon Dinas memfasilitasi program bantuan mebeler sekolah serta mengikutsertakan kepala sekolah ${school.kepalaSekolah} dalam program diklat kepemimpinan sekolah penggerak nasional.

*Pengawas Sekolah Binaan SIPAS*`;
    }
    
    return res.json({ analysis: fallbackText, generatedBy: "Smart Local Evaluator" });
  }

  try {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "Anda adalah asisten AI ahli dalam penjaminan mutu pendidikan, evaluasi sekolah, supervisi murni di Indonesia, dan ahli pengawas sekolah nasional."
      }
    });

    res.json({
      analysis: response.text || "Gagal memproses draf laporan. Silakan coba kembali.",
      generatedBy: "Gemini 3.5 Flash Model"
    });
  } catch (err: any) {
    console.error("Gemini API Error:", err);
    res.status(500).json({ error: "Gagal berkomunikasi dengan server Gemini. Penyebab: " + err.message });
  }
});

// -------------------------------------------------------------
// VITE OR STATIC FILE INTEGRATION
// -------------------------------------------------------------
const startServer = async () => {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in development mode with Vite middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in production mode serving static dist files...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`SIPAS Server active and listening on port http://localhost:${PORT}`);
  });
};

startServer().catch((err) => {
  console.error("Critical error starting Express + Vite server:", err);
});
