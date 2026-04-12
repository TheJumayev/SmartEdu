import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import ApiCall from "../../../config";
import {
  MdArrowBack,
  MdAssignment,
  MdCheckCircle,
  MdCancel,
  MdPerson,
  MdBarChart,
  MdRefresh,
  MdSearch,
} from "react-icons/md";
import { FiAward, FiUsers, FiTrendingUp } from "react-icons/fi";
import { TASK_TYPES } from "./AiTask";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const getGradeInfo = (percent) => {
  if (percent >= 90) return { label: "A'lo", color: "text-green-700 dark:text-green-400", bg: "bg-green-100 dark:bg-green-900/30" };
  if (percent >= 70) return { label: "Yaxshi", color: "text-blue-700 dark:text-blue-400", bg: "bg-blue-100 dark:bg-blue-900/30" };
  if (percent >= 50) return { label: "Qoniqarli", color: "text-amber-700 dark:text-amber-400", bg: "bg-amber-100 dark:bg-amber-900/30" };
  return { label: "Qoniqarsiz", color: "text-red-700 dark:text-red-400", bg: "bg-red-100 dark:bg-red-900/30" };
};

const ProgressBar = ({ value, max }) => {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  const color =
    pct >= 90 ? "from-green-400 to-emerald-500" :
    pct >= 70 ? "from-blue-400 to-indigo-500" :
    pct >= 50 ? "from-amber-400 to-orange-500" :
    "from-red-400 to-rose-500";
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${color} transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-10 text-right text-xs font-bold text-gray-600 dark:text-gray-300">{pct}%</span>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

const TaskResultsPage = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const taskFromState = location.state?.task || null;
  const [task, setTask] = useState(taskFromState);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const isTest = task?.type === "TEST";
  const typeInfo = TASK_TYPES.find((t) => t.key === task?.type) || {
    label: task?.type || "",
    icon: <MdAssignment className="h-5 w-5" />,
    gradient: "from-indigo-600 to-purple-600",
    badge: "bg-indigo-100 text-indigo-700",
  };

  // ── Fetch task if not in state ──────────────────────────────────────────────
  useEffect(() => {
    if (!task && taskId) {
      ApiCall(`/api/v1/task/${taskId}`, "GET")
        .then((r) => setTask(r?.data || null))
        .catch(() => {});
    }
  }, [taskId, task]);

  // ── Fetch results ───────────────────────────────────────────────────────────
  const fetchResults = async () => {
    setLoading(true);
    setError("");
    try {
      // TEST results come from StudentAnswer; others from TaskResult
      const endpoint = isTest
        ? `/api/v1/test/task/${taskId}/results`
        : `/api/v1/task/results/task/${taskId}`;
      const res = await ApiCall(endpoint, "GET");
      setResults(Array.isArray(res?.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      setError("Natijalarni yuklashda xato yuz berdi.");
    } finally {
      setLoading(false);
    }
  };

  // Refetch when task type is known
  useEffect(() => {
    if (taskId && task) fetchResults();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskId, task?.type]);

  // ── Stats ───────────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    if (results.length === 0) return null;
    const percents = results.map((r) => {
      if (isTest) return r.score ?? (r.total > 0 ? Math.round((r.correct / r.total) * 100) : 0);
      return r.percent ?? 0;
    });
    const avg = Math.round(percents.reduce((a, b) => a + b, 0) / percents.length);
    const max = Math.max(...percents);
    const passing = percents.filter((p) => p >= 50).length;
    return { avg, max, passing, total: results.length };
  }, [results, isTest]);

  const filtered = results.filter((r) => {
    const name = (r.studentName || "").toLowerCase();
    return name.includes(search.toLowerCase());
  });

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 font-medium text-indigo-600 hover:text-indigo-800 dark:text-indigo-400"
      >
        <MdArrowBack className="h-5 w-5" /> Orqaga
      </button>

      {/* Header */}
      <div
        className={`rounded-2xl bg-gradient-to-r ${typeInfo.gradient} p-6 text-white shadow-lg`}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-white/20">
              <MdBarChart className="h-7 w-7" />
            </div>
            <div>
              <p className="text-sm font-medium text-white/70">Natijalar</p>
              <h1 className="text-2xl font-bold">{task?.title || "Yuklanmoqda..."}</h1>
              {task && (
                <span
                  className={`mt-1 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${typeInfo.badge}`}
                >
                  {typeInfo.icon} {typeInfo.label}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={fetchResults}
            className="flex items-center gap-1.5 self-start rounded-xl bg-white/20 px-4 py-2 text-sm font-medium hover:bg-white/30 sm:self-auto"
          >
            <MdRefresh className="h-4 w-4" /> Yangilash
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
          <MdCancel className="h-5 w-5 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Stats cards */}
      {stats && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
              <FiUsers className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">Jami</span>
            </div>
            <p className="mt-2 text-3xl font-black text-gray-900 dark:text-white">{stats.total}</p>
            <p className="mt-0.5 text-xs text-gray-400">talaba topshirdi</p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-center gap-2 text-blue-500">
              <FiTrendingUp className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">O'rtacha</span>
            </div>
            <p className="mt-2 text-3xl font-black text-gray-900 dark:text-white">{stats.avg}%</p>
            <p className="mt-0.5 text-xs text-gray-400">o'rtacha ball</p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-center gap-2 text-green-500">
              <FiAward className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Eng yuqori</span>
            </div>
            <p className="mt-2 text-3xl font-black text-gray-900 dark:text-white">{stats.max}%</p>
            <p className="mt-0.5 text-xs text-gray-400">maksimal ball</p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-center gap-2 text-amber-500">
              <MdCheckCircle className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">O'tdi</span>
            </div>
            <p className="mt-2 text-3xl font-black text-gray-900 dark:text-white">{stats.passing}</p>
            <p className="mt-0.5 text-xs text-gray-400">50%+ dan talaba</p>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        {/* Table header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-gray-700">
          <h2 className="font-semibold text-gray-900 dark:text-white">
            Talabalar natijalari
          </h2>
          <div className="relative">
            <MdSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Ism bo'yicha qidirish..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-48 rounded-lg border border-gray-300 bg-white py-1.5 pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-100 border-t-indigo-600" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <MdPerson className="mb-3 h-12 w-12 text-gray-300 dark:text-gray-600" />
            <p className="font-medium text-gray-500 dark:text-gray-400">
              {results.length === 0 ? "Hali hech kim topshirmagan" : "Hech qanday talaba topilmadi"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700">
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    #
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Talaba
                  </th>
                  {isTest && (
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      To'g'ri / Jami
                    </th>
                  )}
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Ball
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Baho
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Sana
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {filtered.map((r, idx) => {
                  const percent = isTest
                    ? (r.score ?? (r.total > 0 ? Math.round((r.correct / r.total) * 100) : 0))
                    : (r.percent ?? 0);
                  const grade = getGradeInfo(percent);
                  const submittedAt = r.submittedAt || r.completedAt;
                  const studentName = r.studentName
                    || r.student?.fullName
                    || `Talaba ${idx + 1}`;

                  return (
                    <tr
                      key={r.id || idx}
                      className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/30"
                    >
                      <td className="px-5 py-4 text-sm font-medium text-gray-400">
                        {idx + 1}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
                            {studentName.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {studentName}
                          </span>
                        </div>
                      </td>
                      {isTest && (
                        <td className="px-5 py-4 text-sm text-gray-700 dark:text-gray-300">
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {r.correct ?? 0}
                          </span>
                          <span className="text-gray-400"> / {r.total ?? "?"}</span>
                        </td>
                      )}
                      <td className="px-5 py-4 min-w-[160px]">
                        <ProgressBar value={percent} max={100} />
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${grade.bg} ${grade.color}`}
                        >
                          {grade.label}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {submittedAt
                          ? new Date(submittedAt).toLocaleDateString("uz-UZ", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskResultsPage;
