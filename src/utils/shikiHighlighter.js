let highlighterPromise = null;
let highlighterError = null;

const MAX_CACHE_ENTRIES = 200;
const htmlCache = new Map();

// Shiki tokenization is great, but can be expensive for very large inputs.
// For editor responsiveness, we hard-cap Shiki work and fall back to highlight.js.
const MAX_SHIKI_CHARS = 20000;

const DEFAULT_SHIKI_THEME = 'github-dark';

const escapeHtml = (str) => {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

const normalizeLang = (language) => {
  if (!language) return 'plaintext';
  const lang = String(language).toLowerCase();
  // common aliases used in markdown fences / content
  if (lang === 'js') return 'javascript';
  if (lang === 'ts') return 'typescript';
  if (lang === 'py') return 'python';
  if (lang === 'c++') return 'cpp';
  if (lang === 'sh') return 'bash';
  return lang;
};

const hashString = (str) => {
  // Simple DJB2 hash for cache keys (fast, non-crypto)
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) ^ str.charCodeAt(i);
  }
  return (hash >>> 0).toString(16);
};

const getCacheKey = (code, language) => {
  const lang = normalizeLang(language);
  const safeLen = code?.length || 0;
  return `${lang}:${safeLen}:${hashString(String(code))}`;
};

const getCached = (key) => {
  const val = htmlCache.get(key);
  if (!val) return null;
  // refresh LRU order
  htmlCache.delete(key);
  htmlCache.set(key, val);
  return val;
};

const setCached = (key, value) => {
  htmlCache.set(key, value);
  if (htmlCache.size <= MAX_CACHE_ENTRIES) return;
  // delete oldest
  const oldestKey = htmlCache.keys().next().value;
  if (oldestKey) htmlCache.delete(oldestKey);
};

const tokenCategoryFromScopes = (scopes = []) => {
  const s = scopes.join(' ').toLowerCase();

  if (s.includes('comment')) return 'comment';
  if (s.includes('string')) return 'string';
  if (s.includes('keyword') || s.includes('storage.type') || s.includes('storage.modifier')) return 'keyword';
  if (s.includes('constant.numeric') || s.includes('number')) return 'number';

  // function-ish
  if (s.includes('entity.name.function') || s.includes('support.function')) return 'function';

  // types/classes
  if (s.includes('entity.name.type') || s.includes('support.type') || s.includes('entity.name.class')) return 'type';

  // punctuation/operators/brackets
  if (s.includes('punctuation') || s.includes('operator') || s.includes('brace') || s.includes('bracket') || s.includes('delimiter')) return 'punctuation';

  // properties/fields
  if (s.includes('variable.other.property') || s.includes('support.variable.property')) return 'property';

  return 'plain';
};

export const getShikiHighlighter = async () => {
  if (highlighterError) return null;
  if (highlighterPromise) return highlighterPromise;

  highlighterPromise = (async () => {
    try {
      const shiki = await import('shiki');

      // Keep this intentionally small for bundle/perf.
      const langs = [
        'plaintext',
        'javascript',
        'typescript',
        'json',
        'python',
        'java',
        'c',
        'cpp',
        'go',
        'rust',
        'html',
        'css',
        'bash',
        'markdown',
      ];

      const highlighter = await shiki.createHighlighter({
        themes: [DEFAULT_SHIKI_THEME],
        langs,
      });

      return highlighter;
    } catch (err) {
      highlighterError = err;
      return null;
    }
  })();

  return highlighterPromise;
};

/**
 * Highlight code using Shiki tokenization but CSS-driven colors.
 * This returns HTML with lightweight token-category classes so your existing
 * cosmetic theme colors (keyword/string/comment/number/etc) can drive styling.
 */
export const highlightWithShiki = async (code, language) => {
  const safeCode = typeof code === 'string' ? code : String(code ?? '');
  if (safeCode.length > MAX_SHIKI_CHARS) return null;

  const cacheKey = getCacheKey(safeCode, language);
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const highlighter = await getShikiHighlighter();
  if (!highlighter) return null;

  const lang = normalizeLang(language);

  let lines;
  try {
    // We use a real theme only to get stable token scopes from Shiki.
    lines = highlighter.codeToThemedTokens(safeCode, {
      lang,
      theme: DEFAULT_SHIKI_THEME,
      // Needed so we can map scopes -> our CSS categories.
      includeExplanation: true,
    });
  } catch {
    // Unsupported language / grammar load failure
    return null;
  }

  const html = lines
    .map((line) =>
      line
        .map((token) => {
          const scopes =
            token?.explanation?.scopes ||
            token?.explanation ||
            token?.scopes ||
            [];
          const cat = tokenCategoryFromScopes(scopes);
          return `<span class="cq-tok cq-${cat}">${escapeHtml(token.content)}</span>`;
        })
        .join('')
    )
    .join('\n');

  setCached(cacheKey, html);
  return html;
};
