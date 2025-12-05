import React, { useState, useEffect } from 'react';
import {
  Gem, Map as MapIcon, Pickaxe, LogOut
} from 'lucide-react';import { COURSES } from './data/courses';
import { VideoEssay } from './components/VideoEssay';
import { ArticleEssay } from './components/ArticleEssay';
import { PracticeMode } from './components/practice';
import { CourseMap } from './components/CourseMap';
import { HomePage } from './pages/HomePage';
import { SyllabusPage } from './pages/SyllabusPage';
import { LoginPage } from './pages/LoginPage';

/* ========================================================================
   MAIN COMPONENT: APP ROUTER
   (Clean, focused on state routing)
   ======================================================================== */
export default function App() {
  const [view, setView] = useState('home'); 
  const [activeCourse, setActiveCourse] = useState(null);
  const [activeModule, setActiveModule] = useState(null);
  const [isMapOpen, setIsMapOpen] = useState(false);
  
  // --- User Authentication and Progress State ---
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState({});

  // Load all users and the last logged-in user from localStorage on initial load
  useEffect(() => {
    try {
      const savedUsers = localStorage.getItem('codeQuarryUsers');
      const lastUser = localStorage.getItem('codeQuarryLastUser');
      if (savedUsers) {
        setUsers(JSON.parse(savedUsers));
      }
      if (lastUser && savedUsers && JSON.parse(savedUsers)[lastUser]) {
        setCurrentUser(lastUser);
      }
    } catch (error) {
      console.error("Failed to load user data from localStorage", error);
    }
  }, []);

  // Save all user data to localStorage whenever the 'users' object changes
  useEffect(() => {
    try {
      // Avoid saving an empty object on initial load before users are populated
      if (Object.keys(users).length > 0) {
        localStorage.setItem('codeQuarryUsers', JSON.stringify(users));
      }
    } catch (error) {
      console.error("Failed to save user data to localStorage", error);
    }
  }, [users]);

  // Derive completed modules for the current user
  const userProgress = users[currentUser]?.progress || {};
  const completedModules = new Set(
    Object.keys(userProgress).filter(moduleId => userProgress[moduleId].completed)
  );
  
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

  const handleMarkComplete = (codeToSave = null) => {
    if (!activeModule || !currentUser) return;

    setUsers(prevUsers => {
      const currentUserProgress = prevUsers[currentUser]?.progress || {};
      
      const newModuleProgress = {
        ...currentUserProgress[activeModule.id],
        completed: true,
      };

      if (codeToSave) {
        newModuleProgress.savedCode = codeToSave;
      }

      return {
        ...prevUsers,
        [currentUser]: { ...prevUsers[currentUser], progress: { ...currentUserProgress, [activeModule.id]: newModuleProgress } },
      };
    });
  };

  const handleLogin = (username) => {
    if (!users[username]) {
      setUsers(prev => ({ ...prev, [username]: { progress: {} } }));
    }
    setCurrentUser(username);
    localStorage.setItem('codeQuarryLastUser', username);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('codeQuarryLastUser');
    setView('home'); // Reset view to home after logout
  };

  // If no user is logged in, show the login page.
  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-[#0d1117] text-white font-sans selection:bg-purple-500/30 relative">
      {/* NEW: Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-96 h-96 bg-purple-900/20 rounded-full blur-3xl animate-pulse [animation-duration:8s]"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-96 h-96 bg-blue-900/20 rounded-full blur-3xl animate-pulse [animation-duration:10s]"></div>
      </div>

      <div className="relative z-10">
      <nav className="h-16 border-b border-gray-800 bg-[#0d1117]/80 backdrop-blur-md sticky top-0 z-40 px-6 flex items-center justify-between">
         <div className="flex items-center gap-2 font-black text-xl tracking-tight cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setView('home')}><Gem className="w-6 h-6 text-purple-500" /><span>CodeQuarry<span className="text-purple-500">.</span></span></div>
         <div className="flex items-center gap-8">
           {view === 'learning' && <button onClick={() => setIsMapOpen(true)} className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-white transition-colors"><MapIcon className="w-4 h-4" /> Map</button>}
           <div className="flex items-center gap-4">
             <span className="text-sm font-bold text-gray-300">{currentUser}</span>
             <button onClick={handleLogout} className="p-2 rounded-lg bg-gray-800 hover:bg-red-900/50 text-gray-400 hover:text-red-400 transition-colors" title="Logout"><LogOut className="w-4 h-4" /></button>
           </div>
         </div>
      </nav>
      
      <main>
        {view === 'home' && <HomePage courses={COURSES} onSelectCourse={navigateToSyllabus} />}
        {view === 'syllabus' && <SyllabusPage course={activeCourse} onBack={goBack} onSelectModule={navigateToLearning} completedModules={completedModules} />}
        
        {view === 'learning' && (
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