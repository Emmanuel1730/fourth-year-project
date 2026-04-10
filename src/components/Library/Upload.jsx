import { useState, useEffect } from 'react'

const RESOURCE_TYPE_MAP = [
  { label: 'PDF Document',  type: 'PDF',   form: 'DOCUMENT' },
  { label: 'Word Document', type: 'PDF',   form: 'DOCUMENT' },
  { label: 'Past Paper',    type: 'PDF',   form: 'OTHER'    },
  { label: 'Video',         type: 'VIDEO', form: 'VIDEO'    },
  { label: 'Image',         type: 'IMAGE', form: 'OTHER'    },
]

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

const Upload = () => {
  const [formData, setFormData] = useState({
    title: '',
    schoolId: '',
    categoryId: '',
    classId: '',
    type: 'PDF',
    form: 'DOCUMENT',
    targetAudience: 'Students',
    description: '',
    visibility: 'PUBLIC',
    file: null,
  })

  const [selectedTypeLabel, setSelectedTypeLabel] = useState('PDF Document')
  const [categories, setCategories] = useState([])
  const [classes, setClasses]       = useState([])
  const [schools, setSchools]       = useState([])
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState(null)
  const [success, setSuccess]       = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    }

    fetch(`${API_BASE}/categories`, { headers })
      .then((r) => r.json())
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => setCategories([]))

    fetch(`${API_BASE}/classes`, { headers })
      .then((r) => r.json())
      .then((data) => setClasses(Array.isArray(data) ? data : []))
      .catch(() => setClasses([]))

    fetch(`${API_BASE}/school`, { headers })
      .then((r) => r.json())
      .then((data) => setSchools(Array.isArray(data) ? data : []))
      .catch(() => setSchools([]))
  }, [])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setError(null)
    setSuccess(null)
  }

  const handleTypeChange = (e) => {
    const label   = e.target.value
    const matched = RESOURCE_TYPE_MAP.find((t) => t.label === label)
    if (matched) {
      setSelectedTypeLabel(label)
      setFormData({ ...formData, type: matched.type, form: matched.form })
    }
  }

  const handleSubmit = async (e, publish) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!formData.title || !formData.categoryId || !formData.classId) {
      setError('Please fill in all required fields.')
      return
    }
    if (formData.visibility === 'PRIVATE' && !formData.schoolId) {
      setError('Please select a school for private resources.')
      return
    }
    if (!formData.file) {
      setError('Please select a file to upload.')
      return
    }

    setLoading(true)

    try {
      const token = localStorage.getItem('accessToken')

      const body = new FormData()
      body.append('file',           formData.file)
      body.append('title',          formData.title)
      body.append('description',    formData.description)
      body.append('type',           formData.type)
      body.append('form',           formData.form)
      body.append('status',         publish ? 'PUBLISHED' : 'DRAFT')
      body.append('targetAudience', formData.targetAudience)
      body.append('visibility',     formData.visibility)
      body.append('categoryId',     formData.categoryId)
      body.append('classId',        formData.classId)
      if (formData.schoolId) {
        body.append('schoolId', formData.schoolId)
      }

      const res = await fetch(`${API_BASE}/resources/create-with-file`, {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body,
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.message ?? `Request failed with status ${res.status}`)
      }

      setSuccess(`Resource ${publish ? 'published' : 'saved as draft'} successfully!`)
      setFormData({
        title: '',
        schoolId: '',
        categoryId: '',
        classId: '',
        type: 'PDF',
        form: 'DOCUMENT',
        targetAudience: 'Students',
        description: '',
        visibility: 'PUBLIC',
        file: null,
      })
      setSelectedTypeLabel('PDF Document')

    } catch (err) {
      setError(err.message ?? 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="bg-[#161b22] border border-[#21262d] rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-[#21262d]">
          <h2 className="text-sm font-semibold text-[#e6edf3]">Upload New Material</h2>
        </div>
        <div className="p-6">
          <form onSubmit={(e) => e.preventDefault()}>

            {/* Feedback banners */}
            {error && (
              <div className="mb-4 px-3 py-2 rounded-lg bg-[#3d1f1f] border border-[#f85149] text-[#f85149] text-xs">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-4 px-3 py-2 rounded-lg bg-[#1a2f1a] border border-[#2ea043] text-[#3fb950] text-xs">
                {success}
              </div>
            )}

            {/* School selector */}
            <div className="mb-4">
              <label className="text-xs font-medium text-[#8b949e] uppercase tracking-wider mb-1.5 block">
                School {formData.visibility === 'PRIVATE' ? '*' : '(optional)'}
              </label>
              <select
                name="schoolId"
                value={formData.schoolId}
                onChange={handleChange}
                disabled={loading}
                className="w-full bg-[#1c2330] border border-[#21262d] rounded-lg px-3 py-2 text-sm text-[#e6edf3] outline-none focus:border-[#388bfd] disabled:opacity-50"
              >
                <option value="">Select school</option>
                {schools.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            {/* Title */}
            <div className="mb-4">
              <label className="text-xs font-medium text-[#8b949e] uppercase tracking-wider mb-1.5 block">
                Resource Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                disabled={loading}
                className="w-full bg-[#1c2330] border border-[#21262d] rounded-lg px-3 py-2 text-sm text-[#e6edf3] outline-none focus:border-[#388bfd] disabled:opacity-50"
                placeholder="e.g. Form 3 Biology Notes – Cell Division"
              />
            </div>

            {/* Subject + Form Level */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="text-xs font-medium text-[#8b949e] uppercase tracking-wider mb-1.5 block">
                  Subject *
                </label>
                <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full bg-[#1c2330] border border-[#21262d] rounded-lg px-3 py-2 text-sm text-[#e6edf3] outline-none focus:border-[#388bfd] disabled:opacity-50"
                >
                  <option value="">Select subject</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-[#8b949e] uppercase tracking-wider mb-1.5 block">
                  Form Level *
                </label>
                <select
                  name="classId"
                  value={formData.classId}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full bg-[#1c2330] border border-[#21262d] rounded-lg px-3 py-2 text-sm text-[#e6edf3] outline-none focus:border-[#388bfd] disabled:opacity-50"
                >
                  <option value="">Select form</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Resource Type + Target Audience */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="text-xs font-medium text-[#8b949e] uppercase tracking-wider mb-1.5 block">
                  Resource Type
                </label>
                <select
                  value={selectedTypeLabel}
                  onChange={handleTypeChange}
                  disabled={loading}
                  className="w-full bg-[#1c2330] border border-[#21262d] rounded-lg px-3 py-2 text-sm text-[#e6edf3] outline-none focus:border-[#388bfd] disabled:opacity-50"
                >
                  {RESOURCE_TYPE_MAP.map((t) => (
                    <option key={t.label}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-[#8b949e] uppercase tracking-wider mb-1.5 block">
                  Target Audience
                </label>
                <select
                  name="targetAudience"
                  value={formData.targetAudience}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full bg-[#1c2330] border border-[#21262d] rounded-lg px-3 py-2 text-sm text-[#e6edf3] outline-none focus:border-[#388bfd] disabled:opacity-50"
                >
                  <option>Students</option>
                  <option>Teachers</option>
                  <option>Both</option>
                </select>
              </div>
            </div>

            {/* Visibility */}
            <div className="mb-4">
              <label className="text-xs font-medium text-[#8b949e] uppercase tracking-wider mb-1.5 block">
                Visibility
              </label>
              <select
                name="visibility"
                value={formData.visibility}
                onChange={handleChange}
                disabled={loading}
                className="w-full bg-[#1c2330] border border-[#21262d] rounded-lg px-3 py-2 text-sm text-[#e6edf3] outline-none focus:border-[#388bfd] disabled:opacity-50"
              >
                <option value="PUBLIC">Public</option>
                <option value="PRIVATE">Private (School Only)</option>
              </select>
            </div>

            {/* Description */}
            <div className="mb-4">
              <label className="text-xs font-medium text-[#8b949e] uppercase tracking-wider mb-1.5 block">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                disabled={loading}
                className="w-full bg-[#1c2330] border border-[#21262d] rounded-lg px-3 py-2 text-sm text-[#e6edf3] outline-none focus:border-[#388bfd] disabled:opacity-50"
                rows="3"
                placeholder="Briefly describe the content of this resource…"
              />
            </div>

            {/* File Upload */}
            <div
              className="border-2 border-dashed border-[#21262d] rounded-lg p-7 text-center cursor-pointer hover:border-[#388bfd] transition-all mb-4"
              onClick={() => !loading && document.getElementById('fileInput').click()}
            >
              <div className="text-3xl mb-2">📎</div>
              <div className="text-sm text-[#8b949e]">Click to select file or drag and drop</div>
              <div className="text-[11px] text-[#6e7681] mt-1">PDF, DOCX, MP4 · Max 50 MB</div>
              <input
                id="fileInput"
                type="file"
                accept=".pdf,.docx,.mp4,.png,.jpg,.jpeg,.mp3"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0] ?? null
                  setFormData({ ...formData, file })
                  setError(null)
                }}
              />
              {formData.file && (
                <div className="mt-2 text-xs text-[#388bfd]">Selected: {formData.file.name}</div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2.5">
              <button
                disabled={loading}
                className="bg-[#2ea043] text-white px-3.5 py-1.5 rounded-lg text-sm font-medium hover:bg-[#3fb950] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={(e) => handleSubmit(e, true)}
              >
                {loading ? 'Uploading…' : 'Upload & Publish'}
              </button>
              <button
                disabled={loading}
                className="bg-[#1c2330] text-[#8b949e] border border-[#21262d] px-3.5 py-1.5 rounded-lg text-sm font-medium hover:text-[#e6edf3] hover:border-[#6e7681] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={(e) => handleSubmit(e, false)}
              >
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