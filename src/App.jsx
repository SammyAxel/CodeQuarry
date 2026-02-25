import React, { useState, useEffect, lazy, Suspense, useMemo } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';

import { COURSES, useCourses } from './data/courses';
import { VIEWS } from './constants/appConfig';
import { VideoEssay } from './components/VideoEssay';
import { ArticleEssay } from './components/ArticleEssay';
import { PracticeMode } from './components/practice';
import { CourseMap } from './components/CourseMap';
import AdminUserManagement from './components/AdminUserManagement';
import HomePage from './pages/HomePage';
import { SyllabusPage } from './pages/SyllabusPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';

// Layout components (extracted)
import SuspenseFallback from './components/layout/SuspenseFallback';
import AppNavbar from './components/layout/AppNavbar';
import AppFooter from './components/layout/AppFooter';
import AdminPanel from './components/layout/AdminPanel';

// Lazy-loaded pages
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const CosmeticsShop = lazy(() => import('./components/CosmeticsShop'));
const Leaderboard = lazy(() => import('./components/Leaderboard'));
const PublicProfilePage = lazy(() => import('./pages/PublicProfilePage'));
const BootcampSchedulePage = lazy(() => import('./bootcamp/pages/BootcampSchedulePage'));
const BootcampManagePage = lazy(() => import('./bootcamp/pages/BootcampManagePage'));
const BatchDetailPage = lazy(() => import('./bootcamp/pages/BatchDetailPage'));
const ClassroomPage = lazy(() => import('./bootcamp/components/ClassroomPage'));
const TermsPage = lazy(() => import('./pages/TermsPage'));
const CertificateVerifyPage = lazy(() => import('./pages/CertificateVerifyPage'));

// Context & hooks
import { useUser } from './context/UserContext';
import { useApp } from './context/AppContext';
import { useLanguage } from './context/LanguageContext';
import { useRouting } from './hooks/useRouting';
import { useCourseEdits } from './hooks/useCourseEdits';

/**
 * Main Application Component
 * Routes between different views (home, syllabus, learning)
 * Uses Context API for state management
 */
export default function App() {
  const location = useLocation();
  const navigate = useNavigate();

  // ── Local state ───────────────────────────────────────────────────────
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [adminRole, setAdminRole] = useState(null); // 'admin' | 'mod'
  const [currentPage, setCurrentPage] = useState('home');
  const [lastAdminRole, setLastAdminRole] = useState(() => localStorage.getItem('lastAdminRole'));

  // ── Hooks ─────────────────────────────────────────────────────────────
  const { courses: apiCourses } = useCourses();
  const {
    publishedCourseEdits,
    customCourses,
    handleUpdatePublishedCourses,
    handlePublishDraft,
    handleUnpublishCourse,
  } = useCourseEdits();

  const {
    currentUser,
    isLoading,
    login,
    logout,
    adminLogin: userAdminLogin,
    markModuleComplete,
    getCompletedModules,
    showAuthPage,
    setShowAuthPage,
  } = useUser();

  const { t } = useLanguage();

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

  // ── Derived data ──────────────────────────────────────────────────────
  const mergedCourses = useMemo(() => {
    const baseCourses = apiCourses || COURSES;
    const editedOriginals = baseCourses.map((course) =>
      publishedCourseEdits[course.id] ? { ...course, ...publishedCourseEdits[course.id] } : course
    );
    const customFiltered = customCourses.filter(
      (custom) => !editedOriginals.some((orig) => orig.id === custom.id)
    );
    return [...editedOriginals, ...customFiltered];
  }, [apiCourses, publishedCourseEdits, customCourses]);

  useRouting(mergedCourses);
  const completedModules = getCompletedModules();

  // ── Effects ───────────────────────────────────────────────────────────
  // Load translations cache on mount
  useEffect(() => {
    const loadTranslations = async () => {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      try {
        const response = await fetch(`${API_URL}/api/translations/all`);
        if (response.ok) {
          const allTranslations = await response.json();
          localStorage.setItem('courseTranslations_cache', JSON.stringify(allTranslations));
        }
      } catch (error) {
        console.log('Using cached translations');
      }
    };
    loadTranslations();
  }, []);

  // Sync URL with auth page state
  useEffect(() => {
    if (!currentUser) {
      const path = window.location.pathname;
      if (path === '/register') setShowAuthPage('register');
      else if (path === '/login' || path === '/') setShowAuthPage('login');
    }
  }, [currentUser]);

  // Sync currentPage from URL on mount (for direct navigation / refresh)
  useEffect(() => {
    const path = location.pathname;
    if (path === '/dashboard') setCurrentPage('dashboard');
    else if (path === '/profile') setCurrentPage('profile');
    else if (path === '/shop') setCurrentPage('shop');
    else if (path === '/leaderboard') setCurrentPage('leaderboard');
    else if (path.startsWith('/bootcamp')) setCurrentPage('bootcamp');
    else if (path.startsWith('/admin/users')) setCurrentPage('users');
    else if (path === '/terms') setCurrentPage('terms');
  }, []);

  // When currentUser becomes available, restore intended URL or navigate home
  useEffect(() => {
    if (currentUser) {
      const path = location.pathname;
      if (path === '/login' || path === '/register') {
        const intendedUrl = sessionStorage.getItem('intendedUrl');
        sessionStorage.removeItem('intendedUrl');
        if (intendedUrl && intendedUrl !== '/login' && intendedUrl !== '/register') {
          navigate(intendedUrl);
          return;
        }
        navigate('/');
        setCurrentPage('home');
        navigateHome();
      }
    }
  }, [currentUser, location.pathname, navigate, navigateHome]);

  // ── Handlers ──────────────────────────────────────────────────────────
  const handleNextLesson = () => {
    if (activeCourse && activeModule) goToNextLesson(activeCourse.modules);
  };

  const handlePrevLesson = () => {
    if (activeCourse && activeModule) goToPreviousLesson(activeCourse.modules);
  };

  const handleMarkComplete = (codeToSave = null) => {
    if (activeModule && activeCourse && currentUser)
      markModuleComplete(activeCourse.id, activeModule.id, codeToSave);
  };

  const handleLogin = (user) => {
    login(user);
    if (user?.hasCompletedOnboarding || user?.has_completed_onboarding) {
      try { localStorage.setItem('tutorialCompleted', 'true'); sessionStorage.setItem('tutorialCompleted', 'true'); } catch (e) { /* noop */ }
    }
    const intendedUrl = sessionStorage.getItem('intendedUrl');
    if (intendedUrl && intendedUrl !== '/login' && intendedUrl !== '/register') return;
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

  const handleAdminLogin = (role) => {
    userAdminLogin(role);
    setAdminRole(role);
    setLastAdminRole(role);
    localStorage.setItem('lastAdminRole', role);
    setIsAdminMode(true);
  };

  const handleEnterAdminMode = () => {
    if (currentUser?.role === 'admin') {
      setAdminRole('admin');
      setLastAdminRole('admin');
      localStorage.setItem('lastAdminRole', 'admin');
      setIsAdminMode(true);
      return;
    }
    if (lastAdminRole) {
      setAdminRole(lastAdminRole);
      setIsAdminMode(true);
    }
  };

  const handleLogout = () => {
    logout();
    navigateHome();
    setCurrentPage('home');
    navigate('/');
  };

  // ══ CONDITIONAL RETURNS (after all hooks) ═════════════════════════════

  // Admin panel overlay
  if (isAdminMode) {
    return (
      <AdminPanel
        adminRole={adminRole}
        onExit={() => { setIsAdminMode(false); setAdminRole(null); }}
        onUpdatePublishedCourses={handleUpdatePublishedCourses}
        onPublishDraft={handlePublishDraft}
        onUnpublishCourse={handleUnpublishCourse}
        customCourses={customCourses}
      />
    );
  }

  if (isLoading) return <SuspenseFallback />;

  // ── Public routes (no login required) ─────────────────────────────────
  if (location.pathname.match(/^\/user\/(\d+)$/)) {
    return <Suspense fallback={<SuspenseFallback />}><PublicProfilePage /></Suspense>;
  }

  if (location.pathname === '/leaderboard') {
    return (
      <Suspense fallback={<SuspenseFallback />}>
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
          <Leaderboard />
        </div>
      </Suspense>
    );
  }

  if (location.pathname.match(/^\/verify\/[a-f0-9-]{36}$/i)) {
    return (
      <Suspense fallback={<SuspenseFallback text="Verifying..." color="text-yellow-400" />}>
        <CertificateVerifyPage />
      </Suspense>
    );
  }

  // ── Protected routes (redirect to login if unauthenticated) ───────────
  if (location.pathname.match(/^\/bootcamp\/batch\/\d+$/)) {
    if (!currentUser) { sessionStorage.setItem('intendedUrl', location.pathname); return <Navigate to="/login" replace />; }
    return <Suspense fallback={<SuspenseFallback />}><BatchDetailPage /></Suspense>;
  }

  if (location.pathname.match(/^\/bootcamp\/classroom\/\d+$/)) {
    if (!currentUser) { sessionStorage.setItem('intendedUrl', location.pathname); return <Navigate to="/login" replace />; }
    return <Suspense fallback={<SuspenseFallback text="Joining class..." />}><ClassroomPage /></Suspense>;
  }

  // ── Unauthenticated (login / register) ────────────────────────────────
  if (!currentUser) {
    if (showAuthPage === 'register') {
      return (
        <RegisterPage
          onRegisterSuccess={handleRegisterSuccess}
          onBackToLogin={() => { setShowAuthPage('login'); navigate('/login'); }}
        />
      );
    }
    if (location.pathname !== '/login' && !location.pathname.startsWith('/user/') && location.pathname !== '/leaderboard' && !location.pathname.startsWith('/verify/')) {
      sessionStorage.setItem('intendedUrl', location.pathname);
    }
    return (
      <LoginPage
        onLogin={handleLogin}
        onAdminLogin={handleAdminLogin}
        onShowRegister={() => { setShowAuthPage('register'); navigate('/register'); }}
      />
    );
  }

  // ══ MAIN AUTHENTICATED LAYOUT ════════════════════════════════════════
  return (
    <div className="min-h-screen bg-[#0d1117] text-white font-sans selection:bg-purple-500/30 relative">
      {/* Decorative background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-96 h-96 bg-purple-900/20 rounded-full blur-3xl animate-pulse [animation-duration:8s]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-96 h-96 bg-blue-900/20 rounded-full blur-3xl animate-pulse [animation-duration:10s]" />
      </div>

      <div className="relative z-10">
        <AppNavbar
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          onEnterAdminMode={handleEnterAdminMode}
        />

        <main>
          {currentPage === 'dashboard' && view === VIEWS.HOME && (
            <Suspense fallback={<SuspenseFallback />}>
              <DashboardPage
                courses={mergedCourses}
                onSelectCourse={(course) => { setCurrentPage('home'); navigateToSyllabus(course); }}
                onBack={() => setCurrentPage('home')}
              />
            </Suspense>
          )}
          {currentPage === 'profile' && view === VIEWS.HOME && (
            <Suspense fallback={<SuspenseFallback />}>
              <ProfilePage onBack={() => setCurrentPage('home')} />
            </Suspense>
          )}
          {currentPage === 'shop' && view === VIEWS.HOME && (
            <Suspense fallback={<SuspenseFallback />}>
              <CosmeticsShop />
            </Suspense>
          )}
          {currentPage === 'leaderboard' && view === VIEWS.HOME && (
            <Suspense fallback={<SuspenseFallback />}>
              <Leaderboard />
            </Suspense>
          )}
          {currentPage === 'users' && view === VIEWS.HOME && <AdminUserManagement />}
          {currentPage === 'bootcamp' && view === VIEWS.HOME && (
            <Suspense fallback={<SuspenseFallback />}>
              {location.pathname === '/bootcamp/manage' ? <BootcampManagePage /> : <BootcampSchedulePage />}
            </Suspense>
          )}
          {currentPage === 'terms' && view === VIEWS.HOME && (
            <Suspense fallback={<SuspenseFallback />}>
              <TermsPage />
            </Suspense>
          )}
          {currentPage === 'home' && view === VIEWS.HOME && (
            <HomePage courses={mergedCourses} onSelectCourse={navigateToSyllabus} />
          )}
          {view === VIEWS.SYLLABUS && (
            <SyllabusPage
              course={activeCourse}
              onBack={() => { navigateHome(); setCurrentPage('home'); }}
              onSelectModule={navigateToLearning}
              completedModules={completedModules}
            />
          )}
          {view === VIEWS.LEARNING && (
            <LearningView
              activeCourse={activeCourse}
              activeModule={activeModule}
              isMapOpen={isMapOpen}
              setIsMapOpen={setIsMapOpen}
              completedModules={completedModules}
              navigateToLearning={navigateToLearning}
              onNext={handleNextLesson}
              onPrev={handlePrevLesson}
              onMarkComplete={handleMarkComplete}
            />
          )}
        </main>

        {view === VIEWS.HOME && (
          <AppFooter currentPage={currentPage} setCurrentPage={setCurrentPage} />
        )}
      </div>
    </div>
  );
}

// ── Learning View (extracted from inline IIFE) ──────────────────────────
function LearningView({
  activeCourse,
  activeModule,
  isMapOpen,
  setIsMapOpen,
  completedModules,
  navigateToLearning,
  onNext,
  onPrev,
  onMarkComplete,
}) {
  const navProps = {
    currentIndex: activeCourse.modules.findIndex((m) => m.id === activeModule.id),
    total: activeCourse.modules.length,
    onNext,
    onPrev,
    goBack: () => { /* placeholder — back navigation handled by navbar */ },
  };

  const commonProps = {
    module: activeModule,
    courseId: activeCourse.id,
    navProps,
    onOpenMap: () => setIsMapOpen(true),
    onMarkComplete,
    isCompleted: completedModules.has(activeModule.id),
  };

  const type = activeModule.type || 'practice';

  return (
    <div className="h-[calc(100vh-64px)] flex overflow-hidden relative">
      {isMapOpen && (
        <CourseMap
          course={activeCourse}
          completedModules={Array.from(completedModules)}
          currentModuleId={activeModule.id}
          onSelectModule={(moduleId) => {
            const mod = activeCourse.modules.find((m) => m.id === moduleId);
            if (mod) navigateToLearning(mod);
          }}
          onClose={() => setIsMapOpen(false)}
        />
      )}
      {type === 'video' && <VideoEssay {...commonProps} />}
      {type === 'article' && <ArticleEssay {...commonProps} />}
      {type !== 'video' && type !== 'article' && <PracticeMode key={activeModule.id} {...commonProps} />}
    </div>
  );
}
