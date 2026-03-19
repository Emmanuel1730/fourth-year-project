import { useState } from 'react'

const Upload = () => {
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    form: '',
    type: 'PDF Document',
    description: '',
    file: null
  })

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e, publish = true) => {
    e.preventDefault()
    
    if (!formData.title || !formData.subject || !formData.form) {
      alert('Please fill in all required fields')
      return
    }

    alert(`Resource ${publish ? 'published' : 'saved as draft'} successfully!`)
    setFormData({
      title: '',
      subject: '',
      form: '',
      type: 'PDF Document',
      description: '',
      file: null
    })
  }

  return (
    <div className="max-w-2xl">
      <div className="card">
        <div className="card-header">
          <div className="card-title">Upload New Material</div>
        </div>
        <div className="p-6">
          <form onSubmit={(e) => e.preventDefault()}>
            {/* Same exact form as before */}
            <div className="mb-4">
              <label className="form-label">Resource Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="form-input"
                placeholder="e.g. Form 3 Biology Notes – Cell Division"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="form-label">Subject *</label>
                <select 
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="form-select"
                >
                  <option value="">Select subject</option>
                  <option>Mathematics</option>
                  <option>English</option>
                  <option>Biology</option>
                  <option>Chemistry</option>
                  <option>Physics</option>
                  <option>History</option>
                  <option>Geography</option>
                </select>
              </div>
              <div>
                <label className="form-label">Form Level *</label>
                <select 
                  name="form"
                  value={formData.form}
                  onChange={handleChange}
                  className="form-select"
                >
                  <option value="">Select form</option>
                  <option>Form 1</option>
                  <option>Form 2</option>
                  <option>Form 3</option>
                  <option>Form 4</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="form-label">Resource Type</label>
                <select 
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="form-select"
                >
                  <option>PDF Document</option>
                  <option>Word Document</option>
                  <option>Quiz / Test</option>
                  <option>Video</option>
                </select>
              </div>
              <div>
                <label className="form-label">Target Audience</label>
                <select 
                  name="audience"
                  className="form-select"
                >
                  <option>Students</option>
                  <option>Teachers</option>
                  <option>Both</option>
                </select>
              </div>
            </div>

            <div className="mb-4">
              <label className="form-label">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="form-input"
                rows="3"
                placeholder="Briefly describe the content of this resource…"
              />
            </div>

            <div 
              className="border-2 border-dashed border-border rounded-lg p-7 text-center cursor-pointer hover:border-accent2 transition-all mb-4"
              onClick={() => document.getElementById('fileInput').click()}
            >
              <div className="text-3xl mb-2">📎</div>
              <div className="text-sm text-text2">Click to select file or drag and drop</div>
              <div className="text-[11px] text-text3 mt-1">PDF, DOCX, MP4 · Max 50 MB</div>
              <input
                id="fileInput"
                type="file"
                className="hidden"
                onChange={(e) => setFormData({...formData, file: e.target.files[0]})}
              />
              {formData.file && (
                <div className="mt-2 text-xs text-accent2">
                  Selected: {formData.file.name}
                </div>
              )}
            </div>

            <div className="flex gap-2.5">
              <button 
                className="btn-primary"
                onClick={(e) => handleSubmit(e, true)}
              >
                Upload & Publish
              </button>
              <button 
                className="btn-ghost"
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