import React, { useEffect } from 'react';
import {
  School,
  SchoolClass,
  Period,
  StudentCalculatedMetrics,
  ClassMetricsAggregate,
} from '../types';
import { dataStorage } from '../services/dataStorage';
import { generateThematicClassReport } from '../services/thematicAnalysis';
import { Printer, Download, X, Shield, FileCheck, CheckCircle } from 'lucide-react';

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
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('has-printable-modal');
      return () => {
        document.body.classList.remove('has-printable-modal');
      };
    }
  }, [isOpen]);

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

  const maleCount = metrics.filter((m) => m.gender === 'L').length;
  const femaleCount = metrics.filter((m) => m.gender === 'P').length;

  const counselorReflection = dataStorage.getClassCounselorSummary(activeClass.id, period.id);
  const classStudentNotes = dataStorage.getStudentNotes(undefined, activeClass.id, period.id);
  const thematicClassData = generateThematicClassReport(classStudentNotes, activeClass.name);

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
              LAPORAN HASIL ASESMEN SOSIOMETRI & RADAR PERILAKU SISWA
            </h2>
            <p className="text-xs text-slate-600 font-medium mt-1">
              Nomor Dokumen: BK-{period.code}-{activeClass.name.replace(/\s+/g, '')}-001/ARSIP
            </p>
          </div>

          {/* 2. Demografi Kelas & Metadata */}
          <div className="rounded-xl border border-slate-300 p-4 bg-slate-50/70 text-xs">
            <div className="font-bold text-slate-800 uppercase tracking-wider mb-2 text-[11px] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-slate-700" />
              I. IDENTITAS SATUAN PENDIDIKAN & DEMOGRAFI KELAS
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
                <span className="font-bold">{metrics.length} Siswa (L: {maleCount}, P: {femaleCount})</span>
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
                <span className="font-bold">Moreno Sociometry + Peer Eval</span>
              </div>
            </div>
          </div>

          {/* 3. Pendahuluan & Landasan Teori */}
          <div className="space-y-1.5 text-xs text-slate-800 leading-relaxed">
            <div className="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-slate-700" />
              II. PENDAHULUAN & LANDASAN METODOLOGI
            </div>
            <p className="text-justify text-slate-700">
              Laporan ini disusun berdasarkan hasil pemetaan sosiometri metode Jacob L. Moreno (1934) yang diperluas dengan model klasifikasi status sosial Coie & Dodge (1982) serta Radar Perilaku Sebaya (Pekarik et al., 1976). Sistem Radar Sosial berfungsi sebagai <em>Early Warning System (EWS)</em> dan <em>Decision Support System (DSS)</em> guna memetakan secara komprehensif struktur relasi sosial kelas, dinamika penerimaan sebaya, serta mengelola iklim sosial peserta didik secara objektif, inklusif, dan longitudinal.
            </p>
          </div>

          {/* 4. Visualisasi Statistik & Indeks Iklim Sosial Kelas */}
          <div className="space-y-2 text-xs">
            <div className="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-slate-700" />
              III. REKAPITULASI STATISTIK & INDEKS IKLIM KELAS
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-lg border border-slate-300 bg-slate-50 text-center">
                <div className="text-[10px] text-slate-500 uppercase font-semibold">Kepadatan Jaringan (Density)</div>
                <div className="text-lg font-bold text-slate-900 mt-0.5">{aggregate.climateIndex === 'Belum Terisi' ? '-' : aggregate.density}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">{aggregate.climateIndex === 'Belum Terisi' ? 'Belum ada data' : 'Ideal: ≥ 0.10 (pilihan terbatas)'}</div>
              </div>
              <div className="p-3 rounded-lg border border-slate-300 bg-slate-50 text-center">
                <div className="text-[10px] text-slate-500 uppercase font-semibold">Tingkat Resiprositas</div>
                <div className="text-lg font-bold text-slate-900 mt-0.5">{aggregate.climateIndex === 'Belum Terisi' ? '-' : `${aggregate.reciprocityRate}%`}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">{aggregate.climateIndex === 'Belum Terisi' ? 'Belum ada relasi' : 'Pilihan saling menyukai'}</div>
              </div>
              <div className="p-3 rounded-lg border border-slate-300 bg-slate-50 text-center">
                <div className="text-[10px] text-slate-500 uppercase font-semibold">Indeks Iklim Sosial</div>
                <div className="text-lg font-bold text-slate-900 mt-0.5">{aggregate.climateIndex === 'Belum Terisi' ? '-' : `${aggregate.climateScore} / 100`}</div>
                <div className={`text-[10px] font-bold mt-0.5 ${aggregate.climateIndex === 'Belum Terisi' ? 'text-slate-500' : 'text-amber-700'}`}>
                  Kategori: {aggregate.climateIndex}
                </div>
              </div>
              <div className="p-3 rounded-lg border border-slate-300 bg-slate-50 text-center">
                <div className="text-[10px] text-slate-500 uppercase font-semibold">Distribusi Status</div>
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
          </div>

          {/* 5. Tabel Profil Status Siswa */}
          <div className="space-y-2 text-xs">
            <div className="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-slate-700" />
              IV. TABEL PROFIL SOSIOMETRI & KLASIFIKASI STATUS SISWA (COIE & DODGE, 1982)
            </div>
            {metrics.length === 0 ? (
              <div className="p-6 text-center bg-slate-50 border border-slate-300 rounded-lg text-slate-500">
                <div className="font-bold text-slate-700 text-sm mb-1">
                  Data Asesmen Sosiometri Belum Terisi
                </div>
                <p className="text-xs max-w-md mx-auto leading-relaxed">
                  Kuesioner sosiometri (pilihan teman disukai &amp; tidak disukai) untuk rombel {activeClass.name} belum diinput ke dalam sistem. Tabel status individual dan skor Z Coie-Dodge tidak ditampilkan sebelum instrumen diisi agar tidak memunculkan data semu.
                </p>
              </div>
            ) : (
            <div className="overflow-x-auto print:overflow-visible border border-slate-300 rounded-lg">
              <table className="w-full text-left text-[11px] border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-300 text-slate-700">
                    <th className="p-2 border-r border-slate-200">No</th>
                    <th className="p-2 border-r border-slate-200">NIS</th>
                    <th className="p-2 border-r border-slate-200">Nama Siswa</th>
                    <th className="p-2 border-r border-slate-200 text-center">JK</th>
                    <th className="p-2 border-r border-slate-200 text-center">Likes (L)</th>
                    <th className="p-2 border-r border-slate-200 text-center">Dislikes (D)</th>
                    <th className="p-2 border-r border-slate-200 text-center">Z_SP (Pref)</th>
                    <th className="p-2 border-r border-slate-200 text-center">Z_SI (Imp)</th>
                    <th className="p-2 border-r border-slate-200">Status Sosial</th>
                    <th className="p-2 border-r border-slate-200">Kategori Perilaku</th>
                    <th className="p-2 text-center">Prioritas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-800">
                  {metrics.map((s, idx) => (
                    <tr key={s.studentId} className={s.riskLevel === 'Tinggi' ? 'bg-rose-50 font-semibold' : ''}>
                      <td className="p-2 border-r border-slate-200 text-center">{idx + 1}</td>
                      <td className="p-2 border-r border-slate-200 font-mono text-[10px]">{s.nis}</td>
                      <td className="p-2 border-r border-slate-200">{s.name}</td>
                      <td className="p-2 border-r border-slate-200 text-center">{s.gender}</td>
                      <td className="p-2 border-r border-slate-200 text-center font-bold text-cyan-800">{s.likesReceived}</td>
                      <td className="p-2 border-r border-slate-200 text-center font-bold text-rose-800">{s.dislikesReceived}</td>
                      <td className="p-2 border-r border-slate-200 text-center font-mono">{s.zSP}</td>
                      <td className="p-2 border-r border-slate-200 text-center font-mono">{s.zSI}</td>
                      <td className="p-2 border-r border-slate-200">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            s.status === 'Popular'
                              ? 'bg-emerald-100 text-emerald-800'
                              : s.status === 'Rejected'
                              ? 'bg-rose-100 text-rose-800'
                              : s.status === 'Neglected'
                              ? 'bg-slate-200 text-slate-800'
                              : 'bg-sky-100 text-sky-800'
                          }`}
                        >
                          {s.status}
                        </span>
                      </td>
                      <td className="p-2 border-r border-slate-200 text-[10px]">{s.behavioralStatus}</td>
                      <td className="p-2 text-center">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
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
                  ))}
                </tbody>
              </table>
            </div>
            )}
          </div>

          {/* 6. Kesimpulan & Analisis Psikososial */}
          <div className="space-y-1.5 text-xs text-slate-800">
            <div className="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-slate-700" />
              V. KESIMPULAN HASIL ASESMEN PSIKOSOSIAL & PERINGATAN DINI
            </div>
            <div className="p-3 bg-slate-50 border border-slate-300 rounded-lg text-slate-700 space-y-1 text-justify">
              {aggregate.climateIndex === 'Belum Terisi' ? (
                <p>
                  Asesmen sosiometri dan radar perilaku untuk rombongan belajar <strong>{activeClass.name}</strong> pada {period.name} berstatus <strong>Belum Terisi</strong>. Belum terdapat data pilihan teman maupun skor evaluasi sebaya yang dapat disimpulkan oleh sistem. Segera laksanakan penyebaran kuesioner dan unggah hasilnya ke portal Radar Sosial.
                </p>
              ) : (
                <>
                  <p>
                    Berdasarkan olahan algoritma sosiometri dan radar perilaku terhadap <strong>{aggregate.totalStudents} siswa</strong>, iklim sosial <strong>{activeClass.name}</strong> pada {period.name} berada pada kategori <strong>{aggregate.climateIndex}</strong> (Skor: <strong>{aggregate.climateScore}/100</strong>). Tercatat <strong>{aggregate.statusCounts.Popular}</strong> siswa berstatus <em>Popular</em>, <strong>{aggregate.statusCounts.Rejected}</strong> siswa <em>Rejected</em>, dan <strong>{aggregate.statusCounts.Neglected}</strong> siswa <em>Neglected</em> dengan kepadatan relasi <strong>{aggregate.density}</strong> serta resiprositas <strong>{aggregate.reciprocityRate}%</strong>.
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
