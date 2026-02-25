import { Gem, LogOut, Crown } from 'lucide-react';
import { AdminDashboard } from '../AdminDashboard';

/**
 * Full-screen admin / mod panel overlay.
 * Props:
 *  - adminRole                      – 'admin' | 'mod'
 *  - onExit                         – callback to leave admin mode
 *  - onUpdatePublishedCourses       – handler for published-course edits
 *  - onPublishDraft / onUnpublishCourse – draft publish/unpublish handlers
 *  - customCourses                  – currently published custom courses
 */
export default function AdminPanel({
  adminRole,
  onExit,
  onUpdatePublishedCourses,
  onPublishDraft,
  onUnpublishCourse,
  customCourses,
}) {
  return (
    <div className="min-h-screen bg-[#0d1117] text-white">
      <div className="flex items-center justify-between h-16 border-b border-gray-800 px-6 bg-gradient-to-r from-amber-950/50 to-yellow-950/30">
        <div className="flex items-center gap-2 font-black text-xl">
          <Gem className="w-6 h-6 text-yellow-500" />
          <div className="flex items-center gap-2">
            <Crown className={`w-5 h-5 ${adminRole === 'admin' ? 'text-yellow-500' : 'text-purple-500'}`} />
            <span>{adminRole === 'admin' ? 'Admin Panel' : 'Mod Panel'}</span>
          </div>
        </div>
        <button
          onClick={onExit}
          className="px-4 py-2 bg-gray-800 hover:bg-red-900/50 rounded-lg font-bold transition-colors flex items-center gap-2 text-red-400 hover:text-red-300"
        >
          <LogOut className="w-4 h-4" />
          Exit Admin
        </button>
      </div>
      <AdminDashboard
        adminRole={adminRole}
        onUpdatePublishedCourses={onUpdatePublishedCourses}
        onPublishDraft={onPublishDraft}
        onUnpublishCourse={onUnpublishCourse}
        customCourses={customCourses}
      />
    </div>
  );
}
