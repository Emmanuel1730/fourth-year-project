import { useState } from 'react'

const Resources = () => {
  // All data lives here
  const [resources, setResources] = useState([
    { id: 1, title: 'MSCE Chemistry Past Paper 2023', subject: 'Chemistry', type: 'PDF', form: 'Form 4', downloads: 3214, status: 'Published' },
    { id: 2, title: 'English Grammar Guide', subject: 'English', type: 'PDF', form: 'Form 2', downloads: 2891, status: 'Published' },
    { id: 3, title: 'Biology Cell Division Notes', subject: 'Biology', type: 'DOC', form: 'Form 3', downloads: 1432, status: 'Published' },
    { id: 4, title: 'Mathematics Revision Quiz', subject: 'Mathematics', type: 'Quiz', form: 'Form 1', downloads: 876, status: 'Active' },
    { id: 5, title: 'Physics Electricity Notes', subject: 'Physics', type: 'PDF', form: 'Form 4', downloads: 654, status: 'Published' },
    { id: 6, title: 'History of Malawi – Chapter 1', subject: 'History', type: 'PDF', form: 'Form 2', downloads: 543, status: 'Published' },
  ])

  // Filter states
  const [searchTerm, setSearchTerm] = useState('')
  const [subjectFilter, setSubjectFilter] = useState('All Subjects')
  const [typeFilter, setTypeFilter] = useState('All Types')
  const [formFilter, setFormFilter] = useState('All Forms')
  const [statusFilter, setStatusFilter] = useState('All Status')
  
  // Add form state (replaces modal)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newResource, setNewResource] = useState({
    title: '',
    subject: 'Mathematics',
    type: 'PDF',
    form: 'Form 1',
    status: 'Published'
  })

  // Filter options
  const subjects = ['All Subjects', 'Mathematics', 'English', 'Biology', 'Chemistry', 'Physics', 'History', 'Geography']
  const types = ['All Types', 'PDF', 'DOC', 'Quiz']
  const forms = ['All Forms', 'Form 1', 'Form 2', 'Form 3', 'Form 4']
  const statuses = ['All Status', 'Published', 'Pending', 'Draft', 'Active']

  // Filter function
  const filteredResources = resources.filter(r => {
    const matchesSearch = searchTerm === '' || 
      r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.subject.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSubject = subjectFilter === 'All Subjects' || r.subject === subjectFilter
    const matchesType = typeFilter === 'All Types' || r.type === typeFilter
    const matchesForm = formFilter === 'All Forms' || r.form === formFilter
    const matchesStatus = statusFilter === 'All Status' || r.status === statusFilter
    return matchesSearch && matchesSubject && matchesType && matchesForm && matchesStatus
  })

  // Handlers
  const handleAddResource = () => {
    if (!newResource.title) {
      alert('Please enter a title')
      return
    }
    
    const resource = {
      ...newResource,
      id: resources.length + 1,
      downloads: 0
    }
    
    setResources([resource, ...resources])
    setShowAddForm(false)
    setNewResource({ title: '', subject: 'Mathematics', type: 'PDF', form: 'Form 1', status: 'Published' })
    alert('Resource added successfully!')
  }

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this resource?')) {
      setResources(resources.filter(r => r.id !== id))
      alert('Resource deleted!')
    }
  }

  const handleStatusChange = (id, newStatus) => {
    setResources(resources.map(r => 
      r.id === id ? { ...r, status: newStatus } : r
    ))
    alert(`Resource ${newStatus === 'Published' ? 'published' : 'updated'}!`)
  }

  // Style functions (same as before)
  const getTypeClass = (type) => {
    switch(type) {
      case 'PDF': return 'tag-blue'
      case 'DOC': return 'tag-green'
      case 'Quiz': return 'tag-orange'
      default: return 'tag-gray'
    }
  }

  const getStatusClass = (status) => {
    switch(status) {
      case 'Published': return 'tag-green'
      case 'Active': return 'tag-green'
      case 'Pending': return 'tag-orange'
      case 'Draft': return 'tag-red'
      default: return 'tag-gray'
    }
  }

  return (
    <div>
      {/* Filter Row - EXACT same look */}
      <div className="flex gap-2.5 mb-4 flex-wrap items-center">
        <input
          className="filter-input flex-1 min-w-[180px]"
          placeholder="🔍 Search resources by title, subject…"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        
        <select 
          className="filter-select"
          value={subjectFilter}
          onChange={(e) => setSubjectFilter(e.target.value)}
        >
          {subjects.map(s => <option key={s}>{s}</option>)}
        </select>
        
        <select 
          className="filter-select"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          {types.map(t => <option key={t}>{t}</option>)}
        </select>
        
        <select 
          className="filter-select"
          value={formFilter}
          onChange={(e) => setFormFilter(e.target.value)}
        >
          {forms.map(f => <option key={f}>{f}</option>)}
        </select>
        
        <select 
          className="filter-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          {statuses.map(s => <option key={s}>{s}</option>)}
        </select>
        
        <button className="btn-primary" onClick={() => setShowAddForm(true)}>
          + Add Resource
        </button>
      </div>

      {/* Add Form - Looks like a modal but it's inline (same styling) */}
      {showAddForm && (
        <div className="mb-6 p-6 bg-surface border border-border rounded-xl">
          <h3 className="text-sm font-semibold mb-4">Add New Resource</h3>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <input
              className="form-input"
              placeholder="Resource title"
              value={newResource.title}
              onChange={(e) => setNewResource({...newResource, title: e.target.value})}
            />
            <select 
              className="form-select"
              value={newResource.subject}
              onChange={(e) => setNewResource({...newResource, subject: e.target.value})}
            >
              <option>Mathematics</option>
              <option>English</option>
              <option>Biology</option>
              <option>Chemistry</option>
              <option>Physics</option>
              <option>History</option>
              <option>Geography</option>
            </select>
            <select 
              className="form-select"
              value={newResource.type}
              onChange={(e) => setNewResource({...newResource, type: e.target.value})}
            >
              <option>PDF</option>
              <option>DOC</option>
              <option>Quiz</option>
            </select>
            <select 
              className="form-select"
              value={newResource.form}
              onChange={(e) => setNewResource({...newResource, form: e.target.value})}
            >
              <option>Form 1</option>
              <option>Form 2</option>
              <option>Form 3</option>
              <option>Form 4</option>
            </select>
          </div>
          <div className="flex gap-2.5">
            <button className="btn-primary" onClick={handleAddResource}>
              Save Resource
            </button>
            <button className="btn-ghost" onClick={() => setShowAddForm(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Resources Table - EXACT same look */}
      <div className="card">
        <table className="w-full">
          <thead>
            <tr className="text-[11px] font-semibold uppercase tracking-wider text-text3 border-b border-border">
              <th className="px-3 py-2 text-left">Title</th>
              <th className="px-3 py-2 text-left">Subject</th>
              <th className="px-3 py-2 text-left">Type</th>
              <th className="px-3 py-2 text-left">Form</th>
              <th className="px-3 py-2 text-left">Downloads</th>
              <th className="px-3 py-2 text-left">Status</th>
              <th className="px-3 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredResources.map((r) => (
              <tr key={r.id} className="border-b border-border last:border-0 hover:bg-white/5">
                <td className="px-3 py-2.5 text-sm">{r.title}</td>
                <td className="px-3 py-2.5 text-sm">{r.subject}</td>
                <td className="px-3 py-2.5 text-sm">
                  <span className={`tag ${getTypeClass(r.type)}`}>{r.type}</span>
                </td>
                <td className="px-3 py-2.5 text-sm">{r.form}</td>
                <td className="px-3 py-2.5 text-sm font-mono">{r.downloads.toLocaleString()}</td>
                <td className="px-3 py-2.5 text-sm">
                  <span className={`tag ${getStatusClass(r.status)}`}>{r.status}</span>
                </td>
                <td className="px-3 py-2.5 text-sm">
                  <div className="flex gap-1.5">
                    {r.status === 'Pending' && (
                      <button 
                        className="btn-ghost text-xs py-1 px-2.5"
                        onClick={() => handleStatusChange(r.id, 'Published')}
                      >
                        Approve
                      </button>
                    )}
                    {r.status === 'Draft' && (
                      <button 
                        className="btn-ghost text-xs py-1 px-2.5"
                        onClick={() => handleStatusChange(r.id, 'Published')}
                      >
                        Publish
                      </button>
                    )}
                    <button 
                      className="btn-ghost text-xs py-1 px-2.5"
                      onClick={() => alert('Edit feature coming soon')}
                    >
                      Edit
                    </button>
                    <button 
                      className="btn-ghost text-xs py-1 px-2.5 border-accent4 text-accent4"
                      onClick={() => handleDelete(r.id)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {/* Pagination - EXACT same look */}
        <div className="flex items-center gap-1.5 px-5 py-3 justify-end">
          <div className="w-8 h-8 rounded flex items-center justify-center cursor-pointer text-sm border border-border bg-surface2 text-text2 hover:bg-accent hover:text-white hover:border-accent transition-all active">1</div>
          <div className="w-8 h-8 rounded flex items-center justify-center cursor-pointer text-sm border border-border bg-surface2 text-text2 hover:bg-accent hover:text-white hover:border-accent transition-all">2</div>
          <div className="w-8 h-8 rounded flex items-center justify-center cursor-pointer text-sm border border-border bg-surface2 text-text2 hover:bg-accent hover:text-white hover:border-accent transition-all">3</div>
          <div className="w-8 h-8 rounded flex items-center justify-center cursor-pointer text-sm border border-border bg-surface2 text-text2 hover:bg-accent hover:text-white hover:border-accent transition-all">→</div>
        </div>
      </div>
    </div>
  )
}

export default Resources