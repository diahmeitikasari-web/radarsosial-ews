import React, { useState, useMemo, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { dataStorage } from './services/dataStorage';
import { calculateClassMetrics, calculateClassAggregate } from './services/snaEngine';
import { Navbar } from './components/Navbar';
import { OfflineIndicator } from './components/OfflineIndicator';
import { ExcelUploadModal } from './components/ExcelUploadModal';
import { OfficialPDFReport } from './components/OfficialPDFReport';
import { GuruBKDashboard } from './dashboards/GuruBKDashboard';
import { KepsekDashboard } from './dashboards/KepsekDashboard';
import { OrangTuaDashboard } from './dashboards/OrangTuaDashboard';
import { AdminDashboard } from './dashboards/AdminDashboard';
import { LoginView } from './dashboards/LoginView';
import { School, SchoolClass, Period } from './types';
import { PrintableQuestionnaireA4 } from './components/PrintableQuestionnaireA4';
import { UserGuideBook } from './components/UserGuideBook';
import { X, Layers, Calendar, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const MainApp: React.FC = () => {
  const { currentUser, isAuthenticated } = useAuth();

  const [version, setVersion] = useState(0);
  const refresh = () => setVersion((v) => v + 1);

  // Subscribe to real-time updates from Firestore cloud sync
  useEffect(() => {
    const unsub = dataStorage.subscribe(() => {
      refresh();
    });
    return () => unsub();
  }, []);

  // Schools, classes, periods from dataStorage
  const schools = useMemo(() => dataStorage.getSchools(), [version]);
  const periods = useMemo(() => dataStorage.getPeriods(), [version]);

  // Tenant-scoped default school for user:
  const userSchool = useMemo(() => {
    if (!currentUser) return schools[0];
    if (currentUser.schoolId) {
      const found = schools.find((s) => s.id === currentUser.schoolId);
      if (found) return found;
    }
    return schools[0];
  }, [schools, currentUser]);

  // Multi-tenant scoped classes:
  const classes = useMemo(() => {
    if (!currentUser || currentUser.role === 'admin') {
      return dataStorage.getClasses();
    }
    const tenantClasses = dataStorage.getClasses(userSchool?.id);
    if (tenantClasses && tenantClasses.length > 0) {
      return tenantClasses;
    }
    return dataStorage.getClasses();
  }, [userSchool?.id, currentUser, version]);

  const [activePeriodId, setActivePeriodId] = useState<string>(() => {
    return periods.find((p) => p.status === 'aktif')?.id || periods[0]?.id || 'period-2026-s1';
  });

  const [activeClassId, setActiveClassId] = useState<string>(() => {
    const stored = dataStorage.getActiveClass();
    if (stored?.id) {
      if (!currentUser?.schoolId) return stored.id;
      const userClasses = dataStorage.getClasses(currentUser.schoolId);
      if (userClasses.some((c) => c.id === stored.id)) return stored.id;
    }
    if (currentUser?.schoolId) {
      const userClasses = dataStorage.getClasses(currentUser.schoolId);
      const has3B = userClasses.find((c) => c.id === 'cls-3b');
      if (has3B) return has3B.id;
      if (userClasses.length > 0) return userClasses[0].id;
    }
    return 'cls-3b';
  });

  const handleSelectClass = (classId: string) => {
    setActiveClassId(classId);
    dataStorage.setActiveClassId(classId);
  };

  // Keep activeClass in sync with tenant scoped classes whenever currentUser or their school changes
  useEffect(() => {
    if (classes.length > 0) {
      const hasActiveClass = classes.some((c) => c.id === activeClassId);
      if (!hasActiveClass) {
        // Prevent race condition: check if class was recently added in dataStorage
        const allSystemClasses = dataStorage.getClasses();
        const existsInSystem = allSystemClasses.some((c) => c.id === activeClassId);
        if (!existsInSystem) {
          const has3B = classes.find((c) => c.id === 'cls-3b');
          const fallback = has3B ? has3B.id : classes[0].id;
          setActiveClassId(fallback);
          dataStorage.setActiveClassId(fallback);
        }
      }
    }
  }, [currentUser?.id, currentUser?.schoolId, classes, activeClassId]);

  const activePeriod = periods.find((p) => p.id === activePeriodId) || periods[0];
  const activeClass = useMemo(() => {
    const found = classes.find((c) => c.id === activeClassId);
    if (found) return found;
    return classes[0] || dataStorage.getClasses()[0];
  }, [classes, activeClassId]);

  // Dynamic activeSchool strictly tracks the user's school and the selected activeClass's schoolId
  const activeSchool = useMemo(() => {
    if (currentUser?.schoolId) {
      const uSchool = schools.find((s) => s.id === currentUser.schoolId);
      if (uSchool) return uSchool;
    }
    if (activeClass?.schoolId) {
      const classSchool = schools.find((s) => s.id === activeClass.schoolId);
      if (classSchool) return classSchool;
    }
    return userSchool || schools[0];
  }, [schools, currentUser?.schoolId, activeClass?.schoolId, userSchool]);

  // Modals state
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isQuestionnaireModalOpen, setIsQuestionnaireModalOpen] = useState(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);

  // Active data
  const students = useMemo(() => {
    return dataStorage.getStudentsForClass(activeClass.id);
  }, [activeClass.id, version]);

  const nominations = useMemo(() => {
    return dataStorage.getNominations(activePeriod.id, activeClass.id);
  }, [activePeriod.id, activeClass.id, version]);

  const behaviors = useMemo(() => {
    return dataStorage.getBehaviors(activePeriod.id, activeClass.id);
  }, [activePeriod.id, activeClass.id, version]);

  // SNA and DSS Engine calculations
  const metrics = useMemo(() => {
    return calculateClassMetrics(students, nominations, behaviors);
  }, [students, nominations, behaviors]);

  const aggregate = useMemo(() => {
    return calculateClassAggregate(
      activeClass.id,
      activeClass.name,
      activePeriod.id,
      activePeriod.name,
      students,
      nominations,
      metrics
    );
  }, [activeClass.id, activeClass.name, activePeriod.id, activePeriod.name, students, nominations, metrics]);

  // Floating transition notification on class/period switch
  const [switchToast, setSwitchToast] = useState<{ message: string; sub: string } | null>(null);
  const isFirstMount = React.useRef(true);

  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    setSwitchToast({
      message: `Rombel: ${activeClass.name}`,
      sub: activePeriod.name,
    });
    const timer = setTimeout(() => {
      setSwitchToast(null);
    }, 1800);
    return () => clearTimeout(timer);
  }, [activeClassId, activePeriodId, activeClass.name, activePeriod.name]);

  if (!isAuthenticated || !currentUser) {
    return <LoginView />;
  }

  return (
    <div className="min-h-screen bg-[#0a2a4a] text-[#e8edf5] flex flex-col font-sans selection:bg-[#f0c040]/30 selection:text-[#f7d970]">
      {/* Offline Connectivity Status */}
      <OfflineIndicator />

      {/* Floating Transition Indicator (framer-motion) */}
      <AnimatePresence>
        {switchToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.95 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-16 right-4 sm:right-8 z-50 pointer-events-none flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-[#0d3555]/95 backdrop-blur-md border border-[#f0c040]/50 shadow-xl shadow-black/40 text-xs"
          >
            <div className="w-2 h-2 rounded-full bg-[#f0c040] animate-ping" />
            <div className="flex flex-col">
              <span className="font-bold text-white flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#f0c040]" />
                {switchToast.message}
              </span>
              <span className="text-[10px] text-[#b0c4de]">{switchToast.sub}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global Navigation Bar */}
      <Navbar
        school={activeSchool}
        activeSchool={activeSchool}
        periods={periods}
        activePeriod={activePeriod}
        onChangePeriod={setActivePeriodId}
        classes={classes}
        activeClass={activeClass}
        onChangeClass={handleSelectClass}
        onOpenReportModal={() => setIsReportModalOpen(true)}
        onOpenGuideModal={() => setIsGuideModalOpen(true)}
        onOpenQuestionnaireModal={() => setIsQuestionnaireModalOpen(true)}
      />

      {/* Main Workspace Container with Framer-Motion transition on Class/Period switch */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-6 overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={`${currentUser.role}_${activeClass.id}_${activePeriod.id}`}
            initial={{ opacity: 0, y: 12, filter: 'blur(3px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -12, filter: 'blur(3px)' }}
            transition={{ duration: 0.28, ease: [0.25, 1, 0.5, 1] }}
            className="w-full"
          >
            {/* Guru BK Dashboard */}
            {currentUser.role === 'guru_bk' && (
              <GuruBKDashboard
                school={activeSchool}
                currentUser={currentUser}
                activeClass={activeClass}
                activePeriod={activePeriod}
                periods={periods}
                onSelectPeriod={setActivePeriodId}
                students={students}
                nominations={nominations}
                behaviors={behaviors}
                metrics={metrics}
                aggregate={aggregate}
                classes={classes}
                onSelectClass={handleSelectClass}
                onOpenExcelModal={() => setIsExcelModalOpen(true)}
                onOpenReportModal={() => setIsReportModalOpen(true)}
                onRefreshData={refresh}
              />
            )}

            {/* Kepala Sekolah Dashboard */}
            {currentUser.role === 'kepala_sekolah' && (
              <KepsekDashboard
                school={activeSchool}
                classes={classes}
                activeClass={activeClass}
                activePeriod={activePeriod}
                metrics={metrics}
                aggregate={aggregate}
                onOpenReportModal={() => setIsReportModalOpen(true)}
                onChangeClass={handleSelectClass}
              />
            )}

            {/* Super-Admin Dashboard */}
            {currentUser.role === 'admin' && (
              <AdminDashboard
                users={dataStorage.getUsers()}
                schools={schools}
                classes={classes}
                periods={periods}
                onRefreshData={refresh}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Modals */}
      <ExcelUploadModal
        isOpen={isExcelModalOpen}
        onClose={() => setIsExcelModalOpen(false)}
        activeClass={activeClass}
        activePeriod={activePeriod}
        existingStudents={students}
        classes={classes}
        onSwitchClass={(cid) => {
          handleSelectClass(cid);
          refresh();
        }}
        onUploadSuccess={() => refresh()}
      />

      <OfficialPDFReport
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        school={activeSchool}
        activeClass={activeClass}
        period={activePeriod}
        metrics={metrics}
        aggregate={aggregate}
        counselorName={
          activeClass?.counselorName ||
          activeSchool?.counselorName ||
          ('BK ' + (activeSchool?.name || 'Sekolah'))
        }
        principalName={
          activeSchool?.principalName ||
          ('Kepala ' + (activeSchool?.name || 'Sekolah'))
        }
      />

      {/* Printable Questionnaire Modal */}
      <PrintableQuestionnaireA4
        isOpen={isQuestionnaireModalOpen}
        onClose={() => setIsQuestionnaireModalOpen(false)}
        school={activeSchool}
        activeClass={activeClass}
        activePeriod={activePeriod}
      />

      {/* User Guide Book Modal */}
      {isGuideModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-sm">
          <div className="sticky top-4 right-4 z-50 flex justify-end px-4">
            <button
              onClick={() => setIsGuideModalOpen(false)}
              className="p-2.5 rounded-full bg-[#f0c040] hover:bg-[#f7d970] text-[#0a2a4a] font-bold shadow-2xl transition cursor-pointer"
              title="Tutup Buku Panduan"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="-mt-12">
            <UserGuideBook />
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-12 py-6 border-t border-[#1a3f64] bg-[#061c30] text-center text-xs text-[#b0c4de]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2 justify-center sm:justify-start">
            <span className="font-semibold text-white">Radar Sosial</span>
            <span>&bull;</span>
            <span className="text-[#f7d970] font-medium">Psychosophia Behavioral Lab</span>
            <span>&bull;</span>
            <span className="italic text-[#8fa8c6]">--bridging data to behavior--</span>
          </div>
          <div className="text-[11px] text-[#b0c4de]/80">
            Psychosophia Behavioral Lab &bull; Hak Cipta Dilindungi
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
