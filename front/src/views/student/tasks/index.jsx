import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import ApiCall from "../../../config";
import {
  MdSearch,
  MdCheckCircle,
  MdPending,
  MdAssignment,
  MdRefresh,
} from "react-icons/md";
import {
  FiHelpCircle,
  FiGrid,
  FiLink,
  FiList,
  FiEdit3,
  FiBook,
  FiTool,
  FiBarChart2,
  FiFileText,
} from "react-icons/fi";

// ── Task type configs ────────────────────────────────────────────────────────
const TASK_TYPE_MAP = {
  TEST: {
    label: "Test",
    icon: <FiHelpCircle className="h-4 w-4" />,
    badge: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  },
  ORAL: {
    label: "Og'zaki savol",
    icon: <FiFileText className="h-4 w-4" />,
    badge: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  },
  CROSSWORD: {
    label: "Krossvord",
    icon: <FiGrid className="h-4 w-4" />,
    badge: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300",
  },
  TABLE: {
    label: "Jadval",
    icon: <FiList className="h-4 w-4" />,
    badge: "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300",
  },
  MATCHING: {
    label: "Moslik topish",
    icon: <FiLink className="h-4 w-4" />,
    badge: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300",
  },
  CONTINUE_TEXT: {
    label: "Gapni davom ettir",
    icon: <FiEdit3 className="h-4 w-4" />,
    badge: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
  },
  ESSAY: {
    label: "Esse",
    icon: <FiBook className="h-4 w-4" />,
    badge: "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
  },
  PRACTICAL: {
    label: "Amaliy topshiriq",
    icon: <FiTool className="h-4 w-4" />,
    badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  },
  DIAGRAM: {
    label: "Diagramma tahlili",
    icon: <FiBarChart2 className="h-4 w-4" />,
    badge: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300",
  },
  SELF: {
    label: "Mustaqil ish",
    icon: <MdAssignment className="h-4 w-4" />,
    badge: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  },
};

// ── TaskCard ─────────────────────────────────────────────────────────────────
const TaskCard = ({ task, onClick, doneResult }) => {
  const typeInfo = TASK_TYPE_MAP[task.type] || {
    label: task.type,
    icon: <MdAssignment className="h-4 w-4" />,
    badge: "bg-gray-100 text-gray-700",
  };

  const isDone = Boolean(doneResult);
  const percent = doneResult?.percent;
  const scoreColor =
    percent === undefined
      ? ""
      : percent >= 80
      ? "text-green-600 dark:text-green-400"
      : percent >= 60
      ? "text-amber-600 dark:text-amber-400"
      : "text-red-600 dark:text-red-400";

  return (
    <div
      onClick={() => onClick(task)}
      className={`group relative cursor-pointer overflow-hidden rounded-2xl border bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:bg-gray-800 ${
        isDone
          ? percent !== undefined && percent < 60
            ? "border-red-200 dark:border-red-800/50"
            : "border-green-200 dark:border-green-800/50"
          : "border-gray-200 dark:border-gray-700"
      }`}
    >
      {/* Done ribbon */}
      {isDone && (
        <div
          className={`absolute right-0 top-0 flex items-center gap-1 rounded-bl-xl px-2.5 py-1 text-xs font-bold ${
            percent !== undefined && percent < 60
              ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
              : "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
          }`}
        >
          <MdCheckCircle className="h-3.5 w-3.5" />
          Bajarilgan
          {percent !== undefined && (
            <span className="ml-1 font-black">{percent}%</span>
          )}
        </div>
      )}

      {/* Hover shine */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:from-blue-900/10 dark:to-indigo-900/10" />

      <div className="relative">
        {/* Header */}
        <div className={`mb-3 flex items-start justify-between gap-2 ${isDone ? "pr-24" : ""}`}>
          <h3 className="text-base font-semibold leading-snug text-gray-900 dark:text-white line-clamp-2">
            {task.title}
          </h3>
          <span
            className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${typeInfo.badge}`}
          >
            {typeInfo.icon}
            {typeInfo.label}
          </span>
        </div>

        {/* Meta */}
        <div className="space-y-1.5 text-sm text-gray-500 dark:text-gray-400">
          {task.teacherName && (
            <p>
              <span className="font-medium text-gray-700 dark:text-gray-200">
                O'qituvchi:
              </span>{" "}
              {task.teacherName}
            </p>
          )}
          {task.lessonName && (
            <p>
              <span className="font-medium text-gray-700 dark:text-gray-200">
                Dars:
              </span>{" "}
              {task.lessonName}
            </p>
          )}
          <p>
            📚 Savollar:{" "}
            <span className="font-semibold text-gray-800 dark:text-white">
              {task.questions?.length ?? 0}
            </span>{" "}
            ta
          </p>
        </div>

        {/* Score progress bar (shown only when done) */}
        {isDone && percent !== undefined && (
          <div className="mt-3">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  percent >= 80
                    ? "bg-gradient-to-r from-green-500 to-emerald-400"
                    : percent >= 60
                    ? "bg-gradient-to-r from-amber-400 to-orange-400"
                    : "bg-gradient-to-r from-red-500 to-rose-400"
                }`}
                style={{ width: `${Math.min(percent, 100)}%` }}
              />
            </div>
            <p className={`mt-1 text-xs font-semibold ${scoreColor}`}>
              {doneResult.correct ?? "?"}/{doneResult.total ?? "?"} to'g'ri
            </p>
          </div>
        )}

        {/* Status row */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {task.approved ? (
              <>
                <MdCheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-xs font-medium text-green-700 dark:text-green-400">
                  Tasdiqlangan
                </span>
              </>
            ) : (
              <>
                <MdPending className="h-4 w-4 text-amber-500" />
                <span className="text-xs font-medium text-amber-700 dark:text-amber-400">
                  Tasdiq kutmoqda
                </span>
              </>
            )}
          </div>
          <button
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-all hover:shadow-md active:scale-95 ${
              isDone
                ? "bg-gradient-to-r from-gray-500 to-gray-600"
                : "bg-gradient-to-r from-blue-500 to-indigo-600"
            }`}
          >
            {isDone ? "Ko'rish" : "Ochish →"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
const StudentTasksPage = () => {
  const navigate = useNavigate();

  const studentId = localStorage.getItem("studentId");

  // Re-read localStorage on every mount so fresh completions are visible
  // (useMemo would cache across navigations; useState+useEffect re-runs on remount)
  const [doneMap, setDoneMap] = useState({});
  const buildDoneMap = useCallback(() => {
    const map = {};
    if (!studentId) return map;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(`student_task_done_${studentId}_`)) {
        try {
          const val = JSON.parse(localStorage.getItem(key));
          // Use String() to avoid type-mismatch between UUID string and task.id
          if (val?.taskId) map[String(val.taskId)] = val;
        } catch {}
      }
    }
    return map;
  }, [studentId]);

  useEffect(() => {
    setDoneMap(buildDoneMap());
  }, [buildDoneMap]); // runs on every mount — picks up completions made in TaskDetail

  const [lessons, setLessons] = useState([]);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [lessonsLoading, setLessonsLoading] = useState(true);
  const [error, setError] = useState("");
  const [studentInfo, setStudentInfo] = useState(null);

  // ── Fetch student info, then their group's lessons ──────────────────────────
  useEffect(() => {
    const init = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const studentRes = await ApiCall(
          `/api/v1/student/account/all/me/${token}`,
          "GET"
        );
        const student = studentRes?.data;
        setStudentInfo(student);

        // Try to get lessons from student's group curriculum
        if (student?.groupId) {
          const currRes = await ApiCall(
            `/api/v1/curriculums/group/${student.groupId}`,
            "GET"
          );
          const currList = Array.isArray(currRes?.data) ? currRes.data : [];

          // Collect all lessons from all curriculums
          let allLessons = [];
          for (const curr of currList) {
            if (Array.isArray(curr.lessons)) {
              allLessons = allLessons.concat(
                curr.lessons.map((l) => ({ ...l, subjectName: curr.name }))
              );
            }
          }
          setLessons(allLessons);
        } else {
          // Fallback: fetch all lessons directly
          const lessRes = await ApiCall("/api/v1/lessons", "GET");
          setLessons(Array.isArray(lessRes?.data) ? lessRes.data : []);
        }
      } catch (err) {
        console.error("Ma'lumotlarni yuklashda xato:", err);
        setError("Ma'lumotlarni yuklashda xato yuz berdi.");
      } finally {
        setLessonsLoading(false);
      }
    };
    init();
  }, []);

  // ── Fetch tasks when a lesson is selected ──────────────────────────────────
  const fetchTasks = async (lesson) => {
    setSelectedLesson(lesson);
    setTasks([]);
    setError("");
    setLoading(true);
    try {
      const res = await ApiCall(
        `/api/v1/task/lesson/${lesson.id}`,
        "GET"
      );
      setTasks(Array.isArray(res?.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      setError("Vazifalarni yuklashda xato yuz berdi.");
    } finally {
      setLoading(false);
    }
  };

  const handleTaskClick = (task) => {
    navigate(`/student/tasks/${task.id}`, { state: { task } });
  };

  const filteredTasks = tasks.filter((t) =>
    (t.title || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen space-y-6">
      {/* Page header */}
      <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white shadow-lg">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
            <MdAssignment className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Mening Vazifalarim</h1>
            <p className="mt-0.5 text-blue-100">
              Darsni tanlang va vazifalarni ko'ring
            </p>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* ── Lesson list ──────────────────────────────────────────────────── */}
        <div className="lg:col-span-1">
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="border-b border-gray-100 p-4 dark:border-gray-700">
              <h2 className="font-semibold text-gray-900 dark:text-white">
                📖 Darslar
              </h2>
            </div>

            {lessonsLoading ? (
              <div className="flex items-center justify-center py-10">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600" />
              </div>
            ) : lessons.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-gray-500">
                Darslar topilmadi
              </p>
            ) : (
              <ul className="max-h-[500px] divide-y divide-gray-100 overflow-y-auto dark:divide-gray-700">
                {lessons.map((lesson) => (
                  <li key={lesson.id}>
                    <button
                      onClick={() => fetchTasks(lesson)}
                      className={`w-full px-4 py-3 text-left transition-colors hover:bg-blue-50 dark:hover:bg-blue-900/20 ${
                        selectedLesson?.id === lesson.id
                          ? "bg-blue-50 text-blue-700 font-semibold dark:bg-blue-900/30 dark:text-blue-300"
                          : "text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      <p className="text-sm font-medium leading-snug">
                        {lesson.name || lesson.title || "Nomsiz dars"}
                      </p>
                      {lesson.subjectName && (
                        <p className="mt-0.5 text-xs text-gray-400">
                          {lesson.subjectName}
                        </p>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* ── Task list ─────────────────────────────────────────────────────── */}
        <div className="lg:col-span-2">
          {!selectedLesson ? (
            <div className="flex h-64 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 text-center dark:border-gray-700 dark:bg-gray-800/50">
              <MdAssignment className="mb-3 h-12 w-12 text-gray-300 dark:text-gray-600" />
              <p className="text-gray-500 dark:text-gray-400">
                Chap tarafdan darsni tanlang
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Selected lesson header + search */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    {selectedLesson.name || selectedLesson.title}
                  </h2>
                  {!loading && (
                    <p className="text-sm text-gray-500">
                      {filteredTasks.length} ta vazifa
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <MdSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Vazifa qidirish..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-44 rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white sm:w-56"
                    />
                  </div>
                  <button
                    onClick={() => fetchTasks(selectedLesson)}
                    title="Qayta yuklash"
                    className="rounded-lg border border-gray-300 bg-white p-2 text-gray-500 transition hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400"
                  >
                    <MdRefresh className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Loading */}
              {loading && (
                <div className="flex justify-center py-16">
                  <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
                </div>
              )}

              {/* Empty */}
              {!loading && filteredTasks.length === 0 && (
                <div className="flex h-48 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Bu dars uchun vazifalar topilmadi
                  </p>
                </div>
              )}

              {/* Task grid */}
              {!loading && filteredTasks.length > 0 && (
                <div className="grid gap-4 sm:grid-cols-2">
                  {filteredTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onClick={handleTaskClick}
                      doneResult={doneMap[String(task.id)] || null}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentTasksPage;
