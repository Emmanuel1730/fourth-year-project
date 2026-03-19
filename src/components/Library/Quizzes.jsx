import { useState } from 'react'

const Quizzes = () => {
  const [quizzes, setQuizzes] = useState([
    { id: 1, title: 'MSCE Mathematics Mock 2023', subject: 'Mathematics', form: 'Form 4', questions: 60, attempts: 1243, status: 'Active' },
    { id: 2, title: 'English Grammar Quiz – Tenses', subject: 'English', form: 'Form 2', questions: 25, attempts: 876, status: 'Active' },
    { id: 3, title: 'Biology Chapter 3 – Cells', subject: 'Biology', form: 'Form 3', questions: 30, attempts: 543, status: 'Inactive' },
    { id: 4, title: 'Chemistry Revision – Periodic Table', subject: 'Chemistry', form: 'Form 4', questions: 20, attempts: 0, status: 'Draft' },
  ])

  const [searchTerm, setSearchTerm] = useState('')
  const [subjectFilter, setSubjectFilter] = useState('All Subjects')

  const subjects = ['All Subjects', 'Mathematics', 'English', 'Biology', 'Chemistry']

  const filteredQuizzes = quizzes.filter(q => {
    const matchesSearch = searchTerm === '' || q.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSubject = subjectFilter === 'All Subjects' || q.subject === subjectFilter
    return matchesSearch && matchesSubject
  })

  const handleStatusChange = (id) => {
    setQuizzes(quizzes.map(q => 
      q.id === id 
        ? { ...q, status: q.status === 'Active' ? 'Inactive' : 'Active' }
        : q
    ))
    alert('Quiz status updated!')
  }

  const handlePublish = (id) => {
    setQuizzes(quizzes.map(q => 
      q.id === id ? { ...q, status: 'Active' } : q
    ))
    alert('Quiz published!')
  }

  const handleDelete = (id) => {
    if (window.confirm('Delete this quiz?')) {
      setQuizzes(quizzes.filter(q => q.id !== id))
      alert('Quiz deleted!')
    }
  }

  const getStatusClass = (status) => {
    switch(status) {
      case 'Active': return 'tag-green'
      case 'Inactive': return 'tag-orange'
      case 'Draft': return 'tag-red'
      default: return 'tag-gray'
    }
  }

  return (
    <div>
      <div className="flex gap-2.5 mb-4 flex-wrap items-center">
        <input
          className="filter-input flex-1 min-w-[180px]"
          placeholder="🔍 Search quizzes…"
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
        <button className="btn-primary" onClick={() => alert('Quiz builder coming soon')}>
          + Create Quiz
        </button>
      </div>

      <div className="card">
        <table className="w-full">
          <thead>
            <tr className="text-[11px] font-semibold uppercase tracking-wider text-text3 border-b border-border">
              <th className="px-3 py-2 text-left">Quiz Title</th>
              <th className="px-3 py-2 text-left">Subject</th>
              <th className="px-3 py-2 text-left">Form</th>
              <th className="px-3 py-2 text-left">Questions</th>
              <th className="px-3 py-2 text-left">Attempts</th>
              <th className="px-3 py-2 text-left">Status</th>
              <th className="px-3 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredQuizzes.map((q) => (
              <tr key={q.id} className="border-b border-border last:border-0 hover:bg-white/5">
                <td className="px-3 py-2.5 text-sm">{q.title}</td>
                <td className="px-3 py-2.5 text-sm">{q.subject}</td>
                <td className="px-3 py-2.5 text-sm">{q.form}</td>
                <td className="px-3 py-2.5 text-sm">{q.questions}</td>
                <td className="px-3 py-2.5 text-sm font-mono">{q.attempts.toLocaleString()}</td>
                <td className="px-3 py-2.5 text-sm">
                  <span className={`tag ${getStatusClass(q.status)}`}>{q.status}</span>
                </td>
                <td className="px-3 py-2.5 text-sm">
                  <div className="flex gap-1.5">
                    {q.status === 'Inactive' && (
                      <button 
                        className="btn-ghost text-xs py-1 px-2.5"
                        onClick={() => handleStatusChange(q.id)}
                      >
                        Activate
                      </button>
                    )}
                    {q.status === 'Draft' && (
                      <button 
                        className="btn-ghost text-xs py-1 px-2.5"
                        onClick={() => handlePublish(q.id)}
                      >
                        Publish
                      </button>
                    )}
                    {q.status === 'Active' && (
                      <button 
                        className="btn-ghost text-xs py-1 px-2.5"
                        onClick={() => handleStatusChange(q.id)}
                      >
                        Deactivate
                      </button>
                    )}
                    <button 
                      className="btn-ghost text-xs py-1 px-2.5 border-accent4 text-accent4"
                      onClick={() => handleDelete(q.id)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Quizzes