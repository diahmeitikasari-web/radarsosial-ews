import React, { useEffect, useMemo } from 'react';
import {
  School,
  SchoolClass,
  Period,
  Student,
  SociometricNomination,
  PeerBehavioralRating,
  StudentCalculatedMetrics,
  ClassMetricsAggregate,
} from '../types';
import { dataStorage } from '../services/dataStorage';
import { calculateDualCriteriaComparison } from '../services/snaEngine';
import { generateThematicClassReport } from '../services/thematicAnalysis';
import { Printer, X, FileCheck } from 'lucide-react';

interface OfficialPDFReportProps {
  isOpen: boolean;
  onClose: () => void;
  school: School;
  activeClass: SchoolClass;
  period: Period;
  metrics: StudentCalculatedMetrics[];
  aggregate: ClassMetricsAggregate;
  counselorName: string;
  principalName: string;
  students?: Student[];
  nominations?: SociometricNomination[];
  behaviors?: PeerBehavioralRating[];
}

export const OfficialPDFReport: React.FC<OfficialPDFReportProps> = ({
  isOpen,
  onClose,
  school,
  activeClass,
  period,
  metrics,
  aggregate,
  counselorName,
  principalName,
  students: propStudents,
  nominations: propNominations,
  behaviors: propBehaviors,
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('has-printable-modal');
      return () => {
        document.body.classList.remove('has-printable-modal');
      };
    }
  }, [isOpen]);

  const resolvedStudents = useMemo(() => {
    if (propStudents) return propStudents;
    return activeClass?.id ? dataStorage.getStudentsForClass(activeClass.id) : [];
  }, [propStudents, activeClass?.id, isOpen]);

  const resolvedNominations = useMemo(() => {
    if (propNominations) return propNominations;
    return period?.id && activeClass?.id
      ? dataStorage.getNominations(period.id, activeClass.id)
      : [];
  }, [propNominations, period?.id, activeClass?.id, isOpen]);

  const resolvedBehaviors = useMemo(() => {
    if (propBehaviors) return propBehaviors;
    return period?.id && activeClass?.id
      ? dataStorage.getBehaviors(period.id, activeClass.id)
      : [];
  }, [propBehaviors, period?.id, activeClass?.id, isOpen]);

  const dualComparison = useMemo(() => {
    return calculateDualCriteriaComparison(
      activeClass?.id || '',
      activeClass?.name || 'Rombel',
      period?.id || '',
      period?.name || 'Periode Aktif',
      resolvedStudents,
      resolvedNominations,
      resolvedBehaviors,
      metrics
    );
  }, [
    activeClass?.id,
    activeClass?.name,
    period?.id,
    period?.name,
    resolvedStudents,
    resolvedNominations,
    resolvedBehaviors,
    metrics,
  ]);

  if (!isOpen) return null;

  const handlePrint = () => {
    document.body.classList.add('has-printable-modal');
    window.print();
  };

  // Dynamic signature and personnel details per tenant
  const schoolUsers = dataStorage.getUsers().filter((u) => u.schoolId === school.id);
  const kepsekUser = schoolUsers.find((u) => u.role === 'kepala_sekolah');
  const bkUser =
    schoolUsers.find(
      (u) =>
        u.role === 'guru_bk' &&
        (!activeClass?.id || !u.assignedClassIds || u.assignedClassIds.includes(activeClass.id))
    ) || schoolUsers.find((u) => u.role === 'guru_bk');

  const resolvedPrincipalNip = kepsekUser?.nip || '-';
  const resolvedCounselorNip = bkUser?.nip || '-';
  const signCity = school.city || 'Bangka Belitung';

  const maleCount = (resolvedStudents.length > 0 ? resolvedStudents : metrics).filter(
    (m) => m.gender === 'L'
  ).length;
  const femaleCount = (resolvedStudents.length > 0 ? resolvedStudents : metrics).filter(
    (m) => m.gender === 'P'
  ).length;
  const totalRegisteredStudents =
    resolvedStudents.length > 0 ? resolvedStudents.length : metrics.length;

  const counselorReflection = dataStorage.getClassCounselorSummary(activeClass.id, period.id);
  const classStudentNotes = dataStorage.getStudentNotes(undefined, activeClass.id, period.id);
  const thematicClassData = generateThematicClassReport(classStudentNotes, activeClass.name);

  const getStatusBadgeClass = (status: string) => {
    if (status === 'Popular') return 'bg-emerald-100 text-emerald-800';
    if (status === 'Rejected') return 'bg-rose-100 text-rose-800';
    if (status === 'Neglected') return 'bg-slate-200 text-slate-800';
    if (status === 'Controversial') return 'bg-amber-100 text-amber-800';
    return 'bg-sky-100 text-sky-800';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-2 sm:p-4 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-white print:static print:overflow-visible print:block print:h-auto printable-modal-overlay">
      {/* Container - Styled like A4 document in print mode */}
      <div className="relative w-full max-w-4xl rounded-2xl bg-white text-slate-900 shadow-2xl my-auto print:my-0 print:shadow-none print:w-full print:max-w-none print:rounded-none overflow-hidden print:overflow-visible print:block print:h-auto printable-modal-card">
        {/* Floating Action Bar (Hidden in Print) */}
        <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-3 bg-slate-900 text-white border-b border-slate-800 print:hidden">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400">
              <FileCheck className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                Pratinjau Dokumen Resmi Arsip Sekolah
              </span>
              <div className="text-sm font-semibold">
                Laporan Hasil Asesmen Sosiometri & Radar Perilaku Siswa
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-md transition"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / Simpan PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="Tutup"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Document Content (Rendered & Printed) */}
        <div id="printable-official-report" className="p-8 sm:p-12 space-y-6 print:p-6 print:text-black">
          {/* 1. Institutional Letterhead (Kop Surat Resmi Sesuai Tenant) */}
          <div className="pb-3 border-b-4 border-double border-slate-900 text-center space-y-0.5">
            {school.type === 'Madrasah' ? (
              <>
                <p className="text-xs font-semibold tracking-widest uppercase text-slate-700">
                  KEMENTERIAN AGAMA REPUBLIK INDONESIA
                </p>
                <p className="text-xs font-bold tracking-wider uppercase text-slate-800">
                  KANTOR KEMENTERIAN AGAMA KABUPATEN BANGKA
                </p>
                <h1 className="text-xl sm:text-2xl font-black tracking-wide uppercase text-slate-900 leading-tight pt-0.5">
                  {school.name}
                </h1>
              </>
            ) : school.type === 'Perguruan Tinggi' ? (
              <>
                <p className="text-xs font-semibold tracking-widest uppercase text-slate-700">
                  KEMENTERIAN AGAMA REPUBLIK INDONESIA
                </p>
                <p className="text-xs font-bold tracking-wider uppercase text-slate-800">
                  LAYANAN KONSELING &amp; PENGEMBANGAN KEMAHASISWAAN
                </p>
                <h1 className="text-xl sm:text-2xl font-black tracking-wide uppercase text-slate-900 leading-tight pt-0.5">
                  {school.name}
                </h1>
              </>
            ) : (
              <>
                <p className="text-xs font-semibold tracking-widest uppercase text-slate-700">
                  PEMERINTAH KABUPATEN BANGKA
                </p>
                <p className="text-xs font-bold tracking-wider uppercase text-slate-800">
                  DINAS PENDIDIKAN KEPEMUDAAN DAN OLAHRAGA
                </p>
                <h1 className="text-xl sm:text-2xl font-black tracking-wide uppercase text-slate-900 leading-tight pt-0.5">
                  {school.name}
                </h1>
              </>
            )}
            <p className="text-[10px] sm:text-[11px] text-slate-600 font-medium pt-0.5">
              {school.address} &bull; Telp: {school.phone || '-'} &bull; NPSN: {school.npsn}
            </p>
          </div>

          {/* Title Box */}
          <div className="text-center py-2">
            <h2 className="text-base font-extrabold uppercase tracking-wide underline underline-offset-4 text-slate-900">
              LAPORAN HASIL ASESMEN SOSIOMETRI &amp; RADAR PERILAKU SISWA
            </h2>
            <p className="text-xs text-slate-600 font-medium mt-1">
              Nomor Dokumen: BK-{period.code}-{activeClass.name.replace(/\s+/g, '')}-001/ARSIP
            </p>
          </div>

          {/* 2. Demografi Kelas & Metadata */}
          <div className="rounded-xl border border-slate-300 p-4 bg-slate-50/70 text-xs">
            <div className="font-bold text-slate-800 uppercase tracking-wider mb-2 text-[11px] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-slate-700" />
              I. IDENTITAS SATUAN PENDIDIKAN &amp; DEMOGRAFI KELAS
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-slate-700">
              <div>
                <span className="text-slate-500 block">Satuan Pendidikan:</span>
                <span className="font-bold">{school.name}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Rombongan Belajar:</span>
                <span className="font-bold">{activeClass.name}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Periode / Semester:</span>
                <span className="font-bold">{period.name}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Tahun Ajaran:</span>
                <span className="font-bold">{period.academicYear}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Total Siswa Terdaftar:</span>
                <span className="font-bold">
                  {totalRegisteredStudents} Siswa (L: {maleCount}, P: {femaleCount})
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Wali Kelas:</span>
                <span className="font-bold">{activeClass.homeroomTeacher}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Guru BK / Konselor:</span>
                <span className="font-bold">{counselorName}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Metode Asesmen:</span>
                <span className="font-bold">Moreno Dual-Criteria + Peer Eval</span>
              </div>
            </div>
          </div>

          {/* 3. Pendahuluan & Landasan Teori */}
          <div className="space-y-1.5 text-xs text-slate-800 leading-relaxed">
            <div className="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-slate-700" />
              II. PENDAHULUAN &amp; LANDASAN METODOLOGI
            </div>
            <p className="text-justify text-slate-700">
              Laporan ini disusun berdasarkan hasil pemetaan sosiometri metode Jacob L. Moreno (1934) pada dua kriteria fungsional: <strong>(1) Kategori Belajar (Sosio-Instrumental)</strong> untuk mengukur kolaborasi tugas/kelompok belajar, dan <strong>(2) Kategori Bermain/Bergaul (Sosio-Afektif)</strong> untuk mengukur kedekatan emosional dan interaksi waktu luang. Analisis diperluas dengan klasifikasi status sosial Coie &amp; Dodge (1982) serta Radar Perilaku Sebaya (Pekarik et al., 1976) sebagai <em>Early Warning System (EWS)</em> dan <em>Decision Support System (DSS)</em> sesuai mandat Kode Etik ABKIN dan Permendikbudristek No. 46 Tahun 2023.
            </p>
          </div>

          {/* 4. Visualisasi Statistik & Indeks Iklim Sosial Kelas (Gabungan + Belajar vs Bermain) */}
          <div className="space-y-3 text-xs">
            <div className="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-slate-700" />
              III. REKAPITULASI STATISTIK &amp; ANALISIS KATEGORI BELAJAR VS BERMAIN
            </div>

            {/* III.A Gabungan */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-lg border border-slate-300 bg-slate-50 text-center">
                <div className="text-[10px] text-slate-500 uppercase font-semibold">Kepadatan Gabungan (Density)</div>
                <div className="text-lg font-bold text-slate-900 mt-0.5">{aggregate.climateIndex === 'Belum Terisi' ? '-' : aggregate.density}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">{aggregate.climateIndex === 'Belum Terisi' ? 'Belum ada data' : 'Ideal: ≥ 0.10 (pilihan terbatas)'}</div>
              </div>
              <div className="p-3 rounded-lg border border-slate-300 bg-slate-50 text-center">
                <div className="text-[10px] text-slate-500 uppercase font-semibold">Resiprositas Gabungan</div>
                <div className="text-lg font-bold text-slate-900 mt-0.5">{aggregate.climateIndex === 'Belum Terisi' ? '-' : `${aggregate.reciprocityRate}%`}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">{aggregate.climateIndex === 'Belum Terisi' ? 'Belum ada relasi' : 'Pilihan saling menyukai'}</div>
              </div>
              <div className="p-3 rounded-lg border border-slate-300 bg-slate-50 text-center">
                <div className="text-[10px] text-slate-500 uppercase font-semibold">Indeks Iklim Gabungan</div>
                <div className="text-lg font-bold text-slate-900 mt-0.5">{aggregate.climateIndex === 'Belum Terisi' ? '-' : `${aggregate.climateScore} / 100`}</div>
                <div className={`text-[10px] font-bold mt-0.5 ${aggregate.climateIndex === 'Belum Terisi' ? 'text-slate-500' : 'text-amber-700'}`}>
                  Kategori: {aggregate.climateIndex}
                </div>
              </div>
              <div className="p-3 rounded-lg border border-slate-300 bg-slate-50 text-center">
                <div className="text-[10px] text-slate-500 uppercase font-semibold">Distribusi Status Gabungan</div>
                {aggregate.climateIndex === 'Belum Terisi' ? (
                  <div className="text-[11px] text-slate-500 mt-1 italic">Kuesioner belum diinput</div>
                ) : (
                  <>
                    <div className="text-[11px] font-medium text-slate-700 mt-0.5">
                      Pop: {aggregate.statusCounts.Popular} | Rej: {aggregate.statusCounts.Rejected} | Neg: {aggregate.statusCounts.Neglected}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      Contr: {aggregate.statusCounts.Controversial} | Avg: {aggregate.statusCounts.Average}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* III.B Analisis Komparatif per Kategori: Belajar vs Bermain */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 break-inside-avoid">
              {/* Kategori Belajar */}
              <div className="p-3 rounded-lg border border-sky-300 bg-sky-50/60 space-y-1.5">
                <div className="flex items-center justify-between border-b border-sky-200 pb-1">
                  <div>
                    <div className="text-[11px] font-extrabold text-sky-900 uppercase">
                      Kategori Belajar (Sosio-Instrumental)
                    </div>
                    <div className="text-[10px] text-sky-700">
                      Pilihan teman kerja kelompok &amp; belajar ({dualComparison.belajarNominationsCount} relasi)
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-white border border-sky-300 text-[10px] font-bold text-sky-900">
                    {dualComparison.belajarAggregate.climateIndex === 'Belum Terisi'
                      ? 'Belum Terisi'
                      : `${dualComparison.belajarAggregate.climateScore}/100 (${dualComparison.belajarAggregate.climateIndex})`}
                  </span>
                </div>
                {dualComparison.belajarAggregate.climateIndex === 'Belum Terisi' ? (
                  <p className="text-[11px] text-slate-500 italic py-1">
                    Belum ada respons kuesioner untuk kriteria Belajar.
                  </p>
                ) : (
                  <div className="grid grid-cols-3 gap-2 text-center pt-0.5">
                    <div className="bg-white rounded border border-sky-200 p-1.5">
                      <div className="text-[9px] text-slate-500 uppercase">Densitas</div>
                      <div className="font-bold text-slate-900 text-xs">{dualComparison.belajarAggregate.density}</div>
                    </div>
                    <div className="bg-white rounded border border-sky-200 p-1.5">
                      <div className="text-[9px] text-slate-500 uppercase">Resiprositas</div>
                      <div className="font-bold text-slate-900 text-xs">{dualComparison.belajarAggregate.reciprocityRate}%</div>
                    </div>
                    <div className="bg-white rounded border border-sky-200 p-1.5">
                      <div className="text-[9px] text-slate-500 uppercase">Pop / Rej / Neg</div>
                      <div className="font-bold text-slate-900 text-[11px]">
                        {dualComparison.belajarAggregate.statusCounts.Popular} / {dualComparison.belajarAggregate.statusCounts.Rejected} / {dualComparison.belajarAggregate.statusCounts.Neglected}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Kategori Bermain */}
              <div className="p-3 rounded-lg border border-indigo-300 bg-indigo-50/60 space-y-1.5">
                <div className="flex items-center justify-between border-b border-indigo-200 pb-1">
                  <div>
                    <div className="text-[11px] font-extrabold text-indigo-900 uppercase">
                      Kategori Bermain (Sosio-Afektif)
                    </div>
                    <div className="text-[10px] text-indigo-700">
                      Pilihan teman bergaul &amp; istirahat ({dualComparison.bermainNominationsCount} relasi)
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-white border border-indigo-300 text-[10px] font-bold text-indigo-900">
                    {dualComparison.bermainAggregate.climateIndex === 'Belum Terisi'
                      ? 'Belum Terisi'
                      : `${dualComparison.bermainAggregate.climateScore}/100 (${dualComparison.bermainAggregate.climateIndex})`}
                  </span>
                </div>
                {dualComparison.bermainAggregate.climateIndex === 'Belum Terisi' ? (
                  <p className="text-[11px] text-slate-500 italic py-1">
                    Belum ada respons kuesioner untuk kriteria Bermain.
                  </p>
                ) : (
                  <div className="grid grid-cols-3 gap-2 text-center pt-0.5">
                    <div className="bg-white rounded border border-indigo-200 p-1.5">
                      <div className="text-[9px] text-slate-500 uppercase">Densitas</div>
                      <div className="font-bold text-slate-900 text-xs">{dualComparison.bermainAggregate.density}</div>
                    </div>
                    <div className="bg-white rounded border border-indigo-200 p-1.5">
                      <div className="text-[9px] text-slate-500 uppercase">Resiprositas</div>
                      <div className="font-bold text-slate-900 text-xs">{dualComparison.bermainAggregate.reciprocityRate}%</div>
                    </div>
                    <div className="bg-white rounded border border-indigo-200 p-1.5">
                      <div className="text-[9px] text-slate-500 uppercase">Pop / Rej / Neg</div>
                      <div className="font-bold text-slate-900 text-[11px]">
                        {dualComparison.bermainAggregate.statusCounts.Popular} / {dualComparison.bermainAggregate.statusCounts.Rejected} / {dualComparison.bermainAggregate.statusCounts.Neglected}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sintesis Komparatif Belajar vs Bermain */}
            <div className="p-2.5 rounded-lg border border-slate-300 bg-slate-50 text-[11px] text-slate-700 leading-relaxed break-inside-avoid">
              <strong className="text-slate-900">Sintesis Perbandingan Belajar vs Bermain: </strong>
              {dualComparison.comparativeSummary}
            </div>
          </div>

          {/* 5. Tabel Profil Status Siswa (Gabungan + Pecahan Belajar & Bermain) */}
          <div className="space-y-2 text-xs">
            <div className="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-slate-700" />
              IV. TABEL PROFIL SOSIOMETRI &amp; KLASIFIKASI STATUS SISWA (GABUNGAN, BELAJAR &amp; BERMAIN)
            </div>
            {metrics.length === 0 ? (
              <div className="p-6 text-center bg-slate-50 border border-slate-300 rounded-lg text-slate-500">
                <div className="font-bold text-slate-700 text-sm mb-1">
                  Data Asesmen Sosiometri Belum Terisi
                </div>
                <p className="text-xs max-w-md mx-auto leading-relaxed">
                  Kuesioner sosiometri (pilihan teman belajar &amp; bermain yang disukai/dihindari) untuk rombel {activeClass.name} belum diinput ke dalam sistem. Tabel status individual dan skor Z Coie-Dodge tidak ditampilkan sebelum instrumen diisi agar tidak memunculkan data semu.
                </p>
              </div>
            ) : (
            <div className="overflow-x-auto print:overflow-visible border border-slate-300 rounded-lg">
              <table className="w-full text-left text-[10px] border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-300 text-slate-700">
                    <th className="p-1.5 border-r border-slate-200 text-center w-7">No</th>
                    <th className="p-1.5 border-r border-slate-200">Nama Siswa &amp; NIS</th>
                    <th className="p-1.5 border-r border-slate-200 text-center">Gabungan (L/D &bull; Z_SP/Z_SI)</th>
                    <th className="p-1.5 border-r border-slate-200 text-center">Belajar (Sosio-Instrumental)</th>
                    <th className="p-1.5 border-r border-slate-200 text-center">Bermain (Sosio-Afektif)</th>
                    <th className="p-1.5 border-r border-slate-200">Status Utama, Perilaku &amp; Pola</th>
                    <th className="p-1.5 text-center">Prioritas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-800">
                  {dualComparison.studentProfiles.map((prof, idx) => {
                    const s = prof.overall;
                    if (!s) return null;
                    const b = prof.belajar;
                    const p = prof.bermain;
                    const hasDiscrepancy =
                      prof.discrepancyType === 'Diterima Belajar, Rentan Bermain' ||
                      prof.discrepancyType === 'Akrab Bermain, Terabaikan Belajar' ||
                      prof.discrepancyType === 'Rentan Ganda';

                    return (
                      <tr key={s.studentId} className={s.riskLevel === 'Tinggi' ? 'bg-rose-50/70' : ''}>
                        <td className="p-1.5 border-r border-slate-200 text-center font-medium">{idx + 1}</td>
                        <td className="p-1.5 border-r border-slate-200">
                          <div className="font-bold text-slate-900">{s.name}</div>
                          <div className="text-[9px] text-slate-500 font-mono">
                            {s.nis} &bull; {s.gender}
                          </div>
                        </td>
                        <td className="p-1.5 border-r border-slate-200 text-center">
                          <div>
                            <span className="font-bold text-cyan-800">L:{s.likesReceived}</span>{' '}
                            <span className="font-bold text-rose-800">D:{s.dislikesReceived}</span>
                          </div>
                          <div className="text-[9px] font-mono text-slate-600">
                            SP:{s.zSP} | SI:{s.zSI}
                          </div>
                        </td>
                        <td className="p-1.5 border-r border-slate-200 text-center">
                          {b ? (
                            <div className="space-y-0.5">
                              <div className="text-[9px]">
                                <span className="font-bold text-cyan-800">L:{b.likesReceived}</span>{' '}
                                <span className="font-bold text-rose-800">D:{b.dislikesReceived}</span>
                              </div>
                              <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold ${getStatusBadgeClass(b.status)}`}>
                                {b.status}
                              </span>
                            </div>
                          ) : (
                            <span className="text-[9px] italic text-slate-400">Belum terisi</span>
                          )}
                        </td>
                        <td className="p-1.5 border-r border-slate-200 text-center">
                          {p ? (
                            <div className="space-y-0.5">
                              <div className="text-[9px]">
                                <span className="font-bold text-cyan-800">L:{p.likesReceived}</span>{' '}
                                <span className="font-bold text-rose-800">D:{p.dislikesReceived}</span>
                              </div>
                              <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold ${getStatusBadgeClass(p.status)}`}>
                                {p.status}
                              </span>
                            </div>
                          ) : (
                            <span className="text-[9px] italic text-slate-400">Belum terisi</span>
                          )}
                        </td>
                        <td className="p-1.5 border-r border-slate-200">
                          <div className="flex items-center gap-1 flex-wrap">
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${getStatusBadgeClass(s.status)}`}>
                              {s.status}
                            </span>
                            <span className="text-[9px] font-medium text-slate-700">{s.behavioralStatus}</span>
                          </div>
                          {hasDiscrepancy && (
                            <div className="text-[9px] font-semibold text-amber-800 mt-0.5">
                              Pola: {prof.discrepancyType}
                            </div>
                          )}
                        </td>
                        <td className="p-1.5 text-center">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                              s.riskLevel === 'Tinggi'
                                ? 'bg-rose-600 text-white'
                                : s.riskLevel === 'Sedang'
                                ? 'bg-amber-100 text-amber-900'
                                : 'text-slate-600'
                            }`}
                          >
                            {s.riskLevel}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            )}
          </div>

          {/* 6. Kesimpulan & Analisis Psikososial */}
          <div className="space-y-1.5 text-xs text-slate-800">
            <div className="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-slate-700" />
              V. KESIMPULAN HASIL ASESMEN PSIKOSOSIAL &amp; PERINGATAN DINI
            </div>
            <div className="p-3 bg-slate-50 border border-slate-300 rounded-lg text-slate-700 space-y-1.5 text-justify">
              {aggregate.climateIndex === 'Belum Terisi' ? (
                <p>
                  Asesmen sosiometri dan radar perilaku untuk rombongan belajar <strong>{activeClass.name}</strong> pada {period.name} berstatus <strong>Belum Terisi</strong>. Belum terdapat data pilihan teman (Belajar maupun Bermain) serta skor evaluasi sebaya yang dapat disimpulkan oleh sistem. Segera laksanakan penyebaran kuesioner dan unggah hasilnya ke portal Radar Sosial.
                </p>
              ) : (
                <>
                  <p>
                    Berdasarkan olahan algoritma sosiometri dan radar perilaku terhadap <strong>{aggregate.totalStudents} siswa</strong>, iklim sosial gabungan <strong>{activeClass.name}</strong> pada {period.name} berada pada kategori <strong>{aggregate.climateIndex}</strong> (Skor: <strong>{aggregate.climateScore}/100</strong>). Tercatat <strong>{aggregate.statusCounts.Popular}</strong> siswa berstatus <em>Popular</em>, <strong>{aggregate.statusCounts.Rejected}</strong> siswa <em>Rejected</em>, dan <strong>{aggregate.statusCounts.Neglected}</strong> siswa <em>Neglected</em> dengan kepadatan relasi <strong>{aggregate.density}</strong> serta resiprositas <strong>{aggregate.reciprocityRate}%</strong>.
                  </p>
                  <p>
                    <strong>Analisis Perbandingan Konteks Belajar vs Bermain:</strong> {dualComparison.comparativeSummary} {dualComparison.comparativeAdvice}
                  </p>
                  <p>
                    {aggregate.statusCounts.Rejected > 0 || aggregate.statusCounts.Neglected > 0
                      ? 'Siswa dengan status Rejected dan Neglected memerlukan atensi preventif terstruktur melalui penataan tempat duduk suportif (buddy system), mediasi restoratif, dan bimbingan sosial agar tidak berkembang menjadi kerentanan psikologis maupun viktimisasi terselubung.'
                      : 'Tidak teridentifikasi kasus penolakan ekstrem pada periode ini. Pertahankan kohesi kelas melalui kegiatan kolaboratif lintas subkelompok serta pemberdayaan siswa Popular-Prososial sebagai duta inklusi kelas.'}
                  </p>
                </>
              )}
            </div>
          </div>

          {/* 7. Rekomendasi Rencana Aksi & Saran */}
          <div className="space-y-1.5 text-xs text-slate-800">
            <div className="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-slate-700" />
              VI. REKOMENDASI INTERVENSI & SARAN STRATEGIS
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 border border-slate-300 rounded-lg bg-slate-50">
                <div className="font-bold text-slate-900 mb-1">Rekomendasi Tindakan Guru BK:</div>
                <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-700">
                  {aggregate.dssStrategicAdvice.map((adv, i) => (
                    <li key={i}>{adv}</li>
                  ))}
                </ul>
              </div>
              <div className="p-3 border border-slate-300 rounded-lg bg-slate-50">
                <div className="font-bold text-slate-900 mb-1">Rekomendasi Kebijakan Kepala Sekolah:</div>
                <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-700">
                  {aggregate.kepsekPolicyAdvice.map((pol, i) => (
                    <li key={i}>{pol}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* 7. Catatan Kualitatif & Refleksi Guru BK */}
          <div className="space-y-1.5 text-xs text-slate-800">
            <div className="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-slate-700" />
              VII. CATATAN KUALITATIF &amp; REFLEKSI GURU BK (KONSELOR SEKOLAH)
            </div>
            <div className="p-3.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-700 space-y-2 text-justify">
              <p className="whitespace-pre-line leading-relaxed">
                {counselorReflection ? (
                  counselorReflection
                ) : (
                  <span className="italic text-slate-500">
                    Belum ada catatan refleksi kualitatif khusus yang diinput oleh Guru BK untuk kelas ini. Refleksi kualitatif dapat diisi melalui menu "Catatan Kualitatif Siswa &amp; Refleksi Kelas" di portal Guru BK.
                  </span>
                )}
              </p>

              {classStudentNotes.length > 0 && (
                <div className="mt-2 pt-2 border-t border-slate-200">
                  <div className="text-[11px] font-bold text-slate-800 mb-1 flex items-center justify-between">
                    <span>Sintesis Observasi Lapangan ({classStudentNotes.length} Catatan Terhimpun):</span>
                    <span className="font-normal text-slate-500 text-[10px]">
                      Dominan: <strong>{thematicClassData.dominantTheme}</strong>
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[10px]">
                    {thematicClassData.clusters.slice(0, 4).map((c, i) => (
                      <div key={i} className="flex items-center justify-between p-1.5 bg-white rounded border border-slate-200">
                        <span className="font-medium text-slate-800 truncate pr-2">{c.theme}</span>
                        <span className="font-bold text-slate-600 shrink-0">{c.count} ({c.percentage}%)</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 8. Tanda Tangan Resmi Dokumen */}
          <div className="pt-6 border-t border-slate-300 text-xs page-break-inside-avoid break-inside-avoid">
            <div className="flex justify-between items-start text-center">
              <div className="w-64">
                <div className="text-slate-600">Mengetahui,</div>
                <div className="font-bold text-slate-900">
                  {school.type === 'Madrasah' ? 'Kepala Madrasah' : 'Kepala Sekolah'}
                </div>
                <div className="h-20 flex items-center justify-center text-slate-300 italic text-[10px]">
                  [Tanda Tangan & Cap Resmi]
                </div>
                <div className="font-bold text-slate-900 uppercase underline">{principalName}</div>
                <div className="text-slate-600 text-[11px]">NIP. {resolvedPrincipalNip}</div>
              </div>

              <div className="w-64">
                <div className="text-slate-600">
                  {signCity}, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
                <div className="font-bold text-slate-900">Guru Bimbingan dan Konseling (BK)</div>
                <div className="h-20 flex items-center justify-center text-slate-300 italic text-[10px]">
                  [Tanda Tangan Konselor]
                </div>
                <div className="font-bold text-slate-900 uppercase underline">{counselorName}</div>
                <div className="text-slate-600 text-[11px]">NIP. {resolvedCounselorNip}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
