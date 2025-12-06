# Course Management System

## Overview
A complete admin interface for creating, editing, and publishing courses to CodeQuarry without touching code. Fully integrated into the app with role-based password-protected access.

### CodeQuarry Theming
All courses are designed around the CodeQuarry mining concept:
- **Courses** are "Gem Expeditions" (learning journeys)
- **Modules** are "Mining Sites" (specific skills to master)
- **Progress** is tracked through a tier system (Copper → Silver → Gold → Platinum)
- **Students** are "Miners" seeking to extract valuable coding knowledge
- **Content** should inspire through adventure and achievement metaphors

Use this theming when creating course titles, descriptions, and learning content!

## Role System

### 👑 Admin (Password: `GemMiner`)
- Full control: create, edit, delete, preview, export, and **publish** courses
- Can monitor all team activity
- Can delete drafts
- Access to "Publish to Live" button

### 🧌 Mod (Password: `GemGoblin`)
- Content creators: create, edit, preview, export courses
- Cannot delete drafts (admin removes outdated content)
- Cannot publish (admin handles deployment)
- Great for team content creation workflow

## Quick Start

### Accessing Admin Panel
1. On login page, click "Admin Portal" link (bottom)
2. Enter your password:
   - `GemMiner` → 👑 Admin mode
   - `GemGoblin` → 🧌 Mod mode
3. Access your respective dashboard with appropriate permissions

### Exit Admin Mode
- Click "Exit Admin" button in admin header (red button)
- Returns to normal user login screen

## Architecture

### Data Flow
```
User Login → Admin Portal Link (password-protected)
                          ↓
              Determine Role (Admin vs Mod)
                    ↙           ↖
            👑 Admin          🧌 Mod
          (Full Access)    (Create Only)
                ↓                ↓
       AdminDashboard (role-aware)
        ↙    ↓    ↓     ↖
    Create Edit Preview Export
               ↓
        CourseEditor
      (with icon upload)
               ↓
      ModuleFormEditor
               ↓
        CoursePreview
      👑 (Publish)
      🧌 (Export only)
```

## Features

### 1. **AdminDashboard** (`src/components/AdminDashboard.jsx`)
**Purpose:** Main admin hub for course management
- 📋 View all course drafts with metadata (modules, level, date created)
- ➕ Create new courses (opens ModuleEditor)
- ✏️ Edit existing course drafts
- 👁️ Preview how students will see courses
- 📥 Import courses from JSON backup files
- 📤 Export drafts as JSON (for backup/version control)
- 🗑️ Delete outdated or test drafts

**Key Features:**
- Storage: localStorage (`courseDrafts` key)
- Card-based UI showing module count, level, creation date
- One-click actions for each course
- Empty state with "Create Your First Course" button

### 2. **CourseEditor** (`src/components/ModuleEditor.jsx`)
**Purpose:** Course metadata and module structure builder
- 📝 Course title, description, and tier level input fields
- 🥉 **Tier System:** Choose difficulty level:
  - 🥉 **Copper** - Foundational (beginner learners)
  - ⚪ **Silver** - Intermediate (building confidence)
  - 🟡 **Gold** - Advanced (challenging content)
  - 💎 **Platinum** - Expert (mastery level)
- 🎨 Icon picker with 8 emoji options (📚 🐍 🟨 ⚙️ 🎮 🚀 💻 🔧)
- 📤 **Custom Icon Upload** - Upload your own image as course icon (PNG/JPG)
- 🧩 Module list with add/edit/delete/duplicate actions
- 💾 Auto-saves draft to localStorage

**Workflow:**
1. Enter course title and description (CodeQuarry-themed recommended)
2. Select difficulty tier (Copper→Silver→Gold→Platinum progression)
3. Choose visual icon for the course:
   - **Option A:** Select emoji from 8 preset icons
   - **Option B:** Upload custom image (displays as 96x96px rounded)
4. Add modules via "+ Add Module" button
5. Click "Edit" on any module to configure (opens ModuleFormEditor)
6. Click "Duplicate" to copy a module with all settings
7. Click "Delete" to remove a module
8. Auto-saves after each change

### 3. **ModuleFormEditor** (`src/components/ModuleFormEditor.jsx`)
**Purpose:** Per-module content and settings editor

**For Practice Modules:**
- 📖 Theory textarea (markdown-formatted explanation)
- 📋 Instructions textarea (step-by-step guidance)
- 💾 Initial code template (boilerplate users start with)
- ✅ Expected output string (what successful solution produces)
- 🔍 Regex syntax toggle (for complex output validation)
- 💡 Hints system (manage up to 3 progressive hints)
- ✨ Solution code textarea (full working solution)

**For Article Modules:**
- 📄 Rich markdown content textarea
- Supports headers, lists, code blocks, etc.

**For Video Modules:**
- 🔗 YouTube video URL field
- ⏱️ Duration in minutes
- 📝 Description text
- Embedded preview (if URL valid)

**Features:**
- Type switching (change module type anytime)
- Form field validation
- Hint add/remove with dedicated section
- Character count for longer fields

### 4. **CoursePreview** (`src/components/CoursePreview.jsx`)
**Purpose:** Student perspective review and publishing interface

**Shows:**
- 🎓 Course header card (icon, title, description, level badge)
- 📚 Module list with sequential numbering and module type icons
- 📊 Statistics panel (total modules, practice count, video count, article count)
- 📋 Raw JSON preview window (scrollable, max-height)
- 💾 "Export JSON" button (downloads `course-id.json`)
- 🚀 "Publish to Live" button (admin action)

**Preview Experience:**
- Exactly matches how students see the course
- Helps identify UI/UX issues before publishing
- JSON view enables technical review by team
- JSON export creates backup of course data

## How to Use

### Access the Admin Panel
```javascript
// In App.jsx, add route:
import { AdminDashboard } from './components/AdminDashboard';

// Add to your routing logic:
if (view === 'ADMIN') return <AdminDashboard />;
```

### Create a New Course
1. Click "New Course"
2. Fill in course details (title, description, level, icon)
3. Click "Add Module" to add modules
4. For each module, set type and fill in content
5. Click "Save Course"

### Edit a Course
1. Click "Edit" on any draft
2. Modify course or module details
3. Click "Save Course"

### Review a Course
1. Click "Preview" to see how students see it
2. Review modules and content
3. Export JSON for code review (optional)

### Publish a Course
1. Preview the course
2. Click "Publish to Live" (admin only)
3. Prompts admin to add to `/src/data/`

## Storage

### Drafts
- Stored in **localStorage** as `courseDrafts`
- JSON format for easy export
- Can be backed up or version-controlled

### Publishing
- Admin copies from preview to `/src/data/course-name.jsx`
- Integrates with existing course structure

## Module Structure

```javascript
{
  id: 'course-id',
  title: 'Course Title',
  description: 'Course description',
  level: 'Beginner|Intermediate|Advanced',
  icon: '📚', // emoji
  modules: [
    {
      id: 'mod-id',
      title: 'Module Title',
      type: 'practice|article|video',
      // For practice modules:
      theory: 'Markdown content',
      instruction: 'Step 1: ...\nStep 2: ...',
      initialCode: 'code template',
      language: 'python|javascript|c',
      expectedOutput: 'output',
      requiredSyntax: '/regex/',
      hints: ['Hint 1', 'Hint 2', 'Hint 3'],
      solution: 'solution code'
    }
  ]
}
```

## Team Workflow

### For Content Creators
1. Access AdminDashboard
2. Create course with modules
3. Export as JSON
4. Share with admin for review

### For Admin (You)
1. Review exported JSON
2. Provide feedback to team
3. Once approved, click "Publish"
4. Course goes live

### Benefits
- ✅ No code knowledge needed for team
- ✅ Form prevents invalid data
- ✅ Version control via JSON exports
- ✅ Easy rollback (keep old exports)
- ✅ Audit trail (timestamps on drafts)

## Future Enhancements

- [ ] Drag-and-drop module ordering
- [ ] Template library (copy existing courses)
- [ ] Collaborative editing (real-time with others)
- [ ] Scheduled publishing
- [ ] Analytics on draft edits
- [ ] Module preview (inline test editor)
- [ ] Image upload support
- [ ] Database backend (Firebase/Supabase)
