import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ApiCall from "../../../config";
import { isUuid } from "../../../config";
import { MdAdd, MdEdit, MdDelete, MdSearch, MdClose, MdArrowBack, MdPerson, MdVisibility, MdVisibilityOff, MdAutoAwesome } from "react-icons/md";
import { FiAlertTriangle } from "react-icons/fi";
import { jsPDF } from "jspdf";

const TeacherGroupDetail = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ fullName: "", login: "", password: "", groupsId: groupId || "" });

  // ── AI Insight state ──────────────────────────────────────────────────────
  const [insightLoading, setInsightLoading] = useState(false);
  const [insightError, setInsightError] = useState("");
  const [userId, setUserId] = useState(null);
  // ── Lesson picker for AI insight ─────────────────────────────────────────
  const [curricula, setCurricula] = useState([]);
  const [curriculaLoading, setCurriculaLoading] = useState(false);
  const [selectedCurricId, setSelectedCurricId] = useState("");
  const [lessonList, setLessonList] = useState([]);
  const [lessonsLoading, setLessonsLoading] = useState(false);
  const [selectedLessonId, setSelectedLessonId] = useState("");
  // ── Task results fetched from backend ─────────────────────────────────────
  const [groupResults, setGroupResults] = useState([]); // StudentResultDTO[]

  const fetchInsight = async () => {
    if (students.length === 0) return;
    setInsightLoading(true);
    setInsightError("");
    try {
      const payload = {
        lessonId: selectedLessonId || null,
        students: students.map(buildStudentInput),
      };
      const res = await ApiCall("/api/v1/ai/teacher-insight", "POST", payload);
      if (res?.error || !res?.data) {
        const errMsg =
          typeof res?.data === "string"
            ? res.data
            : res?.data?.error || res?.data?.message || "Javob kelmadi";
        throw new Error(errMsg);
      }
      downloadInsightPdf(res.data);
    } catch (err) {
      setInsightError(err?.message || "AI tahlil olishda xatolik yuz berdi. Qayta urinib ko'ring.");
    } finally {
      setInsightLoading(false);
    }
  };

  // Build student input for AI from real backend task results
  const buildStudentInput = (student) => {
    const results = groupResults.filter(
      (r) => r.studentId === student.id || r.studentId === String(student.id)
    );
    const completedTasks = results.length;
    const score = completedTasks > 0
      ? Math.round(results.reduce((acc, r) => acc + (Number(r.score) || 0), 0) / completedTasks)
      : 0;
    return { studentId: student.id, fullName: student.fullName || "Nomsiz", score, completedTasks, averageTime: 0, strengths: [], weaknesses: [] };
  };

  const handleCurricChange = async (curricId) => {
    setSelectedCurricId(curricId);
    setSelectedLessonId("");
    setLessonList([]);
    if (!curricId) return;
    setLessonsLoading(true);
    try {
      const r = await ApiCall(`/api/v1/lessons/curriculm/${curricId}`, "GET", null);
      setLessonList(Array.isArray(r.data) ? r.data : []);
    } catch { setLessonList([]); }
    finally { setLessonsLoading(false); }
  };

  const downloadInsightPdf = (data) => {
    if (!data) return;
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const pageW = doc.internal.pageSize.getWidth();
    const margin = 40;
    const maxW = pageW - margin * 2;
    let y = 50;

    const addText = (text, opts = {}) => {
      const { size = 11, bold = false, color = [30, 30, 30], indent = 0 } = opts;
      doc.setFontSize(size);
      doc.setFont("helvetica", bold ? "bold" : "normal");
      doc.setTextColor(...color);
      const lines = doc.splitTextToSize(String(text || ""), maxW - indent);
      if (y + lines.length * size * 1.4 > doc.internal.pageSize.getHeight() - 40) {
        doc.addPage(); y = 50;
      }
      doc.text(lines, margin + indent, y);
      y += lines.length * size * 1.4 + (opts.gap ?? 4);
    };

    const addLine = (color = [220, 220, 220]) => {
      doc.setDrawColor(...color);
      doc.line(margin, y, pageW - margin, y);
      y += 10;
    };

    // Title
    addText("AI — Tahlil natijasi", { size: 18, bold: true, color: [79, 70, 229], gap: 6 });
    addText(`Guruh: ${group?.name || "-"}   |   Sana: ${new Date().toLocaleDateString("uz-UZ")}`, { size: 10, color: [120, 120, 120], gap: 14 });
    addLine([200, 200, 230]);

    // General Feedback
    if (data.generalFeedback) {
      addText("Umumiy xulosa", { size: 13, bold: true, color: [55, 65, 81], gap: 6 });
      addText(data.generalFeedback, { size: 11, color: [55, 65, 81], gap: 14 });
      addLine();
    }

    // Top Students
    if (data.topStudents?.length > 0) {
      addText("Top talabalar", { size: 13, bold: true, color: [21, 128, 61], gap: 8 });
      data.topStudents.forEach((s, i) => {
        addText(`${i + 1}. ${s.fullName}  —  ${s.score}%`, { size: 11, bold: true, color: [21, 128, 61], gap: 3 });
        if (s.reason) addText(s.reason, { size: 10, color: [75, 100, 75], indent: 16, gap: 3 });
        if (s.potentialCareers?.length) addText(`Karera: ${s.potentialCareers.join(", ")}`, { size: 10, color: [99, 102, 241], indent: 16, gap: 8 });
      });
      y += 6;
      addLine();
    }

    // Low Students
    if (data.lowStudents?.length > 0) {
      addText("Yordam kerak talabalar", { size: 13, bold: true, color: [180, 80, 20], gap: 8 });
      data.lowStudents.forEach((s, i) => {
        addText(`${i + 1}. ${s.fullName}  —  ${s.score}%`, { size: 11, bold: true, color: [180, 80, 20], gap: 3 });
        (s.recommendations || []).forEach((rec, j) => {
          addText(`${j + 1}) ${rec}`, { size: 10, color: [80, 80, 80], indent: 16, gap: 3 });
        });
        y += 6;
      });
    }

    doc.save(`AI_Tahlil_${group?.name || "guruh"}_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  // Decode token to get teacher userId (needed for curricula fetch)
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      ApiCall("/api/v1/auth/decode1?token=" + token, "GET", null)
        .then((r) => setUserId(r.data?.id))
        .catch(() => {});
    }
  }, []);

  useEffect(() => {
    if (!groupId) return;
    fetchGroupDetail();
    fetchStudentsByGroup();
    // Fetch all task results for this group
    ApiCall(`/api/v1/task/results/group/${groupId}`, "GET", null)
      .then((res) => setGroupResults(Array.isArray(res.data) ? res.data : []))
      .catch(() => setGroupResults([]));
  }, [groupId]);

  // Fetch curricula once userId is available
  useEffect(() => {
    if (!isUuid(userId)) return;
    setCurriculaLoading(true);
    ApiCall(`/api/v1/curriculums/user/${userId}`, "GET", null)
      .then((res) => setCurricula(Array.isArray(res.data) ? res.data : []))
      .catch(() => setCurricula([]))
      .finally(() => setCurriculaLoading(false));

      console.log(curricula);
      
  }, [userId]);
  useEffect(() => { if (error || successMsg) { const t = setTimeout(() => { setError(""); setSuccessMsg(""); }, 4000); return () => clearTimeout(t); } }, [error, successMsg]);

  const fetchGroupDetail = async () => {
    try { setLoading(true); const r = await ApiCall(`/api/v1/groups/${groupId}`, "GET", null); if (r?.error) { setError("Guruh yuklashda xatolik"); return; } setGroup(r.data); }
    catch (err) { console.error(err); setError("Guruh yuklashda xatolik"); } finally { setLoading(false); }
  };

  const fetchStudentsByGroup = async () => {
    try {
      const r = await ApiCall("/api/v1/students", "GET", null); if (r?.error) { setStudents([]); return; }
      const data = r.data || []; setStudents(Array.isArray(data) ? data.filter((s) => s.groupsId === groupId) : []);
    }
    catch (err) { console.error(err); setStudents([]); }
  };

  const resetForm = () => { setFormData({ fullName: "", login: "", password: "", groupsId: groupId || "" }); setEditingId(null); setShowPassword(false); };

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(""); setSuccessMsg("");
    if (!formData.fullName.trim()) { setError("To'liq ism bo'sh bo'lishi mumkin emas"); return; }
    if (!editingId && !formData.login.trim()) { setError("Login bo'sh bo'lishi mumkin emas"); return; }
    try {
      setLoading(true);
      if (editingId) {
        const res = await ApiCall(`/api/v1/students/${editingId}`, "PUT", { fullName: formData.fullName, groupsId: groupId });
        if (res?.error) { setError(typeof res.data === "string" ? res.data : "Yangilashda xatolik"); return; }
        setSuccessMsg("Talaba yangilandi ✅");
      } else {
        const res = await ApiCall("/api/v1/students", "POST", { fullName: formData.fullName, login: formData.login, password: formData.password || undefined, groupsId: groupId });
        if (res?.error) { setError(typeof res.data === "string" ? res.data : "Yaratishda xatolik"); return; }
        setSuccessMsg("Talaba qo'shildi ✅");
      }
      resetForm(); setShowForm(false); fetchStudentsByGroup();
    } catch (err) { console.error(err); setError("Saqlashda xatolik"); } finally { setLoading(false); }
  };

  const handleEdit = (s) => { setFormData({ fullName: s.fullName || "", login: s.login || "", password: "", groupsId: groupId }); setEditingId(s.id); setShowPassword(false); setShowForm(true); };

  const handleDelete = async (id) => {
    if (window.confirm("Talabani o'chirishni tasdiqlaysizmi?")) {
      try {
        setLoading(true); setError(""); const res = await ApiCall(`/api/v1/students/${id}`, "DELETE", null);
        if (res?.error) { setError(typeof res.data === "string" ? res.data : "O'chirishda xatolik"); return; }
        setSuccessMsg("Talaba o'chirildi ✅"); fetchStudentsByGroup();
      }
      catch (err) { console.error(err); setError("O'chirishda xatolik"); } finally { setLoading(false); }
    }
  };

  const filteredStudents = students.filter((s) => (s.fullName?.toLowerCase() || "").includes(searchTerm.toLowerCase()) || (s.login?.toLowerCase() || "").includes(searchTerm.toLowerCase()));
  const formatDate = (d) => { if (!d) return "—"; try { return new Date(d).toLocaleDateString("uz-UZ", { year: "numeric", month: "2-digit", day: "2-digit" }); } catch { return d; } };

  if (loading && !group) return <div className="flex items-center justify-center py-12"><div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-green-600"></div></div>;

  return (
    <div className="space-y-6">
      <button onClick={() => navigate("/teacher/groups")} className="flex items-center gap-2 font-medium text-green-600 transition-colors hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"><MdArrowBack className="h-5 w-5" /> Guruhlar ro'yxatiga qaytish</button>

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">👥 {group?.name || "Guruh"}</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">{group?.description || "Tavsif mavjud emas"}</p>
          <div className="mt-3 flex items-center gap-4">
            <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400"><MdPerson className="h-4 w-4" />{students.length} ta talaba</span>
            {group?.semesterName && <span className="inline-flex items-center rounded-full bg-purple-100 px-3 py-1 text-sm font-medium text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">📅 {group.semesterName}</span>}
          </div>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="flex items-center gap-2 whitespace-nowrap rounded-lg bg-gradient-to-r from-green-600 to-teal-700 px-6 py-3 font-semibold text-white shadow-lg shadow-green-500/30 transition-all hover:shadow-green-500/50"><MdAdd className="h-5 w-5" /> Yangi talaba qo'shish</button>
      </div>

     

      {/* ── AI Teacher Insight button ──────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={fetchInsight}
          disabled={insightLoading || students.length === 0}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-700 px-5 py-2.5 font-semibold text-white shadow-lg shadow-indigo-500/30 transition-all hover:shadow-indigo-500/50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {insightLoading ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              Tahlil qilinmoqda...
            </>
          ) : (
            <>
              <MdAutoAwesome className="h-5 w-5" />
              🤖 AI Tahlil
            </>
          )}
        </button>
      </div>

      {/* ── AI Insight error ──────────────────────────────────────────────── */}
      {insightError && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          <FiAlertTriangle className="h-5 w-5 flex-shrink-0" />
          <span>{insightError}</span>
          <button onClick={fetchInsight} className="ml-auto rounded-lg bg-red-600 px-3 py-1 text-xs font-semibold text-white hover:bg-red-700">
            Qayta urinish
          </button>
        </div>
      )}

      {successMsg && <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm font-medium text-green-700 dark:border-green-900 dark:bg-green-900/20 dark:text-green-400">{successMsg}</div>}
      {error && <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-900/20 dark:text-red-400">{error}</div>}

      {students.length > 0 && (
        <div className="relative"><MdSearch className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Talabalarni qidirish..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white py-3 pl-12 pr-4 text-gray-900 placeholder:text-gray-400 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white" /></div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowForm(false)}>
          <div className="relative max-h-[90vh] w-full max-w-md space-y-6 overflow-y-auto rounded-2xl border border-gray-200 bg-white p-8 shadow-2xl dark:border-gray-700 dark:bg-gray-800" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowForm(false)} className="absolute right-4 top-4 rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"><MdClose className="h-6 w-6" /></button>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{editingId ? "Talabani tahrirlash" : "Yangi talaba qo'shish"}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">To'liq ismi <span className="text-red-500">*</span></label>
                <input type="text" value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} required className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white" placeholder="Masalan: Ali Valiyev" /></div>
              <div><label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">Login {!editingId && <span className="text-red-500">*</span>}</label>
                <input type="text" value={formData.login} onChange={(e) => setFormData({ ...formData, login: e.target.value })} required={!editingId} disabled={!!editingId}
                  className={`w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white ${editingId ? "cursor-not-allowed opacity-60" : ""}`} placeholder="Masalan: ali123" />
                {editingId && <p className="mt-1 text-xs text-gray-500">Login tahrirlash mumkin emas</p>}</div>
              {!editingId && (
                <div><label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">Parol <span className="text-xs font-normal text-gray-400">(ixtiyoriy)</span></label>
                  <div className="relative"><input type={showPassword ? "text" : "password"} value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 pr-12 text-gray-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white" placeholder="Parol kiriting" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">{showPassword ? <MdVisibilityOff className="h-5 w-5" /> : <MdVisibility className="h-5 w-5" />}</button></div></div>
              )}
              <div className="flex gap-3 pt-4">
                <button type="submit" disabled={loading} className="flex-1 rounded-lg bg-gradient-to-r from-green-600 to-teal-700 px-4 py-3 font-semibold text-white shadow-lg transition-all hover:shadow-green-500/50 disabled:opacity-50">{loading ? "Saqlanmoqda..." : editingId ? "Yangilash" : "Qo'shish"}</button>
                <button type="button" onClick={() => { setShowForm(false); resetForm(); }} className="flex-1 rounded-lg border border-gray-300 px-4 py-3 font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">Bekor qilish</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {filteredStudents.length === 0 && !loading && (
        <div className="rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 p-12 text-center dark:border-gray-600 dark:bg-gray-800/50">
          <div className="mb-4 text-4xl">📭</div>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">{searchTerm ? "Talabalar topilmadi" : "Bu guruhda hali talabalar yo'q"}</p>
        </div>
      )}

      {filteredStudents.length > 0 && (
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">#</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">To'liq ismi</th>
                  <th className="hidden px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 sm:table-cell">Login</th>
                  <th className="hidden px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 md:table-cell">Sana</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredStudents.map((student, i) => (
                  <tr key={student.id} className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{i + 1}</td>
                    <td className="px-6 py-4"><div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-teal-500 text-sm font-bold text-white">{student.fullName?.charAt(0)?.toUpperCase() || "?"}</div><div><p className="text-sm font-medium text-gray-900 dark:text-white">{student.fullName}</p><p className="text-xs text-gray-500 sm:hidden">{student.login}</p></div></div></td>
                    <td className="hidden whitespace-nowrap px-6 py-4 sm:table-cell"><span className="inline-flex items-center rounded-md bg-gray-100 px-2.5 py-0.5 text-sm font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-300">{student.login}</span></td>
                    <td className="hidden whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-400 md:table-cell">{formatDate(student.createAt)}</td>
                    <td className="whitespace-nowrap px-6 py-4"><div className="flex justify-end gap-2">
                      <button onClick={() => handleEdit(student)} className="inline-flex items-center gap-1.5 rounded-lg bg-green-100 px-3 py-2 text-sm font-medium text-green-600 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400"><MdEdit className="h-4 w-4" /><span className="hidden lg:inline">Tahrirlash</span></button>
                      <button onClick={() => handleDelete(student.id)} className="inline-flex items-center gap-1.5 rounded-lg bg-red-100 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400"><MdDelete className="h-4 w-4" /><span className="hidden lg:inline">O'chirish</span></button>
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="border-t border-gray-200 px-6 py-3 dark:border-gray-700"><p className="text-sm text-gray-500">Jami: <span className="font-semibold">{filteredStudents.length}</span> ta talaba</p></div>
        </div>
      )}
    </div>
  );
};

export default TeacherGroupDetail;

