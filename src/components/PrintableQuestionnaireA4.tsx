import React, { useState } from 'react';
import { School, SchoolClass, Period } from '../types';
import { Printer, X, Download, ShieldCheck, CheckSquare, Sparkles, FileText } from 'lucide-react';

interface PrintableQuestionnaireA4Props {
  isOpen: boolean;
  onClose: () => void;
  school?: School;
  activeClass?: SchoolClass;
  activePeriod?: Period;
}

export const PrintableQuestionnaireA4: React.FC<PrintableQuestionnaireA4Props> = ({
  isOpen,
  onClose,
  school,
  activeClass,
  activePeriod,
}) => {
  const [includeDislike, setIncludeDislike] = useState(true);
  const [includeBehavior, setIncludeBehavior] = useState(true);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const schoolName = school?.name || 'MTs Negeri 2 Bangka';
  const counselorName = activeClass?.counselorName || school?.counselorName || 'Liengga Brian Darea, S.Sos.,Gr';
  const cityLocation = school?.city || 'Sungailiat, Bangka';
  const className = activeClass?.name || 'Kelas VIII-A';
  const periodName = activePeriod?.name || 'Semester Ganjil 2026/2027';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex justify-center p-2 sm:p-4 print:p-0 print:bg-white">
      <div className="relative w-full max-w-4xl bg-white text-slate-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto print:my-0 print:shadow-none print:rounded-none print:w-full">
        {/* Modal Toolbar (Hidden when Printing) */}
        <div className="no-print bg-[#0a2a4a] text-white px-6 py-4 flex flex-wrap items-center justify-between gap-3 border-b border-[#1a3f64]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#f0c040] text-[#0a2a4a] flex items-center justify-center font-bold shadow-md">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-white flex items-center gap-2">
                <span>Kuesioner Sosiometri &amp; Perilaku Siswa (Format A4)</span>
                <span className="text-[11px] font-sans px-2 py-0.5 rounded-full bg-[#f0c040]/20 text-[#f7d970] border border-[#f0c040]/30 font-semibold">
                  Siap Cetak / Fotokopi
                </span>
              </h3>
              <p className="text-xs text-[#b0c4de]">
                Instrumen pengumpulan data sosiometri Moreno &amp; evaluasi perilaku untuk dibagikan ke siswa
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="print-include flex items-center gap-2 px-4 py-2 rounded-xl bg-[#f0c040] hover:bg-[#f7d970] text-[#0a2a4a] text-xs font-bold shadow-lg transition duration-150 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Sekarang (A4)</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-[#1a3f64] hover:bg-[#0d3555] text-[#b0c4de] hover:text-white transition"
              title="Tutup"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Print Options Bar (Hidden when Printing) */}
        <div className="no-print bg-slate-100 px-6 py-2.5 border-b border-slate-200 text-xs text-slate-700 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="font-semibold text-slate-900">Opsi Format Angket:</span>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={includeDislike}
                onChange={(e) => setIncludeDislike(e.target.checked)}
                className="rounded text-[#0a2a4a] focus:ring-[#f0c040]"
              />
              <span>Sertakan Pilihan Penolakan (Dislike) Rahasia</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={includeBehavior}
                onChange={(e) => setIncludeBehavior(e.target.checked)}
                className="rounded text-[#0a2a4a] focus:ring-[#f0c040]"
              />
              <span>Sertakan Evaluasi Perilaku Sebaya (5 Dimensi)</span>
            </label>
          </div>
          <div className="text-[11px] text-slate-500 italic">
            *Ukuran standar A4 Portrait. Atur margin 'Default' atau '10mm' pada dialog printer.
          </div>
        </div>

        {/* A4 Printable Document Sheet */}
        <div className="p-8 sm:p-10 font-sans text-[13px] leading-relaxed text-slate-900 print:p-0 bg-white">
          {/* HEADER KUESIONER: CUKUP TEKS NAMA SEKOLAH SAJA */}
          <div className="pb-3 mb-4 border-b-2 border-slate-900 text-center">
            <h1 className="font-serif text-lg sm:text-xl font-black tracking-wide uppercase text-slate-900 leading-tight">
              {schoolName}
            </h1>
          </div>

          {/* JUDUL DOKUMEN & METADATA KUESIONER */}
          <div className="text-center mb-4 space-y-1">
            <h2 className="font-sans text-xs sm:text-sm font-extrabold uppercase text-slate-900 tracking-wide">
              Kuesioner Sosiometri &amp; Dinamika Relasi Sebaya
            </h2>
            <div className="flex flex-wrap items-center justify-center gap-2 text-[10px] text-slate-600 font-medium">
              <span>Rombel: <strong>{className}</strong></span>
              <span>&bull;</span>
              <span>Periode: <strong>{periodName}</strong></span>
              <span>&bull;</span>
              <span className="text-amber-700 font-semibold">Sifat: RAHASIA (Khusus Konselor BK)</span>
            </div>
          </div>

          {/* FORM IDENTITAS SISWA */}
          <div className="border border-slate-300 rounded-lg p-3 mb-4 bg-slate-50/70 text-xs">
            <div className="grid grid-cols-2 gap-x-6 gap-y-2">
              <div className="flex items-center gap-2">
                <span className="w-28 font-semibold text-slate-700">Nama Lengkap:</span>
                <span className="flex-1 border-b border-dotted border-slate-400 pb-0.5">&nbsp;</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-28 font-semibold text-slate-700">Nomor Absen / NISN:</span>
                <span className="flex-1 border-b border-dotted border-slate-400 pb-0.5">&nbsp;</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-28 font-semibold text-slate-700">Jenis Kelamin:</span>
                <div className="flex items-center gap-4 text-slate-800">
                  <label className="flex items-center gap-1">
                    <span className="w-3.5 h-3.5 border border-slate-500 rounded inline-block">&nbsp;</span> Laki-laki
                  </label>
                  <label className="flex items-center gap-1">
                    <span className="w-3.5 h-3.5 border border-slate-500 rounded inline-block">&nbsp;</span> Perempuan
                  </label>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-28 font-semibold text-slate-700">Tanggal Pengisian:</span>
                <span className="flex-1 border-b border-dotted border-slate-400 pb-0.5">&nbsp;</span>
              </div>
            </div>
          </div>

          {/* PETUNJUK PENGISIAN */}
          <div className="p-2.5 rounded-md bg-amber-50 border border-amber-200/80 mb-4 text-[11px] text-amber-950 leading-normal">
            <strong>Petunjuk Penting bagi Siswa:</strong>
            <ol className="list-decimal pl-4 mt-1 space-y-0.5">
              <li>Angket ini <strong>BUKAN UJIAN</strong> dan tidak mempengaruhi nilai rapor maupun prestasi Anda di sekolah.</li>
              <li>Jawablah secara jujur dan mandiri sesuai dengan apa yang Anda rasakan sehari-hari di kelas.</li>
              <li>Seluruh jawaban Anda dijamin <strong>100% RAHASIA</strong> dan hanya dibaca oleh Guru BK untuk membantu suasana belajar yang lebih nyaman bagi semua.</li>
              <li>Jangan memperlihatkan atau memberitahukan jawaban Anda kepada teman lain.</li>
            </ol>
          </div>

          {/* BAGIAN 1: SOSIO-INSTRUMENTAL (BELAJAR) */}
          <div className="mb-4">
            <div className="bg-[#0a2a4a] text-white px-3 py-1 font-bold text-xs uppercase tracking-wider rounded flex items-center justify-between">
              <span>Bagian A: Pilihan Teman Belajar (Sosio-Instrumental)</span>
              <span className="text-[10px] text-[#f7d970]">Kriteria I</span>
            </div>
            <div className="p-3 border border-slate-300 rounded-b mt-0 space-y-3 text-xs">
              <div>
                <p className="font-semibold text-slate-900 mb-1.5">
                  1. Jika Anda diminta oleh Bapak/Ibu Guru untuk membentuk <strong>kelompok belajar</strong> atau mengerjakan tugas bersama, siapakah 3 (tiga) teman sekelas yang <u>paling Anda sukai</u> untuk diajak berkelompok?
                </p>
                <div className="grid grid-cols-3 gap-3">
                  <div className="border border-slate-300 rounded p-2 bg-slate-50">
                    <span className="text-[11px] font-bold text-slate-600 block">Pilihan 1 (Utama):</span>
                    <div className="border-b border-slate-400 mt-2 mb-1 pb-1 font-mono text-slate-400 text-[10px]">Nama Teman:</div>
                    <div className="text-[10px] text-slate-500">Alasan: .............................</div>
                  </div>
                  <div className="border border-slate-300 rounded p-2 bg-slate-50">
                    <span className="text-[11px] font-bold text-slate-600 block">Pilihan 2:</span>
                    <div className="border-b border-slate-400 mt-2 mb-1 pb-1 font-mono text-slate-400 text-[10px]">Nama Teman:</div>
                    <div className="text-[10px] text-slate-500">Alasan: .............................</div>
                  </div>
                  <div className="border border-slate-300 rounded p-2 bg-slate-50">
                    <span className="text-[11px] font-bold text-slate-600 block">Pilihan 3:</span>
                    <div className="border-b border-slate-400 mt-2 mb-1 pb-1 font-mono text-slate-400 text-[10px]">Nama Teman:</div>
                    <div className="text-[10px] text-slate-500">Alasan: .............................</div>
                  </div>
                </div>
              </div>

              {includeDislike && (
                <div className="pt-2 border-t border-slate-200">
                  <p className="font-semibold text-slate-900 mb-1.5">
                    2. Apakah ada teman di kelas ini yang menurut Anda saat ini <u>kurang nyaman atau enggan</u> Anda ajak belajar kelompok bersama? <em>(Boleh dikosongkan bila tidak ada)</em>:
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="border border-slate-300 rounded p-2 bg-slate-50/50">
                      <span className="text-[11px] font-bold text-slate-600 block">Teman yang dihindari (1):</span>
                      <div className="border-b border-slate-400 mt-2 mb-1 pb-1 font-mono text-slate-400 text-[10px]">Nama Teman:</div>
                      <div className="text-[10px] text-slate-500">Alasan: .............................</div>
                    </div>
                    <div className="border border-slate-300 rounded p-2 bg-slate-50/50">
                      <span className="text-[11px] font-bold text-slate-600 block">Teman yang dihindari (2):</span>
                      <div className="border-b border-slate-400 mt-2 mb-1 pb-1 font-mono text-slate-400 text-[10px]">Nama Teman:</div>
                      <div className="text-[10px] text-slate-500">Alasan: .............................</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* BAGIAN 2: SOSIO-AFEKTIF (BERMAIN & SOSIALISASI) */}
          <div className="mb-4">
            <div className="bg-[#1a3f64] text-white px-3 py-1 font-bold text-xs uppercase tracking-wider rounded flex items-center justify-between">
              <span>Bagian B: Pilihan Teman Bermain / Bergaul (Sosio-Afektif)</span>
              <span className="text-[10px] text-[#f7d970]">Kriteria II</span>
            </div>
            <div className="p-3 border border-slate-300 rounded-b mt-0 space-y-3 text-xs">
              <div>
                <p className="font-semibold text-slate-900 mb-1.5">
                  3. Saat jam istirahat, waktu luang di sekolah, atau kegiatan santai bersama, siapakah 3 (tiga) teman yang <u>paling sering dan paling Anda sukai</u> untuk mengobrol atau bermain bersama?
                </p>
                <div className="grid grid-cols-3 gap-3">
                  <div className="border border-slate-300 rounded p-2 bg-slate-50">
                    <span className="text-[11px] font-bold text-slate-600 block">Pilihan 1 (Paling Dekat):</span>
                    <div className="border-b border-slate-400 mt-2 mb-1 pb-1 font-mono text-slate-400 text-[10px]">Nama Teman:</div>
                  </div>
                  <div className="border border-slate-300 rounded p-2 bg-slate-50">
                    <span className="text-[11px] font-bold text-slate-600 block">Pilihan 2:</span>
                    <div className="border-b border-slate-400 mt-2 mb-1 pb-1 font-mono text-slate-400 text-[10px]">Nama Teman:</div>
                  </div>
                  <div className="border border-slate-300 rounded p-2 bg-slate-50">
                    <span className="text-[11px] font-bold text-slate-600 block">Pilihan 3:</span>
                    <div className="border-b border-slate-400 mt-2 mb-1 pb-1 font-mono text-slate-400 text-[10px]">Nama Teman:</div>
                  </div>
                </div>
              </div>

              {includeDislike && (
                <div className="pt-2 border-t border-slate-200">
                  <p className="font-semibold text-slate-900 mb-1.5">
                    4. Apakah ada teman di kelas ini yang membuat Anda merasa <u>kurang nyaman atau tidak cocok</u> saat bergaul/bermain? <em>(Boleh dikosongkan bila tidak ada)</em>:
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="border border-slate-300 rounded p-2 bg-slate-50/50">
                      <span className="text-[11px] font-bold text-slate-600 block">Nama Teman (1):</span>
                      <div className="border-b border-slate-400 mt-2 mb-1 pb-1 font-mono text-slate-400 text-[10px]">&nbsp;</div>
                    </div>
                    <div className="border border-slate-300 rounded p-2 bg-slate-50/50">
                      <span className="text-[11px] font-bold text-slate-600 block">Nama Teman (2):</span>
                      <div className="border-b border-slate-400 mt-2 mb-1 pb-1 font-mono text-slate-400 text-[10px]">&nbsp;</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* BAGIAN 3: EVALUASI PERILAKU SEBAYA (5 DIMENSI) */}
          {includeBehavior && (
            <div className="mb-4 page-break-inside-avoid">
              <div className="bg-slate-800 text-white px-3 py-1 font-bold text-xs uppercase tracking-wider rounded flex items-center justify-between">
                <span>Bagian C: Evaluasi Karakter &amp; Perilaku Sebaya (Radar Perilaku)</span>
                <span className="text-[10px] text-[#f7d970]">Moreno-Peer Rating</span>
              </div>
              <div className="p-3 border border-slate-300 rounded-b mt-0 text-xs">
                <p className="text-slate-700 mb-2">
                  Tuliskan <strong>1 atau 2 nama teman</strong> di kelas ini yang menurut pengamatan Anda paling mewakili ciri-ciri berikut:
                </p>
                <table className="w-full border-collapse border border-slate-300 text-[11px]">
                  <thead>
                    <tr className="bg-slate-100 text-slate-800">
                      <th className="border border-slate-300 p-1.5 text-center w-8">No</th>
                      <th className="border border-slate-300 p-1.5 text-left w-56">Dimensi Karakter</th>
                      <th className="border border-slate-300 p-1.5 text-left">Deskripsi Perilaku</th>
                      <th className="border border-slate-300 p-1.5 text-left w-48">Nama Teman yang Dinominasikan</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-slate-300 p-1.5 text-center font-bold">1</td>
                      <td className="border border-slate-300 p-1.5 font-semibold text-emerald-800">Perilaku Prososial</td>
                      <td className="border border-slate-300 p-1.5">Suka menolong, murah hati, senang berbagi ilmu atau alat tulis tanpa diminta.</td>
                      <td className="border border-slate-300 p-1.5 font-mono text-slate-400">1. .....................................<br/>2. .....................................</td>
                    </tr>
                    <tr>
                      <td className="border border-slate-300 p-1.5 text-center font-bold">2</td>
                      <td className="border border-slate-300 p-1.5 font-semibold text-blue-800">Regulasi Emosi</td>
                      <td className="border border-slate-300 p-1.5">Sabar, tenang, tidak cepat marah saat diejek atau saat menghadapi masalah.</td>
                      <td className="border border-slate-300 p-1.5 font-mono text-slate-400">1. .....................................<br/>2. .....................................</td>
                    </tr>
                    <tr>
                      <td className="border border-slate-300 p-1.5 text-center font-bold">3</td>
                      <td className="border border-slate-300 p-1.5 font-semibold text-purple-800">Keberanian Sosial</td>
                      <td className="border border-slate-300 p-1.5">Berani membela teman yang dizalimi, bersikap adil, tidak takut menyuarakan kebenaran.</td>
                      <td className="border border-slate-300 p-1.5 font-mono text-slate-400">1. .....................................<br/>2. .....................................</td>
                    </tr>
                    <tr>
                      <td className="border border-slate-300 p-1.5 text-center font-bold">4</td>
                      <td className="border border-slate-300 p-1.5 font-semibold text-cyan-800">Kontrol Diri</td>
                      <td className="border border-slate-300 p-1.5">Tertib, mematuhi kesepakatan kelas, tidak berisik saat guru menerangkan pelajaran.</td>
                      <td className="border border-slate-300 p-1.5 font-mono text-slate-400">1. .....................................<br/>2. .....................................</td>
                    </tr>
                    <tr>
                      <td className="border border-slate-300 p-1.5 text-center font-bold">5</td>
                      <td className="border border-slate-300 p-1.5 font-semibold text-amber-800">Proteksi Relasi Positif (Resolusi Konflik)</td>
                      <td className="border border-slate-300 p-1.5">Teman yang sering menjadi penengah damai, melindungi rekan yang tersisih, dan mencegah pertengkaran di kelas.</td>
                      <td className="border border-slate-300 p-1.5 font-mono text-slate-400">1. .....................................<br/>2. .....................................</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* PESAN RAHASIA & TANDA TANGAN */}
          <div className="border border-slate-300 rounded p-3 bg-slate-50/70 mb-4 page-break-inside-avoid text-xs">
            <div className="font-semibold text-slate-900 mb-1">
              Catatan Rahasia untuk Guru BK <em>(Curahan hati, kesulitan berteman, atau hal penting yang ingin Anda sampaikan)</em>:
            </div>
            <div className="border border-slate-300 rounded p-2 bg-white min-h-[44px] text-slate-400 italic">
              Tuliskan di sini bila ada hal yang mengganjal di hati Anda...
            </div>
          </div>

          {/* LEMBAR PENGESAHAN / TANDA TANGAN */}
          <div className="pt-2 text-xs text-slate-700 flex justify-between items-end page-break-inside-avoid">
            <div className="text-center w-56">
              <div>Mengetahui,</div>
              <div className="font-semibold">Guru Bimbingan &amp; Konseling (BK)</div>
              <div className="h-14"></div>
              <div className="font-bold underline text-slate-900">{counselorName}</div>
              <div className="text-[10px] text-slate-500">NIP. 19880914 201503 1 002</div>
            </div>

            <div className="text-center w-56">
              <div>{cityLocation}, ............................. 2026</div>
              <div className="font-semibold">Siswa Yang Bersangkutan,</div>
              <div className="h-14"></div>
              <div className="border-b border-dotted border-slate-600 mx-6">&nbsp;</div>
              <div className="text-[10px] text-slate-500 mt-1">(Tanda Tangan &amp; Nama Terang)</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
