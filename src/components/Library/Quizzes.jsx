import { useState, useEffect } from 'react'

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

const token = () => localStorage.getItem('accessToken')
const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token()}`,
})

const STATUS_STYLES = {
  published: { bg: 'rgba(46,160,67,0.15)', text: '#2ea043' },
  draft:     { bg: 'rgba(218,54,51,0.15)', text: '#da3633' },
}

const SOURCE_STYLES = {
  TEACHER: { bg: 'rgba(56,139,253,0.12)', text: '#388bfd' },
  AI:      { bg: 'rgba(240,136,62,0.12)', text: '#f0883e' },
}

const Quizzes = () => {
  const [tab, setTab]               = useState('teacher') // 'teacher' | 'ai'
  const [quizzes, setQuizzes]       = useState([])
  const [attempts, setAttempts]     = useState([])
  const [loading, setLoading]       = useState(true)
  const [search, setSearch]         = useState('')
  const [subjectFilter, setSubjectFilter] = useState('All')
  const [actionLoading, setActionLoading] = useState(null)

  const fetchData = async () => {
    setLoading(true)
    try {
      const [qRes, aRes] = await Promise.all([
        fetch(`${API_BASE}/quizzes/admin/all`,      { headers: authHeaders() }),
        fetch(`${API_BASE}/quizzes/admin/attempts`, { headers: authHeaders() }),
      ])
      if (qRes.ok) setQuizzes(await qRes.json())
      if (aRes.ok) setAttempts(await aRes.json())
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const handleStatusToggle = async (q) => {
    const newStatus = q.status === 'published' ? 'draft' : 'published'
    setActionLoading(q.id)
    try {
      const res = await fetch(`${API_BASE}/quizzes/admin/${q.id}`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) throw new Error('Failed')
      await fetchData()
    } catch (e) { alert(e.message) }
    finally { setActionLoading(null) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this quiz permanently?')) return
    setActionLoading(id)
    try {
      const res = await fetch(`${API_BASE}/quizzes/admin/${id}`, {
        method: 'DELETE', headers: authHeaders(),
      })
      if (!res.ok) throw new Error('Failed')
      await fetchData()
    } catch (e) { alert(e.message) }
    finally { setActionLoading(null) }
  }

  const subjects = ['All', ...new Set(quizzes.map(q => q.subject).filter(Boolean))]

  const filteredQuizzes = quizzes.filter(q => {
    const matchesSearch = !search || q.title?.toLowerCase().includes(search.toLowerCase())
    const matchesSubject = subjectFilter === 'All' || q.subject === subjectFilter
    return matchesSearch && matchesSubject
  })

  const filteredAttempts = attempts.filter(a =>
    !search ||
    a.subject?.toLowerCase().includes(search.toLowerCase()) ||
    a.topic?.toLowerCase().includes(search.toLowerCase()) ||
    `${a.student?.firstName} ${a.student?.lastName}`.toLowerCase().includes(search.toLowerCase())
  )

  const formatDate = (d) => {
    if (!d) return '—'
    const diff = Math.floor((Date.now() - new Date(d)) / 86400000)
    if (diff === 0) return 'Today'
    if (diff === 1) return 'Yesterday'
    return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
  }

  // Summary stats
  const totalPublished = quizzes.filter(q => q.status === 'published').length
  const totalAttempts  = attempts.length
  const avgScore       = attempts.length > 0
    ? Math.round(attempts.reduce((s, a) => s + (a.percentage ?? 0), 0) / attempts.length)
    : 0

  return (
    <div style={{ padding: 24, minHeight: '100vh', background: '#0d1117' }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ color: '#e6edf3', fontSize: 22, fontWeight: 700, margin: 0 }}>
          Quizzes & Exams
        </h1>
        <p style={{ color: '#6e7681', fontSize: 13, marginTop: 4 }}>
          Manage teacher-created quizzes and view AI-generated attempt history
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Total Quizzes',    value: quizzes.length,  color: '#388bfd' },
          { label: 'Published',        value: totalPublished,   color: '#2ea043' },
          { label: 'AI Attempts',      value: totalAttempts,    color: '#f0883e' },
          { label: 'Avg Score',        value: `${avgScore}%`,   color: '#a371f7' },
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

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 20, background: '#161b22', border: '1px solid #21262d', borderRadius: 10, padding: 4, width: 'fit-content' }}>
        {[
          { id: 'teacher', label: `📝 Teacher Quizzes (${quizzes.length})` },
          { id: 'ai',      label: `🤖 AI Attempts (${attempts.length})` },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              padding: '7px 18px', borderRadius: 7, border: 'none',
              fontSize: 13, fontWeight: tab === t.id ? 600 : 400, cursor: 'pointer',
              background: tab === t.id ? '#1c2330' : 'transparent',
              color: tab === t.id ? '#e6edf3' : '#8b949e',
              transition: 'all .15s',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <input
          placeholder="Search quizzes…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            flex: 1, minWidth: 200,
            background: '#161b22', border: '1px solid #21262d',
            borderRadius: 8, padding: '7px 14px',
            color: '#e6edf3', fontSize: 13, outline: 'none',
          }}
          onFocus={e => e.target.style.borderColor = '#388bfd'}
          onBlur={e => e.target.style.borderColor = '#21262d'}
        />
        {tab === 'teacher' && (
          <select
            value={subjectFilter}
            onChange={e => setSubjectFilter(e.target.value)}
            style={{
              background: '#161b22', border: '1px solid #21262d',
              borderRadius: 8, padding: '7px 14px',
              color: '#e6edf3', fontSize: 13, outline: 'none', cursor: 'pointer',
            }}
          >
            {subjects.map(s => <option key={s} value={s}>{s === 'All' ? 'All Subjects' : s}</option>)}
          </select>
        )}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 48, color: '#8b949e' }}>Loading…</div>
      ) : tab === 'teacher' ? (
        // ── Teacher quizzes table ────────────────────────────────────────────
        <div style={{ background: '#161b22', border: '1px solid #21262d', borderRadius: 12, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #21262d' }}>
                {['Title', 'Subject', 'Form', 'Mode', 'Questions', 'Status', 'Created', 'Actions'].map(h => (
                  <th key={h} style={{
                    padding: '10px 14px', textAlign: 'left',
                    color: '#6e7681', fontSize: 11, textTransform: 'uppercase',
                    letterSpacing: '.06em', fontWeight: 600,
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredQuizzes.map(q => {
                const ss = STATUS_STYLES[q.status] ?? { bg: 'rgba(139,148,158,0.15)', text: '#8b949e' }
                return (
                  <tr
                    key={q.id}
                    style={{ borderBottom: '1px solid #21262d' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#1c2330'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '11px 14px' }}>
                      <div style={{ color: '#e6edf3', fontSize: 13, fontWeight: 500 }}>{q.title}</div>
                      {q.description && (
                        <div style={{ color: '#6e7681', fontSize: 11, marginTop: 2, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {q.description}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '11px 14px', color: '#8b949e', fontSize: 13 }}>{q.subject ?? '—'}</td>
                    <td style={{ padding: '11px 14px', color: '#8b949e', fontSize: 13 }}>{q.form ?? '—'}</td>
                    <td style={{ padding: '11px 14px' }}>
                      <span style={{
                        padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 500,
                        background: q.mode === 'online' ? 'rgba(46,160,67,0.12)' : 'rgba(163,113,247,0.12)',
                        color: q.mode === 'online' ? '#2ea043' : '#a371f7',
                      }}>
                        {q.mode ?? 'online'}
                      </span>
                    </td>
                    <td style={{ padding: '11px 14px', color: '#e6edf3', fontSize: 13 }}>
                      {q.questions?.length ?? 0}
                    </td>
                    <td style={{ padding: '11px 14px' }}>
                      <span style={{ padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: ss.bg, color: ss.text }}>
                        {q.status}
                      </span>
                    </td>
                    <td style={{ padding: '11px 14px', color: '#8b949e', fontSize: 12 }}>
                      {formatDate(q.createdAt)}
                      {q.createdBy && (
                        <div style={{ color: '#6e7681', fontSize: 11 }}>
                          {q.createdBy.firstName} {q.createdBy.lastName}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '11px 14px' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          disabled={!!actionLoading}
                          onClick={() => handleStatusToggle(q)}
                          style={{
                            background: '#1c2330', border: '1px solid #21262d',
                            color: q.status === 'published' ? '#f0883e' : '#2ea043',
                            borderRadius: 6, padding: '4px 10px',
                            fontSize: 11, cursor: 'pointer',
                          }}
                        >
                          {actionLoading === q.id ? '…' : q.status === 'published' ? 'Unpublish' : 'Publish'}
                        </button>
                        <button
                          disabled={!!actionLoading}
                          onClick={() => handleDelete(q.id)}
                          style={{
                            background: '#1c2330', border: '1px solid #21262d',
                            color: '#da3633', borderRadius: 6, padding: '4px 10px',
                            fontSize: 11, cursor: 'pointer',
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {filteredQuizzes.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ padding: 32, textAlign: 'center', color: '#6e7681', fontSize: 13 }}>
                    No quizzes found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        // ── AI attempt history ───────────────────────────────────────────────
        <div style={{ background: '#161b22', border: '1px solid #21262d', borderRadius: 12, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #21262d' }}>
                {['Student', 'Subject', 'Topic', 'Level', 'Score', 'Source', 'Date'].map(h => (
                  <th key={h} style={{
                    padding: '10px 14px', textAlign: 'left',
                    color: '#6e7681', fontSize: 11, textTransform: 'uppercase',
                    letterSpacing: '.06em', fontWeight: 600,
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredAttempts.map(a => {
                const pct = a.percentage ?? 0
                const scoreColor = pct >= 70 ? '#2ea043' : pct >= 50 ? '#f0883e' : '#da3633'
                const src = SOURCE_STYLES[a.source] ?? SOURCE_STYLES.AI
                return (
                  <tr
                    key={a.id}
                    style={{ borderBottom: '1px solid #21262d' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#1c2330'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '11px 14px' }}>
                      <div style={{ color: '#e6edf3', fontSize: 13, fontWeight: 500 }}>
                        {a.student ? `${a.student.firstName} ${a.student.lastName}` : 'Unknown'}
                      </div>
                      {a.student?.email && (
                        <div style={{ color: '#6e7681', fontSize: 11 }}>{a.student.email}</div>
                      )}
                    </td>
                    <td style={{ padding: '11px 14px', color: '#8b949e', fontSize: 13 }}>{a.subject ?? '—'}</td>
                    <td style={{ padding: '11px 14px', color: '#8b949e', fontSize: 13 }}>{a.topic ?? '—'}</td>
                    <td style={{ padding: '11px 14px', color: '#8b949e', fontSize: 13 }}>{a.level ?? '—'}</td>
                    <td style={{ padding: '11px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{
                          width: 48, height: 4, borderRadius: 2, background: '#21262d', overflow: 'hidden',
                        }}>
                          <div style={{ width: `${pct}%`, height: '100%', background: scoreColor }} />
                        </div>
                        <span style={{ color: scoreColor, fontSize: 13, fontWeight: 600, fontFamily: 'monospace' }}>
                          {a.score}/{a.total}
                        </span>
                        <span style={{ color: '#6e7681', fontSize: 11 }}>({pct}%)</span>
                      </div>
                    </td>
                    <td style={{ padding: '11px 14px' }}>
                      <span style={{ padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: src.bg, color: src.text }}>
                        {a.source}
                      </span>
                    </td>
                    <td style={{ padding: '11px 14px', color: '#8b949e', fontSize: 13 }}>
                      {formatDate(a.completedAt)}
                    </td>
                  </tr>
                )
              })}
              {filteredAttempts.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ padding: 32, textAlign: 'center', color: '#6e7681', fontSize: 13 }}>
                    No attempts found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Footer count */}
      <div style={{ marginTop: 12, color: '#6e7681', fontSize: 12 }}>
        {tab === 'teacher'
          ? `Showing ${filteredQuizzes.length} of ${quizzes.length} quizzes`
          : `Showing ${filteredAttempts.length} of ${attempts.length} attempts`
        }
      </div>
    </div>
  )
}

export default Quizzes