/**
 * Module Node Component
 * Reusable component for displaying course modules in syllabus and course map
 */

import React from 'react';
import { Play, PlayCircle, FileText, Lock, CheckCircle2 } from 'lucide-react';

const typeIcons = {
  practice: { Icon: Play, color: 'text-purple-400' },
  article: { Icon: FileText, color: 'text-blue-400' },
  video: { Icon: PlayCircle, color: 'text-red-400' },
};

/**
 * ModuleNode component - represents a single module in the course
 * @param {Object} props
 * @param {Object} props.module - Module data
 * @param {string} props.status - 'locked', 'unlocked', 'current', 'completed'
 * @param {function} props.onSelect - Click handler
 * @param {string} props.variant - 'inline' (default) or 'compact'
 */
export const ModuleNode = ({
  module,
  status = 'unlocked',
  onSelect,
  variant = 'inline',
  index,
  ...props
}) => {
  const isLocked = status === 'locked';
  const isCompleted = status === 'completed';
  const isCurrent = status === 'current';

  const typeConfig = typeIcons[module.type] || typeIcons.practice;
  const { Icon, color } = typeConfig;

  if (variant === 'compact') {
    // Compact version for course map
    const statusRing = isCurrent
      ? 'ring-purple-500 ring-2'
      : isCompleted
      ? 'ring-emerald-500/50 ring-1'
      : 'ring-gray-700 ring-1';

    const titleColor = isLocked ? 'text-gray-600' : isCompleted ? 'text-gray-400' : 'text-white';

    return (
      <div className="flex items-center gap-6 relative">
        <div className="absolute top-14 left-7 h-full border-l-2 border-dashed border-gray-800"></div>

        <div
          className={`w-14 h-14 rounded-full flex-shrink-0 flex items-center justify-center bg-[#161b22] z-10 ${statusRing} transition-all duration-300 ${
            !isLocked && 'cursor-pointer hover:ring-purple-400'
          }`}
          onClick={() => !isLocked && onSelect?.(module.id)}
        >
          {isLocked ? (
            <Lock className="w-6 h-6 text-gray-600" />
          ) : isCompleted ? (
            <CheckCircle2 className="w-6 h-6 text-emerald-400" />
          ) : (
            <Icon className={`w-6 h-6 ${color}`} />
          )}
        </div>

        <div className={`transition-opacity duration-300 ${isLocked && 'opacity-50'}`}>
          <p className="text-xs text-purple-400 font-bold uppercase tracking-wider">{module.type}</p>
          <h3 className={`text-lg font-bold ${titleColor}`}>{module.title}</h3>
          <p className="text-sm text-gray-500">{module.description || module.readTime || module.duration}</p>
        </div>
      </div>
    );
  }

  // Inline version for syllabus
  return (
    <div
      onClick={() => !isLocked && onSelect?.()}
      className={`bg-[#0d1117] border border-gray-800 p-5 rounded-xl flex items-center justify-between transition-all ${
        isLocked ? 'opacity-50 cursor-not-allowed' : 'hover:border-purple-500/50 hover:bg-[#161b22] cursor-pointer group'
      }`}
      {...props}
    >
      <div className="flex items-center gap-5">
        <div>
          <h4 className={`text-lg font-bold ${isLocked ? 'text-gray-600' : isCompleted ? 'text-gray-400' : 'text-white'} group-hover:text-white transition-colors`}>
            {module.title}
          </h4>
          <span className="text-xs text-gray-600 font-mono uppercase bg-gray-900 px-2 py-0.5 rounded border border-gray-800 mt-1 inline-block">
            {module.type || 'Practice'}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {isCompleted ? (
          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
        ) : isLocked ? (
          <Lock className="w-5 h-5 text-gray-600" />
        ) : (
          <Icon className={`w-4 h-4 text-gray-600 group-hover:${color.replace('text-', 'group-hover:text-')} transition-colors`} />
        )}
      </div>
    </div>
  );
};

export default ModuleNode;
