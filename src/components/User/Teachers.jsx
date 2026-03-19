import React, { useState } from 'react';

const Teachers = () => {
  // Sample data based on the image
  const initialTeachers = [
    {
      id: 1,
      name: 'Fatima Ngwira',
      school: 'Blantyre Secondary',
      subject: 'Biology',
      uploads: 12,
      joined: 'Jan 2026',
      status: 'Pending',
    },
    {
      id: 2,
      name: 'Takondwa Banda',
      school: 'Kamuzu Academy',
      subject: 'Chemistry',
      uploads: 8,
      joined: 'Feb 2026',
      status: 'Active',
    },
    {
      id: 3,
      name: 'James Mkandawire',
      school: "St. Patrick's",
      subject: 'Mathematics',
      uploads: 21,
      joined: 'Dec 2025',
      status: 'Active',
    },
  ];

  const [teachers] = useState(initialTeachers);
  const [searchTerm, setSearchTerm] = useState('');
  const [schoolFilter, setSchoolFilter] = useState('All Schools');
  const [statusFilter, setStatusFilter] = useState('All Status');

  // Get unique schools and statuses for filter dropdowns
  const schools = ['All Schools', ...new Set(teachers.map((t) => t.school))];
  const statuses = ['All Status', ...new Set(teachers.map((t) => t.status))];

  // Filter teachers based on search, school, and status
  const filteredTeachers = teachers.filter((teacher) => {
    const matchesSearch =
      teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.school.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSchool = schoolFilter === 'All Schools' || teacher.school === schoolFilter;
    const matchesStatus = statusFilter === 'All Status' || teacher.status === statusFilter;

    return matchesSearch && matchesSchool && matchesStatus;
  });

  // Handlers
  const handleSearchChange = (e) => setSearchTerm(e.target.value);
  const handleSchoolChange = (e) => setSchoolFilter(e.target.value);
  const handleStatusChange = (e) => setStatusFilter(e.target.value);
  const handleView = (teacherName) => alert(`View details for: ${teacherName}`);
  const handleApprove = (teacherName) => alert(`Approve teacher: ${teacherName}`);
  const handleAddTeacher = () => alert('Add new teacher');

  // Helper to get status badge styling
  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
        return { bg: '#2ea04320', text: '#2ea043' };
      case 'Pending':
        return { bg: '#f0883e20', text: '#f0883e' };
      default:
        return { bg: '#6e768120', text: '#8b949e' };
    }
  };

  return (
    <div className="p-6 min-h-screen font-sans" style={{ backgroundColor: '#0d1117' }}>
      {/* Top bar: Search + Filters + Add Teacher Button */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        {/* Search input */}
        <input
          type="text"
          placeholder="Search teachers by name, school, or subject..."
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

        {/* School filter */}
        <select
          value={schoolFilter}
          onChange={handleSchoolChange}
          className="px-4 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 transition-colors"
          style={{ 
            backgroundColor: '#161b22',
            borderColor: '#21262d',
            color: '#e6edf3',
            borderWidth: '1px',
            borderStyle: 'solid'
          }}
        >
          {schools.map((school) => (
            <option key={school} value={school} style={{ backgroundColor: '#161b22', color: '#e6edf3' }}>
              {school}
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

        {/* Add Teacher button */}
        <button
          onClick={handleAddTeacher}
          className="px-6 py-2 font-medium rounded-lg shadow hover:opacity-90 focus:outline-none focus:ring-2 transition-colors"
          style={{ 
            backgroundColor: '#2ea043',
            color: '#e6edf3'
          }}
        >
          + Add Teacher
        </button>
      </div>

      {/* Teachers Table */}
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
                Subject
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#8b949e' }}>
                Uploads
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#8b949e' }}>
                Joined
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
            {filteredTeachers.map((teacher) => {
              const statusColors = getStatusColor(teacher.status);
              return (
                <tr 
                  key={teacher.id} 
                  className="transition-colors hover:bg-opacity-50" 
                  style={{ backgroundColor: '#161b22', '--hover-bg': '#1c2330' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1c2330'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#161b22'}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium" style={{ color: '#e6edf3' }}>
                    {teacher.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: '#8b949e' }}>
                    {teacher.school}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: '#8b949e' }}>
                    {teacher.subject}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: '#8b949e' }}>
                    {teacher.uploads}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: '#8b949e' }}>
                    {teacher.joined}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span 
                      className="px-2 py-1 text-xs font-medium rounded-full"
                      style={{ 
                        backgroundColor: statusColors.bg,
                        color: statusColors.text
                      }}
                    >
                      {teacher.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {teacher.status === 'Pending' ? (
                      <button
                        onClick={() => handleApprove(teacher.name)}
                        className="font-medium hover:underline focus:outline-none transition-colors"
                        style={{ color: '#f0883e' }}
                        onMouseEnter={(e) => e.target.style.color = '#2ea043'}
                        onMouseLeave={(e) => e.target.style.color = '#f0883e'}
                      >
                        Approve
                      </button>
                    ) : (
                      <button
                        onClick={() => handleView(teacher.name)}
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
        {filteredTeachers.length === 0 && (
          <div className="px-6 py-8 text-center" style={{ color: '#6e7681' }}>
            No teachers found matching your filters.
          </div>
        )}
      </div>
    </div>
  );
};

export default Teachers;