# TODO: Editor Themes, Syntax Highlighting (Shiki), and Pets

A compact, actionable roadmap to implement advanced editor themes, Shiki-based syntax highlighting, and a pet companion feature.

## Priority: High
- [ ] Add Shiki integration for syntax highlighting (Option B)
  - Create `src/utils/shikiHighlighter.js` (async loader + `highlight(code, lang, theme)` API)
  - Add fallback to `highlight.js` when Shiki unavailable
  - Include initial themes: `GitHub Light`, `GitHub Dark`, `One Dark` (configurable)
  - Unit tests: `test/shiki.test.js` for language/theme output

- [ ] Fix `SyntaxHighlighter` to prefer Shiki then fallback to highlight.js
  - Update `src/utils/SyntaxHighlighter.js` to export same `highlightSyntax(code, language)` API
  - Ensure existing `CodeEditor` works without changes

## Priority: Medium
- [ ] Editor Themes as Cosmetics
  - Extend `cosmetics` schema to accept theme metadata (`backgroundImage`, `fontFamily`, `cssVars`) via migration
  - Add server support to upload theme assets (validate & sanitize)
  - UI: `ThemePreview` component and add equip action in `CosmeticsShop.jsx`
  - `CodeEditor` apply: `background-image`, `font-family`, CSS variable overrides for token colors
  - Add small preview snapshot tests for `ThemePreview`

- [ ] Performance & Lazy Loading
  - Load Shiki and large theme assets lazily (on first editor open or on theme preview)
  - Cache compiled HTML (or CSS) per theme/language pair if necessary

## Priority: Low (Future/Optional)
- [ ] Pet Companion MVP
  - Add `pets` table or extend `user_stats` with `pet` object (`type`, `level`, `hunger`, `lastInteraction`)
  - Endpoints: `GET/PUT /api/user/pet` to retrieve/update pet state
  - Frontend: `Pet` component (animated SVG or Lottie) that reacts to events (run success, streak)
  - Hooks: integrate pet events on `code run`, `module complete`, and `daily login`
  - Consider paid/premium cosmetic pets later

- [ ] Sandbox Editor (Later)
  - If we need a true sandbox (full language server features), migrate only the sandbox route to CodeMirror/Monaco
  - Keep main editor lightweight (textarea + highlight layer) for performance and simplicity

## Acceptance Criteria
- Shiki highlighting is available and visibly richer than highlight.js
- Themes can be equipped and previewed in the cosmetics shop, and `CodeEditor` reflects the selected theme immediately
- Pets show up on the UI and persist state to the server (MVP can be read-only initially)
- No regression in current editor features (indentation, auto-pairing, keyboard shortcuts)

---