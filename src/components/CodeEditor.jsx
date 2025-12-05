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
    tabSize: 4,
    WebkitTabSize: 4,
    whiteSpace: 'pre-wrap',
    wordWrap: 'break-word',
  };

  // Helper: insert text at selection and update caret/selection
  const insertAndSelect = (value, insertText, selStart, selEnd, newSelStart, newSelEnd) => {
    const newValue = value.slice(0, selStart) + insertText + value.slice(selEnd);
    setCode(newValue);
    // Wait for DOM update then set selection
    requestAnimationFrame(() => {
      if (editorRef.current) {
        editorRef.current.selectionStart = newSelStart;
        editorRef.current.selectionEnd = newSelEnd;
      }
    });
  };

  const handleKeyDown = (e) => {
    const el = editorRef.current;
    if (!el) return;
    const { selectionStart, selectionEnd } = el;
    const value = code || '';
    const tab = '    '; // four spaces

    // Tab/Shift+Tab indentation
    if (e.key === 'Tab') {
      e.preventDefault();

      // Find start of first line and end of last selected line
      const startLineIndex = value.lastIndexOf('\n', selectionStart - 1) + 1;
      const endLineBreak = value.indexOf('\n', selectionEnd);
      const endLineIndex = endLineBreak === -1 ? value.length : endLineBreak;

      const block = value.slice(startLineIndex, endLineIndex);
      const lines = block.split('\n');

      if (!e.shiftKey) {
        // indent each line
        const newBlock = lines.map(l => tab + l).join('\n');
        const newValue = value.slice(0, startLineIndex) + newBlock + value.slice(endLineIndex);
        const added = tab.length * lines.length;
        setCode(newValue);
        requestAnimationFrame(() => {
          const newStart = selectionStart + tab.length;
          const newEnd = selectionEnd + added;
          el.selectionStart = newStart;
          el.selectionEnd = newEnd;
        });
      } else {
        // unindent: remove up to tab length from each line if present
        let removed = 0;
        const newLines = lines.map((l) => {
          if (l.startsWith(tab)) { removed += tab.length; return l.slice(tab.length); }
          if (l.startsWith('\t')) { removed += 1; return l.slice(1); }
          return l;
        });
        const newBlock = newLines.join('\n');
        const newValue = value.slice(0, startLineIndex) + newBlock + value.slice(endLineIndex);
        setCode(newValue);
        requestAnimationFrame(() => {
          const newStart = Math.max(selectionStart - tab.length, startLineIndex);
          const newEnd = Math.max(selectionEnd - removed, newStart);
          el.selectionStart = newStart;
          el.selectionEnd = newEnd;
        });
      }
      return;
    }

    // Auto-pairing for quotes/brackets/braces/parentheses
    const pairs = { '"': '"', "'": "'", '`': '`', '(': ')', '{': '}', '[': ']' };
    const closing = new Set(Object.values(pairs));

    // If user typed an opening char, insert pair
    if (Object.prototype.hasOwnProperty.call(pairs, e.key) && !e.metaKey && !e.ctrlKey && !e.altKey) {
      e.preventDefault();
      const open = e.key;
      const close = pairs[e.key];

      if (selectionStart !== selectionEnd) {
        // wrap selection
        const selected = value.slice(selectionStart, selectionEnd);
        const insertText = open + selected + close;
        insertAndSelect(value, insertText, selectionStart, selectionEnd, selectionStart + 1, selectionEnd + 1);
      } else {
        // insert pair and put caret between
        const insertText = open + close;
        insertAndSelect(value, insertText, selectionStart, selectionEnd, selectionStart + 1, selectionStart + 1);
      }
      return;
    }

    // If user typed a closing char and the next char is the same, move caret over it
    if (closing.has(e.key) && !e.metaKey && !e.ctrlKey && !e.altKey) {
      const nextChar = value.charAt(selectionStart);
      if (nextChar === e.key) {
        e.preventDefault();
        requestAnimationFrame(() => {
          el.selectionStart = el.selectionEnd = selectionStart + 1;
        });
        return;
      }
    }

    // Enter auto-indent: preserve indentation from current line, add extra indent if inside braces
    if (e.key === 'Enter') {
      e.preventDefault();
      
      // Find the current line's indentation
      const currentLineStart = value.lastIndexOf('\n', selectionStart - 1) + 1;
      const currentLineEnd = selectionStart;
      const currentLine = value.slice(currentLineStart, currentLineEnd);
      const currentIndent = currentLine.match(/^(\s*)/)[1];
      
      // Check if we're inside braces/brackets/parens (look at char before caret)
      const charBefore = value.charAt(selectionStart - 1);
      const charAfter = value.charAt(selectionStart);
      const openingChars = { '(': ')', '{': '}', '[': ']', ':': '' };
      let extraIndent = '';
      
      // For braces/brackets/parens - add extra indent and closing on next line
      if ((Object.prototype.hasOwnProperty.call(openingChars, charBefore) && openingChars[charBefore] === charAfter) ||
          // Python: colon at end of line
          (charBefore === ':' && !charAfter.trim())) {
        extraIndent = tab; // use the tab variable (4 spaces)
        
        if (charBefore === ':') {
          // Python style: just indent next line
          const newValue = value.slice(0, selectionStart) + '\n' + currentIndent + extraIndent + value.slice(selectionStart);
          setCode(newValue);
          requestAnimationFrame(() => {
            el.selectionStart = el.selectionEnd = selectionStart + currentIndent.length + extraIndent.length + 1;
          });
        } else {
          // Braces/brackets/parens: indent and put closing on next line
          const newValue = value.slice(0, selectionStart) + '\n' + currentIndent + extraIndent + '\n' + currentIndent + value.slice(selectionStart);
          setCode(newValue);
          requestAnimationFrame(() => {
            el.selectionStart = el.selectionEnd = selectionStart + currentIndent.length + extraIndent.length + 1;
          });
        }
      } else {
        // Normal enter: just preserve indentation
        const newValue = value.slice(0, selectionStart) + '\n' + currentIndent + value.slice(selectionStart);
        setCode(newValue);
        requestAnimationFrame(() => {
          el.selectionStart = el.selectionEnd = selectionStart + currentIndent.length + 1;
        });
      }
    }
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
              onKeyDown={handleKeyDown}
                onScroll={handleScroll}
                className="absolute inset-0 w-full h-full bg-transparent text-transparent resize-none z-10 caret-white overflow-auto"
                style={sharedStyles}
                spellCheck="false"
            />
        </div>
    </div>
  );
};

