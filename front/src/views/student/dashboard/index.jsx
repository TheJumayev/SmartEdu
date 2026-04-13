import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import ApiCall from "../../../config";
import {
  MdCheckCircle,
  MdStars,
  MdTrendingUp,
  MdAssignment,
  MdBarChart,
  MdArrowUpward,
  MdArrowDownward,
} from "react-icons/md";

// --- Helpers ---

const TYPE_LABELS = {
  TEST: "Test",
  MATCHING: "Juftlash",
  CROSSWORD: "Krossvord",
  TABLE: "Jadval",
  CONTINUE_TEXT: "Matn davomi",
  ESSAY: "Insho",
  ORAL: "Og'zaki",
  PRACTICAL: "Amaliy",
};

const TYPE_COLORS = {
  TEST:          { bg: "#6366f1", light: "#eef2ff" },
  MATCHING:      { bg: "#f59e0b", light: "#fffbeb" },
  CROSSWORD:     { bg: "#10b981", light: "#ecfdf5" },
  TABLE:         { bg: "#3b82f6", light: "#eff6ff" },
  CONTINUE_TEXT: { bg: "#8b5cf6", light: "#f5f3ff" },
  ESSAY:         { bg: "#f43f5e", light: "#fff1f2" },
  ORAL:          { bg: "#14b8a6", light: "#f0fdfa" },
  PRACTICAL:     { bg: "#f97316", light: "#fff7ed" },
};

const scoreGrade = (s) => {
  if (s >= 90) return { label: "A'lo",       color: "#10b981", bg: "#ecfdf5" };
  if (s >= 75) return { label: "Yaxshi",     color: "#3b82f6", bg: "#eff6ff" };
  if (s >= 60) return { label: "Qoniqarli",  color: "#f59e0b", bg: "#fffbeb" };
  return            { label: "Past",         color: "#f43f5e", bg: "#fff1f2" };
};

const fmtDate = (dt) => {
  if (!dt) return "—";
  const d = new Date(dt);
  return d.toLocaleDateString("uz-UZ", { day: "2-digit", month: "2-digit", year: "2-digit" });
};

const fmtTime = (date) =>
  date.toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

const fmtDateFull = (date) =>
  date.toLocaleDateString("uz-UZ", { weekday: "long", day: "numeric", month: "long" });

// --- SVG Donut Chart ---

const DonutChart = ({ segments, size = 140, strokeWidth = 22 }) => {
  const r  = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const cx = size / 2;
  const cy = size / 2;
  const total = segments.reduce((s, seg) => s + seg.value, 0);
  let offset = 0;

  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      {total === 0 ? (
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e5e7eb" strokeWidth={strokeWidth} />
      ) : (
        segments.map((seg, i) => {
          const dash = (seg.value / total) * circ;
          const gap  = circ - dash;
          const el = (
            <circle
              key={i}
              cx={cx} cy={cy} r={r}
              fill="none"
              stroke={seg.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${dash} ${gap}`}
              strokeDashoffset={-offset}
              strokeLinecap="butt"
            />
          );
          offset += dash;
          return el;
        })
      )}
    </svg>
  );
};

// --- SVG Bar Chart ---

const BarChart = ({ data }) => {
  const height   = 150;
  const paddingL = 28;
  const paddingB = 30;
  const paddingT = 16;
  const chartH   = height - paddingB - paddingT;
  // Adaptive bar width: wider when few bars, narrower when many
  const barW     = Math.max(14, Math.min(32, Math.floor(320 / data.length) - 8));
  const gap      = Math.max(6, barW * 0.35);
  const totalW   = paddingL + data.length * (barW + gap);
  const max      = Math.max(...data.map((d) => d.value), 1);

  return (
    <svg width="100%" height={height} viewBox={`0 0 ${totalW} ${height}`} preserveAspectRatio="xMinYMid meet">
      {[0, 50, 100].map((pct) => {
        const y = paddingT + chartH - (pct / 100) * chartH;
        return (
          <g key={pct}>
            <line x1={paddingL} y1={y} x2={totalW} y2={y} stroke="#f3f4f6" strokeWidth="1" strokeDasharray={pct === 0 ? "0" : "3 3"} />
            <text x={paddingL - 4} y={y + 3} textAnchor="end" fontSize="8" fill="#d1d5db">{pct}</text>
          </g>
        );
      })}

      {data.map((d, i) => {
        const x     = paddingL + i * (barW + gap);
        const barH  = Math.max(3, (d.value / max) * chartH);
        const y     = paddingT + chartH - barH;
        const grade = scoreGrade(d.value);
        return (
          <g key={i}>
            {/* background column */}
            <rect x={x} y={paddingT} width={barW} height={chartH} rx="3" ry="3" fill={grade.bg} opacity="0.5" />
            {/* value bar */}
            <rect x={x} y={y} width={barW} height={barH} rx="3" ry="3" fill={grade.color} opacity="0.9" />
            <text x={x + barW / 2} y={y - 3} textAnchor="middle" fontSize="8" fill={grade.color} fontWeight="700">
              {d.value}
            </text>
            <text x={x + barW / 2} y={height - paddingB + 12} textAnchor="middle" fontSize="7" fill="#9ca3af">
              {d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

// --- Sparkline ---

const Sparkline = ({ values, color = "#6366f1", height = 40, width = 70 }) => {
  if (!values || values.length < 2) return null;
  const max   = Math.max(...values, 1);
  const min   = Math.min(...values, 0);
  const range = max - min || 1;
  const pts   = values.map((v, i) => {
    const x = (i / (values.length - 1)) * width;
    const y = height - ((v - min) / range) * (height - 8) - 4;
    return `${x},${y}`;
  });
  const last = pts[pts.length - 1].split(",");
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <polyline
        points={pts.join(" ")}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={parseFloat(last[0])} cy={parseFloat(last[1])} r="3" fill={color} />
    </svg>
  );
};

// --- Main Dashboard ---

const Dashboard = () => {
  const navigate    = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [results,   setResults]   = useState([]);
  const [loading,   setLoading]   = useState(true);

  const studentId = localStorage.getItem("studentId");
  const fullName  = localStorage.getItem("fullName") || "Talaba";

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Xayrli tong";
    if (h < 18) return "Xayrli kun";
    return "Xayrli kech";
  })();

  useEffect(() => {
    const t = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!studentId) { setLoading(false); return; }
    ApiCall(`/api/v1/task/results/student/${studentId}`, "GET", null)
      .then((res) => {
        if (!res?.error && Array.isArray(res?.data)) setResults(res.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [studentId]);

  const stats = useMemo(() => {
    const total = results.length;
    if (total === 0) return { total: 0, avg: 0, best: 0, worst: 0, perfect: 0, recentTrend: 0 };
    const scores  = results.map((r) => r.score || 0);
    const avg     = Math.round(scores.reduce((a, b) => a + b, 0) / total);
    const best    = Math.max(...scores);
    const worst   = Math.min(...scores);
    const perfect = scores.filter((s) => s === 100).length;
    const sorted  = [...results].sort((a, b) => new Date(a.submittedAt) - new Date(b.submittedAt));
    const last3   = sorted.slice(-3).map((r) => r.score || 0);
    const prev3   = sorted.slice(-6, -3).map((r) => r.score || 0);
    const avgLast = last3.length ? last3.reduce((a, b) => a + b, 0) / last3.length : 0;
    const avgPrev = prev3.length ? prev3.reduce((a, b) => a + b, 0) / prev3.length : 0;
    return { total, avg, best, worst, perfect, recentTrend: Math.round(avgLast - avgPrev) };
  }, [results]);

  const distribution = useMemo(() => {
    const c = { excellent: 0, good: 0, satisfactory: 0, poor: 0 };
    results.forEach((r) => {
      const s = r.score || 0;
      if (s >= 90) c.excellent++;
      else if (s >= 75) c.good++;
      else if (s >= 60) c.satisfactory++;
      else c.poor++;
    });
    return [
      { label: "A'lo (≥90%)",       value: c.excellent,    color: "#10b981" },
      { label: "Yaxshi (75-89%)",   value: c.good,         color: "#3b82f6" },
      { label: "Qoniqarli (60-74%)",value: c.satisfactory, color: "#f59e0b" },
      { label: "Past (<60%)",       value: c.poor,         color: "#f43f5e" },
    ];
  }, [results]);

  const byType = useMemo(() => {
    const map = {};
    results.forEach((r) => {
      const t = r.type || "OTHER";
      if (!map[t]) map[t] = { count: 0, totalScore: 0 };
      map[t].count++;
      map[t].totalScore += r.score || 0;
    });
    return Object.entries(map).map(([type, d]) => ({
      type,
      label: TYPE_LABELS[type] || type,
      count: d.count,
      avg:   Math.round(d.totalScore / d.count),
      color: TYPE_COLORS[type]?.bg    || "#6b7280",
      light: TYPE_COLORS[type]?.light || "#f9fafb",
    }));
  }, [results]);

  const chartData = useMemo(() =>
    [...results]
      .filter((r) => r.submittedAt)
      .sort((a, b) => new Date(a.submittedAt) - new Date(b.submittedAt))
      .slice(-10)
      .map((r) => ({ value: r.score || 0, label: fmtDate(r.submittedAt), type: r.type })),
  [results]);

  const sparkValues   = chartData.map((d) => d.value);

  const recentResults = useMemo(() =>
    [...results]
      .filter((r) => r.submittedAt)
      .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
      .slice(0, 5),
  [results]);

  return (
    <div className="min-h-screen space-y-6 p-4 md:p-6 bg-gray-50 dark:bg-gray-900">

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-2xl shadow-lg">
            <span>👨‍🎓</span>
            <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white bg-emerald-500" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-indigo-500 dark:text-indigo-400">Talaba paneli</p>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">{greeting}, {fullName}!</h1>
            <p className="text-xs text-gray-400">{fmtDateFull(currentTime)} · {fmtTime(currentTime)}</p>
          </div>
        </div>
        <button
          onClick={() => navigate("/student/tasks")}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:opacity-90 transition-opacity"
        >
          <MdAssignment className="h-5 w-5" />
          Topshiriqlarga o'tish
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
        </div>
      ) : results.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-white p-16 text-center dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-4 text-5xl">📭</div>
          <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">Hali topshiriqlar bajarilmagan</p>
          <p className="mt-1 text-sm text-gray-400">Topshiriqlarni bajaring — statistika shu yerda ko'rinadi</p>
          <button
            onClick={() => navigate("/student/tasks")}
            className="mt-5 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            Topshiriqlarga o'tish →
          </button>
        </div>
      ) : (
        <>
          {/* 4 Summary Cards */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">

            {/* Total */}
            <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-gray-800">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/40">
                  <MdCheckCircle className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <Sparkline values={sparkValues} color="#6366f1" width={64} height={36} />
              </div>
              <p className="text-3xl font-black text-gray-900 dark:text-white">{stats.total}</p>
              <p className="mt-1 text-xs font-medium text-gray-500 dark:text-gray-400">Bajarilgan topshiriqlar</p>
            </div>

            {/* Avg score */}
            <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-gray-800">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/40">
                  <MdBarChart className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                {stats.recentTrend !== 0 && (
                  <span
                    className="flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-bold"
                    style={{
                      backgroundColor: stats.recentTrend > 0 ? "#ecfdf5" : "#fff1f2",
                      color:           stats.recentTrend > 0 ? "#10b981" : "#f43f5e",
                    }}
                  >
                    {stats.recentTrend > 0
                      ? <MdArrowUpward className="h-3 w-3" />
                      : <MdArrowDownward className="h-3 w-3" />}
                    {Math.abs(stats.recentTrend)}%
                  </span>
                )}
              </div>
              <p className="text-3xl font-black text-gray-900 dark:text-white">{stats.avg}%</p>
              <p className="mt-1 text-xs font-medium text-gray-500 dark:text-gray-400">O'rtacha ball</p>
              <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
                <div className="h-full rounded-full bg-blue-500 transition-all duration-700" style={{ width: `${stats.avg}%` }} />
              </div>
            </div>

            {/* Best */}
            <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-gray-800">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/40">
                  <MdStars className="h-5 w-5 text-amber-500" />
                </div>
                <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-bold text-amber-600 dark:bg-amber-900/30 dark:text-amber-300">
                  Eng yuqori
                </span>
              </div>
              <p className="text-3xl font-black text-gray-900 dark:text-white">{stats.best}%</p>
              <p className="mt-1 text-xs font-medium text-gray-500 dark:text-gray-400">Eng yaxshi natija</p>
              <p className="mt-1 text-[11px] text-gray-400">Eng past: {stats.worst}%</p>
            </div>

            {/* Perfect */}
            <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-gray-800">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/40">
                  <MdTrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <span className="text-2xl">🏆</span>
              </div>
              <p className="text-3xl font-black text-gray-900 dark:text-white">{stats.perfect}</p>
              <p className="mt-1 text-xs font-medium text-gray-500 dark:text-gray-400">100% natijalar</p>
              <p className="mt-1 text-[11px] text-gray-400">
                {stats.total > 0 ? Math.round((stats.perfect / stats.total) * 100) : 0}% jami topshiriqdan
              </p>
            </div>
          </div>

          {/* Bar Chart + Donut */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">

            {/* Bar Chart */}
            <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-gray-800 lg:col-span-2">
              <div className="mb-4 flex items-center gap-2">
                <div className="h-5 w-1 rounded-full bg-gradient-to-b from-indigo-500 to-purple-500" />
                <h2 className="font-semibold text-gray-800 dark:text-gray-100">
                  Ball tarixi (so'nggi {chartData.length} ta)
                </h2>
              </div>
              {chartData.length < 2 ? (
                <div className="flex h-28 items-center justify-center text-sm text-gray-400">Kamida 2 ta natija kerak</div>
              ) : (
                <div className="overflow-x-auto">
                  <div style={{ minWidth: Math.max(chartData.length * 36 + 32, 160) }}>
                    <BarChart data={chartData} />
                  </div>
                </div>
              )}
              <div className="mt-2 flex flex-wrap gap-2">
                {[
                  { label: "A'lo ≥90%",    color: "#10b981" },
                  { label: "Yaxshi 75-89%", color: "#3b82f6" },
                  { label: "Qoniq. 60-74%", color: "#f59e0b" },
                  { label: "Past <60%",     color: "#f43f5e" },
                ].map((l) => (
                  <span key={l.label} className="flex items-center gap-1 text-[11px] text-gray-400 dark:text-gray-500">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: l.color }} />
                    {l.label}
                  </span>
                ))}
              </div>
            </div>

            {/* Donut */}
            <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-gray-800">
              <div className="mb-4 flex items-center gap-2">
                <div className="h-5 w-1 rounded-full bg-gradient-to-b from-emerald-500 to-teal-500" />
                <h2 className="font-semibold text-gray-800 dark:text-gray-100">Ball taqsimoti</h2>
              </div>
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <DonutChart segments={distribution} size={144} strokeWidth={24} />
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <p className="text-2xl font-black text-gray-900 dark:text-white">{stats.avg}%</p>
                    <p className="text-[10px] text-gray-400">o'rtacha</p>
                  </div>
                </div>
                <div className="w-full space-y-2">
                  {distribution.map((seg) => (
                    <div key={seg.label} className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: seg.color }} />
                        {seg.label}
                      </span>
                      <span className="text-xs font-bold text-gray-800 dark:text-gray-100">{seg.value} ta</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Task Type Breakdown */}
          {byType.length > 0 && (
            <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-gray-800">
              <div className="mb-4 flex items-center gap-2">
                <div className="h-5 w-1 rounded-full bg-gradient-to-b from-amber-500 to-orange-500" />
                <h2 className="font-semibold text-gray-800 dark:text-gray-100">Topshiriq turi bo'yicha</h2>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {byType.map((t) => (
                  <div
                    key={t.type}
                    className="rounded-xl border p-4 dark:border-gray-700"
                    style={{ backgroundColor: t.light }}
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wide" style={{ color: t.color }}>
                        {t.label}
                      </span>
                      <span className="rounded-full px-2 py-0.5 text-xs font-bold text-white" style={{ backgroundColor: t.color }}>
                        {t.count} ta
                      </span>
                    </div>
                    <div className="mb-1 h-1.5 w-full overflow-hidden rounded-full bg-white/60">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${t.avg}%`, backgroundColor: t.color }}
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      O'rtacha: <span className="font-bold" style={{ color: t.color }}>{t.avg}%</span>
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Results */}
          <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-gray-800">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-5 w-1 rounded-full bg-gradient-to-b from-blue-500 to-indigo-500" />
                <h2 className="font-semibold text-gray-800 dark:text-gray-100">So'nggi natijalar</h2>
              </div>
              <button
                onClick={() => navigate("/student/tasks")}
                className="text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
              >
                Barchasini ko'rish →
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-700">
                    {["#", "Turi", "Ball", "To'g'ri/Jami", "Baho", "Sana"].map((h) => (
                      <th key={h} className="pb-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-700/60">
                  {recentResults.map((r, i) => {
                    const grade      = scoreGrade(r.score || 0);
                    const typeColor  = TYPE_COLORS[r.type]?.bg    || "#6b7280";
                    const typeLight  = TYPE_COLORS[r.type]?.light || "#f9fafb";
                    return (
                      <tr key={r.id} className="transition-colors hover:bg-gray-50/80 dark:hover:bg-gray-700/30">
                        <td className="py-3 pr-2 font-medium text-gray-400">{i + 1}</td>
                        <td className="py-3 pr-4">
                          <span className="rounded-lg px-2.5 py-1 text-xs font-bold" style={{ backgroundColor: typeLight, color: typeColor }}>
                            {TYPE_LABELS[r.type] || r.type || "—"}
                          </span>
                        </td>
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-16 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
                              <div className="h-full rounded-full" style={{ width: `${r.score || 0}%`, backgroundColor: grade.color }} />
                            </div>
                            <span className="font-bold" style={{ color: grade.color }}>{r.score ?? "—"}%</span>
                          </div>
                        </td>
                        <td className="py-3 pr-4 text-gray-600 dark:text-gray-300">
                          {r.correct != null && r.total != null ? `${r.correct}/${r.total}` : "—"}
                        </td>
                        <td className="py-3 pr-4">
                          <span className="rounded-full px-2.5 py-0.5 text-xs font-bold" style={{ backgroundColor: grade.bg, color: grade.color }}>
                            {grade.label}
                          </span>
                        </td>
                        <td className="py-3 text-xs text-gray-400">{fmtDate(r.submittedAt)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Motivational footer */}
          <div
            className="rounded-2xl p-5 text-white shadow-md"
            style={{
              background: stats.avg >= 85
                ? "linear-gradient(135deg,#10b981,#059669)"
                : stats.avg >= 65
                ? "linear-gradient(135deg,#6366f1,#8b5cf6)"
                : "linear-gradient(135deg,#f59e0b,#f97316)",
            }}
          >
            <div className="flex flex-wrap items-center gap-4">
              <div className="text-4xl">
                {stats.avg >= 85 ? "🌟" : stats.avg >= 65 ? "💪" : "📚"}
              </div>
              <div>
                <p className="text-lg font-bold">
                  {stats.avg >= 85
                    ? "Ajoyib natijalar! Siz juda yaxshi ishlayapsiz!"
                    : stats.avg >= 65
                    ? "Yaxshi harakat! Davom eting!"
                    : "Yana qattiqroq harakat qiling, muvaffaqiyat kutmoqda!"}
                </p>
                <p className="text-sm opacity-80">
                  Siz jami {stats.total} ta topshiriq bajardingiz · O'rtacha ball: {stats.avg}%
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;