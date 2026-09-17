import React, { useState, useEffect, useMemo } from 'react';
import { SchoolClass, Period, Student, User, StudentQualitativeNote } from '../types';
import { dataStorage } from '../services/dataStorage';
import { analyzeNoteSemantics, generateThematicClassReport } from '../services/thematicAnalysis';
import {
  FileText,
  Sparkles,
  Brain,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Send,
  Printer,
  Copy,
  Tag,
  Search,
  BookOpen,
} from 'lucide-react';

interface QualitativeNotesWorkspaceProps {
  activeClass: SchoolClass;
  activePeriod: Period;
  students: Student[];
  currentUser: User | null;
  onRefreshData?: () => void;
  onOpenReportModal?: () => void;
}

export const QualitativeNotesWorkspace: React.FC<QualitativeNotesWorkspaceProps> = ({
  activeClass,
  activePeriod,
  students,
  currentUser,
  onRefreshData,
  onOpenReportModal,
}) => {
  // 1. Student Qualitative Notes State
  const [studentNotes, setStudentNotes] = useState<StudentQualitativeNote[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || '');
  const [observationContext, setObservationContext] = useState<
    'Observasi Kelas' | 'Konseling Individu' | 'Bimbingan Kelompok' | 'Laporan Rekan Sebaya' | 'Kunjungan Rumah (Home Visit)' | 'Interaksi Informal / Istirahat'
  >('Observasi Kelas');
  const [observationDate, setObservationDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [noteContent, setNoteContent] = useState<string>('');
  const [saveNoteFeedback, setSaveNoteFeedback] = useState<string | null>(null);

  // Search & Filter for Notes List
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [filterStudentId, setFilterStudentId] = useState<string>('ALL');

  // 2. Class Counselor Summary State (for Printed Report)
  const [counselorSummaryText, setCounselorSummaryText] = useState<string>('');
  const [saveSummaryFeedback, setSaveSummaryFeedback] = useState<string | null>(null);

  // Refresh notes when class or period changes
  const loadClassData = () => {
    const notes = dataStorage.getStudentNotes(undefined, activeClass.id, activePeriod.id);
    setStudentNotes(notes);

    const existingSummary = dataStorage.getClassCounselorSummary(activeClass.id, activePeriod.id);
    if (existingSummary) {
      setCounselorSummaryText(existingSummary);
    } else {
      // Default placeholder if empty
      setCounselorSummaryText('');
    }
  };

  const handleSeedSimulationNotes = () => {
    if (confirm(`Muat ulang paket data simulasi 15 catatan kualitatif komprehensif (termasuk curahan hati siswa ke Guru BK & observasi konselor) untuk ${activeClass.name}?`)) {
      const seeded = dataStorage.seedSimulationNotes(activeClass.id, activePeriod.id);
      setStudentNotes(seeded);
      const updatedSummary = dataStorage.getClassCounselorSummary(activeClass.id, activePeriod.id);
      if (updatedSummary) setCounselorSummaryText(updatedSummary);
      setSaveNoteFeedback('Berhasil memuat 15 data simulasi catatan siswa ke Guru BK & analisis tematik!');
      if (onRefreshData) onRefreshData();
      setTimeout(() => setSaveNoteFeedback(null), 3500);
    }
  };

  useEffect(() => {
    loadClassData();
    if (students.length > 0 && !selectedStudentId) {
      setSelectedStudentId(students[0].id);
    }
  }, [activeClass.id, activePeriod.id, students]);

  // Live semantic analysis as counselor types in the note textarea
  const liveAnalysis = useMemo(() => {
    if (!noteContent.trim()) return null;
    const targetStudent = students.find((s) => s.id === selectedStudentId);
    return analyzeNoteSemantics(noteContent, observationContext);
  }, [noteContent, observationContext, selectedStudentId, students]);

  // Generate aggregate thematic report from all recorded notes in this class
  const thematicReport = useMemo(() => {
    return generateThematicClassReport(studentNotes, activeClass.name);
  }, [studentNotes, activeClass.name]);

  // Handle Save Student Note
  const handleSaveStudentNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId || !noteContent.trim()) return;

    const targetStudent = students.find((s) => s.id === selectedStudentId);
    if (!targetStudent) return;

    const analysis = analyzeNoteSemantics(noteContent, observationContext);

    const newNote: Omit<StudentQualitativeNote, 'id' | 'createdAt'> = {
      studentId: targetStudent.id,
      studentName: targetStudent.name,
      classId: activeClass.id,
      periodId: activePeriod.id,
      authorName: currentUser?.name || 'Guru BK (Konselor)',
      authorRole: 'Guru BK',
      date: observationDate,
      context: observationContext,
      content: noteContent.trim(),
      thematicCategory: analysis.thematicCategory,
      sentiment: analysis.sentiment,
      keywords: analysis.keywords,
      aiInsight: analysis.aiInsight,
    };

    dataStorage.addStudentNote(newNote);
    setNoteContent('');
    setSaveNoteFeedback(`Catatan untuk ${targetStudent.name} berhasil disimpan!`);
    loadClassData();
    if (onRefreshData) onRefreshData();

    setTimeout(() => {
      setSaveNoteFeedback(null);
    }, 3000);
  };

  // Handle Delete Student Note
  const handleDeleteNote = (noteId: string, studentName: string) => {
    if (confirm(`Hapus catatan kualitatif untuk ${studentName}?`)) {
      dataStorage.deleteStudentNote(noteId);
      loadClassData();
      if (onRefreshData) onRefreshData();
    }
  };

  // Handle Save Class Counselor Reflection (For Printed Report)
  const handleSaveCounselorSummary = (e: React.FormEvent) => {
    e.preventDefault();
    dataStorage.saveClassCounselorSummary(
      activeClass.id,
      activePeriod.id,
      counselorSummaryText.trim(),
      currentUser?.name || 'Liengga Brian Darea, S.Sos.,Gr'
    );
    setSaveSummaryFeedback('Refleksi Guru BK berhasil disimpan dan disinkronkan ke Laporan Resmi Cetak PDF!');
    if (onRefreshData) onRefreshData();

    setTimeout(() => {
      setSaveSummaryFeedback(null);
    }, 3500);
  };

  // Copy synthesized LLM narrative into Counselor Summary textarea
  const handleCopyNarrativeToSummary = () => {
    const headerPrefix = `[Sintesis Tematik LLM & Evaluasi Komprehensif Guru BK]\n`;
    const combined = `${headerPrefix}Iklim Relasi: ${thematicReport.overallTone}. Tema Dominan: ${thematicReport.dominantTheme}.\n\n${thematicReport.synthesizedNarrative}\n\nRencana Tindak Lanjut Bimbingan:\n${thematicReport.actionableDirectives.map((d, i) => `${i + 1}. ${d}`).join('\n')}`;
    
    setCounselorSummaryText((prev) => (prev ? `${prev}\n\n---\n${combined}` : combined));
    setSaveSummaryFeedback('Draf sintesis tematik berhasil disalin ke bidang refleksi laporan cetak!');
    setTimeout(() => setSaveSummaryFeedback(null), 3000);
  };

  // Filtered notes list
  const filteredNotes = useMemo(() => {
    return studentNotes.filter((n) => {
      const matchStudent = filterStudentId === 'ALL' || n.studentId === filterStudentId;
      const matchQuery =
        !searchFilter ||
        n.studentName.toLowerCase().includes(searchFilter.toLowerCase()) ||
        n.content.toLowerCase().includes(searchFilter.toLowerCase()) ||
        n.thematicCategory?.toLowerCase().includes(searchFilter.toLowerCase());
      return matchStudent && matchQuery;
    });
  }, [studentNotes, filterStudentId, searchFilter]);

  const targetStudentForForm = students.find((s) => s.id === selectedStudentId);

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-linear-to-r from-[#0d3555] via-[#103e68] to-[#0a2a4a] border-2 border-[#1a3f64] shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#f0c040]/20 text-[#f7d970] border border-[#f0c040]/30">
              {activeClass.name} &bull; {activePeriod.name}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              Analisis Tematik Semantik LLM
            </span>
          </div>
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <Brain className="w-6 h-6 text-[#f0c040]" />
            <span>Catatan Kualitatif &amp; Refleksi Resmi Guru BK</span>
          </h2>
          <p className="text-xs text-[#b0c4de] max-w-2xl leading-relaxed">
            Himpun catatan observasi anekdotal siswa, kategorisasikan tema psikososial secara otomatis berbasis semantik dan LLM, serta susun catatan refleksi konselor yang tercetak langsung pada Laporan Resmi A4.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleSeedSimulationNotes}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-[#f7d970] border border-[#f0c040]/40 font-bold text-xs shadow-md transition cursor-pointer"
            title="Muat 15 contoh catatan kualitatif siswa & observasi konselor beserta analisis tematik lengkap"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#f0c040]" />
            <span>Muat Data Simulasi (15 Catatan Siswa &amp; BK)</span>
          </button>

          {onOpenReportModal && (
            <button
              onClick={onOpenReportModal}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#f0c040] hover:bg-[#f7d970] text-[#0a2a4a] font-extrabold text-xs shadow-lg transition cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Pratinjau Cetak Laporan PDF</span>
            </button>
          )}
        </div>
      </div>

      {/* 2-Column Grid: Left (Input Form + Live AI Assistant), Right (LLM Thematic Synthesis) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Input Catatan Kualitatif Siswa */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-3xl bg-[#0d3555]/85 border-2 border-[#1a3f64] p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-[#1a3f64] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#f0c040]/10 border border-[#f0c040]/30 text-[#f7d970] flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-base font-bold text-white">
                    Input Catatan Kualitatif Siswa
                  </h3>
                  <p className="text-[11px] text-[#b0c4de]">
                    Observasi individual, dinamika sebaya, atau catatan anekdotal bimbingan
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/40 text-[#f7d970]">
                {students.length} Siswa Terdaftar
              </span>
            </div>

            {saveNoteFeedback && (
              <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{saveNoteFeedback}</span>
              </div>
            )}

            <form onSubmit={handleSaveStudentNote} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Pilih Siswa */}
                <div>
                  <label className="block text-white font-semibold mb-1">Pilih Siswa:</label>
                  <select
                    value={selectedStudentId}
                    onChange={(e) => setSelectedStudentId(e.target.value)}
                    required
                    className="w-full bg-[#0a2a4a] border border-[#1a3f64] rounded-xl p-2.5 text-white font-medium focus:outline-hidden focus:border-[#f0c040] transition cursor-pointer"
                  >
                    {students.map((st) => (
                      <option key={st.id} value={st.id}>
                        {st.nis ? `[${st.nis}] ` : ''}{st.name} ({st.gender === 'L' ? 'L' : 'P'})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Konteks Observasi */}
                <div>
                  <label className="block text-white font-semibold mb-1">Konteks Observasi:</label>
                  <select
                    value={observationContext}
                    onChange={(e) => setObservationContext(e.target.value as any)}
                    className="w-full bg-[#0a2a4a] border border-[#1a3f64] rounded-xl p-2.5 text-white font-medium focus:outline-hidden focus:border-[#f0c040] transition cursor-pointer"
                  >
                    <option value="Observasi Kelas">Observasi Dinamika Kelas</option>
                    <option value="Konseling Individu">Sesi Konseling Individu</option>
                    <option value="Bimbingan Kelompok">Bimbingan Kelompok</option>
                    <option value="Laporan Rekan Sebaya">Laporan / Pengaduan Rekan Sebaya</option>
                    <option value="Kunjungan Rumah (Home Visit)">Kunjungan Rumah (Home Visit)</option>
                    <option value="Interaksi Informal / Istirahat">Interaksi Saat Jam Istirahat</option>
                  </select>
                </div>
              </div>

              {/* Tanggal Observasi */}
              <div>
                <label className="block text-white font-semibold mb-1">Tanggal Observasi:</label>
                <input
                  type="date"
                  required
                  value={observationDate}
                  onChange={(e) => setObservationDate(e.target.value)}
                  className="w-full sm:w-1/2 bg-[#0a2a4a] border border-[#1a3f64] rounded-xl p-2.5 text-white focus:outline-hidden focus:border-[#f0c040]"
                />
              </div>

              {/* Isi Catatan Kualitatif */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-white font-semibold">
                    Uraian Catatan Kualitatif / Anekdotal:
                  </label>
                  <span className="text-[11px] text-[#b0c4de]">
                    {noteContent.length} karakter
                  </span>
                </div>
                <textarea
                  rows={4}
                  required
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder={`Tuliskan perilaku nyata yang diamati pada ${targetStudentForForm?.name || 'siswa'}. Contoh: "Siswa tampak murung saat pembentukan kelompok kerja, tidak ada rekan yang mendekat, dan memilih mengerjakan tugas sendiri di sudut kelas..."`}
                  className="w-full bg-[#0a2a4a] border border-[#1a3f64] rounded-2xl p-3 text-white placeholder:text-[#b0c4de]/40 focus:outline-hidden focus:border-[#f0c040] transition leading-relaxed"
                />
              </div>

              {/* Real-time LLM Semantic Classification Feedback */}
              {liveAnalysis && (
                <div className="p-4 rounded-2xl bg-[#0a2a4a]/90 border border-cyan-500/40 space-y-2.5 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-cyan-300 font-bold text-xs">
                      <Sparkles className="w-4 h-4 text-[#f0c040]" />
                      <span>Klasifikasi Semantik &amp; Kategorisasi Tema (LLM Engine)</span>
                    </div>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                        liveAnalysis.sentiment === 'kritis'
                          ? 'bg-rose-500 text-white'
                          : liveAnalysis.sentiment === 'perlu_perhatian'
                          ? 'bg-amber-500 text-slate-900'
                          : 'bg-emerald-500 text-slate-900'
                      }`}
                    >
                      {liveAnalysis.sentiment.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-white font-bold">Kategori Tema:</span>
                    <span className="px-2.5 py-1 rounded-xl bg-cyan-950 text-cyan-300 border border-cyan-500/50 font-bold">
                      {liveAnalysis.thematicCategory}
                    </span>
                  </div>

                  {liveAnalysis.keywords.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[11px] text-[#b0c4de]">Kata Kunci Terdeteksi:</span>
                      {liveAnalysis.keywords.map((kw, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[#f7d970] text-[10px]"
                        >
                          #{kw}
                        </span>
                      ))}
                    </div>
                  )}

                  <p className="text-[11px] text-[#b0c4de] italic leading-relaxed pt-1 border-t border-white/5">
                    {liveAnalysis.aiInsight}
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <div className="text-[11px] text-[#b0c4de] flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-[#f0c040]" />
                  <span>Kategorisasi otomatis memetakan tema isolasi, agresivitas, atau kepemimpinan</span>
                </div>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#f0c040] hover:bg-[#f7d970] text-[#0a2a4a] font-bold shadow-lg transition cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Simpan Catatan Siswa</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column (5 cols): Sintesis Tematik Kelas LLM */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-3xl bg-[#0d3555]/85 border-2 border-[#1a3f64] p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#1a3f64] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-950/80 border border-purple-500/40 text-purple-300 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif text-base font-bold text-white">
                    Sintesis Tematik Kelas (LLM)
                  </h3>
                  <p className="text-[11px] text-[#b0c4de]">
                    Hasil analisis klaster semantik atas seluruh catatan
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-black/40 text-[#f7d970]">
                {thematicReport.totalNotes} Catatan
              </span>
            </div>

            {/* Overall Climate Tone */}
            <div className="p-3.5 rounded-2xl bg-[#0a2a4a] border border-[#1a3f64] flex items-center justify-between">
              <div>
                <div className="text-[10px] text-[#b0c4de] uppercase font-bold">
                  Karakteristik Iklim Relasi
                </div>
                <div className="text-sm font-bold text-white mt-0.5">
                  {thematicReport.overallTone}
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-[#b0c4de] uppercase font-bold">
                  Tema Dominan
                </div>
                <div className="text-xs font-bold text-[#f7d970] mt-0.5">
                  {thematicReport.dominantTheme}
                </div>
              </div>
            </div>

            {/* Clusters Visual Distribution */}
            {thematicReport.clusters.length > 0 ? (
              <div className="space-y-3">
                <div className="text-xs font-bold text-white flex items-center justify-between">
                  <span>Distribusi Klaster Tema Teridentifikasi:</span>
                  <span className="text-[10px] text-[#b0c4de] font-normal">
                    Proporsi Frekuensi
                  </span>
                </div>
                <div className="space-y-2">
                  {thematicReport.clusters.map((cl, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-white font-medium truncate max-w-[220px]">
                          {cl.theme}
                        </span>
                        <span className="font-mono text-[#f7d970] font-bold">
                          {cl.count}x ({cl.percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-[#0a2a4a] rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-linear-to-r from-cyan-500 to-[#f0c040] h-2 rounded-full transition-all duration-500"
                          style={{ width: `${cl.percentage}%` }}
                        />
                      </div>
                      <div className="text-[10px] text-[#b0c4de]/80 italic">
                        Teramati pada: {Array.from(cl.sampleStudentNames).slice(0, 3).join(', ')}
                        {cl.sampleStudentNames.size > 3 ? ` +${cl.sampleStudentNames.size - 3} lainnya` : ''}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-[#0a2a4a]/50 border border-dashed border-[#1a3f64] text-center text-xs text-[#b0c4de]">
                Belum ada catatan kualitatif tersimpan pada periode ini. Input catatan observasi di sisi kiri untuk memunculkan analisis klaster.
              </div>
            )}

            {/* Synthesized Narrative */}
            <div className="p-4 rounded-2xl bg-[#0a2a4a] border border-[#1a3f64] space-y-2">
              <div className="text-xs font-bold text-white flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Brain className="w-3.5 h-3.5 text-[#f0c040]" />
                  <span>Narasi Sintesis Kualitatif Terintegrasi:</span>
                </span>
                <button
                  type="button"
                  onClick={handleCopyNarrativeToSummary}
                  className="text-[11px] text-[#f7d970] hover:underline flex items-center gap-1 cursor-pointer"
                  title="Salin narasi ini ke formulir refleksi laporan cetak di bawah"
                >
                  <Copy className="w-3 h-3" />
                  <span>Salin ke Refleksi Cetak</span>
                </button>
              </div>
              <p className="text-xs text-[#b0c4de] leading-relaxed whitespace-pre-line">
                {thematicReport.synthesizedNarrative}
              </p>
            </div>

            {/* Actionable Directives */}
            {thematicReport.actionableDirectives.length > 0 && (
              <div className="space-y-1.5">
                <div className="text-[11px] font-bold text-[#f7d970] uppercase">
                  Arahan Intervensi Tematik:
                </div>
                <div className="space-y-1">
                  {thematicReport.actionableDirectives.map((dir, i) => (
                    <div
                      key={i}
                      className="text-xs text-[#e8edf5] bg-white/5 p-2 rounded-xl flex items-start gap-2 border border-white/5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{dir}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bagian 2: CATATAN KUALITATIF & REFLEKSI GURU BK UNTUK LAPORAN CETAK RESMI */}
      <div className="rounded-3xl bg-linear-to-b from-[#0d3555] to-[#0a2a4a] border-2 border-[#f0c040]/60 p-6 sm:p-8 shadow-2xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1a3f64] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#f0c040] text-[#0a2a4a] flex items-center justify-center font-bold shadow-md">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-lg font-bold text-white">
                  Catatan Kualitatif &amp; Refleksi Guru BK (Masuk Laporan Resmi Cetak)
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Sinkron ke PDF Bab VII
                </span>
              </div>
              <p className="text-xs text-[#b0c4de]">
                Refleksi profesional ini langsung disematkan pada lembar Laporan Resmi Sosiometri cetak PDF / A4 untuk arsip madrasah dan validasi Kepala Sekolah.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCopyNarrativeToSummary}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#1a3f64] hover:bg-[#204c75] text-[#f7d970] text-xs font-bold border border-[#f0c040]/40 transition cursor-pointer self-start sm:self-auto"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#f0c040]" />
            <span>Tarik Sintesis Tematik LLM</span>
          </button>
        </div>

        {saveSummaryFeedback && (
          <div className="p-3.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{saveSummaryFeedback}</span>
          </div>
        )}

        <form onSubmit={handleSaveCounselorSummary} className="space-y-4 text-xs">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-white font-semibold">
                Refleksi Holistik Guru BK terhadap Dinamika Kelas {activeClass.name}:
              </label>
              <span className="text-[11px] text-[#b0c4de]">
                Tercatat oleh: <strong className="text-white">{currentUser?.name || 'Konselor Madrasah'}</strong>
              </span>
            </div>

            <textarea
              rows={6}
              required
              value={counselorSummaryText}
              onChange={(e) => setCounselorSummaryText(e.target.value)}
              placeholder="Tuliskan catatan kualitatif komprehensif, dinamika hubungan sebaya yang perlu diwaspadai, kemajuan hasil bimbingan, serta rekomendasi penataan tempat duduk atau program kolaboratif untuk kelas ini..."
              className="w-full bg-[#0a2a4a] border border-[#1a3f64] rounded-2xl p-4 text-white placeholder:text-[#b0c4de]/40 focus:outline-hidden focus:border-[#f0c040] text-xs sm:text-sm leading-relaxed"
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <div className="text-[11px] text-[#b0c4de] flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-[#f0c040]" />
              <span>
                Catatan ini akan muncul lengkap pada <strong>Bagian VII. Catatan Kualitatif &amp; Refleksi Guru BK</strong> di dokumen laporan resmi cetak.
              </span>
            </div>

            <div className="flex items-center gap-2">
              {onOpenReportModal && (
                <button
                  type="button"
                  onClick={onOpenReportModal}
                  className="px-4 py-2.5 rounded-xl bg-[#1a3f64] hover:bg-[#204c75] text-[#e8edf5] font-semibold text-xs transition cursor-pointer"
                >
                  Lihat Lembar Laporan
                </button>
              )}
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#f0c040] hover:bg-[#f7d970] text-[#0a2a4a] font-extrabold text-xs shadow-xl transition cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Simpan Catatan Refleksi Laporan Cetak</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Bagian 3: DAFTAR CATATAN KUALITATIF SISWA YANG SUDAH TERHIMPUN */}
      <div className="rounded-3xl bg-[#0d3555]/85 border-2 border-[#1a3f64] p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1a3f64] pb-3">
          <div>
            <h3 className="font-serif text-base font-bold text-white flex items-center gap-2">
              <span>Daftar Catatan Kualitatif Siswa Terhimpun</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#0a2a4a] text-[#f7d970] font-medium border border-[#1a3f64]">
                {filteredNotes.length} Catatan
              </span>
            </h3>
            <p className="text-[11px] text-[#b0c4de]">
              Log catatan anekdotal dan observasi perilaku siswa di kelas {activeClass.name}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Filter Siswa */}
            <select
              value={filterStudentId}
              onChange={(e) => setFilterStudentId(e.target.value)}
              className="bg-[#0a2a4a] border border-[#1a3f64] text-white text-xs rounded-xl px-3 py-1.5 focus:outline-hidden focus:border-[#f0c040] transition cursor-pointer"
            >
              <option value="ALL">Semua Siswa</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#b0c4de] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Cari narasi / tema..."
                className="bg-[#0a2a4a] border border-[#1a3f64] text-white text-xs rounded-xl pl-8 pr-3 py-1.5 focus:outline-hidden focus:border-[#f0c040] transition"
              />
            </div>
          </div>
        </div>

        {filteredNotes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredNotes.map((note) => (
              <div
                key={note.id}
                className="p-4 rounded-2xl bg-[#0a2a4a] border border-[#1a3f64] space-y-3 hover:border-cyan-500/40 transition flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-bold text-sm text-white">
                        {note.studentName}
                      </div>
                      <div className="text-[10px] text-[#b0c4de] flex items-center gap-2 mt-0.5">
                        <span>{note.date}</span>
                        <span>&bull;</span>
                        <span className="text-cyan-300">{note.context}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase ${
                          note.sentiment === 'kritis'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : note.sentiment === 'perlu_perhatian'
                            ? 'bg-amber-500/20 text-[#f7d970] border border-amber-500/30'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        }`}
                      >
                        {note.thematicCategory || 'Umum'}
                      </span>
                      <button
                        onClick={() => handleDeleteNote(note.id, note.studentName)}
                        className="p-1 rounded-lg text-[#b0c4de] hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                        title="Hapus catatan"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-[#e8edf5] leading-relaxed whitespace-pre-line bg-black/20 p-2.5 rounded-xl border border-white/5">
                    "{note.content}"
                  </p>
                </div>

                {note.actionTaken && (
                  <div className="pt-2 border-t border-white/5 text-[11px] text-[#b0c4de] italic">
                    <strong className="text-white not-italic">Rekomendasi / AI:</strong> {note.actionTaken}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 rounded-2xl bg-[#0a2a4a]/40 border border-dashed border-[#1a3f64] text-center text-xs text-[#b0c4de]">
            Tidak ada catatan yang sesuai dengan filter pencarian.
          </div>
        )}
      </div>
    </div>
  );
};
