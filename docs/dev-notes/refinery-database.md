# Refinery Database Integration

## ✅ Database Status: Already Compatible!

Your PostgreSQL database **already supports Refinery** out of the box! No migrations needed.

## Database Structure

### Courses Table
```sql
CREATE TABLE courses (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  custom_icon_url TEXT,
  language TEXT DEFAULT 'javascript',
  difficulty TEXT DEFAULT 'copper',
  is_published BOOLEAN DEFAULT false,
  is_premium BOOLEAN DEFAULT false,
  author_id INTEGER,
  modules JSONB NOT NULL DEFAULT '[]',  -- ✅ Stores refineryCriteria
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Key Point:** The `modules` column is **JSONB**, which means it can store the entire module structure including `refineryCriteria` without any schema changes!

## How Refinery Data is Stored

When you add refinery criteria to a module in the Course Editor, it's saved like this:

```javascript
{
  "id": "js-m13",
  "title": "FizzBuzz Challenge",
  "type": "practice",
  // ... other module fields ...
  "refineryCriteria": {
    "description": "Optimize your FizzBuzz to 8 lines or less",
    "maxLines": 8,
    "noNestedLoops": true,
    "maxComplexity": 5,
    "requireComments": false,
    "forbiddenPatterns": [],
    "requiredPatterns": []
  }
}
```

This entire structure is stored in the `modules` JSONB column.

## Frontend Check: Already Implemented! ✅

The practice component **already checks** if a module has refinery:

**File:** `src/components/practice.jsx` (Line ~314)

```jsx
{/* Only show if module has refinery criteria */}
{module.refineryCriteria && (
  <button 
    onClick={() => {
      setShowSuccessModal(false);
      setShowRefineryModal(true);
    }}
    className="..."
  >
    <Sparkles className="w-5 h-5" />
    Enter The Refinery
    {refineryBest && (
      <span className="ml-2 px-2 py-1 bg-yellow-500/20 rounded text-xs">
        Best: {refineryBest.score}
      </span>
    )}
  </button>
)}
```

**Logic:**
- If `module.refineryCriteria` exists → Show "Enter The Refinery" button
- If `module.refineryCriteria` is undefined/null → Button doesn't appear
- Student proceeds normally without seeing Refinery

## Updating Existing Courses

### Option 1: Via Course Editor UI (Recommended)
1. Go to Course Editor
2. Edit any practice module
3. Enable "The Refinery" toggle
4. Configure criteria
5. Save → Auto-updates database

### Option 2: Via SQL (Direct Database)
```sql
UPDATE courses
SET modules = jsonb_set(
  modules,
  '{0,refineryCriteria}',  -- Path to module[0].refineryCriteria
  '{
    "description": "Optimize to 8 lines",
    "maxLines": 8,
    "noNestedLoops": true
  }'::jsonb
)
WHERE id = 'js-101';
```

### Option 3: Export, Edit JSON, Import
1. Use "Export Modules JSON" in Course Editor
2. Add `refineryCriteria` to modules in JSON file
3. Use "Import Modules JSON" to upload back
4. Database auto-updates via API

## Refinery Progress Storage

Student refinery scores are currently stored in **localStorage**:

```javascript
// Key format: refinery_{courseId}_{moduleId}
// Example: refinery_js-101_js-m13
{
  "score": 95,
  "metrics": {
    "lineCount": 6,
    "cyclomaticComplexity": 3,
    "hasNestedLoops": false,
    "commentCount": 2
  },
  "timestamp": 1701234567890
}
```

### Future: Save to Database (Optional)

If you want to persist refinery scores in the database, add a new table:

```sql
CREATE TABLE refinery_progress (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  course_id TEXT NOT NULL,
  module_id TEXT NOT NULL,
  best_score INTEGER NOT NULL,
  metrics JSONB,
  achieved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, course_id, module_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

Then update `practice.jsx`:

```javascript
onAttempt={async (result) => {
  setRefineryBest(result);
  
  // Save to localStorage (current)
  const key = `refinery_${courseId}_${module.id}`;
  localStorage.setItem(key, JSON.stringify(result));
  
  // TODO: Also save to database
  try {
    await fetch('/api/refinery/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        courseId,
        moduleId: module.id,
        score: result.score,
        metrics: result.metrics
      })
    });
  } catch (err) {
    console.error('Failed to save refinery score:', err);
  }
}}
```

## API Endpoints (Current)

No special Refinery endpoints needed! The existing course API handles everything:

- `GET /api/courses/:id` → Returns full course with modules (including refineryCriteria)
- `PUT /api/courses/:id` → Updates course (Course Editor uses this)
- `GET /api/user/progress/:courseId` → Returns module progress

## Testing Refinery in Database

1. **Add refinery to a module:**
   ```bash
   # Via Course Editor UI, or manually via SQL
   ```

2. **Verify it's saved:**
   ```sql
   SELECT modules::jsonb->0->'refineryCriteria' 
   FROM courses 
   WHERE id = 'js-101';
   ```

3. **Test as student:**
   - Complete the module
   - Look for "Enter The Refinery" button
   - If button appears → Database integration working!
   - If no button → Check `refineryCriteria` exists in module

## Migration Checklist

- ✅ Database schema compatible (JSONB supports refineryCriteria)
- ✅ Frontend checks for refinery existence before showing button
- ✅ Course Editor saves refinery data to database
- ✅ Import/Export maintains refinery fields
- ✅ Students can skip modules without refinery normally
- ⚠️ Refinery scores currently localStorage only (optional: migrate to DB)

## Summary

**No database changes required!** Your JSONB setup already handles Refinery perfectly. Just:

1. Add `refineryCriteria` via Course Editor
2. Save the course (auto-updates DB)
3. Refinery button appears automatically for those modules
4. Modules without refinery work normally

That's it! 🎉
