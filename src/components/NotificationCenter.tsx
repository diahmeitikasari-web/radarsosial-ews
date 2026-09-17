import React, { useState } from 'react';
import { NotificationItem, UserRole } from '../types';
import { Bell, AlertTriangle, AlertCircle, Info, CheckCheck, X } from 'lucide-react';

interface NotificationCenterProps {
  notifications: NotificationItem[];
  currentRole: UserRole;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onSelectStudentId?: (studentId: string) => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  notifications,
  currentRole,
  onMarkAsRead,
  onMarkAllAsRead,
  onSelectStudentId,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const roleNotifs = notifications.filter(
    (n) => n.targetRoles.includes(currentRole) || n.targetRoles.length === 0
  );
  const unreadCount = roleNotifs.filter((n) => !n.read).length;

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        id="btn-notification-bell"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition border border-slate-700/80"
        title="Pusat Peringatan & Notifikasi Dini (EWS)"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-md animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Drawer / Popup */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl z-50 overflow-hidden text-slate-100">
          {/* Header */}
          <div className="flex items-center justify-between p-3.5 border-b border-slate-800 bg-slate-950/80">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded-md bg-rose-500/20 text-rose-400">
                <Bell className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-bold text-white">
                Notifikasi & Peringatan Dini ({unreadCount} Baru)
              </span>
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={onMarkAllAsRead}
                  className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1"
                  title="Tandai semua dibaca"
                >
                  <CheckCheck className="w-3 h-3" />
                  <span>Baca Semua</span>
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60">
            {roleNotifs.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500">
                Tidak ada notifikasi atau peringatan aktif.
              </div>
            ) : (
              roleNotifs.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => {
                    onMarkAsRead(notif.id);
                    if (notif.studentId && onSelectStudentId) {
                      onSelectStudentId(notif.studentId);
                      setIsOpen(false);
                    }
                  }}
                  className={`p-3 transition cursor-pointer hover:bg-slate-800/60 flex items-start gap-2.5 ${
                    !notif.read ? 'bg-slate-800/30 font-medium' : 'opacity-70'
                  }`}
                >
                  {/* Icon severity */}
                  <div className="shrink-0 mt-0.5">
                    {notif.severity === 'high' ? (
                      <div className="p-1 rounded-md bg-rose-500/20 text-rose-400">
                        <AlertTriangle className="w-3.5 h-3.5" />
                      </div>
                    ) : notif.severity === 'medium' ? (
                      <div className="p-1 rounded-md bg-amber-500/20 text-amber-400">
                        <AlertCircle className="w-3.5 h-3.5" />
                      </div>
                    ) : (
                      <div className="p-1 rounded-md bg-cyan-500/20 text-cyan-400">
                        <Info className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between text-xs mb-0.5">
                      <span className="font-bold text-slate-100 truncate pr-1">
                        {notif.title}
                      </span>
                      {!notif.read && (
                        <span className="w-2 h-2 rounded-full bg-cyan-400 shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">
                      {notif.message}
                    </p>
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      {new Date(notif.timestamp).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
