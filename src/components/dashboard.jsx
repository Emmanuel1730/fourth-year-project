import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

const DashboardOverview = () => {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalResources: null,
    totalStudents:  null,
    activeTeachers: null,
    totalSchools:   null,
  });

  const [recentResources, setRecentResources] = useState([]);
  const [loadingStats, setLoadingStats]       = useState(true);
  const [loadingResources, setLoadingResources] = useState(true);

  // Static data — no endpoint available yet
  const downloadsData = [
    { subject: 'Mathematics', downloads: '3.2k', percentage: 88, color: 'bg-blue-500' },
    { subject: 'English',     downloads: '2.7k', percentage: 74, color: 'bg-green-500' },
    { subject: 'Biology',     downloads: '2.3k', percentage: 62, color: 'bg-orange-500' },
    { subject: 'Chemistry',   downloads: '1.9k', percentage: 54, color: 'bg-blue-500' },
    { subject: 'History',     downloads: '1.5k', percentage: 41, color: 'bg-green-500' },
    { subject: 'Physics',     downloads: '1.3k', percentage: 36, color: 'bg-orange-500' },
    { subject: 'Geography',   downloads: '1.1k', percentage: 29, color: 'bg-red-500' },
  ];

  const activities = [
    { text: 'Form 4 Chemistry Notes uploaded by T. Banda', time: '5 min ago', dotColor: 'bg-green-500' },
    { text: 'Kamuzu Academy enrolled on the platform',     time: '1 hr ago',  dotColor: 'bg-blue-500' },
    { text: 'Quiz — MSCE Past Paper 2023 activated',       time: '2 hrs ago', dotColor: 'bg-orange-500' },
    { text: 'User Grace Phiri reported a broken link',     time: '3 hrs ago', dotColor: 'bg-red-500' },
  ];

  const storage = {
    used: '7.8 GB', total: '10 GB', percentage: 78,
    breakdown: [
      { label: 'PDFs',   value: '4.2 GB', color: 'text-blue-400' },
      { label: 'Videos', value: '2.8 GB', color: 'text-orange-400' },
      { label: 'Images', value: '0.8 GB', color: 'text-green-400' },
    ],
  };

  const token = localStorage.getItem('accessToken');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [profilesRes, resourcesRes, schoolsRes] = await Promise.all([
          fetch(`${API_BASE}/profiles`,  { headers }),
          fetch(`${API_BASE}/resources`, { headers }),
          fetch(`${API_BASE}/school`,    { headers }),
        ]);

        const profiles  = profilesRes.ok  ? await profilesRes.json()  : [];
        const resources = resourcesRes.ok ? await resourcesRes.json() : {};
        const schools   = schoolsRes.ok   ? await schoolsRes.json()   : [];

        setStats({
          totalResources: resources?.total ?? (Array.isArray(resources?.data) ? resources.data.length : null),
          totalStudents:  Array.isArray(profiles) ? profiles.filter((p) => p.role === 'STUDENT').length : null,
          activeTeachers: Array.isArray(profiles) ? profiles.filter((p) => p.role === 'TEACHER' && p.isActive).length : null,
          totalSchools:   Array.isArray(schools) ? schools.length : null,
        });

        // Use resources data for recent resources table
        if (Array.isArray(resources?.data)) {
          const sorted = [...resources.data]
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5)
          setRecentResources(sorted);
        }
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoadingStats(false);
        setLoadingResources(false);
      }
    };

    fetchStats();
  }, []);

  // ---------- Toast ----------
  const [toast, setToast] = useState({ message: '', visible: false });
  const showToast = (message) => {
    setToast({ message, visible: true });
    setTimeout(() => setToast({ message: '', visible: false }), 3000);
  };

  const formatDate = (d) => {
    if (!d) return '—'
    return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  const statCards = [
    {
      label: 'Total Resources',
      value: loadingStats ? '...' : stats.totalResources ?? '—',
      icon: '📚', color: 'green',
      change: null,
    },
    {
      label: 'Registered Students',
      value: loadingStats ? '...' : stats.totalStudents ?? '—',
      icon: '🎓', color: 'blue',
      change: null,
    },
    {
      label: 'Active Teachers',
      value: loadingStats ? '...' : stats.activeTeachers ?? '—',
      icon: '👩‍🏫', color: 'orange',
      change: null,
    },
    {
      label: 'Schools Enrolled',
      value: loadingStats ? '...' : stats.totalSchools ?? '—',
      icon: '🏫', color: 'red',
      change: null,
    },
  ];

  const colorMap = {
    green:  { bar: 'bg-green-500',  text: 'text-green-500'  },
    blue:   { bar: 'bg-blue-500',   text: 'text-blue-500'   },
    orange: { bar: 'bg-orange-500', text: 'text-orange-500' },
    red:    { bar: 'bg-red-500',    text: 'text-red-500'    },
  };

  const StatusTag = ({ status }) => {
    const s = status?.toUpperCase()
    const styles = {
      PUBLISHED: 'bg-green-500/15 text-green-500',
      DRAFT:     'bg-red-500/15 text-red-500',
      PENDING:   'bg-orange-500/15 text-orange-500',
    }
    return (
      <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${styles[s] ?? 'bg-gray-500/15 text-gray-400'}`}>
        {status}
      </span>
    )
  }

  const TypeTag = ({ type }) => {
    const styles = {
      PDF:      'bg-blue-500/15 text-blue-500',
      VIDEO:    'bg-orange-500/15 text-orange-500',
      AUDIO:    'bg-green-500/15 text-green-500',
      IMAGE:    'bg-green-500/15 text-green-500',
      DOCUMENT: 'bg-blue-500/15 text-blue-500',
      OTHER:    'bg-gray-500/15 text-gray-400',
    }
    return (
      <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${styles[type] ?? 'bg-gray-500/15 text-gray-400'}`}>
        {type}
      </span>
    )
  }

  return (
    <div className="p-6 text-gray-200 bg-gray-900 min-h-screen">

      {/* Toast */}
      {toast.visible && (
        <div className="fixed bottom-4 right-4 z-50 bg-gray-800 border-l-4 border-green-500 rounded shadow-lg p-3 text-sm animate-fade-in-up">
          {toast.message}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map((stat, idx) => (
          <div key={idx} className="bg-gray-800 border border-gray-700 rounded-lg p-4 relative overflow-hidden hover:border-gray-500 transition">
            <div className={`absolute top-0 left-0 w-full h-1 ${colorMap[stat.color].bar}`} />
            <div className="absolute right-3 top-3 text-3xl opacity-20">{stat.icon}</div>
            <div className="text-xs text-gray-400 uppercase tracking-wider">{stat.label}</div>
            <div className={`text-2xl font-mono font-semibold mt-1 ${colorMap[stat.color].text}`}>
              {stat.value}
            </div>
            <div className="text-xs text-gray-500 mt-1">Live from database</div>
          </div>
        ))}
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

        {/* Downloads Chart — static */}
        <div className="lg:col-span-2 bg-gray-800 border border-gray-700 rounded-lg">
          <div className="flex justify-between items-center p-4 border-b border-gray-700">
            <h3 className="font-semibold">Resource Downloads by Subject</h3>
            <span className="text-xs text-gray-500">Static — endpoint pending</span>
          </div>
          <div className="p-4 space-y-3">
            {downloadsData.map((item, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <span className="w-20 text-sm text-gray-300">{item.subject}</span>
                <div className="flex-1 h-2 bg-gray-700 rounded overflow-hidden">
                  <div className={`h-full ${item.color} rounded`} style={{ width: `${item.percentage}%` }} />
                </div>
                <span className="font-mono text-xs text-gray-400 w-10 text-right">{item.downloads}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">

          {/* Activity Feed — static */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg">
            <div className="flex justify-between items-center p-4 border-b border-gray-700">
              <h3 className="font-semibold">Recent Activity</h3>
              <span className="text-xs text-gray-500">Static</span>
            </div>
            <div className="p-4 space-y-3">
              {activities.map((act, idx) => (
                <div key={idx} className="flex gap-3">
                  <div className={`w-2 h-2 mt-1 rounded-full ${act.dotColor} flex-shrink-0`} />
                  <div>
                    <div className="text-sm">{act.text}</div>
                    <div className="text-xs text-gray-500 font-mono mt-1">{act.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Storage — static */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg">
            <div className="flex justify-between items-center p-4 border-b border-gray-700">
              <h3 className="font-semibold">Storage Usage</h3>
              <span className="text-xs text-gray-500">Static</span>
            </div>
            <div className="p-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">Used</span>
                <span className="font-mono">{storage.used} / {storage.total}</span>
              </div>
              <div className="h-2 bg-gray-700 rounded overflow-hidden">
                <div className="h-full bg-orange-500 rounded" style={{ width: `${storage.percentage}%` }} />
              </div>
              <div className="mt-4 space-y-2">
                {storage.breakdown.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="text-gray-400">{item.label}</span>
                    <span className={`font-mono ${item.color}`}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Resources Table */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-x-auto">
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h3 className="font-semibold">Recently Added Resources</h3>
          <button onClick={() => navigate('/resources')} className="text-xs text-blue-400 hover:underline">
            View All →
          </button>
        </div>

        {loadingResources ? (
          <div className="p-6 text-center text-sm text-gray-500">Loading resources...</div>
        ) : recentResources.length === 0 ? (
          <div className="p-6 text-center text-sm text-gray-500">No resources found.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-xs text-gray-400 uppercase border-b border-gray-700">
              <tr>
                {['Title', 'Type', 'Visibility', 'Uploaded By', 'Date', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="text-left p-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentResources.map((r, idx) => (
                <tr key={idx} className="border-b border-gray-700 hover:bg-gray-700/30">
                  <td className="p-3 max-w-[180px] truncate">{r.title}</td>
                  <td className="p-3"><TypeTag type={r.type} /></td>
                  <td className="p-3 text-gray-400">{r.visibility}</td>
                  <td className="p-3 text-gray-400">
                    {r.uploader ? `${r.uploader.firstName} ${r.uploader.lastName}` : '—'}
                  </td>
                  <td className="p-3 text-gray-400">{formatDate(r.createdAt)}</td>
                  <td className="p-3"><StatusTag status={r.status} /></td>
                  <td className="p-3">
                    <button
                      onClick={() => showToast(`✏️ Editing "${r.title}"`)}
                      className="px-2 py-1 text-xs bg-gray-700 border border-gray-600 rounded hover:bg-gray-600 text-gray-200"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up { animation: fadeInUp 0.2s ease-out; }
      `}</style>
    </div>
  );
};

export default DashboardOverview;