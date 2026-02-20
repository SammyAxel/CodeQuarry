import React, { useState, useEffect, lazy, Suspense, useMemo } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import {
  Gem, Map as MapIcon, Pickaxe, LogOut, BarChart3, User, Languages, Users, Crown, Trophy, ShoppingCart
} from 'lucide-react';

import { COURSES, useCourses } from './data/courses';
import { VIEWS, STORAGE_KEYS } from './constants/appConfig';
import { VideoEssay } from './components/VideoEssay';
import { ArticleEssay } from './components/ArticleEssay';
import { PracticeMode } from './components/practice';
import { CourseMap } from './components/CourseMap';
import { AdminDashboard } from './components/AdminDashboard';
import AdminUserManagement from './components/AdminUserManagement';
import { ThemeToggle } from './components/ThemeToggle';
import { useThemeContext } from './context/ThemeContext';
import HomePage from './pages/HomePage';
import { SyllabusPage } from './pages/SyllabusPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';

// Lazy load non-critical pages
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const CosmeticsShop = lazy(() => import('./components/CosmeticsShop'));
const Leaderboard = lazy(() => import('./components/Leaderboard'));
const PublicProfilePage = lazy(() => import('./pages/PublicProfilePage'));
import { useUser } from './context/UserContext';
import { useApp } from './context/AppContext';
import { useLanguage } from './context/LanguageContext';
import { useRouting } from './hooks/useRouting';
import { fetchCourseTranslations, getCourseTranslations } from './utils/courseTranslations';

/**
 * Main Application Component
 * Routes between different views (home, syllabus, learning)
 * Uses Context API for state management
 */
export default function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isDark } = useThemeContext();
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [adminRole, setAdminRole] = useState(null); // 'admin' or 'mod'
  const [publishedCourseEdits, setPublishedCourseEdits] = useState({});
  const [customCourses, setCustomCourses] = useState([]); // Drafts that have been published
  const [currentPage, setCurrentPage] = useState('home'); // 'home' | 'dashboard' | 'profile' | 'users'
  const [lastAdminRole, setLastAdminRole] = useState(() => localStorage.getItem('lastAdminRole')); // Remember last admin role
  
  // Fetch courses from API
  const { courses: apiCourses, loading: coursesLoading, error: coursesError, refetch: refetchCourses } = useCourses();
  
  // Load translations cache on mount
  useEffect(() => {
    const loadTranslations = async () => {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      try {
        const response = await fetch(`${API_URL}/api/translations/all`);
        if (response.ok) {
          const allTranslations = await response.json();
          // Save to localStorage cache
          localStorage.setItem('courseTranslations_cache', JSON.stringify(allTranslations));
        }
      } catch (error) {
        // Silently fail - will use localStorage cache if available
        console.log('Using cached translations');
      }
    };
    
    loadTranslations();
  }, []);
  
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

  // Get merged courses (API courses + local edits + custom published courses)
  const getMergedCourses = () => {
    const baseCourses = apiCourses || COURSES;
    const editedOriginals = baseCourses.map(course => {
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
  // IMPORTANT: Memoize to prevent infinite render loops in useRouting
  const mergedCourses = useMemo(() => {
    const baseCourses = apiCourses || COURSES;
    const editedOriginals = baseCourses.map(course => {
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
  }, [apiCourses, publishedCourseEdits, customCourses]);
  
  useRouting(mergedCourses);

  // Derive completed modules for the current user
  const completedModules = getCompletedModules();

  // Navigation handlers (defined before any returns to comply with Rules of Hooks)
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

    // If server says onboarding already completed, sync local storage immediately
    if (user?.hasCompletedOnboarding || user?.has_completed_onboarding) {
      try { localStorage.setItem('tutorialCompleted', 'true'); sessionStorage.setItem('tutorialCompleted', 'true'); } catch (e) {}
    }

    // Check if we have an intended URL to restore (don't navigate yet, let useEffect handle it)
    const intendedUrl = sessionStorage.getItem('intendedUrl');
    if (intendedUrl && intendedUrl !== '/login' && intendedUrl !== '/register') {
      // Will be handled by useEffect when currentUser updates
      return;
    }

    // Otherwise navigate to home
    navigate('/');
    setCurrentPage('home');
    navigateHome();
  };

  const handleRegisterSuccess = (user) => {
    login(user);
    navigate('/');
    setCurrentPage('home');
    navigateHome();
  };

  // When currentUser becomes available (auto-login or login), restore intended URL or navigate home
  useEffect(() => {
    if (currentUser) {
      const path = location.pathname;
      if (path === '/login' || path === '/register') {
        // Check if we have a saved intended URL to restore
        const intendedUrl = sessionStorage.getItem('intendedUrl');
        sessionStorage.removeItem('intendedUrl');
        if (intendedUrl && intendedUrl !== '/login' && intendedUrl !== '/register') {
          navigate(intendedUrl);
          // Don't call navigateHome - let useRouting handle the route restoration
          return;
        }
        navigate('/');
        setCurrentPage('home');
        navigateHome();
      }
    }
  }, [currentUser, location.pathname, navigate, navigateHome]);

  // Admin handlers
  const handleAdminLogin = (role) => {
    userAdminLogin(role);
    setAdminRole(role);
    setLastAdminRole(role);
    localStorage.setItem('lastAdminRole', role);
    setIsAdminMode(true);
  };

  const handleEnterAdminMode = () => {
    // DB admin: enter directly without needing a password re-entry
    if (currentUser?.role === 'admin') {
      setAdminRole('admin');
      setLastAdminRole('admin');
      localStorage.setItem('lastAdminRole', 'admin');
      setIsAdminMode(true);
      return;
    }
    // Previously authenticated via password dialog: reuse stored role
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

  // ALL CONDITIONAL RETURNS MUST COME AFTER ALL HOOKS
  // This prevents "Rendered fewer hooks than expected" errors

  // If in admin mode, show admin dashboard
  if (isAdminMode) {
    return (
      <div className="min-h-screen bg-[#0d1117] text-white">
        <div className="flex items-center justify-between h-16 border-b border-gray-800 px-6 bg-gradient-to-r from-amber-950/50 to-yellow-950/30">
          <div className="flex items-center gap-2 font-black text-xl">
            <Gem className="w-6 h-6 text-yellow-500" />
            <div className="flex items-center gap-2">
              {adminRole === 'admin' ? <Crown className="w-5 h-5 text-yellow-500" /> : <Crown className="w-5 h-5 text-purple-500" />}
              <span>{adminRole === 'admin' ? 'Admin Panel' : 'Mod Panel'}</span>
            </div>
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

  // If no user is logged in, show the login page.
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
        <div className="animate-pulse text-purple-400 text-2xl">Loading...</div>
      </div>
    );
  }

  // Public profile route - accessible without login
  const userProfileMatch = location.pathname.match(/^\/user\/(\d+)$/);
  if (userProfileMatch) {
    return (
      <Suspense fallback={<div className="min-h-screen bg-[#0d1117] flex items-center justify-center text-purple-400">Loading...</div>}>
        <PublicProfilePage />
      </Suspense>
    );
  }

  // Leaderboard is also public
  if (location.pathname === '/leaderboard') {
    return (
      <Suspense fallback={<div className="min-h-screen bg-[#0d1117] flex items-center justify-center text-purple-400">Loading...</div>}>
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
          <Leaderboard />
        </div>
      </Suspense>
    );
  }

  if (!currentUser) {
    if (showAuthPage === 'register') {
      // Update URL to /register
      if (location.pathname !== '/register' && !location.pathname.startsWith('/user/')) {
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
    // Update URL to /login (but not if we're on a public route)
    // Save the intended URL so we can restore it after login
    if (location.pathname !== '/login' && !location.pathname.startsWith('/user/') && location.pathname !== '/leaderboard') {
      sessionStorage.setItem('intendedUrl', location.pathname);
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
      <nav className="h-20 border-b border-purple-500/20 bg-gradient-to-r from-[#0d1117] via-purple-950/20 to-[#0d1117] backdrop-blur-xl sticky top-0 z-40 px-8 flex items-center justify-between shadow-2xl shadow-black/50" role="navigation" aria-label="Main navigation">
        
        {/* Left: Logo and Brand */}
        <div 
          className="flex items-center gap-3 cursor-pointer group" 
          onClick={() => { navigateHome(); setCurrentPage('home'); window.history.pushState({}, '', '/'); }} 
          role="button" 
          tabIndex="0" 
          onKeyDown={(e) => e.key === 'Enter' && (navigateHome(), setCurrentPage('home'), window.history.pushState({}, '', '/'))}
          aria-label="CodeQuarry Home"
        >
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center shadow-lg shadow-purple-500/30 group-hover:shadow-purple-400/50 transition-shadow">
            <Gem className="w-6 h-6 text-white" />
          </div>
          <div className="flex flex-col">
            <div className="font-black text-lg tracking-tight text-white group-hover:text-purple-300 transition-colors">CodeQuarry<span className="text-purple-400">.</span></div>
            <div className="text-xs text-purple-300/60 font-semibold">Learn • Build • Master</div>
          </div>
        </div>

        {/* Center: Navigation Links */}
        <div className="flex items-center gap-2">
          {view === VIEWS.LEARNING && (
            <button 
              onClick={() => setIsMapOpen(true)} 
              className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
              title="Course Map"
            >
              <MapIcon className="w-4 h-4" /> {t('map.title')}
            </button>
          )}
          <button 
            onClick={() => { navigateHome(); setCurrentPage('dashboard'); window.history.pushState({}, '', '/dashboard'); }}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-lg transition-all ${
              currentPage === 'dashboard' 
                ? 'text-purple-400 bg-purple-500/20 border border-purple-500/50' 
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
            title="Dashboard"
          >
            <BarChart3 className="w-4 h-4" /> {t('nav.dashboard')}
          </button>
          {/* Show admin features only if user has admin role in database */}
          {currentUser?.role === 'admin' && (
            <>
              <button 
                onClick={() => { navigateHome(); setCurrentPage('users'); window.history.pushState({}, '', '/admin/users'); }}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-lg transition-all ${
                  currentPage === 'users' 
                    ? 'text-purple-400 bg-purple-500/20 border border-purple-500/50' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
                title="User Management"
              >
                <Users className="w-4 h-4" /> {t('nav.users')}
              </button>
              <button 
                onClick={handleEnterAdminMode}
                className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-yellow-400 hover:text-yellow-300 hover:bg-yellow-900/20 rounded-lg transition-all"
                title="Enter Admin Mode"
              >
                <Crown className="w-4 h-4" /> Admin
              </button>
            </>
          )}
          <button
            onClick={() => { navigateHome(); setCurrentPage('leaderboard'); window.history.pushState({}, '', '/leaderboard'); }}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-lg transition-all ${
              currentPage === 'leaderboard' 
                ? 'text-purple-400 bg-purple-500/20 border border-purple-500/50' 
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
            title="Leaderboard"
          >
            <Trophy className="w-4 h-4" /> {t('nav.leaderboard')}
          </button>
          <button 
            onClick={() => { navigateHome(); setCurrentPage('shop'); window.history.pushState({}, '', '/shop'); }}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-lg transition-all ${
              currentPage === 'shop' 
                ? 'text-purple-400 bg-purple-500/20 border border-purple-500/50' 
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
            title="Cosmetics Shop"
          >
            <ShoppingCart className="w-4 h-4" /> {t('nav.shop')}
          </button>
        </div>

        {/* Right: Theme Toggle, Language, Profile, Logout */}
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 hover:text-white transition-all text-sm font-bold border border-gray-700/50 hover:border-purple-500/30"
            title={language === 'en' ? 'Switch to Indonesian' : 'Switch to English'}
            aria-label={language === 'en' ? 'Switch to Indonesian' : 'Switch to English'}
          >
            <Languages className="w-4 h-4" />
            {language === 'en' ? 'ID' : 'EN'}
          </button>
          <div className="w-px h-6 bg-gray-700/50"></div>
          {!currentUser && (
            <button 
              onClick={handleEnterAdminMode}
              className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-yellow-400 hover:text-yellow-300 hover:bg-yellow-900/20 rounded-lg transition-all"
              title="Enter Admin Mode"
            >
              <Crown className="w-4 h-4" /> {t('nav.admin')}
            </button>
          )}
          <button 
            onClick={() => { navigateHome(); setCurrentPage('profile'); window.history.pushState({}, '', '/profile'); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              currentPage === 'profile' 
                ? 'text-purple-400 bg-purple-500/20 border border-purple-500/50' 
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
            title="Profile"
          >
            <User className="w-4 h-4" />
            <span className="max-w-[120px] truncate">{currentUser?.displayName || currentUser?.username || 'User'}</span>
          </button>
        </div>
      </nav>
      
      <main>
        {currentPage === 'dashboard' && view === VIEWS.HOME && (
          <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-purple-400">Loading...</div>}>
            <DashboardPage 
              courses={getMergedCourses()} 
              onSelectCourse={(course) => { setCurrentPage('home'); navigateToSyllabus(course); }}
              onBack={() => setCurrentPage('home')}
            />
          </Suspense>
        )}
        {currentPage === 'profile' && view === VIEWS.HOME && (
          <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-purple-400">{t('common.loading')}</div>}>
            <ProfilePage onBack={() => setCurrentPage('home')} />
          </Suspense>
        )}
        {currentPage === 'shop' && view === VIEWS.HOME && (
          <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-purple-400">{t('common.loading')}</div>}>
            <CosmeticsShop />
          </Suspense>
        )}
        {currentPage === 'leaderboard' && view === VIEWS.HOME && (
          <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-purple-400">{t('common.loading')}</div>}>
            <Leaderboard />
          </Suspense>
        )}
        {currentPage === 'users' && view === VIEWS.HOME && (
          <AdminUserManagement />
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
                onPrev: handlePrevLesson,
                goBack: () => { setView(VIEWS.SYLLABUS); }
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
      
      {/* Sarcastic Light Mode Footer */}
      {!isDark && (
        <div className="fixed bottom-0 left-0 right-0 bg-yellow-50 border-t-2 border-yellow-400 px-4 py-3 text-center text-sm text-gray-800 z-50 shadow-xl">
          <span className="font-mono font-bold">⚠️ Warning: You're using light mode. Your retinas called - they want their melanin back.</span>
          <br />
          <span className="text-xs text-gray-600 mt-1">Pro tip: Toggle dark mode to unlock the premium UI experience™</span>
        </div>
      )}
      </div>
    </div>
  );
}