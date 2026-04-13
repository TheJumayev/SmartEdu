import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import ApiCall from "../../../config";
import {
  MdAssignment,
  MdTrendingDown,
  MdRefresh,
  MdSearch,
} from "react-icons/md";
import { FiCalendar, FiAward, FiAlertTriangle } from "react-icons/fi";

const ScoreBadge = ({ percent }) => {
  if (percent === undefined || percent === null)
    return <span className="text-xs text-gray-400">—</span>;
  if (percent >= 80)
    return (
      <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-bold text-green-700 dark:bg-green-900/30 dark:text-green-300">
        {percent}%
      </span>
    );
  if (percent >= 60)
    return (
      <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
        {percent}%
      </span>
    );
  return (
    <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-bold text-red-700 dark:bg-red-900/30 dark:text-red-300">
      {percent}%
    </span>
  );
};

const ProgressBar = ({ percent }) => {
  if (percent === undefined || percent === null) return null;
  const color =
    percent >= 80
      ? "from-green-500 to-emerald-500"
      : percent >= 60
      ? "from-amber-400 to-orange-400"
      : "from-red-500 to-rose-500";
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
      <div
        className={`h-full rounded-full bg-gradient-to-r ${color} transition-all duration-700`}
        style={{ width: `${Math.min(percent, 100)}%` }}
      />
    </div>
  );
};

const CompletedTasksPage = () => {
  const navigate = useNavigate();
  const studentId = localStorage.getItem("studentId");

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const fetchResults = async () => {
    if (!studentId) { setLoading(false); return; }
    setLoading(true);
    setError(null);
    try {
      const res = await ApiCall(`/api/v1/task/results/student/${studentId}`, "GET");
      if (res?.error) {
        const msg =
          typeof res.data === "string"
            ? res.data
            : res.data?.error || res.data?.message || "Ma'lumot yuklanmadi";
        setError(msg);
      } else {
        const list = Array.isArray(res?.data) ? res.data : [];
        list.sort((a, b) => new Date(b.submittedAt || 0) - new Date(a.submittedAt || 0));
        setResults(list);
      }
    } catch (e) {
      setError(e.message || "Xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchResults(); }, [studentId]);

  const filtered = useMemo(() => {
    return results.filter((r) => {
      if (filter === "pass" && (r.score ?? 0) < 60) return false;
      if (filter === "fail" && (r.score ?? 0) >= 60) return false;
      const title = (r.taskTitle || "").toLowerCase();
      const lesson = (r.lessonName || "").toLowerCase();
      const q = search.toLowerCase();
      return title.includes(q) || lesson.includes(q);
    });
  }, [results, search, filter]);

  const weakCount = results.filter((r) => (r.score ?? 0) < 60).length;
  const avgPercent = results.length
    ? Math.round(results.reduce((sum, r) => sum + (r.score ?? 0), 0) / results.length)
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-red-200 bg-red-50 py-16 dark:border-red-800/50 dark:bg-red-900/20">
        <FiAlertTriangle className="mb-3 h-12 w-12 text-red-400" />
        <p className="text-base font-semibold text-red-700 dark:text-red-400">{error}</p>
        <button
          onClick={fetchResults}
          className="mt-4 flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
        >
          <MdRefresh className="h-4 w-4" /> Qayta urinish
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 p-6 text-white shadow-lg">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
              <FiAward className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Bajargan vazifalarim</h1>
              <p className="mt-0.5 text-emerald-100">
                Jami {results.length} ta vazifa bajarildi
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="rounded-xl bg-white/15 px-4 py-2 text-center">
              <p className="text-xs text-emerald-100">O'rtacha ball</p>
              <p className="text-2xl font-black">{avgPercent}%</p>
            </div>
            <div className="rounded-xl bg-white/15 px-4 py-2 text-center">
              <p className="text-xs text-emerald-100">O'tgan</p>
              <p className="text-2xl font-black text-green-200">
                {results.filter((r) => (r.score ?? 0) >= 60).length}
              </p>
            </div>
            <div className="rounded-xl bg-white/15 px-4 py-2 text-center">
              <p className="text-xs text-emerald-100">Zaif</p>
              <p className="text-2xl font-black text-red-200">{weakCount}</p>
            </div>
          </div>
        </div>
      </div>

      {weakCount > 0 && (
        <button
          onClick={() => navigate("/student/weak-topics")}
          className="flex w-full items-center gap-4 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-left transition-all hover:shadow-md dark:border-red-800/50 dark:bg-red-900/20"
        >
          <FiAlertTriangle className="h-6 w-6 flex-shrink-0 text-red-500" />
          <div className="flex-1">
            <p className="font-semibold text-red-700 dark:text-red-400">
              {weakCount} ta mavzuda 60% dan past natija
            </p>
            <p className="text-sm text-red-600 dark:text-red-500">
              O'zlashtira olmagan mavzularingizni ko'rish uchun bosing →
            </p>
          </div>
          <MdTrendingDown className="h-6 w-6 flex-shrink-0 text-red-400" />
        </button>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <MdSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Vazifa nomi bo'yicha qidirish..."
            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-4 text-sm focus:border-emerald-400 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          />
        </div>
        {[
          { key: "all", label: "Hammasi" },
          { key: "pass", label: "O'tgan (>=60%)" },
          { key: "fail", label: "Zaif (<60%)" },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
              filter === f.key
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
            }`}
          >
            {f.label}
          </button>
        ))}
        <button
          onClick={fetchResults}
          className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
        >
          <MdRefresh className="h-4 w-4" /> Yangilash
        </button>
      </div>

      {results.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 py-16 dark:border-gray-700 dark:bg-gray-800/50">
          <MdAssignment className="mb-3 h-14 w-14 text-gray-300 dark:text-gray-600" />
          <p className="text-lg font-semibold text-gray-500 dark:text-gray-400">
            Hali hech qanday vazifa bajarilmagan
          </p>
          <p className="mt-1 text-sm text-gray-400">
            Vazifalar bo'limiga o'tib topshiriqlarni bajaring
          </p>
          <button
            onClick={() => navigate("/student/tasks")}
            className="mt-4 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            Vazifalar &rarr;
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl bg-gray-50 py-10 text-center dark:bg-gray-800">
          <p className="text-gray-500 dark:text-gray-400">
            Natija topilmadi
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((r, idx) => {
            const title = r.taskTitle || "Nomsiz vazifa";
            const isWeak = (r.score ?? 0) < 60;
            const dateStr = r.submittedAt
              ? new Date(r.submittedAt).toLocaleString("uz-UZ")
              : "";

            return (
              <div
                key={r.id || idx}
                className={`rounded-2xl border bg-white p-5 shadow-sm transition-all hover:shadow-md dark:bg-gray-800 ${
                  isWeak
                    ? "border-red-200 dark:border-red-800/50"
                    : "border-gray-200 dark:border-gray-700"
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white text-base">
                        {title}
                      </h3>
                      <ScoreBadge percent={r.score} />
                      {isWeak && (
                        <span className="flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-600 dark:bg-red-900/30 dark:text-red-400">
                          <FiAlertTriangle className="h-3 w-3" />
                          Zaif
                        </span>
                      )}
                    </div>
                    <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
                      {r.lessonName && <span>&#128214; {r.lessonName}</span>}
                      {r.teacherName && <span>&#128104;&#8205;&#127979; {r.teacherName}</span>}
                      {r.groupName && <span>&#128101; {r.groupName}</span>}
                      {r.type && <span className="capitalize">&#128193; {r.type}</span>}
                      {dateStr && (
                        <span className="flex items-center gap-1">
                          <FiCalendar className="h-3 w-3" />
                          {dateStr}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <p className="text-2xl font-black text-gray-800 dark:text-white">
                      {r.correct ?? "—"}/{r.total ?? "—"}
                    </p>
                    {isWeak && (
                      <button
                        onClick={() => navigate("/student/weak-topics")}
                        className="rounded-lg bg-red-100 px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400"
                      >
                        Mustahkamlash &rarr;
                      </button>
                    )}
                  </div>
                </div>
                <div className="mt-3">
                  <ProgressBar percent={r.score} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CompletedTasksPage;