import React, { useState, useRef, useEffect } from 'react'; 
import { 
  Cpu, 
  Trophy, 
  ChevronRight, 
  PanelLeftOpen, 
  Code2, 
  RotateCcw, 
  Play, 
  PanelLeftClose, 
  BookOpen, 
  FileCode, 
  AlertCircle, 
  Terminal,
  Map as MapIcon,
  Trash2,
  Loader2,
  RefreshCw // <--- Added for manual retry
} from 'lucide-react'; 

import NavigationControls from './navigation-control'; 

export const PracticeMode = ({ module, navProps, onOpenMap }) => { 
  const [code, setCode] = useState(module.initialCode || '');
  const [output, setOutput] = useState(['> Terminal ready...']);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [syntaxError, setSyntaxError] = useState(null);
  
  // Engine States
  const [isEngineLoading, setIsEngineLoading] = useState(false);
  const [engineError, setEngineError] = useState(false); // Track specific engine failures
  const pyodideRef = useRef(null);

  // Refs for scroll syncing
  const textareaRef = useRef(null);
  const lineNumbersRef = useRef(null);

  // --- HELPER: Load Script with Fallback ---
  const loadScript = (src, fallbackSrc, globalCheck) => {
    return new Promise((resolve, reject) => {
      // If already loaded globally
      if (window[globalCheck]) {
        resolve();
        return;
      }
      
      // If script tag exists but not loaded, wait for it
      if (document.querySelector(`script[src*="${src.split('/').pop()}"]`)) {
         const checkInterval = setInterval(() => {
            if (window[globalCheck]) {
               clearInterval(checkInterval);
               resolve();
            }
         }, 500);
         // Timeout after 10s
         setTimeout(() => { clearInterval(checkInterval); }, 10000); 
         return;
      }

      // Try Main Source
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      
      script.onload = () => resolve();
      
      script.onerror = () => {
        // Try Fallback
        if (fallbackSrc) {
           console.warn(`Failed to load ${src}, trying fallback...`);
           const fallback = document.createElement('script');
           fallback.src = fallbackSrc;
           fallback.async = true;
           fallback.onload = () => resolve();
           fallback.onerror = () => reject(new Error(`Failed to load script from both sources.`));
           document.body.appendChild(fallback);
        } else {
           reject(new Error(`Failed to load script: ${src}`));
        }
      };
      
      document.body.appendChild(script);
    });
  };

  // --- 1. LOAD THE ENGINES (PYODIDE & JSCPP) ---
  const initializeEngines = async () => {
    setEngineError(false);
    
    // PYTHON ENGINE
    if (module.language === 'python' && !pyodideRef.current) {
        setIsEngineLoading(true);
        try {
            await loadScript(
                "https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js",
                "https://unpkg.com/pyodide@0.25.0/pyodide.js",
                "loadPyodide"
            );

            // Double check availability with polling
            let checks = 0;
            while (!window.loadPyodide && checks < 10) {
                await new Promise(r => setTimeout(r, 500));
                checks++;
            }

            if (window.loadPyodide) {
                // Initialize if not already initialized
                if (!pyodideRef.current) {
                    const pyodide = await window.loadPyodide();
                    pyodideRef.current = pyodide;
                    setOutput(prev => [...prev, '> 🐍 Python Engine Loaded.']);
                }
            } else {
                throw new Error("Pyodide script loaded but 'loadPyodide' is missing.");
            }
        } catch (err) {
            console.error(err);
            setEngineError(true);
            setOutput(prev => [...prev, '> ❌ Failed to load Python engine. Network blocked?']);
        } finally {
            setIsEngineLoading(false);
        }
    }

    // C ENGINE (JSCPP)
    if (module.language === 'c' && !window.JSCPP) {
        setIsEngineLoading(true);
        try {
            await loadScript(
                "https://cdn.jsdelivr.net/npm/jscpp@2.0.4/dist/jscpp.browser.min.js",
                "https://unpkg.com/jscpp@2.0.4/dist/jscpp.browser.min.js",
                "JSCPP"
            );
            
            // Poll for JSCPP
            let checks = 0;
            while (!window.JSCPP && checks < 10) {
                await new Promise(r => setTimeout(r, 500));
                checks++;
            }

            if (window.JSCPP) {
                setOutput(prev => [...prev, '> ⚙️ C Engine (JSCPP) Loaded.']);
            } else {
                throw new Error("JSCPP failed to initialize.");
            }
        } catch (err) {
            console.error(err);
            setEngineError(true);
            setOutput(prev => [...prev, '> ❌ Failed to load C engine.']);
        } finally {
            setIsEngineLoading(false);
        }
    }
  };

  useEffect(() => {
    initializeEngines();
  }, [module.language]);

  const handleScroll = () => {
    if (lineNumbersRef.current && textareaRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  const runCode = async () => {
    setOutput((prev) => [...prev, '> Compiling...', '---']);
    setSyntaxError(null);
    
    await new Promise(r => setTimeout(r, 100));

    let logs = [];

    // Vibe Check (Syntax only)
    if (module.requiredSyntax && !module.requiredSyntax.test(code)) {
       setSyntaxError("You got the logic right, but the syntax is cheating. Check instructions.");
    }

    try {
      // --- JAVASCRIPT ENGINE ---
      if (module.language === 'javascript') {
        const originalLog = console.log;
        console.log = (...args) => { logs.push(args.join(' ')); };
        try {
          new Function(code)(); 
          validateOutput(logs);
        } catch (e) { setOutput((prev) => [...prev, `❌ JS ERROR: ${e.message}`]); }
        console.log = originalLog; 
      } 
      
      // --- PYTHON ENGINE (PYODIDE) 🐍 ---
      else if (module.language === 'python') {
        if (!pyodideRef.current) {
            // Attempt auto-recovery if ref is missing but global exists
            if (window.loadPyodide) {
                 try {
                    pyodideRef.current = await window.loadPyodide();
                 } catch (e) {
                    throw new Error("Engine disconnected. Try refreshing.");
                 }
            } else {
                throw new Error("Engine failed to load. Check your connection.");
            }
        }

        try {
            pyodideRef.current.setStdout({ batched: (text) => logs.push(text) });
            
            // Cleanup & Run
            pyodideRef.current.runPython(`
                import sys
                for name in list(globals().keys()):
                    if not name.startswith("__") and name != "exit" and name != "quit" and name != "sys":
                        del globals()[name]
            `);
            await pyodideRef.current.runPythonAsync(code);
            
            if (logs.length > 0) {
                setOutput((prev) => [...prev, ...logs]);
                validateOutput(logs);
            } else {
                setOutput((prev) => [...prev, '> No output detected.']);
            }
        } catch (err) {
            setOutput((prev) => [...prev, `❌ ${err.message}`]);
        }
      }
      
      // --- C ENGINE (JSCPP) ⚙️ ---
      else if (module.language === 'c') {
         if (!window.JSCPP) throw new Error("Engine loading... (or failed)");
         
         try {
             let cOutput = "";
             const config = {
                 stdio: {
                     write: (s) => { cOutput += s; },
                     writeError: (s) => { cOutput += s; }
                 }
             };
             
             if (!code.includes("main")) throw new Error("Missing 'int main()' entry point.");

             window.JSCPP.run(code, "", config);
             
             if (cOutput) {
                 const lines = cOutput.split('\n').filter(line => line.length > 0);
                 logs.push(...lines);
                 setOutput((prev) => [...prev, ...lines]);
                 validateOutput(lines);
             } else {
                 setOutput((prev) => [...prev, '> No output produced.']);
             }

         } catch (err) {
             setOutput((prev) => [...prev, `❌ C Runtime Error: ${err.message}`]);
         }
      }

    } catch (err) { setOutput((prev) => [...prev, `❌ ERROR: ${err.message}`]); }
  };

  // Helper to check success condition
  const validateOutput = (logs) => {
      const cleanLogs = logs.join('').replace(/\s/g, '');
      const cleanExpected = module.expectedOutput.replace(/\s/g, '');
      
      const outputMatch = cleanLogs.includes(cleanExpected);
      const syntaxMatch = module.requiredSyntax ? module.requiredSyntax.test(code) : true;
      
      if (outputMatch && syntaxMatch) {
        setShowSuccessModal(true);
        setOutput((prev) => [...prev, '✅ TEST PASSED: Logic is sound.']);
      } else if (!outputMatch) {
        setOutput((prev) => [...prev, `❌ LOGIC ERROR: Output mismatch.`]);
      } else if (!syntaxMatch) {
        setSyntaxError("Did you hardcode the answer? Use the variables/syntax requested.");
      }
  };

  // --- BETTER MARKDOWN RENDERER ---
  const renderTheoryLine = (line, i) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('###')) return <h3 key={i} className="text-lg font-bold text-white mt-6 mb-2">{trimmed.replace(/#/g, '').trim()}</h3>;
    if (trimmed.startsWith('##')) return <h2 key={i} className="text-xl font-bold text-white mt-6 mb-3 pb-2 border-b border-gray-800">{trimmed.replace(/#/g, '').trim()}</h2>;
    if (trimmed.startsWith('```')) return null;

    const isCode = line.includes('print(') || 
                   line.includes('console.log') || 
                   line.includes('const ') || 
                   line.includes('let ') || 
                   line.includes('int ') ||
                   (line.startsWith(' ') && line.trim().length > 0); 

    if (isCode && !trimmed.startsWith('# ')) {
       return (
         <div key={i} className="bg-[#161b22] border-l-2 border-purple-500 pl-4 py-2 my-2 font-mono text-sm text-gray-300 rounded-r-lg">
           {line}
         </div>
       );
    }

    if (trimmed === '') return <div key={i} className="h-2"></div>;
    return <p key={i} className="text-gray-400 leading-relaxed mb-2">{line}</p>;
  };

  // Generate line numbers
  const lineCount = code.split('\n').length;
  const lineNumbers = Array.from({ length: Math.max(lineCount, 15) }, (_, i) => i + 1);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#0d1117] relative">
       {/* Success Modal */}
       {showSuccessModal && (
          <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-200 p-4">
            <div className="bg-[#161b22] border border-green-500/30 p-8 rounded-3xl shadow-2xl max-w-md w-full text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-emerald-400"></div>
              <div className="mx-auto w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mb-6 ring-1 ring-green-500/30">
                <Trophy className="w-10 h-10 text-green-400" />
              </div>
              <h2 className="text-3xl font-black text-white mb-2 tracking-tight">You Cooked! 🔥</h2>
              <div className="flex flex-col gap-3 mt-8">
                <button onClick={navProps.onNext} className="w-full py-4 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl flex items-center justify-center gap-2">Next Level <ChevronRight className="w-5 h-5" /></button>
                <button onClick={() => setShowSuccessModal(false)} className="w-full py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium rounded-xl">Stay & Review</button>
              </div>
            </div>
          </div>
       )}
      
       {!isSidebarOpen && (
          <button onClick={() => setIsSidebarOpen(true)} className="absolute z-30 top-4 left-4 p-2 bg-gray-800 rounded-lg text-gray-400 hover:text-white shadow-xl border border-gray-700"><PanelLeftOpen className="w-5 h-5" /></button>
       )}

       {/* Toolbar */}
       <div className="h-16 bg-[#0d1117] border-b border-gray-800 flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-3">
           <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-gray-400">
              <Code2 className="w-4 h-4" />
           </div>
           <div>
             <div className="text-xs text-gray-500 font-bold uppercase tracking-wider">Editor</div>
             <div className="text-sm font-mono text-gray-300">main.{module.language === 'c' ? 'c' : module.language === 'python' ? 'py' : 'js'}</div>
           </div>
        </div>

        <NavigationControls {...navProps} dark />

        <div className="flex items-center gap-3">
           {isEngineLoading && (module.language === 'python' || module.language === 'c') && (
               <span className="flex items-center gap-2 text-xs font-bold text-yellow-500 animate-pulse">
                   <Loader2 className="w-3 h-3 animate-spin" /> Loading Engine...
               </span>
           )}
           {engineError && (
               <button 
                 onClick={initializeEngines} 
                 className="flex items-center gap-2 text-xs font-bold text-red-400 hover:text-red-300 transition-colors"
                 title="Retry Engine Load"
               >
                   <RefreshCw className="w-3 h-3" /> Retry Load
               </button>
           )}
           <button onClick={() => setCode(module.initialCode)} className="p-2.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg" title="Reset Code"><RotateCcw className="w-4 h-4" /></button>
           <button 
             onClick={runCode} 
             disabled={isEngineLoading && (module.language === 'python' || module.language === 'c')}
             className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-green-900/20 active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
           >
             <Play className="w-4 h-4 fill-current" /> Run Code
           </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row h-full overflow-hidden">
         {/* Sidebar */}
         <div className={`${isSidebarOpen ? 'w-full lg:w-[400px] border-r' : 'w-0 lg:w-0 border-r-0'} bg-[#010409] border-gray-800 flex flex-col transition-all duration-300 ease-out relative shrink-0 z-20 overflow-hidden`}>
            <div className="absolute z-30 top-4 right-4 flex items-center gap-2">
               <button onClick={onOpenMap} className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-purple-400 transition-colors" title="Open Map">
                  <MapIcon className="w-5 h-5" />
               </button>
               <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-gray-800 rounded-lg text-gray-400">
                  <PanelLeftClose className="w-5 h-5" />
               </button>
            </div>

            <div className="p-6 overflow-y-auto h-full scrollbar-thin scrollbar-thumb-gray-800">
                <div className="flex items-center gap-2 text-purple-400 font-bold uppercase text-xs tracking-widest mb-4"><BookOpen className="w-4 h-4" /> Manual</div>
                
                <div className="prose prose-invert prose-sm max-w-none text-gray-300 mb-8">
                   {module.theory && module.theory.split('\n').map((line, i) => renderTheoryLine(line, i))}
                </div>

                <div className="h-px bg-gray-800 w-full mb-8"></div>
                <div className="flex items-center gap-2 text-blue-400 font-bold uppercase text-xs tracking-widest mb-3"><FileCode className="w-4 h-4" /> Mission</div>
                <p className="text-white text-lg font-medium leading-relaxed mb-4">{module.instruction}</p>
                {syntaxError && <div className="bg-red-500/10 border border-red-500/50 p-4 rounded-xl flex gap-3 animate-pulse"><AlertCircle className="w-5 h-5 text-red-400 shrink-0" /><p className="text-red-300 text-sm">{syntaxError}</p></div>}
            </div>
         </div>
         
         {/* Code Area with Line Numbers */}
         <div className="flex-1 bg-[#0d1117] relative group h-full border-r border-gray-800 flex flex-row font-mono text-sm overflow-hidden">
            {/* Line Numbers Column */}
            <div 
              ref={lineNumbersRef}
              className="bg-[#0d1117] text-gray-600 text-right py-6 select-none border-r border-gray-800 w-12 flex-shrink-0 overflow-hidden"
              style={{ lineHeight: '1.5rem' }} 
            >
              {lineNumbers.map(num => (
                <div key={num} className="px-3 h-6">{num}</div>
              ))}
            </div>

            {/* Textarea */}
            <textarea 
              ref={textareaRef}
              onScroll={handleScroll}
              value={code} 
              onChange={(e) => setCode(e.target.value)} 
              className="flex-1 h-full bg-transparent text-gray-300 p-6 pt-6 resize-none outline-none focus:bg-[#161b22] transition-colors leading-relaxed border-none w-full" 
              spellCheck="false" 
              style={{ lineHeight: '1.5rem' }} // Synced line-height
            />
         </div>

         {/* Output Terminal */}
         <div className="h-48 lg:h-auto lg:w-[30%] bg-[#010409] flex flex-col font-mono text-sm shrink-0 border-t lg:border-t-0">
           <div className="px-5 py-3 bg-[#0d1117] border-b border-gray-800 text-gray-500 text-xs font-bold uppercase tracking-wider flex items-center justify-between">
              <div className="flex items-center gap-2"><Terminal className="w-3 h-3" /> Output</div>
              <button onClick={() => setOutput(['> Terminal ready...'])} className="hover:text-red-400 transition-colors" title="Clear Console"><Trash2 className="w-3 h-3" /></button>
           </div>
           <div className="flex-1 p-5 overflow-y-auto space-y-2 font-mono scrollbar-thin scrollbar-thumb-gray-800">
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
  );
};