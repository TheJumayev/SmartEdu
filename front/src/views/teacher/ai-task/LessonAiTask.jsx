import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { baseUrl } from "../../../config";
import {
  MdAutoAwesome,
  MdArrowBack,
  MdAttachFile,
  MdBook,
  MdWarning,
} from "react-icons/md";
import { TASK_TYPES } from "./AiTask";

const LessonAiTaskPage = () => {
  const { lessonId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [lesson, setLesson] = useState(location.state?.lesson || null);

  useEffect(() => {
    if (!lesson && lessonId) {
      const token = localStorage.getItem("access_token");
      fetch(`${baseUrl}/api/v1/lessons/${lessonId}`, {
        headers: { Authorization: token },
      })
        .then((r) => r.json())
        .then((d) => setLesson(d?.data || d))
        .catch(() => { });
    }
  }, [lesson, lessonId]);

  const hasAttachments = (lesson?.attachments || []).length > 0;

  return (
    <div className="space-y-6">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 font-medium text-indigo-600 transition-colors hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
      >
        <MdArrowBack className="h-5 w-5" /> Orqaga
      </button>

      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white shadow-lg">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-white/20">
            <MdAutoAwesome className="h-7 w-7" />
          </div>
          <div className="min-w-0">
            <h2 className="text-2xl font-bold">AI Topshiriq Generator</h2>
            <p className="mt-1 text-indigo-100">Dars asosida topshiriq yaratish</p>
            {lesson?.name && (
              <div className="mt-3 flex items-center gap-2 rounded-xl bg-white/15 px-4 py-2">
                <MdBook className="h-5 w-5 flex-shrink-0 text-indigo-200" />
                <span className="font-semibold">{lesson.name}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* File status card */}
      {lesson && (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Biriktirilgan material
          </p>
          {hasAttachments ? (
            <div className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 dark:border-green-800 dark:bg-green-900/20">
              <MdAttachFile className="h-5 w-5 text-green-600 dark:text-green-400" />
              <p className="font-medium text-green-800 dark:text-green-300">
                {lesson.attachments[0].name?.split("__")[1] || lesson.attachments[0].name || "Fayl"}
              </p>
              <span className="ml-auto text-xs text-green-600 dark:text-green-500">AI uchun tayyor</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
              <MdWarning className="h-5 w-5" />
              <span className="text-sm">
                Ushbu darsga fayl biriktirilmagan. Topshiriq generatsiyasi uchun fayl zarur.
              </span>
            </div>
          )}
        </div>
      )}

      {/* Task type buttons */}
      <div>
        <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
          Topshiriq turini tanlang
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {TASK_TYPES.map((t) => (
            <button
              key={t.key}
              onClick={() =>
                navigate(`/teacher/lesson-ai/${lessonId}/${t.key}`, {
                  state: { lesson },
                })
              }
              disabled={!hasAttachments}
              className={`flex items-center gap-3 rounded-xl px-5 py-4 text-left font-medium shadow-sm transition-all duration-200 ${hasAttachments
                ? `bg-gradient-to-r ${t.gradient} ${t.hoverGradient} text-white hover:shadow-md active:scale-[0.98]`
                : "cursor-not-allowed bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500"
                }`}
            >
              <span className="flex-shrink-0">{t.icon}</span>
              <div>
                <p className="font-bold leading-tight">{t.label}</p>
                <p className="text-xs font-normal opacity-80">{t.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>


    </div>
  );
};

export default LessonAiTaskPage;
