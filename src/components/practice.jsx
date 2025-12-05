import React, { useState, useRef, useEffect } from 'react'; 
import { 
  Trophy, ChevronRight, PanelLeftOpen, Code2, RotateCcw,
  Play, PanelLeftClose, BookOpen, FileCode, AlertCircle, Gem, CheckCircle2,
  Terminal, Map as MapIcon, Trash2, Loader2, RefreshCw
} from 'lucide-react'; 

import NavigationControls from './NavControl'; 
import { CodeEditor } from './CodeEditor';
import { MarkdownRenderer } from './MarkdownRenderer';
import { useCodeEngine } from '../hooks/useCodeEngine';

export const PracticeMode = ({ module, navProps, onOpenMap, onMarkComplete, isCompleted, savedCode }) => { 
  const [code, setCode] = useState(savedCode || module.initialCode || '');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [syntaxError, setSyntaxError] = useState(null);

  const { output, setOutput, isEngineLoading, engineError, runCode, initializeEngines } = useCodeEngine(module);

  // Sync state on module change
  useEffect(() => {
    setCode(savedCode || module.initialCode || '');
    setOutput(['> Terminal ready...']);
    setShowSuccessModal(false);
    setSyntaxError(null);
  }, [module.id]);
  
  const handleRunCode = async () => {
    setSyntaxError(null);

    // First, perform a simple client-side syntax check if required
    if (module.requiredSyntax && !module.requiredSyntax.test(code)) {
      setSyntaxError("Check your syntax! Are you following the instructions?");
    }

    // Execute the code using the hook
    const { success } = await runCode(code);

    if (success) {
      setShowSuccessModal(true);
      // No need to call markComplete here anymore, it's handled by the modal button
      // to ensure state is updated before navigation.
    }
  }

  const scrollStyle = "[&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-800 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-gray-700";

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#0d1117] relative bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))]">
       {/* Success Modal */}
       {showSuccessModal && (
          <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-200 p-4">
            {/* Thematic "Gem" Modal */}
            <div className="bg-gradient-to-br from-[#1a1f2c] to-[#0d1117] border border-purple-500/30 p-8 rounded-3xl shadow-2xl shadow-purple-900/50 max-w-md w-full text-center relative overflow-hidden">
              <div className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] bg-[radial-gradient(circle_at_center,_rgba(168,85,247,0.15)_0%,_rgba(168,85,247,0)_50%)] animate-spin [animation-duration:6s]"></div>
              <div className="relative">
                <div className="mx-auto w-20 h-20 bg-purple-500/10 rounded-full flex items-center justify-center mb-6 ring-2 ring-purple-500/30">
                  <Trophy className="w-10 h-10 text-purple-300" />
                </div>
                <h2 className="text-3xl font-black text-white mb-2 tracking-tight">Gem Unearthed!</h2>
                <p className="text-purple-300/80 mb-8">This piece of code is flawless. Well done.</p>
                <div className="flex flex-col gap-3 mt-8">
                  <button onClick={() => {
                      if (onMarkComplete) {
                        onMarkComplete(code);
                        navProps.onNext();
                      } else { navProps.onNext(); }
                    }}
                    className="w-full py-4 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all duration-300 transform hover:scale-105"
                  >Mine Next Vein <ChevronRight className="w-5 h-5" /></button>
                  <button onClick={() => setShowSuccessModal(false)} className="w-full py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium rounded-xl">Polish This Gem</button>
                </div>
              </div>
            </div>
          </div>
       )}
      
       {/* Toolbar */}
       <div className="h-16 bg-[#0d1117]/80 backdrop-blur-sm border-b border-white/5 flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-3">
           <div className="w-8 h-8 rounded-lg bg-purple-900/50 flex items-center justify-center text-purple-300 ring-1 ring-inset ring-purple-500/20">
              <Gem className="w-4 h-4" />
           </div>
           <div>
             <div className="text-xs text-gray-500 font-bold uppercase tracking-wider">Editor</div>
             <div className="text-sm font-mono text-gray-300">main.{module.language === 'c' ? 'c' : module.language === 'python' ? 'py' : 'js'}</div>
           </div>
        </div>

        <div className="flex items-center gap-4">
          {isCompleted && (
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 bg-emerald-900/50 px-3 py-1.5 rounded-full"><CheckCircle2 className="w-4 h-4" /> Completed</div>
          )}
          <NavigationControls {...navProps} dark />
        </div>

        <div className="flex items-center gap-3">
           {isEngineLoading && <span className="text-xs text-yellow-500 flex gap-2"><Loader2 className="w-3 h-3 animate-spin"/> Loading...</span>}
           {engineError && <button onClick={initializeEngines} className="text-red-400 hover:text-red-300 p-2"><RefreshCw className="w-4 h-4" /></button>}
           <button onClick={() => setCode(module.initialCode)} className="p-2 text-gray-400 hover:text-white"><RotateCcw className="w-4 h-4" /></button>
           <button 
             onClick={handleRunCode} 
             disabled={isEngineLoading && (module.language === 'python' || module.language === 'c')}
             className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-green-900/20 active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
           >
             <Play className="w-4 h-4 fill-current" /> Run Code
           </button>
        </div>
      </div>

      <div className="flex-1 flex h-full overflow-hidden">
         {/* NEW: Action Bar (thin sidebar for icons) */}
         <div className="w-16 bg-[#010409] border-r border-gray-800 flex flex-col items-center py-6 gap-6 shrink-0">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors" title={isSidebarOpen ? "Close Sidebar" : "Open Sidebar"}>
                {isSidebarOpen ? <PanelLeftClose className="w-5 h-5" /> : <PanelLeftOpen className="w-5 h-5" />}
            </button>
            <button onClick={onOpenMap} className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-purple-400 transition-colors" title="Open Map">
                <MapIcon className="w-5 h-5" />
            </button>
         </div>

         <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
         {/* Sidebar Instructions */}
         <div className={`${isSidebarOpen ? 'w-full lg:w-[400px] border-r' : 'w-0 border-r-0'} bg-[#010409] border-gray-800 flex flex-col transition-all duration-300 ease-out relative shrink-0 z-20 overflow-hidden`}>
            
            {/* Header for Buttons */}
            <div className="flex items-center justify-between p-4 border-b border-gray-800/50 bg-[#010409] shrink-0">
                <div className="flex items-center gap-2 text-purple-400 font-bold uppercase text-xs tracking-widest"><BookOpen className="w-4 h-4" /> Field Guide</div>
            </div> 

            {/* Instruction Content */}
            <div className={`p-6 overflow-y-auto ${scrollStyle}`}>
                {/* USE NEW RENDERER */}
                <div className="mb-8">
                   <MarkdownRenderer text={module.theory} />
                </div>

                <div className="h-px bg-gray-800 w-full mb-8"></div>
                <div className="flex items-center gap-2 text-blue-400 font-bold uppercase text-xs tracking-widest mb-3"><FileCode className="w-4 h-4" /> Bounty</div>
                <p className="text-white text-lg font-medium leading-relaxed mb-4">{module.instruction}</p>
                {syntaxError && <div className="bg-red-500/10 border border-red-500/50 p-4 rounded-xl flex gap-3 animate-pulse"><AlertCircle className="w-5 h-5 text-red-400 shrink-0" /><p className="text-red-300 text-sm">{syntaxError}</p></div>}
            </div>
         </div>
         
         {/* Code Editor Area */}
         <div className="flex-1 bg-[#0d1117] h-full border-r border-gray-800 flex flex-col">
             <CodeEditor code={code} setCode={setCode} language={module.language} />
         </div> 

         {/* Terminal Output */}
         <div className="h-48 lg:h-auto lg:w-[30%] bg-[#010409] flex flex-col font-mono text-sm shrink-0 border-t lg:border-t-0">
           <div className="px-5 py-3 bg-[#0d1117] border-b border-gray-800 text-gray-500 text-xs font-bold uppercase tracking-wider flex items-center justify-between">
              <div className="flex items-center gap-2"><Terminal className="w-3 h-3" /> Output</div>
              <button onClick={() => setOutput(['> Terminal ready...'])} className="hover:text-red-400 transition-colors" title="Clear Console"><Trash2 className="w-3 h-3" /></button>
           </div>
           <div className={`flex-1 p-5 overflow-y-auto space-y-2 font-mono scrollbar-thin scrollbar-thumb-gray-800 ${scrollStyle}`}>
             {output.map((line, i) => (
               <div key={i} className={line.includes('ERROR') || line.includes('FAILED') ? 'text-red-400' : line.includes('PASSED') ? 'text-emerald-400' : 'text-gray-300'}>
                 {line}
               </div>
             ))}
             <div className="animate-pulse text-purple-500 mt-2">_</div>
           </div>
         </div>
         </div>
      </div>
    </div>
  );
};