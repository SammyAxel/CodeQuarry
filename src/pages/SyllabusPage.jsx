import React from 'react';
import { ArrowLeft, Play, PlayCircle, FileText, TrainTrack, Lock, CheckCircle2 } from 'lucide-react';

export const SyllabusPage = ({ course, onBack, onSelectModule, completedModules }) => {
  const completedSet = new Set(completedModules);
  const completedCount = completedSet.size;
  const totalModules = course.modules.length;
  const percentage = totalModules > 0 ? Math.round((completedCount / totalModules) * 100) : 0;

  return (
    <div className="max-w-4xl mx-auto p-6 animate-in fade-in slide-in-from-right-8 duration-300">
      <button onClick={onBack} className="flex items-center text-gray-400 hover:text-white mb-8 transition-colors group"><TrainTrack className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Quarry</button>
      <div className="bg-[#161b22] border border-gray-800 rounded-3xl p-8 mb-8 relative overflow-hidden">
        {/* ENHANCED: Larger, more central glow for the card */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-purple-900/30 via-transparent to-transparent opacity-50 blur-2xl"></div>
        <div className="flex items-center gap-6 mb-4 relative z-10">
          <div className="p-4 bg-gray-900/50 rounded-2xl border border-gray-800">{course.icon}</div>
          <div><h2 className="text-4xl font-black text-white tracking-tight">{course.title}</h2><p className="text-purple-400 font-mono text-sm mt-1">ID: {course.id.toUpperCase()}</p></div>
        </div>
        <p className="text-gray-300 text-lg relative z-10 max-w-2xl">{course.description}</p>

        {/* NEW: Progress Bar */}
        <div className="mt-6 relative z-10">
            <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-bold text-purple-300">Progress</span>
                <span className="text-sm font-bold text-purple-300">{percentage}%</span>
            </div>
            <div className="w-full bg-gray-900 rounded-full h-2.5 border border-gray-700">
                <div className="bg-purple-600 h-full rounded-full transition-all duration-500" style={{width: `${percentage}%`}}></div>
            </div>
        </div>
      </div>
      <div className="space-y-4">
        {course.modules.map((module, idx, arr) => {
          // A module is unlocked if it's the first one or if the previous one is complete.
          const isUnlocked = idx === 0 || completedSet.has(arr[idx - 1].id);
          const isCompleted = completedSet.has(module.id);
          const isLocked = !isUnlocked;

          // The current module is the first one that is unlocked but not yet completed.
          const isCurrent = isUnlocked && !isCompleted;
          const statusRing = isLocked ? 'border-gray-700' : isCompleted ? 'border-emerald-700' : 'border-purple-700';
          const statusText = isLocked ? 'text-gray-600' : isCompleted ? 'text-gray-400' : 'text-white';
          const nodeBg = isLocked ? 'bg-gray-900/50' : isCompleted ? 'bg-emerald-900/30' : 'bg-purple-900/30';

          return (
            <div key={module.id} className="relative pl-16">
              {idx < arr.length - 1 && <div className="absolute top-7 left-[29px] h-full w-px bg-gray-800" style={{backgroundImage: 'linear-gradient(to bottom, #4a044e 2px, transparent 2px)', backgroundSize: '1px 10px'}}></div>}
              <div className={`absolute top-0 left-0 w-14 h-14 rounded-full ${nodeBg} border-2 ${statusRing} flex items-center justify-center text-purple-400 font-mono text-lg font-bold z-10 shadow-inner shadow-black/50`}>
                {isCompleted ? <CheckCircle2 className="w-6 h-6 text-emerald-500" /> : isLocked ? <Lock className="w-6 h-6 text-gray-600" /> : idx + 1}
              </div>
              <div onClick={() => !isLocked && onSelectModule(module)} className={`bg-[#0d1117] border border-gray-800 p-5 rounded-xl flex items-center justify-between transition-all ml-4 ${isLocked ? 'opacity-50 cursor-not-allowed' : 'hover:border-purple-500/50 hover:bg-[#161b22] cursor-pointer group'}`}>
              <div className="flex items-center gap-5">
                <div>
                  <h4 className={`text-lg font-bold ${statusText} group-hover:text-white transition-colors`}>{module.title}</h4>
                  <span className="text-xs text-gray-600 font-mono uppercase bg-gray-900 px-2 py-0.5 rounded border border-gray-800 mt-1 inline-block">{module.type || 'Practice'}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                 {(!module.type || module.type === 'practice') && <Play className="w-4 h-4 text-gray-600 group-hover:text-purple-400 transition-colors fill-current" />}
                 {module.type === 'video' && <PlayCircle className="w-4 h-4 text-gray-600 group-hover:text-red-400 transition-colors" />}
                 {module.type === 'article' && <FileText className="w-4 h-4 text-gray-600 group-hover:text-blue-400 transition-colors" />}
              </div>
            </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};