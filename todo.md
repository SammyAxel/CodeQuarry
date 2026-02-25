# TODO: Editor Themes, Syntax Highlighting (Shiki), and Pets

A compact, actionable roadmap to implement advanced editor themes, Shiki-based syntax highlighting, and a pet companion feature.

## Priority: High
- [x] Add Shiki integration for syntax highlighting
  - `src/utils/shikiHighlighter.js` — async loader, LRU cache (200 entries), 14 languages, CSS-class tokens
  - Falls back to `highlight.js` when Shiki unavailable
  - Uses `github-dark` theme for tokenization, emits `cq-tok cq-<category>` classes (CSS-driven colors)
  - Tests: `test/syntaxHighlighterAsync.test.js` covers Shiki + hljs fallback paths

- [x] Fix `SyntaxHighlighter` to prefer Shiki then fallback to highlight.js
  - `src/utils/SyntaxHighlighter.js` exports `highlightSyntax` (sync hljs) + `highlightSyntaxAsync` (Shiki-first)
  - `CodeEditor.jsx` uses `highlightSyntaxAsync` for all rendering; no API change needed

## Priority: Medium
- [x] Editor Themes as Cosmetics
  - `src/data/cosmetics.js` carries full `editorStyles` per theme (`backgroundImage`, `fontFamily`, `textShadow`, `caretColor`, overlay type/intensity)
  - `ThemePreview` component exists in `CosmeticsShop.jsx` with Shiki-highlighted snippet preview
  - `CodeEditor.jsx` applies all `editorStyles` properties (background, font, caret, shadows)

- [x] Performance & Lazy Loading
  - Shiki loads via `import('shiki')` dynamic import — zero cost on initial page load
  - 200-entry LRU HTML cache in `shikiHighlighter.js` prevents re-tokenizing identical snippets

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

---

# TODO: Bootcamp / Online Class Features

Main revenue feature — complete the full student + instructor lifecycle.

## Priority: Critical (unblocks paid users)
- [x] `/bootcamp/batch/:id` — Batch Detail Page
- [x] Backend: batch session access control

## Priority: High
- [x] Admin UI: assign `batch_id` when creating/editing a session
- [x] Admin UI: set recording URL on ended sessions
- [x] Prevent duplicate enrollment rows
- [x] WS auth: server-side token verification (removed client-trusted params)
- [x] API rate limiting on enrollment + webhook routes
- [x] Chat abuse prevention: 2000 char limit + 15 msg/10s rate limiting
- [x] Atomic enrollment capacity check (PostgreSQL FOR UPDATE transaction)

## Priority: Medium
- [x] Email notification on manual payment approve / reject
- [x] My Classes tab: richer enrollment card
- [x] Refund admin flow: `PUT /enrollments/:id/refund` + admin modal
- [x] Admin batch enrollee list: modal with payment status + inline refund
- [x] Provider default aligned: DB schema `'100ms'`
- [x] WS reconnect feedback: Live / Reconnecting / Connection lost states
- [x] Replace all `alert()` with inline `actionError` banner

- [ ] Midtrans approval post-actions
  - Blocked until `VITE_MIDTRANS_ENABLED=true` is live
  - Once live: send payment receipt email from webhook handler
  - Env vars needed: `VITE_MIDTRANS_ENABLED=true`, `VITE_MIDTRANS_CLIENT_KEY`

## Priority: Low (post-launch)
- [x] Attendance tracking per session (join recording + BatchDetailPage badges)

- [ ] Completion certificate / badge on batch finish ← IN PROGRESS
  - Admin creates a certificate template per batch (title, body text with variables, instructor name, accent color, attendance threshold)
  - Variables supported: `{{studentName}}`, `{{batchTitle}}`, `{{completionDate}}`, `{{instructorName}}`
  - Admin can issue certificates manually to eligible students
  - Student downloads PDF from BatchDetailPage
  - PDF generated server-side via `pdfkit` (A4 landscape, branded)
  - `batch_certificate_templates` + `user_certificates` tables in DB