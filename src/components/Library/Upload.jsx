import { useState, useEffect } from 'react'

const RESOURCE_TYPE_MAP = [
  { label: 'PDF Document',  type: 'PDF',   form: 'DOCUMENT' },
  { label: 'Word Document', type: 'PDF',   form: 'DOCUMENT' },
  { label: 'Past Paper',    type: 'PDF',   form: 'OTHER'    },
  { label: 'Video',         type: 'VIDEO', form: 'VIDEO'    },
  { label: 'Image',         type: 'IMAGE', form: 'OTHER'    },
]

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

const Upload = ({ isDarkMode = true }) => {
  const [formData, setFormData] = useState({
    title: '', schoolId: '', categoryId: '', classId: '',
    type: 'PDF', form: 'DOCUMENT', targetAudience: 'Students',
    description: '', visibility: 'PUBLIC', isPremium: false, price: '', file: null,
  })
  const [selectedTypeLabel, setSelectedTypeLabel] = useState('PDF Document')
  const [categories, setCategories] = useState([])
  const [classes, setClasses]       = useState([])
  const [schools, setSchools]       = useState([])
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState(null)
  const [success, setSuccess]       = useState(null)

  const t = {
    cardBg:    isDarkMode ? '#161b22' : '#ffffff',
    border:    isDarkMode ? '#21262d' : '#e2e8f0',
    text:      isDarkMode ? '#e6edf3' : '#0f172a',
    muted:     isDarkMode ? '#8b949e' : '#64748b',
    dim:       isDarkMode ? '#6e7681' : '#94a3b8',
    inputBg:   isDarkMode ? '#1c2330' : '#f8fafc',
    dashedBorder: isDarkMode ? '#21262d' : '#cbd5e1',
    headerBg:  isDarkMode ? '' : 'bg-slate-50',
  }

  const selectOpt = { background: isDarkMode ? '#1c2330' : '#ffffff', color: t.text }

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    const headers = { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }
    fetch(`${API_BASE}/categories`, { headers }).then(r => r.json()).then(d => setCategories(Array.isArray(d) ? d : [])).catch(() => {})
    fetch(`${API_BASE}/classes`,    { headers }).then(r => r.json()).then(d => setClasses(Array.isArray(d) ? d : [])).catch(() => {})
    fetch(`${API_BASE}/school`,     { headers }).then(r => r.json()).then(d => setSchools(Array.isArray(d) ? d : [])).catch(() => {})
  }, [])

  const handleChange = (e) => { setFormData({ ...formData, [e.target.name]: e.target.value }); setError(null); setSuccess(null) }

  const handleTypeChange = (e) => {
    const label = e.target.value
    const matched = RESOURCE_TYPE_MAP.find(t => t.label === label)
    if (matched) { setSelectedTypeLabel(label); setFormData({ ...formData, type: matched.type, form: matched.form }) }
  }

  const handleSubmit = async (e, publish) => {
    e.preventDefault(); setError(null); setSuccess(null)
    if (!formData.title || !formData.categoryId || !formData.classId) { setError('Please fill in all required fields.'); return }
    if (formData.visibility === 'PRIVATE' && !formData.schoolId) { setError('Please select a school for private resources.'); return }
    if (!formData.file) { setError('Please select a file to upload.'); return }
    if (formData.isPremium && (!formData.price || Number(formData.price) <= 0)) { setError('Please enter a price greater than 0.'); return }
    setLoading(true)
    try {
      const token = localStorage.getItem('accessToken')
      const body  = new FormData()
      body.append('file', formData.file); body.append('title', formData.title)
      body.append('description', formData.description); body.append('type', formData.type)
      body.append('form', formData.form); body.append('status', publish ? 'PUBLISHED' : 'DRAFT')
      body.append('targetAudience', formData.targetAudience); body.append('visibility', formData.visibility)
      body.append('categoryId', formData.categoryId); body.append('classId', formData.classId)
      body.append('isPremium', String(formData.isPremium)); body.append('price', formData.isPremium ? String(formData.price) : '0')
      if (formData.schoolId) body.append('schoolId', formData.schoolId)
      const res = await fetch(`${API_BASE}/resources/create-with-file`, {
        method: 'POST', headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body,
      })
      if (!res.ok) { const data = await res.json().catch(() => ({})); throw new Error(data?.message ?? `Request failed: ${res.status}`) }
      setSuccess(`Resource ${publish ? 'published' : 'saved as draft'} successfully!`)
      setFormData({ title: '', schoolId: '', categoryId: '', classId: '', type: 'PDF', form: 'DOCUMENT', targetAudience: 'Students', description: '', visibility: 'PUBLIC', isPremium: false, price: '', file: null })
      setSelectedTypeLabel('PDF Document')
    } catch (err) {
      setError(err.message ?? 'Something went wrong.')
    } finally { setLoading(false) }
  }

  const fieldCls = `w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-[#388bfd] disabled:opacity-50`
  const labelCls = `text-xs font-medium uppercase tracking-wider mb-1.5 block`

  return (
    <div className="max-w-2xl">
      <div className="rounded-xl overflow-hidden" style={{ background: t.cardBg, border: `1px solid ${t.border}` }}>
        <div className="px-5 py-4" style={{ borderBottom: `1px solid ${t.border}` }}>
          <h2 className="text-sm font-semibold" style={{ color: t.text }}>Upload New Material</h2>
        </div>
        <div className="p-6">
          <form onSubmit={e => e.preventDefault()}>

            {error   && <div className="mb-4 px-3 py-2 rounded-lg bg-[#3d1f1f] border border-[#f85149] text-[#f85149] text-xs">{error}</div>}
            {success && <div className="mb-4 px-3 py-2 rounded-lg bg-[#1a2f1a] border border-[#2ea043] text-[#3fb950] text-xs">{success}</div>}

            {/* School */}
            <div className="mb-4">
              <label className={labelCls} style={{ color: t.muted }}>School {formData.visibility === 'PRIVATE' ? '*' : '(optional)'}</label>
              <select name="schoolId" value={formData.schoolId} onChange={handleChange} disabled={loading}
                className={fieldCls} style={{ background: t.inputBg, border: `1px solid ${t.border}`, color: t.text }}>
                <option value="" style={selectOpt}>Select school</option>
                {schools.map(s => <option key={s.id} value={s.id} style={selectOpt}>{s.name}</option>)}
              </select>
            </div>

            {/* Title */}
            <div className="mb-4">
              <label className={labelCls} style={{ color: t.muted }}>Resource Title *</label>
              <input type="text" name="title" value={formData.title} onChange={handleChange} disabled={loading}
                className={fieldCls} style={{ background: t.inputBg, border: `1px solid ${t.border}`, color: t.text }}
                placeholder="e.g. Form 3 Biology Notes – Cell Division" />
            </div>

            {/* Subject + Form Level */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className={labelCls} style={{ color: t.muted }}>Subject *</label>
                <select name="categoryId" value={formData.categoryId} onChange={handleChange} disabled={loading}
                  className={fieldCls} style={{ background: t.inputBg, border: `1px solid ${t.border}`, color: t.text }}>
                  <option value="" style={selectOpt}>Select subject</option>
                  {categories.map(c => <option key={c.id} value={c.id} style={selectOpt}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls} style={{ color: t.muted }}>Form Level *</label>
                <select name="classId" value={formData.classId} onChange={handleChange} disabled={loading}
                  className={fieldCls} style={{ background: t.inputBg, border: `1px solid ${t.border}`, color: t.text }}>
                  <option value="" style={selectOpt}>Select form</option>
                  {classes.map(c => <option key={c.id} value={c.id} style={selectOpt}>{c.name}</option>)}
                </select>
              </div>
            </div>

            {/* Resource Type + Target Audience */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className={labelCls} style={{ color: t.muted }}>Resource Type</label>
                <select value={selectedTypeLabel} onChange={handleTypeChange} disabled={loading}
                  className={fieldCls} style={{ background: t.inputBg, border: `1px solid ${t.border}`, color: t.text }}>
                  {RESOURCE_TYPE_MAP.map(t => <option key={t.label} style={selectOpt}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls} style={{ color: t.muted }}>Target Audience</label>
                <select name="targetAudience" value={formData.targetAudience} onChange={handleChange} disabled={loading}
                  className={fieldCls} style={{ background: t.inputBg, border: `1px solid ${t.border}`, color: t.text }}>
                  {['Students','Teachers','Both'].map(o => <option key={o} style={selectOpt}>{o}</option>)}
                </select>
              </div>
            </div>

            {/* Visibility */}
            <div className="mb-4">
              <label className={labelCls} style={{ color: t.muted }}>Visibility</label>
              <select name="visibility" value={formData.visibility} onChange={handleChange} disabled={loading}
                className={fieldCls} style={{ background: t.inputBg, border: `1px solid ${t.border}`, color: t.text }}>
                <option value="PUBLIC" style={selectOpt}>Public</option>
                <option value="PRIVATE" style={selectOpt}>Private (School Only)</option>
              </select>
            </div>

            {/* Access Type */}
            <div className="mb-4">
              <label className={labelCls} style={{ color: t.muted }}>Access Type</label>
              <div className="flex rounded-lg overflow-hidden" style={{ border: `1px solid ${t.border}` }}>
                <button type="button" disabled={loading}
                  onClick={() => setFormData(f => ({ ...f, isPremium: false, price: '' }))}
                  className={`flex-1 py-2 text-sm font-medium transition ${!formData.isPremium ? 'bg-[#2ea043] text-white' : 'text-[#8b949e] hover:text-[#e6edf3]'}`}
                  style={{ background: !formData.isPremium ? '#2ea043' : t.inputBg }}>
                  🆓 Free
                </button>
                <button type="button" disabled={loading}
                  onClick={() => setFormData(f => ({ ...f, isPremium: true }))}
                  className={`flex-1 py-2 text-sm font-medium transition ${formData.isPremium ? 'bg-[#2563eb] text-white' : 'text-[#8b949e] hover:text-[#e6edf3]'}`}
                  style={{ background: formData.isPremium ? '#2563eb' : t.inputBg }}>
                  💎 Premium
                </button>
              </div>
            </div>

            {formData.isPremium && (
              <div className="mb-4">
                <label className={labelCls} style={{ color: t.muted }}>Price (MWK) *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: t.muted }}>MWK</span>
                  <input type="number" name="price" value={formData.price} onChange={handleChange} disabled={loading}
                    min="1" step="1" placeholder="e.g. 500"
                    className={fieldCls} style={{ background: t.inputBg, border: '1px solid #2563eb', color: t.text, paddingLeft: '3.5rem' }} />
                </div>
                <p className="text-[11px] mt-1" style={{ color: t.dim }}>Students will need to pay this amount to access the resource.</p>
              </div>
            )}

            {/* Description */}
            <div className="mb-4">
              <label className={labelCls} style={{ color: t.muted }}>Description</label>
              <textarea name="description" value={formData.description} onChange={handleChange} disabled={loading}
                className={fieldCls} style={{ background: t.inputBg, border: `1px solid ${t.border}`, color: t.text }}
                rows="3" placeholder="Briefly describe the content of this resource…" />
            </div>

            {/* File Upload */}
            <div
              className="rounded-lg p-7 text-center cursor-pointer transition-all mb-4"
              style={{ border: `2px dashed ${t.dashedBorder}` }}
              onClick={() => !loading && document.getElementById('fileInput').click()}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#388bfd'}
              onMouseLeave={e => e.currentTarget.style.borderColor = t.dashedBorder}>
              <div className="text-3xl mb-2">📎</div>
              <div className="text-sm" style={{ color: t.muted }}>Click to select file or drag and drop</div>
              <div className="text-[11px] mt-1" style={{ color: t.dim }}>PDF, DOCX, MP4 · Max 50 MB</div>
              <input id="fileInput" type="file" accept=".pdf,.docx,.mp4,.png,.jpg,.jpeg,.mp3"
                className="hidden"
                onChange={e => { setFormData({ ...formData, file: e.target.files?.[0] ?? null }); setError(null) }} />
              {formData.file && <div className="mt-2 text-xs text-[#388bfd]">Selected: {formData.file.name}</div>}
            </div>

            {/* Actions */}
            <div className="flex gap-2.5">
              <button disabled={loading} onClick={e => handleSubmit(e, true)}
                className="bg-[#2ea043] text-white px-3.5 py-1.5 rounded-lg text-sm font-medium hover:bg-[#3fb950] transition-all disabled:opacity-50">
                {loading ? 'Uploading…' : 'Upload & Publish'}
              </button>
              <button disabled={loading} onClick={e => handleSubmit(e, false)}
                className="px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all disabled:opacity-50"
                style={{ background: t.inputBg, color: t.muted, border: `1px solid ${t.border}` }}>
                Save as Draft
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Upload