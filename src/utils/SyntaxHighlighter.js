import hljs from 'highlight.js';
import { highlightWithShiki } from './shikiHighlighter.js';

/**
 * Robust syntax highlighter powered by highlight.js library
 * Provides HTML-formatted code with syntax highlighting
 * 
 * @param {string} code - The raw code string to highlight
 * @param {string} language - Programming language (e.g., 'python', 'javascript', 'c')
 * @returns {string} HTML string with syntax highlighting classes applied
 * 
 * @example
 * const highlighted = highlightSyntax('console.log("hello")', 'javascript');
 * // Returns: <span class="hljs-string">"hello"</span>...
 * 
 * @throws Silently returns escaped text on error (no exception thrown)
 */
export const highlightSyntax = (code, language) => {
  try {
    // If a language is specified and supported, use it.
    if (language && hljs.getLanguage(language)) {
      return hljs.highlight(code, { language, ignoreIllegals: true }).value.trimEnd();
    }
    // Otherwise, let highlight.js try to figure it out automatically.
    return hljs.highlightAuto(code).value.trimEnd();
  } catch (e) {
    console.error("Highlight.js error:", e);
    // On error, fallback to simple escaped text.
    return code.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
};

/**
 * Async highlighter that prefers Shiki tokenization (CSS-driven) and falls back
 * to highlight.js synchronously if Shiki is unavailable.
 */
export const highlightSyntaxAsync = async (code, language) => {
  try {
    const shikiHtml = await highlightWithShiki(code, language);
    if (shikiHtml) return shikiHtml.trimEnd();
  } catch {
    // ignore and fallback
  }

  return highlightSyntax(code, language);
};