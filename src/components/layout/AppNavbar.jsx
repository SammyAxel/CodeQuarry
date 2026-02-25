import {
  Gem, Map as MapIcon, Pickaxe, BarChart3, User, Languages, Users, Crown, Trophy, ShoppingCart, MonitorPlay
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { VIEWS } from '../../constants/appConfig';
import { ThemeToggle } from '../ThemeToggle';
import { useApp } from '../../context/AppContext';
import { useUser } from '../../context/UserContext';
import { useLanguage } from '../../context/LanguageContext';

/**
 * Main application navbar — extracted from App.jsx for readability.
 *
 * Props:
 *  - currentPage / setCurrentPage  – which page tab is active
 *  - onEnterAdminMode              – opens the admin panel overlay
 */
export default function AppNavbar({ currentPage, setCurrentPage, onEnterAdminMode }) {
  const navigate = useNavigate();
  const { view, setIsMapOpen, navigateHome } = useApp();
  const { currentUser } = useUser();
  const { language, toggleLanguage, t } = useLanguage();

  const goHome = () => { navigateHome(); setCurrentPage('home'); navigate('/'); };

  /** Helper — returns active/inactive className for a nav button */
  const navBtnClass = (page) =>
    `flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-lg transition-all ${
      currentPage === page
        ? 'text-purple-400 bg-purple-500/20 border border-purple-500/50'
        : 'text-gray-400 hover:text-white hover:bg-white/5'
    }`;

  return (
    <nav
      className="h-20 border-b border-purple-500/20 bg-gradient-to-r from-[#0d1117] via-purple-950/20 to-[#0d1117] backdrop-blur-xl sticky top-0 z-40 px-8 flex items-center justify-between shadow-2xl shadow-black/50"
      role="navigation"
      aria-label="Main navigation"
    >
      {/* Left: Logo and Brand */}
      <div
        className="flex items-center gap-3 cursor-pointer group"
        onClick={goHome}
        role="button"
        tabIndex="0"
        onKeyDown={(e) => e.key === 'Enter' && goHome()}
        aria-label="CodeQuarry Home"
      >
        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center shadow-lg shadow-purple-500/30 group-hover:shadow-purple-400/50 transition-shadow">
          <Gem className="w-6 h-6 text-white" />
        </div>
        <div className="flex flex-col">
          <div className="font-black text-lg tracking-tight text-white group-hover:text-purple-300 transition-colors">
            CodeQuarry<span className="text-purple-400">.</span>
          </div>
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

        <button onClick={() => { navigateHome(); setCurrentPage('dashboard'); navigate('/dashboard'); }} className={navBtnClass('dashboard')} title="Dashboard">
          <BarChart3 className="w-4 h-4" /> {t('nav.dashboard')}
        </button>

        {/* Admin-only links */}
        {currentUser?.role === 'admin' && (
          <>
            <button onClick={() => { navigateHome(); setCurrentPage('users'); navigate('/admin/users'); }} className={navBtnClass('users')} title="User Management">
              <Users className="w-4 h-4" /> {t('nav.users')}
            </button>
            <button
              onClick={onEnterAdminMode}
              className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-yellow-400 hover:text-yellow-300 hover:bg-yellow-900/20 rounded-lg transition-all"
              title="Enter Admin Mode"
            >
              <Crown className="w-4 h-4" /> Admin
            </button>
          </>
        )}

        <button onClick={() => { navigateHome(); setCurrentPage('leaderboard'); navigate('/leaderboard'); }} className={navBtnClass('leaderboard')} title="Leaderboard">
          <Trophy className="w-4 h-4" /> {t('nav.leaderboard')}
        </button>

        <button onClick={() => { navigate('/bootcamp'); setCurrentPage('bootcamp'); }} className={navBtnClass('bootcamp')} title="Bootcamp">
          <MonitorPlay className="w-4 h-4" /> Bootcamp
        </button>

        <button onClick={() => { navigateHome(); setCurrentPage('shop'); navigate('/shop'); }} className={navBtnClass('shop')} title="Cosmetics Shop">
          <ShoppingCart className="w-4 h-4" /> {t('nav.shop')}
        </button>
      </div>

      {/* Right: Theme Toggle, Language, Profile */}
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

        <div className="w-px h-6 bg-gray-700/50" />

        {!currentUser && (
          <button
            onClick={onEnterAdminMode}
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-yellow-400 hover:text-yellow-300 hover:bg-yellow-900/20 rounded-lg transition-all"
            title="Enter Admin Mode"
          >
            <Crown className="w-4 h-4" /> {t('nav.admin')}
          </button>
        )}

        <button
          onClick={() => { navigateHome(); setCurrentPage('profile'); navigate('/profile'); }}
          className={navBtnClass('profile')}
          title="Profile"
        >
          <User className="w-4 h-4" />
          <span className="max-w-[120px] truncate">{currentUser?.displayName || currentUser?.username || 'User'}</span>
        </button>
      </div>
    </nav>
  );
}
