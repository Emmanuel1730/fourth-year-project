import { useState, useEffect, useRef } from 'react'

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

const TYPE_ICONS = {
  REQUEST_CREATED:   '📋',
  REQUEST_APPROVED:  '✅',
  REQUEST_REJECTED:  '❌',
  QUIZ_CREATED:      '❓',
  USER_REGISTERED:   '🎓',
  RESOURCE_UPLOADED: '📄',
  SYSTEM:            '🔔',
}

const TYPE_COLORS = {
  REQUEST_CREATED:   { bg: 'rgba(56,139,253,0.1)', border: '#388bfd' },
  REQUEST_APPROVED:  { bg: 'rgba(46,160,67,0.1)',  border: '#2ea043' },
  REQUEST_REJECTED:  { bg: 'rgba(218,54,51,0.1)',  border: '#da3633' },
  QUIZ_CREATED:      { bg: 'rgba(240,136,62,0.1)', border: '#f0883e' },
  USER_REGISTERED:   { bg: 'rgba(56,139,253,0.1)', border: '#388bfd' },
  RESOURCE_UPLOADED: { bg: 'rgba(139,148,158,0.1)',border: '#6e7681' },
  SYSTEM:            { bg: 'rgba(139,148,158,0.1)',border: '#6e7681' },
}

const useNotifications = () => {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)

  const token = localStorage.getItem('accessToken')
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }

  const fetchUnreadCount = async () => {
    try {
      const res = await fetch(`${API_BASE}/notifications/unread-count`, { headers })
      if (res.ok) {
        const data = await res.json()
        setUnreadCount(data.count ?? 0)
      }
    } catch { /* silent */ }
  }

  const fetchNotifications = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/notifications`, { headers })
      if (res.ok) {
        const data = await res.json()
        setNotifications(Array.isArray(data) ? data : [])
      }
    } catch { /* silent */ } finally {
      setLoading(false)
    }
  }

  const markRead = async (id) => {
    await fetch(`${API_BASE}/notifications/${id}/read`, { method: 'PATCH', headers })
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  const markAllRead = async () => {
    await fetch(`${API_BASE}/notifications/read-all`, { method: 'PATCH', headers })
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
    setUnreadCount(0)
  }

  const deleteNotif = async (id) => {
    await fetch(`${API_BASE}/notifications/${id}`, { method: 'DELETE', headers })
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  return { notifications, unreadCount, loading, fetchNotifications, fetchUnreadCount, markRead, markAllRead, deleteNotif }
}

const timeAgo = (dateStr) => {
  if (!dateStr) return ''
  const diff = Date.now() - new Date(dateStr).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  return `${d}d ago`
}

// ─── Badge (exported for header) ─────────────────────────────────────────────
export const NotificationBadge = ({ count }) => {
  if (!count) return null
  return (
    <span style={{
      position: 'absolute', top: -4, right: -4,
      background: '#da3633', color: '#fff',
      fontSize: 9, fontWeight: 700,
      minWidth: 16, height: 16, borderRadius: 8,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '0 3px', lineHeight: 1,
      border: '2px solid #161b22',
    }}>
      {count > 99 ? '99+' : count}
    </span>
  )
}

// ─── Main panel ───────────────────────────────────────────────────────────────
const NotificationPanel = () => {
  const [open, setOpen] = useState(false)
  const panelRef = useRef(null)
  const { notifications, unreadCount, loading, fetchNotifications, fetchUnreadCount, markRead, markAllRead, deleteNotif } = useNotifications()

  // Poll unread count every 30s
  useEffect(() => {
    fetchUnreadCount()
    const id = setInterval(fetchUnreadCount, 30000)
    return () => clearInterval(id)
  }, [])

  // Fetch full list when panel opens
  useEffect(() => {
    if (open) fetchNotifications()
  }, [open])

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={panelRef} style={{ position: 'relative' }}>
      {/* Bell button */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: 36, height: 36,
          background: open ? '#1c2330' : '#1c2330',
          border: `1px solid ${open ? '#388bfd' : '#21262d'}`,
          borderRadius: 8,
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 16, position: 'relative',
          transition: 'border-color .2s',
        }}
      >
        🔔
        <NotificationBadge count={unreadCount} />
      </button>

      {/* Dropdown panel */}
      {open && (
        <div style={{
          position: 'absolute', top: 44, right: 0, zIndex: 1000,
          width: 360,
          background: '#161b22',
          border: '1px solid #21262d',
          borderRadius: 12,
          boxShadow: '0 16px 48px rgba(0,0,0,.5)',
          overflow: 'hidden',
        }}>
          {/* Header */}
          <div style={{
            padding: '14px 16px',
            borderBottom: '1px solid #21262d',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div>
              <span style={{ color: '#e6edf3', fontSize: 14, fontWeight: 600 }}>Notifications</span>
              {unreadCount > 0 && (
                <span style={{
                  marginLeft: 8, background: '#da3633', color: '#fff',
                  fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 10,
                }}>
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                style={{ background: 'none', border: 'none', color: '#388bfd', fontSize: 12, cursor: 'pointer' }}
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div style={{ maxHeight: 400, overflowY: 'auto' }}>
            {loading ? (
              <div style={{ padding: 24, textAlign: 'center', color: '#6e7681', fontSize: 13 }}>
                Loading…
              </div>
            ) : notifications.length === 0 ? (
              <div style={{ padding: 32, textAlign: 'center', color: '#6e7681', fontSize: 13 }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>🔔</div>
                No notifications yet
              </div>
            ) : (
              notifications.map(n => {
                const icon = TYPE_ICONS[n.type] ?? '🔔'
                const color = TYPE_COLORS[n.type] ?? TYPE_COLORS.SYSTEM
                return (
                  <div
                    key={n.id}
                    onClick={() => !n.isRead && markRead(n.id)}
                    style={{
                      padding: '12px 16px',
                      borderBottom: '1px solid #21262d',
                      display: 'flex', gap: 12, alignItems: 'flex-start',
                      background: n.isRead ? 'transparent' : 'rgba(56,139,253,0.04)',
                      cursor: n.isRead ? 'default' : 'pointer',
                      transition: 'background .15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#1c2330'}
                    onMouseLeave={e => e.currentTarget.style.background = n.isRead ? 'transparent' : 'rgba(56,139,253,0.04)'}
                  >
                    {/* Icon */}
                    <div style={{
                      width: 34, height: 34, borderRadius: 8, flexShrink: 0,
                      background: color.bg,
                      border: `1px solid ${color.border}30`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 16,
                    }}>
                      {icon}
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        color: '#e6edf3', fontSize: 13, fontWeight: n.isRead ? 400 : 600,
                        marginBottom: 2,
                      }}>
                        {n.title}
                      </div>
                      {n.message && (
                        <div style={{ color: '#8b949e', fontSize: 12, lineHeight: 1.4 }}>
                          {n.message}
                        </div>
                      )}
                      <div style={{ color: '#6e7681', fontSize: 11, marginTop: 4 }}>
                        {timeAgo(n.createdAt)}
                        {!n.isRead && (
                          <span style={{
                            marginLeft: 8, display: 'inline-block',
                            width: 6, height: 6, borderRadius: '50%', background: '#388bfd',
                            verticalAlign: 'middle',
                          }} />
                        )}
                      </div>
                    </div>

                    {/* Delete */}
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteNotif(n.id) }}
                      style={{
                        background: 'none', border: 'none', color: '#6e7681',
                        fontSize: 14, cursor: 'pointer', padding: '0 2px', flexShrink: 0,
                      }}
                      title="Delete"
                    >
                      ×
                    </button>
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default NotificationPanel