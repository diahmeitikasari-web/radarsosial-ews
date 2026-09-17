import React, { useState, useRef } from 'react';
import { Student, SchoolClass, Period } from '../types';
import { generateExcelTemplate, parseUploadedExcel, ParsedExcelResult } from '../services/excelHandler';
import { dataStorage } from '../services/dataStorage';
import { FileSpreadsheet, Download, Upload, CheckCircle2, AlertTriangle, X, FileText, Loader2 } from 'lucide-react';

interface ExcelUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeClass: SchoolClass;
  activePeriod: Period;
  existingStudents: Student[];
  classes?: SchoolClass[];
  onUploadSuccess: (result: ParsedExcelResult) => void;
  onSwitchClass?: (classId: string) => void;
}

export const ExcelUploadModal: React.FC<ExcelUploadModalProps> = ({
  isOpen,
  onClose,
  activeClass,
  activePeriod,
  existingStudents,
  classes = [],
  onUploadSuccess,
  onSwitchClass,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedResult, setParsedResult] = useState<ParsedExcelResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Target class management
  const [targetClassMode, setTargetClassMode] = useState<'current' | 'select' | 'auto'>('auto');
  const [selectedClassId, setSelectedClassId] = useState<string>(activeClass.id);
  const [autoCreateNewClass, setAutoCreateNewClass] = useState<boolean>(true);

  if (!isOpen) return null;

  const handleDownloadTemplate = () => {
    generateExcelTemplate(existingStudents, activeClass.name);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processFile(file);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    await processFile(file);
  };

  const processFile = async (file: File) => {
    setSelectedFile(file);
    setIsProcessing(true);
    setErrorMsg(null);

    // Target class to pass
    const effectiveTargetClass = classes.find((c) => c.id === selectedClassId) || activeClass;

    const result = await parseUploadedExcel(
      file,
      activePeriod.id,
      effectiveTargetClass.id,
      effectiveTargetClass.name,
      effectiveTargetClass.schoolId,
      existingStudents
    );

    setIsProcessing(false);
    if (!result.success) {
      setErrorMsg(result.message);
      setParsedResult(null);
    } else {
      setParsedResult(result);
      // If detected class name in file matches an existing class, auto-point to it
      if (result.detectedClassName) {
        const matched = classes.find(
          (c) => c.name.toLowerCase() === result.detectedClassName?.toLowerCase()
        );
        if (matched) {
          setSelectedClassId(matched.id);
        }
      }
    }
  };

  const handleConfirmSave = () => {
    if (!parsedResult) return;

    let finalClassId = selectedClassId;
    let finalClassName = activeClass.name;

    // Check if detected class is a brand new class that needs creation
    if (parsedResult.detectedClassName && autoCreateNewClass) {
      const existing = classes.find(
        (c) => c.name.toLowerCase() === parsedResult.detectedClassName?.toLowerCase()
      );
      if (!existing) {
        const created = dataStorage.addClass({
          name: parsedResult.detectedClassName,
          schoolId: activeClass.schoolId,
          grade: '8',
          academicYear: activePeriod.academicYear || '2026/2027',
          homeroomTeacher: 'Wali Kelas Terdaftar',
          counselorName: activeClass.counselorName,
        });
        finalClassId = created.id;
        finalClassName = created.name;
      } else {
        finalClassId = existing.id;
        finalClassName = existing.name;
      }
    } else {
      const cls = classes.find((c) => c.id === selectedClassId);
      if (cls) {
        finalClassId = cls.id;
        finalClassName = cls.name;
      }
    }

    // Save into centralized data storage for that target class
    dataStorage.setStudentsForClass(finalClassId, parsedResult.students);
    dataStorage.setNominations(activePeriod.id, finalClassId, parsedResult.nominations);
    dataStorage.setBehaviors(activePeriod.id, finalClassId, parsedResult.behavioralRatings);
    dataStorage.setActiveClassId(finalClassId);

    // Trigger Notification for system users
    dataStorage.addNotification({
      title: `Sinkronisasi Excel: ${finalClassName} Berhasil`,
      message: `Telah diimpor ${parsedResult.students.length} siswa dan ${parsedResult.nominations.length} relasi sosiometri untuk ${activePeriod.name}. Analisis sosiogram langsung diperbarui.`,
      type: 'success',
      read: false,
      targetRoles: ['guru_bk', 'kepala_sekolah', 'admin'],
      classId: finalClassId,
      severity: 'low',
    });

    dataStorage.addAuditLog(
      'Guru BK',
      'guru_bk',
      'Unggah Berkas Excel Sosiometri',
      `File ${selectedFile?.name || 'Excel'} berhasil diintegrasikan ke ${finalClassName}`
    );

    if (onSwitchClass) {
      onSwitchClass(finalClassId);
    }
    onUploadSuccess(parsedResult);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs">
      <div className="w-full max-w-xl rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Unggah Berkas Excel Sosiometri</h3>
              <p className="text-xs text-slate-400">
                {activeClass.name} • {activePeriod.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Target Class Selection & Workflow Guide */}
          <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">
                Target Rombel / Pilihan Kelas:
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30">
                Deteksi Otomatis Aktif
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-400 text-[11px] mb-1">Pilih Rombel Sasaran:</label>
                <select
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-medium focus:border-cyan-400 cursor-pointer"
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.academicYear})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col justify-end">
                <label className="flex items-center gap-2 text-slate-300 text-[11px] cursor-pointer bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                  <input
                    type="checkbox"
                    checked={autoCreateNewClass}
                    onChange={(e) => setAutoCreateNewClass(e.target.checked)}
                    className="rounded text-cyan-500 cursor-pointer"
                  />
                  <span>Otomatis buat kelas baru jika nama di Excel belum ada</span>
                </label>
              </div>
            </div>

            {/* Smart Detection Banner if file uploaded */}
            {parsedResult?.detectedClassName && (
              <div className="p-2.5 rounded-lg bg-cyan-950/40 border border-cyan-500/40 text-cyan-300 text-[11px] flex items-center justify-between">
                <span>
                  ✨ Kolom <strong>'Kelas'</strong> terdeteksi dari Excel: <strong>{parsedResult.detectedClassName}</strong>
                </span>
                <span className="text-[10px] bg-cyan-500 text-slate-950 font-bold px-1.5 py-0.5 rounded">
                  Otomatis Terbaca
                </span>
              </div>
            )}

            <div className="text-[11px] text-slate-400 bg-slate-900/40 p-2.5 rounded-lg border border-slate-800/80 leading-relaxed">
              💡 <strong>Mekanisme Impor:</strong> Anda bisa memilih kelas secara manual di dropdown atas, ATAU biarkan sistem membaca kolom <em>'Kelas / Rombel'</em> di berkas Excel secara otomatis saat analisis diproses. Setelah disimpan, dashboard akan otomatis beralih ke kelas tersebut.
            </div>
          </div>

          {/* Step 1: Download specialized template */}
          <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                Langkah 1: Unduh Format Khusus
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Gunakan template standar agar nama siswa, pilihan Like/Dislike, dan skor perilaku terpetakan otomatis.
              </p>
            </div>
            <button
              onClick={handleDownloadTemplate}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-semibold border border-slate-700 transition shrink-0"
            >
              <Download className="w-4 h-4" />
              <span>Unduh Template .XLSX</span>
            </button>
          </div>

          {/* Step 2: Drag and drop upload zone */}
          <div>
            <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Langkah 2: Unggah Berkas Excel (.xlsx / .csv)
            </div>
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-700 hover:border-cyan-500/70 bg-slate-950/40 rounded-xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center gap-2 group"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="p-3 rounded-full bg-slate-800 group-hover:bg-cyan-500/20 text-slate-300 group-hover:text-cyan-400 transition">
                <Upload className="w-6 h-6" />
              </div>
              <div className="text-sm font-semibold text-slate-200">
                {selectedFile ? selectedFile.name : 'Klik atau seret file Excel ke area ini'}
              </div>
              <p className="text-xs text-slate-400">
                Mendukung format Microsoft Excel (.xlsx, .xls) dan CSV
              </p>
            </div>
          </div>

          {/* Processing Spinner */}
          {isProcessing && (
            <div className="flex items-center justify-center gap-2 py-4 text-cyan-400 text-xs font-medium">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Memvalidasi struktur relasi sosiometri...</span>
            </div>
          )}

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Parsed Result Preview */}
          {parsedResult && (
            <div className="space-y-3 bg-emerald-950/20 border border-emerald-500/30 p-4 rounded-xl text-xs">
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Berkas Valid & Siap Diintegrasikan ke Sistem Pusat</span>
              </div>
              <div className="grid grid-cols-3 gap-2 py-2 text-center text-slate-300 bg-slate-950/60 rounded-lg p-2">
                <div>
                  <div className="text-[10px] text-slate-400">Total Siswa</div>
                  <div className="text-base font-bold text-white">{parsedResult.students.length}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">Relasi Terbaca</div>
                  <div className="text-base font-bold text-cyan-400">{parsedResult.nominations.length}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">Profil Perilaku</div>
                  <div className="text-base font-bold text-emerald-400">{parsedResult.behavioralRatings.length}</div>
                </div>
              </div>

              {parsedResult.warnings.length > 0 && (
                <div className="p-2.5 bg-amber-500/10 rounded-lg text-[11px] text-amber-300 border border-amber-500/20 space-y-1">
                  <div className="font-bold flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Catatan Validasi ({parsedResult.warnings.length}):</span>
                  </div>
                  <ul className="list-disc list-inside space-y-0.5 text-slate-300 max-h-24 overflow-y-auto">
                    {parsedResult.warnings.slice(0, 5).map((w, idx) => (
                      <li key={idx}>{w}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            Batal
          </button>
          <button
            disabled={!parsedResult}
            onClick={handleConfirmSave}
            className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 disabled:pointer-events-none text-xs font-bold text-white transition flex items-center gap-2 shadow-lg shadow-cyan-900/30"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Simpan & Integrasikan ke Sistem Pusat</span>
          </button>
        </div>
      </div>
    </div>
  );
};
