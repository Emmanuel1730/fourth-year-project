import { useState, useEffect } from 'react'

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

const TYPE_STYLES = {
  Upload:       { bg: '#f0883e20', text: '#f0883e' },
  Registration: { bg: '#388bfd20', text: '#388bfd' },
  School:       { bg: '#2ea04320', text: '#2ea043' },
  Issue:        { bg: '#da363320', text: '#da3633' },
  Delete:       { bg: '#da363320', text: '#da3633' },
}

const STATUS_STYLES = {
  PENDING:  { bg: '#f0883e20', text: '#f0883e' },
  APPROVED: { bg: '#2ea04320', text: '#2ea043' },
  REJECTED: { bg: '#da363320', text: '#da3633' },
}

const RequestsPage = () => {
  const [requests, setRequests]       = useState([])
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState(null)
  const [searchTerm, setSearchTerm]   = useState('')
  const [typeFilter, setTypeFilter]   = useState('All Types')
  const [statusFilter, setStatusFilter] = useState('All Status')
  const [actionLoading, setActionLoading] = useState(null)

  const token = localStorage.getItem('accessToken')
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }

  const fetchRequests = async () => {
    try {
      setLoading(true)
      const res = await fetch(`${API_BASE}/request`, { headers })
      if (!res.ok) throw new Error(`Failed to fetch requests: ${res.status}`)
      const data = await res.json()
      setRequests(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRequests()
  }, [])

  const handleUpdateStatus = async (id, status) => {
    setActionLoading(`${id}-${status}`)
    try {
      const res = await fetch(`${API_BASE}/request/${id}/status`, {
        method: 'PATCH',
        headers,
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
        method: 'DELETE',
        headers,
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
    const date = new Date(dateStr)
    const today = new Date()
    const diff = Math.floor((today - date) / (1000 * 60 * 60 * 24))
    if (diff === 0) return 'Today'
    if (diff === 1) return 'Yesterday'
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
  }

  const types    = ['All Types', ...new Set(requests.map((r) => r.type))]
  const statuses = ['All Status', 'PENDING', 'APPROVED', 'REJECTED']

  const filtered = requests.filter((req) => {
    const matchesSearch = req.requestName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          req.fromUser?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType   = typeFilter === 'All Types' || req.type === typeFilter
    const matchesStatus = statusFilter === 'All Status' || req.status === statusFilter
    return matchesSearch && matchesType && matchesStatus
  })

  const pendingCount = requests.filter((r) => r.status === 'PENDING').length

  return (
    <div className="p-6 min-h-screen font-sans" style={{ backgroundColor: '#0d1117' }}>

      {/* Top bar */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by request name or user..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 min-w-[250px] px-4 py-2 rounded-lg"
          style={{
            backgroundColor: '#161b22',
            borderColor: '#21262d',
            color: '#e6edf3',
            borderWidth: '1px',
            borderStyle: 'solid',
            outline: 'none',
          }}
          onFocus={(e) => e.target.style.borderColor = '#388bfd'}
          onBlur={(e) => e.target.style.borderColor = '#21262d'}
        />

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-4 py-2 rounded-lg"
          style={{
            backgroundColor: '#161b22',
            borderColor: '#21262d',
            color: '#e6edf3',
            borderWidth: '1px',
            borderStyle: 'solid',
          }}
        >
          {types.map((t) => (
            <option key={t} value={t} style={{ backgroundColor: '#161b22', color: '#e6edf3' }}>{t}</option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 rounded-lg"
          style={{
            backgroundColor: '#161b22',
            borderColor: '#21262d',
            color: '#e6edf3',
            borderWidth: '1px',
            borderStyle: 'solid',
          }}
        >
          {statuses.map((s) => (
            <option key={s} value={s} style={{ backgroundColor: '#161b22', color: '#e6edf3' }}>{s}</option>
          ))}
        </select>
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-12" style={{ color: '#8b949e' }}>
          Loading requests...
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="px-4 py-3 rounded-lg mb-4" style={{ backgroundColor: '#3d1f1f', border: '1px solid #f85149', color: '#f85149' }}>
          {error}
        </div>
      )}

      {/* Table */}
      {!loading && !error && (
        <div className="overflow-x-auto rounded-lg shadow" style={{ backgroundColor: '#161b22' }}>

          {/* Table header */}
          <div className="px-6 py-4 flex justify-between items-center" style={{ borderBottom: '1px solid #21262d' }}>
            <h2 className="text-sm font-semibold" style={{ color: '#e6edf3' }}>
              Pending Requests & Approvals
            </h2>
            <span className="text-xs" style={{ color: '#8b949e' }}>
              {pendingCount} item{pendingCount !== 1 ? 's' : ''} need attention
            </span>
          </div>

          <table className="min-w-full table-auto border-collapse">
            <thead style={{ backgroundColor: '#1c2330', borderBottom: '1px solid #21262d' }}>
              <tr>
                {['Request', 'From', 'Type', 'Date', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#8b949e' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((req) => {
                const typeStyle   = TYPE_STYLES[req.type]   ?? { bg: '#6e768120', text: '#8b949e' }
                const statusStyle = STATUS_STYLES[req.status] ?? { bg: '#6e768120', text: '#8b949e' }
                const isPending   = req.status === 'PENDING'

                return (
                  <tr
                    key={req.id}
                    style={{ backgroundColor: '#161b22', borderBottom: '1px solid #21262d' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1c2330'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#161b22'}
                  >
                    {/* Request name */}
                    <td className="px-6 py-4 text-sm font-medium" style={{ color: '#e6edf3', maxWidth: '220px' }}>
                      <div className="truncate">{req.requestName}</div>
                      {req.description && (
                        <div className="text-xs mt-0.5 truncate" style={{ color: '#6e7681' }}>{req.description}</div>
                      )}
                    </td>

                    {/* From */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: '#8b949e' }}>
                      {req.fromUser}
                    </td>

                    {/* Type badge */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium rounded-full"
                        style={{ backgroundColor: typeStyle.bg, color: typeStyle.text }}>
                        {req.type}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: '#8b949e' }}>
                      {formatDate(req.createdAt)}
                    </td>

                    {/* Status badge */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium rounded-full"
                        style={{ backgroundColor: statusStyle.bg, color: statusStyle.text }}>
                        {req.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        {isPending && (
                          <>
                            <button
                              disabled={!!actionLoading}
                              onClick={() => handleUpdateStatus(req.id, 'APPROVED')}
                              className="px-3 py-1 rounded-lg text-xs font-medium transition-all disabled:opacity-50"
                              style={{ backgroundColor: '#2ea043', color: '#fff' }}
                            >
                              {actionLoading === `${req.id}-APPROVED` ? '...' : 'Approve'}
                            </button>
                            <button
                              disabled={!!actionLoading}
                              onClick={() => handleUpdateStatus(req.id, 'REJECTED')}
                              className="px-3 py-1 rounded-lg text-xs font-medium transition-all disabled:opacity-50"
                              style={{ backgroundColor: '#da3633', color: '#fff' }}
                            >
                              {actionLoading === `${req.id}-REJECTED` ? '...' : 'Reject'}
                            </button>
                          </>
                        )}
                        <button
                          disabled={!!actionLoading}
                          onClick={() => handleDelete(req.id)}
                          className="px-3 py-1 rounded-lg text-xs font-medium transition-all disabled:opacity-50"
                          style={{ backgroundColor: '#21262d', color: '#8b949e' }}
                        >
                          {actionLoading === `${req.id}-delete` ? '...' : 'Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="px-6 py-8 text-center" style={{ color: '#6e7681' }}>
              No requests found matching your filters.
            </div>
          )}
        </div>
      )}

      {/* Summary */}
      {!loading && !error && (
        <div className="mt-4 text-xs" style={{ color: '#6e7681' }}>
          Showing {filtered.length} of {requests.length} requests
        </div>
      )}
    </div>
  )
}

export default RequestsPage