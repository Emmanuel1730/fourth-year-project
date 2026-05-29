import { useState, useEffect } from 'react'

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'
const token = () => localStorage.getItem('accessToken')
const authHeaders = () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` })
const EMPTY_FORM = { firstName: '', lastName: '', email: '', password: '', bio: '' }

const AdminsPage = ({ isDarkMode = true }) => {
  const [admins, setAdmins]         = useState([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState(null)
  const [showForm, setShowForm]     = useState(false)
  const [form, setForm]             = useState(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError]   = useState(null)
  const [search, setSearch]         = useState('')

  const t = {
    bg:        isDarkMode ? '#0d1117' : '#f8fafc',
    cardBg:    isDarkMode ? '#161b22' : '#ffffff',
    border:    isDarkMode ? '#21262d' : '#e2e8f0',
    text:      isDarkMode ? '#e6edf3' : '#0f172a',
    muted:     isDarkMode ? '#8b949e' : '#64748b',
    dim:       isDarkMode ? '#6e7681' : '#94a3b8',
    inputBg:   isDarkMode ? '#1c2330' : '#f8fafc',
    rowHover:  isDarkMode ? '#1c2330' : '#f8fafc',
    errBg:     isDarkMode ? 'rgba(218,54,51,0.1)' : '#fef2f2',
    btnSecBg:  isDarkMode ? '#1c2330' : '#f1f5f9',
  }

  const fetchAdmins = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/profiles/admins`, { headers: authHeaders() })
      if (!res.ok) throw new Error(`Failed: ${res.status}`)
      const data = await res.json()
      setAdmins(Array.isArray(data) ? data : [])
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchAdmins() }, [])

  const handleSubmit = async () => {
    setFormError(null)
    for (const f of ['firstName', 'lastName', 'email', 'password']) {
      if (!form[f]) { setFormError(`${f} is required`); return }
    }
    setSubmitting(true)
    try {
      const res = await fetch(`${API_BASE}/profiles/create-admin`, { method: 'POST', headers: authHeaders(), body: JSON.stringify(form) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message ?? 'Failed to create admin')
      setShowForm(false); setForm(EMPTY_FORM); await fetchAdmins()
    } catch (e) { setFormError(e.message) }
    finally { setSubmitting(false) }
  }

  const handleDeactivate = async (id, isActive) => {
    if (!confirm(`${isActive ? 'Deactivate' : 'Reactivate'} this admin?`)) return
    try {
      const res = await fetch(`${API_BASE}/profiles/${id}`, { method: 'PATCH', headers: authHeaders(), body: JSON.stringify({ isActive: !isActive }) })
      if (!res.ok) throw new Error('Failed to update')
      await fetchAdmins()
    } catch (e) { alert(e.message) }
  }

  const filtered = admins.filter(a => `${a.firstName} ${a.lastName} ${a.email}`.toLowerCase().includes(search.toLowerCase()))
  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'
  const initials = (a) => `${a.firstName?.[0] ?? ''}${a.lastName?.[0] ?? ''}`.toUpperCase()
  const inputStyle = { width: '100%', boxSizing: 'border-box', background: t.inputBg, border: `1px solid ${t.border}`, borderRadius: 8, padding: '8px 12px', color: t.text, fontSize: 13, outline: 'none' }

  return (
    <div style={{ padding: 24, minHeight: '100vh', background: t.bg }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ color: t.text, fontSize: 22, fontWeight: 700, margin: 0 }}>Administrators</h1>
        <p style={{ color: t.dim, fontSize: 13, marginTop: 4 }}>Manage system admins with full access to EduLib</p>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <input placeholder="Search admins…" value={search} onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: 220, background: t.cardBg, border: `1px solid ${t.border}`, borderRadius: 8, padding: '8px 14px', color: t.text, fontSize: 13, outline: 'none' }}
          onFocus={e => e.target.style.borderColor = '#388bfd'} onBlur={e => e.target.style.borderColor = t.border} />
        <button onClick={() => { setShowForm(true); setFormError(null) }}
          style={{ background: '#388bfd', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          + Add Admin
        </button>
      </div>

      {/* Create Admin Form */}
      {showForm && (
        <div style={{ background: t.cardBg, border: `1px solid ${t.border}`, borderRadius: 12, padding: 24, marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ color: t.text, fontSize: 15, fontWeight: 600, margin: 0 }}>Create New Admin</h3>
            <button onClick={() => { setShowForm(false); setFormError(null) }}
              style={{ background: 'none', border: 'none', color: t.dim, cursor: 'pointer', fontSize: 18 }}>✕</button>
          </div>
          {formError && (
            <div style={{ background: t.errBg, border: '1px solid #f85149', borderRadius: 8, padding: '10px 14px', marginBottom: 16, color: '#f85149', fontSize: 13 }}>{formError}</div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {[
              { key: 'firstName', label: 'First Name', placeholder: 'e.g. James' },
              { key: 'lastName',  label: 'Last Name',  placeholder: 'e.g. Phiri' },
              { key: 'email',     label: 'Email',      placeholder: 'admin@edulib.mw', type: 'email' },
              { key: 'password',  label: 'Password',   placeholder: '••••••••',        type: 'password' },
            ].map(({ key, label, placeholder, type = 'text' }) => (
              <div key={key}>
                <label style={{ color: t.muted, fontSize: 11, textTransform: 'uppercase', letterSpacing: '.06em', display: 'block', marginBottom: 6 }}>{label}</label>
                <input type={type} placeholder={placeholder} value={form[key]}
                  onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = '#388bfd'} onBlur={e => e.target.style.borderColor = t.border} />
              </div>
            ))}
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ color: t.muted, fontSize: 11, textTransform: 'uppercase', letterSpacing: '.06em', display: 'block', marginBottom: 6 }}>Bio (Optional)</label>
              <textarea placeholder="Short bio…" value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} rows={2}
                style={{ ...inputStyle, resize: 'vertical' }} />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
            <button onClick={() => { setShowForm(false); setFormError(null) }}
              style={{ background: t.btnSecBg, border: `1px solid ${t.border}`, color: t.muted, borderRadius: 8, padding: '8px 18px', fontSize: 13, cursor: 'pointer' }}>
              Cancel
            </button>
            <button onClick={handleSubmit} disabled={submitting}
              style={{ background: '#388bfd', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: submitting ? .6 : 1 }}>
              {submitting ? 'Creating…' : 'Create Admin'}
            </button>
          </div>
        </div>
      )}

      {/* Stats */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Total Admins', value: admins.length,                         color: '#388bfd' },
          { label: 'Active',       value: admins.filter(a => a.isActive).length,  color: '#2ea043' },
          { label: 'Inactive',     value: admins.filter(a => !a.isActive).length, color: '#f0883e' },
        ].map(s => (
          <div key={s.label} style={{ flex: 1, background: t.cardBg, border: `1px solid ${t.border}`, borderRadius: 10, padding: '14px 16px' }}>
            <div style={{ color: s.color, fontSize: 22, fontWeight: 700 }}>{s.value}</div>
            <div style={{ color: t.dim, fontSize: 12, marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 48, color: t.muted }}>Loading admins…</div>
      ) : error ? (
        <div style={{ background: t.errBg, border: '1px solid #f85149', borderRadius: 8, padding: 16, color: '#f85149', fontSize: 13 }}>{error}</div>
      ) : (
        <div style={{ background: t.cardBg, border: `1px solid ${t.border}`, borderRadius: 12, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${t.border}` }}>
                {['Admin', 'Email', 'Joined', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', color: t.dim, fontSize: 11, textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(admin => (
                <tr key={admin.id} style={{ borderBottom: `1px solid ${t.border}` }}
                  onMouseEnter={e => e.currentTarget.style.background = t.rowHover}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #388bfd, #2ea043)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                        {initials(admin)}
                      </div>
                      <div>
                        <div style={{ color: t.text, fontSize: 13, fontWeight: 500 }}>{admin.firstName} {admin.lastName}</div>
                        {admin.bio && <div style={{ color: t.dim, fontSize: 11, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{admin.bio}</div>}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px', color: t.muted, fontSize: 13 }}>{admin.email}</td>
                  <td style={{ padding: '12px 16px', color: t.muted, fontSize: 13 }}>{formatDate(admin.joinDate)}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: admin.isActive ? 'rgba(46,160,67,0.12)' : 'rgba(240,136,62,0.12)', color: admin.isActive ? '#2ea043' : '#f0883e' }}>
                      {admin.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <button onClick={() => handleDeactivate(admin.id, admin.isActive)}
                      style={{ background: t.btnSecBg, border: `1px solid ${t.border}`, color: admin.isActive ? '#f0883e' : '#2ea043', borderRadius: 6, padding: '5px 12px', fontSize: 12, cursor: 'pointer' }}>
                      {admin.isActive ? 'Deactivate' : 'Reactivate'}
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={5} style={{ padding: 32, textAlign: 'center', color: t.dim, fontSize: 13 }}>No admins found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default AdminsPage