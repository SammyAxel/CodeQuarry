import React, { useRef, useEffect } from 'react';
import { highlightSyntax } from '../utils/SyntaxHighlighter';

export const CodeEditor = ({ code, setCode, language }) => {
  const lineNumbersRef = useRef(null);
  const editorRef = useRef(null);
  const highlightRef = useRef(null);

  // Generate line numbers
  const lineCount = code ? code.split('\n').length : 1;
  const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1);

  const handleScroll = () => {
    if (editorRef.current && highlightRef.current && lineNumbersRef.current) {
      const { scrollTop, scrollLeft } = editorRef.current;
      highlightRef.current.scrollTop = scrollTop;
      highlightRef.current.scrollLeft = scrollLeft;
      lineNumbersRef.current.scrollTop = scrollTop;
    }
  };

  // A single style object to guarantee pixel-perfect alignment.
  const sharedStyles = {
    fontFamily: 'monospace',
    fontSize: '14px',
    lineHeight: '1.5rem',
    padding: '24px',
    margin: 0,
    border: 'none',
    outline: 'none',
    tabSize: 2,
    WebkitTabSize: 2,
    whiteSpace: 'pre-wrap',
    wordWrap: 'break-word',
  };

  return (
    <div className="flex h-full w-full bg-[#0d1117] font-mono text-sm relative group overflow-hidden">
        {/* Line Numbers Gutter */}
        <div 
            ref={lineNumbersRef}
            className="bg-[#0d1117] text-gray-600 text-right py-6 pl-3 pr-4 select-none border-r border-gray-800 w-16 flex-shrink-0 overflow-hidden"
            style={{ lineHeight: '1.5rem' }} 
        >
            {lineNumbers.map(num => <div key={num}>{num}</div>)}
        </div>

        {/* The Editor Area */}
        <div className="relative flex-1 h-full">
            {/* Highlight Layer (Behind) */}
            <div
                ref={highlightRef}
                className="absolute inset-0 overflow-auto pointer-events-none"
                style={sharedStyles}
                dangerouslySetInnerHTML={{ __html: highlightSyntax(code + '\n', language) }} // Add newline to prevent last line from being cut off
            />
            {/* Input Layer (Front) */}
            <textarea
                ref={editorRef}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                onScroll={handleScroll}
                className="absolute inset-0 w-full h-full bg-transparent text-transparent resize-none z-10 caret-white overflow-auto"
                style={sharedStyles}
                spellCheck="false"
            />
        </div>
    </div>
  );
};

