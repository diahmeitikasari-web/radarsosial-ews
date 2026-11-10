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

    if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
      return {
        success: false,
        message: 'Berkas Excel tidak memiliki sheet yang dapat dibaca.',
        students: [],
        nominations: [],
        behavioralRatings: [],
        warnings: [],
      };
    }

    // 1. Detect the data worksheet (prefer sheet containing student headers, skip pure instruction sheets)
    let targetSheet = workbook.Sheets[workbook.SheetNames[0]];
    let chosenSheetName = workbook.SheetNames[0];
    let bestHeaderRowIndex = 0;
    let maxHeaderScore = -1;

    for (const sName of workbook.SheetNames) {
      if (workbook.SheetNames.length > 1 && (sName.toLowerCase().includes('petunjuk') || sName.toLowerCase().includes('panduan'))) {
        continue;
      }
      const ws = workbook.Sheets[sName];
      if (ws) {
        const testRows = XLSX.utils.sheet_to_json<any[]>(ws, { header: 1, range: 0, blankrows: true });
        if (testRows && testRows.length > 0) {
          // Check top 25 rows for student identification headers
          for (let r = 0; r < Math.min(25, testRows.length); r++) {
            const rowArr = testRows[r] || [];
            let score = 0;
            const rowStr = rowArr.map((cell) => String(cell || '').toLowerCase()).join(' ');
            if (rowStr.includes('nama') || rowStr.includes('name') || rowStr.includes('siswa')) score += 4;
            if (rowStr.includes('nis')) score += 2;
            if (rowStr.includes('kelas') || rowStr.includes('rombel')) score += 2;
            if (rowStr.includes('suka') || rowStr.includes('pilihan') || rowStr.includes('teman')) score += 3;
            if (rowStr.includes('belajar') || rowStr.includes('bermain')) score += 3;
            if (rowStr.includes('hindari') || rowStr.includes('tidak suka') || rowStr.includes('ditolak')) score += 2;
            if (rowStr.includes('jk') || rowStr.includes('gender') || rowStr.includes('jenis kelamin')) score += 1;

            if (score > maxHeaderScore) {
              maxHeaderScore = score;
              targetSheet = ws;
              chosenSheetName = sName;
              bestHeaderRowIndex = r;
            }
          }
        }
      }
    }

    // Parse starting from bestHeaderRowIndex with defval: ''
    const rawJson = XLSX.utils.sheet_to_json<Record<string, any>>(targetSheet, {
      range: bestHeaderRowIndex,
      defval: '',
    });

    if (!rawJson || rawJson.length === 0) {
      return {
        success: false,
        message: `Sheet '${chosenSheetName}' pada berkas Excel kosong atau tidak memiliki baris data siswa.`,
        students: [],
        nominations: [],
        behavioralRatings: [],
        warnings: [],
      };
    }

    // Helper: Normalize string for fuzzy name matching
    const cleanStr = (s: any): string => {
      if (s === null || s === undefined) return '';
      return String(s)
        .replace(/[\u00a0\r\n\t]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    };

    const cleanAlpha = (s: any): string => {
      return cleanStr(s)
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '');
    };

    const normalizePhonetic = (s: any): string => {
      return cleanAlpha(s)
        .replace(/y/g, 'i')
        .replace(/v/g, 'f')
        .replace(/sh/g, 's')
        .replace(/sy/g, 's')
        .replace(/dh/g, 'd')
        .replace(/(.)\1+/g, '$1');
    };

    const calcLevenshtein = (a: string, b: string): number => {
      const m = a.length, n = b.length;
      const d: number[][] = [];
      for (let i = 0; i <= m; i++) d[i] = [i];
      for (let j = 0; j <= n; j++) d[0][j] = j;
      for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
          d[i][j] = Math.min(
            d[i - 1][j] + 1,
            d[i][j - 1] + 1,
            d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
          );
        }
      }
      return d[m][n];
    };

    // Helper to get case-insensitive / space-trimmed values from a row object
    const getRowValue = (row: Record<string, any>, possibleKeys: string[]): string => {
      const rowKeys = Object.keys(row);
      // 1. Exact match
      for (const pk of possibleKeys) {
        if (row[pk] !== undefined && row[pk] !== null && String(row[pk]).trim() !== '') {
          return cleanStr(row[pk]);
        }
      }
      // 2. Normalized alphanumeric match
      const normMap = new Map<string, string>();
      for (const k of rowKeys) {
        normMap.set(cleanAlpha(k), k);
      }
      for (const pk of possibleKeys) {
        const pkAlpha = cleanAlpha(pk);
        const matchedKey = normMap.get(pkAlpha);
        if (
          matchedKey &&
          row[matchedKey] !== undefined &&
          row[matchedKey] !== null &&
          String(row[matchedKey]).trim() !== ''
        ) {
          return cleanStr(row[matchedKey]);
        }
      }
      return '';
    };

    // Detect class name from file columns or sheet name if present
    let detectedClassName: string | undefined;
    for (const row of rawJson) {
      const cVal = getRowValue(row, [
        'Kelas / Rombel',
        'Kelas/Rombel',
        'Kelas',
        'Rombel',
        'Class',
        'Tingkat/Kelas',
        'Tingkat',
      ]);
      if (cVal) {
        detectedClassName = cVal;
        break;
      }
    }

    // If no explicit class column, check sheet name (e.g. "3B", "Kelas 3B", "IX B")
    if (!detectedClassName && chosenSheetName) {
      const sTrim = cleanStr(chosenSheetName);
      if (
        !sTrim.toLowerCase().startsWith('sheet') &&
        !sTrim.toLowerCase().includes('panduan') &&
        !sTrim.toLowerCase().includes('petunjuk') &&
        !sTrim.toLowerCase().includes('template')
      ) {
        detectedClassName = sTrim;
      }
    }

    const effectiveClassName = detectedClassName || className;

    // Student Lookup Tables
    const exactNameMap = new Map<string, Student>();
    const alphaNameMap = new Map<string, Student>();
    const nisMap = new Map<string, Student>();
    const indexMap = new Map<string, Student>();
    const students: Student[] = [];

    // Pre-populate with existing students if any
    existingStudents.forEach((s) => {
      const cName = cleanStr(s.name).toLowerCase();
      exactNameMap.set(cName, s);
      alphaNameMap.set(cleanAlpha(s.name), s);
      if (s.nis) nisMap.set(cleanStr(s.nis), s);
      if (s.nisn) nisMap.set(cleanStr(s.nisn), s);
    });

    // Step 1: Register all students in the Excel file
    rawJson.forEach((row, index) => {
      const name = getRowValue(row, [
        'Nama Lengkap',
        'Nama Siswa',
        'Nama Murid',
        'Nama Peserta Didik',
        'Nama Anak',
        'Nama',
        'name',
        'Student Name',
        'Siswa',
      ]);
      const explicitNo = getRowValue(row, ['No', 'No.', 'Nomor', 'No Absen', 'Absen', 'No Urut']);
      const nis =
        getRowValue(row, ['NIS', 'nis', 'Nomor Induk', 'NISN', 'No Induk']) ||
        `2026${String(index + 1).padStart(4, '0')}`;
      const genderRaw = getRowValue(row, [
        'Jenis Kelamin (L/P)',
        'Jenis Kelamin',
        'JK',
        'Gender',
        'L/P',
        'Kelamin',
      ]).toUpperCase();
      const gender: 'L' | 'P' =
        genderRaw.startsWith('P') || genderRaw === 'PEREMPUAN' || genderRaw === 'FEMALE' ? 'P' : 'L';

      if (!name) return;

      const normName = cleanStr(name).toLowerCase();
      const alphaKey = cleanAlpha(name);
      const cleanNis = cleanStr(nis);

      let studentObj =
        exactNameMap.get(normName) ||
        alphaNameMap.get(alphaKey) ||
        (cleanNis ? nisMap.get(cleanNis) : undefined);

      if (!studentObj) {
        studentObj = {
          id: `s-imp-${Date.now()}-${index}`,
          nis: cleanNis,
          name: cleanStr(name),
          gender,
          classId,
          className: effectiveClassName,
          schoolId,
        };
      } else {
        studentObj = {
          ...studentObj,
          name: cleanStr(name) || studentObj.name,
          gender: gender || studentObj.gender,
          nis: cleanNis || studentObj.nis,
          classId,
          className: effectiveClassName,
        };
      }

      // Register student across all lookup maps
      exactNameMap.set(normName, studentObj);
      alphaNameMap.set(alphaKey, studentObj);
      if (cleanNis) nisMap.set(cleanNis, studentObj);

      // Register index map by row number (e.g. "1", "01")
      indexMap.set(String(index + 1), studentObj);
      indexMap.set(String(index + 1).padStart(2, '0'), studentObj);

      // Register index map by explicit No column if present
      if (explicitNo) {
        const cleanNo = explicitNo.replace(/[^0-9]/g, '');
        if (cleanNo) {
          indexMap.set(cleanNo, studentObj);
          indexMap.set(String(parseInt(cleanNo, 10)), studentObj);
        }
      }

      students.push(studentObj);
    });

    if (students.length === 0) {
      return {
        success: false,
        message: 'Tidak ditemukan baris data siswa yang valid pada kolom "Nama Lengkap" atau "Nama Siswa".',
        students: [],
        nominations: [],
        behavioralRatings: [],
        warnings: [],
      };
    }

    // Flexible student resolver (resolves name, NIS, student row/absen index, phonetic spelling, word tokens, or bullet-prefixed strings)
    const resolveStudent = (queryRaw: string, nominatorId: string): Student | null => {
      const q = cleanStr(queryRaw);
      if (!q) return null;

      // 1. Direct name match
      const low = q.toLowerCase();
      if (exactNameMap.has(low)) return exactNameMap.get(low)!;

      // 2. Alpha-clean match
      const a = cleanAlpha(q);
      if (alphaNameMap.has(a)) return alphaNameMap.get(a)!;

      // 3. NIS match
      if (nisMap.has(q)) return nisMap.get(q)!;

      // 4. Number / Absen index match (e.g. "1", "01", "#1", "No 1", "No. 1")
      const numMatch = q.match(/^(?:no\.?|#)?\s*(\d+)$/i);
      if (numMatch) {
        const numStr = String(parseInt(numMatch[1], 10));
        if (indexMap.has(numStr)) return indexMap.get(numStr)!;
      }

      // 5. Number prefix match (e.g. "1. Bima Sakti", "02 - Citra", "1 Bima", "(1) Bima")
      const prefixMatch = q.match(/^(?:no\.?|#)?\s*(\d+)[\.\-\)\:\s]+(.*)$/i);
      if (prefixMatch) {
        const numPart = String(parseInt(prefixMatch[1], 10));
        const namePart = cleanStr(prefixMatch[2]);
        if (indexMap.has(numPart)) return indexMap.get(numPart)!;
        if (namePart) {
          const directName =
            exactNameMap.get(namePart.toLowerCase()) || alphaNameMap.get(cleanAlpha(namePart));
          if (directName) return directName;
        }
      }

      // 6. Number suffix match (e.g. "Bima Sakti (1)", "Citra #2", "Daffa [3]")
      const suffixMatch = q.match(/^(.*?)\s*[\(\[\#\-\:]\s*(?:no\.?)?\s*(\d+)\s*[\)\]]?$/i);
      if (suffixMatch) {
        const namePart = cleanStr(suffixMatch[1]);
        const numPart = String(parseInt(suffixMatch[2], 10));
        if (indexMap.has(numPart)) return indexMap.get(numPart)!;
        if (namePart) {
          const directName =
            exactNameMap.get(namePart.toLowerCase()) || alphaNameMap.get(cleanAlpha(namePart));
          if (directName) return directName;
        }
      }

      // 7. Phonetic match (handles Indonesian 'i' vs 'y', 'f' vs 'v', double consonants)
      const qPhon = normalizePhonetic(q);
      if (qPhon.length >= 3) {
        const phoneticCandidates = students.filter(
          (s) => normalizePhonetic(s.name) === qPhon && s.id !== nominatorId
        );
        if (phoneticCandidates.length === 1) return phoneticCandidates[0];
      }

      // 8. Word token overlap match (e.g. "Muhammad Rafly" vs "MUHAMMAD RAFLI", or unique first/last names)
      const qTokens = cleanStr(q).toLowerCase().split(/\s+/).filter((t) => t.length >= 3);
      if (qTokens.length > 0) {
        const tokenCandidates = students.filter((s) => {
          if (s.id === nominatorId) return false;
          const sTokens = cleanStr(s.name).toLowerCase().split(/\s+/).filter((t) => t.length >= 3);
          return qTokens.every((qt) => {
            const qtPhon = normalizePhonetic(qt);
            return sTokens.some((st) => {
              const stPhon = normalizePhonetic(st);
              return stPhon === qtPhon || calcLevenshtein(qtPhon, stPhon) <= 1;
            });
          });
        });
        if (tokenCandidates.length === 1) return tokenCandidates[0];
      }

      // 9. Fuzzy Levenshtein match on full string or phonetic normalized string
      if (a.length >= 4) {
        const levCandidates = students.filter((s) => {
          if (s.id === nominatorId) return false;
          const sAlpha = cleanAlpha(s.name);
          const sPhon = normalizePhonetic(s.name);
          const dist1 = calcLevenshtein(a, sAlpha);
          const dist2 = calcLevenshtein(qPhon, sPhon);
          return dist1 <= 2 || dist2 <= 2;
        });
        if (levCandidates.length === 1) return levCandidates[0];
      }

      // 10. Substring match fallback (e.g. first name when unique)
      if (a.length >= 3) {
        const candidates = students.filter((s) => {
          const sAlpha = cleanAlpha(s.name);
          return sAlpha.includes(a) || a.includes(sAlpha);
        });
        if (candidates.length === 1 && candidates[0].id !== nominatorId) {
          return candidates[0];
        }
      }

      return null;
    };

    const nominations: SociometricNomination[] = [];
    const behavioralRatings: PeerBehavioralRating[] = [];
    let nomIdCounter = 1;

    // Helper to register nominations safely without duplicates or self-selection
    const addNomination = (
      nominator: Student,
      rawTargetStr: string,
      criteria: RelationCriteria,
      type: 'like' | 'dislike'
    ) => {
      if (!rawTargetStr) return;
      // Split on comma, semicolon, newline, slash, '&', '+', or " dan "
      let rawTargets = rawTargetStr
        .split(/[,;\n/&+]+|\s+dan\s+/i)
        .map((s) => cleanStr(s))
        .filter(Boolean);

      // If token is space-separated numbers like "1 4 7" or "01 04 07"
      if (rawTargets.length === 1 && /^\d+(\s+\d+)+$/.test(rawTargets[0])) {
        rawTargets = rawTargets[0].split(/\s+/).map((s) => cleanStr(s)).filter(Boolean);
      }

      rawTargets.forEach((targetStr) => {
        const target = resolveStudent(targetStr, nominator.id);
        if (!target) {
          warnings.push(
            `Pilihan ${type === 'like' ? 'suka' : 'hindari'} (${criteria}) "${targetStr}" oleh ${nominator.name} tidak ditemukan dalam daftar siswa.`
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

    // Helper to identify nomination signals in column names
    const isNominationSignal = (str: string): boolean => {
      const low = str.toLowerCase();
      return (
        low.includes('suka') ||
        low.includes('disukai') ||
        low.includes('hindari') ||
        low.includes('dihindari') ||
        low.includes('tolak') ||
        low.includes('ditolak') ||
        low.includes('tidak suka') ||
        low.includes('tidak disukai') ||
        low.includes('kurang suka') ||
        low.includes('dijauhi') ||
        low.includes('benci') ||
        low.includes('enggan') ||
        low.includes('pilihan') ||
        low.includes('pilih') ||
        low.includes('teman') ||
        low.includes('kawan') ||
        low.includes('sahabat') ||
        low.includes('choice') ||
        low.includes('nominasi') ||
        low.includes('nominate') ||
        low.includes('dislike') ||
        low.includes('like') ||
        low.includes('preferensi') ||
        low.includes('belajar') ||
        low.includes('bermain') ||
        low.includes('bergaul') ||
        low.includes('main') ||
        low.includes('ajar') ||
        low.includes('akademik') ||
        low.includes('sosial')
      );
    };

    // Helper to identify behavioral score columns
    const isBehavioralCol = (str: string): boolean => {
      const low = str.toLowerCase();
      return (
        low.includes('prososial') ||
        low.includes('agresif') ||
        low.includes('menarik diri') ||
        low.includes('viktimisasi') ||
        low.includes('hiperaktif')
      );
    };

    // Helper to identify nominator's identity columns (own student record)
    const isIdentityCol = (str: string): boolean => {
      const low = str.toLowerCase();
      // Crucial: if it has nomination keywords (like "[Belajar] Suka 1 (Nama)"), it is NOT an identity column!
      if (isNominationSignal(low)) return false;

      return (
        low.includes('nama') ||
        low.includes('nis') ||
        low.includes('kelas') ||
        low.includes('rombel') ||
        low.includes('gender') ||
        low.includes('jenis kelamin') ||
        low.includes('kelamin') ||
        low.includes('jk') ||
        low.includes('l/p') ||
        low.includes('absen') ||
        low === 'no' ||
        low === 'no.' ||
        low === 'nomor' ||
        low === 'no urut' ||
        (low.startsWith('no') && low.length <= 5)
      );
    };

    // Analyze sheet column headers dynamically
    const allRowKeys = Array.from(new Set(rawJson.flatMap((r) => Object.keys(r))));
    const isDualCriteria = allRowKeys.some((k) => {
      const l = cleanStr(k).toLowerCase();
      return l.includes('belajar') || l.includes('bermain');
    });

    // Classify all columns dynamically:
    const belajarLikeCols: string[] = [];
    const belajarDislikeCols: string[] = [];
    const bermainLikeCols: string[] = [];
    const bermainDislikeCols: string[] = [];
    const generalLikeCols: string[] = [];
    const generalDislikeCols: string[] = [];
    const matrixCols: { key: string; targetStudent: Student }[] = [];

    allRowKeys.forEach((k) => {
      const low = cleanStr(k).toLowerCase();
      const alpha = cleanAlpha(k);

      // 1. Skip behavioral columns
      if (isBehavioralCol(low)) {
        return;
      }

      // 2. Skip student identity columns
      if (isIdentityCol(low)) {
        return;
      }

      // 3. Matrix format: Check if column header is a student absen index (e.g. "1", "2", "3")
      const cleanDigits = k.replace(/[^0-9]/g, '');
      if (cleanDigits && indexMap.has(cleanDigits) && !isNominationSignal(low)) {
        matrixCols.push({ key: k, targetStudent: indexMap.get(cleanDigits)! });
        return;
      }

      // 4. Matrix format: Check if column header matches an exact student name
      const studentMatch = exactNameMap.get(low) || alphaNameMap.get(alpha);
      if (studentMatch && !isNominationSignal(low)) {
        matrixCols.push({ key: k, targetStudent: studentMatch });
        return;
      }

      // 5. Sociometric Nomination Columns
      const isDislike =
        low.includes('hindari') ||
        low.includes('dihindari') ||
        low.includes('tidak suka') ||
        low.includes('tidak disukai') ||
        low.includes('kurang suka') ||
        low.includes('dijauhi') ||
        low.includes('tolak') ||
        low.includes('ditolak') ||
        low.includes('negatif') ||
        low.includes('(-)') ||
        low.includes('benci') ||
        low.includes('enggan') ||
        low.includes('dislike');

      const isBelajar =
        low.includes('belajar') ||
        low.includes('ajar') ||
        low.includes('akademik') ||
        low.includes('tugas');

      const isBermain =
        low.includes('bermain') ||
        low.includes('main') ||
        low.includes('bergaul') ||
        low.includes('gaul') ||
        low.includes('istirahat') ||
        low.includes('sosial');

      if (isBelajar) {
        if (isDislike) {
          belajarDislikeCols.push(k);
        } else {
          belajarLikeCols.push(k);
        }
      } else if (isBermain) {
        if (isDislike) {
          bermainDislikeCols.push(k);
        } else {
          bermainLikeCols.push(k);
        }
      } else if (
        low.includes('pilihan') ||
        low.includes('pilih') ||
        low.includes('suka') ||
        low.includes('teman') ||
        low.includes('kawan') ||
        low.includes('sahabat') ||
        low.includes('choice') ||
        low.includes('nominasi') ||
        isDislike
      ) {
        if (isDislike) {
          generalDislikeCols.push(k);
        } else {
          generalLikeCols.push(k);
        }
      }
    });

    // Step 2: Parse nominations and behavioral scores for each row
    rawJson.forEach((row, rowIndex) => {
      const nominatorName = getRowValue(row, [
        'Nama Lengkap',
        'Nama Siswa',
        'Nama Murid',
        'Nama Peserta Didik',
        'Nama Anak',
        'Nama',
        'name',
        'Student Name',
        'Siswa',
      ]);
      if (!nominatorName) return;

      const nominator =
        exactNameMap.get(cleanStr(nominatorName).toLowerCase()) ||
        alphaNameMap.get(cleanAlpha(nominatorName)) ||
        students[rowIndex];
      if (!nominator) return;

      // 1. Process Belajar Columns
      if (belajarLikeCols.length > 0) {
        belajarLikeCols.forEach((colKey) => {
          const val = cleanStr(row[colKey]);
          if (val) addNomination(nominator, val, 'belajar', 'like');
        });
      }
      if (belajarDislikeCols.length > 0) {
        belajarDislikeCols.forEach((colKey) => {
          const val = cleanStr(row[colKey]);
          if (val) addNomination(nominator, val, 'belajar', 'dislike');
        });
      }

      // 2. Process Bermain Columns
      if (bermainLikeCols.length > 0) {
        bermainLikeCols.forEach((colKey) => {
          const val = cleanStr(row[colKey]);
          if (val) addNomination(nominator, val, 'bermain', 'like');
        });
      }
      if (bermainDislikeCols.length > 0) {
        bermainDislikeCols.forEach((colKey) => {
          const val = cleanStr(row[colKey]);
          if (val) addNomination(nominator, val, 'bermain', 'dislike');
        });
      }

      // 3. Process General Columns (e.g. "Pilihan 1, 2, 3" without Belajar/Bermain separation)
      if (generalLikeCols.length > 0 || generalDislikeCols.length > 0) {
        const criteriaRaw = getRowValue(row, ['Kriteria (Belajar/Bermain)', 'Kriteria', 'Criteria']).toLowerCase();
        const explicitCriteria: RelationCriteria | null = criteriaRaw.includes('main')
          ? 'bermain'
          : criteriaRaw.includes('ajar')
          ? 'belajar'
          : null;

        generalLikeCols.forEach((colKey) => {
          const val = cleanStr(row[colKey]);
          if (val) {
            if (explicitCriteria) {
              addNomination(nominator, val, explicitCriteria, 'like');
            } else {
              // Register for both criteria so both sosiograms are populated
              addNomination(nominator, val, 'belajar', 'like');
              addNomination(nominator, val, 'bermain', 'like');
            }
          }
        });

        generalDislikeCols.forEach((colKey) => {
          const val = cleanStr(row[colKey]);
          if (val) {
            if (explicitCriteria) {
              addNomination(nominator, val, explicitCriteria, 'dislike');
            } else {
              addNomination(nominator, val, 'belajar', 'dislike');
              addNomination(nominator, val, 'bermain', 'dislike');
            }
          }
        });
      }

      // 4. Process Sociometric Matrix format if matrix columns detected
      if (matrixCols.length >= 3) {
        matrixCols.forEach(({ key, targetStudent }) => {
          if (targetStudent.id === nominator.id) return;
          const cellVal = cleanStr(row[key]).toLowerCase();
          if (cellVal === '1' || cellVal === '+' || cellVal === 'v' || cellVal === 'x' || cellVal === 'ya') {
            addNomination(nominator, targetStudent.name, 'belajar', 'like');
            addNomination(nominator, targetStudent.name, 'bermain', 'like');
          } else if (cellVal === '-1' || cellVal === '-' || cellVal === 'tidak') {
            addNomination(nominator, targetStudent.name, 'belajar', 'dislike');
            addNomination(nominator, targetStudent.name, 'bermain', 'dislike');
          }
        });
      }

      // === BEHAVIORAL SCORES (SCALE 1-10) ===
      const parseNum = (val: string, fallback: number): number => {
        const n = parseFloat(val);
        return isNaN(n) ? fallback : Math.max(1, Math.min(10, Math.round(n)));
      };

      const prosocial = parseNum(
        getRowValue(row, ['Skor Prososial (1-10)', 'Skor Prososial', 'Prososial', 'prosocial']),
        5
      );
      const aggressive = parseNum(
        getRowValue(row, ['Skor Agresif (1-10)', 'Skor Agresif', 'Agresif', 'aggressive']),
        2
      );
      const withdrawn = parseNum(
        getRowValue(row, ['Skor Menarik Diri (1-10)', 'Skor Menarik Diri', 'Menarik Diri', 'withdrawn']),
        2
      );
      const victimization = parseNum(
        getRowValue(row, ['Skor Viktimisasi (1-10)', 'Skor Viktimisasi', 'Viktimisasi', 'victimization']),
        1
      );
      const hyperactive = parseNum(
        getRowValue(row, ['Skor Hiperaktif (1-10)', 'Skor Hiperaktif', 'Hiperaktif', 'hyperactive']),
        2
      );

      behavioralRatings.push({
        id: `br-up-${nominator.id}`,
        periodId,
        classId,
        studentId: nominator.id,
        prosocial,
        aggressive,
        withdrawn,
        victimization,
        hyperactive,
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
