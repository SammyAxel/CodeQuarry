import React, { useState, useEffect } from 'react';
import { FileText, Plus, Edit2, Trash2, Check, Eye, Download, Upload, FolderOpen, AlertCircle, Shield, BookOpen, Layers, Server, ServerOff, Languages, Globe, Lock } from 'lucide-react';
import { CourseEditor } from './ModuleEditor';
import { CoursePreview } from './CoursePreview';
import { SecurityDashboard } from './SecurityDashboard';
import { CourseTranslationEditor } from './CourseTranslationEditor';
import { generateCSRFToken, verifyCSRFToken, logSecurityEvent, clearAllCSRFTokens, sanitizeInput } from '../utils/securityUtils';
import { publishCourse, saveCourse, checkServerHealth, getSessionToken, login as adminLogin } from '../utils/courseApi';
import { updateCourse } from '../api/courses';
import { useDrafts } from '../hooks/useDrafts';
import { COURSES, useCourses } from '../data/courses';
import { getCourseLanguages } from '../utils/courseTranslations';

export const AdminDashboard = ({ adminRole = 'admin', onUpdatePublishedCourses, onPublishDraft, onUnpublishCourse, customCourses = [] }) => {
  console.log('[AdminDashboard] Rendering with adminRole:', adminRole);
  
  const [view, setView] = useState('list'); // list, editor, preview, review, security, translate
  const [activeTab, setActiveTab] = useState('published'); // 'drafts' or 'published' or 'translations'
  const [publishedEdits, setPublishedEdits] = useState({}); // Stores local edits to published courses
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [editingCourse, setEditingCourse] = useState(null);
  const [serverOnline, setServerOnline] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [editingPublishedId, setEditingPublishedId] = useState(null); // Track if editing a published course
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);
  const [translatingCourse, setTranslatingCourse] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [pendingAction, setPendingAction] = useState(null); // Stores the action to execute after auth
  
  console.log('[AdminDashboard] About to call useDrafts');
  // IMPORTANT: All hooks must be called unconditionally before any early returns
  const { drafts, createDraft, updateDraft, deleteDraft, publishDraft } = useDrafts(adminRole);
  console.log('[AdminDashboard] useDrafts returned, about to call useCourses');
  const { courses: apiCourses, loading: coursesLoading, refetch: refetchCourses } = useCourses();
  console.log('[AdminDashboard] useCourses returned');
  
  // Permission helpers
  const isAdmin = adminRole === 'admin';
  const isMod = adminRole === 'mod';
  
  // Permission checks
  const canPublish = isAdmin;
  const canDelete = isAdmin;
  const canCreate = true; // Both admins and mods can create
  const canEdit = true; // Both admins and mods can edit

  // Load drafts from localStorage and check server health
  useEffect(() => {
    // Note: drafts are now managed by useDrafts hook which syncs with the API
    // We no longer load from localStorage directly here
    
    // Load published course edits from localStorage
    const savedPublishedEdits = localStorage.getItem('publishedCourseEdits');
    if (savedPublishedEdits) {
      setPublishedEdits(JSON.parse(savedPublishedEdits));
    }
    
    // Generate CSRF token for delete operations
    generateCSRFToken('admin-dashboard-delete');
    
    // Check if backend server is online
    checkServerHealth().then(online => {
      setServerOnline(online);
      if (online) {
        // Verify session token is available for API calls
        const token = getSessionToken();
        if (!token) {
          console.warn('No valid session token found - API calls may fail');
          logSecurityEvent('admin_dashboard_no_session', { 
            timestamp: new Date().toISOString()
          });
        }
      }
    });
  }, []);

  // Save published course edits to localStorage
  const savePublishedEdits = (updatedEdits) => {
    setPublishedEdits(updatedEdits);
    localStorage.setItem('publishedCourseEdits', JSON.stringify(updatedEdits));
    // Notify parent component about the update
    if (onUpdatePublishedCourses) {
      onUpdatePublishedCourses(updatedEdits);
    }
  };

  // Get merged published courses (API courses + local edits)
  const getMergedPublishedCourses = () => {
    const baseCourses = apiCourses || COURSES;
    return baseCourses.map(course => {
      if (publishedEdits[course.id]) {
        return { ...course, ...publishedEdits[course.id], _hasLocalEdits: true };
      }
      return { ...course, _hasLocalEdits: false };
    });
  };

  // Create new course
  const handleCreateCourse = () => {
    setEditingCourse({
      id: `course-${Date.now()}`,
      title: 'New Course',
      description: '',
      level: 'Beginner',
      icon: '📚',
      modules: [],
      createdAt: new Date().toISOString(),
      status: 'draft'
    });
    setView('editor');
  };

  // Check if user is authenticated, show modal if not
  const requireAuth = (action) => {
    const token = getSessionToken();
    if (!token) {
      setPendingAction(action);
      setShowAuthModal(true);
      return false;
    }
    return true;
  };
  const handleAuth = async (e) => {
    e.preventDefault();
    setIsAuthenticating(true);
    setAuthError('');

    try {
      await adminLogin(authPassword, 'admin');
      setShowAuthModal(false);
      setAuthPassword('');
      setServerOnline(true);
      
      // Execute pending action
      if (pendingAction) {
        pendingAction();
        setPendingAction(null);
      }
    } catch (adminErr) {
      try {
        await adminLogin(authPassword, 'mod');
        setShowAuthModal(false);
        setAuthPassword('');
        setServerOnline(true);
        
        // Execute pending action
        if (pendingAction) {
          pendingAction();
          setPendingAction(null);
        }
      } catch (modErr) {
        setAuthError('Invalid password');
        setAuthPassword('');
      }
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Save course - auto-detects destination (database if editing published + server online, otherwise localStorage)
  const handleSaveCourse = async (course, saveToDatabase = false) => {
    try {
      // Check if this is a published course edit
      if (editingPublishedId) {
        // Determine whether to save to database or localStorage
        const shouldSaveToDatabase = saveToDatabase && serverOnline;
        
        if (shouldSaveToDatabase) {
          // Check authentication before saving to database
          const token = getSessionToken();
          if (!token) {
            // Store the course data and action, show auth modal
            setPendingAction(() => async () => {
              try {
                await updateCourse(editingPublishedId, course);
                
                // Clear any localStorage edits for this course since it's now saved to database
                const updatedEdits = { ...publishedEdits };
                delete updatedEdits[editingPublishedId];
                savePublishedEdits(updatedEdits);
                
                await refetchCourses(); // Refresh courses from API
                logSecurityEvent('published_course_saved_to_db', {
                  courseId: editingPublishedId,
                  modules: course.modules?.length
                });
                alert('✅ Course successfully saved to production database!');
                setEditingPublishedId(null);
                setView('list');
                setEditingCourse(null);
              } catch (error) {
                console.error('Save to database error:', error);
                logSecurityEvent('published_course_save_db_failed', {
                  courseId: editingPublishedId,
                  error: error.message
                });
                // Fallback to localStorage
                const updatedEdits = {
                  ...publishedEdits,
                  [editingPublishedId]: {
                    ...course,
                    id: editingPublishedId,
                    updatedAt: new Date().toISOString()
                  }
                };
                savePublishedEdits(updatedEdits);
                alert('⚠️ Database save failed. Changes saved locally instead.');
                setEditingPublishedId(null);
              }
            });
            setShowAuthModal(true);
            return;
          }

          try {
            await updateCourse(editingPublishedId, course);
            
            // Clear any localStorage edits for this course since it's now saved to database
            const updatedEdits = { ...publishedEdits };
            delete updatedEdits[editingPublishedId];
            savePublishedEdits(updatedEdits);
            
            await refetchCourses(); // Refresh courses from API
            logSecurityEvent('published_course_saved_to_db', {
              courseId: editingPublishedId,
              modules: course.modules?.length
            });
            alert('✅ Course successfully saved to production database!');
            setEditingPublishedId(null);
            setView('list');
            setEditingCourse(null);
            return;
          } catch (error) {
            console.error('Save to database error:', error);
            logSecurityEvent('published_course_save_db_failed', {
              courseId: editingPublishedId,
              error: error.message
            });
            // Fallback to localStorage
            const updatedEdits = {
              ...publishedEdits,
              [editingPublishedId]: {
                ...course,
                id: editingPublishedId,
                updatedAt: new Date().toISOString()
              }
            };
            savePublishedEdits(updatedEdits);
            alert('⚠️ Database save failed. Changes saved locally instead.');
          }
        } else {
          // Save as an override to localStorage
          const updatedEdits = {
            ...publishedEdits,
            [editingPublishedId]: {
              ...course,
              id: editingPublishedId, // Keep original ID
              updatedAt: new Date().toISOString()
            }
          };
          savePublishedEdits(updatedEdits);
          logSecurityEvent('published_course_saved_local', {
            courseId: editingPublishedId,
            modules: course.modules?.length
          });
          alert('✅ Changes saved locally. (Server offline - will sync when available)');
        }
        
        setEditingPublishedId(null);
      } else {
        // Save as a draft to database
        try {
          const existingDraft = drafts.find(d => d.id === course.id);
          
          if (existingDraft) {
            // Update existing draft
            await updateDraft(existingDraft.id, {
              title: course.title,
              description: course.description,
              icon: course.icon,
              customIconUrl: course.customIconUrl,
              language: course.language,
              difficulty: course.difficulty,
              tier: course.tier,
              modules: course.modules,
              completionPercentage: course.completionPercentage || 0
            });
          } else {
            // Create new draft
            await createDraft({
              title: course.title,
              description: course.description,
              icon: course.icon,
              customIconUrl: course.customIconUrl,
              language: course.language,
              difficulty: course.difficulty,
              tier: course.tier,
              modules: course.modules,
              commission: 0
            });
          }
          
          logSecurityEvent('draft_saved', {
            courseId: course.id,
            modules: course.modules?.length
          });
          alert('✅ Draft saved successfully to database!');
        } catch (error) {
          console.error('Draft save error:', error);
          alert('❌ Failed to save draft: ' + error.message);
          logSecurityEvent('draft_save_failed', {
            courseId: course.id,
            error: error.message
          });
        }
      }
      
      setView('list');
      setEditingCourse(null);
    } catch (error) {
      console.error('Unexpected save error:', error);
      alert('❌ Unexpected error while saving. Please try again.');
      logSecurityEvent('course_save_unexpected_error', {
        courseId: editingPublishedId || course?.id,
        error: error.message
      });
    }
  };

  // Revert published course to original
  const handleRevertPublished = (courseId) => {
    const updatedEdits = { ...publishedEdits };
    delete updatedEdits[courseId];
    savePublishedEdits(updatedEdits);
    logSecurityEvent('published_course_reverted', { courseId });
  };

  // Delete draft with CSRF verification
  const handleDeleteDraft = (id, csrfToken) => {
    // Verify CSRF token
    if (!verifyCSRFToken('admin-dashboard-delete', csrfToken)) {
      logSecurityEvent('delete_draft_csrf_failed', { 
        draftId: id,
        timestamp: new Date().toISOString()
      });
      alert('Security error: Invalid form token. Please refresh and try again.');
      return;
    }

    logSecurityEvent('draft_deleted', { 
      draftId: id,
      timestamp: new Date().toISOString()
    });
    
    // Use the deleteDraft from useDrafts hook
    deleteDraft(id);
    setDeleteConfirmation(null);
    
    // Regenerate token for next delete
    generateCSRFToken('admin-dashboard-delete');
  };

  // Export for review
  const handleExportCourse = (course) => {
    const json = JSON.stringify(course, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${course.id}.json`;
    a.click();
  };

  // Import course JSON with sanitization
  const handleImportCourse = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const imported = JSON.parse(event.target?.result);
          
          // Sanitize imported data
          const sanitized = {
            ...imported,
            id: `course-${Date.now()}`,
            title: sanitizeInput(imported.title || 'Untitled Course', 200),
            description: sanitizeInput(imported.description || '', 1000),
            modules: (imported.modules || []).map(mod => ({
              ...mod,
              title: sanitizeInput(mod.title || 'Untitled Module', 200),
              instruction: sanitizeInput(mod.instruction || '', 5000),
              theory: sanitizeInput(mod.theory || '', 5000),
              initialCode: sanitizeInput(mod.initialCode || '', 5000),
              expectedOutput: sanitizeInput(mod.expectedOutput || '', 5000),
              solution: sanitizeInput(mod.solution || '', 5000),
              hints: (mod.hints || []).map(h => sanitizeInput(h, 1000))
            }))
          };
          
          // Use createDraft from useDrafts hook
          createDraft(sanitized);
          logSecurityEvent('course_imported', { 
            courseId: sanitized.id,
            modules: sanitized.modules.length
          });
        } catch (err) {
          logSecurityEvent('course_import_failed', { 
            error: err.message
          });
          alert('Failed to import: Invalid JSON or corrupted file');
        }
      };
      reader.readAsText(file);
    }
  };

  if (view === 'translate' && translatingCourse) {
    return (
      <CourseTranslationEditor
        course={translatingCourse}
        onClose={() => {
          setView('list');
          setTranslatingCourse(null);
        }}
        onSave={() => {
          // Refresh will happen automatically
        }}
      />
    );
  }

  if (view === 'editor' && editingCourse) {
    return (
      <CourseEditor
        course={editingCourse}
        onSave={handleSaveCourse}
        onCancel={() => {
          setView('list');
          setEditingCourse(null);
          setEditingPublishedId(null);
        }}
        serverOnline={serverOnline}
        isPublishedEdit={!!editingPublishedId}
      />
    );
  }

  if (view === 'preview' && selectedCourse) {
    return (
      <CoursePreview
        course={selectedCourse}
        adminRole={adminRole}
        serverOnline={serverOnline}
        isPublishing={isPublishing}
        onBack={() => {
          setView('list');
          setSelectedCourse(null);
        }}
        onExport={() => handleExportCourse(selectedCourse)}
        onPublish={async () => {
          if (!canPublish) {
            alert(`⛔ Only admins can publish courses to production.${isMod ? ' Mods can create and edit drafts, but admins must review and publish.' : ''}`);
            return;
          }
          
          if (!serverOnline) {
            alert('⚠️ Backend server is offline.\n\nStart the server with: npm run server\n\nCourse will be saved to localStorage as fallback.');
            // Fallback to localStorage
            if (onPublishDraft) {
              onPublishDraft(selectedCourse);
              // Remove from drafts using hook
              deleteDraft(selectedCourse.id);
              alert('✅ Course saved to localStorage (offline mode).\nRestart with server to save to file.');
              setView('list');
              setSelectedCourse(null);
            }
            return;
          }
          
          // Publish to actual file via backend
          setIsPublishing(true);
          try {
            await publishCourse(selectedCourse);
            
            // Remove from drafts after publishing using hook
            deleteDraft(selectedCourse.id);
            
            alert('✅ Course published successfully!\n\nThe file has been created at:\nsrc/data/' + selectedCourse.id + '.jsx\n\n⚠️ You need to restart the dev server (npm run dev) to see the changes.');
            setView('list');
            setSelectedCourse(null);
          } catch (error) {
            console.error('Publish error:', error);
            alert('❌ Failed to publish: ' + error.message);
          } finally {
            setIsPublishing(false);
          }
        }}
      />
    );
  }

  // Security Dashboard view (admin only)
  if (view === 'security' && isAdmin) {
    return (
      <SecurityDashboard onClose={() => setView('list')} />
    );
  }

  return (
    <div className="min-h-screen bg-[#0d1117] text-white p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-600/20 rounded-lg">
              <FileText className="w-6 h-6 text-purple-400" />
            </div>
            <h1 className="text-3xl font-black">Course Manager</h1>
          </div>
          <div className="flex gap-3">
            {isAdmin && (
              <button
                onClick={() => setView('security')}
                className="flex items-center gap-2 px-4 py-2 bg-red-600/20 text-red-300 hover:bg-red-600/30 rounded-lg font-bold transition-colors"
              >
                <Shield className="w-4 h-4" />
                Security
              </button>
            )}
            {activeTab === 'drafts' && (
              <>
                <label className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg cursor-pointer transition-colors">
                  <Upload className="w-4 h-4" />
                  Import JSON
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportCourse}
                    className="hidden"
                  />
                </label>
                <button
                  onClick={handleCreateCourse}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg font-bold transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  New Course
                </button>
              </>
            )}
          </div>
        </div>
        <p className="text-gray-400 mb-6">
          {activeTab === 'published' 
            ? 'Edit existing courses. Changes are saved locally and applied immediately.'
            : 'Manage course drafts. Edit, preview, and export for admin review.'}
        </p>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-800 pb-0">
          <button
            onClick={() => setActiveTab('published')}
            className={`flex items-center gap-2 px-6 py-3 font-bold text-sm transition-colors border-b-2 -mb-px ${
              activeTab === 'published'
                ? 'text-purple-400 border-purple-500 bg-purple-600/10'
                : 'text-gray-400 border-transparent hover:text-white hover:bg-gray-800/50'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Published Courses ({(apiCourses || COURSES).length})
          </button>
          <button
            onClick={() => setActiveTab('drafts')}
            className={`flex items-center gap-2 px-6 py-3 font-bold text-sm transition-colors border-b-2 -mb-px ${
              activeTab === 'drafts'
                ? 'text-purple-400 border-purple-500 bg-purple-600/10'
                : 'text-gray-400 border-transparent hover:text-white hover:bg-gray-800/50'
            }`}
          >
            <Layers className="w-4 h-4" />
            Drafts ({drafts.length})
          </button>
          <button
            onClick={() => setActiveTab('translations')}
            className={`flex items-center gap-2 px-6 py-3 font-bold text-sm transition-colors border-b-2 -mb-px ${
              activeTab === 'translations'
                ? 'text-purple-400 border-purple-500 bg-purple-600/10'
                : 'text-gray-400 border-transparent hover:text-white hover:bg-gray-800/50'
            }`}
          >
            <Languages className="w-4 h-4" />
            Translations
          </button>
        </div>
      </div>

      {/* Published Courses Tab */}
      {activeTab === 'published' && (
        <div className="grid gap-4">
          {getMergedPublishedCourses().map(course => (
            <div
              key={course.id}
              className={`bg-gray-900/50 border rounded-lg p-6 transition-all ${
                course._hasLocalEdits 
                  ? 'border-yellow-600/50 hover:border-yellow-500/70' 
                  : 'border-gray-800 hover:border-purple-600/50'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-xl font-bold">{course.title}</h3>
                    {course._hasLocalEdits && (
                      <span className="text-xs px-2 py-0.5 bg-yellow-600/20 text-yellow-300 rounded font-bold">
                        Modified
                      </span>
                    )}
                  </div>
                  <p className="text-gray-400 text-sm">{course.description || 'No description'}</p>
                  <div className="flex gap-3 mt-2 flex-wrap">
                    <span className={`text-xs px-2 py-1 rounded font-bold ${
                      course.level === 'Copper' ? 'bg-orange-600/20 text-orange-300' :
                      course.level === 'Silver' ? 'bg-slate-600/20 text-slate-300' :
                      course.level === 'Gold' ? 'bg-yellow-600/20 text-yellow-300' :
                      'bg-purple-600/20 text-purple-300'
                    }`}>
                      {course.level}
                    </span>
                    <span className="text-xs px-2 py-1 bg-purple-600/20 text-purple-300 rounded">
                      {course.modules?.length || 0} modules
                    </span>
                    {course._hasLocalEdits && course.updatedAt && (
                      <span className="text-xs text-yellow-400">
                        Edited {new Date(course.updatedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-2xl">{typeof course.icon === 'string' ? course.icon : '📚'}</div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => {
                    // Get the merged course with any local edits
                    const mergedCourse = publishedEdits[course.id] 
                      ? { ...course, ...publishedEdits[course.id] }
                      : course;
                    // Convert icon to string for editor
                    setEditingCourse({
                      ...mergedCourse,
                      icon: typeof mergedCourse.icon === 'string' ? mergedCourse.icon : '📚'
                    });
                    setEditingPublishedId(course.id);
                    setView('editor');
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 bg-yellow-600/20 text-yellow-300 hover:bg-yellow-600/30 rounded text-sm font-bold transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit Course
                </button>
                <button
                  onClick={() => {
                    const mergedCourse = publishedEdits[course.id] 
                      ? { ...course, ...publishedEdits[course.id] }
                      : course;
                    setSelectedCourse(mergedCourse);
                    setView('preview');
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 bg-blue-600/20 text-blue-300 hover:bg-blue-600/30 rounded text-sm font-bold transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  Preview
                </button>
                <button
                  onClick={() => {
                    const mergedCourse = publishedEdits[course.id] 
                      ? { ...course, ...publishedEdits[course.id] }
                      : course;
                    handleExportCourse(mergedCourse);
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 bg-green-600/20 text-green-300 hover:bg-green-600/30 rounded text-sm font-bold transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Export
                </button>
                {course._hasLocalEdits && canDelete && (
                  <button
                    onClick={() => handleRevertPublished(course.id)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-gray-600/20 text-gray-300 hover:bg-gray-600/30 rounded text-sm font-bold transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Revert Changes
                  </button>
                )}
              </div>
            </div>
          ))}

          {/* Info Box for Published */}
          <div className="mt-4 p-4 bg-blue-600/10 border border-blue-600/30 rounded-lg">
            <h4 className="font-bold text-blue-300 mb-2">📘 Editing Published Courses</h4>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>✓ Changes are saved to your browser's local storage</li>
              <li>✓ Edits are applied immediately to the app</li>
              <li>✓ Yellow "Modified" badge shows edited courses</li>
              <li>✓ Use "Revert Changes" to restore the original version</li>
              <li>✓ Export to JSON to save your changes permanently</li>
            </ul>
          </div>
        </div>
      )}

      {/* Drafts Tab */}
      {activeTab === 'drafts' && (
        <div className="grid gap-4">
        {drafts.length === 0 ? (
          <div className="text-center py-12 bg-gray-900/50 rounded-lg border border-gray-800">
            <FolderOpen className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">No course drafts yet. Create one to get started!</p>
          </div>
        ) : (
          drafts.map(course => (
            <div
              key={course.id}
              className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 hover:border-purple-600/50 transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-1">{course.title}</h3>
                  <p className="text-gray-400 text-sm">{course.description || 'No description'}</p>
                  <div className="flex gap-3 mt-2 flex-wrap">
                    <span className={`text-xs px-2 py-1 rounded font-bold ${
                      course.level === 'Copper' ? 'bg-orange-600/20 text-orange-300' :
                      course.level === 'Silver' ? 'bg-slate-600/20 text-slate-300' :
                      course.level === 'Gold' ? 'bg-yellow-600/20 text-yellow-300' :
                      'bg-purple-600/20 text-purple-300'
                    }`}>
                      {course.level}
                    </span>
                    <span className="text-xs px-2 py-1 bg-purple-600/20 text-purple-300 rounded">
                      {course.modules?.length || 0} modules
                    </span>
                    <span className="text-xs text-gray-500">
                      {course.updatedAt ? `Updated ${new Date(course.updatedAt).toLocaleDateString()}` : 'Draft'}
                    </span>
                  </div>
                </div>
                <div className="text-2xl">{typeof course.icon === 'string' ? course.icon : '📚'}</div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setSelectedCourse(course);
                    setView('preview');
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 bg-blue-600/20 text-blue-300 hover:bg-blue-600/30 rounded text-sm font-bold transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  Preview
                </button>
                <button
                  onClick={() => {
                    setEditingCourse(course);
                    setView('editor');
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 bg-yellow-600/20 text-yellow-300 hover:bg-yellow-600/30 rounded text-sm font-bold transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => handleExportCourse(course)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-green-600/20 text-green-300 hover:bg-green-600/30 rounded text-sm font-bold transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Export
                </button>
                {canDelete && (
                  <button
                    onClick={() => {
                      const token = generateCSRFToken('admin-dashboard-delete');
                      setDeleteConfirmation({ id: course.id, title: course.title, csrfToken: token });
                    }}
                    className="flex items-center gap-2 px-3 py-1.5 bg-red-600/20 text-red-300 hover:bg-red-600/30 rounded text-sm font-bold transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))
        )}

        {/* Info Box for Drafts */}
        <div className="mt-4 p-4 bg-purple-600/10 border border-purple-600/30 rounded-lg">
          <h4 className="font-bold text-purple-300 mb-2">How it works:</h4>
          <ul className="text-sm text-gray-300 space-y-1">
            <li>✓ Create new courses with the form builder</li>
            <li>✓ Edit and preview as you build</li>
            <li>✓ Export as JSON for version control</li>
            <li>✓ Admin (you) reviews and publishes to src/data/</li>
          </ul>
        </div>
        </div>
      )}

      {/* Translations Tab */}
      {activeTab === 'translations' && (
        <div className="grid gap-4">
          <div className="p-4 bg-purple-600/10 border border-purple-600/30 rounded-lg mb-4">
            <h4 className="font-bold text-purple-300 mb-2">📚 Course Translations</h4>
            <p className="text-sm text-gray-300">
              Translate course content to different languages. Click "Translate" to add or edit translations for any course.
            </p>
          </div>

          {(apiCourses || COURSES).map(course => {
            const availableLanguages = getCourseLanguages(course.id);
            const languageLabels = [
              { code: 'id', name: 'Indonesian', flag: '🇮🇩' },
              { code: 'es', name: 'Spanish', flag: '🇪🇸' },
              { code: 'fr', name: 'French', flag: '🇫🇷' },
              { code: 'de', name: 'German', flag: '🇩🇪' },
              { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
              { code: 'ko', name: 'Korean', flag: '🇰🇷' },
              { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
            ];

            return (
              <div
                key={course.id}
                className="bg-gray-900/50 border border-gray-800 hover:border-purple-600/50 rounded-lg p-6 transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-1">{course.title}</h3>
                    <p className="text-gray-400 text-sm mb-3">{course.description}</p>
                    
                    {/* Language Badges */}
                    <div className="flex gap-2 flex-wrap">
                      <div className="flex items-center gap-1 text-xs px-2 py-1 bg-green-600/20 text-green-300 rounded font-bold">
                        🇬🇧 English <Check className="w-3 h-3" />
                      </div>
                      {availableLanguages.map(lang => {
                        const langInfo = languageLabels.find(l => l.code === lang);
                        return langInfo ? (
                          <div key={lang} className="flex items-center gap-1 text-xs px-2 py-1 bg-purple-600/20 text-purple-300 rounded font-bold">
                            {langInfo.flag} {langInfo.name} <Check className="w-3 h-3" />
                          </div>
                        ) : null;
                      })}
                      {availableLanguages.length === 0 && (
                        <span className="text-xs text-gray-500 italic">No translations yet</span>
                      )}
                    </div>
                  </div>
                  <div className="text-2xl">{typeof course.icon === 'string' ? course.icon : '📚'}</div>
                </div>

                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => {
                      setTranslatingCourse(course);
                      setView('translate');
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-sm font-bold transition-colors"
                  >
                    <Languages className="w-4 h-4" />
                    Translate
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmation && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0d1117] border border-red-600/50 rounded-lg p-6 max-w-sm w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-600/20 rounded-lg">
                <AlertCircle className="w-6 h-6 text-red-400" />
              </div>
              <h2 className="text-xl font-bold text-white">Delete Course?</h2>
            </div>

            <p className="text-gray-300 mb-2">
              Are you sure you want to delete <span className="font-bold">"{deleteConfirmation.title}"</span>?
            </p>
            <p className="text-sm text-gray-400 mb-6">
              This action cannot be undone.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirmation(null)}
                className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded font-bold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteDraft(deleteConfirmation.id, deleteConfirmation.csrfToken)}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded font-bold transition-colors flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Authentication Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#161b22] border border-purple-500/30 rounded-lg p-8 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-6">
              <Lock className="w-6 h-6 text-purple-400" />
              <h2 className="text-2xl font-bold">Authentication Required</h2>
            </div>
            <p className="text-gray-300 mb-6">Enter your password to save to the server.</p>
            
            <form onSubmit={handleAuth} className="space-y-4">
              <div>
                <input
                  type="password"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  placeholder="Admin/Moderator password"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                  autoFocus
                />
              </div>
              
              {authError && (
                <div className="p-3 bg-red-900/20 border border-red-500/30 rounded text-red-400 text-sm">
                  {authError}
                </div>
              )}
              
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAuthModal(false);
                    setAuthPassword('');
                    setAuthError('');
                    setPendingAction(null);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAuthenticating}
                  className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-600 text-white rounded font-bold transition-colors"
                >
                  {isAuthenticating ? 'Authenticating...' : 'Login'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
