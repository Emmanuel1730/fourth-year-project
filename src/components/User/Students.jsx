import { useState, useEffect } from 'react'

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

const Students = () => {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [formFilter, setFormFilter] = useState('All Forms')
  const [statusFilter, setStatusFilter] = useState('All Status')
  const [showModal, setShowModal] = useState(false)
  const [schools, setSchools] = useState([])

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    schoolId: '',
    bio: '',
    dateOfBirth: '',
  })

  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState(null)
  const [formSuccess, setFormSuccess] = useState(null)

  const token = localStorage.getItem('accessToken')

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }

  const fetchStudents = async () => {
    try {
      setLoading(true)

      const res = await fetch(`${API_BASE}/profiles`, { headers })

      if (!res.ok) {
        throw new Error(`Failed to fetch profiles: ${res.status}`)
      }

      const data = await res.json()

      setStudents(data.filter((p) => p.role === 'STUDENT'))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStudents()

    fetch(`${API_BASE}/school`, { headers })
      .then((r) => r.json())
      .then((data) => setSchools(Array.isArray(data) ? data : []))
      .catch(() => setSchools([]))
  }, [])

  const handleFormChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })

    setFormError(null)
  }

  const handleAddStudent = async (e) => {
    e.preventDefault()

    setFormError(null)
    setFormSuccess(null)

    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      !formData.password
    ) {
      setFormError('Please fill in all required fields.')
      return
    }

    setFormLoading(true)

    try {
      const res = await fetch(`${API_BASE}/profiles`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          bio: formData.bio || undefined,
          dateOfBirth: formData.dateOfBirth || undefined,
          schoolId: formData.schoolId || undefined,
          role: 'STUDENT',
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))

        throw new Error(
          data?.message ?? `Request failed with status ${res.status}`
        )
      }

      setFormSuccess('Student added successfully!')

      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        schoolId: '',
        bio: '',
        dateOfBirth: '',
      })

      await fetchStudents()

      setTimeout(() => {
        setShowModal(false)
        setFormSuccess(null)
      }, 1500)
    } catch (err) {
      setFormError(err.message)
    } finally {
      setFormLoading(false)
    }
  }

  const forms = [
    'All Forms',
    ...new Set(students.map((s) => s.school?.name ?? 'N/A')),
  ]

  const statuses = ['All Status', 'Active', 'Inactive']

  const filteredStudents = students.filter((s) => {
    const fullName = `${s.firstName} ${s.lastName}`.toLowerCase()
    const school = s.school?.name?.toLowerCase() ?? ''

    return (
      (fullName.includes(searchTerm.toLowerCase()) ||
        school.includes(searchTerm.toLowerCase())) &&
      (formFilter === 'All Forms' ||
        (s.school?.name ?? 'N/A') === formFilter) &&
      (statusFilter === 'All Status' ||
        (statusFilter === 'Active' ? s.isActive : !s.isActive))
    )
  })

  const statusColor = (isActive) =>
    isActive
      ? {
          bg: '#2ea04320',
          text: '#2ea043',
          label: 'Active',
        }
      : {
          bg: '#6e768120',
          text: '#8b949e',
          label: 'Inactive',
        }

  const formatDate = (d) => {
    if (!d) return '—'

    return new Date(d).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  const inputStyle = {
    width: '100%',
    backgroundColor: '#1c2330',
    border: '1px solid #21262d',
    borderRadius: '8px',
    padding: '8px 12px',
    fontSize: '13px',
    color: '#e6edf3',
    outline: 'none',
  }

  return (
    <div
      className="p-6 min-h-screen font-sans"
      style={{ backgroundColor: '#0d1117' }}
    >
      {/* Top bar */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <input
          type="text"
          placeholder="Search students by name, school..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 min-w-[250px] px-4 py-2 rounded-lg"
          style={{
            backgroundColor: '#161b22',
            border: '1px solid #21262d',
            color: '#e6edf3',
            outline: 'none',
          }}
          onFocus={(e) => (e.target.style.borderColor = '#388bfd')}
          onBlur={(e) => (e.target.style.borderColor = '#21262d')}
        />

        <select
          value={formFilter}
          onChange={(e) => setFormFilter(e.target.value)}
          className="px-4 py-2 rounded-lg"
          style={{
            backgroundColor: '#161b22',
            border: '1px solid #21262d',
            color: '#e6edf3',
          }}
        >
          {forms.map((f) => (
            <option
              key={f}
              value={f}
              style={{ backgroundColor: '#161b22' }}
            >
              {f}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 rounded-lg"
          style={{
            backgroundColor: '#161b22',
            border: '1px solid #21262d',
            color: '#e6edf3',
          }}
        >
          {statuses.map((s) => (
            <option
              key={s}
              value={s}
              style={{ backgroundColor: '#161b22' }}
            >
              {s}
            </option>
          ))}
        </select>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 rounded-lg text-sm font-medium"
          style={{
            backgroundColor: '#2ea043',
            color: '#fff',
          }}
        >
          + Add Student
        </button>
      </div>

      {loading && (
        <div
          className="text-center py-12"
          style={{ color: '#8b949e' }}
        >
          Loading students...
        </div>
      )}

      {error && (
        <div
          className="px-4 py-3 rounded-lg mb-4"
          style={{
            backgroundColor: '#3d1f1f',
            border: '1px solid #f85149',
            color: '#f85149',
          }}
        >
          {error}
        </div>
      )}

      {!loading && !error && (
        <>
          <div
            className="overflow-x-auto rounded-lg shadow"
            style={{ backgroundColor: '#161b22' }}
          >
            <table className="min-w-full table-auto border-collapse">
              <thead
                style={{
                  backgroundColor: '#1c2330',
                  borderBottom: '1px solid #21262d',
                }}
              >
                <tr>
                  {[
                    'Name',
                    'School',
                    'Email',
                    'Date of Birth',
                    'Joined',
                    'Status',
                    'Actions',
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                      style={{ color: '#8b949e' }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {filteredStudents.map((s) => {
                  const sc = statusColor(s.isActive)

                  return (
                    <tr
                      key={s.id}
                      style={{
                        backgroundColor: '#161b22',
                        borderBottom: '1px solid #21262d',
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor = '#1c2330')
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor = '#161b22')
                      }
                    >
                      <td
                        className="px-6 py-4 whitespace-nowrap text-sm font-medium"
                        style={{ color: '#e6edf3' }}
                      >
                        {s.firstName} {s.lastName}
                      </td>

                      <td
                        className="px-6 py-4 whitespace-nowrap text-sm"
                        style={{ color: '#8b949e' }}
                      >
                        {s.school?.name ?? '—'}
                      </td>

                      <td
                        className="px-6 py-4 whitespace-nowrap text-sm"
                        style={{ color: '#8b949e' }}
                      >
                        {s.email}
                      </td>

                      <td
                        className="px-6 py-4 whitespace-nowrap text-sm"
                        style={{ color: '#8b949e' }}
                      >
                        {formatDate(s.dateOfBirth)}
                      </td>

                      <td
                        className="px-6 py-4 whitespace-nowrap text-sm"
                        style={{ color: '#8b949e' }}
                      >
                        {formatDate(s.joinDate)}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className="px-2 py-1 text-xs font-medium rounded-full"
                          style={{
                            backgroundColor: sc.bg,
                            color: sc.text,
                          }}
                        >
                          {sc.label}
                        </span>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          className="font-medium"
                          style={{ color: '#388bfd' }}
                          onMouseEnter={(e) =>
                            (e.target.style.color = '#2ea043')
                          }
                          onMouseLeave={(e) =>
                            (e.target.style.color = '#388bfd')
                          }
                          onClick={() =>
                            alert(`View: ${s.firstName} ${s.lastName}`)
                          }
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            {filteredStudents.length === 0 && (
              <div
                className="px-6 py-8 text-center"
                style={{ color: '#6e7681' }}
              >
                No students found matching your filters.
              </div>
            )}
          </div>

          <div
            className="mt-4 text-xs"
            style={{ color: '#6e7681' }}
          >
            Showing {filteredStudents.length} of {students.length} students
          </div>
        </>
      )}

      {/* Add Student Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowModal(false)
            }
          }}
        >
          <div
            className="w-full max-w-md rounded-xl overflow-hidden"
            style={{
              backgroundColor: '#161b22',
              border: '1px solid #21262d',
            }}
          >
            <div
              className="px-5 py-4 flex justify-between items-center"
              style={{ borderBottom: '1px solid #21262d' }}
            >
              <h2
                className="text-sm font-semibold"
                style={{ color: '#e6edf3' }}
              >
                Add New Student
              </h2>

              <button
                onClick={() => setShowModal(false)}
                style={{
                  color: '#8b949e',
                  fontSize: '20px',
                  lineHeight: 1,
                }}
              >
                ×
              </button>
            </div>

            <div className="p-5 max-h-[80vh] overflow-y-auto">
              {formError && (
                <div
                  className="mb-4 px-3 py-2 rounded-lg text-xs"
                  style={{
                    backgroundColor: '#3d1f1f',
                    border: '1px solid #f85149',
                    color: '#f85149',
                  }}
                >
                  {formError}
                </div>
              )}

              {formSuccess && (
                <div
                  className="mb-4 px-3 py-2 rounded-lg text-xs"
                  style={{
                    backgroundColor: '#1a2f1a',
                    border: '1px solid #2ea043',
                    color: '#3fb950',
                  }}
                >
                  {formSuccess}
                </div>
              )}

              <form onSubmit={handleAddStudent}>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label
                      className="text-xs font-medium uppercase tracking-wider mb-1 block"
                      style={{ color: '#8b949e' }}
                    >
                      First Name *
                    </label>

                    <input
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleFormChange}
                      disabled={formLoading}
                      style={inputStyle}
                      placeholder="name"
                    />
                  </div>

                  <div>
                    <label
                      className="text-xs font-medium uppercase tracking-wider mb-1 block"
                      style={{ color: '#8b949e' }}
                    >
                      Last Name *
                    </label>

                    <input
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleFormChange}
                      disabled={formLoading}
                      style={inputStyle}
                      placeholder="surname"
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label
                    className="text-xs font-medium uppercase tracking-wider mb-1 block"
                    style={{ color: '#8b949e' }}
                  >
                    Email *
                  </label>

                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleFormChange}
                    disabled={formLoading}
                    style={inputStyle}
                    placeholder="email"
                  />
                </div>

                <div className="mb-3">
                  <label
                    className="text-xs font-medium uppercase tracking-wider mb-1 block"
                    style={{ color: '#8b949e' }}
                  >
                    Password *
                  </label>

                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleFormChange}
                    disabled={formLoading}
                    style={inputStyle}
                    placeholder="••••••••"
                  />
                </div>

                <div className="mb-3">
                  <label
                    className="text-xs font-medium uppercase tracking-wider mb-1 block"
                    style={{ color: '#8b949e' }}
                  >
                    Date of Birth
                  </label>

                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleFormChange}
                    disabled={formLoading}
                    style={inputStyle}
                  />
                </div>

                <div className="mb-3">
                  <label
                    className="text-xs font-medium uppercase tracking-wider mb-1 block"
                    style={{ color: '#8b949e' }}
                  >
                    School
                  </label>

                  <select
                    name="schoolId"
                    value={formData.schoolId}
                    onChange={handleFormChange}
                    disabled={formLoading}
                    style={inputStyle}
                  >
                    <option value="">Select school</option>

                    {schools.map((s) => (
                      <option
                        key={s.id}
                        value={s.id}
                        style={{ backgroundColor: '#1c2330' }}
                      >
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-4">
                  <label
                    className="text-xs font-medium uppercase tracking-wider mb-1 block"
                    style={{ color: '#8b949e' }}
                  >
                    Bio
                  </label>

                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleFormChange}
                    disabled={formLoading}
                    style={{
                      ...inputStyle,
                      resize: 'none',
                    }}
                    rows="2"
                    placeholder="Optional..."
                  />
                </div>

                <div
                  className="mb-4 px-3 py-2 rounded-lg text-xs"
                  style={{
                    backgroundColor: '#1c2330',
                    border: '1px solid #21262d',
                    color: '#8b949e',
                  }}
                >
                  Role:{' '}
                  <span
                    style={{
                      color: '#388bfd',
                      fontWeight: 600,
                    }}
                  >
                    STUDENT
                  </span>{' '}
                  (set automatically)
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="px-4 py-2 rounded-lg text-sm font-medium"
                    style={{
                      backgroundColor: '#2ea043',
                      color: '#fff',
                      opacity: formLoading ? 0.5 : 1,
                    }}
                  >
                    {formLoading ? 'Adding...' : 'Add Student'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    disabled={formLoading}
                    className="px-4 py-2 rounded-lg text-sm font-medium"
                    style={{
                      backgroundColor: '#1c2330',
                      color: '#8b949e',
                      border: '1px solid #21262d',
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Students