# CodeQuarry Moderator Guide

Welcome to the CodeQuarry moderator team! This guide explains how to manage courses, edit content, and maintain the platform.

## Table of Contents

1. [Logging In](#logging-in)
2. [Dashboard Overview](#dashboard-overview)
3. [Managing Published Courses](#managing-published-courses)
4. [Creating Draft Courses](#creating-draft-courses)
5. [Publishing Courses](#publishing-courses)
6. [Course Naming & File System](#course-naming--file-system)
7. [Troubleshooting](#troubleshooting)
8. [Best Practices](#best-practices)

---

## Logging In

### Access the Moderator Portal

1. Go to `http://localhost:4000` (or your production URL)
2. Click **"Moderator Portal"** button
3. Enter the moderator password: `GemGoblin2025!`
4. You'll be redirected to the Admin Dashboard

### Sessions

- Your login session lasts **30 minutes** of inactivity
- You'll need to log in again if your session expires
- Sessions are stored securely in your browser (not as passwords)

---

## Dashboard Overview

The Admin Dashboard has two main tabs:

### 1. **Published Courses** Tab
- Shows all active courses students can enroll in
- View: `js-101`, `py-101`, `c-101`
- You can **edit and preview** these courses
- Changes are saved locally and applied immediately
- A yellow "Modified" badge shows which courses you've edited

### 2. **Drafts** Tab
- Courses you're working on but haven't published yet
- Can be edited, previewed, exported, and deleted
- Stored in your browser's local storage
- Perfect for testing new content before going live

---

## Managing Published Courses

### Editing an Existing Course

1. Go to the **Published Courses** tab
2. Find the course you want to edit (e.g., "JavaScript for Newbs")
3. Click the **"Edit Course"** button (pencil icon)
4. Make your changes:
   - **Title** - Course name students see
   - **Description** - Course overview
   - **Tier Level** - Difficulty: Copper (Foundational), Silver (Intermediate), Gold (Advanced), Platinum (Expert)
   - **Icon** - Visual representation (emoji or upload custom)
   - **Modules** - Add, edit, or delete course sections

### Saving Changes

Two save options appear:

#### **Save to Browser** (Default)
- ✅ Changes saved to your local browser
- ✅ Applied immediately in the app
- ⚠️ Other moderators won't see changes
- 💡 Use this to preview changes safely

#### **Save to File** (If server is online)
- ✅ Changes saved to the actual course file (`src/data/js-101.jsx`)
- ✅ Persists after restart
- ⚠️ Requires server restart to take effect
- 💡 Use this for final changes after testing

### Yellow "Modified" Badge

- Indicates you've edited this published course locally
- Click **"Revert Changes"** to restore the original version
- Changes are only in your browser until you save to file

### Previewing Changes

1. Click **"Preview"** button (eye icon)
2. See exactly how students will see your course
3. Review all modules and content
4. Click back arrow to return to editing

---

## Creating Draft Courses

### New Course Workflow

1. Go to **Drafts** tab
2. Click **"New Course"** button
3. Fill in the course details:

#### **Course ID** (Important!)
- **Format:** lowercase with hyphens only (e.g., `rust-101`, `web-201`)
- **Examples:** `python-intermediate`, `typescript-101`, `react-basics`
- Used for the filename: `rust-101.jsx`
- Cannot be changed after publishing
- Must be unique (no duplicates)

#### **Title**
- Course name students see
- Keep it clear and descriptive
- Examples: "Rust Fundamentals", "Web Development 201"

#### **Description**
- Overview of what students will learn
- Should include learning outcomes
- Example: "Master the basics of Rust with hands-on projects"

#### **Tier Level**
- 🥉 **Copper** - Foundational (no prerequisites)
- ⚪ **Silver** - Intermediate (basic knowledge required)
- 🟡 **Gold** - Advanced (intermediate+ knowledge required)
- 💎 **Platinum** - Expert (advanced knowledge required)

#### **Icon**
- Select from preset emojis
- Or upload a custom image URL
- Use SVG for best quality

### Adding Modules

Modules are the course sections students progress through.

1. Click **"Add Module"** button
2. Choose module type:

#### **Practice Module**
- Hands-on coding exercises
- Students write code in the built-in editor
- Required fields:
  - **Title** - Module name
  - **Theory** - Learning material (markdown supported)
  - **Initial Code** - Starter code for students
  - **Language** - Python, JavaScript, C++, etc.
  - **Expected Output** - What correct code produces
  - **Solution** - Reference solution (shown after completion)
  - **Hints** - Guidance for stuck students

#### **Article Module**
- Text-based content
- Theory/explanations with markdown
- No coding involved

#### **Video Module**
- Embedded video content
- Link to external video (YouTube, etc.)
- Duration display
- Description/notes

### Module Editor Tips

- **Markdown Support:** Use `# Headers`, `**bold**`, `*italic*`, `\`\`\`code\`\`\` in text fields
- **Code Syntax:** Select the correct programming language for syntax highlighting
- **Hints:** Add 3-5 helpful hints students can reveal one at a time
- **Expected Output:** Be specific - include exact formatting, line breaks, spacing

---

## Publishing Courses

### Publishing a Draft

After finishing your draft course:

1. Click **"Preview"** to verify everything looks correct
2. Click **"Export"** to download a backup (JSON file)
3. Click **"Publish to Live"** button
4. Confirmation dialog appears
5. Course file is created: `src/data/[course-id].jsx`

### What Happens When Publishing

✅ Course file is created in the codebase  
✅ Course is added to `src/data/courses.jsx` registry  
✅ **⚠️ Server must be restarted** to see the new course in the app  
✅ Course ID generates export name: `rust-101` → `rust101Course`

### Important: Export Names

The system automatically generates export names from your course ID:
- `js-101` → `jsCourse` (preserved if already exists)
- `py-101` → `pyCourse` (preserved if already exists)
- `rust-101` → `rust101Course` (new courses use this format)

**Don't worry about this** - it's handled automatically!

---

## Course Naming & File System

### Understanding the File Structure

```
src/data/
├── courses.jsx          # Registry of all courses (automatically updated)
├── js-101.jsx          # JavaScript course file
├── py-101.jsx          # Python course file
├── c-101.jsx           # C course file
└── your-course.jsx     # Your new course files
```

### Course ID Guidelines

✅ **Good examples:**
- `rust-101` - follows established pattern
- `web-201` - indicates level with number
- `python-intermediate` - descriptive
- `typescript-basics` - clear and concise

❌ **Avoid:**
- Spaces (use hyphens: `my-course` not `my course`)
- Uppercase letters (use lowercase: `js-101` not `JS-101`)
- Special characters (only letters, numbers, hyphens)
- Duplicate IDs (check existing courses first)

### Export Names (Automatic)

Your course ID determines the export name:
- Course ID: `rust-101`
- Export name: `rust101Course`
- Used in: `export const rust101Course = { ... }`

**For existing courses**, the original export name is preserved:
- `js-101` keeps `jsCourse` (not changed to `js101Course`)
- `py-101` keeps `pyCourse`
- `c-101` keeps `cCourse`

---

## Troubleshooting

### "Course saved to localStorage but not visible"

**Problem:** You saved to browser but don't see changes.  
**Solution:** 
- Refresh the browser (`F5`)
- Click "Preview" to see changes
- Check that you clicked "Save to Browser" (green button)

### "I published a course but it's not showing in the app"

**Problem:** Course exists in code but isn't visible to students.  
**Solution:**
- ⚠️ **Restart the dev server** - new courses require a restart
- Wait 5-10 seconds for Vite to recompile
- Clear browser cache (`Ctrl+Shift+Delete`)
- Hard refresh (`Ctrl+Shift+R`)

### "Export name keeps changing to wrong format"

**Problem:** `jsCourse` changed to `js101Course` when editing.  
**Solution:**
- This is fixed! The system now preserves existing export names
- If it still happens, check that course ID matches exactly (e.g., `js-101` not `js101`)

### "Module code editor shows no syntax highlighting"

**Problem:** Code in modules isn't highlighted.  
**Solution:**
- Make sure you selected the correct **Language** (Python, JavaScript, etc.)
- Wrap code in markdown: ` ```python ... ``` `
- Refresh the preview

### "Can't login - wrong password"

**Problem:** Login fails with "Invalid credentials".  
**Solution:**
- Moderator password: `GemGoblin2025!` (copy exactly)
- Admin password: `GemMiner2025!` (different!)
- Check CAPS LOCK is off
- Session may have expired - try again

### "Server is offline - can't save to file"

**Problem:** "Server offline - saves to browser only" message.  
**Solution:**
- Make sure backend server is running: `npm run dev:all`
- Check that terminal shows "Server listening on port 5000"
- Restart the server if it crashed
- Save to browser first, then try again

---

## Best Practices

### Course Creation

✅ **DO:**
- Test courses thoroughly in Preview before publishing
- Start with Copper level for new topics
- Include 5-10 practice modules per course
- Add clear instructions in module descriptions
- Use consistent terminology across modules
- Export courses as backup before publishing

❌ **DON'T:**
- Publish without previewing first
- Use vague module titles like "Exercise 1" (use "Variables & Data Types")
- Mix multiple topics in one module
- Leave expected output blank in practice modules
- Delete published courses without admin approval

### Editing Existing Courses

✅ **DO:**
- Save to Browser first to test changes
- Preview changes before saving to file
- Inform other mods when making major changes
- Keep backups of important courses (export as JSON)
- Use "Revert Changes" if something breaks

❌ **DON'T:**
- Save directly to file without testing
- Change course IDs of published courses
- Delete modules without replacing them
- Change difficulty levels without updating content
- Publish incomplete courses

### Module Best Practices

✅ **Good practice modules:**
- Clear problem statement
- Relevant to learning goals
- Provide hints for common mistakes
- Expected output is exact and specific
- Solution is well-commented

✅ **Good module titles:**
- "Variables & Assignment" (not "Lesson 1")
- "Working with Lists" (not "Data Structures")
- "User Input Validation" (not "Practice")

### Content Quality

✅ **DO:**
- Use code examples in theory sections
- Include links to external resources
- Explain why, not just how
- Test code in expected output
- Use consistent formatting

❌ **DON'T:**
- Copy-paste from other sources without attribution
- Leave typos in final content
- Use outdated language features
- Assume prior knowledge without mentioning
- Make modules too long (break into smaller pieces)

---

## Keyboard Shortcuts

While editing courses:

| Key | Action |
|-----|--------|
| `Escape` | Cancel current edit, go back |
| `Tab` | Navigate between fields |
| `Ctrl+S` | Submit form (if applicable) |

---

## Contact & Support

**Need help?**
- Check this guide first (use Ctrl+F to search)
- Contact the admin team
- Review course examples: `js-101`, `py-101`, `c-101`
- Test in Preview mode before publishing

---

## Checklists

### Before Publishing a Course

- [ ] Course ID is unique and follows format (e.g., `rust-101`)
- [ ] Title is clear and descriptive
- [ ] Description explains learning outcomes
- [ ] All required fields are filled
- [ ] Tier level matches course content
- [ ] At least 3 modules are included
- [ ] Course is previewed and looks correct
- [ ] No typos or formatting issues
- [ ] Code examples work correctly
- [ ] All practice modules have expected output

### Before Editing a Published Course

- [ ] I know what changes I'm making
- [ ] I've backed up the current version (export)
- [ ] I'll preview before saving to file
- [ ] Changes don't break other modules
- [ ] I've tested the course in preview
- [ ] No other mods are currently editing this course

---

**Last Updated:** December 6, 2025  
**Version:** 1.0 - Initial Release
