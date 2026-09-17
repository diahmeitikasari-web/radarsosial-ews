import React, { useState } from 'react';
import { StudentCalculatedMetrics } from '../types';
import { Layers, ShieldCheck, Activity, BrainCircuit } from 'lucide-react';

interface DualRadarChartProps {
  student: StudentCalculatedMetrics;
  classAverage?: {
    socialScores: number[];
    behavioralScores: number[];
  };
}

export const DualRadarChart: React.FC<DualRadarChartProps> = ({ student }) => {
  const [activeLayerMode, setActiveLayerMode] = useState<'both' | 'social' | 'behavior' | 'six_layer'>('both');

  // Convert raw student values to normalized 0 - 100 scale for visual radar
  // Social Dimensions
  const sLikes = Math.min(100, Math.max(10, Math.round(50 + student.zLikes * 25)));
  const sPreference = Math.min(100, Math.max(10, Math.round(50 + student.zSP * 20)));
  const sImpact = Math.min(100, Math.max(10, Math.round(50 + student.zSI * 20)));
  const sActive = Math.min(100, Math.max(10, Math.round(30 + student.likesGiven * 15)));
  const sInclusion = student.status === 'Popular' ? 95 : student.status === 'Average' ? 65 : student.status === 'Controversial' ? 60 : student.status === 'Neglected' ? 25 : 15;

  const socialAxes = [
    { label: 'Penerimaan (Likes)', value: sLikes },
    { label: 'Preferensi (Z_SP)', value: sPreference },
    { label: 'Dampak Sosial (Z_SI)', value: sImpact },
    { label: 'Inklusi Kelompok', value: sInclusion },
    { label: 'Partisipasi Sosial', value: sActive },
  ];

  // Behavioral Dimensions (1-10 converted to 0-100)
  const bProsocial = student.prosocialScore * 10;
  const bRegulasi = Math.max(10, (11 - student.aggressiveScore) * 10); // Inverted: High score = good regulation
  const bKeberanian = Math.max(10, (11 - student.withdrawnScore) * 10); // Inverted: High score = confident/not withdrawn
  const bKeamanan = Math.max(10, (11 - student.victimizationScore) * 10); // Inverted: High score = safe from bullying
  const bKontrol = Math.max(10, (11 - student.hyperactiveScore) * 10); // Inverted: High score = calm/controlled

  const behaviorAxes = [
    { label: 'Prososial (Altruisme)', value: bProsocial },
    { label: 'Regulasi Emosi', value: bRegulasi },
    { label: 'Keberanian Sosial', value: bKeberanian },
    { label: 'Keamanan (Anti-Viktimisasi)', value: bKeamanan },
    { label: 'Kontrol Diri', value: bKontrol },
  ];

  // 6-Layer Ekologi Model from PRD Roadmap:
  // Layer 1: Sosiometri
  // Layer 2: Perilaku Sebaya
  // Layer 3: Pengalaman Psikis (Belonging)
  // Layer 4: Doxa Kelas (Norma)
  // Layer 5: Dukungan Rumah
  // Layer 6: Indeks Proteksi AI
  const sixLayerAxes = [
    { label: 'L1: Struktur Sosiometri', value: sPreference },
    { label: 'L2: Perilaku Sebaya', value: Math.round((bProsocial + bRegulasi) / 2) },
    { label: 'L3: Pengalaman Psikis', value: Math.round((bKeberanian + bKeamanan) / 2) },
    { label: 'L4: Iklim Doxa Kelas', value: 72 },
    { label: 'L5: Ekologi Rumah', value: 80 },
    { label: 'L6: Indeks Proteksi AI', value: student.riskLevel === 'Tinggi' ? 25 : student.riskLevel === 'Sedang' ? 60 : 88 },
  ];

  // Helper to generate SVG radar polygon points
  const size = 260;
  const cx = size / 2;
  const cy = size / 2;
  const maxRadius = 95;

  const getCoordinates = (axes: { label: string; value: number }[]) => {
    const total = axes.length;
    return axes.map((axis, i) => {
      const angle = (i / total) * 2 * Math.PI - Math.PI / 2;
      const r = (axis.value / 100) * maxRadius;
      return {
        x: cx + r * Math.cos(angle),
        y: cy + r * Math.sin(angle),
        angle,
      };
    });
  };

  const socialCoords = getCoordinates(socialAxes);
  const behaviorCoords = getCoordinates(behaviorAxes);
  const sixLayerCoords = getCoordinates(sixLayerAxes);

  const makePolygonPath = (coords: { x: number; y: number }[]) =>
    coords.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`).join(' ') + ' Z';

  return (
    <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 shadow-lg text-slate-200">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-2.5 border-b border-slate-800">
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            Dual Radar: Sosiometri vs Perilaku Siswa
          </h4>
          <p className="text-sm font-bold text-white mt-0.5">
            {student.name} <span className="text-xs font-normal text-slate-400">({student.className})</span>
          </p>
        </div>

        {/* Layer Selector Tabs */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-[11px]">
          <button
            onClick={() => setActiveLayerMode('both')}
            className={`px-2 py-1 rounded-md transition ${activeLayerMode === 'both' ? 'bg-cyan-600 text-white font-semibold' : 'text-slate-400 hover:text-white'}`}
          >
            Dual Overlay
          </button>
          <button
            onClick={() => setActiveLayerMode('social')}
            className={`px-2 py-1 rounded-md transition ${activeLayerMode === 'social' ? 'bg-sky-600 text-white font-semibold' : 'text-slate-400 hover:text-white'}`}
          >
            Radar Sosial
          </button>
          <button
            onClick={() => setActiveLayerMode('behavior')}
            className={`px-2 py-1 rounded-md transition ${activeLayerMode === 'behavior' ? 'bg-emerald-600 text-white font-semibold' : 'text-slate-400 hover:text-white'}`}
          >
            Radar Perilaku
          </button>
          <button
            onClick={() => setActiveLayerMode('six_layer')}
            className={`px-2 py-1 rounded-md transition flex items-center gap-1 ${activeLayerMode === 'six_layer' ? 'bg-purple-600 text-white font-semibold' : 'text-purple-300 hover:text-white'}`}
            title="Sistem Peringatan Dini Ekologis Berlapis"
          >
            <BrainCircuit className="w-3 h-3" />
            DSS 6-Layer
          </button>
        </div>
      </div>

      {/* SVG Radar Display */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-4">
        <div className="relative w-[260px] h-[260px] shrink-0">
          <svg width={size} height={size} className="overflow-visible">
            {/* Concentric Circles Grid */}
            {[0.25, 0.5, 0.75, 1].map((scale, i) => (
              <circle
                key={i}
                cx={cx}
                cy={cy}
                r={maxRadius * scale}
                fill="none"
                stroke="rgba(51, 65, 85, 0.4)"
                strokeWidth="1"
                strokeDasharray={scale === 1 ? 'none' : '3 3'}
              />
            ))}

            {/* Spokes (Lines from center) */}
            {(activeLayerMode === 'six_layer' ? sixLayerAxes : socialAxes).map((_, i, arr) => {
              const angle = (i / arr.length) * 2 * Math.PI - Math.PI / 2;
              const x2 = cx + maxRadius * Math.cos(angle);
              const y2 = cy + maxRadius * Math.sin(angle);
              return (
                <line
                  key={i}
                  x1={cx}
                  y1={cy}
                  x2={x2}
                  y2={y2}
                  stroke="rgba(51, 65, 85, 0.5)"
                  strokeWidth="1"
                />
              );
            })}

            {/* Social Radar Polygon (Sky Blue) */}
            {(activeLayerMode === 'both' || activeLayerMode === 'social') && (
              <path
                d={makePolygonPath(socialCoords)}
                fill="rgba(14, 165, 233, 0.25)"
                stroke="#0284c7"
                strokeWidth="2.5"
                className="transition-all duration-300"
              />
            )}

            {/* Behavioral Radar Polygon (Emerald Green) */}
            {(activeLayerMode === 'both' || activeLayerMode === 'behavior') && (
              <path
                d={makePolygonPath(behaviorCoords)}
                fill="rgba(16, 185, 129, 0.25)"
                stroke="#10b981"
                strokeWidth="2.5"
                className="transition-all duration-300"
              />
            )}

            {/* 6-Layer Ekologi Polygon (Purple / AI DSS) */}
            {activeLayerMode === 'six_layer' && (
              <path
                d={makePolygonPath(sixLayerCoords)}
                fill="rgba(168, 85, 247, 0.3)"
                stroke="#a855f7"
                strokeWidth="2.5"
                className="transition-all duration-300"
              />
            )}

            {/* Axis Dots and Labels */}
            {activeLayerMode !== 'six_layer' && (
              <>
                {(activeLayerMode === 'both' || activeLayerMode === 'social') &&
                  socialCoords.map((c, i) => (
                    <circle key={`s-dot-${i}`} cx={c.x} cy={c.y} r="3.5" fill="#38bdf8" />
                  ))}
                {(activeLayerMode === 'both' || activeLayerMode === 'behavior') &&
                  behaviorCoords.map((c, i) => (
                    <circle key={`b-dot-${i}`} cx={c.x} cy={c.y} r="3.5" fill="#34d399" />
                  ))}
              </>
            )}

            {activeLayerMode === 'six_layer' &&
              sixLayerCoords.map((c, i) => (
                <circle key={`6-dot-${i}`} cx={c.x} cy={c.y} r="4" fill="#c084fc" />
              ))}
          </svg>
        </div>

        {/* Dimension Breakdown & Behavioral Science Insights */}
        <div className="flex-1 w-full space-y-2 text-xs">
          {activeLayerMode === 'six_layer' ? (
            <div className="space-y-1.5 bg-slate-950/60 p-3 rounded-xl border border-purple-900/40">
              <div className="flex items-center justify-between text-purple-300 font-bold mb-1">
                <span>Ekologi 6-Layer DSS (Deteksi Krisis Berlapis)</span>
                <span className="text-[10px] bg-purple-900/60 px-2 py-0.5 rounded-full">Psychosophia Model</span>
              </div>
              {sixLayerAxes.map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-slate-300">{item.label}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-purple-500 rounded-full"
                        style={{ width: `${item.value}%` }}
                      />
                    </div>
                    <span className="font-mono text-[11px] text-purple-300 w-6 text-right">
                      {item.value}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {/* Social Legend & Scores */}
              <div className="bg-sky-950/20 p-2.5 rounded-xl border border-sky-900/40">
                <div className="flex items-center gap-1.5 text-sky-400 font-bold mb-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
                  Radar Sosial (Moreno)
                </div>
                {socialAxes.map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-0.5 text-slate-300">
                    <span className="truncate pr-1">{item.label}:</span>
                    <span className="font-mono font-semibold text-sky-300">{item.value}</span>
                  </div>
                ))}
              </div>

              {/* Behavioral Legend & Scores */}
              <div className="bg-emerald-950/20 p-2.5 rounded-xl border border-emerald-900/40">
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold mb-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  Radar Perilaku (Peer Evaluation)
                </div>
                {behaviorAxes.map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-0.5 text-slate-300">
                    <span className="truncate pr-1">{item.label}:</span>
                    <span className="font-mono font-semibold text-emerald-300">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Cross Matrix Assessment summary */}
          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex items-start gap-2 text-[11px]">
            <div className="p-1 rounded-md bg-slate-800 text-cyan-400 shrink-0 mt-0.5">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="font-bold text-white">Interpretasi Status × Perilaku: </span>
              <span className="text-cyan-300 font-semibold">{student.behavioralStatus}</span>.
              <p className="text-slate-400 mt-0.5">{student.dssRecommendation}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
