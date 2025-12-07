import React, { useState, useRef, useEffect } from 'react'; 
import { 
  Trophy, ChevronRight, ChevronLeft, PanelLeftOpen, Code2, RotateCcw,
  Play, PanelLeftClose, BookOpen, FileCode, AlertCircle, Gem, CheckCircle2,
  Terminal, Map as MapIcon, Trash2, Loader2, RefreshCw, Lightbulb
} from 'lucide-react'; 

import NavigationControls from './NavControl'; 
import { CodeEditor } from './CodeEditor';
import { MarkdownRenderer } from './MarkdownRenderer';
import { useCodeEngine } from '../hooks/useCodeEngine';
import { getSavedCode, saveModuleProgress } from '../utils/userApi';

export const PracticeMode = ({ module, courseId, navProps, onOpenMap, onMarkComplete, isCompleted }) => { 
  const [code, setCode] = useState(module.initialCode || '');
  const [isLoadingCode, setIsLoadingCode] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [syntaxError, setSyntaxError] = useState(null);
  const [activeTab, setActiveTab] = useState('theory');
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [revealedHints, setRevealedHints] = useState(0);
  const [hasUserModifiedCode, setHasUserModifiedCode] = useState(false);

  const { output, setOutput, isEngineLoading, engineError, runCode, initializeEngines } = useCodeEngine(module);

  // Parse steps from instruction text
  const parseSteps = (instruction) => {
    if (!instruction) return [];
    const stepMatches = instruction.match(/Step \d+:[^]*?(?=Step \d+:|$)/g);
    return (stepMatches || []).map(step => step.replace('Step ', '').trim());
  };

  const steps = parseSteps(module.instruction);

  // Track when user modifies the code with auto-save
  const saveTimeoutRef = useRef(null);
  
  const handleCodeChange = (newCode) => {
    setCode(newCode);
    if (!hasUserModifiedCode) {
      setHasUserModifiedCode(true);
    }
    
    // Debounced auto-save (save after 2 seconds of no typing)
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(() => {
      saveModuleProgress(courseId, module.id, { savedCode: newCode });
    }, 2000);
  };
  
  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // Update steps whenever code changes
  // Only show errors AFTER user has modified the code
  useEffect(() => {
    if (steps.length === 0) return;
    
    // Don't check until user has made changes
    if (!hasUserModifiedCode) return;
    
    setCompletedSteps(prev => {
      const updated = new Set(prev);

      // NEW: Check step requirements (simple string contains)
      if (module.stepRequirements && module.stepRequirements.length > 0) {
        module.stepRequirements.forEach((requirements, idx) => {
          if (!requirements || requirements.length === 0) {
            // No requirements for this step - don't auto-complete
            return;
          }
          // Check if ALL requirements for this step are met
          const allMet = requirements.every(req => 
            req && code.includes(req.trim())
          );
          if (allMet) {
            updated.add(idx);
          } else {
            updated.delete(idx);
          }
        });
        return updated;
      }
      
      // NEW: Check overall required code snippets
      if (module.requiredCode && module.requiredCode.length > 0) {
        const allMet = module.requiredCode.every(req => 
          code.includes(req.trim())
        );
        if (allMet) {
          // Mark all steps as complete when all required code is present
          steps.forEach((_, idx) => updated.add(idx));
        } else {
          updated.clear();
        }
        return updated;
      }

      // LEGACY: Check per-step regex syntax if available
      if (module.stepSyntax && module.stepSyntax.length > 0) {
        module.stepSyntax.forEach((stepRegex, idx) => {
          if (stepRegex && stepRegex.test(code)) {
            updated.add(idx);
          } else {
            updated.delete(idx);
          }
        });
        return updated;
      }
      
      // LEGACY: Check overall regex syntax
      if (module.requiredSyntax) {
        const isValid = module.requiredSyntax.test(code);
        if (isValid) {
          steps.forEach((_, idx) => updated.add(idx));
        } else {
          updated.clear();
        }
        return updated;
      }

      return updated;
    });
    
    // Clear syntax error when using new format (no regex errors)
    setSyntaxError(null);
  }, [code, module.requiredCode, module.stepRequirements, module.requiredSyntax, module.stepSyntax, steps.length, hasUserModifiedCode]);

  // Sync state on module change and load saved code
  useEffect(() => {
    const loadSavedCode = async () => {
      setIsLoadingCode(true);
      try {
        const saved = await getSavedCode(courseId, module.id);
        setCode(saved || module.initialCode || '');
      } catch (err) {
        console.log('No saved code found, using initial');
        setCode(module.initialCode || '');
      } finally {
        setIsLoadingCode(false);
      }
    };
    
    loadSavedCode();
    setOutput(['> Terminal ready...']);
    setShowSuccessModal(false);
    setSyntaxError(null);
    setCompletedSteps(new Set());
    setRevealedHints(0);
    setHasUserModifiedCode(false);
  }, [module.id, courseId, setOutput]);
  
  const handleRunCode = async () => {
    const newCompletedSteps = new Set(completedSteps);
    let hasSyntaxError = false;

    // NEW: Check step requirements (simple string contains)
    if (module.stepRequirements && module.stepRequirements.length > 0) {
      module.stepRequirements.forEach((requirements, idx) => {
        if (!requirements || requirements.length === 0) return;
        const allMet = requirements.every(req => 
          req && code.includes(req.trim())
        );
        if (allMet) {
          newCompletedSteps.add(idx);
        } else {
          newCompletedSteps.delete(idx);
          if (idx === 0) hasSyntaxError = true;
        }
      });
      if (hasSyntaxError) {
        setSyntaxError("Check your syntax! Are you following the instructions?");
      } else {
        setSyntaxError(null);
      }
    } 
    // NEW: Check overall required code snippets
    else if (module.requiredCode && module.requiredCode.length > 0) {
      const allMet = module.requiredCode.every(req => 
        code.includes(req.trim())
      );
      if (allMet) {
        setSyntaxError(null);
        steps.forEach((_, idx) => newCompletedSteps.add(idx));
      } else {
        setSyntaxError("Check your syntax! Are you following the instructions?");
        hasSyntaxError = true;
        newCompletedSteps.clear();
      }
    }
    // LEGACY: Check per-step regex syntax
    else if (module.stepSyntax && module.stepSyntax.length > 0) {
      module.stepSyntax.forEach((stepRegex, idx) => {
        if (stepRegex && stepRegex.test(code)) {
          newCompletedSteps.add(idx);
        } else {
          newCompletedSteps.delete(idx);
          if (idx === 0) hasSyntaxError = true;
        }
      });
      if (hasSyntaxError) {
        setSyntaxError("Check your syntax! Are you following the instructions?");
      } else {
        setSyntaxError(null);
      }
    } 
    // LEGACY: Check overall regex syntax
    else if (module.requiredSyntax) {
      if (module.requiredSyntax.test(code)) {
        setSyntaxError(null);
        if (steps.length > 0) {
          newCompletedSteps.add(0);
        }
      } else {
        setSyntaxError("Check your syntax! Are you following the instructions?");
        hasSyntaxError = true;
        newCompletedSteps.delete(0);
      }
    }

    // Mark step 2 complete if code executes without errors
    if (steps.length > 1 && !hasSyntaxError) {
      newCompletedSteps.add(1);
    }

    // Execute the code - only show validation messages if syntax is correct
    const { success } = await runCode(code, !hasSyntaxError);

    // Mark step 3 complete if output matches
    if (success && steps.length > 2) {
      newCompletedSteps.add(2);
    } else if (!success && steps.length > 2) {
      newCompletedSteps.delete(2);
    }

    setCompletedSteps(newCompletedSteps);

    // Only show success modal if ALL steps are complete
    if (success && !hasSyntaxError) {
      setShowSuccessModal(true);
    }
  }

  // Keyboard shortcuts: Ctrl+Enter to run, Esc to go back
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl+Enter or Cmd+Enter to run code
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleRunCode();
      }
      // Esc to go back
      if (e.key === 'Escape') {
        e.preventDefault();
        navProps.goBack?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleRunCode, navProps]);

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
           <button 
             onClick={navProps.goBack} 
             className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors" 
             title="Back to Syllabus (Esc)"
           >
             <ChevronLeft className="w-5 h-5" />
           </button>
           <div className="w-8 h-8 rounded-lg bg-purple-900/50 flex items-center justify-center text-purple-300 ring-1 ring-inset ring-purple-500/20">
              <Gem className="w-4 h-4" />
           </div>
           <div>
             <div className="text-xs text-gray-500 font-bold uppercase tracking-wider">Editor</div>
             <div className="text-sm font-mono text-gray-300">main.{module.language === 'c' ? 'c' : module.language === 'python' ? 'py' : 'js'}</div>
             {module.estimatedTime && (
               <div className="text-xs text-gray-500 mt-1">⏱️ ~{module.estimatedTime} min</div>
             )}
           </div>
        </div>

        <div className="flex items-center gap-4">
          {module.difficulty && (
            <div className={`flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-full ${
              module.difficulty === 'easy' ? 'bg-green-900/50 text-green-400' :
              module.difficulty === 'medium' ? 'bg-yellow-900/50 text-yellow-400' :
              'bg-red-900/50 text-red-400'
            }`}>
              {module.difficulty === 'easy' ? '🟢' : module.difficulty === 'medium' ? '🟡' : '🔴'} {module.difficulty.charAt(0).toUpperCase() + module.difficulty.slice(1)}
            </div>
          )}
          {isCompleted && (
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 bg-emerald-900/50 px-3 py-1.5 rounded-full"><CheckCircle2 className="w-4 h-4" /> Completed</div>
          )}
          <NavigationControls {...navProps} dark />
        </div>

        <div className="flex items-center gap-3">
           {isEngineLoading && <span className="text-xs text-yellow-500 flex gap-2"><Loader2 className="w-3 h-3 animate-spin"/> Loading...</span>}
           {engineError && <button onClick={initializeEngines} className="text-red-400 hover:text-red-300 p-2"><RefreshCw className="w-4 h-4" /></button>}
           <button onClick={() => { setCode(module.initialCode); setHasUserModifiedCode(false); setSyntaxError(null); setCompletedSteps(new Set()); }} className="p-2 text-gray-400 hover:text-white"><RotateCcw className="w-4 h-4" /></button>
           <button 
             onClick={handleRunCode} 
             disabled={isEngineLoading && (module.language === 'python' || module.language === 'c')}
             title="Run Code (Ctrl+Enter)"
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

            {/* Tabs */}
            <div className="flex items-center gap-1 px-4 py-2 border-b border-gray-800/50 shrink-0 bg-[#010409]">
              <button
                onClick={() => setActiveTab('theory')}
                className={`p-2 rounded transition-colors ${activeTab === 'theory' ? 'bg-purple-600/40 text-purple-300' : 'text-gray-400 hover:text-white'}`}
                title="Field Guide"
              >
                <BookOpen className="w-4 h-4" />
              </button>
              <button
                onClick={() => setActiveTab('tasks')}
                className={`p-2 rounded transition-colors ${activeTab === 'tasks' ? 'bg-blue-600/40 text-blue-300' : 'text-gray-400 hover:text-white'}`}
                title="Bounty"
              >
                <FileCode className="w-4 h-4" />
              </button>
            </div>

            {/* Instruction Content */}
            <div className={`p-6 overflow-y-auto flex-1 ${scrollStyle}`}>
                {/* Field Guide Tab */}
                {activeTab === 'theory' && (
                  <div className="mb-8">
                    <h3 className="text-purple-400 font-bold uppercase text-xs tracking-widest mb-4 flex items-center gap-2"><BookOpen className="w-4 h-4" /> Field Guide</h3>
                    <MarkdownRenderer text={module.theory} />
                  </div>
                )}

                {/* Bounty Tab */}
                {activeTab === 'tasks' && (
                  <>
                    <div className="flex items-center gap-2 text-blue-400 font-bold uppercase text-xs tracking-widest mb-4"><FileCode className="w-4 h-4" /> Bounty</div>
                    
                    {/* Steps Display */}
                    {steps.length > 0 ? (
                      <div className="space-y-3">
                        {steps.map((step, idx) => (
                          <div 
                            key={idx}
                            className={`p-3 rounded-lg transition-all ${
                              completedSteps.has(idx)
                                ? 'bg-emerald-500/20 border border-emerald-500/50'
                                : 'bg-gray-800/50 border border-gray-700/50'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mt-0.5 ${
                                completedSteps.has(idx)
                                  ? 'bg-emerald-500 text-white'
                                  : 'bg-gray-600 text-gray-300'
                              }`}>
                                {completedSteps.has(idx) ? '✓' : idx + 1}
                              </div>
                              <p className={`text-sm leading-relaxed flex-1 ${
                                completedSteps.has(idx)
                                  ? 'text-emerald-300 line-through opacity-75'
                                  : 'text-gray-300'
                              }`}>
                                {step.split(':').slice(1).join(':').trim()}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-white text-sm font-medium leading-relaxed">{module.instruction}</p>
                    )}

                    {syntaxError && <div className="bg-red-500/10 border border-red-500/50 p-3 rounded-lg flex gap-3 animate-pulse mt-4"><AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" /><p className="text-red-300 text-xs">{syntaxError}</p></div>}

                    {/* Hints Section */}
                    {module.hints && module.hints.length > 0 && (
                      <div className="mt-6 pt-6 border-t border-gray-700">
                        <div className="flex items-center gap-2 text-yellow-400 font-bold uppercase text-xs tracking-widest mb-3">
                          <Lightbulb className="w-4 h-4" /> Hints
                        </div>
                        <div className="space-y-2">
                          {/* Hint Buttons */}
                          <div className="flex flex-wrap gap-2">
                            {module.hints.map((_, idx) => (
                              <button
                                key={idx}
                                onClick={() => setRevealedHints(idx + 1)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                  revealedHints > idx
                                    ? 'bg-yellow-500/30 border border-yellow-500/50 text-yellow-300'
                                    : 'bg-gray-800 border border-gray-700 text-gray-400 hover:border-gray-600'
                                }`}
                              >
                                Hint {idx + 1}
                              </button>
                            ))}
                            {module.solution && (
                              <button
                                onClick={() => setRevealedHints(module.hints.length + 1)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                  revealedHints > module.hints.length
                                    ? 'bg-purple-500/30 border border-purple-500/50 text-purple-300'
                                    : 'bg-gray-800 border border-gray-700 text-gray-400 hover:border-gray-600'
                                }`}
                              >
                                Solution
                              </button>
                            )}
                          </div>

                          {/* Revealed Hints */}
                          {revealedHints > 0 && (
                            <div className="mt-4 space-y-3 animate-in fade-in duration-300">
                              {module.hints.slice(0, revealedHints).map((hint, idx) => (
                                <div
                                  key={idx}
                                  className="bg-yellow-500/10 border border-yellow-500/30 p-3 rounded-lg"
                                >
                                  <p className="text-xs font-bold text-yellow-300 mb-1">Hint {idx + 1}</p>
                                  <p className="text-sm text-yellow-100/80">{hint}</p>
                                </div>
                              ))}
                              {revealedHints > module.hints.length && module.solution && (
                                <div className="bg-purple-500/10 border border-purple-500/30 p-3 rounded-lg">
                                  <p className="text-xs font-bold text-purple-300 mb-1">Solution</p>
                                  <pre className="text-sm text-purple-100/80 bg-black/30 p-2 rounded overflow-x-auto">
                                    <code>{module.solution}</code>
                                  </pre>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                )}
            </div>
         </div>
         
         {/* Code Editor Area */}
         <div className="flex-1 bg-[#0d1117] h-full border-r border-gray-800 flex flex-col">
             <CodeEditor code={code} setCode={handleCodeChange} language={module.language} />
         </div> 

         {/* Terminal Output */}
         <div className="h-48 lg:h-auto lg:w-[30%] bg-[#010409] flex flex-col font-mono text-sm shrink-0 border-t lg:border-t-0">
           <div className="px-5 py-3 bg-[#0d1117] border-b border-gray-800 text-gray-500 text-xs font-bold uppercase tracking-wider flex items-center justify-between">
              <div className="flex items-center gap-2"><Terminal className="w-3 h-3" /> Output</div>
              <button onClick={() => setOutput(['> Terminal ready...'])} className="hover:text-red-400 transition-colors" title="Clear Console"><Trash2 className="w-3 h-3" /></button>
           </div>
           <div className={`flex-1 p-5 overflow-y-auto space-y-2 font-mono scrollbar-thin scrollbar-thumb-gray-800 ${scrollStyle}`}>
             {syntaxError && <div className="flex items-start gap-2 mb-4 bg-red-500/10 border border-red-500/50 p-3 rounded-lg"><AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5 animate-pulse" /><p className="text-red-300 text-xs">{syntaxError}</p></div>}
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