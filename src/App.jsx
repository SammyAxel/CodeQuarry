import React, { useState, useEffect } from 'react';
import {
  Gem, Map as MapIcon, Pickaxe, LogOut
} from 'lucide-react';

import { COURSES } from './data/courses';
import { VIEWS, STORAGE_KEYS } from './constants/appConfig';
import { VideoEssay } from './components/VideoEssay';
import { ArticleEssay } from './components/ArticleEssay';
import { PracticeMode } from './components/practice';
import { CourseMap } from './components/CourseMap';
import { AdminDashboard } from './components/AdminDashboard';
import HomePage from './pages/HomePage';
import { SyllabusPage } from './pages/SyllabusPage';
import { LoginPage } from './pages/LoginPage';
import { useUser } from './context/UserContext';
import { useApp } from './context/AppContext';

/**
 * Main Application Component
 * Routes between different views (home, syllabus, learning)
 * Uses Context API for state management
 */
export default function App() {
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [adminRole, setAdminRole] = useState(null); // 'admin' or 'mod'
  
  // Get context values
  const { 
    currentUser, 
    isLoading, 
    login, 
    logout, 
    markModuleComplete,
    getCompletedModules,
    getUserProgress 
  } = useUser();

  const {
    view,
    activeCourse,
    activeModule,
    isMapOpen,
    navigateHome,
    navigateToSyllabus,
    navigateToLearning,
    goToNextLesson,
    goToPreviousLesson,
    setIsMapOpen,
  } = useApp();

  // Derive completed modules for the current user
  const completedModules = getCompletedModules();
  const userProgress = getUserProgress();
  
  // If in admin mode, show admin dashboard
  if (isAdminMode) {
    return (
      <div className="min-h-screen bg-[#0d1117] text-white">
        <div className="flex items-center justify-between h-16 border-b border-gray-800 px-6 bg-gradient-to-r from-amber-950/50 to-yellow-950/30">
          <div className="flex items-center gap-2 font-black text-xl">
            <Gem className="w-6 h-6 text-yellow-500" />
            {adminRole === 'admin' ? '👑 Admin Panel' : '🧌 Mod Panel'}
          </div>
          <button
            onClick={() => {
              setIsAdminMode(false);
              setAdminRole(null);
            }}
            className="px-4 py-2 bg-gray-800 hover:bg-red-900/50 rounded-lg font-bold transition-colors flex items-center gap-2 text-red-400 hover:text-red-300"
          >
            <LogOut className="w-4 h-4" />
            Exit Admin
          </button>
        </div>
        <AdminDashboard adminRole={adminRole} />
      </div>
    );
  }
  
  // Navigation handlers
  const handleNextLesson = () => {
    if (!activeCourse || !activeModule) return;
    goToNextLesson(activeCourse.modules);
  };

  const handlePrevLesson = () => {
    if (!activeCourse || !activeModule) return;
    goToPreviousLesson(activeCourse.modules);
  };

  const handleMarkComplete = (codeToSave = null) => {
    if (!activeModule || !currentUser) return;
    markModuleComplete(activeModule.id, codeToSave);
  };

  const handleLogin = (username) => {
    login(username);
  };

  const handleAdminLogin = (role) => {
    setAdminRole(role);
    setIsAdminMode(true);
  };

  const handleLogout = () => {
    logout();
  };

  // If no user is logged in, show the login page.
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
        <div className="animate-pulse text-purple-400 text-2xl">Loading...</div>
      </div>
    );
  }

  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} onAdminLogin={handleAdminLogin} />;
  }

  return (
    <div className="min-h-screen bg-[#0d1117] text-white font-sans selection:bg-purple-500/30 relative">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-96 h-96 bg-purple-900/20 rounded-full blur-3xl animate-pulse [animation-duration:8s]"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-96 h-96 bg-blue-900/20 rounded-full blur-3xl animate-pulse [animation-duration:10s]"></div>
      </div>

      <div className="relative z-10">
      <nav className="h-16 border-b border-gray-800 bg-[#0d1117]/80 backdrop-blur-md sticky top-0 z-40 px-6 flex items-center justify-between">
         <div className="flex items-center gap-2 font-black text-xl tracking-tight cursor-pointer hover:opacity-80 transition-opacity" onClick={() => navigateHome()}><Gem className="w-6 h-6 text-purple-500" /><span>CodeQuarry<span className="text-purple-500">.</span></span></div>
         <div className="flex items-center gap-8">
           {view === VIEWS.LEARNING && <button onClick={() => setIsMapOpen(true)} className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-white transition-colors"><MapIcon className="w-4 h-4" /> Map</button>}
           <div className="flex items-center gap-4">
             <span className="text-sm font-bold text-gray-300">{currentUser}</span>
             <button onClick={handleLogout} className="p-2 rounded-lg bg-gray-800 hover:bg-red-900/50 text-gray-400 hover:text-red-400 transition-colors" title="Logout"><LogOut className="w-4 h-4" /></button>
           </div>
         </div>
      </nav>
      
      <main>
        {view === VIEWS.HOME && <HomePage courses={COURSES} onSelectCourse={navigateToSyllabus} />}
        {view === VIEWS.SYLLABUS && <SyllabusPage course={activeCourse} onBack={() => window.location.href = '/'} onSelectModule={navigateToLearning} completedModules={completedModules} />}
        
        {view === VIEWS.LEARNING && (
          <div className="h-[calc(100vh-64px)] flex overflow-hidden relative">
            {isMapOpen && (
              <CourseMap
                course={activeCourse}
                completedModules={Array.from(completedModules)}
                currentModuleId={activeModule.id}
                onSelectModule={(moduleId) => {
                  const moduleToNavigate = activeCourse.modules.find(m => m.id === moduleId);
                  if (moduleToNavigate) navigateToLearning(moduleToNavigate);
                }}
                onClose={() => setIsMapOpen(false)}
              />
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
                onOpenMap: () => setIsMapOpen(true),
                onMarkComplete: handleMarkComplete,
                isCompleted: completedModules.has(activeModule.id),
                savedCode: userProgress[activeModule.id]?.savedCode,
              };

              if (type === 'video') return <VideoEssay {...commonProps} />;
              if (type === 'article') return <ArticleEssay {...commonProps} />;
              
              return <PracticeMode key={activeModule.id} {...commonProps} />;
            })()}
          </div>
        )}
      </main>
      </div>
    </div>
  );
}