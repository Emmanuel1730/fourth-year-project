import React, { useState } from "react";

const settingsSections = [
  {
    category: "Access & Registration",
    description: "Control how users sign up and access the platform",
    items: [
      { id: "reg",    label: "Open Student Registration",  sub: "Allow students to self-register without admin approval",    enabled: true },
      { id: "teach",  label: "Teacher Approval Required",  sub: "Require admin to approve teacher accounts",                 enabled: true },
      { id: "school", label: "School Verification",        sub: "Require verification before schools go live",               enabled: true },
    ]
  },
  {
    category: "Content & Uploads",
    description: "Configure resource upload behaviour",
    items: [
      { id: "upload", label: "Teacher Upload Permission", sub: "Allow teachers to upload content (pending approval)", enabled: true },
    ]
  },
  {
    category: "Notifications",
    description: "Configure admin email alerts",
    items: [
      { id: "alert_reg",  label: "New Registration Alerts", sub: "Email when new users register",         enabled: true },
      { id: "alert_pend", label: "Upload Pending Alerts",   sub: "Email when content awaits review",      enabled: true },
    ]
  }
]

const ToggleSwitch = ({ isOn, onToggle, isDarkMode }) => (
  <div
    onClick={onToggle}
    style={{
      width: 44, height: 24, borderRadius: 12, cursor: 'pointer',
      background: isOn ? '#2ea043' : (isDarkMode ? '#21262d' : '#cbd5e1'),
      display: 'flex', alignItems: 'center',
      padding: '0 3px',
      transition: 'background 0.2s',
      flexShrink: 0,
    }}
  >
    <div style={{
      width: 18, height: 18, borderRadius: '50%', background: '#fff',
      transform: isOn ? 'translateX(20px)' : 'translateX(0)',
      transition: 'transform 0.2s',
      boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
    }} />
  </div>
)

export default function SettingsPage({ isDarkMode = true }) {
  const [sections, setSections] = useState(settingsSections)
  const [saved, setSaved] = useState(false)

  const t = {
    bg:       isDarkMode ? '#0d1117' : '#f8fafc',
    cardBg:   isDarkMode ? '#161b22' : '#ffffff',
    border:   isDarkMode ? '#21262d' : '#e2e8f0',
    divider:  isDarkMode ? '#21262d' : '#f1f5f9',
    text:     isDarkMode ? '#e6edf3' : '#0f172a',
    subText:  isDarkMode ? '#e2e8f0' : '#334155',
    muted:    isDarkMode ? '#8b949e' : '#64748b',
    dim:      isDarkMode ? '#6e7681' : '#94a3b8',
    catText:  isDarkMode ? '#e6edf3' : '#1e293b',
  }

  const toggleItem = (sectionIdx, itemId) => {
    setSections(prev => prev.map((section, i) =>
      i !== sectionIdx ? section : {
        ...section,
        items: section.items.map(item => item.id === itemId ? { ...item, enabled: !item.enabled } : item)
      }
    ))
    setSaved(false)
  }

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div style={{ padding: 24, minHeight: '100vh', background: t.bg }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ color: t.text, fontSize: 22, fontWeight: 700, margin: 0 }}>Settings</h1>
        <p style={{ color: t.dim, fontSize: 13, marginTop: 4 }}>Platform configuration</p>
      </div>

      <div style={{ background: t.cardBg, border: `1px solid ${t.border}`, borderRadius: 16, padding: 32, maxWidth: 680 }}>
        <h2 style={{ color: t.text, fontSize: 16, fontWeight: 600, margin: '0 0 24px' }}>Platform Settings</h2>

        {sections.map((section, sIdx) => (
          <div key={sIdx} style={{ marginBottom: sIdx < sections.length - 1 ? 32 : 0 }}>
            <div style={{ marginBottom: 20 }}>
              <h3 style={{ color: t.catText, fontSize: 14, fontWeight: 600, margin: '0 0 4px' }}>{section.category}</h3>
              <p style={{ color: t.dim, fontSize: 12, margin: 0 }}>{section.description}</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {section.items.map(item => (
                <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                  <div>
                    <div style={{ color: t.subText, fontSize: 14, fontWeight: 500, marginBottom: 3 }}>{item.label}</div>
                    <div style={{ color: t.muted, fontSize: 12 }}>{item.sub}</div>
                  </div>
                  <ToggleSwitch isOn={item.enabled} onToggle={() => toggleItem(sIdx, item.id)} isDarkMode={isDarkMode} />
                </div>
              ))}
            </div>

            {sIdx < sections.length - 1 && (
              <div style={{ borderBottom: `1px solid ${t.divider}`, marginTop: 32 }} />
            )}
          </div>
        ))}

        <div style={{ marginTop: 32 }}>
          <button onClick={handleSave}
            style={{ background: saved ? '#2ea043' : '#2ea043', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 24px', fontSize: 14, fontWeight: 600, cursor: 'pointer', transition: 'opacity 0.15s', opacity: 1 }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
            {saved ? '✓ Saved!' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}