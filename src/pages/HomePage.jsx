import React from 'react';
import { ChevronRight, Gem, Pickaxe, Coins } from 'lucide-react';

export const HomePage = ({ courses, onSelectCourse }) => {
  return (
    <div className="max-w-6xl mx-auto p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-16 text-center pt-10 relative">
        {/* Enhanced central glow */}
        <div className="absolute inset-x-0 -top-20 -z-10 flex justify-center">
            <div className="w-[60vw] max-w-4xl h-56 bg-purple-900/25 rounded-full blur-3xl animate-pulse" />
        </div>
        
        {/* Decorative elements */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <Pickaxe className="w-10 h-10 text-purple-400 opacity-60 -rotate-45 animate-bounce" />
          <Gem className="w-10 h-10 text-purple-400" />
          <Pickaxe className="w-10 h-10 text-purple-400 opacity-60 rotate-45 animate-bounce [animation-delay:0.3s]" />
        </div>
        
        <h1 className="text-6xl font-black mb-8 bg-gradient-to-r from-purple-300 via-purple-400 to-pink-400 text-transparent bg-clip-text py-2.5">
          CodeQuarry
        </h1>
        
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 px-6 py-3 rounded-full border border-purple-500/50 backdrop-blur-sm mb-6">
          <Gem className="w-4 h-4 text-purple-300" />
          <p className="text-gray-300 text-lg font-semibold">Dig Deep. Build High.</p>
          <Coins className="w-4 h-4 text-yellow-400 animate-spin [animation-duration:3s]" />
        </div>
        
        <p className="text-gray-400 text-sm font-mono mt-4">Mine for knowledge. Unearth your potential.</p>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {courses.map((course, idx) => (
          <div 
            key={course.id} 
            onClick={() => onSelectCourse(course)} 
            className="bg-[#161b22] border border-gray-800 hover:border-purple-500/70 p-6 rounded-2xl cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-purple-600/30 group relative overflow-hidden z-10 backdrop-blur-sm" 
            style={{animationDelay: `${idx * 0.1}s`}}
          >
            {/* Gradient overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-purple-900/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            {/* Enhanced cave entrance */}
            <svg className="absolute top-0 left-0 w-full h-full text-gray-900/40 opacity-30 group-hover:opacity-60 transition-opacity duration-300" fill="currentColor" viewBox="0 0 100 100" preserveAspectRatio="none"><path d="M0,0 L100,0 L100,100 L0,100 Z M50,20 C65,20 80,40 85,50 C95,70 100,80 100,100 L0,100 C0,80 5,70 15,50 C20,40 35,20 50,20 Z"></path></svg>
            
            {/* Gem indicator */}
            <Gem className="absolute top-4 right-4 w-5 h-5 text-purple-700 group-hover:text-purple-400 transition-all duration-300 group-hover:scale-125 group-hover:rotate-12" />
            
            <div className="flex justify-between items-start mb-6 relative z-10">
              <div className="p-3 bg-gray-900/60 rounded-xl group-hover:bg-gray-800 transition-all duration-300 ring-1 ring-gray-700 group-hover:ring-purple-500/50">
                {course.icon}
              </div>
              <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-purple-900/50 to-purple-800/50 rounded-full text-purple-300 border border-purple-700/50 group-hover:border-purple-500/70 transition-all duration-300">
                {course.level}
              </span>
            </div>
            
            <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-purple-300 group-hover:to-pink-300 group-hover:bg-clip-text transition-all duration-300 relative z-10">
              {course.title}
            </h3>
            <p className="text-gray-400 text-sm mb-6 leading-relaxed relative z-10">{course.description}</p>
            
            <div className="flex items-center text-purple-300 font-bold text-sm transition-all duration-300 relative mt-auto pt-4 group-hover:text-purple-200">
              <Pickaxe className="w-4 h-4 mr-2 opacity-60 -rotate-45 group-hover:opacity-100 group-hover:-translate-x-1 transition-all duration-300" />
              <span className="group-hover:translate-x-1 transition-transform duration-300">START MINING</span>
              <ChevronRight className="w-4 h-4 ml-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};