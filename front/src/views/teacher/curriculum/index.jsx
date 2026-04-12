import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import ApiCall from "../../../config";
import { MdAdd, MdEdit, MdDelete, MdSearch, MdClose, MdExpandMore, MdCheckBox, MdCheckBoxOutlineBlank } from "react-icons/md";

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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => { if (groupsDropRef.current && !groupsDropRef.current.contains(e.target)) setGroupsOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {   fetchGroups(); fetchSubjects(); }, []);
    const getAdmin = async () => {
        let token = localStorage.getItem("access_token");
        try {
            const response = await ApiCall("/api/v1/auth/decode1?token="+token, "GET", null);
            setUserId(response.data?.id);

        } catch (error) {
            console.error("Error fetching account data:", error);
        }
    };

    useEffect(() => {
        getAdmin();
    }, []);

    useEffect(() => {
        if (userId) {
            fetchCurriculums();
        }
    }, [userId]);
  const fetchCurriculums = async () => {
    try { setLoading(true); const r = await ApiCall("/api/v1/curriculums/user/"+userId, "GET", null); setCurriculums(Array.isArray(r.data) ? r.data : []); setError(""); }
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
        <button onClick={() => { setFormData({ name: "", userId: "", groupsIds: [], subjectsId: "" }); setEditingId(null); setGroupsOpen(false); setShowForm(true); }}
          className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-green-600 to-teal-700 px-6 py-3 font-semibold text-white shadow-lg shadow-green-500/30 transition-all hover:shadow-green-500/50"><MdAdd className="h-5 w-5" /> Yangi dastur</button>
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
                    className={`flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:bg-gray-700 dark:text-white ${
                      formData.groupsIds.length === 0 ? "border-gray-300 text-gray-400 dark:border-gray-600" : "border-green-400 text-gray-900 dark:border-green-600"
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
                            className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors hover:bg-green-50 dark:hover:bg-green-900/20 ${
                              checked ? "bg-green-50 dark:bg-green-900/20" : ""
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

