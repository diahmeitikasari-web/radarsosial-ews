import * as XLSX from 'xlsx';
import {
  Student,
  SociometricNomination,
  PeerBehavioralRating,
  RelationCriteria,
} from '../types';

export interface ParsedExcelResult {
  success: boolean;
  message: string;
  students: Student[];
  nominations: SociometricNomination[];
  behavioralRatings: PeerBehavioralRating[];
  warnings: string[];
  detectedClassName?: string;
}

export function generateExcelTemplate(classStudents: Student[], className = 'Kelas 8A') {
  // Build rows with sample or prefilled student names
  const rows = classStudents.map((s) => ({
    'Kelas / Rombel': className,
    NIS: s.nis,
    'Nama Lengkap': s.name,
    'Jenis Kelamin (L/P)': s.gender,
    'Pilihan Suka 1 (Nama)': '',
    'Pilihan Suka 2 (Nama)': '',
    'Pilihan Suka 3 (Nama)': '',
    'Pilihan Tidak Suka 1 (Nama)': '',
    'Pilihan Tidak Suka 2 (Nama)': '',
    'Pilihan Tidak Suka 3 (Nama)': '',
    'Skor Prososial (1-10)': 5,
    'Skor Agresif (1-10)': 2,
    'Skor Menarik Diri (1-10)': 2,
    'Skor Viktimisasi (1-10)': 1,
    'Skor Hiperaktif (1-10)': 2,
    'Kriteria (Belajar/Bermain)': 'Belajar',
  }));

  // Create workbook & worksheet
  const worksheet = XLSX.utils.json_to_sheet(rows);

  // Set column widths for readability
  worksheet['!cols'] = [
    { wch: 16 }, // Kelas
    { wch: 12 }, // NIS
    { wch: 26 }, // Nama
    { wch: 18 }, // JK
    { wch: 22 }, // Suka 1
    { wch: 22 }, // Suka 2
    { wch: 22 }, // Suka 3
    { wch: 24 }, // Tidak Suka 1
    { wch: 24 }, // Tidak Suka 2
    { wch: 24 }, // Tidak Suka 3
    { wch: 20 }, // Prososial
    { wch: 18 }, // Agresif
    { wch: 22 }, // Menarik Diri
    { wch: 22 }, // Viktimisasi
    { wch: 20 }, // Hiperaktif
    { wch: 24 }, // Kriteria
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Input Sosiometri & Perilaku');

  // Add Instruction Sheet
  const instructions = [
    { Panduan: 'PANDUAN PENGISIAN TEMPLATE SOSIOMETRI & PERILAKU SISWA' },
    { Panduan: '1. Jangan mengubah nama kolom pada baris pertama.' },
    { Panduan: '2. Kolom Nama dan NIS adalah identitas siswa pengisi (nominator).' },
    { Panduan: '3. Isi Pilihan Suka (maksimal 3 teman) dan Pilihan Tidak Suka (maksimal 3 teman).' },
    { Panduan: '4. Siswa TIDAK boleh memilih dirinya sendiri (self-nomination ditolak sistem).' },
    { Panduan: '5. Skor Perilaku diisi angka 1 sampai 10 berdasarkan hasil Peer Nomination atau observasi guru.' },
    { Panduan: '6. Kolom Kriteria: isi "Belajar" (Socio-Instrumental) atau "Bermain" (Socio-Affective).' },
    { Panduan: '7. Simpan file dalam format .xlsx atau .csv lalu unggah kembali ke aplikasi Radar Sosial.' },
  ];
  const instructionSheet = XLSX.utils.json_to_sheet(instructions);
  instructionSheet['!cols'] = [{ wch: 80 }];
  XLSX.utils.book_append_sheet(workbook, instructionSheet, 'Petunjuk Pengisian');

  // Trigger download
  XLSX.writeFile(workbook, `Template_Sosiometri_${className.replace(/\s+/g, '_')}.xlsx`);
}

export async function parseUploadedExcel(
  file: File,
  periodId: string,
  classId: string,
  className: string,
  schoolId: string,
  existingStudents: Student[]
): Promise<ParsedExcelResult> {
  const warnings: string[] = [];

  try {
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data, { type: 'array' });

    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const rawJson = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet);

    if (!rawJson || rawJson.length === 0) {
      return {
        success: false,
        message: 'File Excel kosong atau tidak memiliki data yang valid.',
        students: [],
        nominations: [],
        behavioralRatings: [],
        warnings: [],
      };
    }

    const students: Student[] = [];
    const nominations: SociometricNomination[] = [];
    const behavioralRatings: PeerBehavioralRating[] = [];

    // Detect class name from file columns if present
    let detectedClassName: string | undefined;
    for (const row of rawJson) {
      const cVal = row['Kelas / Rombel'] || row['Kelas'] || row['Rombel'] || row['Class'];
      if (cVal && String(cVal).trim()) {
        detectedClassName = String(cVal).trim();
        break;
      }
    }

    // Target effective class name
    const effectiveClassName = detectedClassName || className;

    // Helper map for existing or parsed students
    const nameMap = new Map<string, Student>();
    const nisMap = new Map<string, Student>();

    // Index existing students first
    existingStudents.forEach((s) => {
      nameMap.set(s.name.toLowerCase().trim(), s);
      nisMap.set(s.nis.trim(), s);
    });

    // Step 1: Register all students in the file
    rawJson.forEach((row, index) => {
      const name = (row['Nama Lengkap'] || row['Nama'] || row['name'] || '').toString().trim();
      const nis = (row['NIS'] || row['nis'] || `2026${String(index + 1).padStart(4, '0')}`).toString().trim();
      const genderRaw = (row['Jenis Kelamin (L/P)'] || row['JK'] || row['gender'] || 'L').toString().toUpperCase().trim();
      const gender: 'L' | 'P' = genderRaw.startsWith('P') ? 'P' : 'L';

      if (!name) return;

      let studentObj = nameMap.get(name.toLowerCase()) || nisMap.get(nis);
      if (!studentObj) {
        studentObj = {
          id: `s-imp-${Date.now()}-${index}`,
          nis,
          name,
          gender,
          classId,
          className: effectiveClassName,
          schoolId,
        };
        nameMap.set(name.toLowerCase(), studentObj);
        nisMap.set(nis, studentObj);
      }
      students.push(studentObj);
    });

    let nomIdCounter = 1;

    // Step 2: Parse nominations and behavioral scores
    rawJson.forEach((row) => {
      const nominatorName = (row['Nama Lengkap'] || row['Nama'] || '').toString().trim();
      const nominator = nameMap.get(nominatorName.toLowerCase());
      if (!nominator) return;

      const criteriaRaw = (row['Kriteria (Belajar/Bermain)'] || 'Belajar').toString().toLowerCase();
      const criteria: RelationCriteria = criteriaRaw.includes('main') ? 'bermain' : 'belajar';

      // Parse likes (up to 3)
      const likeKeys = ['Pilihan Suka 1 (Nama)', 'Pilihan Suka 2 (Nama)', 'Pilihan Suka 3 (Nama)', 'Suka 1', 'Suka 2', 'Suka 3'];
      likeKeys.forEach((k) => {
        const targetName = (row[k] || '').toString().trim();
        if (!targetName) return;

        const target = nameMap.get(targetName.toLowerCase());
        if (!target) {
          warnings.push(`Pilihan suka "${targetName}" oleh ${nominator.name} tidak ditemukan dalam daftar siswa.`);
          return;
        }

        // Prevent self nomination
        if (target.id === nominator.id) {
          warnings.push(`Siswa ${nominator.name} memilih dirinya sendiri (self-nomination otomatis diabaikan).`);
          return;
        }

        nominations.push({
          id: `nom-up-${Date.now()}-${nomIdCounter++}`,
          periodId,
          classId,
          studentId: nominator.id,
          targetId: target.id,
          criteria,
          type: 'like',
        });
      });

      // Parse dislikes (up to 3)
      const dislikeKeys = ['Pilihan Tidak Suka 1 (Nama)', 'Pilihan Tidak Suka 2 (Nama)', 'Pilihan Tidak Suka 3 (Nama)', 'Tidak Suka 1', 'Tidak Suka 2', 'Tidak Suka 3'];
      dislikeKeys.forEach((k) => {
        const targetName = (row[k] || '').toString().trim();
        if (!targetName) return;

        const target = nameMap.get(targetName.toLowerCase());
        if (!target) {
          warnings.push(`Pilihan tidak suka "${targetName}" oleh ${nominator.name} tidak ditemukan dalam daftar siswa.`);
          return;
        }

        if (target.id === nominator.id) {
          warnings.push(`Siswa ${nominator.name} menolak dirinya sendiri (diabaikan).`);
          return;
        }

        nominations.push({
          id: `nom-up-${Date.now()}-${nomIdCounter++}`,
          periodId,
          classId,
          studentId: nominator.id,
          targetId: target.id,
          criteria,
          type: 'dislike',
        });
      });

      // Parse behavioral scores
      const prosocial = Number(row['Skor Prososial (1-10)']) || 5;
      const aggressive = Number(row['Skor Agresif (1-10)']) || 2;
      const withdrawn = Number(row['Skor Menarik Diri (1-10)']) || 2;
      const victimization = Number(row['Skor Viktimisasi (1-10)']) || 1;
      const hyperactive = Number(row['Skor Hiperaktif (1-10)']) || 2;

      behavioralRatings.push({
        id: `br-up-${nominator.id}`,
        periodId,
        classId,
        studentId: nominator.id,
        prosocial: Math.max(1, Math.min(10, prosocial)),
        aggressive: Math.max(1, Math.min(10, aggressive)),
        withdrawn: Math.max(1, Math.min(10, withdrawn)),
        victimization: Math.max(1, Math.min(10, victimization)),
        hyperactive: Math.max(1, Math.min(10, hyperactive)),
      });
    });

    return {
      success: true,
      message: `Berhasil memproses ${students.length} siswa, ${nominations.length} relasi sosiometri, dan ${behavioralRatings.length} profil perilaku.`,
      students,
      nominations,
      behavioralRatings,
      warnings,
      detectedClassName,
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Gagal membaca file Excel: ${err?.message || 'Format tidak didukung'}`,
      students: [],
      nominations: [],
      behavioralRatings: [],
      warnings: [],
    };
  }
}

export function exportResearchDataCSV(data: any[], filename: string) {
  if (!data || data.length === 0) return;
  const worksheet = XLSX.utils.json_to_sheet(data);
  const csvOutput = XLSX.utils.sheet_to_csv(worksheet);
  const blob = new Blob([csvOutput], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportResearchDataJSON(data: any, filename: string) {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
