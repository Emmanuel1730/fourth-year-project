import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';

// ─── tiny helpers ──────────────────────────────────────────────────────────────
const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

const formatBytes = (bytes = 0) => {
  if (bytes >= 1e9) return `${(bytes / 1e9).toFixed(1)} GB`;
  if (bytes >= 1e6) return `${(bytes / 1e6).toFixed(1)} MB`;
  if (bytes >= 1e3) return `${(bytes / 1e3).toFixed(1)} KB`;
  return `${bytes} B`;
};

const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins  < 1)  return 'just now';
  if (mins  < 60) return `${mins} min ago`;
  if (hours < 24) return `${hours} hr ago`;
  return `${days} day${days > 1 ? 's' : ''} ago`;
};

const fmtDownloads = (n) => (n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n));

const SUBJECT_COLORS = [
  'bg-blue-500', 'bg-orange-500', 'bg-green-500',
  'bg-purple-500', 'bg-red-500', 'bg-yellow-500', 'bg-pink-500',
];

// ─── status / type tags ────────────────────────────────────────────────────────
const StatusTag = ({ status }) => {
  const s = status?.toUpperCase();
  const styles = {
    PUBLISHED: 'bg-green-500/15 text-green-500',
    DRAFT:     'bg-red-500/15 text-red-500',
    PENDING:   'bg-orange-500/15 text-orange-500',
  };
  return (
    <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${styles[s] ?? 'bg-gray-500/15 text-gray-400'}`}>
      {status}
    </span>
  );
};

const TypeTag = ({ type }) => {
  const styles = {
    PDF:      'bg-blue-500/15 text-blue-500',
    VIDEO:    'bg-orange-500/15 text-orange-500',
    AUDIO:    'bg-green-500/15 text-green-500',
    IMAGE:    'bg-green-500/15 text-green-500',
    DOCUMENT: 'bg-blue-500/15 text-blue-500',
    OTHER:    'bg-gray-500/15 text-gray-400',
  };
  return (
    <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${styles[type] ?? 'bg-gray-500/15 text-gray-400'}`}>
      {type}
    </span>
  );
};

// ─── activity dot colour by event kind ─────────────────────────────────────────
const activityDotColor = (type) => {
  if (!type) return 'bg-gray-400';
  const t = type.toLowerCase();
  if (t.includes('upload') || t.includes('create')) return 'bg-green-500';
  if (t.includes('enroll') || t.includes('register')) return 'bg-blue-500';
  if (t.includes('quiz')   || t.includes('activate')) return 'bg-orange-500';
  if (t.includes('report') || t.includes('error'))    return 'bg-red-500';
  return 'bg-gray-400';
};

// ─── derive downloads-by-subject from resources list ──────────────────────────
const deriveDownloadsBySubject = (resources = []) => {
  const counts = {};
  resources.forEach((r) => {
    const subject = r.category?.name || r.subject || 'Other';
    const dlCount = r.downloadCount ?? r.downloads ?? 0;
    counts[subject] = (counts[subject] || 0) + dlCount;
  });

  const entries = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 7);

  if (entries.length === 0) return [];

  const max = entries[0][1] || 1;

  return entries.map(([subject, downloads], idx) => ({
    subject,
    downloads: fmtDownloads(downloads),
    rawDownloads: downloads,
    percentage: Math.round((downloads / max) * 100),
    color: SUBJECT_COLORS[idx % SUBJECT_COLORS.length],
  }));
};

// ─── derive storage breakdown from resources list ─────────────────────────────
const STORAGE_LIMIT_BYTES = 10 * 1e9; // 10 GB assumed limit

const deriveStorage = (resources = []) => {
  const typeBytes = {};
  let total = 0;

  resources.forEach((r) => {
    const type = r.type?.toUpperCase() ?? 'OTHER';
    const bytes =
      r.fileSize       ??
      r.fileSizeBytes  ??
      r.size           ??
      r.sizeInBytes    ??
      r.contentLength  ??
      r.file_size      ??
      0;
    typeBytes[type] = (typeBytes[type] || 0) + bytes;
    total += bytes;
  });

  if (total === 0 && resources.length > 0) {
    console.warn(
      '[Dashboard] Storage reads 0B. Your /resources API response does not include a file size field.\n' +
      'Available fields on first resource:', Object.keys(resources[0] ?? {}).join(', ') + '\n' +
      'Fix: add fileSize (bytes) to your resource select/serialiser, or add a GET /storage endpoint.'
    );
  }

  const grouped = {
    PDFs:   (typeBytes['PDF'] ?? 0) + (typeBytes['DOCUMENT'] ?? 0),
    Videos: typeBytes['VIDEO'] ?? 0,
    Images: typeBytes['IMAGE'] ?? 0,
    Audio:  typeBytes['AUDIO'] ?? 0,
    Other:  typeBytes['OTHER'] ?? 0,
  };

  const breakdown = Object.entries(grouped)
    .filter(([, v]) => v > 0)
    .map(([label, bytes], idx) => ({
      label,
      value:    formatBytes(bytes),
      rawBytes: bytes,
      color: ['text-blue-400', 'text-orange-400', 'text-green-400', 'text-purple-400', 'text-gray-400'][idx],
    }));

  const percentage = total > 0 ? Math.min(Math.round((total / STORAGE_LIMIT_BYTES) * 100), 100) : 0;

  return {
    used:       formatBytes(total),
    total:      formatBytes(STORAGE_LIMIT_BYTES),
    percentage,
    breakdown,
    rawBytes:   total,
    noSizeData: total === 0 && resources.length > 0,
  };
};

// ─── derive recent activity from resources + profiles data ────────────────────
const deriveActivities = (resources = [], profiles = []) => {
  const events = [];

  const recent = [...resources]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 3);

  recent.forEach((r) => {
    const who = r.uploader
      ? `${r.uploader.firstName} ${r.uploader.lastName}`
      : 'Unknown';
    events.push({
      text:     `${r.title} uploaded by ${who}`,
      time:     timeAgo(r.createdAt),
      dotColor: 'bg-green-500',
      ts:       new Date(r.createdAt).getTime(),
    });
  });

  const newProfiles = [...profiles]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 2);

  newProfiles.forEach((p) => {
    const role  = p.role ? ` (${p.role})` : '';
    const name  = `${p.firstName ?? ''} ${p.lastName ?? ''}`.trim() || 'New user';
    events.push({
      text:     `${name}${role} joined the platform`,
      time:     timeAgo(p.createdAt),
      dotColor: 'bg-blue-500',
      ts:       new Date(p.createdAt).getTime(),
    });
  });

  return events
    .sort((a, b) => b.ts - a.ts)
    .slice(0, 5);
};

// ══════════════════════════════════════════════════════════════════════════════
const DashboardOverview = ({ isDarkMode }) => {
  const navigate = useNavigate();

  // ── state ──────────────────────────────────────────────────────────────────
  const [stats, setStats] = useState({
    totalResources: null,
    totalStudents:  null,
    activeTeachers: null,
    totalSchools:   null,
  });

  const [recentResources, setRecentResources] = useState([]);
  const [downloadsData,   setDownloadsData]   = useState([]);
  const [activities,      setActivities]      = useState([]);
  const [storage,         setStorage]         = useState(null);

  const [loadingStats,     setLoadingStats]     = useState(true);
  const [loadingResources, setLoadingResources] = useState(true);
  const [loadingActivity,  setLoadingActivity]  = useState(true);
  const [loadingStorage,   setLoadingStorage]   = useState(true);
  const [loadingDownloads, setLoadingDownloads] = useState(true);

  const [toast, setToast] = useState({ message: '', visible: false });

  const theme = isDarkMode
    ? {
        root:          'text-gray-200 bg-gray-900',
        card:          'bg-gray-800 border border-gray-700',
        sectionBorder: 'border-gray-700',
        mutedText:     'text-gray-400',
        secondaryText: 'text-gray-300',
        rowHover:      'hover:bg-gray-700/30',
        toast:         'fixed bottom-4 right-4 z-50 bg-gray-800 border-l-4 border-green-500 rounded shadow-lg p-3 text-sm animate-fade-in-up',
      }
    : {
        root:          'text-slate-900 bg-slate-100',
        card:          'bg-white border border-slate-200',
        sectionBorder: 'border-slate-200',
        mutedText:     'text-slate-500',
        secondaryText: 'text-slate-600',
        rowHover:      'hover:bg-slate-100',
        toast:         'fixed bottom-4 right-4 z-50 bg-white border-l-4 border-green-500 rounded shadow-lg p-3 text-sm animate-fade-in-up',
      };

  // ── toast helper ───────────────────────────────────────────────────────────
  const showToast = useCallback((message) => {
    setToast({ message, visible: true });
    setTimeout(() => setToast({ message: '', visible: false }), 3000);
  }, []);

  // ── main fetch ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [profilesRes, resourcesRes, schoolsRes] = await Promise.all([
          api.get('/profiles').catch(() => ({ data: [] })),
          api.get('/resources').catch(() => ({ data: {} })),
          api.get('/school').catch(() => ({ data: [] })),
        ]);

        const profiles     = profilesRes.data;
        const resources    = resourcesRes.data;
        const schools      = schoolsRes.data;
        const resourceList = Array.isArray(resources?.data) ? resources.data : [];
        const profileList  = Array.isArray(profiles)        ? profiles       : [];

        setStats({
          totalResources: resources?.total ?? resourceList.length ?? null,
          totalStudents:  profileList.filter((p) => p.role === 'STUDENT').length  || null,
          activeTeachers: profileList.filter((p) => p.role === 'TEACHER' && p.isActive).length || null,
          totalSchools:   Array.isArray(schools) ? schools.length : null,
        });
        setLoadingStats(false);

        const sorted = [...resourceList]
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5);
        setRecentResources(sorted);
        setLoadingResources(false);

        setDownloadsData(deriveDownloadsBySubject(resourceList));
        setLoadingDownloads(false);

        let activitiesFromAPI = null;
        try {
          const { data: actData } = await api.get('/activity');
          const raw = Array.isArray(actData) ? actData : (Array.isArray(actData?.data) ? actData.data : null);
          if (raw && raw.length > 0) {
            activitiesFromAPI = raw.slice(0, 5).map((a) => ({
              text:     a.description ?? a.message ?? a.text ?? 'Activity recorded',
              time:     a.createdAt ? timeAgo(a.createdAt) : (a.time ?? ''),
              dotColor: activityDotColor(a.type ?? a.action ?? ''),
            }));
          }
        } catch (_) { /* endpoint may not exist */ }

        setActivities(activitiesFromAPI ?? deriveActivities(resourceList, profileList));
        setLoadingActivity(false);

        let storageFromAPI = null;
        try {
          const { data: stData } = await api.get('/storage');
          if (stData?.usedBytes !== undefined) {
            storageFromAPI = {
              used:       formatBytes(stData.usedBytes),
              total:      formatBytes(stData.totalBytes ?? STORAGE_LIMIT_BYTES),
              percentage: Math.min(
                Math.round((stData.usedBytes / (stData.totalBytes ?? STORAGE_LIMIT_BYTES)) * 100),
                100,
              ),
              breakdown: Array.isArray(stData.breakdown)
                ? stData.breakdown.map((b, idx) => ({
                    label: b.label,
                    value: formatBytes(b.bytes ?? 0),
                    color: ['text-blue-400','text-orange-400','text-green-400','text-purple-400','text-gray-400'][idx],
                  }))
                : [],
              noSizeData: false,
            };
          }
        } catch (_) { /* /storage endpoint not available */ }

        setStorage(storageFromAPI ?? deriveStorage(resourceList));
        setLoadingStorage(false);

      } catch (err) {
        console.error('Dashboard fetch error:', err);
        setLoadingStats(false);
        setLoadingResources(false);
        setLoadingDownloads(false);
        setLoadingActivity(false);
        setLoadingStorage(false);
      }
    };

    fetchAll();
  }, []);

  // ── stat cards config ──────────────────────────────────────────────────────
  const statCards = [
    { label: 'Total Resources',     value: loadingStats ? '...' : stats.totalResources  ?? '—', icon: '📚', color: 'green'  },
    { label: 'Registered Students', value: loadingStats ? '...' : stats.totalStudents   ?? '—', icon: '🎓', color: 'blue'   },
    { label: 'Active Teachers',     value: loadingStats ? '...' : stats.activeTeachers  ?? '—', icon: '👩‍🏫', color: 'orange' },
    { label: 'Schools Enrolled',    value: loadingStats ? '...' : stats.totalSchools    ?? '—', icon: '🏫', color: 'red'    },
  ];

  const colorMap = {
    green:  { bar: 'bg-green-500',  text: 'text-green-500'  },
    blue:   { bar: 'bg-blue-500',   text: 'text-blue-500'   },
    orange: { bar: 'bg-orange-500', text: 'text-orange-500' },
    red:    { bar: 'bg-red-500',    text: 'text-red-500'    },
  };

  // ── render ─────────────────────────────────────────────────────────────────
  return (
    <div className={`p-6 min-h-screen ${theme.root}`}>

      {/* Toast Notification */}
      {toast.visible && (
        <div className={theme.toast}>
          {toast.message}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map((stat, idx) => (
          <div key={idx} className={`${theme.card} rounded-lg p-4 relative overflow-hidden transition`}>
            <div className={`absolute top-0 left-0 w-full h-1 ${colorMap[stat.color].bar}`} />
            <div className="absolute right-3 top-3 text-3xl opacity-20">{stat.icon}</div>
            <div className={`text-xs ${theme.mutedText} uppercase tracking-wider`}>{stat.label}</div>
            <div className={`text-2xl font-mono font-semibold mt-1 ${colorMap[stat.color].text}`}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

        {/* Left: Downloads Chart */}
        <div className={`${theme.card} rounded-lg lg:col-span-2`}>
          <div className={`flex justify-between items-center p-4 border-b ${theme.sectionBorder}`}>
            <h3 className="font-semibold">Resource Downloads by Subject</h3>
          </div>
          <div className="p-4 space-y-3">
            {loadingDownloads ? (
              <div className="animate-pulse space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-20 h-3 bg-gray-700 rounded" />
                    <div className="flex-1 h-2 bg-gray-700 rounded" />
                    <div className="w-10 h-3 bg-gray-700 rounded" />
                  </div>
                ))}
              </div>
            ) : downloadsData.length === 0 ? (
              <div className={`text-sm ${theme.mutedText} text-center py-4`}>No download data available.</div>
            ) : (
              downloadsData.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <span className={`w-20 text-sm ${theme.secondaryText} truncate`}>{item.subject}</span>
                  <div className="flex-1 h-2 bg-gray-700 rounded overflow-hidden">
                    <div
                      className={`h-full ${item.color} rounded transition-all duration-500`}
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                  <span className={`font-mono text-xs ${theme.mutedText} w-10 text-right`}>{item.downloads}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right column: Activity + Storage */}
        <div className="space-y-6">

          {/* Activity Feed */}
          <div className={`${theme.card} rounded-lg`}>
            <div className={`flex justify-between items-center p-4 border-b ${theme.sectionBorder}`}>
              <h3 className="font-semibold">Recent Activity</h3>
              <span className={`text-xs ${theme.mutedText}`}>
                {loadingActivity ? 'Loading…' : 'Live'}
              </span>
            </div>
            <div className="p-4 space-y-3">
              {loadingActivity ? (
                <div className="space-y-3 animate-pulse">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="w-2 h-2 mt-1 rounded-full bg-gray-700 flex-shrink-0" />
                      <div className="flex-1 space-y-1">
                        <div className="h-3 bg-gray-700 rounded w-4/5" />
                        <div className="h-2 bg-gray-700 rounded w-1/4" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : activities.length === 0 ? (
                <div className={`text-sm ${theme.mutedText} text-center py-2`}>No recent activity.</div>
              ) : (
                activities.map((act, idx) => (
                  <div key={idx} className="flex gap-3">
                    <div className={`w-2 h-2 mt-1 rounded-full ${act.dotColor} flex-shrink-0`} />
                    <div>
                      <div className="text-sm">{act.text}</div>
                      <div className={`text-xs ${theme.mutedText} font-mono mt-1`}>{act.time}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Storage Usage */}
          <div className={`${theme.card} rounded-lg`}>
            <div className={`flex justify-between items-center p-4 border-b ${theme.sectionBorder}`}>
              <h3 className="font-semibold">Storage Usage</h3>
              <span className={`text-xs ${theme.mutedText}`}>
                {loadingStorage ? 'Loading…' : 'Live'}
              </span>
            </div>
            <div className="p-4">
              {loadingStorage ? (
                <div className="animate-pulse space-y-3">
                  <div className="h-3 bg-gray-700 rounded w-3/4" />
                  <div className="h-2 bg-gray-700 rounded" />
                  <div className="space-y-2 mt-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="flex justify-between">
                        <div className="h-3 bg-gray-700 rounded w-1/4" />
                        <div className="h-3 bg-gray-700 rounded w-1/5" />
                      </div>
                    ))}
                  </div>
                </div>
              ) : !storage ? (
                <div className={`text-sm ${theme.mutedText} text-center py-2`}>No storage data available.</div>
              ) : storage.noSizeData ? (
                <div className="text-xs text-orange-400 bg-orange-500/10 border border-orange-500/20 rounded p-3 leading-relaxed">
                  <span className="font-semibold block mb-1">⚠️ File size not returned by API</span>
                  Your <code className="text-orange-300">/resources</code> response does not include a file size field.
                  Add <code className="text-orange-300">fileSize</code> to your resource serialiser, or create a{' '}
                  <code className="text-orange-300">GET /storage</code> endpoint.
                </div>
              ) : (
                <>
                  <div className="flex justify-between text-sm mb-1">
                    <span className={theme.mutedText}>Used</span>
                    <span className="font-mono">{storage.used} / {storage.total}</span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded overflow-hidden">
                    <div
                      className={`h-full rounded transition-all duration-500 ${
                        storage.percentage > 85 ? 'bg-red-500' :
                        storage.percentage > 60 ? 'bg-orange-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${storage.percentage}%` }}
                    />
                  </div>
                  {storage.breakdown.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {storage.breakdown.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span className={theme.mutedText}>{item.label}</span>
                          <span className={`font-mono ${item.color}`}>{item.value}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Recent Resources Table */}
      <div className={`${theme.card} rounded-lg overflow-x-auto`}>
        <div className={`flex justify-between items-center p-4 border-b ${theme.sectionBorder}`}>
          <h3 className="font-semibold">Recently Added Resources</h3>
          <button onClick={() => navigate('/resources')} className="text-xs text-blue-400 hover:underline">
            View All →
          </button>
        </div>
        <table className="w-full text-sm">
          <thead className={`text-xs ${theme.mutedText} uppercase border-b ${theme.sectionBorder}`}>
            <tr>
              <th className="text-left p-3">Title</th>
              <th className="text-left p-3">Subject</th>
              <th className="text-left p-3">Type</th>
              <th className="text-left p-3">Form</th>
              <th className="text-left p-3">Uploaded By</th>
              <th className="text-left p-3">Date</th>
              <th className="text-left p-3">Status</th>
              <th className="text-left p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loadingResources ? (
              <tr>
                <td colSpan={8} className={`p-4 text-center ${theme.mutedText}`}>Loading…</td>
              </tr>
            ) : recentResources.length === 0 ? (
              <tr>
                <td colSpan={8} className={`p-4 text-center ${theme.mutedText}`}>No resources found.</td>
              </tr>
            ) : (
              recentResources.map((resource, idx) => (
                <tr key={idx} className={`border-b ${theme.sectionBorder} ${theme.rowHover}`}>
                  <td className="p-3">{resource.title}</td>
                  <td className="p-3">{resource.category?.name ?? resource.subject ?? '—'}</td>
                  <td className="p-3"><TypeTag type={resource.type} /></td>
                  <td className="p-3">{resource.form ?? '—'}</td>
                  <td className="p-3">
                    {resource.uploader
                      ? `${resource.uploader.firstName} ${resource.uploader.lastName}`
                      : '—'}
                  </td>
                  <td className="p-3">{formatDate(resource.createdAt)}</td>
                  <td className="p-3"><StatusTag status={resource.status} /></td>
                  <td className="p-3">
                    <button
                      onClick={() => showToast(`✏️ Editing "${resource.title}"`)}
                      className={`px-2 py-1 text-xs rounded border ${
                        isDarkMode
                          ? 'bg-gray-700 border-gray-600 hover:bg-gray-600 text-gray-200'
                          : 'bg-slate-100 border-slate-300 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
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