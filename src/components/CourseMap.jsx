import React from 'react';
import { X, Pickaxe, ScrollText, PlayCircle, Lock, CheckCircle2, Circle } from 'lucide-react';

const typeIcons = {
  practice: Pickaxe,
  article: ScrollText,
  video: PlayCircle,
};

const NodeIcon = ({ type, status }) => {
  const Icon = typeIcons[type] || Circle;
  const commonClasses = "w-7 h-7";

  if (status === 'locked') return <Lock className={`${commonClasses} text-gray-600`} />;
  if (status === 'completed') return <CheckCircle2 className={`${commonClasses} text-emerald-400`} />;
  
  // Current or unlocked
  return <Icon className={`${commonClasses} text-purple-400`} />;
};

const Node = ({ module, status, onSelect }) => {
  const isLocked = status === 'locked';
  const isCompleted = status === 'completed';
  const isCurrent = status === 'current';

  const statusRing = isCurrent 
    ? 'ring-purple-500 ring-2' 
    : isCompleted 
    ? 'ring-emerald-500/50 ring-1' 
    : 'ring-gray-700 ring-1';

  const titleColor = isLocked 
    ? 'text-gray-600' 
    : isCompleted 
    ? 'text-gray-400' 
    : 'text-white';

  return (
    <div className="flex items-center gap-6 relative">
      {/* Dotted line connector */}
      <div className="absolute top-14 left-7 h-full border-l-2 border-dashed border-gray-800"></div>
      
      {/* Node Circle */}
      <div 
        className={`w-14 h-14 rounded-full flex-shrink-0 flex items-center justify-center bg-[#161b22] z-10 ${statusRing} transition-all duration-300 ${!isLocked && 'cursor-pointer hover:ring-purple-400'}`}
        onClick={() => !isLocked && onSelect(module.id)}
      >
        <NodeIcon type={module.type} status={status} />
      </div>

      {/* Node Info */}
      <div className={`transition-opacity duration-300 ${isLocked && 'opacity-50'}`}>
        <p className="text-xs text-purple-400 font-bold uppercase tracking-wider">{module.type}</p>
        <h3 className={`text-lg font-bold ${titleColor}`}>{module.title}</h3>
        <p className="text-sm text-gray-500">{module.description || module.readTime || module.duration}</p>
      </div>
    </div>
  );
};

export const CourseMap = ({ course, completedModules, currentModuleId, onSelectModule, onClose }) => {
  const completedSet = new Set(completedModules);
  let unlocked = true;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-lg flex items-center justify-center animate-in fade-in duration-300">
      <div className="relative w-full max-w-2xl h-[80vh] bg-[#0d1117] border border-gray-800 rounded-2xl shadow-2xl shadow-purple-900/20 flex flex-col overflow-hidden">
        {/* NEW: Glow for the map modal */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-purple-900/20 via-transparent to-transparent opacity-50 blur-2xl"></div>
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800 shrink-0">
          <div>
            <h2 className="text-2xl font-black text-white">{course.title}</h2>
            <p className="text-gray-400">{course.description}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full bg-gray-800/50 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Map Content */}
        <div className="flex-1 p-8 overflow-y-auto space-y-12 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-800 [&::-webkit-scrollbar-thumb]:rounded-full">
          {course.modules.map((module, index) => {
            const isCompleted = completedSet.has(module.id);
            
            // The first module is always unlocked. Subsequent modules are unlocked if the previous one is complete.
            const isUnlocked = index === 0 || completedSet.has(course.modules[index - 1].id);
            const isCurrent = module.id === currentModuleId;

            let status = 'locked';
            if (isUnlocked) {
              status = isCompleted ? 'completed' : 'unlocked';
            }
            if (isCurrent) {
              status = 'current';
            }

            return <Node key={module.id} module={module} status={status} onSelect={onSelectModule} />;
          })}
        </div>
      </div>
    </div>
  );
};

export default CourseMap;