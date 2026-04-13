import React, { useState, useRef, useCallback, useEffect, useMemo } from "react";
import axios from "axios";
import { baseUrl } from "../../../config";
import {
  MdAutoAwesome,
  MdUploadFile,
  MdCheckCircle,
  MdCancel,
  MdRefresh,
  MdClose,
} from "react-icons/md";
import {
  FiFileText,
  FiGrid,
  FiList,
  FiLink,
  FiEdit3,
  FiBook,
  FiTool,
  FiBarChart2,
  FiHelpCircle,
} from "react-icons/fi";
import ApiCall from "../../../config";
import { ContinueTextPreview } from "./ContinueTextGame";
export const TASK_TYPES = [
  {
    key: "TEST",
    label: "Test",
    desc: "A, B, C, D variantli",
    icon: <FiHelpCircle className="h-6 w-6" />,
    gradient: "from-purple-500 to-pink-500",
    hoverGradient: "hover:from-purple-600 hover:to-pink-600",
    badge: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
    soon: false,
  },

  {
    key: "CROSSWORD",
    label: "Krossvord",
    desc: "Krossvord savollari",
    icon: <FiGrid className="h-6 w-6" />,
    gradient: "from-yellow-500 to-orange-500",
    hoverGradient: "hover:from-yellow-600 hover:to-orange-600",
    badge: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300",
    soon: false,
  },
  {
    key: "TABLE",
    label: "Jadval",
    desc: "Jadval to'ldirish",
    icon: <FiList className="h-6 w-6" />,
    gradient: "from-teal-500 to-green-500",
    hoverGradient: "hover:from-teal-600 hover:to-green-600",
    badge: "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300",
    soon: false,
  },
  {
    key: "MATCHING",
    label: "Moslik topish",
    desc: "Juftlik topish",
    icon: <FiLink className="h-6 w-6" />,
    gradient: "from-indigo-500 to-blue-500",
    hoverGradient: "hover:from-indigo-600 hover:to-blue-600",
    badge: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300",
    soon: false,
  },
  {
    key: "CONTINUE_TEXT",
    label: "Gapni davom ettir",
    desc: "To'ldirish topshirig'i",
    icon: <FiEdit3 className="h-6 w-6" />,
    gradient: "from-gray-700 to-red-800",
    hoverGradient: "hover:from-gray-800 hover:to-red-900",
    badge: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
    soon: false,
  },
  {
    key: "ESSAY",
    label: "Esse",
    desc: "Qisqa esse mavzulari",
    icon: <FiBook className="h-6 w-6" />,
    gradient: "from-gray-600 to-purple-700",
    hoverGradient: "hover:from-gray-700 hover:to-purple-800",
    badge: "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
    soon: true,
  },
  {
    key: "ORAL",
    label: "Og'zaki savol",
    desc: "Savol-javob formati",
    icon: <FiFileText className="h-6 w-6" />,
    gradient: "from-blue-500 to-cyan-500",
    hoverGradient: "hover:from-blue-600 hover:to-cyan-600",
    badge: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
    soon: true,
  },
  {
    key: "PRACTICAL",
    label: "Amaliy topshiriq",
    desc: "Amaliyot savollari",
    icon: <FiTool className="h-6 w-6" />,
    gradient: "from-amber-500 to-yellow-500",
    hoverGradient: "hover:from-amber-600 hover:to-yellow-600",
    badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
    soon: true,
  },
  {
    key: "DIAGRAM",
    label: "Diagramma tahlili",
    desc: "Vizual tahlil",
    icon: <FiBarChart2 className="h-6 w-6" />,
    gradient: "from-cyan-500 to-teal-500",
    hoverGradient: "hover:from-cyan-600 hover:to-teal-600",
    badge: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300",
    soon: true,
  },
];

const AiTaskPage = () => {
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState(null);
  const [taskType, setTaskType] = useState(null);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef();

  // Lesson picker modal state
  const [userId, setUserId] = useState(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [curricula, setCurricula] = useState([]);
  const [saveLessons, setSaveLessons] = useState([]);
  const [selCurricId, setSelCurricId] = useState("");
  const [selLessonId, setSelLessonId] = useState("");
  const [curriculaLoading, setCurriculaLoading] = useState(false);
  const [lessonsLoading, setLessonsLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    ApiCall("/api/v1/auth/decode1?token=" + token, "GET", null)
      .then((r) => setUserId(r.data?.id))
      .catch(() => {});
  }, []);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setResult(null);
      setSaved(false);
      setError("");
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) {
      setFile(dropped);
      setResult(null);
      setSaved(false);
      setError("");
    }
  };

  const generate = async (type) => {
    if (!file) {
      setError("Avval fayl yuklang!");
      return;
    }
    setTaskType(type);
    setLoading(true);
    setResult(null);
    setSaved(false);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", type);

      const token = localStorage.getItem("access_token");
      const response = await axios.post(
        `${baseUrl}/api/v1/ai/generate-task`,
        formData,
        {
          headers: {
            Authorization: token,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setResult(response.data);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
        "AI javob berishda xatolik yuz berdi. Qayta urinib ko'ring."
      );
    } finally {
      setLoading(false);
    }
  };

  const openSaveModal = async () => {
    if (!result || !userId) return;
    setShowSaveModal(true);
    setSelCurricId("");
    setSelLessonId("");
    setSaveLessons([]);
    setCurriculaLoading(true);
    try {
      const r = await ApiCall(`/api/v1/curriculums/user/${userId}`, "GET", null);
      setCurricula(Array.isArray(r.data) ? r.data : []);
    } catch {
      setCurricula([]);
    } finally {
      setCurriculaLoading(false);
    }
  };

  const handleCurricChange = async (curricId) => {
    setSelCurricId(curricId);
    setSelLessonId("");
    setSaveLessons([]);
    if (!curricId) return;
    setLessonsLoading(true);
    try {
      const r = await ApiCall(`/api/v1/lessons/curriculm/${curricId}`, "GET", null);
      setSaveLessons(Array.isArray(r.data) ? r.data : []);
    } catch {
      setSaveLessons([]);
    } finally {
      setLessonsLoading(false);
    }
  };

  const handleConfirmSave = async () => {
    if (!selLessonId || !userId || !result) return;
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
      await ApiCall(`/api/v1/task/save/${userId}/${selLessonId}`, "POST", taskPayload);
      setSaved(true);
      setShowSaveModal(false);
    } catch {
      setError("Saqlashda xatolik yuz berdi.");
    } finally {
      setSaving(false);
    }
  };

  const handleReject = () => {
    setResult(null);
    setSaved(false);
    setError("");
  };

  const removeFile = () => {
    setFile(null);
    setResult(null);
    setSaved(false);
    setError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const currentTypeInfo = TASK_TYPES.find((t) => t.key === taskType);

  return (<>
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white shadow-lg">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
            <MdAutoAwesome className="h-7 w-7" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">AI Topshiriq Generator</h2>
            <p className="mt-1 text-indigo-100">
              Fayl yuklang va kerakli topshiriq turini tanlang
            </p>
          </div>
        </div>
      </div>

      {/* File Upload */}
      {!result && !loading && (
        <div
          className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-all duration-200 ${dragOver
            ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20"
            : "border-gray-300 bg-white hover:border-indigo-400 hover:bg-indigo-50/30 dark:border-gray-600 dark:bg-gray-800"
            }`}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.txt"
            className="hidden"
            onChange={handleFileChange}
          />

          {file ? (
            <div className="flex flex-col items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100 dark:bg-indigo-900/40">
                <MdUploadFile className="h-8 w-8 text-indigo-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-800 dark:text-white">{file.name}</p>
                <p className="text-sm text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); removeFile(); }}
                className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <MdClose className="h-4 w-4" />
                Faylni o'chirish
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-700">
                <MdUploadFile className="h-8 w-8 text-gray-400" />
              </div>
              <div>
                <p className="text-base font-semibold text-gray-700 dark:text-gray-200">
                  Fayl yuklash uchun bosing yoki sudrab tashlang
                </p>
                <p className="mt-1 text-sm text-gray-400">PDF, DOCX, TXT</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Task Type Buttons */}
      {!result && !loading && (
        <div>
          <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Topshiriq turini tanlang
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {TASK_TYPES.map((t) => (
              <button
                key={t.key}
                onClick={() => generate(t.key)}
                disabled={!file}
                className={`flex items-center gap-3 rounded-xl px-5 py-4 font-medium shadow-sm transition-all duration-200 text-left ${file
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
      )}

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center justify-center rounded-2xl bg-white py-16 shadow-md dark:bg-gray-800">
          <div className="relative">
            <div className="h-20 w-20 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
            <MdAutoAwesome className="absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 text-indigo-600" />
          </div>
          <p className="mt-6 text-lg font-semibold text-gray-700 dark:text-gray-200">
            Gemini AI ishlamoqda...
          </p>
          <p className="mt-1 text-sm text-gray-400">
            {currentTypeInfo?.label} topshirig'i yaratilmoqda
          </p>
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          <MdCancel className="h-5 w-5 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Result */}
      {result && !loading && (
        <div className="space-y-4">
          {/* Result Header */}
          <div className="flex items-center justify-between rounded-2xl bg-white p-5 shadow-md dark:bg-gray-800">
            <div>
              <div className="mb-1 flex items-center gap-2">
                {currentTypeInfo && (
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${currentTypeInfo.badge}`}>
                    {currentTypeInfo.icon}
                    {currentTypeInfo.label}
                  </span>
                )}
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {result.title}
              </h3>
              <p className="text-sm text-gray-500">
                {result.questions?.length || 0} ta {taskType === "MATCHING" ? "juft" : taskType === "CROSSWORD" ? "so'z" : "savol"} yaratildi
              </p>
            </div>
            {saved && (
              <div className="flex items-center gap-2 rounded-xl bg-green-50 px-4 py-2 text-green-700 dark:bg-green-900/20 dark:text-green-400">
                <MdCheckCircle className="h-5 w-5" />
                <span className="font-medium">Saqlandi!</span>
              </div>
            )}
          </div>

          {/* Questions */}
          {taskType === "MATCHING" ? (
            <MatchingGame questions={result.questions || []} />
          ) : taskType === "CROSSWORD" ? (
            <CrosswordGame questions={result.questions || []} />
          ) : taskType === "TABLE" ? (
            <TablePreview tableData={result.questions?.[0]?.question} showAnswers={true} />
          ) : taskType === "CONTINUE_TEXT" ? (
            <ContinueTextPreview questions={result.questions || []} />
          ) : (
            <div className="space-y-3">
              {(result.questions || []).map((q, idx) => (
                <QuestionCard
                  key={idx}
                  index={idx + 1}
                  question={q}
                  isTest={taskType === "TEST"}
                />
              ))}
            </div>
          )}

          {/* Action buttons */}
          {!saved && (
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                onClick={openSaveModal}
                disabled={saving || !userId}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-green-500 to-green-800 px-6 py-4 font-semibold text-white shadow-md hover:from-green-400 hover:to-green-900 hover:shadow-lg active:scale-[0.98] disabled:opacity-60"
              >
                <MdCheckCircle className="h-5 w-5" />
                Qabul qilish va saqlash
              </button>

              <button
                onClick={handleReject}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-gray-200 bg-white px-6 py-4 font-semibold text-gray-700 hover:border-indigo-300 hover:bg-indigo-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                <MdRefresh className="h-5 w-5" />
                Rad etish va qayta yaratish
              </button>
            </div>
          )}

          {saved && (
            <button
              onClick={() => {
                setResult(null);
                setSaved(false);
                setFile(null);
                setTaskType(null);
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
              className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-indigo-200 bg-indigo-50 px-6 py-4 font-semibold text-indigo-700 hover:bg-indigo-100 dark:border-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300"
            >
              <MdAutoAwesome className="h-5 w-5" />
              Yangi topshiriq yaratish
            </button>
          )}
        </div>
      )}
    </div>

    {/* ─── Lesson picker modal ─────────────────────────────────────────────── */}
    {showSaveModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setShowSaveModal(false)}>
        <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-800" onClick={(e) => e.stopPropagation()}>
          <h3 className="mb-1 text-lg font-bold text-gray-800 dark:text-white">Darsga saqlash</h3>
          <p className="mb-5 text-sm text-gray-500 dark:text-gray-400">Topshiriqni qaysi darsga qo'shishni tanlang</p>

          {/* Curriculum select */}
          <div className="mb-4">
            <label className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-300">O'quv dastur</label>
            {curriculaLoading ? (
              <div className="flex items-center gap-2 text-sm text-gray-500"><div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-indigo-500" />Yuklanmoqda...</div>
            ) : (
              <select
                value={selCurricId}
                onChange={(e) => handleCurricChange(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-indigo-400 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                <option value="">— O'quv dasturni tanlang —</option>
                {curricula.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            )}
            {!curriculaLoading && curricula.length === 0 && (
              <p className="mt-1.5 text-xs text-amber-600">O'quv dasturlari topilmadi. Avval o'quv dastur yarating.</p>
            )}
          </div>

          {/* Lesson select */}
          {selCurricId && (
            <div className="mb-6">
              <label className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-300">Dars</label>
              {lessonsLoading ? (
                <div className="flex items-center gap-2 text-sm text-gray-500"><div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-indigo-500" />Yuklanmoqda...</div>
              ) : (
                <select
                  value={selLessonId}
                  onChange={(e) => setSelLessonId(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-indigo-400 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">— Darsni tanlang —</option>
                  {saveLessons.map((l) => (
                    <option key={l.id} value={l.id}>{l.title || l.name || l.id}</option>
                  ))}
                </select>
              )}
              {!lessonsLoading && saveLessons.length === 0 && (
                <p className="mt-1.5 text-xs text-amber-600">Bu o'quv dasturda darslar topilmadi.</p>
              )}
            </div>
          )}

          {error && <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">{error}</p>}

          <div className="flex gap-3">
            <button
              onClick={() => { setShowSaveModal(false); setError(""); }}
              className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Bekor qilish
            </button>
            <button
              onClick={handleConfirmSave}
              disabled={!selLessonId || saving}
              className="flex-1 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 py-2.5 text-sm font-semibold text-white hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50"
            >
              {saving ? "Saqlanmoqda..." : "Saqlash"}
            </button>
          </div>
        </div>
      </div>
    )}
  </>);
};

const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

export const MatchingGame = ({ questions }) => {
  // questions: [{ left, right }]
  const pairs = questions.map((q, i) => ({ id: i, left: q.left, right: q.right }));
  const [leftItems] = useState(() => pairs.map((p) => ({ id: p.id, text: p.left })));
  const [rightItems] = useState(() => shuffle(pairs.map((p) => ({ id: p.id, text: p.right }))));
  const [selectedLeft, setSelectedLeft] = useState(null);
  const [matched, setMatched] = useState(new Set());
  const [wrongPair, setWrongPair] = useState(null);
  const [lines, setLines] = useState([]);

  const containerRef = useRef(null);
  const leftRefs = useRef({});
  const rightRefs = useRef({});

  const score = matched.size;
  const total = pairs.length;
  const isComplete = score === total && total > 0;

  useEffect(() => {
    if (matched.size === 0) {
      setLines([]);
      return;
    }
    requestAnimationFrame(() => {
      const container = containerRef.current;
      if (!container) return;
      const cRect = container.getBoundingClientRect();
      const newLines = [];
      matched.forEach((id) => {
        const leftEl = leftRefs.current[id];
        const rightEl = rightRefs.current[id];
        if (!leftEl || !rightEl) return;
        const lRect = leftEl.getBoundingClientRect();
        const rRect = rightEl.getBoundingClientRect();
        newLines.push({
          id,
          x1: lRect.right - cRect.left,
          y1: (lRect.top + lRect.bottom) / 2 - cRect.top,
          x2: rRect.left - cRect.left,
          y2: (rRect.top + rRect.bottom) / 2 - cRect.top,
        });
      });
      setLines(newLines);
    });
  }, [matched]);

  const handleLeftClick = (id) => {
    if (matched.has(id)) return;
    setWrongPair(null);
    setSelectedLeft((prev) => (prev === id ? null : id));
  };

  const handleRightClick = (id) => {
    if (matched.has(id) || selectedLeft === null) return;
    if (selectedLeft === id) {
      setMatched((prev) => new Set([...prev, id]));
      setSelectedLeft(null);
      setWrongPair(null);
      // addLine(id);
    } else {
      setWrongPair({ leftId: selectedLeft, rightId: id });
      setTimeout(() => { setWrongPair(null); setSelectedLeft(null); }, 700);
    }
  };

  const handleReset = () => {
    setMatched(new Set());
    setSelectedLeft(null);
    setWrongPair(null);
    // lines сбросится автоматически через useEffect
  };

  return (
    <div ref={containerRef} className="relative rounded-xl bg-white p-5 shadow-sm dark:bg-gray-800">
      {/* SVG connection lines drawn between matched pairs */}
      <svg className="pointer-events-none absolute inset-0 h-full w-full" style={{ zIndex: 0 }}>
        <defs>
          <marker id="arrow" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
            <circle cx="3" cy="3" r="2" fill="#22c55e" />
          </marker>
        </defs>
        {lines.map((line) => (
          <line
            key={line.id}
            x1={line.x1}
            y1={line.y1}
            x2={line.x2}
            y2={line.y2}
            stroke="#22c55e"
            strokeWidth="2"
            strokeDasharray="6 3"
            strokeLinecap="round"
            markerEnd="url(#arrow)"
          />
        ))}
      </svg>

      {/* Header */}
      <div className="relative mb-4 flex items-center justify-between" style={{ zIndex: 1 }}>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
          Chap elementni bosing, keyin o'ng tomondan mosini tanlang
        </p>
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-indigo-100 px-3 py-0.5 text-sm font-bold text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
            {score}/{total}
          </span>
          <button
            onClick={handleReset}
            className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <MdRefresh className="h-4 w-4" />
            Reset
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="relative mb-4 h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700" style={{ zIndex: 1 }}>
        <div
          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-green-500 transition-all duration-500"
          style={{ width: total > 0 ? `${(score / total) * 100}%` : "0%" }}
        />
      </div>

      {/* Complete banner */}
      {isComplete && (
        <div className="relative mb-4 flex items-center gap-2 rounded-xl bg-green-50 px-4 py-3 text-green-700 dark:bg-green-900/20 dark:text-green-400" style={{ zIndex: 1 }}>
          <MdCheckCircle className="h-5 w-5 flex-shrink-0" />
          <span className="font-semibold">Barcha juftliklar to'g'ri topildi! 🎉</span>
        </div>
      )}

      {/* Three columns: LEFT | gap for lines | RIGHT */}
      <div className="relative" style={{ zIndex: 1 }}>
        {/* Заголовки */}
        <div className="grid mb-1" style={{ gridTemplateColumns: "1fr 72px 1fr" }}>
          <p className="text-center text-xs font-semibold uppercase tracking-wider text-gray-400">Tushunchalar</p>
          <div />
          <p className="text-center text-xs font-semibold uppercase tracking-wider text-gray-400">Ta'riflar</p>
        </div>

        {/* Строки попарно — каждая строка одна высота */}
        <div className="flex flex-col gap-3">
          {leftItems.map((leftItem, rowIdx) => {
            const rightItem = rightItems[rowIdx];
            return (
              <div key={leftItem.id} className="grid items-stretch" style={{ gridTemplateColumns: "1fr 72px 1fr" }}>
                {/* LEFT */}
                <button
                  ref={(el) => { leftRefs.current[leftItem.id] = el; }}
                  onClick={() => handleLeftClick(leftItem.id)}
                  disabled={matched.has(leftItem.id)}
                  className={`flex items-center rounded-xl border-2 px-4 py-3 text-left text-sm font-medium transition-all duration-200 h-full ${matched.has(leftItem.id)
                    ? "cursor-default border-green-300 bg-green-50 text-green-800 dark:border-green-700 dark:bg-green-900/20 dark:text-green-300"
                    : wrongPair?.leftId === leftItem.id
                      ? "border-red-400 bg-red-50 text-red-800 dark:border-red-700 dark:bg-red-900/20 dark:text-red-300"
                      : selectedLeft === leftItem.id
                        ? "border-indigo-500 bg-indigo-50 text-indigo-800 shadow-md ring-2 ring-indigo-300 dark:border-indigo-400 dark:bg-indigo-900/30 dark:text-indigo-200"
                        : "border-gray-200 bg-white text-gray-700 hover:border-indigo-300 hover:bg-indigo-50/50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:border-indigo-500"
                    }`}
                >
                  <span className="flex items-center gap-2">
                    {matched.has(leftItem.id) && <MdCheckCircle className="h-4 w-4 flex-shrink-0 text-green-500" />}
                    {leftItem.text}
                  </span>
                </button>

                {/* Middle gap */}
                <div />

                {/* RIGHT */}
                {rightItem && (() => {
                  const isMatched = matched.has(rightItem.id);
                  const isWrong = wrongPair?.rightId === rightItem.id;
                  const canClick = selectedLeft !== null && !isMatched;
                  return (
                    <button
                      ref={(el) => { rightRefs.current[rightItem.id] = el; }}
                      onClick={() => handleRightClick(rightItem.id)}
                      disabled={!canClick}
                      className={`flex items-center rounded-xl border-2 px-4 py-3 text-left text-sm font-medium transition-all duration-200 h-full ${isMatched
                        ? "cursor-default border-green-300 bg-green-50 text-green-800 dark:border-green-700 dark:bg-green-900/20 dark:text-green-300"
                        : isWrong
                          ? "border-red-400 bg-red-50 text-red-800 dark:border-red-700 dark:bg-red-900/20 dark:text-red-300"
                          : canClick
                            ? "border-gray-200 bg-white text-gray-700 hover:border-green-400 hover:bg-green-50/50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:border-green-500"
                            : "cursor-not-allowed border-gray-200 bg-gray-50 text-gray-400 opacity-60 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-500"
                        }`}
                    >
                      <span className="flex items-center gap-2">
                        {isMatched && <MdCheckCircle className="h-4 w-4 flex-shrink-0 text-green-500" />}
                        {rightItem.text}
                      </span>
                    </button>
                  );
                })()}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

function buildCrosswordLayout(questions) {
  const GRID = 25;
  const center = Math.floor(GRID / 2);
  const cells = new Map();
  const placements = [];

  const get = (r, c) => cells.get(`${r},${c}`) ?? null;
  const set = (r, c, ch) => cells.set(`${r},${c}`, ch);
  const has = (r, c) => cells.has(`${r},${c}`);

  function canPlace(word, row, col, dir) {
    for (let i = 0; i < word.length; i++) {
      const r = dir === 'across' ? row : row + i;
      const c = dir === 'across' ? col + i : col;
      if (r < 0 || r >= GRID || c < 0 || c >= GRID) return false;
      const ex = get(r, c);
      if (ex !== null && ex !== word[i]) return false;
    }
    if (dir === 'across') {
      if (has(row, col - 1) || has(row, col + word.length)) return false;
    } else {
      if (has(row - 1, col) || has(row + word.length, col)) return false;
    }
    for (let i = 0; i < word.length; i++) {
      const r = dir === 'across' ? row : row + i;
      const c = dir === 'across' ? col + i : col;
      if (get(r, c) === null) {
        if (dir === 'across') {
          if (has(r - 1, c) || has(r + 1, c)) return false;
        } else {
          if (has(r, c - 1) || has(r, c + 1)) return false;
        }
      }
    }
    return true;
  }

  function doPlace(word, clue, row, col, dir) {
    for (let i = 0; i < word.length; i++) {
      const r = dir === 'across' ? row : row + i;
      const c = dir === 'across' ? col + i : col;
      set(r, c, word[i]);
    }
    placements.push({ word, clue, row, col, dir });
  }

  const words = questions
    .map(q => ({
      word: (q.correctAnswer || '').toUpperCase().replace(/[^A-Z]/g, ''),
      clue: q.question || ''
    }))
    .filter(w => w.word.length >= 2);

  if (words.length === 0)
    return { placements: [], cells, cellNumbers: new Map(), bounds: { minR: 0, maxR: 0, minC: 0, maxC: 0 } };

  doPlace(words[0].word, words[0].clue, center, center - Math.floor(words[0].word.length / 2), 'across');

  for (let wi = 1; wi < words.length; wi++) {
    const { word, clue } = words[wi];
    let placed = false;
    for (const pl of placements) {
      if (placed) break;
      const newDir = pl.dir === 'across' ? 'down' : 'across';
      for (let li = 0; li < word.length && !placed; li++) {
        for (let pi = 0; pi < pl.word.length && !placed; pi++) {
          if (word[li] === pl.word[pi]) {
            const row = pl.dir === 'across' ? pl.row - li : pl.row + pi;
            const col = pl.dir === 'across' ? pl.col + pi : pl.col - li;
            if (canPlace(word, row, col, newDir)) {
              doPlace(word, clue, row, col, newDir);
              placed = true;
            }
          }
        }
      }
    }
  }

  let minR = Infinity, maxR = -Infinity, minC = Infinity, maxC = -Infinity;
  for (const key of cells.keys()) {
    const [r, c] = key.split(',').map(Number);
    minR = Math.min(minR, r); maxR = Math.max(maxR, r);
    minC = Math.min(minC, c); maxC = Math.max(maxC, c);
  }

  const sorted = [...placements].sort((a, b) => a.row !== b.row ? a.row - b.row : a.col - b.col);
  const cellNumbers = new Map();
  let num = 1;
  for (const pl of sorted) {
    const key = `${pl.row},${pl.col}`;
    if (!cellNumbers.has(key)) cellNumbers.set(key, num++);
    pl.number = cellNumbers.get(key);
  }

  return { placements, cells, cellNumbers, bounds: { minR, maxR, minC, maxC } };
}

export const CrosswordGame = ({ questions, showAnswers = false }) => {
  const layout = useMemo(() => buildCrosswordLayout(questions), [questions]);
  const { placements, cells, cellNumbers, bounds } = layout;
  const [userInput, setUserInput] = useState({});
  const [checked, setChecked] = useState(false);
  const [revealed, setRevealed] = useState(false);

  if (placements.length === 0) {
    return (
      <div className="rounded-xl bg-white p-5 shadow-sm dark:bg-gray-800">
        <p className="text-sm text-gray-400">Krossvord yaratilmadi — so'zlar topilmadi.</p>
      </div>
    );
  }

  const { minR, maxR, minC, maxC } = bounds;
  const numRows = maxR - minR + 1;
  const numCols = maxC - minC + 1;

  const handleInput = (r, c, val) => {
    if (revealed) return;
    const letter = val.replace(/[^A-Za-z]/g, '').toUpperCase().slice(-1);
    setUserInput(prev => ({ ...prev, [`${r},${c}`]: letter }));
    if (checked) setChecked(false);
  };

  const effectiveInput = revealed
    ? Object.fromEntries([...cells.entries()].map(([k, v]) => [k, v]))
    : userInput;

  const totalCells = cells.size;
  const correctCells = checked
    ? [...cells.entries()].filter(([k, v]) => userInput[k] === v).length
    : 0;
  const isComplete = checked && correctCells === totalCells;

  const across = placements.filter(p => p.dir === 'across').sort((a, b) => a.number - b.number);
  const down = placements.filter(p => p.dir === 'down').sort((a, b) => a.number - b.number);

  return (
    <div className="rounded-xl bg-white p-5 shadow-sm dark:bg-gray-800 space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
          {placements.length} ta so'z
        </p>
        <div className="flex items-center gap-2 flex-wrap">
          {checked && !revealed && (
            <span className={`rounded-full px-3 py-0.5 text-sm font-bold ${isComplete
                ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
                : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
              }`}>
              {correctCells}/{totalCells}
            </span>
          )}
          {showAnswers && (
            <button
              onClick={() => { setRevealed(r => !r); setChecked(false); }}
              className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${revealed
                  ? 'bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-300'
                  : 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-300'
                }`}
            >
              {revealed ? '🙈 Yashirish' : '🔑 Javoblarni ko\'rsatish'}
            </button>
          )}
          <button
            onClick={() => { setUserInput({}); setChecked(false); setRevealed(false); }}
            className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <MdRefresh className="h-4 w-4" /> Reset
          </button>
          {!revealed && (
            <button
              onClick={() => setChecked(true)}
              className="flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-indigo-700"
            >
              <MdCheckCircle className="h-4 w-4" /> Tekshirish
            </button>
          )}
        </div>
      </div>

      {revealed && (
        <div className="flex items-center gap-2 rounded-xl bg-amber-50 px-4 py-3 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400">
          <span className="text-base">🔑</span>
          <span className="font-semibold text-sm">O'qituvchi rejimi — to'g'ri javoblar ko'rsatilmoqda</span>
        </div>
      )}

      {isComplete && !revealed && (
        <div className="flex items-center gap-2 rounded-xl bg-green-50 px-4 py-3 text-green-700 dark:bg-green-900/20 dark:text-green-400">
          <MdCheckCircle className="h-5 w-5 flex-shrink-0" />
          <span className="font-semibold">Barcha so'zlar to'g'ri! 🎉</span>
        </div>
      )}

      <div className="flex flex-col gap-5 xl:flex-row xl:items-start">
        {/* Grid */}
        <div className="overflow-x-auto flex-shrink-0">
          <div
            className="inline-grid gap-0.5"
            style={{ gridTemplateColumns: `repeat(${numCols}, 40px)` }}
          >
            {Array.from({ length: numRows }, (_, ri) =>
              Array.from({ length: numCols }, (_, ci) => {
                const r = ri + minR;
                const c = ci + minC;
                const key = `${r},${c}`;
                const isActive = cells.has(key);
                const cellNum = cellNumbers.get(key);

                if (!isActive) {
                  return <div key={key} className="w-10 h-10 bg-gray-800 dark:bg-gray-950 rounded-sm" />;
                }

                const correctLetter = cells.get(key);
                const displayLetter = effectiveInput[key] || '';
                const isCorrect = !revealed && checked && displayLetter === correctLetter;
                const isWrong = !revealed && checked && displayLetter.length > 0 && displayLetter !== correctLetter;

                return (
                  <div key={key} className="relative w-10 h-10">
                    {cellNum && (
                      <span className="absolute top-0.5 left-1 text-[12px] font-bold text-gray-500 dark:text-gray-400 leading-none z-10 select-none">
                        {cellNum}
                      </span>
                    )}
                    <input
                      value={displayLetter}
                      readOnly={revealed}
                      onChange={e => handleInput(r, c, e.target.value)}
                      className={`w-full h-full text-center text-sm font-bold uppercase border-2 rounded-sm focus:outline-none transition-colors pt-2 ${revealed
                          ? 'bg-amber-50 border-amber-300 text-amber-800 dark:bg-amber-900/30 dark:border-amber-600 dark:text-amber-200 cursor-default'
                          : isCorrect
                            ? 'bg-green-100 border-green-400 text-green-800 dark:bg-green-900/30 dark:border-green-600 dark:text-green-300'
                            : isWrong
                              ? 'bg-red-100 border-red-400 text-red-800 dark:bg-red-900/30 dark:border-red-600 dark:text-red-300'
                              : 'bg-white border-gray-300 text-gray-900 hover:border-indigo-400 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-500 dark:text-white'
                        }`}
                    />
                  </div>
                );
              })
            ).flat()}
          </div>
        </div>

        {/* Clues — beside the grid on wide screens */}
        <div className="flex-1 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-1">
          {across.length > 0 && (
            <div>
              <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-400">→ Gorizontal</h4>
              <div className="space-y-1.5">
                {across.map(p => (
                  <div key={`a-${p.number}`} className="flex gap-2 text-sm">
                    <span className="flex-shrink-0 font-bold text-indigo-600 dark:text-indigo-400 min-w-[20px]">{p.number}.</span>
                    <span className="text-gray-700 dark:text-gray-300">{p.clue}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {down.length > 0 && (
            <div>
              <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-400">↓ Vertikal</h4>
              <div className="space-y-1.5">
                {down.map(p => (
                  <div key={`d-${p.number}`} className="flex gap-2 text-sm">
                    <span className="flex-shrink-0 font-bold text-purple-600 dark:text-purple-400 min-w-[20px]">{p.number}.</span>
                    <span className="text-gray-700 dark:text-gray-300">{p.clue}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── TABLE preview (teacher read-only view) ────────────────────────────────
export const TablePreview = ({ tableData, showAnswers = true }) => {
  const data = React.useMemo(() => {
    if (!tableData) return null;
    try {
      return typeof tableData === "string" ? JSON.parse(tableData) : tableData;
    } catch { return null; }
  }, [tableData]);

  if (!data || !data.columns) return null;
  const { columns, rows, answers } = data;

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="bg-indigo-50 dark:bg-indigo-900/20">
            {columns.map((col, i) => (
              <th key={i} className="border-b border-gray-200 px-4 py-3 text-left font-semibold text-indigo-700 dark:border-gray-700 dark:text-indigo-300">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {(rows || []).map((row, ri) => (
            <tr key={ri} className={ri % 2 === 0 ? "bg-white dark:bg-gray-800" : "bg-gray-50 dark:bg-gray-900/40"}>
              {row.map((cell, ci) => (
                <td key={ci} className="border-b border-gray-100 px-4 py-3 dark:border-gray-700">
                  {cell === "" ? (
                    showAnswers ? (
                      <span className="rounded bg-green-100 px-2 py-0.5 font-medium text-green-700 dark:bg-green-900/30 dark:text-green-300">
                        {answers?.[ri]?.[ci] || ""}
                      </span>
                    ) : (
                      <span className="italic text-gray-400">bo'sh</span>
                    )
                  ) : (
                    <span className="font-medium text-gray-800 dark:text-gray-200">{cell}</span>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export const OPTION_COLORS = {
  A: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800",
  B: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800",
  C: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800",
  D: "bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-900/20 dark:text-pink-300 dark:border-pink-800",
};

export const QuestionCard = ({ index, question, isTest }) => {
  const options = isTest
    ? [
      { key: "A", value: question.optionA },
      { key: "B", value: question.optionB },
      { key: "C", value: question.optionC },
      { key: "D", value: question.optionD },
    ].filter((o) => o.value)
    : [];

  return (
    <div className="rounded-xl bg-white p-5 shadow-sm dark:bg-gray-800">
      <div className="mb-3 flex items-start gap-3">
        <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-sm font-bold text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
          {index}
        </span>
        <p className="font-medium leading-relaxed text-gray-800 dark:text-gray-100">
          {question.question}
        </p>
      </div>

      {isTest && options.length > 0 && (
        <div className="ml-10 mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {options.map(({ key, value }) => {
            const isCorrect = question.correctAnswer === key;
            return (
              <div
                key={key}
                className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${isCorrect
                  ? "border-green-300 bg-green-50 text-green-800 dark:border-green-700 dark:bg-green-900/20 dark:text-green-300"
                  : OPTION_COLORS[key]
                  }`}
              >
                <span className="font-bold">{key}.</span>
                <span className="flex-1">{value}</span>
                {isCorrect && <MdCheckCircle className="h-4 w-4 flex-shrink-0 text-green-600" />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AiTaskPage;
