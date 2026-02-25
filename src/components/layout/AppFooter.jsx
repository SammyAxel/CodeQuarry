import { useNavigate } from 'react-router-dom';
import { useThemeContext } from '../../context/ThemeContext';

/**
 * Site footer + the sarcastic light-mode banner.
 * Props:
 *  - currentPage / setCurrentPage
 */
export default function AppFooter({ currentPage, setCurrentPage }) {
  const navigate = useNavigate();
  const { isDark } = useThemeContext();

  return (
    <>
      {/* Site Footer — always visible on home-level views */}
      {currentPage !== 'terms' && (
        <footer className="border-t border-gray-800/60 bg-[#0d1117] py-6 px-8">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-600">
            <span>© {new Date().getFullYear()} CodeQuarry. All rights reserved.</span>
            <div className="flex items-center gap-4">
              <button
                onClick={() => { setCurrentPage('terms'); navigate('/terms'); }}
                className="hover:text-purple-400 transition-colors"
              >
                Syarat &amp; Ketentuan / Terms &amp; Conditions
              </button>
              <a href="mailto:codequarry.sammy@gmail.com" className="hover:text-purple-400 transition-colors">Contact</a>
            </div>
          </div>
        </footer>
      )}

      {/* Sarcastic Light Mode Footer */}
      {!isDark && (
        <div className="fixed bottom-0 left-0 right-0 bg-yellow-50 border-t-2 border-yellow-400 px-4 py-3 text-center text-sm text-gray-800 z-50 shadow-xl">
          <span className="font-mono font-bold">⚠️ Warning: You&apos;re using light mode. Your retinas called - they want their melanin back.</span>
          <br />
          <span className="text-xs text-gray-600 mt-1">Pro tip: Toggle dark mode to unlock the premium UI experience™</span>
        </div>
      )}
    </>
  );
}
