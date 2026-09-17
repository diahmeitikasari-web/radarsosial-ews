import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Period, SchoolClass, UserRole } from '../types';
import { PWAInstallButton } from './PWAInstallButton';
import { NotificationCenter } from './NotificationCenter';
import { dataStorage } from '../services/dataStorage';
import { firestoreSync, CloudSyncStatus } from '../services/firestoreSync';
import {
  Calendar,
  Layers,
  LogOut,
  UserCheck,
  ShieldAlert,
  GraduationCap,
  Users,
  Satellite,
  ChevronDown,
  BookOpen,
  Printer,
  Sparkles,
  Cloud,
  CloudOff,
  RefreshCw,
} from 'lucide-react';

interface NavbarProps {
  periods: Period[];
  activePeriod: Period;
  onChangePeriod: (periodId: string) => void;
  classes: SchoolClass[];
  activeClass: SchoolClass;
  onChangeClass: (classId: string) => void;
  onOpenReportModal?: () => void;
  onOpenGuideModal?: () => void;
  onOpenQuestionnaireModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  periods,
  activePeriod,
  onChangePeriod,
  classes,
  activeClass,
  onChangeClass,
  onOpenReportModal,
  onOpenGuideModal,
  onOpenQuestionnaireModal,
}) => {
  const { currentUser, logout } = useAuth();
  const notifications = dataStorage.getNotifications(currentUser?.role);
  const [cloudStatus, setCloudStatus] = React.useState<CloudSyncStatus>('connected');
  const [isManualSyncing, setIsManualSyncing] = React.useState(false);

  React.useEffect(() => {
    const unsub = firestoreSync.onStatusChange((status) => {
      setCloudStatus(status);
    });
    return () => unsub();
  }, []);

  const handleManualSync = async () => {
    setIsManualSyncing(true);
    await firestoreSync.pullAllFromCloud();
    setTimeout(() => setIsManualSyncing(false), 600);
  };

  const getRoleLabel = (role?: UserRole) => {
    switch (role) {
      case 'guru_bk':
        return { label: 'Guru BK', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40', icon: GraduationCap };
      case 'kepala_sekolah':
        return { label: 'Kepala Sekolah', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40', icon: UserCheck };
      case 'orang_tua':
        return { label: 'Orang Tua', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40', icon: Users };
      case 'admin':
        return { label: 'Super-Admin Lab', color: 'bg-purple-500/20 text-purple-300 border-purple-500/40', icon: ShieldAlert };
      default:
        return { label: 'Pengguna', color: 'bg-slate-700 text-slate-200 border-slate-600', icon: GraduationCap };
    }
  };

  const roleMeta = getRoleLabel(currentUser?.role);
  const RoleIcon = roleMeta.icon;

  return (
    <header className="sticky top-0 z-40 bg-[#0a2a4a]/95 backdrop-blur-md border-b border-[#1a3f64] text-[#e8edf5]">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex items-center justify-between gap-2">
        {/* Brand & Logo matching https://radar-sosial.vercel.app/ */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="relative flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-radial from-[#1a4a6e] to-[#0a2a4a] border-2 border-[#f0c040] shadow-md shrink-0">
            <Satellite className="w-5 h-5 text-[#f0c040]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm sm:text-base font-serif font-bold tracking-tight text-white flex items-center gap-1">
                Radar <span className="text-[#f0c040]">Sosial</span>
                <span className="text-[10px] font-sans px-1.5 py-0.2 rounded-full bg-[#f0c040]/20 text-[#f7d970] font-bold border border-[#f0c040]/30 hidden sm:inline">
                  RSE v1.0
                </span>
              </h1>
            </div>
            <p className="text-[10px] text-[#b0c4de] font-medium hidden sm:block">
              Psychosophia Lab &bull; Pemetaan Sosiometri &amp; Perilaku Siswa
            </p>
          </div>
        </div>

        {/* Global Selectors: Period & Class */}
        <div className="flex items-center gap-2">
          {/* Period Selector */}
          <div className="flex items-center gap-1.5 bg-[#0d3555] px-2.5 py-1 rounded-xl border border-[#1a3f64] text-xs">
            <Calendar className="w-3.5 h-3.5 text-[#f0c040] shrink-0" />
            <select
              id="select-period"
              value={activePeriod.id}
              onChange={(e) => onChangePeriod(e.target.value)}
              className="bg-transparent text-white text-xs font-semibold focus:outline-hidden cursor-pointer"
            >
              {periods.map((p) => (
                <option key={p.id} value={p.id} className="bg-[#0a2a4a] text-white">
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Class Selector (Hidden for Parents) */}
          {currentUser?.role !== 'orang_tua' && (
            <div className="hidden md:flex items-center gap-1.5 bg-[#0d3555] px-2.5 py-1 rounded-xl border border-[#1a3f64] text-xs">
              <Layers className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <select
                id="select-class"
                value={activeClass.id}
                onChange={(e) => onChangeClass(e.target.value)}
                className="bg-transparent text-white text-xs font-semibold focus:outline-hidden cursor-pointer"
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.id} className="bg-[#0a2a4a] text-white">
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Right Action Tools */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Buku Panduan Button */}
          {onOpenGuideModal && (
            <button
              onClick={onOpenGuideModal}
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/10 text-[#b0c4de] hover:text-white border border-white/10 text-xs font-medium transition cursor-pointer"
              title="Buka Buku Panduan Guru BK"
            >
              <BookOpen className="w-3.5 h-3.5 text-[#f0c040]" />
              <span>Buku Panduan</span>
            </button>
          )}

          {/* Kuesioner A4 Print Button */}
          {onOpenQuestionnaireModal && (
            <button
              onClick={onOpenQuestionnaireModal}
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/10 text-[#b0c4de] hover:text-white border border-white/10 text-xs font-medium transition cursor-pointer"
              title="Cetak Kuesioner Siswa (A4)"
            >
              <Printer className="w-3.5 h-3.5 text-[#f7d970]" />
              <span>Kuesioner A4</span>
            </button>
          )}

          {/* Cloud Database Sync Status */}
          <button
            onClick={handleManualSync}
            disabled={isManualSyncing}
            className={`flex items-center gap-1.5 px-2 py-1 rounded-xl text-xs font-medium border transition cursor-pointer ${
              cloudStatus === 'connected'
                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/25'
                : cloudStatus === 'syncing' || isManualSyncing
                ? 'bg-amber-500/15 text-amber-300 border-amber-500/30 animate-pulse'
                : 'bg-rose-500/15 text-rose-300 border-rose-500/30'
            }`}
            title={`Database Firestore: ${
              cloudStatus === 'connected'
                ? 'Terhubung & Sinkron Antar-Peramban (Klik untuk segarkan)'
                : cloudStatus === 'syncing'
                ? 'Sedang menyinkronkan data...'
                : 'Mode offline / fallback lokal'
            }`}
          >
            {cloudStatus === 'offline' ? (
              <CloudOff className="w-3.5 h-3.5 text-rose-400" />
            ) : isManualSyncing || cloudStatus === 'syncing' ? (
              <RefreshCw className="w-3.5 h-3.5 text-amber-400 animate-spin" />
            ) : (
              <Cloud className="w-3.5 h-3.5 text-emerald-400" />
            )}
            <span className="hidden md:inline text-[11px] font-semibold">
              {cloudStatus === 'connected'
                ? 'Cloud Sync'
                : cloudStatus === 'syncing' || isManualSyncing
                ? 'Menyinkron...'
                : 'Offline'}
            </span>
            <span
              className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                cloudStatus === 'connected'
                  ? 'bg-emerald-400 animate-pulse'
                  : cloudStatus === 'syncing' || isManualSyncing
                  ? 'bg-amber-400'
                  : 'bg-rose-400'
              }`}
            />
          </button>

          {/* Authenticated User Badge */}
          <div className="relative group">
            <div
              id="btn-user-profile"
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-xs font-semibold ${roleMeta.color} shadow-xs select-none`}
            >
              <RoleIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{roleMeta.label}</span>
              <span className="hidden md:inline text-[11px] opacity-80">&bull; {currentUser?.name?.split(' ')[0]}</span>
            </div>

            {/* User Details Dropdown */}
            <div className="absolute right-0 mt-1 w-64 rounded-2xl bg-[#0d3555] border border-[#1a3f64] shadow-2xl p-3 hidden group-hover:block z-50 text-xs space-y-2">
              <div className="border-b border-[#1a3f64] pb-2">
                <div className="font-bold text-white text-xs">{currentUser?.name}</div>
                <div className="text-[11px] text-cyan-300 font-mono">{currentUser?.email}</div>
                <div className="text-[10px] text-[#b0c4de] mt-0.5">{currentUser?.schoolName}</div>
              </div>
              <div className="flex items-center justify-between text-[11px] text-[#b0c4de]">
                <span>Status Akun:</span>
                <span className="text-emerald-300 font-semibold uppercase text-[10px]">Aktif &bull; Terverifikasi</span>
              </div>
              <button
                onClick={logout}
                className="w-full py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Keluar Akun (Logout)</span>
              </button>
            </div>
          </div>

          {/* PWA Install Button */}
          <PWAInstallButton />

          {/* Notification Bell */}
          <NotificationCenter
            notifications={notifications}
            currentRole={currentUser?.role || 'guru_bk'}
            onMarkAsRead={(id) => dataStorage.markNotificationAsRead(id)}
            onMarkAllAsRead={() => dataStorage.markAllNotificationsAsRead()}
          />

          {/* Logout Button */}
          <button
            id="btn-logout"
            onClick={logout}
            className="p-2 rounded-xl bg-[#0d3555] hover:bg-rose-900/40 text-[#b0c4de] hover:text-rose-300 transition border border-[#1a3f64]"
            title="Keluar dari Aplikasi"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
