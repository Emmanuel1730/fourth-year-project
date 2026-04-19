import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/api'

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

const ROLE_COLORS = {
  ADMIN:   { bg: 'rgba(56,139,253,0.12)', text: '#388bfd' },
  TEACHER: { bg: 'rgba(46,160,67,0.12)',  text: '#2ea043' },
  STUDENT: { bg: 'rgba(240,136,62,0.12)', text: '#f0883e' },
}

const InfoRow = ({ label, value }) => (
  <div style={{
    display: 'flex', flexDirection: 'column', gap: 2,
    padding: '10px 0', borderBottom: '1px solid #21262d',
  }}>
    <span style={{ color: '#6e7681', fontSize: 11, textTransform: 'uppercase', letterSpacing: '.06em' }}>
      {label}
    </span>
    <span style={{ color: '#e6edf3', fontSize: 13 }}>
      {value || '—'}
    </span>
  </div>
)

const ProfilePanel = ({ open, onClose }) => {
  const navigate = useNavigate()
  const panelRef = useRef(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(false)

  const token = localStorage.getItem('accessToken')
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }

  useEffect(() => {
    if (open && !profile) {
      setLoading(true)
      fetch(`${API_BASE}/profiles/me`, { headers })
        .then(r => r.json())
        .then(data => setProfile(data))
        .catch(console.error)
        .finally(() => setLoading(false))
    }
  }, [open])

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (open && panelRef.current && !panelRef.current.contains(e.target)) onClose()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const handleLogout = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'))
      if (user) await api.post('/auth/logout', { userId: user.id })
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      localStorage.clear()
      navigate('/login')
    }
  }

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'

  const roleColor = profile ? (ROLE_COLORS[profile.role] ?? ROLE_COLORS.STUDENT) : ROLE_COLORS.ADMIN

  const initials = profile
    ? `${profile.firstName?.[0] ?? ''}${profile.lastName?.[0] ?? ''}`.toUpperCase()
    : '?'

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed', inset: 0, zIndex: 200,
            background: 'rgba(0,0,0,0.4)',
            backdropFilter: 'blur(2px)',
          }}
        />
      )}

      {/* Slide-in panel */}
      <div
        ref={panelRef}
        style={{
          position: 'fixed', top: 0, right: 0, zIndex: 201,
          width: 320, height: '100vh',
          background: '#161b22',
          borderLeft: '1px solid #21262d',
          boxShadow: '-16px 0 48px rgba(0,0,0,.4)',
          transform: open ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform .25s cubic-bezier(.4,0,.2,1)',
          display: 'flex', flexDirection: 'column',
          overflowY: 'auto',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '20px 20px 16px',
          borderBottom: '1px solid #21262d',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span style={{ color: '#e6edf3', fontWeight: 600, fontSize: 15 }}>My Profile</span>
          <button
            onClick={onClose}
            style={{
              background: '#1c2330', border: '1px solid #21262d',
              color: '#8b949e', width: 28, height: 28, borderRadius: 6,
              cursor: 'pointer', fontSize: 14, display: 'flex',
              alignItems: 'center', justifyContent: 'center',
            }}
          >
            ✕
          </button>
        </div>

        {loading ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6e7681', fontSize: 13 }}>
            Loading profile…
          </div>
        ) : profile ? (
          <>
            {/* Avatar & name */}
            <div style={{ padding: '24px 20px 20px', textAlign: 'center', borderBottom: '1px solid #21262d' }}>
              <div style={{
                width: 72, height: 72, borderRadius: '50%',
                background: 'linear-gradient(135deg, #388bfd, #2ea043)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 26, fontWeight: 700, color: '#fff',
                margin: '0 auto 12px',
                border: '3px solid #21262d',
              }}>
                {initials}
              </div>
              <div style={{ color: '#e6edf3', fontWeight: 600, fontSize: 17 }}>
                {profile.firstName} {profile.lastName}
              </div>
              <div style={{ color: '#8b949e', fontSize: 12, marginTop: 4 }}>
                {profile.email}
              </div>
              <div style={{ marginTop: 10 }}>
                <span style={{
                  ...roleColor,
                  padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                }}>
                  {profile.role}
                </span>
              </div>
              {!profile.isActive && (
                <div style={{ marginTop: 8, color: '#da3633', fontSize: 12 }}>⚠ Account Inactive</div>
              )}
            </div>

            {/* Info */}
            <div style={{ padding: '4px 20px', flex: 1 }}>
              <InfoRow label="Library Card No." value={profile.libraryCardNumber} />
              <InfoRow label="School" value={profile.school?.name} />
              <InfoRow label="Date of Birth" value={formatDate(profile.dateOfBirth)} />
              <InfoRow label="Bio" value={profile.bio} />
              <InfoRow label="Member Since" value={formatDate(profile.joinDate)} />
              {profile.requests?.length > 0 && (
                <InfoRow label="Requests Submitted" value={profile.requests.length} />
              )}
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6e7681', fontSize: 13 }}>
            Failed to load profile
          </div>
        )}

        {/* Logout button */}
        <div style={{ padding: 20, borderTop: '1px solid #21262d' }}>
          <button
            onClick={handleLogout}
            style={{
              width: '100%', padding: '10px', borderRadius: 8,
              background: '#da3633', color: '#fff', border: 'none',
              fontWeight: 600, fontSize: 14, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              transition: 'background .15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#f85149'}
            onMouseLeave={e => e.currentTarget.style.background = '#da3633'}
          >
            🚪 Logout
          </button>
        </div>
      </div>
    </>
  )
}

export default ProfilePanel