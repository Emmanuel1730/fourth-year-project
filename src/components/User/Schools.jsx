import React, { useEffect, useState } from "react";
import api from "../../api/api";

// ── Status badge helper ──────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const map = {
    ACTIVE:          { label: "Active",          bg: "#1a3a2a", color: "#2ea043" },
    PENDING_PAYMENT: { label: "Pending Payment", bg: "#3a2a1a", color: "#e3a525" },
    SUSPENDED:       { label: "Suspended",       bg: "#3d1a1a", color: "#f85149" },
  };
  const s = map[status] ?? { label: status ?? "Unknown", bg: "#21262d", color: "#8b949e" };
  return (
    <span className="text-xs font-semibold px-2 py-0.5 rounded"
      style={{ backgroundColor: s.bg, color: s.color }}>
      {s.label}
    </span>
  );
};

// ── Input used in the edit modal ─────────────────────────────────────────────
const inputCls =
  "w-full bg-[#0d1117] border border-[#21262d] text-[#e6edf3] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#2ea043] placeholder-[#6e7681] transition";

// ────────────────────────────────────────────────────────────────────────────

const Schools = () => {
  const [schools, setSchools]           = useState([]);
  const [loading, setLoading]           = useState(true);
  const [searchTerm, setSearchTerm]     = useState("");
  const [locationFilter, setLocationFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  // ── Detail side panel ────────────────────────────────────────────
  const [selected, setSelected]         = useState(null); // school shown in panel

  // ── Edit modal ───────────────────────────────────────────────────
  const [editTarget, setEditTarget]     = useState(null); // school being edited
  const [editForm, setEditForm]         = useState({});
  const [editLoading, setEditLoading]   = useState(false);
  const [editError, setEditError]       = useState(null);

  // ── Delete modal ─────────────────────────────────────────────────
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // ── Toast ────────────────────────────────────────────────────────
  const [toast, setToast] = useState(null);
  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ── Fetch ────────────────────────────────────────────────────────
  const fetchSchools = async () => {
    try {
      setLoading(true);
      const res = await api.get("/school");
      setSchools(Array.isArray(res.data) ? res.data : []);
    } catch {
      showToast("Failed to load schools.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSchools(); }, []);

  // ── Filters ──────────────────────────────────────────────────────
  const locations = ["All", ...new Set(schools.map(s => s.location).filter(Boolean))];
  const statuses  = ["All", "ACTIVE", "PENDING_PAYMENT", "SUSPENDED"];

  const filtered = schools.filter(s => {
    const matchSearch =
      s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.phone?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchLocation = locationFilter === "All" || s.location === locationFilter;
    const matchStatus   = statusFilter   === "All" || s.registrationStatus === statusFilter;
    return matchSearch && matchLocation && matchStatus;
  });

  // ── Edit handlers ─────────────────────────────────────────────────
  const openEdit = (school, e) => {
    e.stopPropagation(); // don't open the detail panel
    setEditTarget(school);
    setEditForm({ name: school.name, location: school.location ?? "", phone: school.phone ?? "" });
    setEditError(null);
  };

  const handleEditSave = async () => {
    if (!editForm.name?.trim()) { setEditError("School name is required."); return; }
    setEditLoading(true);
    setEditError(null);
    try {
      const res = await api.patch(`/school/${editTarget.id}`, editForm);
      const updated = res.data;
      setSchools(prev => prev.map(s => s.id === updated.id ? updated : s));
      if (selected?.id === updated.id) setSelected(updated);
      setEditTarget(null);
      showToast(`"${updated.name}" updated successfully.`);
    } catch (err) {
      setEditError(err.response?.data?.message ?? err.message);
    } finally {
      setEditLoading(false);
    }
  };

  // ── Delete handler ────────────────────────────────────────────────
  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await api.delete(`/school/${deleteTarget.id}`);
      setSchools(prev => prev.filter(s => s.id !== deleteTarget.id));
      if (selected?.id === deleteTarget.id) setSelected(null);
      showToast(`"${deleteTarget.name}" deleted.`);
      setDeleteTarget(null);
    } catch (err) {
      showToast(err.response?.data?.message ?? err.message, "error");
      setDeleteTarget(null);
    } finally {
      setDeleteLoading(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────
  return (
    <div className="p-6 min-h-screen bg-[#0d1117] text-[#e6edf3] font-sans">

      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 px-5 py-3 rounded-lg text-sm font-semibold shadow-lg"
          style={{
            backgroundColor: toast.type === "error" ? "#3d1a1a" : "#1a3a2a",
            color:           toast.type === "error" ? "#f85149" : "#2ea043",
            border:          `1px solid ${toast.type === "error" ? "#f85149" : "#2ea043"}`,
          }}>
          {toast.type === "error" ? "⚠️" : "✅"} {toast.msg}
        </div>
      )}

      {/* Page title */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-[#e6edf3]">🏫 Schools</h1>
        <p className="text-sm text-[#8b949e] mt-0.5">
          {schools.length} school{schools.length !== 1 ? "s" : ""} registered
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <input
          type="text"
          placeholder="🔍 Search by name, location or phone…"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="flex-1 min-w-[220px] px-4 py-2 rounded-lg bg-[#161b22] border border-[#21262d] text-white text-sm focus:outline-none focus:border-[#2ea043]"
        />
        <select value={locationFilter} onChange={e => setLocationFilter(e.target.value)}
          className="px-4 py-2 rounded-lg bg-[#161b22] border border-[#21262d] text-white text-sm focus:outline-none">
          {locations.map(l => <option key={l}>{l}</option>)}
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="px-4 py-2 rounded-lg bg-[#161b22] border border-[#21262d] text-white text-sm focus:outline-none">
          {statuses.map(s => <option key={s} value={s}>{s === "All" ? "All Statuses" : s.replace("_", " ")}</option>)}
        </select>
        <span className="self-center text-sm text-[#6e7681] ml-auto">
          {filtered.length} result{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Main layout — table + optional detail panel side by side */}
      <div className={`flex gap-5 ${selected ? "items-start" : ""}`}>

        {/* ── Table ───────────────────────────────────────────────── */}
        <div className="flex-1 overflow-x-auto rounded-xl bg-[#161b22] border border-[#21262d]">
          {loading ? (
            <div className="p-10 text-center text-[#8b949e]">Loading schools…</div>
          ) : (
            <table className="min-w-full">
              <thead className="bg-[#1c2330] border-b border-[#21262d]">
                <tr>
                  <th className="px-5 py-3 text-left text-xs text-[#8b949e] uppercase tracking-wider">Name</th>
                  <th className="px-5 py-3 text-left text-xs text-[#8b949e] uppercase tracking-wider">Location</th>
                  <th className="px-5 py-3 text-left text-xs text-[#8b949e] uppercase tracking-wider">Phone</th>
                  <th className="px-5 py-3 text-left text-xs text-[#8b949e] uppercase tracking-wider">Members</th>
                  <th className="px-5 py-3 text-left text-xs text-[#8b949e] uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3 text-left text-xs text-[#8b949e] uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-10 text-center text-[#6e7681]">
                      No schools match your filters.
                    </td>
                  </tr>
                ) : filtered.map(school => (
                  <tr
                    key={school.id}
                    onClick={() => setSelected(s => s?.id === school.id ? null : school)}
                    className={`border-b border-[#21262d] cursor-pointer transition ${
                      selected?.id === school.id
                        ? "bg-[#1a3a2a]"
                        : "hover:bg-[#1c2330]"
                    }`}
                  >
                    <td className="px-5 py-3.5 text-[#e6edf3] font-medium text-sm">{school.name}</td>
                    <td className="px-5 py-3.5 text-[#8b949e] text-sm">{school.location ?? "—"}</td>
                    <td className="px-5 py-3.5 text-[#8b949e] text-sm">{school.phone ?? "—"}</td>
                    <td className="px-5 py-3.5 text-[#8b949e] text-sm">{school.profiles?.length ?? 0}</td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={school.registrationStatus} />
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={e => openEdit(school, e)}
                          className="px-3 py-1 text-xs font-semibold rounded bg-[#21262d] border border-[#30363d] text-[#e6edf3] hover:border-[#2ea043] transition">
                          ✏️ Edit
                        </button>
                        <button
                          onClick={e => { e.stopPropagation(); setDeleteTarget(school); }}
                          className="px-3 py-1 text-xs font-semibold rounded bg-[#3d1a1a] border border-[#f85149] text-[#f85149] hover:bg-[#5a1e1e] transition">
                          🗑 Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* ── Detail panel ────────────────────────────────────────── */}
        {selected && (
          <div className="w-80 flex-shrink-0 bg-[#161b22] border border-[#21262d] rounded-xl p-5 sticky top-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-[#e6edf3]">School Details</h2>
              <button onClick={() => setSelected(null)}
                className="text-[#6e7681] hover:text-[#e6edf3] text-lg transition">✕</button>
            </div>

            {/* School initial avatar */}
            <div className="w-14 h-14 rounded-xl bg-[#1a3a2a] border border-[#2ea043] flex items-center justify-center text-2xl font-bold text-[#2ea043] mb-4">
              {selected.name?.[0]?.toUpperCase() ?? "S"}
            </div>

            <h3 className="text-base font-semibold text-[#e6edf3] mb-1">{selected.name}</h3>
            <div className="mb-4"><StatusBadge status={selected.registrationStatus} /></div>

            <div className="space-y-3 text-sm">
              <Row label="Location" value={selected.location ?? "—"} />
              <Row label="Phone"    value={selected.phone    ?? "—"} />
              <Row label="Members"  value={selected.profiles?.length ?? 0} />
              <Row label="Resources" value={selected.resources?.length ?? 0} />
              {selected.registrationFeePaid && (
                <Row label="Fee Paid" value={`MWK ${Number(selected.registrationFeePaid).toLocaleString()}`} />
              )}
              {selected.registrationTxRef && (
                <Row label="Tx Ref" value={selected.registrationTxRef} mono />
              )}
              {selected.createdAt && (
                <Row label="Registered" value={new Date(selected.createdAt).toLocaleDateString()} />
              )}
            </div>

            <div className="mt-5 flex gap-2">
              <button
                onClick={e => openEdit(selected, e)}
                className="flex-1 py-1.5 text-xs font-semibold rounded-lg bg-[#21262d] border border-[#30363d] text-[#e6edf3] hover:border-[#2ea043] transition">
                ✏️ Edit
              </button>
              <button
                onClick={() => setDeleteTarget(selected)}
                className="flex-1 py-1.5 text-xs font-semibold rounded-lg bg-[#3d1a1a] border border-[#f85149] text-[#f85149] hover:bg-[#5a1e1e] transition">
                🗑 Delete
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Edit Modal ─────────────────────────────────────────────── */}
      {editTarget && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-40 p-4">
          <div className="bg-[#161b22] border border-[#30363d] rounded-xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold text-[#e6edf3]">✏️ Edit School</h2>
              <button onClick={() => setEditTarget(null)}
                className="text-[#6e7681] hover:text-[#e6edf3] text-xl">✕</button>
            </div>

            {editError && (
              <div className="mb-4 px-3 py-2 rounded-lg bg-[#3d1f1f] border border-[#f85149] text-[#f85149] text-xs">
                {editError}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="text-xs text-[#8b949e] uppercase tracking-wider mb-1.5 block">School Name *</label>
                <input type="text" value={editForm.name ?? ""}
                  onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                  className={inputCls} placeholder="School name" disabled={editLoading} />
              </div>
              <div>
                <label className="text-xs text-[#8b949e] uppercase tracking-wider mb-1.5 block">Location</label>
                <input type="text" value={editForm.location ?? ""}
                  onChange={e => setEditForm(f => ({ ...f, location: e.target.value }))}
                  className={inputCls} placeholder="e.g. Lilongwe, Malawi" disabled={editLoading} />
              </div>
              <div>
                <label className="text-xs text-[#8b949e] uppercase tracking-wider mb-1.5 block">Phone</label>
                <input type="tel" value={editForm.phone ?? ""}
                  onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))}
                  className={inputCls} placeholder="e.g. +265 999 000 000" disabled={editLoading} />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setEditTarget(null)} disabled={editLoading}
                className="flex-1 py-2 text-sm font-semibold rounded-lg bg-[#21262d] border border-[#30363d] text-[#e6edf3] hover:border-[#6e7681] transition disabled:opacity-50">
                Cancel
              </button>
              <button onClick={handleEditSave} disabled={editLoading}
                className="flex-1 py-2 text-sm font-semibold rounded-lg bg-[#2ea043] text-white hover:bg-[#3fb950] transition disabled:opacity-50">
                {editLoading ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirm Modal ───────────────────────────────────── */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-40 p-4">
          <div className="bg-[#161b22] border border-[#f85149] rounded-xl w-full max-w-sm p-6 shadow-2xl text-center">
            <div className="text-4xl mb-3">🗑️</div>
            <h2 className="text-lg font-bold text-[#e6edf3] mb-2">Delete School?</h2>
            <p className="text-sm text-[#8b949e] mb-6">
              Are you sure you want to permanently delete{" "}
              <span className="text-[#e6edf3] font-semibold">"{deleteTarget.name}"</span>?
              This will also remove all associated data. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)} disabled={deleteLoading}
                className="flex-1 py-2 text-sm font-semibold rounded-lg bg-[#21262d] border border-[#30363d] text-[#e6edf3] hover:border-[#6e7681] transition disabled:opacity-50">
                Cancel
              </button>
              <button onClick={handleDelete} disabled={deleteLoading}
                className="flex-1 py-2 text-sm font-semibold rounded-lg bg-[#f85149] text-white hover:bg-[#da3633] transition disabled:opacity-50">
                {deleteLoading ? "Deleting…" : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Detail row helper ────────────────────────────────────────────────────────
const Row = ({ label, value, mono = false }) => (
  <div className="flex justify-between items-start gap-2">
    <span className="text-[#6e7681] flex-shrink-0">{label}</span>
    <span className={`text-[#e6edf3] text-right ${mono ? "font-mono text-xs" : ""}`}>
      {value}
    </span>
  </div>
);

export default Schools;