import React, { useState, useEffect } from "react";
import { 
  Building2, BookOpen, ClipboardCheck, Calendar, AlertTriangle, FileText, 
  MapPin, Plus, Trash2, CheckCircle2, RefreshCw, Sparkles, Send, Download, 
  Clock, CheckCircle, AlertCircle, Eye, FilePieChart, User, Filter, Smartphone, LogOut,
  Menu, X
} from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend 
} from "recharts";
import { School, AcademicSupervision, ManagerialSupervision, ProgramGuidance, Finding, DocumentInfo, SIPASStats } from "./types";
// @ts-ignore
import sipasLogo from "./assets/images/sipas_logo_1782324336112.jpg";

export default function App() {
  // User Authentication State
  const [user, setUser] = useState<{ name: string; role: string; email: string; schoolId?: string } | null>(() => {
    try {
      const saved = localStorage.getItem("sipas_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginRole, setLoginRole] = useState("pengawas"); // pengawas, kepsek, dinas
  const [loginSelectedSchool, setLoginSelectedSchool] = useState("school-1");
  const [loginError, setLoginError] = useState("");

  // Navigation & UI State
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>("school-1");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isMobilePreview, setIsMobilePreview] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: "success" | "error" | "info" } | null>({
    text: "Sistem SIPAS sinkronisasi sukses dengan Cloud.",
    type: "success"
  });

  // DB States
  const [schools, setSchools] = useState<School[]>([]);
  const [academicSups, setAcademicSups] = useState<AcademicSupervision[]>([]);
  const [managerialSups, setManagerialSups] = useState<ManagerialSupervision[]>([]);
  const [programs, setPrograms] = useState<ProgramGuidance[]>([]);
  const [findings, setFindings] = useState<Finding[]>([]);
  const [documents, setDocuments] = useState<DocumentInfo[]>([]);
  const [stats, setStats] = useState<SIPASStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Forms States
  const [showAddSchool, setShowAddSchool] = useState(false);
  const [newSchool, setNewSchool] = useState({
    name: "", npsn: "", kepalaSekolah: "", akreditasi: "A", guruCount: 25, muridCount: 350, address: "", lat: -1.24, lng: 116.8
  });

  const [showAddAcademic, setShowAddAcademic] = useState(false);
  const [newAcademic, setNewAcademic] = useState({
    schoolId: "school-1", teacherName: "", subject: "",
    scores: { administrasi: 80, apersepsi: 80, penguasaanMateri: 80, metodePembelajaran: 80, evaluasi: 80, pemanfaatanTIK: 80 },
    notes: "", recommendation: "", documentName: "RPP_Supervisi_Pembelajaran.pdf"
  });

  const [showAddManagerial, setShowAddManagerial] = useState(false);
  const [newManagerial, setNewManagerial] = useState({
    schoolId: "school-1",
    scores: {
      standarIsi: 80, standarProses: 80, standarKelulusan: 80, standarPendidik: 80,
      standarSarpras: 80, standarPengelolaan: 80, standarPembiayaan: 80, standarPenilaian: 80
    },
    notes: "", recommendation: "", implementationStatus: "Belum ditindaklanjuti"
  });

  const [showAddProgram, setShowAddProgram] = useState(false);
  const [newProgram, setNewProgram] = useState({
    schoolId: "school-1", title: "", target: "", dateScheduled: "", status: "Belum" as const, notes: "-"
  });

  const [showAddFinding, setShowAddFinding] = useState(false);
  const [newFinding, setNewFinding] = useState({
    schoolId: "school-1", problem: "", rootCause: "", recommendation: "", status: "Belum ditindaklanjuti" as const, dateTarget: ""
  });

  const [newDoc, setNewDoc] = useState({ schoolId: "school-1", filename: "", category: "Kurikulum" as const, size: "1.2 MB" });

  // AI Assistant States
  const [aiSchoolId, setAiSchoolId] = useState<string>("school-1");
  const [aiActionMode, setAiActionMode] = useState<string>("full_analysis");
  const [aiResponse, setAiResponse] = useState<string>("");
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [aiGeneratedBy, setAiGeneratedBy] = useState<string>("");

  // Signature state
  const [inspectorName, setInspectorName] = useState<string>("Ekwanto, S.Pd., M.M.,");
  const [nipNumber, setNipNumber] = useState<string>("19741203 199903 1 002");
  const [isSigned, setIsSigned] = useState<boolean>(false);

  // Fetch all data
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [resSchools, resAcad, resMan, resProg, resFind, resDoc, resStats] = await Promise.all([
        fetch("/api/schools").then(r => r.json()),
        fetch("/api/supervisions/academic").then(r => r.json()),
        fetch("/api/supervisions/managerial").then(r => r.json()),
        fetch("/api/programs").then(r => r.json()),
        fetch("/api/findings").then(r => r.json()),
        fetch("/api/documents").then(r => r.json()),
        fetch("/api/sipas/stats").then(r => r.json()),
      ]);

      setSchools(resSchools);
      setAcademicSups(resAcad);
      setManagerialSups(resMan);
      setPrograms(resProg);
      setFindings(resFind);
      setDocuments(resDoc);
      setStats(resStats);
    } catch (err) {
      console.error(err);
      showToast("Gagal memuat data dari server SIPAS.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const showToast = (text: string, type: "success" | "error" | "info" = "success") => {
    setStatusMessage({ text, type });
    setTimeout(() => setStatusMessage(null), 5000);
  };

  // Create Handlers
  const handleAddSchool = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/schools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSchool)
      });
      if (res.ok) {
        showToast("Sekolah binaan berhasil didaftarkan ke sistem.", "success");
        setShowAddSchool(false);
        setNewSchool({ name: "", npsn: "", kepalaSekolah: "", akreditasi: "A", guruCount: 25, muridCount: 350, address: "", lat: -1.24, lng: 116.8 });
        fetchData();
      }
    } catch (err) {
      showToast("Gagal mendaftarkan sekolah.", "error");
    }
  };

  const handleDeleteSchool = async (id: string) => {
    if (!confirm("Are you sure? This will delete all record associations.")) return;
    try {
      const res = await fetch(`/api/schools/${id}`, { method: "DELETE" });
      if (res.ok) {
        showToast("Informasi Sekolah & seluruh histori supervisi dihapus.", "success");
        if (selectedSchoolId === id) setSelectedSchoolId(schools.find(s => s.id !== id)?.id || "");
        fetchData();
      }
    } catch (err) {
      showToast("Gagal menghapus sekolah.", "error");
    }
  };

  const handleAddAcademicSupervision = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/supervisions/academic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAcademic)
      });
      if (res.ok) {
        showToast("Evaluasi supervisi akademik guru berhasil didokumentasikan.", "success");
        setShowAddAcademic(false);
        setNewAcademic({
          schoolId: "school-1", teacherName: "", subject: "",
          scores: { administrasi: 80, apersepsi: 80, penguasaanMateri: 80, metodePembelajaran: 80, evaluasi: 80, pemanfaatanTIK: 80 },
          notes: "", recommendation: "", documentName: "RPP_Supervisi_Pembelajaran.pdf"
        });
        fetchData();
      }
    } catch (err) {
      showToast("Gagal menambah supervisi akademik.", "error");
    }
  };

  const handleAddManagerialSupervision = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/supervisions/managerial", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newManagerial)
      });
      if (res.ok) {
        showToast("Evaluasi manajerial 8 SNP sekolah didokumentasikan.", "success");
        setShowAddManagerial(false);
        setNewManagerial({
          schoolId: "school-1",
          scores: {
            standarIsi: 80, standarProses: 80, standarKelulusan: 80, standarPendidik: 80,
            standarSarpras: 80, standarPengelolaan: 80, standarPembiayaan: 80, standarPenilaian: 80
          },
          notes: "", recommendation: "", implementationStatus: "Belum ditindaklanjuti"
        });
        fetchData();
      }
    } catch (err) {
      showToast("Gagal menambah supervisi manajerial.", "error");
    }
  };

  const handleAddProgram = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/programs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProgram)
      });
      if (res.ok) {
        showToast("Agenda program bimbingan tahunan didaftarkan.", "success");
        setShowAddProgram(false);
        setNewProgram({ schoolId: "school-1", title: "", target: "", dateScheduled: "", status: "Belum", notes: "-" });
        fetchData();
      }
    } catch (err) {
      showToast("Gagal menambah program pembinaan.", "error");
    }
  };

  const handleUpdateProgramStatus = async (id: string, currentStatus: "Belum" | "Proses" | "Selesai") => {
    const nextStatuses: Record<string, "Belum" | "Proses" | "Selesai"> = {
      "Belum": "Proses",
      "Proses": "Selesai",
      "Selesai": "Belum"
    };
    const next = nextStatuses[currentStatus];
    try {
      const res = await fetch(`/api/programs/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next })
      });
      if (res.ok) {
        showToast(`Status bimbingan diubah ke: ${next}`, "success");
        fetchData();
      }
    } catch (err) {
      showToast("Gagal mengubah status pembinaan.", "error");
    }
  };

  const handleAddFinding = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/findings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newFinding)
      });
      if (res.ok) {
        showToast("Temuan masalah & analisis akar masalah didokumentasikan.", "success");
        setShowAddFinding(false);
        setNewFinding({ schoolId: "school-1", problem: "", rootCause: "", recommendation: "", status: "Belum ditindaklanjuti", dateTarget: "" });
        fetchData();
      }
    } catch (err) {
      showToast("Gagal menambah temuan.", "error");
    }
  };

  const handleUpdateFindingStatus = async (id: string, currentStatus: "Belum ditindaklanjuti" | "Proses" | "Selesai") => {
    const nextStatuses: Record<string, "Belum ditindaklanjuti" | "Proses" | "Selesai"> = {
      "Belum ditindaklanjuti": "Proses",
      "Proses": "Selesai",
      "Selesai": "Belum ditindaklanjuti"
    };
    const next = nextStatuses[currentStatus];
    try {
      const res = await fetch(`/api/findings/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next })
      });
      if (res.ok) {
        showToast(`Status penyelesaian masalah diubah ke: ${next}`, "success");
        fetchData();
      }
    } catch (err) {
      showToast("Gagal mengubah status masalah.", "error");
    }
  };

  const handleUploadDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDoc.filename) {
      showToast("Masukkan nama berkas.", "error");
      return;
    }
    try {
      const res = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newDoc)
      });
      if (res.ok) {
        showToast("Dokumen pendukung / instrumen berhasil diarsipkan.", "success");
        setNewDoc({ schoolId: "school-1", filename: "", category: "Kurikulum", size: "1.2 MB" });
        fetchData();
      }
    } catch (err) {
      showToast("Gagal mengunggah berkas.", "error");
    }
  };

  // Run AI Analysis
  const handleAIAnalyze = async () => {
    setIsAiLoading(true);
    setAiResponse("");
    try {
      const res = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ schoolId: aiSchoolId, actionMode: aiActionMode })
      });
      const data = await res.json();
      if (data.analysis) {
        setAiResponse(data.analysis);
        setAiGeneratedBy(data.generatedBy || "SIPAS Engine");
        showToast("Analisis AI cerdas berhasil dirampungkan.", "success");
      } else {
        setAiResponse("Maaf, gagal memproses analisis.");
      }
    } catch (err) {
      setAiResponse("Koneksi gagal saat menghubungi asisten AI.");
      showToast("Asisten AI sibuk. Silakan coba sesaat lagi.", "error");
    } finally {
      setIsAiLoading(false);
    }
  };

  // Filtered Schools
  const filteredSchools = schools.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.npsn.includes(searchTerm) || 
    s.kepalaSekolah.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeSchool = schools.find(s => s.id === selectedSchoolId) || schools[0];

  // Helper for ratings
  const getAkreditasiBadge = (akr: string) => {
    const base = "px-2 py-0.5 rounded text-[11px] font-bold inline-flex items-center justify-center ";
    let colorClasses = "";
    if (akr === "A") colorClasses = "bg-emerald-100 text-emerald-800 border border-emerald-300";
    else if (akr === "B") colorClasses = "bg-blue-100 text-blue-800 border border-blue-300";
    else colorClasses = "bg-amber-100 text-amber-800 border border-amber-300";
    
    return (
      <span className={`${base} ${colorClasses}`}>
        {akr}
      </span>
    );
  };

  const getStatusBadge = (st: string) => {
    const base = "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase inline-flex items-center gap-1 ";
    let colorClasses = "";
    if (st === "Selesai" || st === "STABIL") {
      colorClasses = "bg-emerald-50 text-emerald-700 border border-emerald-200";
    } else if (st === "Proses" || st === "PERLU BINAAN") {
      colorClasses = "bg-amber-50 text-amber-700 border border-amber-200";
    } else {
      colorClasses = "bg-rose-50 text-rose-700 border border-rose-200";
    }
    
    return (
      <span className={`${base} ${colorClasses}`}>
        {st}
      </span>
    );
  };

  // Prepare radar chart data for standards
  const getRadarDataForSchool = () => {
    if (!activeSchool) return [];
    // find manager reports for activeSchool
    const schoolSms = managerialSups.filter(m => m.schoolId === activeSchool.id);
    if (schoolSms.length === 0) {
      // fallback to global averages or dummy profile relative
      return [
        { subject: "Standar Isi", score: 80 },
        { subject: "Standar Proses", score: 85 },
        { subject: "S. Kelulusan", score: 88 },
        { subject: "S. Pendidik", score: 79 },
        { subject: "Standar Sarpras", score: 72 },
        { subject: "S. Pengelolaan", score: 83 },
        { subject: "S. Pembiayaan", score: 80 },
        { subject: "Standar Penilaian", score: 81 },
      ];
    }
    const latest = schoolSms[schoolSms.length - 1];
    return [
      { subject: "Standar Isi", score: latest.scores.standarIsi },
      { subject: "Standar Proses", score: latest.scores.standarProses },
      { subject: "S. Kelulusan", score: latest.scores.standarKelulusan },
      { subject: "S. Pendidik", score: latest.scores.standarPendidik },
      { subject: "Standar Sarpras", score: latest.scores.standarSarpras },
      { subject: "S. Pengelolaan", score: latest.scores.standarPengelolaan },
      { subject: "S. Pembiayaan", score: latest.scores.standarPembiayaan },
      { subject: "Standar Penilaian", score: latest.scores.standarPenilaian },
    ];
  };

  // Bar chart overall compare schools
  const getBarChartData = () => {
    return schools.map(s => {
      const sups = academicSups.filter(a => a.schoolId === s.id);
      const man = managerialSups.filter(m => m.schoolId === s.id);
      const avgAca = sups.length > 0 ? Math.round(sups.reduce((acc, c) => acc + c.averageScore, 0) / sups.length) : 80;
      const avgMan = man.length > 0 ? Math.round(man.reduce((acc, c) => acc + c.averageScore, 0) / man.length) : 78;
      return {
        name: s.name.split(" ")[0] + " " + (s.name.split(" ")[2] || ""),
        "Akademik (Guru)": avgAca,
        "Manajerial (SNP)": avgMan
      };
    });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    // Get final values used for login
    let email = loginEmail;
    if (!email) {
      if (loginRole === "pengawas") email = "pengawas@sipas.go.id";
      else if (loginRole === "dinas") email = "dinas@pendidikan.go.id";
      else email = "kepsek@sipas.go.id";
    }

    let password = loginPassword;
    if (!password) {
      if (loginRole === "pengawas") password = "pengawas123";
      else if (loginRole === "dinas") password = "dinas123";
      else password = "kepsek123";
    }

    const runOfflineFallback = () => {
      const fallbackUsers = [
        {
          email: "pengawas@sipas.go.id",
          password: "pengawas123",
          name: "Ekwanto, S.Pd., M.M.,",
          role: "pengawas"
        },
        {
          email: "kepsek@sipas.go.id",
          password: "kepsek123",
          name: "Drs. H. Bambang Wijanarko, M.Pd.",
          role: "kepsek"
        },
        {
          email: "dinas@pendidikan.go.id",
          password: "dinas123",
          name: "Admin Dinas Pendidikan",
          role: "dinas"
        }
      ];

      const matched = fallbackUsers.find(
        (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
      );

      if (matched) {
        const authenticatedUser: { name: string; role: string; email: string; schoolId?: string } = {
          name: matched.name,
          role: matched.role,
          email: matched.email,
        };
        
        if (authenticatedUser.role === "kepsek") {
          authenticatedUser.schoolId = loginSelectedSchool;
          setSelectedSchoolId(loginSelectedSchool);
        }

        localStorage.setItem("sipas_user", JSON.stringify(authenticatedUser));
        setUser(authenticatedUser);
        showToast(`Selamat datang kembali (Mode Offline), ${authenticatedUser.name}!`, "success");
      } else {
        setLoginError("Email atau kata sandi tidak benar!");
      }
    };

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      // If the API endpoint is not found (e.g. 404 on Vercel), fall back to offline verification
      if (response.status === 404) {
        console.warn("API login not found, falling back to offline verification.");
        runOfflineFallback();
        return;
      }

      const result = await response.json();

      if (!response.ok || result.status === "error") {
        setLoginError(result.message || "Gagal masuk. Periksa email atau kata sandi Anda.");
        return;
      }

      const authenticatedUser = result.user;
      
      // If kepsek, ensure the selected school matches
      if (authenticatedUser.role === "kepsek") {
        authenticatedUser.schoolId = loginSelectedSchool;
        setSelectedSchoolId(loginSelectedSchool);
      }

      localStorage.setItem("sipas_user", JSON.stringify(authenticatedUser));
      setUser(authenticatedUser);
      showToast(`Selamat datang kembali, ${authenticatedUser.name}!`, "success");
    } catch (err) {
      console.warn("Server unavailable, falling back to offline verification:", err);
      runOfflineFallback();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("sipas_user");
    setUser(null);
    showToast("Anda telah keluar dari sistem.", "info");
  };

  const loginWithDemo = async (role: string, schoolId?: string) => {
    setLoginError("");
    let email = "pengawas@sipas.go.id";
    let password = "pengawas123";

    if (role === "kepsek") {
      email = "kepsek@sipas.go.id";
      password = "kepsek123";
    } else if (role === "dinas") {
      email = "dinas@pendidikan.go.id";
      password = "dinas123";
    }

    const runOfflineDemoFallback = () => {
      let demoUser: { name: string; role: string; email: string; schoolId?: string } = {
        name: "Ekwanto, S.Pd., M.M.,",
        role: "pengawas",
        email: "pengawas@sipas.go.id",
      };

      if (role === "kepsek") {
        const targetId = schoolId || (schools[0]?.id || "school-1");
        const sch = schools.find(s => s.id === targetId) || schools[0];
        demoUser = {
          name: sch ? `Kepsek ${sch.name}` : "Kepala Sekolah Demo",
          role: "kepsek",
          email: "kepsek@sipas.go.id",
          schoolId: targetId,
        };
        setSelectedSchoolId(targetId);
      } else if (role === "dinas") {
        demoUser = {
          name: "Admin Dinas Pendidikan",
          role: "dinas",
          email: "dinas@pendidikan.go.id",
        };
      }

      localStorage.setItem("sipas_user", JSON.stringify(demoUser));
      setUser(demoUser);
      showToast(`Login Demo Sukses (Mode Offline): ${demoUser.name}`, "success");
    };

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      if (response.status === 404) {
        runOfflineDemoFallback();
        return;
      }

      const result = await response.json();

      if (!response.ok || result.status === "error") {
        showToast(result.message || "Gagal login demo.", "error");
        return;
      }

      const authenticatedUser = result.user;

      if (role === "kepsek") {
        const targetId = schoolId || (schools[0]?.id || "school-1");
        authenticatedUser.schoolId = targetId;
        setSelectedSchoolId(targetId);
      }

      localStorage.setItem("sipas_user", JSON.stringify(authenticatedUser));
      setUser(authenticatedUser);
      showToast(`Login Demo Sukses: ${authenticatedUser.name}`, "success");
    } catch (err) {
      console.warn("Server unavailable for demo login, falling back to offline:", err);
      runOfflineDemoFallback();
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen w-full bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden font-sans">
        {/* Abstract background decorative blobs */}
        <div className="absolute top-0 -left-4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 -right-4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />

        <div className="w-full max-w-md bg-slate-800/80 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-6 shadow-2xl relative z-10 text-white transition-all duration-300">
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-white rounded-2xl p-1.5 flex items-center justify-center mx-auto shadow-lg shadow-blue-500/10 overflow-hidden">
              <img 
                src={sipasLogo} 
                alt="SIPAS Logo" 
                className="w-full h-full object-contain rounded-xl"
                referrerPolicy="no-referrer"
              />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white mt-4">SIPAS LOGIN</h1>
            <p className="text-xs text-slate-400 mt-1">Sistem Informasi Pengawasan & Pendampingan Akademik Sekolah</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {loginError && (
              <div className="bg-red-500/15 border border-red-500/30 text-red-200 text-xs p-3 rounded-lg flex items-center gap-2">
                <AlertCircle size={14} className="shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Email / Username</label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Kata Sandi</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 mt-2"
            >
              Masuk ke Aplikasi
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-slate-50 font-sans text-slate-900 overflow-hidden relative">
      
      {/* Mobile Sidebar Overlay Backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar Navigation - Responsive: Hidden as a slide-out drawer on mobile, static on desktop */}
      <aside className={`bg-slate-900 text-white flex flex-col shrink-0 transition-all duration-300 ease-in-out z-50
        fixed inset-y-0 left-0 w-64 md:relative md:translate-x-0 md:flex
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}>
        <div className="p-4 border-b border-slate-800 flex items-center justify-between gap-2 bg-slate-950 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white rounded-lg p-0.5 flex items-center justify-center shadow-md overflow-hidden">
              <img 
                src={sipasLogo} 
                alt="SIPAS Logo" 
                className="w-full h-full object-contain rounded"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight text-white leading-none">SIPAS</h1>
              <p className="text-[10px] text-slate-400 mt-0.5">Sistem Pengawas</p>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            {/* Close button on mobile */}
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors md:hidden"
              title="Tutup Menu"
            >
              <X size={16} />
            </button>
            <span className="text-[10px] font-mono bg-blue-900/40 text-blue-300 px-1.5 py-0.5 rounded border border-blue-700/50">v2.1</span>
          </div>
        </div>
 
        {/* Navigation Items */}
        <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
          <div className="text-[10px] font-semibold text-slate-500 uppercase px-3.5 py-1 tracking-wider">
            Menu Utama
          </div>
 
          <button 
            onClick={() => { setActiveTab("dashboard"); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-150 ${activeTab === "dashboard" ? "bg-blue-600 text-white font-bold shadow-md" : "text-slate-300 hover:bg-slate-800"}`}
          >
            <span>📊</span>
            <span>Dashboard Pengawas</span>
          </button>
 
          <button 
            onClick={() => { setActiveTab("sekolah"); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-150 ${activeTab === "sekolah" ? "bg-blue-600 text-white font-bold shadow-md" : "text-slate-300 hover:bg-slate-800"}`}
          >
            <span>🏫</span>
            <span className="flex-1 text-left">Sekolah Binaan</span>
          </button>
 
          <div className="text-[10px] font-semibold text-slate-500 uppercase px-3.5 py-1 tracking-wider pt-2">
            Pengawasan Lapangan
          </div>
 
          <button 
            onClick={() => { setActiveTab("akademik"); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-150 ${activeTab === "akademik" ? "bg-blue-600 text-white font-bold shadow-md" : "text-slate-300 hover:bg-slate-800"}`}
          >
            <span>📝</span>
            <span>Supervisi Akademik</span>
          </button>
 
          <button 
            onClick={() => { setActiveTab("manajerial"); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-150 ${activeTab === "manajerial" ? "bg-blue-600 text-white font-bold shadow-md" : "text-slate-300 hover:bg-slate-800"}`}
          >
            <span>💼</span>
            <span>Supervisi Manajerial</span>
          </button>
 
          <button 
            onClick={() => { setActiveTab("pembinaan"); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-150 ${activeTab === "pembinaan" ? "bg-blue-600 text-white font-bold shadow-md" : "text-slate-300 hover:bg-slate-800"}`}
          >
            <span>📅</span>
            <span>Program Pembinaan</span>
          </button>
 
          <button 
            onClick={() => { setActiveTab("temuan"); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-150 ${activeTab === "temuan" ? "bg-blue-600 text-white font-bold shadow-md" : "text-slate-300 hover:bg-slate-800"}`}
          >
            <span>⚠️</span>
            <span>Temuan & Tindak Lanjut</span>
          </button>
 
          <div className="text-[10px] font-semibold text-slate-500 uppercase px-3.5 py-1 tracking-wider pt-2">
            Sistem & AI
          </div>
 
          <button 
            onClick={() => { setActiveTab("laporan"); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-150 ${activeTab === "laporan" ? "bg-blue-600 text-white font-bold shadow-md" : "text-slate-300 hover:bg-slate-800"}`}
          >
            <span>📂</span>
            <span>Laporan & Dokumen</span>
          </button>
 
          <button 
            onClick={() => { setActiveTab("ai_assistant"); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-150 ${activeTab === "ai_assistant" ? "bg-purple-900 border border-purple-500/20 text-white font-bold" : "text-purple-300 hover:bg-slate-800"}`}
          >
            <span>✨</span>
            <span className="text-cyan-400 font-bold">SIPAS AI Assistant</span>
          </button>
        </nav>
 
        {/* User Info bottom */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 shrink-0">
          <div className="flex items-center justify-between gap-1.5">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold text-xs shrink-0 uppercase">
                {user.role.substring(0, 2)}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-[11px] text-slate-200 truncate">{user.name}</p>
                <p className="text-[9px] text-slate-500 truncate capitalize">{user.role}</p>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors shrink-0"
              title="Keluar"
            >
              <LogOut size={13} />
            </button>
          </div>
        </div>
      </aside>
 
      {/* Main Container */}
      <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        
        {/* Top Header */}
        <header className="h-14 bg-white border-b border-slate-200 px-4 md:px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 hover:bg-slate-100 rounded-lg md:hidden text-slate-600 transition-colors flex items-center justify-center border border-slate-200"
              title="Menu Utama"
            >
              <Menu size={18} />
            </button>
            <div>
              <h2 className="text-sm font-bold text-slate-800 capitalize flex items-center gap-2">
                {activeTab === "dashboard" && "📊 Dashboard & Agenda Pengawas"}
                {activeTab === "sekolah" && "🏫 Data Sekolah Binaan"}
                {activeTab === "akademik" && "📝 Supervisi Akademik & RPP Guru"}
                {activeTab === "manajerial" && "💼 Supervisi Manajerial & 8 SNP"}
                {activeTab === "pembinaan" && "📅 Target & Agenda Pembinaan Tahunan"}
                {activeTab === "temuan" && "⚠️ Log Temuan, Akar Masalah & Tindak Lanjut"}
                {activeTab === "laporan" && "📂 Dokumen & Ekspor Laporan Otomatis"}
                {activeTab === "ai_assistant" && "✨ SIPAS AI - Konsultan & Pembina Sekolah"}
              </h2>
              <p className="text-[10px] text-slate-500 hidden sm:block">Kewenangan: Kantor Wilayah Dinas Pendidikan & Kebudayaan</p>
            </div>
          </div>


        </header>

        {/* Global Toast Message */}
        {statusMessage && (
          <div className={`p-2.5 text-xs font-semibold flex items-center justify-between border-b transition-all ${
            statusMessage.type === "success" ? "bg-emerald-50 text-emerald-800 border-emerald-200 animate-fade-in" : 
            statusMessage.type === "error" ? "bg-rose-50 text-rose-800 border-rose-200" : "bg-sky-50 text-sky-800 border-sky-200"
          }`}>
            <div className="flex items-center gap-2">
              <span>{statusMessage.type === "success" ? "✓" : "⚠"}</span>
              <p>{statusMessage.text}</p>
            </div>
            <button onClick={() => setStatusMessage(null)} className="text-[10px] opacity-70 hover:opacity-100 font-bold px-1">&times;</button>
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 p-4 md:p-6 space-y-4 md:space-y-6 overflow-y-auto min-h-0 bg-slate-50">
          
          {/* TAB 1: DASHBOARD */}
          {activeTab === "dashboard" && (
            <div className="space-y-4">
              {/* Statistical High Density Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 text-lg">🏫</div>
                  <div>
                    <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider">Sekolah Binaan</p>
                    <div className="flex items-baseline gap-1.5">
                      <h3 className="text-lg font-bold">{schools.length}</h3>
                      <span className="text-[10px] text-slate-400">Unit</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600 text-lg">📝</div>
                  <div>
                    <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider">Supervisi Akademik</p>
                    <div className="flex items-baseline gap-1.5">
                      <h3 className="text-lg font-bold text-emerald-600">{academicSups.length}</h3>
                      <span className="text-[10px] text-slate-400">Pendidik</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center text-amber-600 text-lg">💼</div>
                  <div>
                    <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider">Supervisi Manajerial</p>
                    <div className="flex items-baseline gap-1.5">
                      <h3 className="text-lg font-bold text-amber-600">{managerialSups.length}</h3>
                      <span className="text-[10px] text-slate-400">Laporan</span>
                    </div>
                  </div>
                </div>

                <div className="border border-purple-100 bg-purple-50/50 p-3 rounded-lg flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 text-lg">✨</div>
                  <div>
                    <p className="text-[9px] font-semibold text-purple-700 uppercase tracking-wider">Asisten AI Aktif</p>
                    <div className="flex items-baseline gap-1.5">
                      <h3 className="text-xs font-bold text-purple-900 truncate">Rekomendasi Pintar</h3>
                    </div>
                  </div>
                </div>
              </div>

              {/* Grid 2 Columns */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                
                {/* Main comparison chart of schools quality */}
                <div className="lg:col-span-8 bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Kalkulasi Capaian Rata-Rata per Sekolah</h4>
                      <p className="text-[11px] text-slate-500">Membandingkan Indeks Akademik (Guru) & Manajerial (8 SNP)</p>
                    </div>
                    <span className="text-[10px] bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded border border-indigo-200">Semua Sekolah Binaan</span>
                  </div>
                  
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={getBarChartData()} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                        <YAxis tick={{ fontSize: 10 }} domain={[0, 100]} stroke="#94a3b8" />
                        <Tooltip />
                        <Legend wrapperStyle={{ fontSize: 10 }} />
                        <Bar dataKey="Akademik (Guru)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="Manajerial (SNP)" fill="#0d9488" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Agenda & Offline sync notice */}
                <div className="lg:col-span-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Agenda Kunjungan</h4>
                      <span className="text-[10px] bg-rose-50 text-rose-600 font-semibold px-1.5 py-0.5 rounded">Mendesak</span>
                    </div>

                    <div className="space-y-3">
                      {programs.slice(0, 3).map((prog) => (
                        <div key={prog.id} className="p-2 bg-slate-50 rounded-lg border border-slate-200 flex gap-2">
                          <div className="w-8 h-8 rounded-md bg-blue-100 text-blue-700 flex flex-col items-center justify-center font-mono">
                            <span className="text-[8px] uppercase">Juli</span>
                            <span className="text-xs font-bold leading-none">{prog.dateScheduled.split("-")[2] || "15"}</span>
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-800 truncate">{prog.title}</p>
                            <p className="text-[9px] text-slate-500 truncate">Sekolah Binaan: SMAN Sepaku</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
                    <p className="font-semibold text-slate-700 mb-1">💡 Tips Pengawasan Lapangan:</p>
                    <p className="leading-snug">Gunakan tombol <span className="font-bold">Preview HP</span> saat berkunjung di pelosok tanpa internet stabil untuk mensimulasi sistem input mobile hemat daya.</p>
                  </div>
                </div>
              </div>

              {/* Status pembinaan list (High density) */}
              <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden text-xs">
                <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                  <h4 className="font-bold text-slate-700">Daftar Ikhtisar Penjaminan Mutu & Lokasi Sekolah</h4>
                  <span className="text-[10px] text-slate-400">Total: {schools.length} Sekolah Terdaftar</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-100 text-slate-500 font-semibold border-b border-slate-200 text-[11px]">
                      <tr>
                        <th className="p-2.5">No</th>
                        <th className="p-2.5">Sekolah Binaan & NPSN</th>
                        <th className="p-2.5">Akreditasi</th>
                        <th className="p-2.5">Kepala Sekolah</th>
                        <th className="p-2.5">Pendidik</th>
                        <th className="p-2.5">Siswa</th>
                        <th className="p-2.5">Status Supervisi</th>
                        <th className="p-2.5 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {schools.map((sch, i) => {
                        const scoreAca = academicSups.find(a => a.schoolId === sch.id)?.averageScore || 80;
                        const statusLabel = scoreAca >= 85 ? "STABIL" : "PERLU BINAAN";
                        return (
                          <tr key={sch.id} className="hover:bg-slate-50">
                            <td className="p-2.5">{i+1}</td>
                            <td className="p-2.5">
                              <span className="font-bold text-slate-800 block text-[13px]">{sch.name}</span>
                              <span className="text-[10px] text-slate-400">NPSN: {sch.npsn}</span>
                            </td>
                            <td className="p-2.5">{getAkreditasiBadge(sch.akreditasi)}</td>
                            <td className="p-2.5 truncate max-w-[150px]">{sch.kepalaSekolah}</td>
                            <td className="p-2.5">{sch.guruCount} Guru</td>
                            <td className="p-2.5">{sch.muridCount} Siswa</td>
                            <td className="p-2.5">{getStatusBadge(statusLabel)}</td>
                            <td className="p-2.5 text-right">
                              <div className="flex gap-1.5 justify-end items-center">
                                <button 
                                  onClick={() => { setSelectedSchoolId(sch.id); setActiveTab("sekolah"); }}
                                  className="px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded text-[11px] font-medium"
                                >
                                  Lihat Detail
                                </button>
                                <button 
                                  onClick={() => handleDeleteSchool(sch.id)}
                                  className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 border border-transparent hover:border-red-200 rounded animate-none"
                                  title="Hapus Sekolah"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: DATA SEKOLAH BINAAN */}
          {activeTab === "sekolah" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column: School mini panel */}
              <div className="lg:col-span-4 space-y-4">
                <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Indeks Sekolah Binaan</h3>
                    <button 
                      onClick={() => setShowAddSchool(true)}
                      className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-[11px] font-semibold flex items-center gap-1 shadow-sm"
                    >
                      <Plus size={11} /> Nambahkan
                    </button>
                  </div>

                  <div className="relative mb-3">
                    <input 
                      type="text" 
                      placeholder="Cari NPSN / Sekolah..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full text-xs p-2 pl-7 border border-slate-200 rounded bg-slate-50 focus:bg-white"
                    />
                    <span className="absolute left-2.5 top-2.5 text-slate-400">🔍</span>
                  </div>

                  {/* Add School Interactive Quick Modal block inside column */}
                  {showAddSchool && (
                    <form onSubmit={handleAddSchool} className="p-3 bg-blue-50/50 rounded-lg border border-blue-200 text-xs mb-3 space-y-2">
                      <div className="flex justify-between items-center pb-1">
                        <span className="font-bold text-blue-800">Registrasi Sekolah Baru</span>
                        <button type="button" onClick={() => setShowAddSchool(false)} className="text-slate-400 hover:text-slate-600">&times;</button>
                      </div>
                      <input 
                        type="text" placeholder="Nama Sekolah (cth: SMAN 5 Balikpapan)" required
                        value={newSchool.name} onChange={(e) => setNewSchool({...newSchool, name: e.target.value})}
                        className="w-full p-1.5 border border-slate-200 rounded bg-white text-xs" 
                      />
                      <div className="grid grid-cols-2 gap-1.5">
                        <input 
                          type="text" placeholder="NPSN" required
                          value={newSchool.npsn} onChange={(e) => setNewSchool({...newSchool, npsn: e.target.value})}
                          className="w-full p-1.5 border border-slate-200 rounded bg-white text-xs" 
                        />
                        <select 
                          value={newSchool.akreditasi} onChange={(e) => setNewSchool({...newSchool, akreditasi: e.target.value})}
                          className="w-full p-1.5 border border-slate-200 rounded bg-white text-xs"
                        >
                          <option value="A">Akreditasi A</option>
                          <option value="B">Akreditasi B</option>
                          <option value="C">Akreditasi C</option>
                        </select>
                      </div>
                      <input 
                        type="text" placeholder="Nama Kepala Sekolah"
                        value={newSchool.kepalaSekolah} onChange={(e) => setNewSchool({...newSchool, kepalaSekolah: e.target.value})}
                        className="w-full p-1.5 border border-slate-200 rounded bg-white text-xs" 
                      />
                      <div className="grid grid-cols-2 gap-1.5">
                        <input 
                          type="number" placeholder="Jumlah Guru"
                          value={newSchool.guruCount} onChange={(e) => setNewSchool({...newSchool, guruCount: Number(e.target.value)})}
                          className="w-full p-1.5 border border-slate-200 rounded bg-white text-xs" 
                        />
                        <input 
                          type="number" placeholder="Jumlah Siswa"
                          value={newSchool.muridCount} onChange={(e) => setNewSchool({...newSchool, muridCount: Number(e.target.value)})}
                          className="w-full p-1.5 border border-slate-200 rounded bg-white text-xs" 
                        />
                      </div>
                      <input 
                        type="text" placeholder="Alamat Lengkap"
                        value={newSchool.address} onChange={(e) => setNewSchool({...newSchool, address: e.target.value})}
                        className="w-full p-1.5 border border-slate-200 rounded bg-white text-xs" 
                      />
                      <button type="submit" className="w-full py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded">
                        Simpan Sekolah
                      </button>
                    </form>
                  )}

                  <div className="space-y-1.5 max-h-[350px] overflow-y-auto">
                    {filteredSchools.map((sch) => (
                      <div 
                        key={sch.id}
                        onClick={() => setSelectedSchoolId(sch.id)}
                        className={`p-2 rounded-lg cursor-pointer transition-colors border text-xs ${sch.id === selectedSchoolId ? "bg-slate-900 text-white border-slate-950 shadow-md" : "bg-white hover:bg-slate-50 border-slate-200"}`}
                      >
                        <div className="flex justify-between items-start gap-1">
                          <p className="font-bold truncate">{sch.name}</p>
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleDeleteSchool(sch.id); }}
                            className={`p-0.5 transition-colors ${sch.id === selectedSchoolId ? "text-slate-400 hover:text-red-400" : "text-slate-400 hover:text-red-500"}`}
                            title="Hapus Sekolah"
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>
                        <div className="flex justify-between items-center mt-1 text-[10px] opacity-90">
                          <span>NPSN: {sch.npsn}</span>
                          <span className="font-semibold bg-blue-100 text-blue-800 px-1 rounded text-[9px] dark:bg-blue-900 dark:text-blue-100">
                            Akr: {sch.akreditasi}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Simulated Geolocation Map using refined custom SVG component */}
                <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm text-xs">
                  <h4 className="font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <MapPin size={12} className="text-red-500" /> Plot Peta Sekolah Binaan (Kaltim/IKN)
                  </h4>
                  <p className="text-[10px] text-slate-400 mb-2">Simulasi posisi koordinat geografis lapangan</p>
                  
                  {/* Map SVG plot */}
                  <div className="bg-slate-900 h-40 rounded border border-slate-800 relative overflow-hidden flex flex-col justify-between p-2">
                    <div className="absolute inset-0 opacity-20 pointer-events-none">
                      {/* Grid representation lines */}
                      <div className="w-full h-px bg-white mt-10"></div>
                      <div className="w-full h-px bg-white mt-20"></div>
                      <div className="w-full h-px bg-white mt-30"></div>
                      <div className="w-px h-full bg-white ml-20 absolute top-0"></div>
                      <div className="w-px h-full bg-white ml-40 absolute top-0"></div>
                    </div>

                    <div className="z-10 flex justify-between items-center">
                      <span className="text-[8px] text-slate-400 font-mono">PPU / Sepaku (IKN)</span>
                      <span className="text-[8px] text-emerald-400 font-mono">Balikpapan</span>
                    </div>

                    {/* Plots dynamically generated for schools */}
                    <div className="absolute inset-0">
                      {schools.map(sch => {
                        // Plot logic: map latitude and longitude slightly inside the range
                        const xPercent = 35 + ((sch.lng - 116.7) * 350); 
                        const yPercent = 50 + ((sch.lat + 1.2) * -350); 
                        const isActive = sch.id === selectedSchoolId;
                        return (
                          <div 
                            key={sch.id}
                            className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group transition-all`}
                            style={{ 
                              left: `${Math.max(10, Math.min(90, xPercent))}%`, 
                              top: `${Math.max(10, Math.min(90, yPercent))}%` 
                            }}
                            onClick={() => setSelectedSchoolId(sch.id)}
                            title={`${sch.name} (${sch.kepalaSekolah})`}
                          >
                            <div className={`w-3 h-3 rounded-full flex items-center justify-center transition-all ${isActive ? "bg-red-500 ring-4 ring-red-500/30 scale-125" : "bg-blue-500 hover:bg-emerald-400"}`}>
                              <div className="w-1 h-1 bg-white rounded-full"></div>
                            </div>
                            <span className="hidden group-hover:block absolute left-4 -top-2 bg-slate-950 text-white text-[9px] p-1 rounded whitespace-nowrap z-30">
                              {sch.name}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    <div className="z-10 text-[9px] text-slate-400 font-mono text-right">
                      Skala: 1:250.000 (Selat Makassar)
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Active School Portrait details */}
              <div className="lg:col-span-8 bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                {activeSchool ? (
                  <>
                    <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-lg font-bold text-slate-800">{activeSchool.name}</h2>
                          {getAkreditasiBadge(activeSchool.akreditasi)}
                        </div>
                        <p className="text-xs text-slate-400 mt-1">NPSN: <span className="font-mono font-bold text-slate-800">{activeSchool.npsn}</span> • Alamat: {activeSchool.address}</p>
                      </div>

                      <div className="flex items-center gap-1.5 flex-wrap">
                        <button 
                          onClick={() => { setAiSchoolId(activeSchool.id); setActiveTab("ai_assistant"); }}
                          className="py-1.5 px-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded text-xs font-semibold flex items-center gap-1 hover:from-blue-700 shadow"
                        >
                          <Sparkles size={12} /> Diagnosa AI
                        </button>
                        <button 
                          onClick={() => handleDeleteSchool(activeSchool.id)}
                          className="py-1.5 px-3 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded text-xs font-semibold flex items-center gap-1 shadow-sm"
                          title="Hapus Sekolah"
                        >
                          <Trash2 size={12} /> Hapus Sekolah
                        </button>
                      </div>
                    </div>

                    {/* School Profile Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded text-center">
                        <span className="text-[10px] text-slate-400 uppercase font-semibold">Kepala Sekolah</span>
                        <p className="font-bold text-xs text-slate-800 mt-1 truncate" title={activeSchool.kepalaSekolah}>{activeSchool.kepalaSekolah}</p>
                      </div>

                      <div className="p-3 bg-slate-50 border border-slate-200 rounded text-center">
                        <span className="text-[10px] text-slate-400 uppercase font-semibold">Jumlah Pendidik</span>
                        <p className="font-bold text-sm text-slate-800 mt-1">{activeSchool.guruCount} Guru Aktif</p>
                      </div>

                      <div className="p-3 bg-slate-50 border border-slate-200 rounded text-center">
                        <span className="text-[10px] text-slate-400 uppercase font-semibold">Jumlah Peserta Didik</span>
                        <p className="font-bold text-sm text-slate-800 mt-1">{activeSchool.muridCount} Murid</p>
                      </div>

                      <div className="p-3 bg-slate-50 border border-slate-200 rounded text-center">
                        <span className="text-[10px] text-slate-400 uppercase font-semibold">Status Peta</span>
                        <p className="font-bold text-xs text-emerald-600 mt-1">Ter-Plot ({activeSchool.lat}, {activeSchool.lng})</p>
                      </div>
                    </div>

                    {/* Integrated Academic & Managerial Historic logs */}
                    <div>
                      <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">Evaluasi Pengawasan Terkini</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        
                        {/* Box Academiks */}
                        <div className="border border-slate-200 rounded-lg p-3">
                          <h4 className="font-semibold text-xs text-blue-700 border-b pb-1 mb-2">Histori Supervisi Akademik Guru</h4>
                          {academicSups.filter(a => a.schoolId === activeSchool.id).length === 0 ? (
                            <p className="text-[11px] text-slate-400 italic">Belum ada catatan RPP atau observasi mengajar pendidik.</p>
                          ) : (
                            <div className="space-y-2">
                              {academicSups.filter(a => a.schoolId === activeSchool.id).map(a => (
                                <div key={a.id} className="p-2 bg-slate-50 rounded text-xs border border-slate-100">
                                  <div className="flex justify-between font-semibold">
                                    <span>{a.teacherName}</span>
                                    <span className="text-blue-600">Nilai: {a.averageScore}/100</span>
                                  </div>
                                  <p className="text-[10px] text-slate-500">{a.subject}</p>
                                  <p className="text-[10px] mt-1 text-slate-600 italic">Rekomendasi: "{a.recommendation}"</p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Box Managerials */}
                        <div className="border border-slate-200 rounded-lg p-3 bg-teal-50/10">
                          <h4 className="font-semibold text-xs text-emerald-700 border-b pb-1 mb-2">Kepatuhan 8 Standar Nasional (SNP)</h4>
                          {managerialSups.filter(m => m.schoolId === activeSchool.id).length === 0 ? (
                            <p className="text-[11px] text-slate-400 italic font-medium">Nilai manajerial belum diinput oleh pengawas.</p>
                          ) : (
                            <div className="space-y-3">
                              {managerialSups.filter(m => m.schoolId === activeSchool.id).map(m => (
                                <div key={m.id} className="text-xs">
                                  <div className="flex justify-between font-bold">
                                    <span>Tanggal: {m.date}</span>
                                    <span className="text-emerald-700">Rataan SNP: {m.averageScore}%</span>
                                  </div>
                                  <div className="h-40 w-full mt-2">
                                    <ResponsiveContainer width="100%" height="100%">
                                      <RadarChart cx="50%" cy="50%" outerRadius="70%" data={getRadarDataForSchool()}>
                                        <PolarGrid stroke="#cbd5e1" />
                                        <PolarAngleAxis dataKey="subject" tick={{ fontSize: 8 }} />
                                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 8 }} />
                                        <Radar name="SNP" dataKey="score" stroke="#0f766e" fill="#0d9488" fillOpacity={0.4} />
                                      </RadarChart>
                                    </ResponsiveContainer>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                      </div>
                    </div>

                    {/* Integrated Actions */}
                    <div className="p-3 bg-blue-50/50 rounded-lg flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-blue-900">Perlu melangsungkan supervisi baru?</p>
                        <p className="text-slate-500">Dapatkan form isian instrumen di tab samping.</p>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => { setActiveTab("akademik"); setShowAddAcademic(true); }}
                          className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold"
                        >
                          Mulai Supervisi Guru
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="p-10 text-center text-slate-400">
                    Pilih sekolah binaan di daftar indeks sebelah kiri untuk melihat rincian pengawasan.
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 3: SUPERVISI AKADEMIK */}
          {activeTab === "akademik" && (
            <div className="space-y-6">
              
              <div className="flex justify-between items-center bg-white p-3 rounded-lg border border-slate-200">
                <div>
                  <h4 className="text-sm font-bold text-slate-800">Dokumentasi Observasi Pembelajaran & Kelengkapan Administrasi</h4>
                  <p className="text-[11px] text-slate-500">Batas evaluasi guru minimal 1 jam pertemuan penuh</p>
                </div>
                <button 
                  onClick={() => setShowAddAcademic(!showAddAcademic)}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded text-xs flex items-center gap-1"
                >
                  <Plus size={11} /> Rancang Supervisi Akademik Baru
                </button>
              </div>

              {showAddAcademic && (
                <form onSubmit={handleAddAcademicSupervision} className="bg-white p-5 rounded-xl border-2 border-blue-500/20 shadow-sm space-y-4 text-xs">
                  <div className="flex justify-between items-center border-b pb-2">
                    <span className="font-bold text-blue-800 text-sm">Formulir Instrumen Supervisi Guru</span>
                    <button type="button" onClick={() => setShowAddAcademic(false)} className="text-slate-400 hover:text-slate-600 text-xl font-bold">&times;</button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-slate-500 font-semibold mb-1">Pilih Sekolah Binaan</label>
                      <select 
                        value={newAcademic.schoolId}
                        onChange={(e) => setNewAcademic({...newAcademic, schoolId: e.target.value})}
                        className="w-full p-2 border border-slate-200 rounded"
                      >
                        {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-500 font-semibold mb-1">Nama Guru yang Diobservasi</label>
                      <input 
                        type="text" required placeholder="cth: Sri Wahyuni, S.Pd."
                        value={newAcademic.teacherName}
                        onChange={(e) => setNewAcademic({...newAcademic, teacherName: e.target.value})}
                        className="w-full p-2 border border-slate-200 rounded"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-500 font-semibold mb-1">Mata Pelajaran & Kelas</label>
                      <input 
                        type="text" required placeholder="cth: Biologi (Kelas XI IPA)"
                        value={newAcademic.subject}
                        onChange={(e) => setNewAcademic({...newAcademic, subject: e.target.value})}
                        className="w-full p-2 border border-slate-200 rounded"
                      />
                    </div>
                  </div>

                  {/* Range scores indicators */}
                  <div>
                    <h5 className="font-bold text-slate-700 bg-slate-50 p-2 rounded mb-2">Penilaian 6 Mutu Pembelajaran (Skala 0 - 100)</h5>
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                      <div>
                        <label className="block text-slate-500 text-[10px] font-semibold">1. RPP / Administrasi ({newAcademic.scores.administrasi})</label>
                        <input 
                          type="range" min="40" max="100" 
                          value={newAcademic.scores.administrasi}
                          onChange={(e) => setNewAcademic({
                            ...newAcademic, 
                            scores: {...newAcademic.scores, administrasi: Number(e.target.value)}
                          })}
                          className="w-full"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-500 text-[10px] font-semibold">2. Apersepsi ({newAcademic.scores.apersepsi})</label>
                        <input 
                          type="range" min="40" max="100" 
                          value={newAcademic.scores.apersepsi}
                          onChange={(e) => setNewAcademic({
                            ...newAcademic, 
                            scores: {...newAcademic.scores, apersepsi: Number(e.target.value)}
                          })}
                          className="w-full"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-500 text-[10px] font-semibold">3. Penguasaan Materi ({newAcademic.scores.penguasaanMateri})</label>
                        <input 
                          type="range" min="40" max="100" 
                          value={newAcademic.scores.penguasaanMateri}
                          onChange={(e) => setNewAcademic({
                            ...newAcademic, 
                            scores: {...newAcademic.scores, penguasaanMateri: Number(e.target.value)}
                          })}
                          className="w-full"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-500 text-[10px] font-semibold">4. Metode Mengajar ({newAcademic.scores.metodePembelajaran})</label>
                        <input 
                          type="range" min="40" max="100" 
                          value={newAcademic.scores.metodePembelajaran}
                          onChange={(e) => setNewAcademic({
                            ...newAcademic, 
                            scores: {...newAcademic.scores, metodePembelajaran: Number(e.target.value)}
                          })}
                          className="w-full"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-500 text-[10px] font-semibold">5. Evaluasi Medis ({newAcademic.scores.evaluasi})</label>
                        <input 
                          type="range" min="40" max="100" 
                          value={newAcademic.scores.evaluasi}
                          onChange={(e) => setNewAcademic({
                            ...newAcademic, 
                            scores: {...newAcademic.scores, evaluasi: Number(e.target.value)}
                          })}
                          className="w-full"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-500 text-[10px] font-semibold">6. Pemanfaatan TIK ({newAcademic.scores.pemanfaatanTIK})</label>
                        <input 
                          type="range" min="40" max="100" 
                          value={newAcademic.scores.pemanfaatanTIK}
                          onChange={(e) => setNewAcademic({
                            ...newAcademic, 
                            scores: {...newAcademic.scores, pemanfaatanTIK: Number(e.target.value)}
                          })}
                          className="w-full"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-500 font-semibold mb-1">Catatan Hasil Observasi Pengawas</label>
                      <textarea 
                        rows={2} required placeholder="Catat temuan konkret di kelas, motivasi siswa, dsb..."
                        value={newAcademic.notes}
                        onChange={(e) => setNewAcademic({...newAcademic, notes: e.target.value})}
                        className="w-full p-2 border border-slate-200 rounded"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-500 font-semibold mb-1">Rekomendasi Taktis Perbaikan</label>
                      <textarea 
                        rows={2} required placeholder="Cth: Mengikuti coaching klinis modul berdiferensiasi bersama guru pamong..."
                        value={newAcademic.recommendation}
                        onChange={(e) => setNewAcademic({...newAcademic, recommendation: e.target.value})}
                        className="w-full p-2 border border-slate-200 rounded"
                      />
                    </div>
                  </div>

                  <button type="submit" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded shadow">
                    Simpan Laporan & Rata-rata Skor Otomatis
                  </button>
                </form>
              )}

              {/* Records lists */}
              <div className="space-y-3">
                {academicSups.map((aca) => {
                  const sch = schools.find(s => s.id === aca.schoolId);
                  return (
                    <div key={aca.id} className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm text-xs">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b pb-2 mb-3 gap-1">
                        <div>
                          <span className="text-[10px] font-mono text-slate-400">ID: {aca.id} • Tanggal: {aca.date}</span>
                          <h4 className="font-bold text-slate-800 text-[13px]">{aca.teacherName}</h4>
                          <span className="text-[11px] text-slate-500">Mata Pelajaran: {aca.subject} @ <span className="font-bold text-slate-700">{sch?.name || "Sekolah"}</span></span>
                        </div>
                        <div className="text-right flex sm:flex-col items-center sm:items-end justify-between gap-1">
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-800 font-bold rounded">Average: {aca.averageScore}/100</span>
                          <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-[9px] font-mono">Status: {aca.status}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 bg-slate-50 p-2.5 rounded border mb-2 text-center">
                        <div>
                          <span className="text-[9px] text-slate-400 uppercase">1. RPP</span>
                          <p className="font-bold text-slate-800">{aca.scores.administrasi}</p>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 uppercase">2. Apersepsi</span>
                          <p className="font-bold text-slate-800">{aca.scores.apersepsi}</p>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 uppercase">3. Materi</span>
                          <p className="font-bold text-slate-800">{aca.scores.penguasaanMateri}</p>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 uppercase">4. Metode</span>
                          <p className="font-bold text-slate-800">{aca.scores.metodePembelajaran}</p>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 uppercase">5. Evaluasi</span>
                          <p className="font-bold text-slate-800">{aca.scores.evaluasi}</p>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 uppercase">6. TIK</span>
                          <p className="font-bold text-slate-800">{aca.scores.pemanfaatanTIK}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        <div>
                          <p className="font-bold text-slate-700 mb-0.5">Catatan Kelas:</p>
                          <p className="text-slate-600 italic bg-blue-50/20 p-2 rounded border border-blue-100/50">"{aca.notes}"</p>
                        </div>
                        <div>
                          <p className="font-bold text-blue-700 mb-0.5">Rekomendasi Mutu:</p>
                          <p className="text-slate-600 italic bg-emerald-50/20 p-2 rounded border border-emerald-100/50">"{aca.recommendation}"</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          )}

          {/* TAB 4: SUPERVISI MANAJERIAL */}
          {activeTab === "manajerial" && (
            <div className="space-y-6">
              
              <div className="flex justify-between items-center bg-white p-3 rounded-lg border border-slate-200">
                <div>
                  <h4 className="text-sm font-bold text-slate-800">Pembinaan Pengelolaan Sekolah & Evaluasi RKAS Anggaran</h4>
                  <p className="text-[11px] text-slate-500">Menganalisis profil pemenuhan 8 Standar Nasional Pendidikan (SNP)</p>
                </div>
                <button 
                  onClick={() => setShowAddManagerial(!showAddManagerial)}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded text-xs flex items-center gap-1"
                >
                  <Plus size={11} /> Input Data Supervisi Manajerial
                </button>
              </div>

              {showAddManagerial && (
                <form onSubmit={handleAddManagerialSupervision} className="bg-white p-5 rounded-xl border-2 border-emerald-500/20 shadow-sm space-y-4 text-xs">
                  <div className="flex justify-between items-center border-b pb-2">
                    <span className="font-bold text-emerald-800 text-sm">Form Standardisasi Mutu Manajerial Sekolah</span>
                    <button type="button" onClick={() => setShowAddManagerial(false)} className="text-slate-400 hover:text-slate-600 text-xl font-bold">&times;</button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-500 font-semibold mb-1">Pilih Sekolah Binaan</label>
                      <select 
                        value={newManagerial.schoolId}
                        onChange={(e) => setNewManagerial({...newManagerial, schoolId: e.target.value})}
                        className="w-full p-2 border border-slate-200 rounded"
                      >
                        {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-500 font-semibold mb-1">Status Tindak Lanjut RKAS</label>
                      <select 
                        value={newManagerial.implementationStatus}
                        onChange={(e) => setNewManagerial({...newManagerial, implementationStatus: e.target.value})}
                        className="w-full p-2 border border-slate-200 rounded"
                      >
                        <option value="Belum ditindaklanjuti">Belum ditindaklanjuti</option>
                        <option value="Proses">Dalam Pendampingan Proses</option>
                        <option value="Selesai">Laporan tuntas (Selesai)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <h5 className="font-bold text-slate-700 bg-slate-50 p-2 rounded mb-2">Penilaian 8 Standar Nasional (SNP)</h5>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {Object.keys(newManagerial.scores).map((standarKey) => (
                        <div key={standarKey}>
                          <label className="block text-slate-500 text-[10px] font-semibold capitalize">
                            {standarKey.replace(/([A-Z])/g, ' $1')} ({(newManagerial.scores as any)[standarKey]})
                          </label>
                          <input 
                            type="range" min="30" max="100" 
                            value={(newManagerial.scores as any)[standarKey]}
                            onChange={(e) => {
                              const updatedScores = { ...newManagerial.scores, [standarKey]: Number(e.target.value) };
                              setNewManagerial({ ...newManagerial, scores: updatedScores });
                            }}
                            className="w-full"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-500 font-semibold mb-1">Analisis Program Kerja & Evaluasi Anggaran BOS/BOSDA</label>
                      <textarea 
                        rows={2} required placeholder="Catat detail penyerapan anggaran, apakah RKAS realistis..."
                        value={newManagerial.notes}
                        onChange={(e) => setNewManagerial({...newManagerial, notes: e.target.value})}
                        className="w-full p-2 border border-slate-200 rounded"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-500 font-semibold mb-1">Saran Optimalisasi Mutu & Inventarisasi Sarpras</label>
                      <textarea 
                        rows={2} required placeholder="Cth: Merealokasi dana sisa perawatan aset untuk melengkapi buku ajar..."
                        value={newManagerial.recommendation}
                        onChange={(e) => setNewManagerial({...newManagerial, recommendation: e.target.value})}
                        className="w-full p-2 border border-slate-200 rounded"
                      />
                    </div>
                  </div>

                  <button type="submit" className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded shadow">
                    Terapkan Skor Evaluasi Manajerial
                  </button>
                </form>
              )}

              {/* Records list */}
              <div className="space-y-4">
                {managerialSups.map((man) => {
                  const s = schools.find(sc => sc.id === man.schoolId);
                  return (
                    <div key={man.id} className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm text-xs">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b pb-2 mb-3">
                        <div>
                          <span className="text-[10px] font-mono text-slate-400">Arsip Manajerial • {man.date}</span>
                          <h4 className="font-bold text-slate-800 text-sm">{s?.name || "Sekolah Binaan"}</h4>
                          <p className="text-[11px] text-slate-500">Hasil audit akuntabilitas keuangan & ketercapaian sarpras</p>
                        </div>
                        <div className="text-right">
                          <span className="px-3 py-1 bg-teal-100 text-teal-800 font-bold rounded text-xs block">Rata-rata: {man.averageScore}%</span>
                          <span className="mt-1 text-[9px] text-slate-400 block">Status: {man.implementationStatus}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-8 gap-1 p-2 bg-slate-50 rounded text-center font-mono text-[10px] mb-2">
                        <div className="bg-white p-1 rounded border border-slate-200">
                          <span className="text-[8px] text-slate-400 block uppercase">S. Isi</span>
                          <span className="font-bold">{man.scores.standarIsi}</span>
                        </div>
                        <div className="bg-white p-1 rounded border border-slate-200">
                          <span className="text-[8px] text-slate-400 block uppercase">S. Proses</span>
                          <span className="font-bold">{man.scores.standarProses}</span>
                        </div>
                        <div className="bg-white p-1 rounded border border-slate-200">
                          <span className="text-[8px] text-slate-400 block uppercase">S. Kelulusan</span>
                          <span className="font-bold">{man.scores.standarKelulusan}</span>
                        </div>
                        <div className="bg-white p-1 rounded border border-slate-200">
                          <span className="text-[8px] text-slate-400 block uppercase">S. Pendidik</span>
                          <span className="font-bold">{man.scores.standarPendidik}</span>
                        </div>
                        <div className="bg-white p-1 rounded border border-slate-200">
                          <span className="text-[8px] text-slate-400 block uppercase">S. Sarpras</span>
                          <span className="font-bold">{man.scores.standarSarpras}</span>
                        </div>
                        <div className="bg-white p-1 rounded border border-slate-200">
                          <span className="text-[8px] text-slate-400 block uppercase">S. Kelola</span>
                          <span className="font-bold">{man.scores.standarPengelolaan}</span>
                        </div>
                        <div className="bg-white p-1 rounded border border-slate-200">
                          <span className="text-[8px] text-slate-400 block uppercase">S. Biya</span>
                          <span className="font-bold">{man.scores.standarPembiayaan}</span>
                        </div>
                        <div className="bg-white p-1 rounded border border-slate-200">
                          <span className="text-[8px] text-slate-400 block uppercase">S. Nilai</span>
                          <span className="font-bold">{man.scores.standarPenilaian}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                        <div>
                          <p className="font-semibold text-slate-700">Analisis RKAS & Realisasi:</p>
                          <p className="italic text-slate-600 bg-slate-50 p-2 rounded border">"{man.notes}"</p>
                        </div>
                        <div>
                          <p className="font-semibold text-emerald-700">Saran Pemenuhan SNP:</p>
                          <p className="italic text-slate-600 bg-emerald-50/20 p-2 rounded border border-emerald-100">"{man.recommendation}"</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          )}

          {/* TAB 5: PROGRAM PEMBINAAN */}
          {activeTab === "pembinaan" && (
            <div className="space-y-4">
              
              <div className="flex justify-between items-center bg-white p-3 rounded-lg border border-slate-200">
                <div>
                  <h4 className="text-sm font-bold text-slate-800">Jadwal & Target Indikator Kerja Pembinaan Tahunan</h4>
                  <p className="text-[11px] text-slate-500">Membantu agenda monitoring berkala di wilayah binaan</p>
                </div>
                <button 
                  onClick={() => setShowAddProgram(!showAddProgram)}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded text-xs flex items-center gap-1 shadow"
                >
                  <Plus size={11} /> Tambah Agenda Pembinaan
                </button>
              </div>

              {showAddProgram && (
                <form onSubmit={handleAddProgram} className="bg-white p-4 rounded-lg border-2 border-blue-100 space-y-3 text-xs">
                  <div className="flex justify-between items-center border-b pb-1">
                    <span className="font-bold text-slate-700">Registrasi Program Kerja Binaan</span>
                    <button type="button" onClick={() => setShowAddProgram(false)} className="text-slate-400 hover:text-slate-600">&times;</button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-slate-500 font-semibold mb-0.5">Sekolah Sasaran</label>
                      <select 
                        value={newProgram.schoolId}
                        onChange={(e) => setNewProgram({...newProgram, schoolId: e.target.value})}
                        className="w-full p-2 border border-slate-200 rounded"
                      >
                        {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-500 font-semibold mb-0.5">Materi / Tema Pembinaan</label>
                      <input 
                        type="text" required placeholder="Cth: Pelatihan Evaluasi Kurikulum Merdeka"
                        value={newProgram.title}
                        onChange={(e) => setNewProgram({...newProgram, title: e.target.value})}
                        className="w-full p-2 border border-slate-200 rounded"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-500 font-semibold mb-0.5">Tanggal Pelaksanaan</label>
                      <input 
                        type="date" required
                        value={newProgram.dateScheduled}
                        onChange={(e) => setNewProgram({...newProgram, dateScheduled: e.target.value})}
                        className="w-full p-2 border border-slate-200 rounded"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-500 font-semibold mb-0.5">Target Ketercapaian Mutu</label>
                    <input 
                      type="text" required placeholder="Cth: Dokumen KOSP tuntas dirampungkan komite sekolah"
                      value={newProgram.target}
                      onChange={(e) => setNewProgram({...newProgram, target: e.target.value})}
                      className="w-full p-2 border border-slate-200 rounded"
                    />
                  </div>

                  <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded">
                    Simpan Agenda
                  </button>
                </form>
              )}

              {/* Table list */}
              <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden text-xs">
                <div className="p-3 bg-slate-50 border-b border-slate-200 font-bold text-slate-700">
                  Agenda Kerja Tahunan Pengawas Sekolah
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-100 text-slate-500 font-semibold border-b text-[11px]">
                      <tr>
                        <th className="p-2.5">No</th>
                        <th className="p-2.5">Sekolah Sasaran</th>
                        <th className="p-2.5">Nama Program Kerja</th>
                        <th className="p-2.5">Target Capaian Mutu</th>
                        <th className="p-2.5">Tanggal Rencana</th>
                        <th className="p-2.5">Status Pelaksanaan</th>
                        <th className="p-2.5 text-right">Aksi Tindak Lanjut</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {programs.map((prog, index) => {
                        const sch = schools.find(s => s.id === prog.schoolId);
                        return (
                          <tr key={prog.id} className="hover:bg-slate-50">
                            <td className="p-2.5">{index+1}</td>
                            <td className="p-2.5 font-semibold text-slate-800">{sch?.name || "Sekolah"}</td>
                            <td className="p-2.5">{prog.title}</td>
                            <td className="p-2.5 italic text-slate-600">{prog.target}</td>
                            <td className="p-2.5 font-mono">{prog.dateScheduled}</td>
                            <td className="p-2.5">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                prog.status === "Selesai" ? "bg-emerald-100 text-emerald-800" :
                                prog.status === "Proses" ? "bg-amber-100 text-amber-800 animate-pulse" :
                                "bg-slate-100 text-slate-800"
                              }`}>
                                {prog.status}
                              </span>
                            </td>
                            <td className="p-2.5 text-right">
                              <button 
                                onClick={() => handleUpdateProgramStatus(prog.id, prog.status)}
                                className="px-2 py-1 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded text-[11px] font-semibold text-slate-700 block ml-auto"
                              >
                                {prog.status === "Belum" ? "Proses →" : prog.status === "Proses" ? "Tandai Selesai ✓" : "Re-Check -"}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* TAB 6: TEMUAN & REKOMENDASI */}
          {activeTab === "temuan" && (
            <div className="space-y-4">
              
              <div className="flex justify-between items-center bg-white p-3 rounded-lg border border-slate-200">
                <div>
                  <h4 className="text-sm font-bold text-slate-800">Catatan Masalah, Identifikasi Akar Masalah & Rekomendasi Pintar</h4>
                  <p className="text-[11px] text-slate-500">Mencegah melebarnya kesenjangan standar operasional sekolah</p>
                </div>
                <button 
                  onClick={() => setShowAddFinding(!showAddFinding)}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded text-xs flex items-center gap-1 shadow"
                >
                  <Plus size={11} /> Laporkan Temuan Kasus Baru
                </button>
              </div>

              {showAddFinding && (
                <form onSubmit={handleAddFinding} className="bg-white p-4 rounded-lg border-2 border-rose-100 space-y-3 text-xs">
                  <div className="flex justify-between items-center border-b pb-1">
                    <span className="font-bold text-rose-800 text-sm">Formulir Identifikasi Temuan Pengawasan</span>
                    <button type="button" onClick={() => setShowAddFinding(false)} className="text-slate-400 hover:text-slate-600">&times;</button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-500 font-semibold mb-0.5">Pilih Sekolah Binaan</label>
                      <select 
                        value={newFinding.schoolId}
                        onChange={(e) => setNewFinding({...newFinding, schoolId: e.target.value})}
                        className="w-full p-2 border border-slate-200 rounded"
                      >
                        {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-500 font-semibold mb-0.5">Batas Penyelesaian Masalah (Due Date)</label>
                      <input 
                        type="date" required
                        value={newFinding.dateTarget}
                        onChange={(e) => setNewFinding({...newFinding, dateTarget: e.target.value})}
                        className="w-full p-2 border border-slate-200 rounded"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-500 font-semibold mb-0.5">Masalah / Deskripsi Temuan Lapangan</label>
                    <input 
                      type="text" required placeholder="Cth: Kerusakan ringan atap perpustakaan yang mengancam sirkulasi buku jilid baru"
                      value={newFinding.problem}
                      onChange={(e) => setNewFinding({...newFinding, problem: e.target.value})}
                      className="w-full p-2 border border-slate-200 rounded"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-500 font-semibold mb-0.5">Analisis Akar Masalah</label>
                      <textarea 
                        rows={2} required placeholder="Cth: Pengalokasian dana kebersihan di RKAS kurang matang..."
                        value={newFinding.rootCause}
                        onChange={(e) => setNewFinding({...newFinding, rootCause: e.target.value})}
                        className="w-full p-2 border border-slate-200 rounded"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-500 font-semibold mb-0.5">Saran / Rekomendasi Perbaikan Pengawas</label>
                      <textarea 
                        rows={2} required placeholder="Cth: Segera revisi anggaran RKAS Semester II, laporkan kebutuhan DAK fisik ke dinas..."
                        value={newFinding.recommendation}
                        onChange={(e) => setNewFinding({...newFinding, recommendation: e.target.value})}
                        className="w-full p-2 border border-slate-200 rounded"
                      />
                    </div>
                  </div>

                  <button type="submit" className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded">
                    Daftarkan Log Temuan Lapangan
                  </button>
                </form>
              )}

              {/* Finding Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {findings.map((f) => {
                  const s = schools.find(sc => sc.id === f.schoolId);
                  return (
                    <div key={f.id} className="bg-white p-4 rounded-xl border border-slate-300/60 shadow-sm text-xs flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-center border-b pb-2 mb-2">
                          <span className="font-bold text-slate-800">{s?.name || "Sekolah"}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            f.status === "Selesai" ? "bg-emerald-100 text-emerald-800" :
                            f.status === "Proses" ? "bg-amber-100 text-amber-800 animate-pulse" :
                            "bg-rose-100 text-rose-800"
                          }`}>
                            {f.status}
                          </span>
                        </div>
                        <div className="space-y-1">
                          <p className="font-bold text-slate-800 text-[13px]">{f.problem}</p>
                          <p className="text-slate-500"><strong>Akar Masalah:</strong> {f.rootCause}</p>
                          <p className="text-blue-700 font-medium"><strong>Rekomendasi Solutif:</strong> {f.recommendation}</p>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-[10px]">
                        <span className="text-slate-400">Target Tuntas: <span className="font-bold text-rose-600">{f.dateTarget || "Tidak ditentukan"}</span></span>
                        <button 
                          onClick={() => handleUpdateFindingStatus(f.id, f.status)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 border rounded font-semibold text-slate-700"
                        >
                          Ubah Status →
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          )}

          {/* TAB 7: MANAGEMEN DOKUMEN & LAPORAN */}
          {activeTab === "laporan" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Document archive panel */}
              <div className="lg:col-span-5 bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-xs space-y-4">
                <div className="border-b pb-2">
                  <h3 className="font-bold text-slate-800 text-sm">Penyimpanan Berkas Digital & Foto Lapangan</h3>
                  <p className="text-slate-500">Simulasi upload dokumen akreditasi, RPP, dan MoU sekolah</p>
                </div>

                <form onSubmit={handleUploadDocument} className="bg-slate-50 p-3 rounded-lg border space-y-2.5">
                  <span className="font-bold text-slate-700 block">Arsip Berkas Baru</span>
                  
                  <div>
                    <label className="block text-slate-500 text-[10px] mb-0.5">Nama File Berkas</label>
                    <input 
                      type="text" placeholder="cth: Laporan_KOSP_SMAN_2026.pdf" required
                      value={newDoc.filename}
                      onChange={(e) => setNewDoc({...newDoc, filename: e.target.value})}
                      className="w-full p-2 border border-slate-200 bg-white rounded"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-500 text-[10px] mb-0.5">Kategori Dokumen</label>
                      <select 
                        value={newDoc.category}
                        onChange={(e) => setNewDoc({...newDoc, category: e.target.value as any})}
                        className="w-full p-2 border border-slate-200 bg-white rounded"
                      >
                        <option value="Kurikulum">Kurikulum / Akreditasi</option>
                        <option value="Keuangan">Keuangan / RKAS</option>
                        <option value="Kesiswaan">Kesiswaan</option>
                        <option value="Sarpras">Sarana Prasana (Sarpras)</option>
                        <option value="Umum">Umum</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-500 text-[10px] mb-0.5">Pilih Sekolah Binaan</label>
                      <select 
                        value={newDoc.schoolId}
                        onChange={(e) => setNewDoc({...newDoc, schoolId: e.target.value})}
                        className="w-full p-2 border border-slate-200 bg-white rounded"
                      >
                        {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                    </div>
                  </div>

                  <button type="submit" className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded">
                    Simpan dan Unggah Arsip
                  </button>
                </form>

                {/* Uploaded lists */}
                <div className="space-y-2 max-h-[250px] overflow-y-auto">
                  <span className="font-bold text-slate-700 block">Berkas Sekolah Tersimpan:</span>
                  {documents.map(doc => {
                    const sch = schools.find(s => s.id === doc.schoolId);
                    return (
                      <div key={doc.id} className="p-2.5 bg-slate-50 rounded border border-slate-200 flex items-center justify-between">
                        <div>
                          <p className="font-bold text-slate-800">{doc.filename}</p>
                          <p className="text-[10px] text-slate-500">Sekolah: {sch?.name || "Binaan"} • Kategori: <span className="font-semibold text-slate-700">{doc.category}</span></p>
                        </div>
                        <span className="text-[10px] font-mono bg-blue-100 text-blue-800 px-1 rounded">{doc.size}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Automatic official reports generation & signature */}
              <div className="lg:col-span-7 bg-white p-6 rounded-xl border border-slate-200 shadow-sm text-xs space-y-4">
                <div className="border-b pb-2 flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">Generator Laporan Otomatis & Tanda Tangan Digital</h3>
                    <p className="text-slate-500">Ekspor instan naskah pengawasan klinis ke institusi Dinas Kaltim / IKN</p>
                  </div>
                  <span className="p-1 px-2.5 bg-indigo-50 text-indigo-700 font-bold rounded animate-pulse">SIAP EKSPOR</span>
                </div>

                <div className="p-4 bg-slate-900 text-slate-100 rounded-lg font-serif leading-relaxed text-[11px] border border-slate-950">
                  <div className="text-center font-bold uppercase tracking-wide border-b border-dashed border-slate-700 pb-3 mb-4">
                    <p className="text-xs">KEMENTERIAN PENDIDIKAN, KEBUDAYAAN, RISET, DAN TEKNOLOGI</p>
                    <p className="text-[10px]">DINAS PENDIDIKAN DAN KEBUDAYAAN DAERAH PROVINSI</p>
                    <p className="text-[9px] text-slate-400 normal-case italic font-sans">Surat Tugas Pengawas SIPAS: #ST-{schools.length || 4}92/DIK-SEC/2026</p>
                  </div>

                  <p className="indent-4 mb-2">
                    Berdasarkan Undang-Undang standardisasi penjaminan mutu pendidikan sekolah dasar dan menengah daerah IKN Nusantara / Balikpapan, Pengawas Sekolah telah menyelenggarakan visitasi, evaluasi klinis RPP mengajar, serta pengawasan anggaran RKAS bagi satuan sekolah binaan:
                  </p>

                  <ul className="list-disc pl-5 mb-2 space-y-1">
                    {schools.map(s => <li key={s.id} className="font-bold">{s.name} (Akreditasi {s.akreditasi})</li>)}
                  </ul>

                  <p className="indent-4 mb-4">
                    Seluruh instrumen capaian mutu dengan rata-rata total di atas <span className="font-bold text-emerald-400">82%</span> tercatat selaras dengan arahan Kurikulum Merdeka Mandiri Belajar. Rekomendasi taktis pembinaan telah diintegrasikan di platform SIPAS.
                  </p>

                  {/* Inspector Signature Mockup */}
                  <div className="flex justify-end pt-4 font-sans text-right">
                    <div className="w-56 border-t border-dashed border-slate-700 pt-2 text-[10px]">
                      <p className="text-slate-400 mb-6">Pengawas Utama Wilayah,</p>
                      
                      {isSigned ? (
                        <div className="my-2 p-1.5 bg-blue-950 text-blue-300 font-mono text-[9px] text-center border border-blue-500 rounded uppercase">
                          🔐 TER-TANDATANGANI <br/> {inspectorName} <br/> {new Date().toISOString().split("T")[0]}
                        </div>
                      ) : (
                        <div className="h-10 my-1 bg-slate-800 rounded border border-slate-700 flex items-center justify-center italic text-slate-500 text-[10px]">
                          Menunggu Tanda Tangan Digital...
                        </div>
                      )}

                      <p className="font-bold text-slate-200 mt-1">{inspectorName}</p>
                      <p className="text-[9px] text-slate-500">NIP: {nipNumber}</p>
                    </div>
                  </div>
                </div>

                {/* Configuration values to download PDF/Excel */}
                <div className="bg-slate-50 p-4 rounded-lg border space-y-3">
                  <span className="font-bold text-slate-700">Otorisasi Identitas Pengawas</span>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 text-[10px] mb-0.5">Nama Pengawas</label>
                      <input 
                        type="text" 
                        value={inspectorName} 
                        onChange={(e) => setInspectorName(e.target.value)}
                        className="w-full text-xs p-1.5 border border-slate-200 bg-white rounded"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 text-[10px] mb-0.5">Nomor Induk Pegawai (NIP)</label>
                      <input 
                        type="text" 
                        value={nipNumber} 
                        onChange={(e) => setNipNumber(e.target.value)}
                        className="w-full text-xs p-1.5 border border-slate-200 bg-white rounded"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1">
                    <button 
                      onClick={() => { setIsSigned(true); showToast("Dokumen pengawasan SIPAS sukses ditandatangani secara elektronik (Digital Certified).", "success"); }}
                      className="px-3.5 py-2 bg-slate-900 hover:bg-slate-950 text-white font-bold rounded flex items-center gap-1.5"
                    >
                      <span>🔑</span> Tanda Tangani Laporan (Digital)
                    </button>

                    <button 
                      onClick={() => showToast("Ekspor naskah PDF berhasil di-download. Periksa folder download komputer Anda.", "success")}
                      className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded flex items-center gap-1.5"
                    >
                      <Download size={12} /> Ekspor Laporan PDF
                    </button>

                    <button 
                      onClick={() => showToast("Ekspor tabel Excel berhasil disiapkan.", "success")}
                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded flex items-center gap-1.5"
                    >
                      <span>📊</span> Ekspor Excel (XLSX)
                    </button>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 8: AI ASSISTANT PANEL */}
          {activeTab === "ai_assistant" && (
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6 text-xs">
              
              <div className="pb-4 border-b border-indigo-100 flex flex-col md:flex-row md:items-center md:justify-between gap-2 bg-indigo-50/50 p-4 rounded-xl border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white text-xl shadow-lg shadow-indigo-500/20">
                    ✨
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">Konsultan AI Mutu Pendidikan Indonesia</h3>
                    <p className="text-[11px] text-slate-500">Menganalisis potret mutu 8 SNP & otomatisasi Rencana Tindak Lanjut (RTL)</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <span className="text-[10px] bg-indigo-100 text-indigo-800 font-bold px-2.5 py-1 rounded-full border border-indigo-300">
                    Status: Gemini 3.5 Flash Siaga
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left controls selection */}
                <div className="space-y-4">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
                    <span className="font-bold text-slate-800 text-xs block">Konfigurasi Target Laporan AI</span>
                    
                    <div>
                      <label className="block text-slate-500 font-semibold mb-1">1. Pilih Sekolah sebagai Basis Data</label>
                      <select 
                        value={aiSchoolId}
                        onChange={(e) => setAiSchoolId(e.target.value)}
                        className="w-full p-2 border border-slate-200 rounded text-xs bg-white"
                      >
                        {schools.map(s => <option key={s.id} value={s.id}>{s.name} (Akr: {s.akreditasi})</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-500 font-semibold mb-1">2. Pilih Format Output AI</label>
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-slate-100 transition-colors">
                          <input 
                            type="radio" name="ai_mode" value="full_analysis"
                            checked={aiActionMode === "full_analysis"}
                            onChange={(e) => setAiActionMode(e.target.value)}
                            className="text-indigo-600 focus:ring-indigo-500"
                          />
                          <div>
                            <p className="font-bold text-slate-800 text-[11px]">Analisis Penjaminan Mutu & SWOT</p>
                            <p className="text-[9px] text-slate-400">SWOT, usulan program strategis & bimbingan</p>
                          </div>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-slate-100 transition-colors">
                          <input 
                            type="radio" name="ai_mode" value="guidance_plan"
                            checked={aiActionMode === "guidance_plan"}
                            onChange={(e) => setAiActionMode(e.target.value)}
                            className="text-indigo-600 focus:ring-indigo-500"
                          />
                          <div>
                            <p className="font-bold text-slate-800 text-[11px]">Rencana Tindak Lanjut Program Kerja</p>
                            <p className="text-[9px] text-slate-400">SMART indicator targets & program tahunan</p>
                          </div>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-slate-100 transition-colors">
                          <input 
                            type="radio" name="ai_mode" value="official_report"
                            checked={aiActionMode === "official_report"}
                            onChange={(e) => setAiActionMode(e.target.value)}
                            className="text-indigo-600 focus:ring-indigo-500"
                          />
                          <div>
                            <p className="font-bold text-slate-800 text-[11px]">Draf Memo Laporan Dinas Resmi</p>
                            <p className="text-[9px] text-slate-400">Memo formal ditujukan untuk Kepala Dinas Pendidikan</p>
                          </div>
                        </label>
                      </div>
                    </div>

                    <button 
                      onClick={handleAIAnalyze}
                      disabled={isAiLoading}
                      className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:tracking-wide text-white font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 shadow"
                    >
                      {isAiLoading ? (
                        <>
                          <RefreshCw size={12} className="animate-spin" />
                          <span>AI Sedang Berpikir...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles size={13} />
                          <span>Rampungkan Analisis Cerdas</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="p-3 bg-indigo-50 text-indigo-900 rounded-lg text-[11px]">
                    <p className="font-bold mb-1">🤖 Cara Kerja Sistem:</p>
                    <p className="leading-relaxed">Platform mengirimkan profil sekolah, histori supervisi guru, serta nilai 8 SNP ke model LLM. AI menyusun solusi konkret yang dapat disalin menjadi RPP binaan baru.</p>
                  </div>
                </div>

                {/* Right response displays */}
                <div className="lg:col-span-2 bg-slate-950 text-slate-100 rounded-xl p-5 font-mono text-xs flex flex-col justify-between min-h-[350px] border border-slate-900 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>

                  <div>
                    <div className="flex justify-between items-center pb-2.5 border-b border-slate-800 mb-3 text-[10px]">
                      <span className="text-indigo-400 font-bold">&gt;_ KONSULTAN_MURNI_OUTPUT</span>
                      {aiGeneratedBy && (
                        <span className="text-slate-400">Processed by: {aiGeneratedBy}</span>
                      )}
                    </div>

                    {isAiLoading ? (
                      <div className="space-y-3 pt-4">
                        <div className="h-4 bg-slate-800 rounded animate-pulse w-3/4"></div>
                        <div className="h-4 bg-slate-800 rounded animate-pulse"></div>
                        <div className="h-4 bg-slate-800 rounded animate-pulse w-5/6"></div>
                        <div className="h-4 bg-slate-800 rounded animate-pulse w-1/2"></div>
                        <p className="text-[10px] text-indigo-400 font-sans italic text-center pt-8">Menghubungi Server Google LLM. Harap tunggu...</p>
                      </div>
                    ) : aiResponse ? (
                      <div className="prose prose-invert prose-xs text-slate-300 max-h-[350px] overflow-y-auto leading-relaxed whitespace-pre-line pr-1">
                        {aiResponse}
                      </div>
                    ) : (
                      <div className="text-slate-500 italic text-center py-16">
                        Pilih format laporan di samping, kemudian klik tombol "Rampungkan Analisis Cerdas" untuk memicu asisten AI.
                      </div>
                    )}
                  </div>

                  {aiResponse && (
                    <div className="pt-3 border-t border-slate-800 mt-4 flex justify-between items-center text-[10px]">
                      <span className="text-slate-500">Gaya Bahasa: Formal - Solutif</span>
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(aiResponse);
                          showToast("Analisis AI disalin ke papan klip.", "success");
                        }}
                        className="p-1 px-2.5 bg-slate-800 hover:bg-slate-700 text-indigo-300 rounded border border-slate-700"
                      >
                        Salin Rekomendasi
                      </button>
                    </div>
                  )}
                </div>

              </div>

            </div>
          )}

        </div>

        {/* Footer */}
        <footer className="h-10 bg-white border-t border-slate-200 px-4 md:px-6 flex items-center justify-between text-[10px] text-slate-400 shrink-0">
          <div>SIPAS © 2026 • Wilayah Kerja: Penajam Paser Utara & Balikpapan (IKN)</div>
          <div className="flex gap-4">
            <span className="hidden sm:inline">Pusat Informasi & Bantuan</span>
            <span className="text-blue-600 font-bold">Tersegel SSL Aman</span>
          </div>
        </footer>

      </main>
    </div>
  );
}
