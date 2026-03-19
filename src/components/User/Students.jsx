import React, { useState } from 'react';

const Students = () => {
  // Sample data based on the image
  const initialStudents = [
    {
      id: 1,
      name: 'Grace Chikwanda',
      school: 'Blantyre Secondary',
      form: 'Form 4',
      downloads: 34,
      lastActive: 'Today',
      status: 'Active',
    },
    {
      id: 2,
      name: 'Kondwani Mwale',
      school: 'Kamuzu Academy',
      form: 'Form 3',
      downloads: 22,
      lastActive: 'Yesterday',
      status: 'Active',
    },
    {
      id: 3,
      name: 'Thandiwe Phiri',
      school: "St. Patrick's",
      form: 'Form 2',
      downloads: 7,
      lastActive: 'Mar 10',
      status: 'Inactive',
    },
    {
      id: 4,
      name: 'Daniel Tembo',
      school: 'Lilongwe Sec.',
      form: 'Form 1',
      downloads: 0,
      lastActive: 'Never',
      status: 'Suspended',
    },
  ];

  const [students] = useState(initialStudents);
  const [searchTerm, setSearchTerm] = useState('');
  const [formFilter, setFormFilter] = useState('All Forms');
  const [statusFilter, setStatusFilter] = useState('All Status');

  // Get unique forms and statuses for filter dropdowns
  const forms = ['All Forms', ...new Set(students.map((s) => s.form))];
  const statuses = ['All Status', ...new Set(students.map((s) => s.status))];

  // Filter students based on search, form, and status
  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.school.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesForm = formFilter === 'All Forms' || student.form === formFilter;
    const matchesStatus = statusFilter === 'All Status' || student.status === statusFilter;

    return matchesSearch && matchesForm && matchesStatus;
  });

  // Handlers
  const handleSearchChange = (e) => setSearchTerm(e.target.value);
  const handleFormChange = (e) => setFormFilter(e.target.value);
  const handleStatusChange = (e) => setStatusFilter(e.target.value);
  const handleView = (studentName) => alert(`View details for: ${studentName}`);
  const handleReinstate = (studentName) => alert(`Reinstate student: ${studentName}`);
  const handleAddStudent = () => alert('Add new student');

  // Helper to get status badge styling
  const getStatusBadge = (status) => {
    const baseClasses = 'px-2 py-1 text-xs font-medium rounded-full';
    switch (status) {
      case 'Active':
        return `${baseClasses}`;
      case 'Inactive':
        return `${baseClasses}`;
      case 'Suspended':
        return `${baseClasses}`;
      default:
        return `${baseClasses}`;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
        return { bg: '#2ea04320', text: '#2ea043' };
      case 'Inactive':
        return { bg: '#6e768120', text: '#8b949e' };
      case 'Suspended':
        return { bg: '#da363320', text: '#da3633' };
      default:
        return { bg: '#6e768120', text: '#8b949e' };
    }
  };

  return (
    <div className="p-6 min-h-screen font-sans" style={{ backgroundColor: '#0d1117' }}>
      {/* Top bar: Search + Filters + Add Student Button */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        {/* Search input */}
        <input
          type="text"
          placeholder="Search students by name, school..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="flex-1 min-w-[250px] px-4 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 transition-colors"
          style={{ 
            backgroundColor: '#161b22',
            borderColor: '#21262d',
            color: '#e6edf3',
            borderWidth: '1px',
            borderStyle: 'solid'
          }}
          onFocus={(e) => e.target.style.borderColor = '#388bfd'}
          onBlur={(e) => e.target.style.borderColor = '#21262d'}
        />

        {/* Form filter */}
        <select
          value={formFilter}
          onChange={handleFormChange}
          className="px-4 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 transition-colors"
          style={{ 
            backgroundColor: '#161b22',
            borderColor: '#21262d',
            color: '#e6edf3',
            borderWidth: '1px',
            borderStyle: 'solid'
          }}
        >
          {forms.map((form) => (
            <option key={form} value={form} style={{ backgroundColor: '#161b22', color: '#e6edf3' }}>
              {form}
            </option>
          ))}
        </select>

        {/* Status filter */}
        <select
          value={statusFilter}
          onChange={handleStatusChange}
          className="px-4 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 transition-colors"
          style={{ 
            backgroundColor: '#161b22',
            borderColor: '#21262d',
            color: '#e6edf3',
            borderWidth: '1px',
            borderStyle: 'solid'
          }}
        >
          {statuses.map((status) => (
            <option key={status} value={status} style={{ backgroundColor: '#161b22', color: '#e6edf3' }}>
              {status}
            </option>
          ))}
        </select>

        {/* Add Student button */}
        <button
          onClick={handleAddStudent}
          className="px-6 py-2 font-medium rounded-lg shadow hover:opacity-90 focus:outline-none focus:ring-2 transition-colors"
          style={{ 
            backgroundColor: '#2ea043',
            color: '#e6edf3'
          }}
        >
          + Add Student
        </button>
      </div>

      {/* Students Table */}
      <div className="overflow-x-auto rounded-lg shadow" style={{ backgroundColor: '#161b22' }}>
        <table className="min-w-full table-auto border-collapse">
          <thead style={{ backgroundColor: '#1c2330', borderBottom: '1px solid #21262d' }}>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#8b949e' }}>
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#8b949e' }}>
                School
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#8b949e' }}>
                Form
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#8b949e' }}>
                Downloads
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#8b949e' }}>
                Last Active
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#8b949e' }}>
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#8b949e' }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y" style={{ borderColor: '#21262d' }}>
            {filteredStudents.map((student) => {
              const statusColors = getStatusColor(student.status);
              return (
                <tr 
                  key={student.id} 
                  className="transition-colors hover:bg-opacity-50" 
                  style={{ backgroundColor: '#161b22', '--hover-bg': '#1c2330' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1c2330'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#161b22'}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium" style={{ color: '#e6edf3' }}>
                    {student.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: '#8b949e' }}>
                    {student.school}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: '#8b949e' }}>
                    {student.form}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: '#8b949e' }}>
                    {student.downloads}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: '#8b949e' }}>
                    {student.lastActive}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span 
                      className="px-2 py-1 text-xs font-medium rounded-full"
                      style={{ 
                        backgroundColor: statusColors.bg,
                        color: statusColors.text
                      }}
                    >
                      {student.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {student.status === 'Suspended' ? (
                      <button
                        onClick={() => handleReinstate(student.name)}
                        className="font-medium hover:underline focus:outline-none transition-colors"
                        style={{ color: '#f0883e' }}
                        onMouseEnter={(e) => e.target.style.color = '#da3633'}
                        onMouseLeave={(e) => e.target.style.color = '#f0883e'}
                      >
                        Reinstate
                      </button>
                    ) : (
                      <button
                        onClick={() => handleView(student.name)}
                        className="font-medium hover:underline focus:outline-none transition-colors"
                        style={{ color: '#388bfd' }}
                        onMouseEnter={(e) => e.target.style.color = '#2ea043'}
                        onMouseLeave={(e) => e.target.style.color = '#388bfd'}
                      >
                        View
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* No results message */}
        {filteredStudents.length === 0 && (
          <div className="px-6 py-8 text-center" style={{ color: '#6e7681' }}>
            No students found matching your filters.
          </div>
        )}
      </div>
    </div>
  );
};

export default Students;