export interface School {
  id: string;
  name: string;
  npsn: string;
  kepalaSekolah: string;
  akreditasi: string;
  guruCount: number;
  muridCount: number;
  address: string;
  lat: number;
  lng: number;
}

export interface AcademicSupervision {
  id: string;
  schoolId: string;
  teacherName: string;
  subject: string;
  date: string;
  scores: {
    administrasi: number;
    apersepsi: number;
    penguasaanMateri: number;
    metodePembelajaran: number;
    evaluasi: number;
    pemanfaatanTIK: number;
  };
  averageScore: number;
  notes: string;
  recommendation: string;
  status: string;
  documentName?: string;
}

export interface ManagerialSupervision {
  id: string;
  schoolId: string;
  date: string;
  scores: {
    standarIsi: number;
    standarProses: number;
    standarKelulusan: number;
    standarPendidik: number;
    standarSarpras: number;
    standarPengelolaan: number;
    standarPembiayaan: number;
    standarPenilaian: number;
  };
  averageScore: number;
  notes: string;
  recommendation: string;
  implementationStatus: string;
}

export interface ProgramGuidance {
  id: string;
  schoolId: string;
  title: string;
  target: string;
  dateScheduled: string;
  status: "Belum" | "Proses" | "Selesai";
  notes: string;
}

export interface Finding {
  id: string;
  schoolId: string;
  problem: string;
  rootCause: string;
  recommendation: string;
  status: "Belum ditindaklanjuti" | "Proses" | "Selesai";
  dateAdded: string;
  dateTarget: string;
}

export interface DocumentInfo {
  id: string;
  schoolId: string;
  filename: string;
  category: "Kurikulum" | "Keuangan" | "Kesiswaan" | "Sarpras" | "Umum";
  dateUploaded: string;
  size: string;
}

export interface SIPASStats {
  schoolCount: number;
  academicSupervisionCount: number;
  managerialSupervisionCount: number;
  programCount: number;
  unresolvedFindings: number;
  snpAverage: {
    standarIsi: number;
    standarProses: number;
    standarKelulusan: number;
    standarPendidik: number;
    standarSarpras: number;
    standarPengelolaan: number;
    standarPembiayaan: number;
    standarPenilaian: number;
  };
}
