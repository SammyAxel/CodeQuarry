import hljs from 'highlight.js';

/**
 * A robust syntax highlighter powered by the highlight.js library.
 * @param {string} code The raw code string.
 * @param {string} language The programming language (e.g., 'python', 'javascript').
 * @returns {string} An HTML string with syntax highlighting.
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