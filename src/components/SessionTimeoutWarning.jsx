import React from 'react';
import { AlertCircle, Clock } from 'lucide-react';
import { useUser } from '../context/UserContext';

/**
 * Session Timeout Warning Modal
 * Shows when user is about to be logged out due to inactivity
 * Allows user to extend session or logout now
 */
export const SessionTimeoutWarning = () => {
  const { showTimeoutWarning, getRemainingSessionTime, extendSession, logout } = useUser();

  if (!showTimeoutWarning) return null;

  const remainingSeconds = getRemainingSessionTime();
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#0d1117] border border-yellow-600/50 rounded-lg p-6 max-w-sm w-full">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-yellow-600/20 rounded-lg">
            <Clock className="w-6 h-6 text-yellow-400" />
          </div>
          <h2 className="text-xl font-bold text-white">Session Expiring Soon</h2>
        </div>

        <p className="text-gray-300 mb-2">
          Your session will expire due to inactivity in{' '}
          <span className="font-bold text-yellow-400">
            {minutes}:{seconds.toString().padStart(2, '0')}
          </span>
        </p>
        <p className="text-sm text-gray-400 mb-6">
          Click "Continue Session" to stay logged in, or "Logout" to exit now.
        </p>

        <div className="flex gap-3">
          <button
            onClick={() => logout('user_initiated')}
            className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded font-bold transition-colors"
          >
            Logout
          </button>
          <button
            onClick={extendSession}
            className="flex-1 px-4 py-2 bg-yellow-600 hover:bg-yellow-500 text-white rounded font-bold transition-colors flex items-center justify-center gap-2"
          >
            <Clock className="w-4 h-4" />
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};
