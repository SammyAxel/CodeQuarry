import React, { useState } from 'react';
import { Gem, LogIn, Pickaxe } from 'lucide-react';

export const LoginPage = ({ onLogin }) => {
  const [username, setUsername] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username.trim()) {
      onLogin(username.trim());
    }
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
        
        <p className="text-xs text-gray-600 mt-8 font-mono">Version 1.0 • Mining Since 2024</p>
      </div>
    </div>
  );
};