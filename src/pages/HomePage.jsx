import React from 'react';
import { Zap, ChevronRight, Gem, Pickaxe } from 'lucide-react';

export const HomePage = ({ courses, onSelectCourse }) => {
  return (
    <div className="max-w-6xl mx-auto p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-12 text-center pt-10 relative">
        {/* NEW: Central glow behind the header */}
        <div className="absolute inset-x-0 -top-16 -z-10 flex justify-center">
            <div className="w-[60vw] max-w-4xl h-48 bg-purple-900/20 rounded-full blur-3xl" />
        </div>
        <h1 className="text-6xl font-black mb-4 bg-gradient-to-r from-purple-400 to-pink-500 text-transparent bg-clip-text inline-flex items-center gap-4 tracking-tighter">
          CodeQuarry <Zap className="w-12 h-12 text-purple-400 fill-current" />
        </h1>
        <p className="text-gray-400 text-xl font-medium">Dig deep. Build high.</p>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <div key={course.id} onClick={() => onSelectCourse(course)} className="bg-[#161b22] border border-gray-800 hover:border-purple-500/50 p-6 rounded-2xl cursor-pointer transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-purple-500/20 group relative overflow-hidden z-10">
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-purple-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            {/* NEW: Cave Entrance Decoration */}
            <svg className="absolute top-0 left-0 w-full h-full text-gray-900/50 opacity-20 group-hover:opacity-40 transition-opacity" fill="currentColor" viewBox="0 0 100 100" preserveAspectRatio="none"><path d="M0,0 L100,0 L100,100 L0,100 Z M50,20 C65,20 80,40 85,50 C95,70 100,80 100,100 L0,100 C0,80 5,70 15,50 C20,40 35,20 50,20 Z"></path></svg>
            <Gem className="absolute top-4 right-4 w-4 h-4 text-purple-800 group-hover:text-purple-500 transition-colors" />
            <div className="flex justify-between items-start mb-6">
              <div className="p-3 bg-gray-900 rounded-xl group-hover:bg-gray-800 transition-colors ring-1 ring-gray-800">{course.icon}</div>
              <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider bg-gray-800 rounded-full text-gray-400 border border-gray-700">{course.level}</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">{course.title}</h3>
            <p className="text-gray-400 text-sm mb-6 leading-relaxed">{course.description}</p>
            <div className="flex items-center text-purple-400 font-bold text-sm transition-transform relative mt-auto pt-4">
              <Pickaxe className="w-4 h-4 mr-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
              <span className="group-hover:translate-x-2 transition-transform duration-300">START MINING</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};