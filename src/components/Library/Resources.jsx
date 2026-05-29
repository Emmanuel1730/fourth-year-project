import { useEffect, useState } from "react";
import api from "../../api/api";

const Resources = ({ isDarkMode = true }) => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [classes, setClasses] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("All Subjects");
  const [typeFilter, setTypeFilter] = useState("All Types");
  const [formFilter, setFormFilter] = useState("All Forms");
  const [statusFilter, setStatusFilter] = useState("All Status");

  const [editTarget, setEditTarget] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");

  const t = {
    bg:          isDarkMode ? '#0d1117'  : '#f8fafc',
    cardBg:      isDarkMode ? '#161b22'  : '#ffffff',
    headerBg:    isDarkMode ? '#1c2330'  : '#f1f5f9',
    border:      isDarkMode ? '#21262d'  : '#e2e8f0',
    text:        isDarkMode ? '#e6edf3'  : '#0f172a',
    muted:       isDarkMode ? '#8b949e'  : '#64748b',
    dim:         isDarkMode ? '#6e7681'  : '#94a3b8',
    inputBg:     isDarkMode ? '#1c2330'  : '#f8fafc',
    inputBorder: isDarkMode ? '#21262d'  : '#e2e8f0',
    rowHover:    isDarkMode ? '#1c2330'  : '#f8fafc',
    modalBg:     isDarkMode ? '#161b22'  : '#ffffff',
    modalBorder: isDarkMode ? '#30363d'  : '#e2e8f0',
  }

  const fetchResources = async () => {
    try {
      setLoading(true);
      const res = await api.get("/resources");
      const mapped = res.data.data.map((r) => ({
        id: r.id,
        title: r.title,
        subject: r.category?.name || "Unknown",
        subjectId: r.category?.id || "",
        form: r.targetClass?.name || "—",
        classId: r.targetClass?.id || "",
        type: r.type || "Unknown",
        downloads: r.downloadCount || 0,
        status: r.status || "DRAFT",
        visibility: r.visibility || "PUBLIC",
        description: r.description || "",
        targetAudience: r.targetAudience || "",
      }));
      setResources(mapped);
    } catch (err) {
      console.error("Failed to fetch resources:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
    api.get("/categories").then((r) => setCategories(Array.isArray(r.data) ? r.data : [])).catch(() => {});
    api.get("/classes").then((r) => {
      if (Array.isArray(r.data)) {
        setClasses([...r.data].sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true })));
      }
    }).catch(() => {});
  }, []);

  const filteredResources = resources.filter((r) => {
    const matchesSearch = searchTerm === "" || r.title.toLowerCase().includes(searchTerm.toLowerCase()) || r.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = subjectFilter === "All Subjects" || r.subject === subjectFilter;
    const matchesType    = typeFilter    === "All Types"    || r.type    === typeFilter;
    const matchesForm    = formFilter    === "All Forms"    || r.form    === formFilter;
    const matchesStatus  = statusFilter  === "All Status"   || r.status  === statusFilter;
    return matchesSearch && matchesSubject && matchesType && matchesForm && matchesStatus;
  });

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this resource?")) return;
    try {
      await api.delete(`/resources/${id}`);
      setResources(resources.filter((r) => r.id !== id));
    } catch (err) {
      console.error(err.response?.data || err.message);
    }
  };

  const openEdit = (r) => {
    setEditTarget(r);
    setEditError("");
    setEditForm({
      title: r.title, description: r.description, status: r.status,
      visibility: r.visibility, targetAudience: r.targetAudience,
      categoryId: r.subjectId, classId: r.classId,
    });
  };

  const handleEditSave = async () => {
    setEditError("");
    setEditLoading(true);
    try {
      await api.patch(`/resources/${editTarget.id}`, editForm);
      setEditTarget(null);
      await fetchResources();
    } catch (err) {
      setEditError(err.response?.data?.message || "Update failed.");
    } finally {
      setEditLoading(false);
    }
  };

  const getTypeClass = (type) => {
    switch (type?.toUpperCase()) {
      case "PDF":   return "bg-[rgba(56,139,253,0.15)] text-[#388bfd]";
      case "VIDEO": return "bg-[rgba(240,136,62,0.15)] text-[#f0883e]";
      case "IMAGE": return "bg-[rgba(46,160,67,0.15)] text-[#2ea043]";
      default:      return "bg-[rgba(139,148,158,0.15)] text-[#8b949e]";
    }
  };

  const getStatusClass = (status) => {
    switch (status?.toUpperCase()) {
      case "PUBLISHED": return "bg-[rgba(46,160,67,0.15)] text-[#2ea043]";
      case "DRAFT":     return "bg-[rgba(218,54,51,0.15)] text-[#da3633]";
      default:          return "bg-[rgba(139,148,158,0.15)] text-[#8b949e]";
    }
  };

  const getVisibilityClass = (v) =>
    v === "PUBLIC"
      ? "bg-[rgba(56,139,253,0.15)] text-[#388bfd]"
      : "bg-[rgba(240,136,62,0.15)] text-[#f0883e]";

  const subjects = ["All Subjects", ...new Set(resources.map((r) => r.subject))];
  const types    = ["All Types",    ...new Set(resources.map((r) => r.type))];
  const forms    = ["All Forms",    ...new Set(resources.map((r) => r.form).filter((f) => f !== "—"))];
  const statuses = ["All Status",   ...new Set(resources.map((r) => r.status))];

  const inputCls = `w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[#388bfd] placeholder-[#6e7681]`;
  const labelCls = "block text-xs font-medium uppercase tracking-wider mb-1";

  if (loading) return <div className="p-6 text-sm" style={{ color: t.muted }}>Loading resources...</div>;

  return (
    <div style={{ background: t.bg }}>
      {/* Filter Row */}
      <div className="flex gap-2 mb-4 flex-wrap items-center">
        <input
          className="flex-1 min-w-[180px] rounded-lg px-3 py-1.5 text-sm outline-none"
          style={{ background: t.inputBg, border: `1px solid ${t.inputBorder}`, color: t.text }}
          placeholder="🔍 Search resources..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {[
          { value: subjectFilter, setter: setSubjectFilter, options: subjects },
          { value: typeFilter,    setter: setTypeFilter,    options: types    },
          { value: formFilter,    setter: setFormFilter,    options: forms    },
          { value: statusFilter,  setter: setStatusFilter,  options: statuses },
        ].map(({ value, setter, options }, i) => (
          <select key={i} value={value} onChange={(e) => setter(e.target.value)}
            className="rounded-lg px-3 py-1.5 text-sm outline-none"
            style={{ background: t.inputBg, border: `1px solid ${t.inputBorder}`, color: t.text }}>
            {options.map((o) => (
              <option key={o} style={{ background: isDarkMode ? '#1c2330' : '#ffffff', color: t.text }}>{o}</option>
            ))}
          </select>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-xl overflow-hidden" style={{ background: t.cardBg, border: `1px solid ${t.border}` }}>
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr style={{ borderBottom: `1px solid ${t.border}`, background: t.headerBg }}>
              {["Title", "Subject", "Form", "Type", "Visibility", "Downloads", "Status", "Actions"].map((h) => (
                <th key={h} className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider whitespace-nowrap"
                  style={{ color: t.dim }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredResources.map((r) => (
              <tr key={r.id} className="transition-colors"
                style={{ borderBottom: `1px solid ${t.border}` }}
                onMouseEnter={e => e.currentTarget.style.background = t.rowHover}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <td className="px-4 py-2.5 font-medium max-w-[180px] truncate" style={{ color: t.text }}>{r.title}</td>
                <td className="px-4 py-2.5 whitespace-nowrap" style={{ color: t.muted }}>{r.subject}</td>
                <td className="px-4 py-2.5 whitespace-nowrap" style={{ color: t.muted }}>{r.form}</td>
                <td className="px-4 py-2.5 whitespace-nowrap">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${getTypeClass(r.type)}`}>{r.type}</span>
                </td>
                <td className="px-4 py-2.5 whitespace-nowrap">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${getVisibilityClass(r.visibility)}`}>{r.visibility}</span>
                </td>
                <td className="px-4 py-2.5 text-center" style={{ color: t.muted }}>{r.downloads}</td>
                <td className="px-4 py-2.5 whitespace-nowrap">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusClass(r.status)}`}>{r.status}</span>
                </td>
                <td className="px-4 py-2.5 whitespace-nowrap">
                  <div className="flex gap-3">
                    <button onClick={() => openEdit(r)} className="text-xs font-medium text-[#388bfd] hover:text-[#58a6ff] transition-colors">Edit</button>
                    <button onClick={() => handleDelete(r.id)} className="text-xs font-medium text-[#f85149] hover:text-[#da3633] transition-colors">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredResources.length === 0 && (
          <div className="p-8 text-center text-sm" style={{ color: t.dim }}>No resources found</div>
        )}
      </div>

      {/* Edit Modal */}
      {editTarget && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="rounded-xl w-full max-w-md p-6 shadow-2xl"
            style={{ background: t.modalBg, border: `1px solid ${t.modalBorder}` }}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold" style={{ color: t.text }}>Edit Resource</h2>
              <button onClick={() => setEditTarget(null)} className="text-xl" style={{ color: t.dim }}>✕</button>
            </div>

            {editError && (
              <div className="mb-4 px-3 py-2 rounded-md bg-[#3d1f1f] border border-[#f85149] text-[#f85149] text-xs">{editError}</div>
            )}

            <div className="space-y-3">
              {[
                { label: 'Title', field: 'title', type: 'input' },
                { label: 'Description', field: 'description', type: 'textarea' },
              ].map(({ label, field, type }) => (
                <div key={field}>
                  <label className={labelCls} style={{ color: t.muted }}>{label}</label>
                  {type === 'input' ? (
                    <input type="text" className={inputCls}
                      style={{ background: t.inputBg, border: `1px solid ${t.inputBorder}`, color: t.text }}
                      value={editForm[field]}
                      onChange={(e) => setEditForm((f) => ({ ...f, [field]: e.target.value }))} />
                  ) : (
                    <textarea rows={2} className={inputCls + " resize-none"}
                      style={{ background: t.inputBg, border: `1px solid ${t.inputBorder}`, color: t.text }}
                      value={editForm[field]}
                      onChange={(e) => setEditForm((f) => ({ ...f, [field]: e.target.value }))} />
                  )}
                </div>
              ))}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls} style={{ color: t.muted }}>Subject</label>
                  <select className={inputCls}
                    style={{ background: t.inputBg, border: `1px solid ${t.inputBorder}`, color: t.text }}
                    value={editForm.categoryId}
                    onChange={(e) => setEditForm((f) => ({ ...f, categoryId: e.target.value }))}>
                    <option value="">Select subject</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls} style={{ color: t.muted }}>Form Level</label>
                  <select className={inputCls}
                    style={{ background: t.inputBg, border: `1px solid ${t.inputBorder}`, color: t.text }}
                    value={editForm.classId}
                    onChange={(e) => setEditForm((f) => ({ ...f, classId: e.target.value }))}>
                    <option value="">Select form</option>
                    {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls} style={{ color: t.muted }}>Status</label>
                  <select className={inputCls}
                    style={{ background: t.inputBg, border: `1px solid ${t.inputBorder}`, color: t.text }}
                    value={editForm.status}
                    onChange={(e) => setEditForm((f) => ({ ...f, status: e.target.value }))}>
                    <option value="DRAFT">Draft</option>
                    <option value="PUBLISHED">Published</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls} style={{ color: t.muted }}>Visibility</label>
                  <select className={inputCls}
                    style={{ background: t.inputBg, border: `1px solid ${t.inputBorder}`, color: t.text }}
                    value={editForm.visibility}
                    onChange={(e) => setEditForm((f) => ({ ...f, visibility: e.target.value }))}>
                    <option value="PUBLIC">Public</option>
                    <option value="PRIVATE">Private</option>
                  </select>
                </div>
              </div>

              <div>
                <label className={labelCls} style={{ color: t.muted }}>Target Audience</label>
                <select className={inputCls}
                  style={{ background: t.inputBg, border: `1px solid ${t.inputBorder}`, color: t.text }}
                  value={editForm.targetAudience}
                  onChange={(e) => setEditForm((f) => ({ ...f, targetAudience: e.target.value }))}>
                  <option value="Students">Students</option>
                  <option value="Teachers">Teachers</option>
                  <option value="Both">Both</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              <button onClick={() => setEditTarget(null)}
                className="flex-1 font-medium py-2 rounded-md transition text-sm"
                style={{ background: t.headerBg, border: `1px solid ${t.modalBorder}`, color: t.text }}>
                Cancel
              </button>
              <button onClick={handleEditSave} disabled={editLoading}
                className="flex-1 bg-[#388bfd] text-white font-medium py-2 rounded-md hover:bg-[#58a6ff] transition text-sm disabled:opacity-50">
                {editLoading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Resources;