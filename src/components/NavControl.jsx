import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const NavigationControls = ({ currentIndex, total, onNext, onPrev, dark = false }) => {
  return (
    <div className={`flex items-center gap-2 ${dark ? 'text-gray-400' : 'text-gray-500'}`}>
      <button 
        onClick={onPrev}
        disabled={currentIndex === 0}
        className="p-2 hover:bg-white/10 rounded-lg disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
        title="Previous Lesson"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <span className="text-xs font-mono font-bold mx-2 min-w-[3rem] text-center">
        {currentIndex + 1} / {total}
      </span>

      <button 
        onClick={onNext}
        disabled={currentIndex === total - 1}
        className="p-2 hover:bg-white/10 rounded-lg disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
        title="Next Lesson"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
};

export default NavigationControls;