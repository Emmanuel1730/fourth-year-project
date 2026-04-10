import { useEffect, useState } from "react";
import api from "../../api/api";

const Resources = () => {
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

  const fetchResources = async () => {
    try {
      setLoading(true);
      const res = await api.get("/resources");
      const mapped = res.data.data.map((r) => ({
        id: r.id,
        title: r.title,
        subject: r.category?.name || "Unknown",
        subjectId: r.category?.id || "",
        // targetClass is now joined in the backend query
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
    api.get("/categories")
      .then((r) => setCategories(Array.isArray(r.data) ? r.data : []))
      .catch(() => {});
    api.get("/classes")
      .then((r) => {
        if (Array.isArray(r.data)) {
          const sorted = [...r.data].sort((a, b) =>
            a.name.localeCompare(b.name, undefined, { numeric: true })
          );
          setClasses(sorted);
        }
      })
      .catch(() => {});
  }, []);

  const filteredResources = resources.filter((r) => {
    const matchesSearch =
      searchTerm === "" ||
      r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.subject.toLowerCase().includes(searchTerm.toLowerCase());
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
      title: r.title,
      description: r.description,
      status: r.status,
      visibility: r.visibility,
      targetAudience: r.targetAudience,
      categoryId: r.subjectId,
      classId: r.classId,
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

  const inputCls = "w-full bg-[#0d1117] border border-[#21262d] text-[#e6edf3] rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[#388bfd] placeholder-[#6e7681]";
  const labelCls = "block text-xs font-medium text-[#8b949e] uppercase tracking-wider mb-1";

  if (loading) return <div className="p-6 text-[#8b949e] text-sm">Loading resources...</div>;

  return (
    <div>
      {/* Filter Row */}
      <div className="flex gap-2 mb-4 flex-wrap items-center">
        <input
          className="flex-1 min-w-[180px] bg-[#1c2330] border border-[#21262d] rounded-lg px-3 py-1.5 text-sm text-[#e6edf3] outline-none focus:border-[#388bfd]"
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
            className="bg-[#1c2330] border border-[#21262d] rounded-lg px-3 py-1.5 text-sm text-[#e6edf3] outline-none focus:border-[#388bfd]">
            {options.map((o) => <option key={o}>{o}</option>)}
          </select>
        ))}
      </div>

      {/* Table */}
      <div className="bg-[#161b22] border border-[#21262d] rounded-xl overflow-hidden">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-[#21262d] bg-[#1c2330]">
              {["Title", "Subject", "Form", "Type", "Visibility", "Downloads", "Status", "Actions"].map((h) => (
                <th key={h} className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-[#6e7681] whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredResources.map((r) => (
              <tr key={r.id} className="border-b border-[#21262d] hover:bg-white/[0.03] transition-colors">
                <td className="px-4 py-2.5 text-[#e6edf3] font-medium max-w-[180px] truncate">{r.title}</td>
                <td className="px-4 py-2.5 text-[#8b949e] whitespace-nowrap">{r.subject}</td>
                <td className="px-4 py-2.5 text-[#8b949e] whitespace-nowrap">{r.form}</td>
                <td className="px-4 py-2.5 whitespace-nowrap">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${getTypeClass(r.type)}`}>{r.type}</span>
                </td>
                <td className="px-4 py-2.5 whitespace-nowrap">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${getVisibilityClass(r.visibility)}`}>{r.visibility}</span>
                </td>
                <td className="px-4 py-2.5 text-[#8b949e] text-center">{r.downloads}</td>
                <td className="px-4 py-2.5 whitespace-nowrap">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusClass(r.status)}`}>{r.status}</span>
                </td>
                <td className="px-4 py-2.5 whitespace-nowrap">
                  <div className="flex gap-3">
                    <button onClick={() => openEdit(r)}
                      className="text-xs text-[#388bfd] hover:text-[#58a6ff] transition-colors font-medium">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(r.id)}
                      className="text-xs text-[#f85149] hover:text-[#da3633] transition-colors font-medium">
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredResources.length === 0 && (
          <div className="p-8 text-center text-[#6e7681] text-sm">No resources found</div>
        )}
      </div>

      {/* Edit Modal */}
      {editTarget && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#161b22] border border-[#30363d] rounded-xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold text-[#e6edf3]">Edit Resource</h2>
              <button onClick={() => setEditTarget(null)} className="text-[#6e7681] hover:text-[#e6edf3] text-xl">✕</button>
            </div>

            {editError && (
              <div className="mb-4 px-3 py-2 rounded-md bg-[#3d1f1f] border border-[#f85149] text-[#f85149] text-xs">
                {editError}
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className={labelCls}>Title</label>
                <input type="text" className={inputCls} value={editForm.title}
                  onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))} />
              </div>

              <div>
                <label className={labelCls}>Description</label>
                <textarea rows={2} className={inputCls + " resize-none"} value={editForm.description}
                  onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Subject</label>
                  <select className={inputCls} value={editForm.categoryId}
                    onChange={(e) => setEditForm((f) => ({ ...f, categoryId: e.target.value }))}>
                    <option value="">Select subject</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Form Level</label>
                  <select className={inputCls} value={editForm.classId}
                    onChange={(e) => setEditForm((f) => ({ ...f, classId: e.target.value }))}>
                    <option value="">Select form</option>
                    {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Status</label>
                  <select className={inputCls} value={editForm.status}
                    onChange={(e) => setEditForm((f) => ({ ...f, status: e.target.value }))}>
                    <option value="DRAFT">Draft</option>
                    <option value="PUBLISHED">Published</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Visibility</label>
                  <select className={inputCls} value={editForm.visibility}
                    onChange={(e) => setEditForm((f) => ({ ...f, visibility: e.target.value }))}>
                    <option value="PUBLIC">Public</option>
                    <option value="PRIVATE">Private</option>
                  </select>
                </div>
              </div>

              <div>
                <label className={labelCls}>Target Audience</label>
                <select className={inputCls} value={editForm.targetAudience}
                  onChange={(e) => setEditForm((f) => ({ ...f, targetAudience: e.target.value }))}>
                  <option value="Students">Students</option>
                  <option value="Teachers">Teachers</option>
                  <option value="Both">Both</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              <button onClick={() => setEditTarget(null)}
                className="flex-1 bg-[#21262d] border border-[#30363d] text-[#e6edf3] font-medium py-2 rounded-md hover:border-[#6e7681] transition text-sm">
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