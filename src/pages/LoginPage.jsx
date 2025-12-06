import React, { useState } from 'react';
import { Gem, LogIn, Pickaxe, Lock, X } from 'lucide-react';

export const LoginPage = ({ onLogin, onAdminLogin }) => {
  const [username, setUsername] = useState('');
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [adminError, setAdminError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username.trim()) {
      onLogin(username.trim());
    }
  };

  const handleAdminSubmit = (e) => {
    e.preventDefault();
    let role = null;
    
    if (adminPassword === 'GemMiner') {
      role = 'admin';
    } else if (adminPassword === 'GemGoblin') {
      role = 'mod';
    } else {
      setAdminError('Invalid password');
      setAdminPassword('');
      return;
    }
    
    setShowAdminModal(false);
    setAdminPassword('');
    setAdminError('');
    onAdminLogin(role);
  };

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-[#0d1117] bg-[url('/noise.png')] p-4 relative overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-purple-900/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-900/10 rounded-full blur-3xl animate-pulse [animation-delay:1s]" />
      </div>
      
      <div className="w-full max-w-sm text-center relative z-10">
        <div className="mb-8 relative inline-block">
          <div className="absolute inset-0 bg-purple-500/20 rounded-2xl blur-xl animate-pulse"></div>
          <div className="relative bg-gradient-to-br from-purple-900/50 to-purple-950/50 p-4 rounded-2xl border border-purple-500/30 backdrop-blur-sm">
            <div className="flex items-center justify-center gap-3">
              <Pickaxe className="w-8 h-8 text-purple-400 opacity-60 -rotate-45 animate-bounce [animation-duration:2s]" />
              <Gem className="w-10 h-10 text-purple-400" />
              <Pickaxe className="w-8 h-8 text-purple-400 opacity-60 rotate-45 animate-bounce [animation-duration:2s] [animation-delay:0.3s]" />
            </div>
          </div>
        </div>
        
        <h1 className="text-6xl font-black text-white mb-2 tracking-tighter bg-gradient-to-r from-purple-300 via-purple-400 to-pink-400 bg-clip-text text-transparent">CodeQuarry</h1>
        <p className="text-gray-400 mb-2 text-lg font-semibold">Dig Deep. Code High.</p>
        <div className="h-1 w-24 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mx-auto mb-8"></div>
        
        <p className="text-gray-400 mb-10 text-sm">Enter your username to begin your mining expedition.</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input 
              type="text" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              placeholder="Username" 
              className="w-full px-5 py-4 text-purple-300 placeholder-gray-600 bg-[#161b22] border border-gray-700 hover:border-purple-500/50 focus:border-purple-500 rounded-xl text-center text-lg font-medium focus:ring-2 focus:ring-purple-500/50 outline-none transition-all duration-300 backdrop-blur-sm" 
            />
            {username && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
              </div>
            )}
          </div>
          
          <button 
            type="submit" 
            className="w-full py-4 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:shadow-none group"
            disabled={!username.trim()}
          >
            <LogIn className="w-5 h-5 group-hover:translate-x-1 transition-transform" /> 
            Start Mining
          </button>
        </form>

        {/* Admin Login Button */}
        <button
          onClick={() => setShowAdminModal(true)}
          className="mt-6 text-xs text-gray-600 hover:text-gray-400 transition-colors flex items-center justify-center gap-1 mx-auto"
        >
          <Lock className="w-3 h-3" /> Admin Portal
        </button>
        
        <p className="text-xs text-gray-600 mt-8 font-mono">Version 1.0 • Mining Since 2025</p>
      </div>

      {/* Admin Login Modal */}
      {showAdminModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0d1117] border border-purple-500/50 rounded-xl p-8 max-w-sm w-full relative">
            <button
              onClick={() => {
                setShowAdminModal(false);
                setAdminPassword('');
                setAdminError('');
              }}
              className="absolute top-4 right-4 p-1 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>

            <div className="flex items-center justify-center gap-2 mb-6">
              <Lock className="w-6 h-6 text-yellow-500" />
              <h2 className="text-2xl font-black text-white">Admin Access</h2>
            </div>

            <p className="text-gray-400 text-sm mb-6">Enter the admin password to access the course management system.</p>

            <form onSubmit={handleAdminSubmit} className="space-y-4">
              <div>
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => {
                    setAdminPassword(e.target.value);
                    setAdminError('');
                  }}
                  placeholder="Admin Password"
                  autoFocus
                  className="w-full px-4 py-2 bg-[#161b22] border border-gray-700 focus:border-yellow-500 rounded-lg text-white text-center focus:ring-2 focus:ring-yellow-500/50 outline-none transition-all"
                />
              </div>

              {adminError && (
                <p className="text-red-400 text-sm text-center">{adminError}</p>
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAdminModal(false);
                    setAdminPassword('');
                    setAdminError('');
                  }}
                  className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-yellow-600 hover:bg-yellow-500 text-white rounded-lg font-bold transition-colors flex items-center justify-center gap-2"
                >
                  <Lock className="w-4 h-4" /> Access
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};