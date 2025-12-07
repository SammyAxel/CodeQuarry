import React, { useState, useEffect } from 'react';
import {
  Gem, Map as MapIcon, Pickaxe, LogOut, BarChart3, User, Languages
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
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProfilePage } from './pages/ProfilePage';
import { useUser } from './context/UserContext';
import { useApp } from './context/AppContext';
import { useLanguage } from './context/LanguageContext';
import { useRouting } from './hooks/useRouting';

/**
 * Main Application Component
 * Routes between different views (home, syllabus, learning)
 * Uses Context API for state management
 */
export default function App() {
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [adminRole, setAdminRole] = useState(null); // 'admin' or 'mod'
  const [publishedCourseEdits, setPublishedCourseEdits] = useState({});
  const [customCourses, setCustomCourses] = useState([]); // Drafts that have been published
  const [currentPage, setCurrentPage] = useState('home'); // 'home' | 'dashboard' | 'profile'
  const [lastAdminRole, setLastAdminRole] = useState(() => localStorage.getItem('lastAdminRole')); // Remember last admin role
  
  // Load published course edits and custom courses from localStorage on mount
  useEffect(() => {
    const savedEdits = localStorage.getItem('publishedCourseEdits');
    if (savedEdits) {
      try {
        setPublishedCourseEdits(JSON.parse(savedEdits));
      } catch (e) {
        console.error('Failed to load published course edits:', e);
      }
    }
    
    // Load custom published courses (drafts that were published)
    const savedCustomCourses = localStorage.getItem('customPublishedCourses');
    if (savedCustomCourses) {
      try {
        setCustomCourses(JSON.parse(savedCustomCourses));
      } catch (e) {
        console.error('Failed to load custom courses:', e);
      }
    }
  }, []);

  // Get merged courses (original + local edits + custom published courses)
  const getMergedCourses = () => {
    const editedOriginals = COURSES.map(course => {
      if (publishedCourseEdits[course.id]) {
        return { ...course, ...publishedCourseEdits[course.id] };
      }
      return course;
    });
    // Add custom courses that aren't already in the list
    const customFiltered = customCourses.filter(
      custom => !editedOriginals.some(orig => orig.id === custom.id)
    );
    return [...editedOriginals, ...customFiltered];
  };

  // Handler for when admin updates published courses
  const handleUpdatePublishedCourses = (edits) => {
    setPublishedCourseEdits(edits);
  };
  
  // Handler for publishing a draft course to live
  const handlePublishDraft = (draftCourse) => {
    // Add to custom courses
    const updatedCustomCourses = [...customCourses.filter(c => c.id !== draftCourse.id), draftCourse];
    setCustomCourses(updatedCustomCourses);
    localStorage.setItem('customPublishedCourses', JSON.stringify(updatedCustomCourses));
    return true;
  };
  
  // Handler for unpublishing a custom course
  const handleUnpublishCourse = (courseId) => {
    const updatedCustomCourses = customCourses.filter(c => c.id !== courseId);
    setCustomCourses(updatedCustomCourses);
    localStorage.setItem('customPublishedCourses', JSON.stringify(updatedCustomCourses));
  };
  
  // Get context values
  const { 
    currentUser, 
    isLoading, 
    login, 
    logout, 
    adminLogin: userAdminLogin,
    markModuleComplete,
    getCompletedModules,
    isModuleCompleted,
    showAuthPage,
    setShowAuthPage,
  } = useUser();

  // Sync URL with auth page state
  useEffect(() => {
    if (!currentUser) {
      const path = window.location.pathname;
      if (path === '/register') {
        setShowAuthPage('register');
      } else if (path === '/login' || path === '/') {
        setShowAuthPage('login');
      }
    }
  }, [currentUser]);

  const { language, toggleLanguage, t } = useLanguage();

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

  // Get merged courses and initialize routing
  const mergedCourses = getMergedCourses();
  useRouting(mergedCourses);

  // Derive completed modules for the current user
  const completedModules = getCompletedModules();
  
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
        <AdminDashboard 
          adminRole={adminRole} 
          onUpdatePublishedCourses={handleUpdatePublishedCourses}
          onPublishDraft={handlePublishDraft}
          onUnpublishCourse={handleUnpublishCourse}
          customCourses={customCourses}
        />
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
    if (!activeModule || !activeCourse || !currentUser) return;
    markModuleComplete(activeCourse.id, activeModule.id, codeToSave);
  };

  const handleLogin = (user) => {
    login(user);
  };

  const handleRegisterSuccess = (user) => {
    login(user);
  };

  const handleAdminLogin = (role) => {
    userAdminLogin(role);
    setAdminRole(role);
    setLastAdminRole(role);
    localStorage.setItem('lastAdminRole', role);
    setIsAdminMode(true);
  };

  const handleEnterAdminMode = () => {
    if (lastAdminRole) {
      setAdminRole(lastAdminRole);
      setIsAdminMode(true);
    }
  };

  const handleLogout = () => {
    logout();
    navigateHome();
    setCurrentPage('home');
    // Reset URL to home
    window.history.pushState({}, '', '/');
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
    if (showAuthPage === 'register') {
      // Update URL to /register
      if (window.location.pathname !== '/register') {
        window.history.pushState({}, '', '/register');
      }
      return (
        <RegisterPage 
          onRegisterSuccess={handleRegisterSuccess} 
          onBackToLogin={() => {
            setShowAuthPage('login');
            window.history.pushState({}, '', '/login');
          }} 
        />
      );
    }
    // Update URL to /login
    if (window.location.pathname !== '/login') {
      window.history.pushState({}, '', '/login');
    }
    return (
      <LoginPage 
        onLogin={handleLogin} 
        onAdminLogin={handleAdminLogin} 
        onShowRegister={() => {
          setShowAuthPage('register');
          window.history.pushState({}, '', '/register');
        }}
      />
    );
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
         <div className="flex items-center gap-2 font-black text-xl tracking-tight cursor-pointer hover:opacity-80 transition-opacity" onClick={() => { navigateHome(); setCurrentPage('home'); window.history.pushState({}, '', '/'); }}><Gem className="w-6 h-6 text-purple-500" /><span>CodeQuarry<span className="text-purple-500">.</span></span></div>
         <div className="flex items-center gap-6">
           {view === VIEWS.LEARNING && <button onClick={() => setIsMapOpen(true)} className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-white transition-colors"><MapIcon className="w-4 h-4" /> {t('map.title')}</button>}
           <button 
             onClick={() => { navigateHome(); setCurrentPage('dashboard'); window.history.pushState({}, '', '/dashboard'); }}
             className={`flex items-center gap-2 text-sm font-bold transition-colors ${currentPage === 'dashboard' ? 'text-purple-400' : 'text-gray-400 hover:text-white'}`}
           >
             <BarChart3 className="w-4 h-4" /> {t('nav.dashboard')}
           </button>
           {lastAdminRole && (
             <button 
               onClick={handleEnterAdminMode}
               className="flex items-center gap-2 text-sm font-bold text-yellow-400 hover:text-yellow-300 transition-colors"
               title="Enter Admin Mode"
             >
               {lastAdminRole === 'admin' ? '👑' : '🧌'} Admin
             </button>
           )}
           <button
             onClick={toggleLanguage}
             className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition-colors text-sm font-bold"
             title={language === 'en' ? 'Switch to Indonesian' : 'Ganti ke Bahasa Inggris'}
           >
             <Languages className="w-4 h-4" />
             {language === 'en' ? 'ID' : 'EN'}
           </button>
           <div className="flex items-center gap-3">
             <button 
               onClick={() => { navigateHome(); setCurrentPage('profile'); window.history.pushState({}, '', '/profile'); }}
               className={`flex items-center gap-2 text-sm font-bold transition-colors ${currentPage === 'profile' ? 'text-purple-400' : 'text-gray-400 hover:text-white'}`}
             >
               <User className="w-4 h-4" />
               {currentUser?.displayName || currentUser?.username || 'User'}
             </button>
             <button onClick={handleLogout} className="p-2 rounded-lg bg-gray-800 hover:bg-red-900/50 text-gray-400 hover:text-red-400 transition-colors" title={t('nav.logout')}><LogOut className="w-4 h-4" /></button>
           </div>
         </div>
      </nav>
      
      <main>
        {currentPage === 'dashboard' && view === VIEWS.HOME && (
          <DashboardPage 
            courses={getMergedCourses()} 
            onSelectCourse={(course) => { setCurrentPage('home'); navigateToSyllabus(course); }}
            onBack={() => setCurrentPage('home')}
          />
        )}
        {currentPage === 'profile' && view === VIEWS.HOME && (
          <ProfilePage onBack={() => setCurrentPage('home')} />
        )}
        {currentPage === 'home' && view === VIEWS.HOME && <HomePage courses={getMergedCourses()} onSelectCourse={navigateToSyllabus} />}
        {view === VIEWS.SYLLABUS && <SyllabusPage course={activeCourse} onBack={() => { navigateHome(); setCurrentPage('home'); }} onSelectModule={navigateToLearning} completedModules={completedModules} />}
        
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
                courseId: activeCourse.id,
                navProps: navProps,
                onOpenMap: () => setIsMapOpen(true),
                onMarkComplete: handleMarkComplete,
                isCompleted: completedModules.has(activeModule.id),
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