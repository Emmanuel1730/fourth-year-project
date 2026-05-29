import { useState, useEffect } from 'react'

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

const TYPE_STYLES = {
  Upload:          { bg: '#f0883e20', text: '#f0883e' },
  Registration:    { bg: '#388bfd20', text: '#388bfd' },
  School:          { bg: '#2ea04320', text: '#2ea043' },
  Issue:           { bg: '#da363320', text: '#da3633' },
  DELETE_RESOURCE: { bg: '#da363320', text: '#da3633' },
  Delete:          { bg: '#da363320', text: '#da3633' },
  Access:          { bg: '#a371f720', text: '#a371f7' },
}

const STATUS_STYLES = {
  PENDING:  { bg: '#f0883e20', text: '#f0883e' },
  APPROVED: { bg: '#2ea04320', text: '#2ea043' },
  REJECTED: { bg: '#da363320', text: '#da3633' },
}

const isDeleteType = (type) => type === 'Delete' || type === 'DELETE_RESOURCE'
const getActionLabels = (type) => {
  if (isDeleteType(type)) return { approve: 'Approve Delete', reject: 'Decline' }
  if (['Access', 'School', 'Registration'].includes(type)) return { approve: 'Approve Access', reject: 'Decline' }
  return { approve: 'Approve', reject: 'Reject' }
}

const parseDeleteDescription = (description) => {
  if (!description) return null
  try {
    const parsed = JSON.parse(description)
    if (parsed.filePath) {
      const parts = parsed.filePath.split('/')
      return { fileName: decodeURIComponent(parts[parts.length - 1]), resourceId: parsed.resourceId }
    }
  } catch { return null }
  return null
}

const TrashIcon = ({ size = 14, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6M14 11v6" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
)
const CheckIcon = ({ size = 13 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)
const XIcon = ({ size = 13 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)
const Spinner = () => (
  <span style={{ display: 'inline-block', width: 12, height: 12, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
)

const RequestsPage = ({ isDarkMode = true }) => {
  const [requests, setRequests]           = useState([])
  const [loading, setLoading]             = useState(true)
  const [error, setError]                 = useState(null)
  const [searchTerm, setSearchTerm]       = useState('')
  const [typeFilter, setTypeFilter]       = useState('All Types')
  const [statusFilter, setStatusFilter]   = useState('All Status')
  const [actionLoading, setActionLoading] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)

  const t = {
    bg:        isDarkMode ? '#0d1117' : '#f8fafc',
    cardBg:    isDarkMode ? '#161b22' : '#ffffff',
    headerBg:  isDarkMode ? '#1c2330' : '#f1f5f9',
    border:    isDarkMode ? '#21262d' : '#e2e8f0',
    text:      isDarkMode ? '#e6edf3' : '#0f172a',
    muted:     isDarkMode ? '#8b949e' : '#64748b',
    dim:       isDarkMode ? '#6e7681' : '#94a3b8',
    inputBg:   isDarkMode ? '#161b22' : '#ffffff',
    rowHover:  isDarkMode ? '#1c2330' : '#f8fafc',
    statBg:    isDarkMode ? '#161b22' : '#ffffff',
    btnBg:     isDarkMode ? '#1c2330' : '#f1f5f9',
    btnBorder: isDarkMode ? '#21262d' : '#e2e8f0',
    errBg:     isDarkMode ? '#3d1f1f' : '#fef2f2',
  }

  const headers = () => {
    const token = localStorage.getItem('accessToken')
    return { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }
  }

  const fetchRequests = async () => {
    try {
      setLoading(true)
      const res = await fetch(`${API_BASE}/request`, { headers: headers() })
      if (!res.ok) throw new Error(`Failed to fetch requests: ${res.status}`)
      const data = await res.json()
      setRequests(Array.isArray(data) ? data : [])
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchRequests() }, [])

  const handleUpdateStatus = async (id, status) => {
    setActionLoading(`${id}-${status}`)
    try {
      const res = await fetch(`${API_BASE}/request/${id}/status`, { method: 'PATCH', headers: headers(), body: JSON.stringify({ status }) })
      if (!res.ok) throw new Error('Failed to update status')
      await fetchRequests()
    } catch (err) { alert(err.message) }
    finally { setActionLoading(null) }
  }

  const handleDeleteRequest = async (id) => {
    setActionLoading(`${id}-delete`); setConfirmDelete(null)
    try {
      const res = await fetch(`${API_BASE}/request/${id}`, { method: 'DELETE', headers: headers() })
      if (!res.ok) throw new Error('Failed to delete request')
      await fetchRequests()
    } catch (err) { alert(err.message) }
    finally { setActionLoading(null) }
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '—'
    const diff = Math.floor((Date.now() - new Date(dateStr)) / 86400000)
    if (diff === 0) return 'Today'
    if (diff === 1) return 'Yesterday'
    return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
  }

  const types = ['All Types', ...new Set(requests.map(r => r.type))]
  const statuses = ['All Status', 'PENDING', 'APPROVED', 'REJECTED']
  const filtered = requests.filter(req => {
    const matchesSearch = !searchTerm || req.requestName?.toLowerCase().includes(searchTerm.toLowerCase()) || req.fromUser?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch && (typeFilter === 'All Types' || req.type === typeFilter) && (statusFilter === 'All Status' || req.status === statusFilter)
  })
  const pendingCount = requests.filter(r => r.status === 'PENDING').length
  const selectOpt = { background: isDarkMode ? '#161b22' : '#ffffff', color: t.text }

  return (
    <div style={{ padding: 24, minHeight: '100vh', background: t.bg }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <div style={{ marginBottom: 20 }}>
        <h1 style={{ color: t.text, fontSize: 22, fontWeight: 700, margin: 0 }}>Requests</h1>
        <p style={{ color: t.dim, fontSize: 13, marginTop: 4 }}>Approve or reject incoming requests from teachers and students</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Total',    value: requests.length,                                       color: t.muted },
          { label: 'Pending',  value: pendingCount,                                          color: '#f0883e' },
          { label: 'Approved', value: requests.filter(r => r.status === 'APPROVED').length,  color: '#2ea043' },
          { label: 'Rejected', value: requests.filter(r => r.status === 'REJECTED').length,  color: '#da3633' },
        ].map(s => (
          <div key={s.label} style={{ flex: 1, background: t.statBg, border: `1px solid ${t.border}`, borderRadius: 10, padding: '14px 16px' }}>
            <div style={{ color: s.color, fontSize: 22, fontWeight: 700 }}>{s.value}</div>
            <div style={{ color: t.dim, fontSize: 12, marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <input type="text" placeholder="Search by name or user…" value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          style={{ flex: 1, minWidth: 220, background: t.inputBg, border: `1px solid ${t.border}`, borderRadius: 8, padding: '8px 14px', color: t.text, fontSize: 13, outline: 'none' }}
          onFocus={e => e.target.style.borderColor = '#388bfd'} onBlur={e => e.target.style.borderColor = t.border} />
        {[{ value: typeFilter, setter: setTypeFilter, opts: types }, { value: statusFilter, setter: setStatusFilter, opts: statuses }].map(({ value, setter, opts }, i) => (
          <select key={i} value={value} onChange={e => setter(e.target.value)}
            style={{ background: t.inputBg, border: `1px solid ${t.border}`, borderRadius: 8, padding: '8px 14px', color: t.text, fontSize: 13, outline: 'none' }}>
            {opts.map(o => <option key={o} value={o} style={selectOpt}>{o}</option>)}
          </select>
        ))}
      </div>

      {loading && <div style={{ textAlign: 'center', padding: 48, color: t.muted }}>Loading requests…</div>}
      {error && <div style={{ background: t.errBg, border: '1px solid #f85149', borderRadius: 8, padding: '12px 16px', marginBottom: 16, color: '#f85149', fontSize: 13 }}>{error}</div>}

      {!loading && !error && (
        <div style={{ background: t.cardBg, border: `1px solid ${t.border}`, borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', borderBottom: `1px solid ${t.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ color: t.text, fontSize: 14, fontWeight: 600, margin: 0 }}>Pending Requests & Approvals</h2>
            <span style={{ color: t.muted, fontSize: 12 }}>{pendingCount} item{pendingCount !== 1 ? 's' : ''} need attention</span>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: t.headerBg, borderBottom: `1px solid ${t.border}` }}>
              <tr>
                {['Request', 'From', 'Type', 'Date', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '10px 20px', textAlign: 'left', color: t.dim, fontSize: 11, textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(req => {
                const typeStyle   = TYPE_STYLES[req.type]    ?? { bg: '#6e768120', text: '#8b949e' }
                const statusStyle = STATUS_STYLES[req.status] ?? { bg: '#6e768120', text: '#8b949e' }
                const isPending   = req.status === 'PENDING'
                const isDelReq    = isDeleteType(req.type)
                const labels      = getActionLabels(req.type)
                const deleteInfo  = isDelReq ? parseDeleteDescription(req.description) : null

                return (
                  <tr key={req.id}
                    style={{ borderBottom: `1px solid ${t.border}`, background: isDelReq && isPending ? 'rgba(218,54,51,0.03)' : 'transparent', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = t.rowHover}
                    onMouseLeave={e => e.currentTarget.style.background = isDelReq && isPending ? 'rgba(218,54,51,0.03)' : 'transparent'}>

                    <td style={{ padding: '14px 20px', maxWidth: 260 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {isDelReq && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 20, height: 20, borderRadius: 4, background: '#da363320', flexShrink: 0 }}>
                            <TrashIcon size={11} color="#da3633" />
                          </span>
                        )}
                        <span style={{ color: t.text, fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{req.requestName}</span>
                      </div>
                      {deleteInfo?.fileName && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4, color: '#da3633', fontSize: 11 }}>
                          <TrashIcon size={10} color="#da3633" />
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{deleteInfo.fileName}</span>
                        </div>
                      )}
                      {!isDelReq && req.description && (
                        <div style={{ color: t.dim, fontSize: 12, marginTop: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{req.description}</div>
                      )}
                    </td>

                    <td style={{ padding: '14px 20px', color: t.muted, fontSize: 13, whiteSpace: 'nowrap' }}>{req.fromUser}</td>
                    <td style={{ padding: '14px 20px', whiteSpace: 'nowrap' }}>
                      <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: typeStyle.bg, color: typeStyle.text }}>{req.type}</span>
                    </td>
                    <td style={{ padding: '14px 20px', color: t.muted, fontSize: 13, whiteSpace: 'nowrap' }}>{formatDate(req.createdAt)}</td>
                    <td style={{ padding: '14px 20px', whiteSpace: 'nowrap' }}>
                      <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: statusStyle.bg, color: statusStyle.text }}>{req.status}</span>
                    </td>

                    <td style={{ padding: '14px 20px', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        {isPending && (
                          <>
                            <button disabled={!!actionLoading} onClick={() => handleUpdateStatus(req.id, 'APPROVED')}
                              style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 6, border: 'none', fontSize: 12, fontWeight: 500, cursor: 'pointer', background: isDelReq ? '#da3633' : '#2ea043', color: '#fff', opacity: actionLoading ? 0.6 : 1 }}>
                              {actionLoading === `${req.id}-APPROVED` ? <Spinner /> : isDelReq ? <><TrashIcon size={12} color="#fff" /> {labels.approve}</> : <><CheckIcon size={12} /> {labels.approve}</>}
                            </button>
                            <button disabled={!!actionLoading} onClick={() => handleUpdateStatus(req.id, 'REJECTED')}
                              style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 6, border: `1px solid ${t.border}`, fontSize: 12, fontWeight: 500, cursor: 'pointer', background: t.btnBg, color: t.muted, opacity: actionLoading ? 0.6 : 1 }}>
                              {actionLoading === `${req.id}-REJECTED` ? <Spinner /> : <><XIcon size={12} /> {labels.reject}</>}
                            </button>
                          </>
                        )}
                        <button disabled={!!actionLoading} onClick={() => setConfirmDelete(req)}
                          style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 30, height: 30, borderRadius: 6, border: `1px solid ${t.border}`, cursor: 'pointer', background: t.btnBg, color: t.dim, opacity: actionLoading ? 0.6 : 1 }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor = '#da3633'; e.currentTarget.style.color = '#da3633' }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor = t.border; e.currentTarget.style.color = t.dim }}>
                          {actionLoading === `${req.id}-delete` ? <Spinner /> : <TrashIcon size={13} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {filtered.length === 0 && <div style={{ padding: 48, textAlign: 'center', color: t.dim, fontSize: 13 }}>No requests found matching your filters.</div>}
        </div>
      )}

      {!loading && !error && <div style={{ marginTop: 12, color: t.dim, fontSize: 12 }}>Showing {filtered.length} of {requests.length} requests</div>}

      {confirmDelete && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ background: t.cardBg, border: '1px solid #da3633', borderRadius: 14, padding: 28, maxWidth: 380, width: '100%', margin: '0 16px' }}>
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 48, height: 48, borderRadius: '50%', background: '#da363320', marginBottom: 12 }}>
                <TrashIcon size={22} color="#da3633" />
              </div>
              <div style={{ color: t.text, fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Delete Request Record?</div>
              <div style={{ color: t.muted, fontSize: 13, lineHeight: 1.5 }}>
                This will remove <span style={{ color: t.text, fontWeight: 600 }}>"{confirmDelete.requestName}"</span> from the system. This does <em>not</em> delete the associated file.
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setConfirmDelete(null)}
                style={{ flex: 1, padding: '10px 0', borderRadius: 8, border: `1px solid ${t.border}`, background: t.btnBg, color: t.text, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                Cancel
              </button>
              <button onClick={() => handleDeleteRequest(confirmDelete.id)}
                style={{ flex: 1, padding: '10px 0', borderRadius: 8, border: 'none', background: '#da3633', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                Delete Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default RequestsPage