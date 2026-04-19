import { useState, useEffect } from 'react'

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

const TYPE_STYLES = {
  Upload:       { bg: '#f0883e20', text: '#f0883e' },
  Registration: { bg: '#388bfd20', text: '#388bfd' },
  School:       { bg: '#2ea04320', text: '#2ea043' },
  Issue:        { bg: '#da363320', text: '#da3633' },
  Delete:       { bg: '#da363320', text: '#da3633' },
  Access:       { bg: '#a371f720', text: '#a371f7' },
}

const STATUS_STYLES = {
  PENDING:  { bg: '#f0883e20', text: '#f0883e' },
  APPROVED: { bg: '#2ea04320', text: '#2ea043' },
  REJECTED: { bg: '#da363320', text: '#da3633' },
}

/**
 * Returns the right action label(s) based on request type.
 * - Delete  → "Approve Delete" / "Decline Delete"
 * - Access/School/Registration → "Approve Access" / "Decline"
 * - Upload/Issue/etc → generic "Approve" / "Reject"
 */
const getActionLabels = (type) => {
  if (type === 'Delete')
    return { approve: '🗑 Approve Delete', reject: 'Decline' }
  if (['Access', 'School', 'Registration'].includes(type))
    return { approve: '✅ Approve Access', reject: 'Decline' }
  return { approve: 'Approve', reject: 'Reject' }
}

const RequestsPage = () => {
  const [requests, setRequests]           = useState([])
  const [loading, setLoading]             = useState(true)
  const [error, setError]                 = useState(null)
  const [searchTerm, setSearchTerm]       = useState('')
  const [typeFilter, setTypeFilter]       = useState('All Types')
  const [statusFilter, setStatusFilter]   = useState('All Status')
  const [actionLoading, setActionLoading] = useState(null)

  const headers = () => {
    const token = localStorage.getItem('accessToken')
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    }
  }

  const fetchRequests = async () => {
    try {
      setLoading(true)
      const res = await fetch(`${API_BASE}/request`, { headers: headers() })
      if (!res.ok) throw new Error(`Failed to fetch requests: ${res.status}`)
      const data = await res.json()
      setRequests(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchRequests() }, [])

  const handleUpdateStatus = async (id, status) => {
    setActionLoading(`${id}-${status}`)
    try {
      const res = await fetch(`${API_BASE}/request/${id}/status`, {
        method: 'PATCH',
        headers: headers(),
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error('Failed to update status')
      await fetchRequests()
    } catch (err) {
      alert(err.message)
    } finally {
      setActionLoading(null)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this request?')) return
    setActionLoading(`${id}-delete`)
    try {
      const res = await fetch(`${API_BASE}/request/${id}`, {
        method: 'DELETE', headers: headers(),
      })
      if (!res.ok) throw new Error('Failed to delete request')
      await fetchRequests()
    } catch (err) {
      alert(err.message)
    } finally {
      setActionLoading(null)
    }
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '—'
    const diff = Math.floor((Date.now() - new Date(dateStr)) / 86400000)
    if (diff === 0) return 'Today'
    if (diff === 1) return 'Yesterday'
    return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
  }

  const types    = ['All Types', ...new Set(requests.map((r) => r.type))]
  const statuses = ['All Status', 'PENDING', 'APPROVED', 'REJECTED']

  const filtered = requests.filter((req) => {
    const matchesSearch = !searchTerm ||
      req.requestName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.fromUser?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType   = typeFilter === 'All Types' || req.type === typeFilter
    const matchesStatus = statusFilter === 'All Status' || req.status === statusFilter
    return matchesSearch && matchesType && matchesStatus
  })

  const pendingCount  = requests.filter((r) => r.status === 'PENDING').length
  const approvedCount = requests.filter((r) => r.status === 'APPROVED').length

  return (
    <div style={{ padding: 24, minHeight: '100vh', background: '#0d1117' }}>

      {/* Page header */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ color: '#e6edf3', fontSize: 22, fontWeight: 700, margin: 0 }}>
          Requests
        </h1>
        <p style={{ color: '#6e7681', fontSize: 13, marginTop: 4 }}>
          Approve or reject incoming requests from teachers and students
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Total',    value: requests.length, color: '#8b949e' },
          { label: 'Pending',  value: pendingCount,     color: '#f0883e' },
          { label: 'Approved', value: approvedCount,    color: '#2ea043' },
          { label: 'Rejected', value: requests.filter(r => r.status === 'REJECTED').length, color: '#da3633' },
        ].map(s => (
          <div key={s.label} style={{
            flex: 1, background: '#161b22', border: '1px solid #21262d',
            borderRadius: 10, padding: '14px 16px',
          }}>
            <div style={{ color: s.color, fontSize: 22, fontWeight: 700 }}>{s.value}</div>
            <div style={{ color: '#6e7681', fontSize: 12, marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Search by name or user…"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            flex: 1, minWidth: 220,
            background: '#161b22', border: '1px solid #21262d',
            borderRadius: 8, padding: '8px 14px',
            color: '#e6edf3', fontSize: 13, outline: 'none',
          }}
          onFocus={e => e.target.style.borderColor = '#388bfd'}
          onBlur={e => e.target.style.borderColor = '#21262d'}
        />
        <select
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value)}
          style={{ background: '#161b22', border: '1px solid #21262d', borderRadius: 8, padding: '8px 14px', color: '#e6edf3', fontSize: 13, outline: 'none' }}
        >
          {types.map(t => <option key={t} value={t} style={{ background: '#161b22' }}>{t}</option>)}
        </select>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          style={{ background: '#161b22', border: '1px solid #21262d', borderRadius: 8, padding: '8px 14px', color: '#e6edf3', fontSize: 13, outline: 'none' }}
        >
          {statuses.map(s => <option key={s} value={s} style={{ background: '#161b22' }}>{s}</option>)}
        </select>
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: 48, color: '#8b949e' }}>Loading requests…</div>
      )}

      {error && (
        <div style={{ background: '#3d1f1f', border: '1px solid #f85149', borderRadius: 8, padding: '12px 16px', marginBottom: 16, color: '#f85149', fontSize: 13 }}>
          {error}
        </div>
      )}

      {!loading && !error && (
        <div style={{ background: '#161b22', border: '1px solid #21262d', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid #21262d', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ color: '#e6edf3', fontSize: 14, fontWeight: 600, margin: 0 }}>
              Pending Requests & Approvals
            </h2>
            <span style={{ color: '#8b949e', fontSize: 12 }}>
              {pendingCount} item{pendingCount !== 1 ? 's' : ''} need attention
            </span>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: '#1c2330', borderBottom: '1px solid #21262d' }}>
              <tr>
                {['Request', 'From', 'Type', 'Date', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '10px 20px', textAlign: 'left', color: '#6e7681', fontSize: 11, textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 600 }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(req => {
                const typeStyle   = TYPE_STYLES[req.type]   ?? { bg: '#6e768120', text: '#8b949e' }
                const statusStyle = STATUS_STYLES[req.status] ?? { bg: '#6e768120', text: '#8b949e' }
                const isPending   = req.status === 'PENDING'
                const isDelete    = req.type === 'Delete'
                const labels      = getActionLabels(req.type)

                return (
                  <tr
                    key={req.id}
                    style={{ borderBottom: '1px solid #21262d', background: isDelete && isPending ? 'rgba(218,54,51,0.03)' : 'transparent' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#1c2330'}
                    onMouseLeave={e => e.currentTarget.style.background = isDelete && isPending ? 'rgba(218,54,51,0.03)' : 'transparent'}
                  >
                    <td style={{ padding: '14px 20px', maxWidth: 240 }}>
                      <div style={{ color: '#e6edf3', fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {isDelete && <span style={{ marginRight: 6 }}>⚠️</span>}
                        {req.requestName}
                      </div>
                      {req.description && (
                        <div style={{ color: '#6e7681', fontSize: 12, marginTop: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {req.description}
                        </div>
                      )}
                    </td>

                    <td style={{ padding: '14px 20px', color: '#8b949e', fontSize: 13, whiteSpace: 'nowrap' }}>
                      {req.fromUser}
                    </td>

                    <td style={{ padding: '14px 20px', whiteSpace: 'nowrap' }}>
                      <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: typeStyle.bg, color: typeStyle.text }}>
                        {req.type}
                      </span>
                    </td>

                    <td style={{ padding: '14px 20px', color: '#8b949e', fontSize: 13, whiteSpace: 'nowrap' }}>
                      {formatDate(req.createdAt)}
                    </td>

                    <td style={{ padding: '14px 20px', whiteSpace: 'nowrap' }}>
                      <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: statusStyle.bg, color: statusStyle.text }}>
                        {req.status}
                      </span>
                    </td>

                    <td style={{ padding: '14px 20px', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {isPending && (
                          <>
                            <button
                              disabled={!!actionLoading}
                              onClick={() => handleUpdateStatus(req.id, 'APPROVED')}
                              style={{
                                padding: '5px 12px', borderRadius: 6, border: 'none',
                                fontSize: 12, fontWeight: 500, cursor: 'pointer',
                                background: isDelete ? '#da3633' : '#2ea043',
                                color: '#fff', opacity: actionLoading ? .6 : 1,
                              }}
                            >
                              {actionLoading === `${req.id}-APPROVED` ? '…' : labels.approve}
                            </button>
                            <button
                              disabled={!!actionLoading}
                              onClick={() => handleUpdateStatus(req.id, 'REJECTED')}
                              style={{
                                padding: '5px 12px', borderRadius: 6,
                                border: '1px solid #21262d',
                                fontSize: 12, fontWeight: 500, cursor: 'pointer',
                                background: '#1c2330', color: '#8b949e',
                                opacity: actionLoading ? .6 : 1,
                              }}
                            >
                              {actionLoading === `${req.id}-REJECTED` ? '…' : labels.reject}
                            </button>
                          </>
                        )}
                        <button
                          disabled={!!actionLoading}
                          onClick={() => handleDelete(req.id)}
                          style={{
                            padding: '5px 12px', borderRadius: 6,
                            border: '1px solid #21262d',
                            fontSize: 12, cursor: 'pointer',
                            background: '#1c2330', color: '#6e7681',
                            opacity: actionLoading ? .6 : 1,
                          }}
                        >
                          {actionLoading === `${req.id}-delete` ? '…' : '🗑'}
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div style={{ padding: 48, textAlign: 'center', color: '#6e7681', fontSize: 13 }}>
              No requests found matching your filters.
            </div>
          )}
        </div>
      )}

      {!loading && !error && (
        <div style={{ marginTop: 12, color: '#6e7681', fontSize: 12 }}>
          Showing {filtered.length} of {requests.length} requests
        </div>
      )}
    </div>
  )
}

export default RequestsPage