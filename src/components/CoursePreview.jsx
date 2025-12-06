import React from 'react';
import { ChevronLeft, Download, Check } from 'lucide-react';

export const CoursePreview = ({ course, adminRole = 'mod', onBack, onExport, onPublish }) => {
  const isAdmin = adminRole === 'admin';
  return (
    <div className="min-h-screen bg-[#0d1117] text-white p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-3xl font-black">Preview Course</h1>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onExport}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-bold transition-colors"
          >
            <Download className="w-4 h-4" />
            Export JSON
          </button>
          {isAdmin && (
            <button
              onClick={onPublish}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg font-bold transition-colors"
            >
              <Check className="w-4 h-4" />
              Publish to Live
            </button>
          )}
        </div>
      </div>

      {/* Course Preview */}
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header Card */}
        <div className="bg-gradient-to-br from-purple-900/30 to-gray-900 border border-purple-500/30 rounded-xl p-8">
          <div className="flex items-start gap-6">
            {course.customIconUrl ? (
              <img src={course.customIconUrl} alt="course icon" className="w-24 h-24 rounded-lg border border-purple-500/30 object-cover" />
            ) : (
              <div className="text-6xl">{course.icon}</div>
            )}
            <div className="flex-1">
              <h2 className="text-4xl font-black mb-2">{course.title}</h2>
              <p className="text-gray-300 text-lg mb-4">{course.description}</p>
              <div className="flex gap-3 flex-wrap">
                <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                  course.level === 'Copper' ? 'bg-orange-600/20 text-orange-300' :
                  course.level === 'Silver' ? 'bg-slate-600/20 text-slate-300' :
                  course.level === 'Gold' ? 'bg-yellow-600/20 text-yellow-300' :
                  'bg-purple-600/20 text-purple-300'
                }`}>
                  {course.level === 'Copper' ? '🥉' : course.level === 'Silver' ? '⚪' : course.level === 'Gold' ? '🟡' : '💎'} {course.level}
                </span>
                <span className="px-3 py-1 bg-purple-600/20 text-purple-300 rounded-full text-sm font-bold">
                  {course.modules?.length || 0} Modules
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modules */}
        <div>
          <h3 className="text-2xl font-bold mb-4">Course Content</h3>
          <div className="space-y-3">
            {course.modules && course.modules.length > 0 ? (
              course.modules.map((module, idx) => (
                <div
                  key={module.id}
                  className="bg-gray-900/50 border border-gray-800 rounded-lg p-4 hover:border-purple-600/50 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-purple-600 text-white text-xs font-bold">
                          {idx + 1}
                        </span>
                        <h4 className="text-lg font-bold">{module.title}</h4>
                      </div>
                      <p className="text-sm text-gray-400 mt-1">
                        {module.type === 'practice' && `Practice • ${module.language}`}
                        {module.type === 'article' && 'Article'}
                        {module.type === 'video' && `Video • ${module.duration || 'N/A'}`}
                        {module.estimatedTime && ` • ⏱️ ${module.estimatedTime} min`}
                      </p>
                    </div>
                    <div className="flex gap-2 items-center">
                      {module.difficulty && (
                        <span className={`text-xs px-2 py-1 rounded font-bold ${
                          module.difficulty === 'easy' ? 'bg-green-900/30 text-green-400' :
                          module.difficulty === 'medium' ? 'bg-yellow-900/30 text-yellow-400' :
                          'bg-red-900/30 text-red-400'
                        }`}>
                          {module.difficulty === 'easy' ? '🟢 Easy' : module.difficulty === 'medium' ? '🟡 Medium' : '🔴 Hard'}
                        </span>
                      )}
                      <span className="text-xs px-2 py-1 bg-gray-800 text-gray-300 rounded">
                        {module.type}
                      </span>
                    </div>
                  </div>

                  {/* Module Details Preview */}
                  {module.type === 'practice' && (
                    <div className="mt-3 pt-3 border-t border-gray-700 space-y-2 text-sm">
                      <div>
                        <span className="text-gray-500">Expected Output:</span>
                        <span className="text-gray-300 ml-2 font-mono">{module.expectedOutput}</span>
                      </div>
                      {module.hints && module.hints.length > 0 && (
                        <div>
                          <span className="text-gray-500">{module.hints.length} hints + solution available</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                No modules in this course yet
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
            <p className="text-gray-400 text-sm">Modules</p>
            <p className="text-3xl font-bold text-purple-400">{course.modules?.length || 0}</p>
          </div>
          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
            <p className="text-gray-400 text-sm">Practice Modules</p>
            <p className="text-3xl font-bold text-blue-400">
              {course.modules?.filter(m => m.type === 'practice').length || 0}
            </p>
          </div>
          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
            <p className="text-gray-400 text-sm">Videos & Articles</p>
            <p className="text-3xl font-bold text-green-400">
              {course.modules?.filter(m => m.type !== 'practice').length || 0}
            </p>
          </div>
        </div>

        {/* JSON Preview */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
          <h4 className="font-bold mb-3 text-purple-400">Raw JSON (for review)</h4>
          <pre className="bg-black/50 p-4 rounded overflow-x-auto text-xs text-gray-400 max-h-60">
            {JSON.stringify(course, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};
