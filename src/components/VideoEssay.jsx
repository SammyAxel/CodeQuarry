import React from 'react';
import { PlayCircle, CheckCircle2 } from 'lucide-react'; // <--- Added icons

import NavigationControls from './NavControl.jsx'; // <--- Import the component!

/* ========================================================================
   COMPONENT: VIDEO ESSAY
   (Handles the watch-and-learn content)
   ======================================================================== */
export const VideoEssay = ({ module, navProps, onMarkComplete, isCompleted }) => {
  return (
    <div className="flex-1 flex flex-col h-full bg-[#050505] overflow-y-auto">
      {/* Header */}
      <div className="h-16 border-b border-gray-800 flex items-center justify-between px-8 shrink-0 bg-[#0a0a0a]">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-500/10 rounded-lg text-red-500">
            <PlayCircle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-200">Video Essay</h2>
            <p className="text-xs text-gray-500">{module.title}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {isCompleted && (
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 bg-emerald-900/50 px-3 py-1.5 rounded-full"><CheckCircle2 className="w-4 h-4" /> Completed</div>
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
    </div>
  );
};