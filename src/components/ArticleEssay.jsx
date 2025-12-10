import React from 'react';
import { FileText, Clock, ChevronLeft, CheckCircle2, Code2, Zap, AlertTriangle } from 'lucide-react';

import NavigationControls from './NavControl.jsx';
import { MarkdownRenderer } from './MarkdownRenderer';

/* ========================================================================
   COMPONENT: ARTICLE ESSAY
   (Handles the read-and-learn content)
   ======================================================================== */
export const ArticleEssay = ({ module, navProps, onMarkComplete, isCompleted }) => {
  return (
    <div className="flex-1 flex flex-col h-full bg-[#0d1117] overflow-y-auto">
      {/* Professional Header */}
      <div className="h-20 bg-gradient-to-r from-[#0d1117] via-purple-950/30 to-[#0d1117] backdrop-blur-md border-b border-purple-500/20 flex items-center justify-between px-8 shrink-0 shadow-lg shadow-black/50 sticky top-0 z-30">
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
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
              <FileText className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <div className="text-xs text-blue-400/80 font-semibold uppercase tracking-widest">Article</div>
              <div className="text-sm font-bold text-white">{module.title || 'Article Essay'}</div>
            </div>
          </div>
        </div>

        {/* Center: Module Info */}
        <div className="flex items-center gap-4 text-sm">
          {module.readTime && (
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 rounded-lg border border-gray-700/50">
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="font-bold text-cyan-400">{module.readTime} read</span>
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
           <MarkdownRenderer text={module.content} />
        </article>

        <div className="mt-12 pt-12 border-t border-gray-800 flex justify-between items-center">
           <p className="text-gray-500 italic">End of article</p>
           <button onClick={() => {
              if (!isCompleted) onMarkComplete();
              navProps.onNext();
           }} className="flex items-center gap-2 text-white hover:text-purple-400 font-bold transition-colors">
              Next Lesson <ChevronRight className="w-5 h-5" />
           </button>
        </div>
      </div>
    </div>
  );
};