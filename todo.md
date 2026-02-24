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

# TODO: Bootcamp / Online Class Features

Main revenue feature — complete the full student + instructor lifecycle.

## Priority: Critical (unblocks paid users)
- [x] `/bootcamp/batch/:id` — Batch Detail Page
  - Route is already navigated to from the "My Sessions" button in My Classes tab but the page + route don't exist
  - Show all sessions belonging to the batch (scheduled, live, ended)
  - "Join Live" button for live sessions the user is enrolled in
  - "Watch Recording" button for ended sessions that have a `recordingUrl`
  - Guard: redirect to `/bootcamp` if user is not a paid enrollee of that batch

- [x] Backend: batch session access control
  - `POST /api/bootcamp/sessions/:id/join` must verify the user has a `paid` enrollment in the session's parent batch
  - Already implemented — checks `isUserEnrolledInBatch` when session has `batchId`

## Priority: High
- [x] Admin UI: assign `batch_id` when creating/editing a session
  - Batch selector dropdown in create/edit session forms, populated from `fetchBatches()`
  - Session list shows batch name badge next to session title

- [x] Admin UI: set recording URL on ended sessions
  - Recording URL input appears in edit form when session `status === 'ended'`

- [x] Prevent duplicate enrollment rows on double-click / double enroll
  - Both `/enroll/online` and `/enroll/manual` routes detect existing pending enrollments and return them

## Priority: Medium
- [x] Email notification on manual payment approve / reject
  - Nodemailer utility at `server/utils/email.js` with bilingual (ID) templates
  - Wired into approve/reject endpoints (fire-and-forget)

- [x] My Classes tab: richer enrollment card
  - Shows batch dates, session count, next upcoming session, instructor name, tags

- [ ] Midtrans approval post-actions
  - Once `VITE_MIDTRANS_ENABLED=true` is live: send payment receipt email from the webhook handler
  - Document the exact Cloudflare Pages env vars to set: `VITE_MIDTRANS_ENABLED=true`, `VITE_MIDTRANS_CLIENT_KEY`

## Priority: Low (post-launch)
- [x] Attendance tracking per session
  - `markAttendance` already records join in `bootcamp_enrollments`
  - New `GET /api/batches/:id/attendance` returns per-session attendance for logged-in user
  - BatchDetailPage shows "Attended" badge per session and X/Y attendance summary in header
  - Admin enrollments modal already shows ATTENDED badge

- [ ] Completion certificate / badge on batch finish
  - Trigger when all sessions in a batch are `ended` and user attended ≥ threshold
  - Simple PDF or shareable image generated server-side

---