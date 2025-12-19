import React from 'react';
import { PlayCircle, ChevronLeft, CheckCircle2, Code2, Loader2, RefreshCw, Zap, AlertTriangle } from 'lucide-react';

import NavigationControls from './NavControl.jsx'; // <--- Import the component!
import ThemedSurface from './ThemedSurface.jsx';

/* ========================================================================
   COMPONENT: VIDEO ESSAY
   (Handles the watch-and-learn content)
   ======================================================================== */
export const VideoEssay = ({ module, navProps, onMarkComplete, isCompleted }) => {
  return (
    <ThemedSurface className="flex-1 flex flex-col h-full overflow-y-auto">
      {/* Professional Header */}
      <div className="h-20 bg-gradient-to-r from-[#0d1117] via-purple-950/30 to-[#0d1117] backdrop-blur-md border-b border-purple-500/20 flex items-center justify-between px-8 shrink-0 shadow-lg shadow-black/50">
        {/* Left: Back button and breadcrumb */}
        <div className="flex items-center gap-4 flex-1">
          <button 
            onClick={() => navProps.goBack?.()} 
            className="p-2.5 text-gray-400 hover:text-white hover:bg-purple-900/30 rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/20 group" 
            title="Back to Course (Esc)"
            aria-label="Go back to course"
          >
            <ChevronLeft className="w-5 h-5 group-hover:scale-110 transition-transform" />
          </button>
          
          {/* Breadcrumb */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white shadow-lg shadow-red-500/30">
              <PlayCircle className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <div className="text-xs text-red-400/80 font-semibold uppercase tracking-widest">Video</div>
              <div className="text-sm font-bold text-white">{module.title || 'Video Essay'}</div>
            </div>
          </div>
        </div>

        {/* Center: Module Info */}
        <div className="flex items-center gap-4 text-sm">
          {module.duration && (
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 rounded-lg border border-gray-700/50">
              <span className="text-gray-400">Duration:</span>
              <span className="font-bold text-cyan-400">{module.duration}</span>
            </div>
          )}
          
          {module.difficulty && (
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border font-bold text-xs uppercase tracking-wider ${
              module.difficulty === 'easy' ? 'bg-green-900/30 text-green-400 border-green-600/50' :
              module.difficulty === 'medium' ? 'bg-yellow-900/30 text-yellow-400 border-yellow-600/50' :
              'bg-red-900/30 text-red-400 border-red-600/50'
            }`}>
              {module.difficulty === 'easy' ? <Zap className="w-4 h-4" /> : module.difficulty === 'medium' ? <AlertTriangle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
              {module.difficulty.charAt(0).toUpperCase() + module.difficulty.slice(1)}
            </div>
          )}
        </div>

        {/* Right: Status and Navigation */}
        <div className="flex items-center gap-3 flex-1 justify-end">
          {isCompleted && (
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 bg-emerald-900/30 px-4 py-2 rounded-lg border border-emerald-600/50 animate-pulse">
              <CheckCircle2 className="w-4 h-4" /> Completed
            </div>
          )}
          <NavigationControls {...navProps} dark />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-start p-8 lg:p-12 max-w-5xl mx-auto w-full">
        <div className="w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-gray-800 ring-1 ring-white/10 relative group">
           <video 
             className="w-full h-full object-cover" 
             controls 
             poster="https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=2070&auto=format&fit=crop"
             src={module.videoUrl} 
           >
             Your browser does not support the video tag.
           </video>
        </div>
        
        <div className="w-full mt-8">
           <h1 className="text-3xl font-black text-white mb-4">{module.title}</h1>
           <p className="text-gray-400 text-lg leading-relaxed max-w-3xl">
             {module.description || "Watch the video to understand the core concepts before diving into the code."}
           </p>
           
           <div className="mt-8 flex gap-4">
             <button onClick={() => {
                if (!isCompleted) onMarkComplete();
                navProps.onNext();
             }} className="px-6 py-3 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition-colors">
               Mark as Watched
             </button>
           </div>
        </div>
      </div>
    </ThemedSurface>
  );
};
