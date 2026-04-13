import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import ApiCall from "../../../config";
import {
  MdTrendingDown,
  MdAssignment,
  MdSearch,
  MdCheckCircle,
  MdRefresh,
} from "react-icons/md";
import {
  FiAlertTriangle,
  FiBookOpen,
  FiCalendar,
  FiTarget,
  FiYoutube,
} from "react-icons/fi";

// ── helpers ───────────────────────────────────────────────────────────────────

const getResultsFromStorage = (studentId) => {
  const results = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(`student_task_done_${studentId}_`)) {
      try {
        const val = JSON.parse(localStorage.getItem(key));
        if (val) results.push(val);
      } catch {}
    }
  }
  return results;
};

// Score indicator circle
const ScoreCircle = ({ percent }) => {
  const color =
    percent >= 60
      ? "text-amber-500"
      : "text-red-500";
  const bgColor =
    percent >= 60
      ? "bg-amber-50 dark:bg-amber-900/20"
      : "bg-red-50 dark:bg-red-900/20";
  return (
    <div className={`flex h-14 w-14 flex-shrink-0 flex-col items-center justify-center rounded-2xl ${bgColor}`}>
      <span className={`text-xl font-black leading-none ${color}`}>{percent}%</span>
      <span className="text-[10px] text-gray-400">ball</span>
    </div>
  );
};

const TIPS = [
  "Mavzuni darslikdan qayta o'qib chiqing.",
  "O'qituvchidan qo'shimcha tushuntirish so'rang.",
  "Internet resurslardan qo'shimcha material toping.",
  "Do'stingiz bilan birgalikda o'rganing.",
  "Kichik qismlarga bo'lib, har birini alohida o'rganing.",
];

// ── Main Page ─────────────────────────────────────────────────────────────────
const WeakTopicsPage = () => {
  const navigate = useNavigate();
  const studentId = localStorage.getItem("studentId");

  const [weakResults, setWeakResults] = useState([]);
  const [taskDetails, setTaskDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState(null); // taskId expanded for tips
  // Teacher-assigned weak topics from backend
  const [teacherTopics, setTeacherTopics] = useState([]);
  const [expandedTeacher, setExpandedTeacher] = useState(null);

  useEffect(() => {
    if (!studentId) { setLoading(false); return; }

    const all = getResultsFromStorage(studentId);
    // Only tasks where percent < 60
    const weak = all
      .filter((r) => (r.percent ?? 0) < 60)
      .sort((a, b) => (a.percent ?? 0) - (b.percent ?? 0)); // worst first
    setWeakResults(weak);

    // Fetch teacher-assigned weak topics
    ApiCall(`/api/v1/teacher/weak-topics/${studentId}`, "GET")
      .then((res) => {
        if (Array.isArray(res?.data)) setTeacherTopics(res.data);
      })
      .catch(() => {}); // endpoint may not exist yet — ignore

    const taskIds = [...new Set(weak.map((r) => r.taskId).filter(Boolean))];
    Promise.all(
      taskIds.map((id) =>
        ApiCall(`/api/v1/task/${id}`, "GET")
          .then((res) => ({ id, data: res?.data }))
          .catch(() => ({ id, data: null }))
      )
    ).then((all) => {
      const map = {};
      all.forEach(({ id, data }) => { if (data) map[id] = data; });
      setTaskDetails(map);
    });

    setLoading(false);
  }, [studentId]);

  const filtered = useMemo(() => {
    if (!search.trim()) return weakResults;
    const q = search.toLowerCase();
    return weakResults.filter((r) => {
      const task = taskDetails[r.taskId];
      const title = (task?.title || r.taskId || "").toLowerCase();
      const lesson = (task?.lessonName || "").toLowerCase();
      return title.includes(q) || lesson.includes(q);
    });
  }, [weakResults, taskDetails, search]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-red-200 border-t-red-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-r from-red-500 to-rose-600 p-6 text-white shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
              <MdTrendingDown className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">O'zlashtira olmagan mavzularim</h1>
              <p className="mt-0.5 text-red-100">
                60% dan past natija bilan bajarilgan topshiriqlar
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="rounded-xl bg-white/15 px-4 py-2 text-center">
              <p className="text-xs text-red-100">Zaif mavzular</p>
              <p className="text-2xl font-black">{weakResults.length} ta</p>
            </div>
            {weakResults.length > 0 && (
              <div className="rounded-xl bg-white/15 px-4 py-2 text-center">
                <p className="text-xs text-red-100">O'rtacha ball</p>
                <p className="text-2xl font-black">
                  {Math.round(
                    weakResults.reduce((s, r) => s + (r.percent ?? 0), 0) /
                      weakResults.length
                  )}
                  %
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 dark:border-amber-800/50 dark:bg-amber-900/10">
        <FiTarget className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" />
        <div>
          <p className="font-semibold text-amber-800 dark:text-amber-300">Nima qilish kerak?</p>
          <p className="mt-0.5 text-sm text-amber-700 dark:text-amber-400">
            Quyidagi mavzularni qayta o'rganing. Har bir mavzu yonidagi maslahatlarni ko'ring, keyin vazifaga qaytib ustida ishlang.
          </p>
        </div>
      </div>

      {/* Back to completed tasks link */}
      <button
        onClick={() => navigate("/student/completed-tasks")}
        className="flex items-center gap-2 text-sm font-medium text-emerald-600 hover:text-emerald-800 dark:text-emerald-400"
      >
        ← Barcha bajargan vazifalarimga qaytish
      </button>

      {/* Search */}
      {weakResults.length > 0 && (
        <div className="relative">
          <MdSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Mavzu bo'yicha qidirish..."
            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-4 text-sm focus:border-red-400 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          />
        </div>
      )}

      {/* ── Teacher-assigned weak topics ─────────────────────────────────── */}
      {teacherTopics.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-full bg-purple-100 px-3 py-1 text-xs font-bold text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
              👨‍🏫 O'qituvchi belgilagan mavzular
            </span>
          </div>
          {teacherTopics.map((item, idx) => {
            const isExp = expandedTeacher === idx;
            return (
              <div
                key={idx}
                className="overflow-hidden rounded-2xl border border-purple-200 bg-white shadow-sm dark:border-purple-800/40 dark:bg-gray-800"
              >
                <div className="flex items-start gap-4 p-5">
                  <div className="flex h-14 w-14 flex-shrink-0 flex-col items-center justify-center rounded-2xl bg-purple-50 dark:bg-purple-900/20">
                    <span className="text-xl">📖</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {item.title || item.topic}
                      </h3>
                      <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                        O'qituvchi
                      </span>
                    </div>
                    {item.topic && item.title && item.topic !== item.title && (
                      <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{item.topic}</p>
                    )}
                    {item.markedAt && (
                      <p className="mt-1 flex items-center gap-1 text-xs text-gray-400">
                        <FiCalendar className="h-3 w-3" />
                        {new Date(item.markedAt).toLocaleDateString("uz-UZ")}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => setExpandedTeacher(isExp ? null : idx)}
                    className="flex-shrink-0 rounded-xl border border-purple-200 bg-purple-50 px-3 py-2 text-xs font-medium text-purple-700 hover:bg-purple-100 dark:border-purple-700/50 dark:bg-purple-900/20 dark:text-purple-400"
                  >
                    {isExp ? "▲ Yopish" : "💡 Ko'rish"}
                  </button>
                </div>
                {isExp && (
                  <div className="border-t border-purple-100 bg-purple-50/60 px-5 py-4 dark:border-purple-900/30 dark:bg-purple-900/10">
                    {item.description && (
                      <p className="mb-3 text-sm text-gray-700 dark:text-gray-300">{item.description}</p>
                    )}
                    <div className="flex flex-wrap gap-2">
                      {item.videoUrl && (
                        <a
                          href={item.videoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700"
                        >
                          <FiYoutube className="h-4 w-4" />
                          YouTube videoni ko'rish
                        </a>
                      )}
                      {item.videoQuery && !item.videoUrl && (
                        <a
                          href={`https://www.youtube.com/results?search_query=${encodeURIComponent(item.videoQuery)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700"
                        >
                          <FiYoutube className="h-4 w-4" />
                          YouTube'da qidirish
                        </a>
                      )}
                      <button
                        onClick={() => navigate("/student/tasks")}
                        className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                      >
                        Mashqlarga o'tish
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Empty state */}
      {weakResults.length === 0 && teacherTopics.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-green-200 bg-green-50 py-16 dark:border-green-800/50 dark:bg-green-900/10">
          <MdCheckCircle className="mb-3 h-14 w-14 text-green-400" />
          <p className="text-lg font-bold text-green-700 dark:text-green-400">
            Ajoyib! Zaif mavzular yo'q 🎉
          </p>
          <p className="mt-1 text-sm text-green-600 dark:text-green-500">
            Barcha bajarilgan vazifalaringiz 60% dan yuqori
          </p>
          <button
            onClick={() => navigate("/student/completed-tasks")}
            className="mt-5 rounded-xl bg-green-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-700"
          >
            Bajargan vazifalarimga o'tish →
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl bg-gray-50 py-10 text-center dark:bg-gray-800">
          <p className="text-gray-500">"{search}" bo'yicha natija topilmadi</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((r, idx) => {
            const task = taskDetails[r.taskId];
            const title = task?.title || `Vazifa #${r.taskId}`;
            const lesson = task?.lessonName || "";
            const teacher = task?.teacherName || "";
            const isExpanded = expanded === r.taskId;
            const tip = TIPS[idx % TIPS.length];
            const dateStr = r.completedAt
              ? new Date(r.completedAt).toLocaleDateString("uz-UZ")
              : "";

            return (
              <div
                key={idx}
                className="rounded-2xl border border-red-200 bg-white shadow-sm dark:border-red-800/40 dark:bg-gray-800 overflow-hidden"
              >
                {/* Card header */}
                <div className="flex items-start gap-4 p-5">
                  <ScoreCircle percent={r.percent ?? 0} />

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {title}
                      </h3>
                      <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400">
                        {r.correct ?? 0}/{r.total ?? "—"} to'g'ri
                      </span>
                    </div>

                    <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
                      {lesson && (
                        <span className="flex items-center gap-1">
                          <FiBookOpen className="h-3 w-3" /> {lesson}
                        </span>
                      )}
                      {teacher && <span>👨‍🏫 {teacher}</span>}
                      {dateStr && (
                        <span className="flex items-center gap-1">
                          <FiCalendar className="h-3 w-3" /> {dateStr}
                        </span>
                      )}
                    </div>

                    {/* Progress bar */}
                    <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-red-100 dark:bg-red-900/20">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-red-500 to-rose-400 transition-all duration-700"
                        style={{ width: `${Math.min(r.percent ?? 0, 100)}%` }}
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-400">
                      O'tish uchun {60 - (r.percent ?? 0)} foiz yetishmaydi
                    </p>
                  </div>

                  {/* Expand tips button */}
                  <button
                    onClick={() => setExpanded(isExpanded ? null : r.taskId)}
                    className="flex-shrink-0 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700 hover:bg-amber-100 dark:border-amber-700/50 dark:bg-amber-900/20 dark:text-amber-400"
                  >
                    {isExpanded ? "▲ Yopish" : "💡 Maslahat"}
                  </button>
                </div>

                {/* Expanded tips */}
                {isExpanded && (
                  <div className="border-t border-red-100 bg-amber-50/60 px-5 py-4 dark:border-red-900/30 dark:bg-amber-900/10">
                    <div className="flex items-start gap-3">
                      <FiAlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-500" />
                      <div>
                        <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                          Tavsiya:
                        </p>
                        <p className="mt-0.5 text-sm text-amber-700 dark:text-amber-400">
                          {tip}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <button
                            onClick={() => navigate(`/student/tasks/${r.taskId}`)}
                            className="rounded-lg bg-red-500 px-4 py-2 text-xs font-semibold text-white hover:bg-red-600"
                          >
                            Qayta urinib ko'rish →
                          </button>
                          <button
                            onClick={() => navigate("/student/tasks")}
                            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                          >
                            Darsga o'tish
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default WeakTopicsPage;
