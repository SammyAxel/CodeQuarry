import React, { memo, useState, useMemo } from 'react';
import { ChevronRight, Gem, Pickaxe, Coins, Search, X, AlertCircle, Globe } from 'lucide-react';
import { sanitizeInput } from '../utils/securityUtils';
import { getCourseLanguages } from '../utils/courseTranslations';
import { useLanguage } from '../context/LanguageContext';

/**
 * Home page showing available courses
 * Displays course cards with module counts and levels
 * 
 * @component
 * @param {Object} props
 * @param {Array} props.courses - Array of course objects
 * @param {function} props.onSelectCourse - Callback when a course is selected
 * @returns {JSX.Element}
 */
const HomePage = ({ courses, onSelectCourse }) => {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');

  // Filter courses based on search query
  const filteredCourses = useMemo(() => {
    if (!searchQuery.trim()) return courses;
    
    // Sanitize search input to prevent XSS
    const sanitized = sanitizeInput(searchQuery, 100);
    const query = sanitized.toLowerCase();
    
    return courses.filter(course => 
      course.title.toLowerCase().includes(query) ||
      course.description.toLowerCase().includes(query) ||
      course.level.toLowerCase().includes(query)
    );
  }, [courses, searchQuery]);
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

      {/* Search Bar */}
      <div className="mb-12 max-w-2xl mx-auto">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="Search courses by title, topic, or level..."
            value={searchQuery}
            onChange={(e) => {
              // Sanitize input to prevent XSS attacks
              const sanitized = sanitizeInput(e.target.value, 100);
              setSearchQuery(sanitized);
            }}
            className="w-full pl-12 pr-4 py-3 bg-gray-900/50 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
        {searchQuery && (
          <p className="text-xs text-gray-500 mt-2">Found {filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''}</p>
        )}
      </div>
      
      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredCourses.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Search className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No courses found matching "{searchQuery}"</p>
            <button
              onClick={() => setSearchQuery('')}
              className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-white text-sm font-bold transition-colors"
            >
              Clear Search
            </button>
          </div>
        ) : (
          filteredCourses.map((course, idx) => (
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
            <p className="text-gray-400 text-sm mb-4 leading-relaxed relative z-10">{course.description}</p>
            
            {/* Language indicators */}
            <div className="flex gap-1.5 mb-4 relative z-10 flex-wrap">
              <span className="text-xs px-2 py-0.5 bg-green-600/20 text-green-400 rounded font-bold border border-green-600/30">
                🇬🇧 EN
              </span>
              {(() => {
                const languages = getCourseLanguages(course.id);
                const langFlags = { id: '🇮🇩', es: '🇪🇸', fr: '🇫🇷', de: '🇩🇪', ja: '🇯🇵', ko: '🇰🇷', zh: '🇨🇳' };
                return languages.map(lang => (
                  <span key={lang} className="text-xs px-2 py-0.5 bg-purple-600/20 text-purple-400 rounded font-bold border border-purple-600/30">
                    {langFlags[lang] || '🌍'} {lang.toUpperCase()}
                  </span>
                ));
              })()}
            </div>
            
            <div className="flex items-center text-purple-300 font-bold text-sm transition-all duration-300 relative mt-auto pt-4 group-hover:text-purple-200">
              <Pickaxe className="w-4 h-4 mr-2 opacity-60 -rotate-45 group-hover:opacity-100 group-hover:-translate-x-1 transition-all duration-300" />
              <span className="group-hover:translate-x-1 transition-transform duration-300">START MINING</span>
              <ChevronRight className="w-4 h-4 ml-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
            </div>
          </div>
          ))
        )}
      </div>
    </div>
  );
};

export default memo(HomePage);