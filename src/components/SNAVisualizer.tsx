import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Student,
  SociometricNomination,
  StudentCalculatedMetrics,
  RelationCriteria,
  RelationType,
  CoieDodgeStatus,
} from '../types';
import {
  Eye,
  Filter,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  AlertTriangle,
  ShieldAlert,
  Award,
  UserX,
  Compass,
  Download,
  Search,
  Sparkles,
  Maximize2,
  Users,
  Layers,
  ArrowRight,
  HelpCircle,
} from 'lucide-react';

interface SNAVisualizerProps {
  students: Student[];
  nominations: SociometricNomination[];
  metrics: StudentCalculatedMetrics[];
  onSelectStudent?: (student: StudentCalculatedMetrics) => void;
  selectedStudentId?: string | null;
}

interface NodeSimulation {
  id: string;
  name: string;
  nis: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  fx?: number | null; // Fixed pos during drag
  fy?: number | null;
  radius: number;
  color: string;
  status: CoieDodgeStatus;
  likesReceived: number;
  dislikesReceived: number;
  likesGiven: number;
  riskLevel: string;
  zSP: number;
  zSI: number;
  metric: StudentCalculatedMetrics;
}

export const SNAVisualizer: React.FC<SNAVisualizerProps> = ({
  students,
  nominations,
  metrics,
  onSelectStudent,
  selectedStudentId,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Layout mode: 'force' (Organic spring), 'concentric' (Moreno target rings), 'circular' (Classic ring)
  const [layoutMode, setLayoutMode] = useState<'force' | 'concentric' | 'circular'>('force');
  const [criteriaFilter, setCriteriaFilter] = useState<'all' | RelationCriteria>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | RelationType | 'mutual'>('all');
  const [statusFilter, setStatusFilter] = useState<'ALL' | CoieDodgeStatus | 'RISK_ONLY'>('ALL');
  const [searchStudent, setSearchStudent] = useState('');

  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);

  // Simulation nodes storage
  const nodesRef = useRef<Map<string, NodeSimulation>>(new Map());

  // Metrics quick lookup map
  const metricMap = useMemo(() => {
    const map = new Map<string, StudentCalculatedMetrics>();
    metrics.forEach((m) => map.set(m.studentId, m));
    return map;
  }, [metrics]);

  // Status Colors matching the research and brand palette
  const getStatusColor = (status: CoieDodgeStatus) => {
    switch (status) {
      case 'Popular':
        return '#10b981'; // Vibrant Emerald
      case 'Rejected':
        return '#f43f5e'; // Vibrant Rose
      case 'Neglected':
        return '#94a3b8'; // Muted Slate
      case 'Controversial':
        return '#f0c040'; // Lab Gold / Amber
      case 'Average':
      default:
        return '#38bdf8'; // Sky Blue
    }
  };

  // Pre-calculate reciprocal nominations for quick highlighting
  const nominationPairs = useMemo(() => {
    const set = new Set<string>();
    nominations.forEach((n1) => {
      if (n1.type === 'like') {
        const reciprocal = nominations.find(
          (n2) =>
            n2.studentId === n1.targetId &&
            n2.targetId === n1.studentId &&
            n2.type === 'like' &&
            n2.criteria === n1.criteria
        );
        if (reciprocal) {
          const key = [n1.studentId, n1.targetId].sort().join('--');
          set.add(key);
        }
      }
    });
    return set;
  }, [nominations]);

  // Initialize or re-position nodes based on chosen layoutMode
  useEffect(() => {
    const width = containerRef.current?.clientWidth || 800;
    const height = 520;
    const cx = width / 2;
    const cy = height / 2;

    const newMap = new Map<string, NodeSimulation>();

    students.forEach((s, idx) => {
      const m = metricMap.get(s.id) || {
        studentId: s.id,
        name: s.name,
        nis: s.nis,
        gender: s.gender,
        classId: s.classId,
        likesReceived: 0,
        dislikesReceived: 0,
        likesGiven: 0,
        dislikesGiven: 0,
        status: 'Average' as CoieDodgeStatus,
        zL: 0,
        zD: 0,
        zSP: 0,
        zSI: 0,
        reciprocalCount: 0,
        riskLevel: 'Stabil',
        priorityFlag: false,
        priorityReason: '',
        dssRecommendation: '',
        parentingAdvice: '',
        academicSupportAdvice: '',
        peerBehaviorScore: {
          prosocialScore: 50,
          emotionRegulationScore: 50,
          socialCourageScore: 50,
          selfControlScore: 50,
          victimizationRiskScore: 10,
        },
      };

      const existing = nodesRef.current.get(s.id);
      let x = cx;
      let y = cy;

      if (layoutMode === 'concentric') {
        // Moreno Target Rings:
        // Center ring (radius 80): Popular
        // Mid ring (radius 160): Average & Controversial
        // Outer ring (radius 230): Rejected & Neglected (Periphery)
        let ringRadius = 160;
        if (m.status === 'Popular') ringRadius = 75;
        else if (m.status === 'Rejected' || m.status === 'Neglected') ringRadius = 225;
        else ringRadius = 150;

        // Spread angle uniformly within its ring
        const angle = (idx / students.length) * 2 * Math.PI - Math.PI / 2;
        x = cx + ringRadius * Math.cos(angle);
        y = cy + ringRadius * Math.sin(angle);
      } else if (layoutMode === 'circular') {
        // Classic perimeter circle
        const radius = Math.min(width, height) * 0.38;
        const angle = (idx / students.length) * 2 * Math.PI - Math.PI / 2;
        x = cx + radius * Math.cos(angle);
        y = cy + radius * Math.sin(angle);
      } else {
        // Force-directed initial: preserve existing pos or disperse slightly
        if (existing) {
          x = existing.x;
          y = existing.y;
        } else {
          const angle = (idx / students.length) * 2 * Math.PI;
          const r = 100 + Math.random() * 120;
          x = cx + r * Math.cos(angle);
          y = cy + r * Math.sin(angle);
        }
      }

      newMap.set(s.id, {
        id: s.id,
        name: s.name,
        nis: s.nis,
        x,
        y,
        vx: 0,
        vy: 0,
        radius: Math.max(14, Math.min(26, 13 + m.likesReceived * 1.5)),
        color: getStatusColor(m.status),
        status: m.status,
        likesReceived: m.likesReceived,
        dislikesReceived: m.dislikesReceived,
        likesGiven: m.likesGiven,
        riskLevel: m.riskLevel,
        zSP: m.zSP,
        zSI: m.zSI,
        metric: m,
      });
    });

    nodesRef.current = newMap;
  }, [students, metrics, layoutMode]);

  // Filter nominations according to user filters
  const filteredNominations = useMemo(() => {
    return nominations.filter((nom) => {
      if (criteriaFilter !== 'all' && nom.criteria !== criteriaFilter) return false;

      if (typeFilter === 'mutual') {
        const key = [nom.studentId, nom.targetId].sort().join('--');
        if (!nominationPairs.has(key)) return false;
      } else if (typeFilter !== 'all' && nom.type !== typeFilter) {
        return false;
      }

      // Status filter
      if (statusFilter === 'RISK_ONLY') {
        const sM = metricMap.get(nom.studentId);
        const tM = metricMap.get(nom.targetId);
        if (sM?.riskLevel !== 'Tinggi' && tM?.riskLevel !== 'Tinggi') return false;
      } else if (statusFilter !== 'ALL') {
        const sM = metricMap.get(nom.studentId);
        const tM = metricMap.get(nom.targetId);
        if (sM?.status !== statusFilter && tM?.status !== statusFilter) return false;
      }

      return true;
    });
  }, [nominations, criteriaFilter, typeFilter, statusFilter, nominationPairs, metricMap]);

  // Physics Simulation Step for Force-Directed mode
  useEffect(() => {
    if (layoutMode !== 'force') return;

    let animId: number;
    let iteration = 0;
    const maxIterations = 240; // stabilize after 240 frames

    const simulate = () => {
      iteration++;
      const nodes: NodeSimulation[] = Array.from(nodesRef.current.values());
      const width = containerRef.current?.clientWidth || 800;
      const height = 520;
      const cx = width / 2;
      const cy = height / 2;

      // 1. Center attraction force
      nodes.forEach((node) => {
        if (node.id === draggedNodeId) return;
        const dx = cx - node.x;
        const dy = cy - node.y;
        node.vx += dx * 0.003;
        node.vy += dy * 0.003;
      });

      // 2. Node-node repulsion (Coulomb force)
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const n1 = nodes[i];
          const n2 = nodes[j];
          const dx = n2.x - n1.x;
          const dy = n2.y - n1.y;
          const dist = Math.hypot(dx, dy) || 1;
          const minDist = n1.radius + n2.radius + 35;

          if (dist < 260) {
            const force = (260 - dist) / dist;
            const repulse = force * 0.18;
            if (n1.id !== draggedNodeId) {
              n1.vx -= (dx / dist) * repulse;
              n1.vy -= (dy / dist) * repulse;
            }
            if (n2.id !== draggedNodeId) {
              n2.vx += (dx / dist) * repulse;
              n2.vy += (dy / dist) * repulse;
            }
          }
        }
      }

      // 3. Link spring attraction (Hooke's law)
      filteredNominations.forEach((nom) => {
        if (nom.type !== 'like') return; // Likes attract, dislikes do not
        const s = nodesRef.current.get(nom.studentId);
        const t = nodesRef.current.get(nom.targetId);
        if (!s || !t) return;

        const dx = t.x - s.x;
        const dy = t.y - s.y;
        const dist = Math.hypot(dx, dy) || 1;
        const targetLen = 110;
        const springForce = (dist - targetLen) * 0.004;

        if (s.id !== draggedNodeId) {
          s.vx += (dx / dist) * springForce;
          s.vy += (dy / dist) * springForce;
        }
        if (t.id !== draggedNodeId) {
          t.vx -= (dx / dist) * springForce;
          t.vy -= (dy / dist) * springForce;
        }
      });

      // 4. Update velocity and position with damping
      const damping = 0.86;
      nodes.forEach((node) => {
        if (node.id === draggedNodeId) return;
        node.vx *= damping;
        node.vy *= damping;
        node.x += node.vx;
        node.y += node.vy;

        // Keep inside bounds
        const padding = node.radius + 15;
        node.x = Math.max(padding, Math.min(width - padding, node.x));
        node.y = Math.max(padding, Math.min(height - padding, node.y));
      });

      if (iteration < maxIterations || draggedNodeId) {
        animId = requestAnimationFrame(simulate);
      }
    };

    animId = requestAnimationFrame(simulate);
    return () => cancelAnimationFrame(animId);
  }, [layoutMode, filteredNominations, draggedNodeId]);

  // Main Canvas Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      const cx = width / 2;
      const cy = height / 2;

      ctx.clearRect(0, 0, width, height);
      ctx.save();

      // Pan & Zoom
      ctx.translate(pan.x, pan.y);
      ctx.scale(zoom, zoom);

      // 1. Draw Background: Subtle deep navy orbital space
      // Radial concentric guide rings if in Concentric mode
      if (layoutMode === 'concentric') {
        const rings = [
          { r: 75, label: 'Inti: Siswa Populer (Z_SP > 1.0)', stroke: 'rgba(16, 185, 129, 0.25)' },
          { r: 150, label: 'Tengah: Rata-Rata & Kontroversial', stroke: 'rgba(56, 189, 248, 0.2)' },
          { r: 225, label: 'Perifer: Terisolasi / Ditolak (Z_SP < -1.0)', stroke: 'rgba(244, 63, 94, 0.25)' },
        ];
        rings.forEach((ring) => {
          ctx.beginPath();
          ctx.arc(cx, cy, ring.r, 0, Math.PI * 2);
          ctx.strokeStyle = ring.stroke;
          ctx.lineWidth = 1.5;
          ctx.setLineDash([4, 4]);
          ctx.stroke();
          ctx.setLineDash([]);

          ctx.fillStyle = ring.stroke;
          ctx.font = "bold 9px 'Inter', sans-serif";
          ctx.fillText(ring.label, cx - ring.r + 10, cy - 6);
        });
      } else {
        // Starfield / subtle grid dots
        ctx.fillStyle = 'rgba(240, 192, 64, 0.08)';
        for (let x = -width; x < width * 2; x += 40) {
          for (let y = -height; y < height * 2; y += 40) {
            ctx.fillRect(x, y, 1.5, 1.5);
          }
        }
      }

      // 2. Draw Edges (Sociometric Nominations)
      filteredNominations.forEach((nom) => {
        const source = nodesRef.current.get(nom.studentId);
        const target = nodesRef.current.get(nom.targetId);
        if (!source || !target) return;

        const isHighlighted =
          hoveredNodeId === source.id ||
          hoveredNodeId === target.id ||
          selectedStudentId === source.id ||
          selectedStudentId === target.id;

        const pairKey = [source.id, target.id].sort().join('--');
        const isReciprocal = nominationPairs.has(pairKey);

        const dx = target.x - source.x;
        const dy = target.y - source.y;
        const dist = Math.hypot(dx, dy);
        if (dist === 0) return;

        // Clip edge coordinates exactly to node outer circles
        const startX = source.x + (dx / dist) * source.radius;
        const startY = source.y + (dy / dist) * source.radius;
        const endX = target.x - (dx / dist) * (target.radius + 4);
        const endY = target.y - (dy / dist) * (target.radius + 4);

        ctx.beginPath();

        if (nom.type === 'like') {
          if (isReciprocal) {
            // Radiant gold for mutual friendships
            ctx.strokeStyle = isHighlighted ? '#f0c040' : 'rgba(240, 192, 64, 0.55)';
            ctx.lineWidth = isHighlighted ? 3 : 1.8;
            ctx.setLineDash([]);
          } else {
            // One-way like (cyan/blue)
            ctx.strokeStyle = isHighlighted ? '#38bdf8' : 'rgba(56, 189, 248, 0.35)';
            ctx.lineWidth = isHighlighted ? 2.5 : 1.2;
            ctx.setLineDash([]);
          }
        } else {
          // Dislike (dashed rose red)
          ctx.strokeStyle = isHighlighted ? '#f43f5e' : 'rgba(244, 63, 94, 0.45)';
          ctx.lineWidth = isHighlighted ? 2.5 : 1.4;
          ctx.setLineDash([4, 4]);
        }

        // Curve edges slightly if mutual so both lines don't collide
        if (isReciprocal && nom.type === 'like') {
          // Slight quadratic curve
          const midX = (startX + endX) / 2 - (dy / dist) * 8;
          const midY = (startY + endY) / 2 + (dx / dist) * 8;
          ctx.moveTo(startX, startY);
          ctx.quadraticCurveTo(midX, midY, endX, endY);
        } else {
          ctx.moveTo(startX, startY);
          ctx.lineTo(endX, endY);
        }
        ctx.stroke();

        // Directional Arrowhead
        const arrowAngle = Math.atan2(dy, dx);
        const arrowLen = isHighlighted ? 8 : 6;
        ctx.beginPath();
        if (nom.type === 'like') {
          ctx.fillStyle = isReciprocal ? '#f0c040' : '#0284c7';
        } else {
          ctx.fillStyle = '#e11d48';
        }
        ctx.moveTo(endX, endY);
        ctx.lineTo(
          endX - arrowLen * Math.cos(arrowAngle - Math.PI / 6),
          endY - arrowLen * Math.sin(arrowAngle - Math.PI / 6)
        );
        ctx.lineTo(
          endX - arrowLen * Math.cos(arrowAngle + Math.PI / 6),
          endY - arrowLen * Math.sin(arrowAngle + Math.PI / 6)
        );
        ctx.closePath();
        ctx.fill();
        ctx.setLineDash([]);
      });

      // 3. Draw Nodes (Students)
      nodesRef.current.forEach((node) => {
        const isHovered = hoveredNodeId === node.id;
        const isSelected = selectedStudentId === node.id;
        const isMatchSearch =
          searchStudent.trim() !== '' &&
          node.name.toLowerCase().includes(searchStudent.toLowerCase());

        // Outer Glow / Risk Ring
        if (node.riskLevel === 'Tinggi' || isSelected || isMatchSearch) {
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius + (isSelected ? 8 : 5), 0, Math.PI * 2);
          ctx.strokeStyle =
            node.riskLevel === 'Tinggi'
              ? 'rgba(244, 63, 94, 0.8)'
              : isMatchSearch
              ? '#f0c040'
              : 'rgba(56, 189, 248, 0.9)';
          ctx.lineWidth = isSelected || isMatchSearch ? 3 : 2;
          ctx.stroke();
        }

        // Node Circle Body
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.shadowColor = node.color;
        ctx.shadowBlur = isHovered || isSelected ? 18 : 6;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Inner Border
        ctx.strokeStyle = isSelected ? '#ffffff' : '#0a2a4a';
        ctx.lineWidth = isSelected ? 2.5 : 1.5;
        ctx.stroke();

        // Student First Name / Abbreviated Label
        ctx.fillStyle = '#ffffff';
        ctx.font = `${node.radius > 18 ? 'bold 11px' : 'bold 10px'} 'Inter', sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const firstName = node.name.split(' ')[0];
        ctx.fillText(firstName, node.x, node.y);

        // Status Badge Pill underneath when hovered or selected
        if (isHovered || isSelected || zoom > 1.2 || isMatchSearch) {
          const badgeText = `${node.status} (In: ${node.likesReceived})`;
          ctx.font = "bold 9px 'Inter', sans-serif";
          const textWidth = ctx.measureText(badgeText).width;
          const bgX = node.x - textWidth / 2 - 5;
          const bgY = node.y + node.radius + 3;

          ctx.fillStyle = 'rgba(10, 42, 74, 0.95)';
          ctx.fillRect(bgX, bgY, textWidth + 10, 15);
          ctx.strokeStyle = node.color;
          ctx.lineWidth = 1;
          ctx.strokeRect(bgX, bgY, textWidth + 10, 15);

          ctx.fillStyle = '#f8fafc';
          ctx.fillText(badgeText, node.x, bgY + 7.5);
        }
      });

      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [
    filteredNominations,
    hoveredNodeId,
    selectedStudentId,
    searchStudent,
    layoutMode,
    zoom,
    pan,
    nominationPairs,
  ]);

  // Canvas Mouse / Touch Handlers for Dragging, Panning & Selecting
  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;
    return {
      x: (clientX - pan.x) / zoom,
      y: (clientY - pan.y) / zoom,
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const coords = getCanvasCoords(e);
    let hitNode: NodeSimulation | null = null;

    nodesRef.current.forEach((node) => {
      const dist = Math.hypot(node.x - coords.x, node.y - coords.y);
      if (dist <= node.radius + 4) {
        hitNode = node;
      }
    });

    if (hitNode) {
      setDraggedNodeId(hitNode.id);
      if (onSelectStudent) {
        onSelectStudent(hitNode.metric);
      }
    } else {
      setIsDraggingCanvas(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const coords = getCanvasCoords(e);

    if (draggedNodeId) {
      const node = nodesRef.current.get(draggedNodeId);
      if (node) {
        node.x = coords.x;
        node.y = coords.y;
        node.vx = 0;
        node.vy = 0;
      }
      return;
    }

    if (isDraggingCanvas) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
      return;
    }

    // Hover detection
    let hovered: string | null = null;
    nodesRef.current.forEach((node) => {
      const dist = Math.hypot(node.x - coords.x, node.y - coords.y);
      if (dist <= node.radius + 4) {
        hovered = node.id;
      }
    });
    setHoveredNodeId(hovered);
  };

  const handleMouseUp = () => {
    setDraggedNodeId(null);
    setIsDraggingCanvas(false);
  };

  // Zoom controls
  const handleZoom = (delta: number) => {
    setZoom((prev) => Math.max(0.5, Math.min(2.5, prev + delta)));
  };

  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Export High-Res PNG
  const handleExportPNG = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `Sosiogram-SNA-${new Date().toISOString().slice(0, 10)}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const activeInspectedStudent = selectedStudentId
    ? metricMap.get(selectedStudentId)
    : null;

  return (
    <div
      ref={containerRef}
      className="rounded-2xl bg-[#0a2a4a] border border-[#1a3f64] shadow-2xl overflow-hidden flex flex-col"
    >
      {/* Visualizer Header Toolbar */}
      <div className="p-4 bg-[#0d3555] border-b border-[#1a3f64] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#f0c040] text-[#0a2a4a] flex items-center justify-center font-bold shadow-md">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif text-base font-bold text-white flex items-center gap-2">
              <span>Sosiogram Jaringan Sosial Siswa (SNA)</span>
              <span className="text-[10px] font-sans px-2 py-0.5 rounded-full bg-[#f0c040]/20 text-[#f7d970] border border-[#f0c040]/30 font-semibold">
                Moreno &bull; Coie-Dodge
              </span>
            </h3>
            <p className="text-[11px] text-[#b0c4de]">
              Pemetaan struktur kelompok, klik pertemanan, dan isolasi sosial (Drag node untuk mengurai jaring)
            </p>
          </div>
        </div>

        {/* Layout Switcher Tabs */}
        <div className="flex items-center bg-[#0a2a4a] p-1 rounded-xl border border-[#1a3f64] text-xs">
          <button
            onClick={() => setLayoutMode('force')}
            className={`px-3 py-1.5 rounded-lg transition font-semibold flex items-center gap-1.5 ${
              layoutMode === 'force'
                ? 'bg-[#f0c040] text-[#0a2a4a] shadow-md'
                : 'text-[#b0c4de] hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Organik (Pegas)</span>
          </button>

          <button
            onClick={() => setLayoutMode('concentric')}
            className={`px-3 py-1.5 rounded-lg transition font-semibold flex items-center gap-1.5 ${
              layoutMode === 'concentric'
                ? 'bg-[#f0c040] text-[#0a2a4a] shadow-md'
                : 'text-[#b0c4de] hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Konsentris (Moreno)</span>
          </button>

          <button
            onClick={() => setLayoutMode('circular')}
            className={`px-3 py-1.5 rounded-lg transition font-semibold flex items-center gap-1.5 ${
              layoutMode === 'circular'
                ? 'bg-[#f0c040] text-[#0a2a4a] shadow-md'
                : 'text-[#b0c4de] hover:text-white'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Lingkaran</span>
          </button>
        </div>

        {/* Export & Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportPNG}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1a3f64] hover:bg-[#1a4a6e] text-[#e8edf5] text-xs font-semibold border border-white/10 transition"
            title="Unduh Gambar PNG Sosiogram"
          >
            <Download className="w-3.5 h-3.5 text-[#f0c040]" />
            <span className="hidden sm:inline">Unduh PNG</span>
          </button>
        </div>
      </div>

      {/* Filter Ribbon */}
      <div className="px-4 py-2.5 bg-[#0a2a4a]/80 border-b border-[#1a3f64] flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          {/* Criteria Filter */}
          <div className="flex items-center gap-1.5 text-[#b0c4de]">
            <span>Kriteria:</span>
            <select
              value={criteriaFilter}
              onChange={(e) => setCriteriaFilter(e.target.value as any)}
              className="bg-[#0d3555] border border-[#1a3f64] rounded-lg px-2.5 py-1 text-white font-medium focus:outline-hidden focus:border-[#f0c040]"
            >
              <option value="all">Semua Kriteria</option>
              <option value="belajar">📘 Belajar (Sosio-Instrumental)</option>
              <option value="bermain">🎮 Bermain (Sosio-Afektif)</option>
            </select>
          </div>

          {/* Relation Type Filter */}
          <div className="flex items-center gap-1.5 text-[#b0c4de]">
            <span>Tipe Relasi:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="bg-[#0d3555] border border-[#1a3f64] rounded-lg px-2.5 py-1 text-white font-medium focus:outline-hidden focus:border-[#f0c040]"
            >
              <option value="all">Semua Relasi</option>
              <option value="like">Disukai (Like)</option>
              <option value="dislike">Ditolak (Dislike / Putus-putus)</option>
              <option value="mutual">⭐ Resiprokal (Saling Memilih)</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 text-[#b0c4de]">
            <span>Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-[#0d3555] border border-[#1a3f64] rounded-lg px-2.5 py-1 text-white font-medium focus:outline-hidden focus:border-[#f0c040]"
            >
              <option value="ALL">Semua Siswa</option>
              <option value="RISK_ONLY">⚠️ Siswa Berisiko Tinggi Saja</option>
              <option value="Popular">Popular (Disukai)</option>
              <option value="Rejected">Rejected (Ditolak)</option>
              <option value="Neglected">Neglected (Terabaikan)</option>
              <option value="Controversial">Controversial</option>
              <option value="Average">Average (Rata-rata)</option>
            </select>
          </div>
        </div>

        {/* Quick Search Student */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-[#b0c4de] absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nama siswa di graf..."
            value={searchStudent}
            onChange={(e) => setSearchStudent(e.target.value)}
            className="bg-[#0d3555] border border-[#1a3f64] rounded-lg pl-8 pr-3 py-1 text-xs text-white placeholder:text-[#b0c4de]/50 focus:outline-hidden focus:border-[#f0c040] w-48"
          />
        </div>
      </div>

      {/* Main Interactive Canvas Area */}
      <div className="relative flex-1 min-h-[500px] bg-[#061c30] overflow-hidden">
        <canvas
          ref={canvasRef}
          width={900}
          height={520}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className="w-full h-full block cursor-grab active:cursor-grabbing"
        />

        {/* Zoom & Pan Controls Widget */}
        <div className="absolute bottom-4 right-4 flex flex-col gap-1.5 bg-[#0a2a4a]/90 border border-[#1a3f64] p-1.5 rounded-xl backdrop-blur-md shadow-xl">
          <button
            onClick={() => handleZoom(0.15)}
            className="p-1.5 rounded-lg text-[#b0c4de] hover:text-white hover:bg-white/10 transition"
            title="Perbesar (Zoom In)"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleZoom(-0.15)}
            className="p-1.5 rounded-lg text-[#b0c4de] hover:text-white hover:bg-white/10 transition"
            title="Perkecil (Zoom Out)"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={handleResetView}
            className="p-1.5 rounded-lg text-[#b0c4de] hover:text-white hover:bg-white/10 transition"
            title="Reset Posisi (100%)"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Status Legend Overlay */}
        <div className="absolute bottom-4 left-4 bg-[#0a2a4a]/90 border border-[#1a3f64] p-2.5 rounded-xl backdrop-blur-md text-[11px] space-y-1.5 shadow-xl hidden md:block">
          <div className="font-bold text-[#f0c040] text-[10px] uppercase tracking-wider mb-1 flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            <span>Kategori Status Sosial</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]" />
            <span className="text-slate-200">Popular (Banyak Disukai)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#f43f5e]" />
            <span className="text-rose-200">Rejected (Banyak Ditolak)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#94a3b8]" />
            <span className="text-slate-300">Neglected (Terabaikan)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#f0c040]" />
            <span className="text-amber-200">Controversial (Kontroversial)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#38bdf8]" />
            <span className="text-sky-200">Average (Rata-rata Kelas)</span>
          </div>
          <div className="pt-1 border-t border-white/10 text-[10px] text-[#b0c4de]">
            <span className="text-[#f0c040] font-bold">Garis Emas</span>: Pertemanan Resiprokal (Saling Pilih)
          </div>
        </div>

        {/* Selected Student Quick Inspection HUD */}
        {activeInspectedStudent && (
          <div className="absolute top-4 right-4 w-72 bg-[#0a2a4a]/95 border border-[#f0c040]/40 rounded-2xl p-4 shadow-2xl backdrop-blur-md space-y-2.5 text-xs animate-in fade-in slide-in-from-right-2 duration-150">
            <div className="flex items-start justify-between gap-2 border-b border-white/10 pb-2">
              <div>
                <div className="font-bold text-white text-sm">{activeInspectedStudent.name}</div>
                <div className="text-[10px] text-[#b0c4de] font-mono">NIS: {activeInspectedStudent.nis}</div>
              </div>
              <span
                className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                style={{
                  backgroundColor: `${getStatusColor(activeInspectedStudent.status)}20`,
                  color: getStatusColor(activeInspectedStudent.status),
                  border: `1px solid ${getStatusColor(activeInspectedStudent.status)}40`,
                }}
              >
                {activeInspectedStudent.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="bg-black/30 p-2 rounded-lg border border-white/5">
                <span className="text-[#b0c4de] block text-[10px]">Pilihan Masuk (Like):</span>
                <span className="text-emerald-400 font-extrabold text-sm">
                  {activeInspectedStudent.likesReceived} Teman
                </span>
              </div>
              <div className="bg-black/30 p-2 rounded-lg border border-white/5">
                <span className="text-[#b0c4de] block text-[10px]">Penolakan (Dislike):</span>
                <span className="text-rose-400 font-extrabold text-sm">
                  {activeInspectedStudent.dislikesReceived} Teman
                </span>
              </div>
            </div>

            <div className="text-[11px] text-[#b0c4de] space-y-1">
              <div className="flex justify-between">
                <span>Skor Preferensi Sosial (Z_SP):</span>
                <span className="font-bold text-white">{activeInspectedStudent.zSP.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Pertemanan Resiprokal:</span>
                <span className="font-bold text-[#f0c040]">
                  {activeInspectedStudent.reciprocalCount} Pasangan
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-white/10 text-[11px]">
              <span className="text-[#f7d970] font-bold block mb-0.5">Saran Aksi Bimbingan:</span>
              <p className="text-slate-300 text-[10px] leading-relaxed line-clamp-3">
                {activeInspectedStudent.dssRecommendation}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
