import React from 'react';
import { FileText, Clock, ChevronRight } from 'lucide-react'; // <--- Added icons\

import NavigationControls from './NavControl.jsx'; // <--- Import the component!

/* ========================================================================
   COMPONENT: ARTICLE ESSAY
   (Handles the read-and-learn content)
   ======================================================================== */
export const ArticleEssay = ({ module, navProps }) => {
  return (
    <div className="flex-1 flex flex-col h-full bg-[#0d1117] overflow-y-auto">
      {/* Header */}
      <div className="h-16 border-b border-gray-800 flex items-center justify-between px-8 shrink-0 bg-[#0d1117]/95 backdrop-blur sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-200">Article</h2>
            <p className="text-xs text-gray-500">{module.readTime || '5 min'} read</p>
          </div>
        </div>
        <NavigationControls {...navProps} dark />
      </div>

      {/* Content */}
      <div className="flex-1 p-8 lg:p-12 w-full max-w-3xl mx-auto">
        <div className="mb-8 pb-8 border-b border-gray-800">
           <h1 className="text-4xl lg:text-5xl font-black text-white mb-6 tracking-tight">{module.title}</h1>
           <div className="flex items-center gap-4 text-sm text-gray-500 font-mono">
              <span className="flex items-center gap-2"><Clock className="w-4 h-4" /> {module.readTime}</span>
              <span>•</span>
              <span>By CodeQuarry</span>
           </div>
        </div>

        <article className="prose prose-invert prose-lg max-w-none prose-headings:font-bold prose-headings:text-white prose-p:text-gray-300 prose-a:text-blue-400 prose-code:text-purple-300 prose-code:bg-purple-900/20 prose-code:px-1 prose-code:rounded prose-pre:bg-gray-900 prose-pre:border prose-pre:border-gray-800">
           <div dangerouslySetInnerHTML={{ __html: module.content }} />
        </article>

        <div className="mt-12 pt-12 border-t border-gray-800 flex justify-between items-center">
           <p className="text-gray-500 italic">End of article</p>
           <button onClick={navProps.onNext} className="flex items-center gap-2 text-white hover:text-purple-400 font-bold transition-colors">
              Next Lesson <ChevronRight className="w-5 h-5" />
           </button>
        </div>
      </div>
    </div>
  );
};