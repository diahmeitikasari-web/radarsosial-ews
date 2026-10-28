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
  // If class has no students yet, provide realistic sample rows so enumerators see immediate examples
  const sourceStudents =
    classStudents.length > 0
      ? classStudents
      : [
          { id: 'sample-1', nis: '20260001', name: 'Ahmad Fauzi', gender: 'L' as const, className, classId: '', schoolId: '' },
          { id: 'sample-2', nis: '20260002', name: 'Annisa Putri', gender: 'P' as const, className, classId: '', schoolId: '' },
          { id: 'sample-3', nis: '20260003', name: 'Bagas Saputra', gender: 'L' as const, className, classId: '', schoolId: '' },
          { id: 'sample-4', nis: '20260004', name: 'Citra Lestari', gender: 'P' as const, className, classId: '', schoolId: '' },
          { id: 'sample-5', nis: '20260005', name: 'Daffa Al Ghifari', gender: 'L' as const, className, classId: '', schoolId: '' },
        ];

  const isSample = classStudents.length === 0;

  // Build rows directly matching Questionnaire Sections:
  // - Identitas Siswa
  // - Bagian A: Pilihan Teman Belajar (Sosio-Instrumental)
  // - Bagian B: Pilihan Teman Bermain / Bergaul (Sosio-Afektif)
  // - Bagian C: Evaluasi Karakter & Perilaku Sebaya (Radar Perilaku)
  const rows = sourceStudents.map((s, idx) => ({
    'Kelas / Rombel': className,
    NIS: s.nis,
    'Nama Lengkap': s.name,
    'Jenis Kelamin (L/P)': s.gender,

    // BAGIAN A: TEMAN BELAJAR (SOSIO-INSTRUMENTAL) - Kuesioner Bagian A
    '[Belajar] Suka 1 (Nama)': isSample ? (idx === 0 ? 'Annisa Putri' : idx === 1 ? 'Citra Lestari' : 'Ahmad Fauzi') : '',
    '[Belajar] Suka 2 (Nama)': isSample ? (idx === 0 ? 'Bagas Saputra' : idx === 1 ? 'Ahmad Fauzi' : 'Annisa Putri') : '',
    '[Belajar] Suka 3 (Nama)': isSample ? (idx === 0 ? 'Citra Lestari' : idx === 1 ? 'Bagas Saputra' : 'Daffa Al Ghifari') : '',
    '[Belajar] Hindari 1 (Nama)': '',
    '[Belajar] Hindari 2 (Nama)': '',

    // BAGIAN B: TEMAN BERMAIN / BERGAUL (SOSIO-AFEKTIF) - Kuesioner Bagian B
    '[Bermain] Suka 1 (Nama)': isSample ? (idx === 0 ? 'Bagas Saputra' : idx === 1 ? 'Citra Lestari' : 'Daffa Al Ghifari') : '',
    '[Bermain] Suka 2 (Nama)': isSample ? (idx === 0 ? 'Daffa Al Ghifari' : idx === 1 ? 'Ahmad Fauzi' : 'Annisa Putri') : '',
    '[Bermain] Suka 3 (Nama)': '',
    '[Bermain] Hindari 1 (Nama)': '',
    '[Bermain] Hindari 2 (Nama)': '',

    // BAGIAN C: RADAR PERILAKU SEBAYA (Skala Skor 1 - 10) - Kuesioner Bagian C
    'Skor Prososial (1-10)': isSample ? (idx === 0 ? 8 : 6) : 5,
    'Skor Agresif (1-10)': isSample ? (idx === 0 ? 1 : 2) : 2,
    'Skor Menarik Diri (1-10)': isSample ? (idx === 0 ? 2 : 1) : 2,
    'Skor Viktimisasi (1-10)': isSample ? 1 : 1,
    'Skor Hiperaktif (1-10)': isSample ? (idx === 0 ? 2 : 3) : 2,
  }));

  // Create workbook & worksheet
  const worksheet = XLSX.utils.json_to_sheet(rows);

  // Set column widths for readability
  worksheet['!cols'] = [
    { wch: 16 }, // Kelas / Rombel
    { wch: 12 }, // NIS
    { wch: 26 }, // Nama Lengkap
    { wch: 18 }, // Jenis Kelamin
    { wch: 24 }, // [Belajar] Suka 1
    { wch: 24 }, // [Belajar] Suka 2
    { wch: 24 }, // [Belajar] Suka 3
    { wch: 26 }, // [Belajar] Hindari 1
    { wch: 26 }, // [Belajar] Hindari 2
    { wch: 24 }, // [Bermain] Suka 1
    { wch: 24 }, // [Bermain] Suka 2
    { wch: 24 }, // [Bermain] Suka 3
    { wch: 26 }, // [Bermain] Hindari 1
    { wch: 26 }, // [Bermain] Hindari 2
    { wch: 20 }, // Skor Prososial
    { wch: 18 }, // Skor Agresif
    { wch: 22 }, // Skor Menarik Diri
    { wch: 22 }, // Skor Viktimisasi
    { wch: 20 }, // Skor Hiperaktif
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Input Sosiometri & Perilaku');

  // Add Comprehensive Instruction Sheet for Enumerators
  const instructions = [
    { No: 'PANDUAN', Keterangan: 'PANDUAN PENGISIAN TEMPLATE EXCEL SOSIOMETRI & PERILAKU SISWA (RADAR SOSIAL)' },
    { No: '1', Keterangan: 'Satu baris mewakili 1 orang siswa pengisi kuesioner (nominator).' },
    { No: '2', Keterangan: 'Jangan menghapus atau mengubah nama kolom pada baris pertama.' },
    { No: '3', Keterangan: 'Kolom "Nama Lengkap" dan "NIS" adalah identitas siswa pengisi.' },
    { No: '4', Keterangan: 'BAGIAN A (BELAJAR): Salin jawaban Kuesioner Bagian A No. 1 ke kolom "[Belajar] Suka 1 s.d. 3", dan No. 2 ke "[Belajar] Hindari 1 s.d. 2" (kosongkan jika tidak ada).' },
    { No: '5', Keterangan: 'BAGIAN B (BERMAIN): Salin jawaban Kuesioner Bagian B No. 3 ke kolom "[Bermain] Suka 1 s.d. 3", dan No. 4 ke "[Bermain] Hindari 1 s.d. 2" (kosongkan jika tidak ada).' },
    { No: '6', Keterangan: 'BAGIAN C (PERILAKU SEBAYA): Masukkan estimasi skor 1 s.d 10 untuk masing-masing dimensi karakter (Nilai default: Prososial=5, Agresif=2, Menarik Diri=2, Viktimisasi=1, Hiperaktif=2).' },
    { No: '7', Keterangan: 'LARANGAN: Siswa TIDAK boleh memilih namanya sendiri (self-nomination otomatis diabaikan sistem).' },
    { No: '8', Keterangan: 'KONSISTENSI NAMA: Ejaan nama teman yang dipilih harus sama dengan daftar nama siswa di kelas agar sosiogram terhubung sempurna.' },
    { No: '9', Keterangan: 'Simpan file dalam format .xlsx atau .csv lalu unggah kembali ke aplikasi Radar Sosial.' },
  ];
  const instructionSheet = XLSX.utils.json_to_sheet(instructions);
  instructionSheet['!cols'] = [{ wch: 10 }, { wch: 90 }];
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

    // Helper to register a nomination cleanly
    const addNomination = (
      nominator: Student,
      rawTargetName: string,
      criteria: RelationCriteria,
      type: 'like' | 'dislike'
    ) => {
      if (!rawTargetName) return;
      // Support comma-separated names in a single cell
      const targetNames = rawTargetName.split(/[,;\n]+/).map((s) => s.trim()).filter(Boolean);

      targetNames.forEach((targetName) => {
        const target = nameMap.get(targetName.toLowerCase());
        if (!target) {
          warnings.push(
            `Pilihan ${type === 'like' ? 'suka' : 'hindari'} (${criteria}) "${targetName}" oleh ${nominator.name} tidak ditemukan dalam daftar siswa.`
          );
          return;
        }

        // Prevent self nomination
        if (target.id === nominator.id) {
          warnings.push(
            `Siswa ${nominator.name} memilih/menolak dirinya sendiri pada kriteria ${criteria} (self-nomination otomatis diabaikan).`
          );
          return;
        }

        // Check duplicate within same student, criteria, and type
        const isDuplicate = nominations.some(
          (n) =>
            n.studentId === nominator.id &&
            n.targetId === target.id &&
            n.criteria === criteria &&
            n.type === type
        );
        if (isDuplicate) return;

        nominations.push({
          id: `nom-up-${Date.now()}-${nomIdCounter++}`,
          periodId,
          classId,
          studentId: nominator.id,
          targetId: target.id,
          criteria,
          type,
        });
      });
    };

    // Step 2: Parse nominations and behavioral scores
    rawJson.forEach((row) => {
      const nominatorName = (row['Nama Lengkap'] || row['Nama'] || '').toString().trim();
      const nominator = nameMap.get(nominatorName.toLowerCase());
      if (!nominator) return;

      // Define possible keys for Belajar Likes & Dislikes
      const belajarLikeKeys = [
        '[Belajar] Suka 1 (Nama)',
        '[Belajar] Suka 2 (Nama)',
        '[Belajar] Suka 3 (Nama)',
        '[Belajar] Suka 1',
        '[Belajar] Suka 2',
        '[Belajar] Suka 3',
        '[Belajar] Pilihan Suka 1',
        '[Belajar] Pilihan Suka 2',
        '[Belajar] Pilihan Suka 3',
        'Suka Belajar 1',
        'Suka Belajar 2',
        'Suka Belajar 3',
        'Belajar Suka 1',
        'Belajar Suka 2',
        'Belajar Suka 3',
        'like_belajar',
        'like_belajar_1',
        'like_belajar_2',
        'like_belajar_3',
      ];

      const belajarDislikeKeys = [
        '[Belajar] Hindari 1 (Nama)',
        '[Belajar] Hindari 2 (Nama)',
        '[Belajar] Hindari 1',
        '[Belajar] Hindari 2',
        '[Belajar] Pilihan Hindari 1',
        '[Belajar] Pilihan Hindari 2',
        '[Belajar] Tidak Suka 1',
        '[Belajar] Tidak Suka 2',
        '[Belajar] Pilihan Tidak Suka 1',
        '[Belajar] Pilihan Tidak Suka 2',
        'Tidak Suka Belajar 1',
        'Tidak Suka Belajar 2',
        'Hindari Belajar 1',
        'Hindari Belajar 2',
        'dislike_belajar',
        'dislike_belajar_1',
        'dislike_belajar_2',
      ];

      // Define possible keys for Bermain Likes & Dislikes
      const bermainLikeKeys = [
        '[Bermain] Suka 1 (Nama)',
        '[Bermain] Suka 2 (Nama)',
        '[Bermain] Suka 3 (Nama)',
        '[Bermain] Suka 1',
        '[Bermain] Suka 2',
        '[Bermain] Suka 3',
        '[Bermain] Pilihan Suka 1',
        '[Bermain] Pilihan Suka 2',
        '[Bermain] Pilihan Suka 3',
        'Suka Bermain 1',
        'Suka Bermain 2',
        'Suka Bermain 3',
        'Bermain Suka 1',
        'Bermain Suka 2',
        'Bermain Suka 3',
        'like_bermain',
        'like_bermain_1',
        'like_bermain_2',
        'like_bermain_3',
      ];

      const bermainDislikeKeys = [
        '[Bermain] Hindari 1 (Nama)',
        '[Bermain] Hindari 2 (Nama)',
        '[Bermain] Hindari 1',
        '[Bermain] Hindari 2',
        '[Bermain] Pilihan Hindari 1',
        '[Bermain] Pilihan Hindari 2',
        '[Bermain] Tidak Suka 1',
        '[Bermain] Tidak Suka 2',
        '[Bermain] Pilihan Tidak Suka 1',
        '[Bermain] Pilihan Tidak Suka 2',
        'Tidak Suka Bermain 1',
        'Tidak Suka Bermain 2',
        'Hindari Bermain 1',
        'Hindari Bermain 2',
        'dislike_bermain',
        'dislike_bermain_1',
        'dislike_bermain_2',
      ];

      // Check if row contains explicit Belajar or Bermain column keys
      const hasExplicitBelajar = belajarLikeKeys.some((k) => row[k] !== undefined);
      const hasExplicitBermain = bermainLikeKeys.some((k) => row[k] !== undefined);

      if (hasExplicitBelajar || hasExplicitBermain) {
        // Mode 1: Simultaneous Belajar & Bermain in single row
        belajarLikeKeys.forEach((k) => {
          if (row[k]) addNomination(nominator, String(row[k]).trim(), 'belajar', 'like');
        });
        belajarDislikeKeys.forEach((k) => {
          if (row[k]) addNomination(nominator, String(row[k]).trim(), 'belajar', 'dislike');
        });

        bermainLikeKeys.forEach((k) => {
          if (row[k]) addNomination(nominator, String(row[k]).trim(), 'bermain', 'like');
        });
        bermainDislikeKeys.forEach((k) => {
          if (row[k]) addNomination(nominator, String(row[k]).trim(), 'bermain', 'dislike');
        });
      } else {
        // Mode 2: Legacy single-criteria column format (backward compatibility)
        const criteriaRaw = (row['Kriteria (Belajar/Bermain)'] || 'Belajar').toString().toLowerCase();
        const criteria: RelationCriteria = criteriaRaw.includes('main') ? 'bermain' : 'belajar';

        const legacyLikeKeys = [
          'Pilihan Suka 1 (Nama)',
          'Pilihan Suka 2 (Nama)',
          'Pilihan Suka 3 (Nama)',
          'Suka 1',
          'Suka 2',
          'Suka 3',
        ];
        legacyLikeKeys.forEach((k) => {
          if (row[k]) addNomination(nominator, String(row[k]).trim(), criteria, 'like');
        });

        const legacyDislikeKeys = [
          'Pilihan Tidak Suka 1 (Nama)',
          'Pilihan Tidak Suka 2 (Nama)',
          'Pilihan Tidak Suka 3 (Nama)',
          'Tidak Suka 1',
          'Tidak Suka 2',
          'Tidak Suka 3',
        ];
        legacyDislikeKeys.forEach((k) => {
          if (row[k]) addNomination(nominator, String(row[k]).trim(), criteria, 'dislike');
        });
      }

      // Parse behavioral scores with rich alias support
      const prosocial = Number(row['Skor Prososial (1-10)'] || row['Prososial'] || row['prosocial']) || 5;
      const aggressive = Number(row['Skor Agresif (1-10)'] || row['Agresif'] || row['aggressive']) || 2;
      const withdrawn = Number(row['Skor Menarik Diri (1-10)'] || row['Menarik Diri'] || row['withdrawn']) || 2;
      const victimization = Number(row['Skor Viktimisasi (1-10)'] || row['Viktimisasi'] || row['victimization']) || 1;
      const hyperactive = Number(row['Skor Hiperaktif (1-10)'] || row['Hiperaktif'] || row['hyperactive']) || 2;

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
