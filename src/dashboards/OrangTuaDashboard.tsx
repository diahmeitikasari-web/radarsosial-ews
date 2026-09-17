import React, { useState } from 'react';
import { User, StudentCalculatedMetrics, Period } from '../types';
import { DualRadarChart } from '../components/DualRadarChart';
import { LongitudinalTrendChart } from '../components/LongitudinalTrendChart';
import {
  Users,
  Heart,
  ShieldAlert,
  Sparkles,
  MessageSquare,
  CheckCircle2,
  PhoneCall,
  Calendar,
  Compass,
} from 'lucide-react';

interface OrangTuaDashboardProps {
  currentUser: User;
  childMetric?: StudentCalculatedMetrics;
  allMetrics: StudentCalculatedMetrics[];
  activePeriod: Period;
}

export const OrangTuaDashboard: React.FC<OrangTuaDashboardProps> = ({
  currentUser,
  childMetric,
  allMetrics,
  activePeriod,
}) => {
  // If specific child is linked in currentUser.childId, use it; otherwise fallback to first popular/active student
  const student =
    childMetric ||
    allMetrics.find((m) => m.studentId === currentUser.childId) ||
    allMetrics[0];

  const [consultationSubmitted, setConsultationSubmitted] = useState(false);
  const [consultationNote, setConsultationNote] = useState('');

  const handleSendConsultation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!consultationNote.trim()) return;
    setConsultationSubmitted(true);
    setConsultationNote('');
  };

  if (!student) {
    return (
      <div className="p-8 text-center text-slate-400 bg-slate-900 rounded-2xl border border-slate-800">
        Data siswa untuk akun orang tua belum ditautkan. Silakan hubungi Guru BK sekolah.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/30 border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">
            <Users className="w-3.5 h-3.5" />
            <span>Portal Kemitraan Orang Tua & Sekolah</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Pemantauan Kesejahteraan Sosial & Karakter Ananda
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Selamat datang, Bapak/Ibu {currentUser.name}. Pantau adaptasi pertemanan, iklim emosional, dan perkembangan perilaku ananda di sekolah secara berkala.
          </p>
        </div>

        {/* Child Identity Pill */}
        <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 shrink-0 text-xs">
          <div className="text-[10px] text-slate-400 uppercase font-bold">Ananda Tercatat:</div>
          <div className="font-extrabold text-white text-sm mt-0.5">{student.name}</div>
          <div className="text-slate-400 font-mono text-[11px]">
            NIS: {student.nis} • {student.className}
          </div>
        </div>
      </div>

      {/* Child Status Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Kondisi Adaptasi Sosial</span>
            <span className="p-1 rounded-md bg-emerald-500/10 text-emerald-400">
              <Heart className="w-4 h-4" />
            </span>
          </div>
          <div className="text-xl font-extrabold text-emerald-400">
            {student.status === 'Popular'
              ? 'Sangat Disukai & Diterima'
              : student.status === 'Average'
              ? 'Adaptasi Baik & Stabil'
              : student.status === 'Neglected'
              ? 'Cenderung Pendiam'
              : student.status === 'Controversial'
              ? 'Aktif & Berpengaruh'
              : 'Perlu Pendampingan Khusus'}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Kategori: {student.status}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Tingkat Kesejahteraan Emosional</span>
            <span className="p-1 rounded-md bg-cyan-500/10 text-cyan-400">
              <Sparkles className="w-4 h-4" />
            </span>
          </div>
          <div className="text-xl font-extrabold text-white">
            {student.riskLevel === 'Stabil'
              ? 'Resilien & Aman'
              : student.riskLevel === 'Sedang'
              ? 'Perlu Perhatian'
              : 'Memerlukan Intervensi'}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Indikator Risiko: <span className="font-semibold text-cyan-400">{student.riskLevel}</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Karakter Menonjol</span>
            <span className="p-1 rounded-md bg-amber-500/10 text-amber-400">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <div className="text-sm font-bold text-slate-200 mt-1">
            {student.behavioralStatus}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Berdasarkan pengamatan perilaku sebaya
          </div>
        </div>
      </div>

      {/* Dual Radar & Longitudinal Trajectory */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DualRadarChart student={student} />
        <LongitudinalTrendChart
          selectedStudent={student}
          allMetrics={allMetrics}
          periods={[
            { id: '2025-s1', name: 'Sem 1 25/26', code: '2025-S1', academicYear: '2025/2026', semester: 1, status: 'ditutup', startDate: '', endDate: '' },
            { id: '2025-s2', name: 'Sem 2 25/26', code: '2025-S2', academicYear: '2025/2026', semester: 2, status: 'ditutup', startDate: '', endDate: '' },
            { id: '2026-s1', name: 'Sem 1 26/27', code: '2026-S1', academicYear: '2026/2027', semester: 1, status: 'aktif', startDate: '', endDate: '' },
          ]}
        />
      </div>

      {/* Practical Parenting Guide & Teacher Consultation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Parenting Guide */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>Panduan Pendampingan Pengasuhan di Rumah (Parenting Advice)</span>
          </div>
          <h4 className="text-sm font-bold text-white">
            Rekomendasi Psikososial untuk Ananda {student.name.split(' ')[0]}
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            {student.dssRecommendation}
          </p>

          <div className="space-y-2 pt-2 border-t border-slate-800 text-xs text-slate-300">
            <div className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
              <span>
                <strong>Dengarkan Tanpa Menghakimi:</strong> Berikan ruang 15 menit setiap malam untuk menanyakan pengalaman pertemanannya di sekolah.
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
              <span>
                <strong>Apresiasi Tindakan Prososial:</strong> Puji saat ananda menceritakan ia membantu kawan atau menyelesaikan tugas kelompok bersama.
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
              <span>
                <strong>Koordinasi Berkala:</strong> Sampaikan segera ke Guru BK jika ada perubahan drastis pada nafsu makan, jam tidur, atau keengganan berangkat sekolah.
              </span>
            </div>
          </div>
        </div>

        {/* Direct Consultation Message to BK */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider">
            <MessageSquare className="w-4 h-4" />
            <span>Kanal Konsultasi Langsung dengan Guru BK</span>
          </div>
          <h4 className="text-sm font-bold text-white">
            Konselor Sekolah: Dra. Hj. Siti Rahmah, M.Pd., Kons.
          </h4>
          <p className="text-xs text-slate-400">
            Kirimkan pesan atau permohonan janji temu konseling secara privat dan terjaga kerahasiaannya.
          </p>

          {consultationSubmitted ? (
            <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
              <div>
                <strong>Pesan Terkirim ke Guru BK!</strong>
                <p className="text-slate-300 mt-0.5">
                  Guru BK telah menerima pesan Anda dan akan menghubungi melalui surel atau nomor telepon terdaftar.
                </p>
                <button
                  onClick={() => setConsultationSubmitted(false)}
                  className="mt-2 text-cyan-400 underline font-semibold text-[11px]"
                >
                  Kirim catatan baru
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSendConsultation} className="space-y-3">
              <textarea
                value={consultationNote}
                onChange={(e) => setConsultationNote(e.target.value)}
                placeholder="Tuliskan pertanyaan atau kondisi yang ingin didiskusikan dengan Guru BK mengenai ananda..."
                rows={3}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-hidden focus:border-cyan-500 transition"
              />
              <button
                type="submit"
                className="w-full py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition shadow-md flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Kirim Pesan Konsultasi ke Guru BK</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
