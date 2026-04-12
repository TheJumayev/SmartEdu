import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { baseUrl } from "../../../config";
import ApiCall from "../../../config";
import {
  MdAutoAwesome,
  MdArrowBack,
  MdCheckCircle,
  MdCancel,
  MdRefresh,
  MdBook,
  MdExpandMore,
  MdExpandLess,
} from "react-icons/md";
import { TASK_TYPES, MatchingGame, CrosswordGame, QuestionCard } from "./AiTask";

const LessonAiTaskDetail = () => {
  const { lessonId, taskType } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [lesson, setLesson] = useState(location.state?.lesson || null);
  const [file, setFile] = useState(null);
  const [fileLoading, setFileLoading] = useState(false);

  const [savedTasks, setSavedTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [expandedIds, setExpandedIds] = useState({});

  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [userId, setUserId] = useState(null);

  const typeInfo = TASK_TYPES.find((t) => t.key === taskType);

  useEffect(() => {
    if (!lesson && lessonId) {
      const token = localStorage.getItem("access_token");
      fetch(`${baseUrl}/api/v1/lessons/${lessonId}`, {
        headers: { Authorization: token },
      })
        .then((r) => r.json())
        .then((d) => setLesson(d?.data || d))
        .catch(() => {});
    }
    getAdmin();
    fetchSavedTasks();
  }, [lessonId, taskType]);

  useEffect(() => {
    if (!lesson) return;
    const attachments = lesson.attachments || [];
    if (attachments.length === 0) return;
    const att = attachments[0];
    setFileLoading(true);
    const token = localStorage.getItem("access_token");
    fetch(`${baseUrl}/api/v1/file/getFile/${att.id}`, {
      headers: { Authorization: token },
    })
      .then(async (r) => {
        if (!r.ok) throw new Error();
        const blob = await r.blob();
        const realName = att.name?.split("__")[1] || att.name || "lesson-file";
        setFile(new File([blob], realName, { type: blob.type || "application/octet-stream" }));
      })
      .catch(() => {})
      .finally(() => setFileLoading(false));
  }, [lesson]);

  const getAdmin = async () => {
    const token = localStorage.getItem("access_token");
    try {
      const r = await ApiCall("/api/v1/auth/decode1?token=" + token, "GET", null);
      setUserId(r.data?.id);
    } catch {}
  };

  const fetchSavedTasks = async () => {
    setTasksLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      const r = await fetch(`${baseUrl}/api/v1/task/lesson/${lessonId}`, {
        headers: { Authorization: token },
      });
      const data = await r.json();
      const list = Array.isArray(data) ? data : data?.data || [];
      setSavedTasks(list.filter((t) => t.type === taskType));
    } catch {}
    finally {
      setTasksLoading(false);
    }
  };

  const generate = async () => {
    if (!file) {
      setError("Fayl hali yuklanmagan, biroz kuting.");
      return;
    }
    setGenerating(true);
    setResult(null);
    setError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", taskType);
      if (lesson?.name) formData.append("topic", lesson.name);
      const token = localStorage.getItem("access_token");
      const response = await axios.post(`${baseUrl}/api/v1/ai/generate-task`, formData, {
        headers: { Authorization: token, "Content-Type": "multipart/form-data" },
      });
      setResult(response.data);
    } catch (err) {
      setError(
        err?.response?.data?.message || "AI javob berishda xatolik. Qayta urinib ko'ring."
      );
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!result || !userId) return;
    setSaving(true);
    setError("");
    try {
      const taskPayload = {
        title: result.title,
        type: taskType,
        approved: true,
        questions: (result.questions || []).map((q) => ({
          question: q.question || null,
          optionA: q.optionA || null,
          optionB: q.optionB || null,
          optionC: q.optionC || null,
          optionD: q.optionD || null,
          correctAnswer: q.correctAnswer || null,
          left: q.left || null,
          right: q.right || null,
        })),
      };
      await ApiCall("/api/v1/task/save/" + userId + "/" + lessonId, "POST", taskPayload);
      setResult(null);
      fetchSavedTasks();
    } catch {
      setError("Saqlashda xatolik yuz berdi.");
    } finally {
      setSaving(false);
    }
  };

  const handleReject = () => {
    setResult(null);
    setError("");
  };

  const toggleExpand = (id) => {
    setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const renderContent = (task) => {
    const questions = task.questions || [];
    if (task.type === "MATCHING") return <MatchingGame questions={questions} />;
    if (task.type === "CROSSWORD") return <CrosswordGame questions={questions} showAnswers={true} />;
    return (
      <div className="space-y-3">
        {questions.map((q, idx) => (
          <QuestionCard key={idx} index={idx + 1} question={q} isTest={task.type === "TEST"} />
        ))}
      </div>
    );
  };

  const isFileReady = !!file && !fileLoading;

  return (
    <div className="space-y-6">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 font-medium text-indigo-600 transition-colors hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
      >
        <MdArrowBack className="h-5 w-5" /> Orqaga
      </button>

      {/* Header with gradient matching task type */}
      <div
        className={`rounded-2xl bg-gradient-to-r ${
          typeInfo?.gradient || "from-indigo-600 to-purple-600"
        } p-6 text-white shadow-lg`}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-white/20">
              {typeInfo?.icon || <MdAutoAwesome className="h-7 w-7" />}
            </div>
            <div>
              <h2 className="text-2xl font-bold">{typeInfo?.label || taskType}</h2>
              <p className="mt-1 text-white/80">{typeInfo?.desc}</p>
              {lesson?.name && (
                <div className="mt-3 flex items-center gap-2 rounded-xl bg-white/15 px-4 py-2">
                  <MdBook className="h-4 w-4 flex-shrink-0 text-white/70" />
                  <span className="text-sm font-medium">{lesson.name}</span>
                </div>
              )}
            </div>
          </div>

          {/* Generate button */}
          <button
            onClick={generate}
            disabled={!isFileReady || generating}
            className={`flex flex-shrink-0 items-center gap-2 rounded-xl px-5 py-2.5 font-semibold transition-all ${
              isFileReady && !generating
                ? "bg-white text-indigo-700 hover:bg-white/90 active:scale-[0.98] shadow-md"
                : "cursor-not-allowed bg-white/30 text-white/60"
            }`}
          >
            <MdAutoAwesome className="h-5 w-5" />
            {generating
              ? "Yaratilmoqda..."
              : fileLoading
              ? "Fayl yuklanmoqda..."
              : "Yangi generatsiya"}
          </button>
        </div>
      </div>

      {/* Generation loading */}
      {generating && (
        <div className="flex flex-col items-center justify-center rounded-2xl bg-white py-16 shadow-md dark:bg-gray-800">
          <div className="relative">
            <div className="h-20 w-20 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
            <MdAutoAwesome className="absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 text-indigo-600" />
          </div>
          <p className="mt-6 text-lg font-semibold text-gray-700 dark:text-gray-200">
            Gemini AI ishlamoqda...
          </p>
          <p className="mt-1 text-sm text-gray-400">
            {typeInfo?.label} topshirig'i yaratilmoqda
          </p>
          {lesson?.name && (
            <p className="mt-1 text-xs text-indigo-400">Mavzu: {lesson.name}</p>
          )}
        </div>
      )}

      {/* Error */}
      {error && !generating && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          <MdCancel className="h-5 w-5 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* New result preview */}
      {result && !generating && (
        <div className="space-y-4 rounded-2xl border-2 border-indigo-200 bg-indigo-50/50 p-1 dark:border-indigo-700 dark:bg-indigo-900/10">
          {/* Result meta */}
          <div className="rounded-xl bg-white p-5 shadow-sm dark:bg-gray-800">
            <div className="flex flex-wrap items-start gap-2">
              {typeInfo && (
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${typeInfo.badge}`}
                >
                  {typeInfo.icon} {typeInfo.label}
                </span>
              )}
              <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                Yangi — saqlanmagan
              </span>
            </div>
            <h3 className="mt-2 text-xl font-bold text-gray-900 dark:text-white">
              {result.title}
            </h3>
            <p className="text-sm text-gray-500">
              {result.questions?.length || 0} ta{" "}
              {taskType === "MATCHING" ? "juft" : taskType === "CROSSWORD" ? "so'z" : "savol"}{" "}
              yaratildi
            </p>
          </div>

          {/* Content */}
          <div className="px-1">{renderContent({ ...result, type: taskType })}</div>

          {/* Save / Reject */}
          <div className="flex flex-col gap-3 px-1 pb-1 sm:flex-row">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-green-500 to-green-700 px-6 py-4 font-semibold text-white shadow-md hover:from-green-400 hover:to-green-800 active:scale-[0.98] disabled:opacity-60"
            >
              <MdCheckCircle className="h-5 w-5" />
              {saving ? "Saqlanmoqda..." : "Qabul qilish va saqlash"}
            </button>
            <button
              onClick={handleReject}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-gray-200 bg-white px-6 py-4 font-semibold text-gray-700 hover:border-indigo-300 hover:bg-indigo-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              <MdRefresh className="h-5 w-5" />
              Rad etish
            </button>
          </div>
        </div>
      )}

      {/* Saved tasks list */}
      <div>
        <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
          Saqlangan topshiriqlar
        </p>

        {tasksLoading && (
          <div className="flex items-center gap-3 rounded-2xl bg-white p-6 shadow-sm dark:bg-gray-800">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-600" />
            <span className="text-sm text-gray-500">Yuklanmoqda...</span>
          </div>
        )}

        {!tasksLoading && savedTasks.length === 0 && (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center shadow-sm dark:border-gray-600 dark:bg-gray-800">
            <MdAutoAwesome className="mx-auto mb-3 h-10 w-10 text-gray-300 dark:text-gray-600" />
            <p className="font-medium text-gray-500 dark:text-gray-400">
              Bu turdagi saqlangan topshiriq yo'q
            </p>
            <p className="mt-1 text-sm text-gray-400">
              Yuqoridagi tugma orqali birinchi topshiriqni yarating
            </p>
          </div>
        )}

        {!tasksLoading && savedTasks.length > 0 && (
          <div className="space-y-3">
            {savedTasks.map((task) => (
              <div
                key={task.id}
                className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800"
              >
                <button
                  onClick={() => toggleExpand(task.id)}
                  className="flex w-full items-center justify-between p-5 text-left"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${
                        typeInfo?.gradient || "from-indigo-500 to-purple-500"
                      } text-white`}
                    >
                      {typeInfo?.icon}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {task.title}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {(task.questions || []).length} ta{" "}
                        {taskType === "MATCHING"
                          ? "juft"
                          : taskType === "CROSSWORD"
                          ? "so'z"
                          : "savol"}
                      </p>
                    </div>
                  </div>
                  {expandedIds[task.id] ? (
                    <MdExpandLess className="h-5 w-5 flex-shrink-0 text-gray-400" />
                  ) : (
                    <MdExpandMore className="h-5 w-5 flex-shrink-0 text-gray-400" />
                  )}
                </button>

                {expandedIds[task.id] && (
                  <div className="border-t border-gray-100 p-5 dark:border-gray-700">
                    {renderContent(task)}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LessonAiTaskDetail;
