// DashboardOverview.jsx
import React, { useState } from 'react';

const DashboardOverview = () => {
  // ---------- Dummy Data for dashboard, it will be replaced with actual data from backend ----------
  const [stats] = useState([
    { label: 'Total Resources', value: '1,284', change: '+34', changeLabel: 'added this month', icon: '📚', color: 'green' },
    { label: 'Registered Students', value: '8,431', change: '+312', changeLabel: 'new this month', icon: '🎓', color: 'blue' },
    { label: 'Active Teachers', value: '673', change: '+21', changeLabel: 'new this month', icon: '👩‍🏫', color: 'orange' },
    { label: 'Schools Enrolled', value: '148', change: '+6', changeLabel: 'added this month', icon: '🏫', color: 'red' },
  ]);

  const [downloadsData] = useState([
    { subject: 'Mathematics', downloads: '3.2k', percentage: 88, color: 'bg-blue-500' },
    { subject: 'English', downloads: '2.7k', percentage: 74, color: 'bg-green-500' },
    { subject: 'Biology', downloads: '2.3k', percentage: 62, color: 'bg-orange-500' },
    { subject: 'Chemistry', downloads: '1.9k', percentage: 54, color: 'bg-blue-500' },
    { subject: 'History', downloads: '1.5k', percentage: 41, color: 'bg-green-500' },
    { subject: 'Physics', downloads: '1.3k', percentage: 36, color: 'bg-orange-500' },
    { subject: 'Geography', downloads: '1.1k', percentage: 29, color: 'bg-red-500' },
  ]);

  const [activities] = useState([
    { text: 'Form 4 Chemistry Notes uploaded by T. Banda', time: '5 min ago', dotColor: 'bg-green-500' },
    { text: 'Kamuzu Academy enrolled on the platform', time: '1 hr ago', dotColor: 'bg-blue-500' },
    { text: 'Quiz — MSCE Past Paper 2023 activated', time: '2 hrs ago', dotColor: 'bg-orange-500' },
    { text: 'User Grace Phiri reported a broken link', time: '3 hrs ago', dotColor: 'bg-red-500' },
  ]);

  const [storage] = useState({
    used: '7.8 GB',
    total: '10 GB',
    percentage: 78,
    breakdown: [
      { label: 'PDFs', value: '4.2 GB', color: 'text-blue-400' },
      { label: 'Videos', value: '2.8 GB', color: 'text-orange-400' },
      { label: 'Images', value: '0.8 GB', color: 'text-green-400' },
    ],
  });

  const [recentResources] = useState([
    {
      title: 'MSCE Chemistry Past Paper 2023',
      subject: 'Chemistry',
      type: 'PDF',
      typeColor: 'blue',
      form: 'Form 4',
      uploadedBy: 'Admin',
      date: 'Mar 12, 2026',
      status: 'Published',
      statusColor: 'green',
    },
    {
      title: 'English Grammar Guide',
      subject: 'English',
      type: 'PDF',
      typeColor: 'blue',
      form: 'Form 2',
      uploadedBy: 'T. Phiri',
      date: 'Mar 10, 2026',
      status: 'Pending',
      statusColor: 'orange',
    },
    {
      title: 'Biology Cell Division Notes',
      subject: 'Biology',
      type: 'DOC',
      typeColor: 'green',
      form: 'Form 3',
      uploadedBy: 'F. Ngwira',
      date: 'Mar 9, 2026',
      status: 'Published',
      statusColor: 'green',
    },
    {
      title: 'Mathematics Revision Quiz',
      subject: 'Mathematics',
      type: 'Quiz',
      typeColor: 'orange',
      form: 'Form 1',
      uploadedBy: 'Admin',
      date: 'Mar 8, 2026',
      status: 'Draft',
      statusColor: 'red',
    },
  ]);

  // ---------- Toast State ----------
  const [toast, setToast] = useState({ message: '', visible: false });

  const showToast = (message) => {
    setToast({ message, visible: true });
    setTimeout(() => setToast({ message: '', visible: false }), 3000);
  };

  // ---------- Action Handlers ----------
  const handleEdit = (title) => showToast(`✏️ Editing "${title}"`);
  const handleApprove = (title) => showToast(`✅ "${title}" approved`);
  const handlePublish = (title) => showToast(`🚀 "${title}" published`);
  const handleViewAll = (section) => showToast(`🔍 Navigate to ${section} (full integration)`);
  const handleGenerateReport = (reportName) => showToast(`📊 Generating ${reportName}...`);

  // ---------- Helper: Status Tag Component ----------
  const StatusTag = ({ status, color }) => {
    const colorClasses = {
      green: 'bg-green-500/15 text-green-500',
      blue: 'bg-blue-500/15 text-blue-500',
      orange: 'bg-orange-500/15 text-orange-500',
      red: 'bg-red-500/15 text-red-500',
      gray: 'bg-gray-500/15 text-gray-400',
    };
    return (
      <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${colorClasses[color]}`}>
        {status}
      </span>
    );
  };

  const TypeTag = ({ type, color }) => {
    const colorClasses = {
      blue: 'bg-blue-500/15 text-blue-500',
      green: 'bg-green-500/15 text-green-500',
      orange: 'bg-orange-500/15 text-orange-500',
      red: 'bg-red-500/15 text-red-500',
    };
    return (
      <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${colorClasses[color]}`}>
        {type}
      </span>
    );
  };

  return (
    <div className="p-6 text-gray-200 bg-gray-900 min-h-screen">
      {/* Toast Notification */}
      {toast.visible && (
        <div className="fixed bottom-4 right-4 z-50 bg-gray-800 border-l-4 border-green-500 rounded shadow-lg p-3 text-sm animate-fade-in-up">
          {toast.message}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-gray-800 border border-gray-700 rounded-lg p-4 relative overflow-hidden hover:border-gray-500 transition">
            <div className={`absolute top-0 left-0 w-full h-1 ${stat.color === 'green' ? 'bg-green-500' : stat.color === 'blue' ? 'bg-blue-500' : stat.color === 'orange' ? 'bg-orange-500' : 'bg-red-500'}`} />
            <div className="absolute right-3 top-3 text-3xl opacity-20">{stat.icon}</div>
            <div className="text-xs text-gray-400 uppercase tracking-wider">{stat.label}</div>
            <div className={`text-2xl font-mono font-semibold mt-1 ${stat.color === 'green' ? 'text-green-500' : stat.color === 'blue' ? 'text-blue-500' : stat.color === 'orange' ? 'text-orange-500' : 'text-red-500'}`}>
              {stat.value}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              <span className="text-green-500">{stat.change}</span> {stat.changeLabel}
            </div>
          </div>
        ))}
      </div>

      {/* Two-column layout: Chart & Right column */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Left: Downloads Chart */}
        <div className="lg:col-span-2 bg-gray-800 border border-gray-700 rounded-lg">
          <div className="flex justify-between items-center p-4 border-b border-gray-700">
            <h3 className="font-semibold">Resource Downloads by Subject</h3>
             
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

        {/* Right column: Activity + Storage */}
        <div className="space-y-6">
          {/* Activity Feed */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg">
            <div className="p-4 border-b border-gray-700">
              <h3 className="font-semibold">Recent Activity</h3>
            </div>
            <div className="p-4 space-y-3">
              {activities.map((act, idx) => (
                <div key={idx} className="flex gap-3">
                  <div className={`w-2 h-2 mt-1 rounded-full ${act.dotColor} flex-shrink-0`} />
                  <div>
                    <div className="text-sm" dangerouslySetInnerHTML={{ __html: act.text }} />
                    <div className="text-xs text-gray-500 font-mono mt-1">{act.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Storage Usage */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg">
            <div className="p-4 border-b border-gray-700">
              <h3 className="font-semibold">Storage Usage</h3>
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
          <button
            onClick={() => handleViewAll('Resources')}
            className="text-xs text-blue-400 hover:underline"
          >
            View All →
          </button>
        </div>
        <table className="w-full text-sm">
          <thead className="text-xs text-gray-400 uppercase border-b border-gray-700">
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
            {recentResources.map((resource, idx) => (
              <tr key={idx} className="border-b border-gray-700 hover:bg-gray-700/30">
                <td className="p-3">{resource.title}</td>
                <td className="p-3">{resource.subject}</td>
                <td className="p-3">
                  <TypeTag type={resource.type} color={resource.typeColor} />
                </td>
                <td className="p-3">{resource.form}</td>
                <td className="p-3">{resource.uploadedBy}</td>
                <td className="p-3">{resource.date}</td>
                <td className="p-3">
                  <StatusTag status={resource.status} color={resource.statusColor} />
                </td>
                <td className="p-3">
                  {resource.status === 'Pending' ? (
                    <button
                      onClick={() => handleApprove(resource.title)}
                      className="px-2 py-1 text-xs bg-gray-700 border border-gray-600 rounded hover:bg-gray-600 text-gray-200"
                    >
                      Approve
                    </button>
                  ) : resource.status === 'Draft' ? (
                    <button
                      onClick={() => handlePublish(resource.title)}
                      className="px-2 py-1 text-xs bg-gray-700 border border-gray-600 rounded hover:bg-gray-600 text-gray-200"
                    >
                      Publish
                    </button>
                  ) : (
                    <button
                      onClick={() => handleEdit(resource.title)}
                      className="px-2 py-1 text-xs bg-gray-700 border border-gray-600 rounded hover:bg-gray-600 text-gray-200"
                    >
                      Edit
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/*    Tailwind custom animation for toast */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

export default DashboardOverview;