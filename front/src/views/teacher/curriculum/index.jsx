import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { baseUrl } from "../../../config";
import { useNavigate } from "react-router-dom";
import ApiCall from "../../../config";
import { isUuid } from "../../../config";
import {
  MdAdd, MdEdit, MdDelete, MdSearch, MdClose, MdExpandMore,
  MdCheckBox, MdCheckBoxOutlineBlank, MdAutoAwesome, MdUploadFile,
  MdCheckCircle, MdRefresh, MdOutlineTask, MdShare, MdPerson,
} from "react-icons/md";
import { TablePreview } from "../ai-task/AiTask";
import { ContinueTextPreview } from "../ai-task/ContinueTextGame";

const AI_TASK_TYPES = [
  { key: "TEST", label: "Test", emoji: "📝", soon: false },
  { key: "CROSSWORD", label: "Krossvord", emoji: "🔠", soon: false },
  { key: "TABLE", label: "Jadval", emoji: "📊", soon: false },
  { key: "MATCHING", label: "Moslik topish", emoji: "🔗", soon: false },
  { key: "CONTINUE_TEXT", label: "Gapni davom ettir", emoji: "✏️", soon: false },
  { key: "ESSAY", label: "Insho", emoji: "📖", soon: true },
  { key: "ORAL", label: "Og'zaki savol", emoji: "🎤", soon: true },
  { key: "PRACTICAL", label: "Amaliy", emoji: "🛠️", soon: true },
  { key: "DIAGRAM", label: "Diagramma", emoji: "📈", soon: true },
];

const TeacherCurriculum = () => {
  const navigate = useNavigate();
  const [curriculums, setCurriculums] = useState([]);
  const [groups, setGroups] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [userId, setUserId] = useState(null);
  const [formData, setFormData] = useState({ name: "", userId: "", groupsIds: [], subjectsId: "" });
  const [groupsOpen, setGroupsOpen] = useState(false);
  const groupsDropRef = useRef(null);

  // ── AI Task generation ──────────────────────────────────────────────────────
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiFile, setAiFile] = useState(null);
  const [aiType, setAiType] = useState("TEST");
  const [aiTopic, setAiTopic] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [aiResult, setAiResult] = useState(null);
  const [aiSaving, setAiSaving] = useState(false);
  const [aiSaved, setAiSaved] = useState(false);
  const [aiCurriculumId, setAiCurriculumId] = useState("");
  const [aiLessonId, setAiLessonId] = useState("");
  const [aiLessons, setAiLessons] = useState([]);
  const [aiLessonsLoading, setAiLessonsLoading] = useState(false);
  // ── Share state ──────────────────────────────────────────────────────
  const [aiSavedTaskId, setAiSavedTaskId] = useState(null);
  const [allTeachers, setAllTeachers] = useState([]);
  const [selectedTeacherIds, setSelectedTeacherIds] = useState([]);
  const [shareLoading, setShareLoading] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);
  const [shareError, setShareError] = useState("");
  const aiFileRef = useRef(null);

  // Fetch lessons when a curriculum is selected in the AI modal
  useEffect(() => {
    if (!aiCurriculumId) { setAiLessons([]); setAiLessonId(""); return; }
    setAiLessonsLoading(true);
    setAiLessonId("");
    ApiCall(`/api/v1/lessons/curriculm/${aiCurriculumId}`, "GET", null)
      .then((r) => setAiLessons(Array.isArray(r.data) ? r.data : []))
      .catch(() => setAiLessons([]))
      .finally(() => setAiLessonsLoading(false));
  }, [aiCurriculumId]);

  const resetAiModal = () => {
    setAiFile(null); setAiType("TEST"); setAiTopic("");
    setAiError(""); setAiResult(null); setAiSaving(false); setAiSaved(false);
    setAiCurriculumId(""); setAiLessonId(""); setAiLessons([]);
    setAiSavedTaskId(null); setSelectedTeacherIds([]); setShareSuccess(false); setShareError("");
    if (aiFileRef.current) aiFileRef.current.value = "";
  };

  const handleAiGenerate = async () => {
    if (!aiFile) { setAiError("Fayl tanlang"); return; }
    if (!aiLessonId) { setAiError("Dars tanlang"); return; }
    setAiLoading(true); setAiError(""); setAiResult(null);
    try {
      const fd = new FormData();
      fd.append("file", aiFile);
      fd.append("type", aiType);
      if (aiTopic.trim()) fd.append("topic", aiTopic.trim());
      const token = localStorage.getItem("access_token");
      const res = await axios.post(`${baseUrl}/api/v1/ai/generate-task`, fd, {
        headers: { Authorization: token, "Content-Type": "multipart/form-data" },
        timeout: 120000,
      });
      setAiResult(res.data);
    } catch (err) {
      setAiError(err?.response?.data?.message || "Savollarni generatsiya qilishda xatolik yuz berdi.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleAiSave = async () => {
    if (!aiResult || !userId || !aiLessonId) return;
    setAiSaving(true); setAiError("");
    try {
      const payload = {
        title: aiResult.title,
        type: aiType,
        questions: (aiResult.questions || []).map((q) => ({
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
      const res = await ApiCall(`/api/v1/task/save/${userId}/${aiLessonId}`, "POST", payload);
      if (res?.data?.id) setAiSavedTaskId(res.data.id);
      setAiSaved(true);
      if (allTeachers.length === 0) {
        ApiCall("/api/v1/admin/users/teachers", "GET", null)
          .then((r) => setAllTeachers(Array.isArray(r.data) ? r.data.filter((t) => String(t.id) !== String(userId)) : []))
          .catch(() => {});
      }
    } catch {
      setAiError("Saqlashda xatolik yuz berdi.");
    } finally {
      setAiSaving(false);
    }
  };

  const handleAiShare = async () => {
    if (!aiSavedTaskId || selectedTeacherIds.length === 0) return;
    setShareLoading(true); setShareError("");
    try {
      await ApiCall(`/api/v1/task/${aiSavedTaskId}/share`, "POST", { teacherIds: selectedTeacherIds });
      setShareSuccess(true);
    } catch {
      setShareError("Ulashishda xatolik yuz berdi.");
    } finally {
      setShareLoading(false);
    }
  };

  const toggleTeacher = (id) => {
    setSelectedTeacherIds((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => { if (groupsDropRef.current && !groupsDropRef.current.contains(e.target)) setGroupsOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => { fetchGroups(); fetchSubjects(); }, []);
  const getAdmin = async () => {
    let token = localStorage.getItem("access_token");
    try {
      const response = await ApiCall("/api/v1/auth/decode1?token=" + token, "GET", null);
      setUserId(response.data?.id);

    } catch (error) {
      console.error("Error fetching account data:", error);
    }
  };

  useEffect(() => {
    getAdmin();
  }, []);

  useEffect(() => {
    if (isUuid(userId)) {
      fetchCurriculums();
    }
  }, [userId]);
  const fetchCurriculums = async () => {
    try { setLoading(true); const r = await ApiCall("/api/v1/curriculums/user/" + userId, "GET", null); setCurriculums(Array.isArray(r.data) ? r.data : []); setError(""); }
    catch (err) { console.error(err); setCurriculums([]); setError("O'quv dasturlarni yuklashda xatolik"); } finally { setLoading(false); }
  };
  const fetchGroups = async () => { try { const r = await ApiCall("/api/v1/groups", "GET", null); setGroups(Array.isArray(r.data) ? r.data : []); } catch { setGroups([]); } };
  const fetchSubjects = async () => { try { const r = await ApiCall("/api/v1/subjects", "GET", null); setSubjects(Array.isArray(r.data) ? r.data : []); } catch { setSubjects([]); } };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.groupsIds.length === 0) { setError("Kamida bitta guruh tanlang"); return; }
    try {
      setLoading(true);
      if (editingId) {
        const data = { ...formData, userId, groupsId: formData.groupsIds[0] };
        await ApiCall(`/api/v1/curriculums/${editingId}`, "PUT", data);
      } else {
        // Single POST — backend now natively stores multiple groups via ManyToMany
        await ApiCall("/api/v1/curriculums", "POST", { ...formData, userId, groupsIds: formData.groupsIds });
      }
      setFormData({ name: "", userId: "", groupsIds: [], subjectsId: "" }); setEditingId(null); setShowForm(false); fetchCurriculums();
    } catch (err) { console.error(err); setError("O'quv dasturini saqlashda xatolik"); } finally { setLoading(false); }
  };
  const handleEdit = (c) => { setFormData({ name: c.name, userId: userId, groupsIds: c.groupsIds || (c.groupsId ? [c.groupsId] : []), subjectsId: c.subjectsId || "" }); setEditingId(c.id); setShowForm(true); };
  const toggleGroup = (id) => { setFormData((prev) => ({ ...prev, groupsIds: prev.groupsIds.includes(id) ? prev.groupsIds.filter((g) => g !== id) : [...prev.groupsIds, id] })); };
  const handleDelete = async (id) => {
    if (window.confirm("O'quv dasturini o'chirishni tasdiqlaysizmi?")) {
      try { setLoading(true); await ApiCall(`/api/v1/curriculums/${id}`, "DELETE", null); fetchCurriculums(); }
      catch (err) { console.error(err); setError("O'chirishda xatolik"); } finally { setLoading(false); }
    }
  };

  const filteredCurriculums = curriculums.filter((c) => (c.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()));
  const getGroupName = (id) => groups.find((g) => g.id === id)?.name || "—";
  const getSubjectName = (id) => subjects.find((s) => s.id === id)?.name || "—";

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div><h1 className="text-3xl font-bold text-gray-900 dark:text-white">📖 O'quv dasturlari</h1><p className="mt-2 text-gray-600 dark:text-gray-400">{curriculums.length} ta o'quv dasturi</p></div>
        <div className="flex flex-wrap items-center gap-3">
          <button onClick={() => { resetAiModal(); setShowAiModal(true); }}
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-3 font-semibold text-white shadow-lg shadow-indigo-500/30 transition-all hover:shadow-indigo-500/50">
            <MdAutoAwesome className="h-5 w-5" /> AI Task
          </button>
          <button onClick={() => { setFormData({ name: "", userId: "", groupsIds: [], subjectsId: "" }); setEditingId(null); setGroupsOpen(false); setShowForm(true); }}
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-green-600 to-teal-700 px-6 py-3 font-semibold text-white shadow-lg shadow-green-500/30 transition-all hover:shadow-green-500/50"><MdAdd className="h-5 w-5" /> Yangi dastur</button>
        </div>
      </div>
      {error && <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-900/20 dark:text-red-400">{error}</div>}
      <div className="relative"><MdSearch className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
        <input type="text" placeholder="O'quv dasturlarini qidirish..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-lg border border-gray-300 bg-white py-3 pl-12 pr-4 text-gray-900 placeholder:text-gray-400 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white" /></div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowForm(false)}>
          <div className="relative max-h-[90vh] w-full max-w-md space-y-6 overflow-y-auto rounded-2xl border border-gray-200 bg-white p-8 shadow-2xl dark:border-gray-700 dark:bg-gray-800" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowForm(false)} className="absolute right-4 top-4 rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"><MdClose className="h-6 w-6" /></button>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{editingId ? "Tahrirlash" : "Yangi o'quv dasturi"}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div ref={groupsDropRef}><label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">Guruh{!editingId && " (bir yoki bir nechta)"}</label>
                {/* Custom multi-select */}
                <div className="relative">
                  <button type="button" onClick={() => setGroupsOpen((p) => !p)}
                    className={`flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:bg-gray-700 dark:text-white ${formData.groupsIds.length === 0 ? "border-gray-300 text-gray-400 dark:border-gray-600" : "border-green-400 text-gray-900 dark:border-green-600"
                      }`}>
                    <span className="truncate">
                      {formData.groupsIds.length === 0
                        ? "Guruh tanlang"
                        : formData.groupsIds.length === 1
                          ? groups.find((g) => g.id === formData.groupsIds[0])?.name || "1 ta guruh"
                          : `${formData.groupsIds.length} ta guruh tanlandi`}
                    </span>
                    <MdExpandMore className={`h-5 w-5 flex-shrink-0 text-gray-400 transition-transform ${groupsOpen ? "rotate-180" : ""}`} />
                  </button>
                  {groupsOpen && (
                    <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-52 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-xl dark:border-gray-600 dark:bg-gray-700">
                      {groups.length === 0 && <p className="px-4 py-3 text-sm text-gray-400">Guruhlar topilmadi</p>}
                      {groups.map((g) => {
                        const checked = formData.groupsIds.includes(g.id);
                        return (
                          <button key={g.id} type="button"
                            onClick={() => { toggleGroup(g.id); if (editingId) setGroupsOpen(false); }}
                            className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors hover:bg-green-50 dark:hover:bg-green-900/20 ${checked ? "bg-green-50 dark:bg-green-900/20" : ""
                              }`}>
                            {checked
                              ? <MdCheckBox className="h-5 w-5 flex-shrink-0 text-green-600" />
                              : <MdCheckBoxOutlineBlank className="h-5 w-5 flex-shrink-0 text-gray-400" />}
                            <span className={checked ? "font-semibold text-green-800 dark:text-green-300" : "text-gray-700 dark:text-gray-200"}>{g.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
                {/* Selected chips */}
                {formData.groupsIds.length > 1 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {formData.groupsIds.map((id) => (
                      <span key={id} className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-800 dark:bg-green-900/40 dark:text-green-300">
                        {groups.find((g) => g.id === id)?.name || id}
                        <button type="button" onClick={() => toggleGroup(id)} className="ml-0.5 rounded-full hover:text-green-600"><MdClose className="h-3.5 w-3.5" /></button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div><label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">Fan</label>
                <select value={formData.subjectsId} onChange={(e) => setFormData({ ...formData, subjectsId: e.target.value })} required className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"><option value="">Fan tanlang</option>{subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
              <div className="flex gap-3 pt-4">
                <button type="submit" disabled={loading} className="flex-1 rounded-lg bg-gradient-to-r from-green-600 to-teal-700 px-4 py-3 font-semibold text-white shadow-lg transition-all hover:shadow-green-500/50 disabled:opacity-50">{loading ? "Saqlanmoqda..." : "Saqlash"}</button>
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 rounded-lg border border-gray-300 px-4 py-3 font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">Bekor qilish</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAiModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-4 pt-10"
          onClick={() => { if (!aiLoading) setShowAiModal(false); }}>
          <div className="relative w-full max-w-2xl rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-900"
            onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between rounded-t-2xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
              <div className="flex items-center gap-3 text-white">
                <MdAutoAwesome className="h-6 w-6" />
                <span className="text-lg font-bold">AI Task Generatsiya</span>
              </div>
              {!aiLoading && (
                <button onClick={() => setShowAiModal(false)}
                  className="rounded-lg p-1.5 text-white/70 hover:bg-white/20 hover:text-white">
                  <MdClose className="h-5 w-5" />
                </button>
              )}
            </div>

            <div className="space-y-5 p-6">
              {/* Error */}
              {aiError && (
                <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
                  <span className="flex-1">{aiError}</span>
                  <button onClick={() => setAiError("")} className="flex-shrink-0"><MdClose className="h-4 w-4" /></button>
                </div>
              )}

              {/* Saved state */}
              {aiSaved ? (
                <div className="flex flex-col items-center gap-4 py-6 text-center">
                  <MdCheckCircle className="h-16 w-16 text-green-500" />
                  <p className="text-xl font-bold text-gray-800 dark:text-white">Vazifa muvaffaqiyatli saqlandi!</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    "{aiResult?.title}" — {(aiResult?.questions || []).length} ta savol
                  </p>

                  {/* Share section */}
                  <div className="mt-2 w-full rounded-xl border border-indigo-200 bg-indigo-50 p-4 text-left dark:border-indigo-700/50 dark:bg-indigo-900/10">
                    <div className="mb-3 flex items-center gap-2">
                      <MdShare className="h-4 w-4 text-indigo-600" />
                      <p className="text-sm font-semibold text-indigo-800 dark:text-indigo-300">Boshqa o'qituvchilar bilan ulashish</p>
                    </div>

                    {shareSuccess ? (
                      <div className="flex items-center gap-2 rounded-lg bg-green-100 px-3 py-2 text-sm font-semibold text-green-700 dark:bg-green-900/20 dark:text-green-300">
                        <MdCheckCircle className="h-4 w-4" />
                        {selectedTeacherIds.length} ta o'qituvchi bilan ulashildi ✅
                      </div>
                    ) : (
                      <>
                        {shareError && (
                          <p className="mb-2 text-xs text-red-600 dark:text-red-400">{shareError}</p>
                        )}
                        {allTeachers.length === 0 ? (
                          <p className="text-xs text-gray-400">O'qituvchilar yuklanmoqda...</p>
                        ) : (
                          <div className="mb-3 max-h-40 space-y-1 overflow-y-auto rounded-lg border border-indigo-100 bg-white p-2 dark:border-indigo-800 dark:bg-gray-800">
                            {allTeachers.map((t) => {
                              const checked = selectedTeacherIds.includes(t.id);
                              return (
                                <button key={t.id} type="button" onClick={() => toggleTeacher(t.id)}
                                  className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                                    checked ? "bg-indigo-50 dark:bg-indigo-900/20" : "hover:bg-gray-50 dark:hover:bg-gray-700"
                                  }`}>
                                  {checked
                                    ? <MdCheckBox className="h-4 w-4 flex-shrink-0 text-indigo-600" />
                                    : <MdCheckBoxOutlineBlank className="h-4 w-4 flex-shrink-0 text-gray-400" />}
                                  <MdPerson className="h-4 w-4 flex-shrink-0 text-gray-400" />
                                  <span className={checked ? "font-semibold text-indigo-800 dark:text-indigo-300" : "text-gray-700 dark:text-gray-200"}>
                                    {t.name || t.phone}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        )}
                        <button
                          onClick={handleAiShare}
                          disabled={shareLoading || selectedTeacherIds.length === 0}
                          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2.5 text-sm font-semibold text-white shadow hover:from-indigo-500 hover:to-purple-500 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {shareLoading
                            ? <><div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" /> Ulashilmoqda...</>
                            : <><MdShare className="h-4 w-4" /> {selectedTeacherIds.length > 0 ? `${selectedTeacherIds.length} ta o'qituvchiga ulashish` : "O'qituvchi tanlang"}</>}
                        </button>
                      </>
                    )}
                  </div>

                  <div className="flex gap-3 pt-1">
                    <button onClick={() => { resetAiModal(); setShowAiModal(true); }}
                      className="flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700">
                      <MdRefresh className="h-4 w-4" /> Yangi generatsiya
                    </button>
                    <button onClick={() => setShowAiModal(false)}
                      className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800">
                      Yopish
                    </button>
                  </div>
                </div>

              ) : aiResult ? (
                /* Preview of generated task */
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">{aiResult.title}</h3>
                    <span className="rounded-full bg-indigo-100 px-3 py-0.5 text-xs font-bold text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
                      {(aiResult.questions || []).length} ta savol
                    </span>
                  </div>

                  <div className="max-h-96 overflow-y-auto space-y-3 pr-1">
                    {aiType === "TABLE" ? (
                      <TablePreview tableData={aiResult.questions?.[0]?.question} showAnswers={true} />
                    ) : aiType === "CONTINUE_TEXT" ? (
                      <ContinueTextPreview questions={aiResult.questions || []} />
                    ) : (aiResult.questions || []).map((q, i) => (
                      <div key={i} className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
                        <p className="mb-1 text-xs font-bold text-indigo-500">#{i + 1}</p>
                        {q.left && q.right ? (
                          /* MATCHING */
                          <div className="flex items-center gap-2 text-sm">
                            <span className="flex-1 rounded-lg bg-blue-50 px-3 py-1.5 font-medium text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">{q.left}</span>
                            <span className="text-gray-400">↔</span>
                            <span className="flex-1 rounded-lg bg-green-50 px-3 py-1.5 font-medium text-green-800 dark:bg-green-900/20 dark:text-green-300">{q.right}</span>
                          </div>
                        ) : (
                          <>
                            {q.question && <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{q.question}</p>}
                            {/* TEST options */}
                            {q.optionA && (
                              <div className="mt-2 grid grid-cols-2 gap-1.5 text-xs">
                                {["optionA", "optionB", "optionC", "optionD"].map((opt, oi) => q[opt] && (
                                  <span key={opt}
                                    className={`rounded-lg px-2.5 py-1.5 font-medium border ${q.correctAnswer === String.fromCharCode(65 + oi)
                                      ? "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700"
                                      : "bg-white text-gray-700 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600"
                                      }`}>
                                    {String.fromCharCode(65 + oi)}. {q[opt]}
                                  </span>
                                ))}
                              </div>
                            )}
                            {/* CROSSWORD / other correct answer */}
                            {q.correctAnswer && !q.optionA && (
                              <p className="mt-1 text-xs font-semibold text-green-700 dark:text-green-400">Javob: {q.correctAnswer}</p>
                            )}
                          </>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-3 border-t border-gray-200 pt-4 dark:border-gray-700">
                    <button onClick={handleAiSave} disabled={aiSaving}
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 px-5 py-3 font-semibold text-white shadow hover:from-green-400 hover:to-emerald-500 disabled:opacity-50">
                      {aiSaving
                        ? <><div className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" /> Saqlanmoqda...</>
                        : <><MdOutlineTask className="h-5 w-5" /> Vazifani saqlash</>}
                    </button>
                    <button onClick={() => { setAiResult(null); setAiError(""); }}
                      className="flex items-center gap-2 rounded-xl border border-gray-300 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800">
                      <MdRefresh className="h-4 w-4" /> Qayta
                    </button>
                  </div>
                </div>

              ) : (
                /* Generate form */
                <div className="space-y-5">
                  {/* Curriculum + Lesson selector */}
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">O'quv dastur *</label>
                      <select
                        value={aiCurriculumId}
                        onChange={(e) => setAiCurriculumId(e.target.value)}
                        className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                      >
                        <option value="">Tanlang...</option>
                        {curriculums.map((c) => (
                          <option key={c.id} value={c.id}>
                            {getSubjectName(c.subjectsId)}
                            {(c.groupsIds || []).length > 0 ? ` – ${getGroupName(c.groupsIds[0])}` : ""}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">Dars *</label>
                      <select
                        value={aiLessonId}
                        onChange={(e) => setAiLessonId(e.target.value)}
                        disabled={!aiCurriculumId || aiLessonsLoading}
                        className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white disabled:opacity-50"
                      >
                        <option value="">{aiLessonsLoading ? "Yuklanmoqda..." : "Dars tanlang"}</option>
                        {aiLessons.map((l) => (
                          <option key={l.id} value={l.id}>{l.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* File upload */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">Fayl yuklash *</label>
                    <div
                      className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-8 cursor-pointer transition-colors ${aiFile
                        ? "border-indigo-400 bg-indigo-50 dark:border-indigo-600 dark:bg-indigo-900/20"
                        : "border-gray-300 bg-gray-50 hover:border-indigo-400 hover:bg-indigo-50/40 dark:border-gray-600 dark:bg-gray-800"
                        }`}
                      onClick={() => aiFileRef.current?.click()}
                    >
                      <input ref={aiFileRef} type="file"
                        accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.png,.jpg,.jpeg"
                        className="hidden"
                        onChange={(e) => { setAiFile(e.target.files[0] || null); setAiResult(null); setAiError(""); }}
                      />
                      {aiFile ? (
                        <>
                          <MdCheckCircle className="h-10 w-10 text-indigo-500" />
                          <p className="mt-2 text-sm font-semibold text-indigo-700 dark:text-indigo-300">{aiFile.name}</p>
                          <p className="text-xs text-indigo-500">{(aiFile.size / 1024).toFixed(1)} KB</p>
                          <button type="button"
                            onClick={(e) => { e.stopPropagation(); setAiFile(null); if (aiFileRef.current) aiFileRef.current.value = ""; }}
                            className="mt-2 text-xs text-red-500 hover:text-red-700">Olib tashlash</button>
                        </>
                      ) : (
                        <>
                          <MdUploadFile className="h-10 w-10 text-gray-400" />
                          <p className="mt-2 text-sm font-semibold text-gray-600 dark:text-gray-300">Fayl tanlash uchun bosing</p>
                          <p className="mt-1 text-xs text-gray-400">PDF, DOCX, PPTX, TXT, PNG, JPG — maks 20MB</p>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Task type */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">Vazifa turi *</label>
                    <div className="grid grid-cols-3 gap-2">
                      {AI_TASK_TYPES.map((t) => (
                        <button key={t.key} type="button" onClick={() => {
                          if (!t.soon) setAiType(t.key);
                        }}
                          className={`flex flex-col items-center gap-1 rounded-xl border-2 px-2 py-3 text-xs font-semibold transition-all ${!t.soon && aiType === t.key
                            ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:border-indigo-400 dark:bg-indigo-900/30 dark:text-indigo-300"
                            : "border-gray-200 bg-white text-gray-600 hover:border-indigo-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
                            }`}>
                          <span className="text-lg">{t.emoji}</span>

                          <span>{t.label}</span>


                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Topic */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Mavzu <span className="font-normal text-gray-400">(ixtiyoriy)</span>
                    </label>
                    <input type="text" value={aiTopic} onChange={(e) => setAiTopic(e.target.value)}
                      placeholder="Masalan: Fotosintez, Iqtisodiyot asoslari..."
                      className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white" />
                  </div>

                  {/* Generate */}
                  <button onClick={handleAiGenerate} disabled={aiLoading || !aiFile}
                    className="flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 font-bold text-white shadow-lg shadow-indigo-500/30 hover:from-indigo-500 hover:to-purple-500 disabled:cursor-not-allowed disabled:opacity-50">
                    {aiLoading ? (
                      <><div className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" /> AI yaratmoqda... (1–2 daqiqa)</>
                    ) : (
                      <><MdAutoAwesome className="h-5 w-5" /> Savollarni generatsiya qilish</>
                    )}
                  </button>
                  {aiLoading && (
                    <p className="text-center text-xs text-gray-400">Gemini AI fayl ustida ishlayapti. Iltimos kuting...</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {filteredCurriculums.length === 0 && !loading && <div className="rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 p-12 text-center dark:border-gray-600 dark:bg-gray-800/50"><div className="mb-4 text-4xl">📭</div><p className="text-lg font-semibold text-gray-900 dark:text-white">O'quv dasturlari topilmadi</p></div>}

      {filteredCurriculums.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCurriculums.map((c) => (
            <div key={c.id} className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-lg dark:border-gray-700 dark:bg-gray-800">
              <div className="mb-4 cursor-pointer" onClick={() => navigate(`/teacher/curriculum/${c.id}`)}>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{getSubjectName(c.subjectsId)}</h3>
                <div className="mt-3 space-y-2">
                  <div className="flex items-center gap-2"><span className="text-xl">👥</span><div><p className="text-xs text-gray-500">Guruhlar</p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {(c.groupsIds || (c.groupsId ? [c.groupsId] : [])).map(gid => (
                        <span key={gid} className="inline-flex rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-800 dark:bg-green-900/40 dark:text-green-300">{getGroupName(gid)}</span>
                      ))}
                      {(c.groupsIds?.length || 0) === 0 && !c.groupsId && <span className="text-sm font-semibold text-gray-500">—</span>}
                    </div></div></div>
                </div>
              </div>
              <div className="flex gap-2 border-t border-gray-200 pt-4 dark:border-gray-700">
                <button onClick={() => navigate(`/teacher/curriculum/${c.id}`)} className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-blue-100 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400">📖 Darslar</button>
                <button onClick={() => handleEdit(c)} className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-green-100 px-3 py-2 text-sm font-medium text-green-600 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400"><MdEdit className="h-4 w-4" /> Tahrirlash</button>
                <button onClick={() => handleDelete(c.id)} className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-red-100 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400"><MdDelete className="h-4 w-4" /> O'chirish</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TeacherCurriculum;

