import React from 'react';
import { highlightSyntax } from '../utils/SyntaxHighlighter';

export const MarkdownRenderer = ({ text }) => {
  if (!text) return null;
  const lines = text.split('\n');
  const elements = [];
  let inCodeBlock = false;
  let codeBuffer = [];
  let codeLang = 'plaintext';

  lines.forEach((line, i) => {
    const trimmed = line.trim();

    // 1. Handle Code Blocks (```)
    if (trimmed.startsWith('```')) {
      if (inCodeBlock) {
        // Closing the block -> Render the buffer with highlighting
        elements.push(
          <div key={`code-${i}`} className="bg-[#161b22] border-l-2 border-purple-500 pl-4 py-3 my-4 font-mono text-sm text-gray-300 rounded-r-lg whitespace-pre-wrap shadow-inner border border-gray-800/50 overflow-x-auto">
             <code className={`hljs language-${codeLang} p-0`} dangerouslySetInnerHTML={{ __html: highlightSyntax(codeBuffer.join('\n'), codeLang) }} />
          </div>
        );
        codeBuffer = [];
        codeLang = 'plaintext'; // Reset language after closing block
      }
      else { // Opening the block -> Capture language
        codeLang = trimmed.substring(3).trim() || 'plaintext';
      }
      inCodeBlock = !inCodeBlock;
      return;
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      return;
    }

    // 2. Handle Headers
    if (trimmed.startsWith('### ')) {
      elements.push(<h3 key={i} className="text-lg font-bold text-white mt-6 mb-3 border-b border-gray-800 pb-2">{trimmed.replace(/^###\s+/, '')}</h3>);
      return;
    }
    if (trimmed.startsWith('## ')) {
        elements.push(<h2 key={i} className="text-xl font-bold text-white mt-8 mb-4 border-b border-gray-700 pb-2">{trimmed.replace(/^##\s+/, '')}</h2>);
        return;
    }
    
    // 3. Handle Lists
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        elements.push(<li key={i} className="ml-4 text-gray-400 list-disc mb-1 marker:text-purple-500 pl-2">{trimmed.replace(/^[-*]\s+/, '')}</li>);
        return;
    }

    // 4. Handle Standard Paragraphs
    if (trimmed.length > 0) {
        const __html = line
            .replace(/\*\*(.*?)\*\*/g, '<strong class="text-gray-200">$1</strong>')
            .replace(/`([^`]+)`/g, '<code class="bg-gray-800 text-purple-300 px-1 py-0.5 rounded text-xs border border-gray-700 font-mono">$1</code>');
            
        elements.push(<p key={i} className="text-gray-400 leading-relaxed mb-3" dangerouslySetInnerHTML={{__html}} />);
    } else {
        elements.push(<div key={i} className="h-2"></div>);
    }
  });

  return <>{elements}</>;
};