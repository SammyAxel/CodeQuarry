import React, { useState } from 'react';
import { Zap, LogIn } from 'lucide-react';

export const LoginPage = ({ onLogin }) => {
  const [username, setUsername] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username.trim()) {
      onLogin(username.trim());
    }
  };

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-[#0d1117] bg-[url('/noise.png')] p-4">
      <div className="w-full max-w-sm text-center">
        <div className="absolute inset-0 -z-10 flex items-center justify-center">
            <div className="w-[80vw] max-w-lg h-64 bg-purple-900/20 rounded-full blur-3xl" />
        </div>
        <Zap className="w-16 h-16 text-purple-500 fill-current mx-auto mb-6" />
        <h1 className="text-5xl font-black text-white mb-2 tracking-tighter">Welcome to CodeQuarry</h1>
        <p className="text-gray-400 mb-10">Enter your username to begin your expedition.</p>
        <form onSubmit={handleSubmit}>
          <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" className="w-full px-5 py-4 text-purple-600 bg-[#161b22] border border-gray-700 rounded-xl text-center text-lg font-medium focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition" />
          <button type="submit" className="w-full mt-4 py-4 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed" disabled={!username.trim()}><LogIn className="w-5 h-5" /> Sign In</button>
        </form>
      </div>
    </div>
  );
};