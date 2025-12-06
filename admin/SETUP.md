# Course Management System - Quick Start

## Access (30 seconds)

### Already Integrated! No Setup Required.

#### Login via Admin Portal
1. Start both servers: `npm run dev:all`
2. Go to login page: `http://localhost:4000`
3. Click "Admin Portal" or "Moderator Portal" link
4. Choose your role and enter password:
   - **👑 Admin**: Password `GemMiner2025!`
   - **🧌 Mod**: Password `GemGoblin2025!`
5. ✅ Secure session created, access your dashboard

### Role Permissions

#### 👑 Admin (GemMiner2025!)
- ✅ Create/edit courses
- ✅ Preview courses
- ✅ Delete drafts
- ✅ Export as JSON
- ✅ **Publish to Live** (Admin only)
- ✅ Monitor all courses
- ✅ Full access to all features
- ✅ Server-side password verification (secure)

#### 🧌 Mod (GemGoblin2025!)
- ✅ Create/edit courses
- ✅ Preview courses
- ✅ Export as JSON
- ❌ Delete drafts (admin only)
- ❌ Publish to Live (admin only)
- ✅ Create and refine content
- ✅ Server-side password verification (secure)

### Exit Admin Mode
- Click "Exit Admin" button in admin header (red button)
- Session token is cleared
- Returns to normal user login

## First Run (Create a Test Course)

### Step 1: Create Course
1. Click ➕ "New Course" button (top right)
2. Fill in:
   - **Title:** "Gem Extraction Protocol"
   - **Description:** "Learn advanced gem mining techniques"
   - **Level:** 🥉 Copper - Foundational
   - **Icon:** Pick any emoji from selector
3. Click "Save Course"

### Step 2: Add a Module
1. Click ➕ "Add Module" button
2. Choose module type: **Practice**
3. Select first module (numbered 1)
4. Click "Edit" to configure

### Step 3: Configure Practice Module
In ModuleFormEditor, fill:
- **Theory:** "Learn how to use the gem extraction protocol"
- **Instructions:** "Write code that demonstrates the protocol initialization"
- **Code Template:**
  ```python
  # Initialize gem extraction
  protocol = ...
  ```
- **Expected Output:** `Extraction Ready`
- **Hint 1:** "Use protocol setup pattern"
- **Hint 2:** "Consider the initialization steps"
- **Hint 3:** "The protocol needs three parameters"
- **Solution:**
  ```python
  protocol = "Extraction_Ready"
  print(protocol)
  ```
5. Click "Save Module"

### Step 4: Preview Course
1. Back at AdminDashboard, click 👁️ "Preview" on your course
2. See exactly how students will see it:
   - Module with theory
   - Instructions
   - Stats
3. Scroll down, see JSON structure

### Step 5: Export Course
1. In Preview, click 💾 "Export JSON"
2. Browser downloads `course-id.json`
3. Save this file - it's your backup!

### Step 6: Publish (Manual Step)
1. In Preview, click 🚀 "Publish to Live"
2. Copy the JSON from export
3. In `/src/data/`, create `gem-extraction-protocol.jsx`:

```javascript
import React from 'react';
import { Pickaxe } from 'lucide-react';

// Paste exported JSON here, wrapped in object
const gemextractionprotocol = {
  "courseId": "gem-extraction-protocol",
  "title": "Gem Extraction Protocol",
  "description": "Learn advanced gem mining techniques",
  "level": "Copper",
  "icon": "⛏️",
  "modules": [
    {
      "id": "m1",
      "type": "practice",
      "title": "Protocol Initialization",
      "theory": "Learn how to use the gem extraction protocol",
      "instructions": "Write code that demonstrates the protocol initialization",
      "template": "# Initialize gem extraction\nprotocol = ...",
      "expectedOutput": "Extraction Ready",
      "hints": [
        "Use protocol setup pattern",
        "Consider the initialization steps",
        "The protocol needs three parameters"
      ],
      "solution": "protocol = \"Extraction_Ready\"\nprint(protocol)"
    }
  ]
};

export { gemextractionprotocol };
```

4. In `App.jsx`, import and add to COURSES:

```javascript
import { gemextractionprotocol } from './data/gem-extraction-protocol';

const COURSES = [
  pythoncourse,
  jsbasics,
  cbasics,
  gemextractionprotocol // Add here
];
```

5. Deploy! Course now live for all miners in CodeQuarry.

## File Structure

```
admin/
├── README.md                  # Full documentation
├── SETUP.md                   # This file
└── sample-course.json         # Example export

src/components/
├── AdminDashboard.jsx         # Main admin hub
├── ModuleEditor.jsx           # Course metadata editor
├── ModuleFormEditor.jsx       # Per-module form editor
└── CoursePreview.jsx          # Preview & export

src/pages/
└── LoginPage.jsx              # Now has admin portal link

src/
└── App.jsx                    # Now has navbar admin button + admin mode
```

## Data Storage

### During Development
- **Drafts:** localStorage → `courseDrafts` key
  - Automatically saved as you type
  - Survives page refresh
  - Can be cleared if localStorage is wiped

### For Publishing
- **Exports:** Browser downloads as JSON file
  - Manually uploaded to Git/version control
  - Used as backup or shared with team

- **Live:** `/src/data/course-name.jsx`
  - Published courses live here
  - Imported in App.jsx COURSES array
  - Deployed with production build

## Troubleshooting

### "Wrong Password" Error
- Admin password: **`GemMiner2025!`**
- Mod password: **`GemGoblin2025!`**
- Check caps lock
- Copy-paste from docs if unsure
- Session expires after 30 minutes (login again)
- Make sure backend server is running (port 5000)

### Drafts Not Showing
- Open DevTools (F12) → Application → Storage → localStorage
- Check if `courseDrafts` key exists
- If empty, start creating a new course

### Course Not Showing After Publish
1. Verify file was created in `/src/data/`
2. Check import in App.jsx
3. Verify export syntax: `export const courseId = { ... }`
4. Restart dev server (`npm run dev`)
5. Hard refresh browser (Ctrl+Shift+R)

### JSON Export is Empty
- Ensure all modules have content
- Check that theory, instructions, and solution are filled
- Try re-editing the course in ModuleEditor

## Next Steps

### For Course Creators
- Create test courses in admin panel
- Export and backup to Git
- Have admin review before publishing

### For Admins
- Set up automated "Publish to Live" workflow (future)
- Consider database backend for scaling (future)
- Monitor which courses are popular

### For Team Leads
- Share password `GemMiner` with authorized admins only
- Store copies of important exports in Git
- Plan course roadmap in Admin dashboard

## Tips & Best Practices

1. **Always Export Before Publishing**
   - Keep JSON backups in version control
   - Rollback is as easy as deploying old JSON

2. **Test in Preview First**
   - Preview tab shows exact student experience
   - Catch typos and broken links before publishing

3. **Use Descriptive Hint Progression**
   - Hint 1: General direction
   - Hint 2: More specific guidance
   - Hint 3: Almost-solution
   - Solution: Full working code

4. **Template Code Should Be Incomplete**
   - Students need something to work with
   - Too complete = boring task
   - Too empty = students get stuck

5. **Expected Output Must Match Exactly**
   - Regex: Use `.+` for flexible matching
   - Exact: Use `print('exact text')` format
   - Test manually before saving

## Questions?

Refer to the detailed architecture in `admin/README.md` for comprehensive documentation of all components and workflows.
├── ModuleFormEditor.jsx       # Per-module form editor
└── CoursePreview.jsx          # Preview & export

src/pages/
└── LoginPage.jsx              # Now has admin portal link

src/
└── App.jsx                    # Now has navbar admin button + admin mode
```

## Data Storage

### During Development
- **Drafts:** localStorage → `courseDrafts` key
  - Automatically saved as you type
  - Survives page refresh
  - Can be cleared if localStorage is wiped

### For Publishing
- **Exports:** Browser downloads as JSON file
  - Manually uploaded to Git/version control
  - Used as backup or shared with team

- **Live:** `/src/data/course-name.jsx`
  - Published courses live here
  - Imported in App.jsx COURSES array
  - Deployed with production build
3. If approved: publish
4. Deploy to production

## Tips & Tricks

- **Copy Modules**: Edit a course → click "Copy" on any module to duplicate it
- **Backup Drafts**: Export courses regularly to save offline
- **Version Control**: Store exports in git for course version history
- **Bulk Import**: Export → modify JSON → import updated version

## Troubleshooting

**"Can't see my draft"**
- Clear browser localStorage: F12 → Application → localStorage → Clear All
- Create a new draft

**"Export doesn't work"**
- Check browser download settings
- Try different browser

**"Module validation fails"**
- Regex must be valid JavaScript regex
- Practice modules need: title, instructions, language

## Next Steps

- [ ] Add role-based access (only admins can publish)
- [ ] Add course categories/tags
- [ ] Add estimated completion time
- [ ] Add difficulty level indicators
- [ ] Add module preview (run code preview)
- [ ] Connect to backend database

Need help? Check `admin/README.md` for full docs.
