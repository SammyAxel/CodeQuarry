import React, { useState, useEffect } from 'react';
import { 
  Terminal, Play, BookOpen, ChevronRight, ChevronLeft,
  Code2, Cpu, ArrowLeft, RotateCcw, Zap, PanelLeftClose, 
  PanelLeftOpen, Trophy, Map as MapIcon, FileCode, AlertCircle, 
  X, PlayCircle, FileText, Clock
} from 'lucide-react';

import { COURSES } from './data/courses';
import { VideoEssay } from './components/video-essay';
import { ArticleEssay } from './components/article-essay';
import { PracticeMode } from './components/practice';

/* ========================================================================
   MAIN COMPONENT: APP ROUTER
   (Clean, focused on state routing)
   ======================================================================== */
export default function App() {
  const [view, setView] = useState('home'); 
  const [activeCourse, setActiveCourse] = useState(null);
  const [activeModule, setActiveModule] = useState(null);
  const [isMapOpen, setIsMapOpen] = useState(false);

  // ... existing navigation logic (navigateToSyllabus, navigateToLearning, etc) ...
  const navigateToSyllabus = (course) => {
    setActiveCourse(course);
    setView('syllabus');
  };

  const navigateToLearning = (module) => {
    setActiveModule(module);
    setIsMapOpen(false);
    setView('learning');
  };

  const handleNextLesson = () => {
    if (!activeCourse || !activeModule) return;
    const currentIndex = activeCourse.modules.findIndex(m => m.id === activeModule.id);
    if (currentIndex !== -1 && currentIndex < activeCourse.modules.length - 1) {
      navigateToLearning(activeCourse.modules[currentIndex + 1]);
    } else {
      setView('syllabus');
    }
  };

  const handlePrevLesson = () => {
    if (!activeCourse || !activeModule) return;
    const currentIndex = activeCourse.modules.findIndex(m => m.id === activeModule.id);
    if (currentIndex > 0) {
      navigateToLearning(activeCourse.modules[currentIndex - 1]);
    }
  };

  const goBack = () => {
    if (view === 'learning') setView('syllabus');
    else if (view === 'syllabus') setView('home');
  };

  // --- RENDERERS ---
  const renderHome = () => (
    <div className="max-w-6xl mx-auto p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-12 text-center pt-10">
        <h1 className="text-6xl font-black mb-4 bg-gradient-to-r from-purple-400 to-pink-500 text-transparent bg-clip-text inline-flex items-center gap-4 tracking-tighter">CodeQuarry <Zap className="w-12 h-12 text-purple-400 fill-current" /></h1>
        <p className="text-gray-400 text-xl font-medium">Dig deep. Build high.</p>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {COURSES.map((course) => (
          <div key={course.id} onClick={() => navigateToSyllabus(course)} className="bg-[#161b22] border border-gray-800 hover:border-purple-500/50 p-6 rounded-2xl cursor-pointer transition-all hover:-translate-y-2 hover:shadow-2xl hover:shadow-purple-500/10 group">
            <div className="flex justify-between items-start mb-6">
              <div className="p-3 bg-gray-900 rounded-xl group-hover:bg-gray-800 transition-colors ring-1 ring-gray-800">{course.icon}</div>
              <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider bg-gray-800 rounded-full text-gray-400 border border-gray-700">{course.level}</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">{course.title}</h3>
            <p className="text-gray-400 text-sm mb-6 leading-relaxed">{course.description}</p>
            <div className="flex items-center text-purple-400 font-bold text-sm group-hover:translate-x-2 transition-transform">START MINING <ChevronRight className="w-4 h-4 ml-1" /></div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSyllabus = () => (
    <div className="max-w-4xl mx-auto p-6 animate-in fade-in slide-in-from-right-8 duration-300">
      <button onClick={goBack} className="flex items-center text-gray-400 hover:text-white mb-8 transition-colors group"><ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Quarry</button>
      <div className="bg-[#161b22] border border-gray-800 rounded-3xl p-8 mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-32 bg-purple-500/5 blur-3xl rounded-full pointer-events-none"></div>
        <div className="flex items-center gap-6 mb-4 relative z-10">
          <div className="p-4 bg-gray-900/50 rounded-2xl border border-gray-800">{activeCourse.icon}</div>
          <div><h2 className="text-4xl font-black text-white tracking-tight">{activeCourse.title}</h2><p className="text-purple-400 font-mono text-sm mt-1">ID: {activeCourse.id.toUpperCase()}</p></div>
        </div>
        <p className="text-gray-300 text-lg relative z-10 max-w-2xl">{activeCourse.description}</p>
      </div>
      <div className="space-y-4">
        {activeCourse.modules.map((module, idx) => (
          <div key={module.id} onClick={() => navigateToLearning(module)} className="bg-[#0d1117] border border-gray-800 hover:border-purple-500/50 p-5 rounded-xl flex items-center justify-between cursor-pointer transition-all hover:bg-[#161b22] group">
            <div className="flex items-center gap-5">
              <div className="w-8 h-8 rounded bg-gray-800 flex items-center justify-center text-gray-500 font-mono text-sm border border-gray-700 group-hover:text-white group-hover:border-purple-500/30 transition-colors">{idx + 1}</div>
              <div>
                <h4 className="text-lg font-bold text-gray-200 group-hover:text-white transition-colors">{module.title}</h4>
                <span className="text-xs text-gray-600 font-mono uppercase bg-gray-900 px-2 py-0.5 rounded border border-gray-800 mt-1 inline-block">{module.type || 'Practice'}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
               {(!module.type || module.type === 'practice') && <Play className="w-4 h-4 text-gray-600 group-hover:text-purple-400 transition-colors fill-current" />}
               {module.type === 'video' && <PlayCircle className="w-4 h-4 text-gray-600 group-hover:text-red-400 transition-colors" />}
               {module.type === 'article' && <FileText className="w-4 h-4 text-gray-600 group-hover:text-blue-400 transition-colors" />}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0d1117] text-white font-sans selection:bg-purple-500/30">
      <nav className="h-16 border-b border-gray-800 bg-[#0d1117]/80 backdrop-blur-md sticky top-0 z-40 px-6 flex items-center justify-between">
         <div className="flex items-center gap-2 font-black text-xl tracking-tight cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setView('home')}><Zap className="w-6 h-6 text-purple-500 fill-current" /><span>CodeQuarry<span className="text-purple-500">.</span></span></div>
         <div className="flex items-center gap-8">
           {view === 'learning' && <button onClick={() => setIsMapOpen(true)} className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-white transition-colors"><MapIcon className="w-4 h-4" /> Map</button>}
           <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-blue-600 flex items-center justify-center font-bold text-xs shadow-lg shadow-purple-900/20 cursor-pointer hover:ring-2 ring-purple-500 transition-all">YO</div>
         </div>
      </nav>
      
      <main>
        {view === 'home' && renderHome()}
        {view === 'syllabus' && renderSyllabus()}
        
        {view === 'learning' && (
          <div className="h-[calc(100vh-64px)] flex overflow-hidden relative">
            {isMapOpen && (
                <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center animate-in fade-in duration-200">
                <div className="w-full max-w-3xl bg-[#161b22] border border-gray-700 rounded-3xl p-8 relative shadow-2xl overflow-hidden m-4">
                    <div className="relative z-10 flex justify-between items-center mb-8">
                        <h2 className="text-2xl font-black text-white flex items-center gap-3"><MapIcon className="w-6 h-6 text-purple-400" /> Map</h2>
                        <button onClick={() => setIsMapOpen(false)}><X className="w-6 h-6 text-gray-500 hover:text-white" /></button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {activeCourse.modules.map((m, idx) => (
                            <button key={m.id} onClick={() => navigateToLearning(m)} className={`p-4 rounded-xl border flex flex-col items-start gap-2 ${activeModule.id === m.id ? 'bg-purple-500/20 border-purple-500 text-white' : 'bg-gray-800 border-gray-700 text-gray-400'}`}>
                                <span className="text-xs uppercase font-bold opacity-50">{m.type || 'Practice'}</span>
                                <span className="font-bold">{idx + 1}. {m.title}</span>
                            </button>
                        ))}
                    </div>
                </div>
                </div>
            )}
            
            {/* THE ROUTING LOGIC */}
            {(() => {
              const navProps = {
                currentIndex: activeCourse.modules.findIndex(m => m.id === activeModule.id),
                total: activeCourse.modules.length,
                onNext: handleNextLesson,
                onPrev: handlePrevLesson
              };
              const type = activeModule.type || 'practice';

              // Passing 'onOpenMap' to all components
              const commonProps = {
                module: activeModule,
                navProps: navProps,
                onOpenMap: () => setIsMapOpen(true)
              };

              if (type === 'video') return <VideoEssay {...commonProps} />;
              if (type === 'article') return <ArticleEssay {...commonProps} />;
              
              return <PracticeMode key={activeModule.id} {...commonProps} />;
            })()}
          </div>
        )}
      </main>
    </div>
  );
}