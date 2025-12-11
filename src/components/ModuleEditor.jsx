import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, Plus, X, Copy, AlertCircle, Server, ServerOff, Save, Upload, Download, FileJson, GripVertical, BookOpen, Zap, Palette, Settings, Gamepad2, Rocket, Code, Wrench } from 'lucide-react';
import { ModuleFormEditor } from './ModuleFormEditor';
import { generateCSRFToken, verifyCSRFToken, logSecurityEvent, sanitizeInput } from '../utils/securityUtils';
import { COURSE_TIERS, VALIDATION } from '../constants/courseConstants';

// Course icon options with lucide icons
const COURSE_ICONS = [
  { icon: BookOpen, name: 'book', label: 'Book' },
  { icon: Zap, name: 'zap', label: 'Lightning' },
  { icon: Palette, name: 'palette', label: 'Palette' },
  { icon: Settings, name: 'settings', label: 'Settings' },
  { icon: Gamepad2, name: 'gamepad', label: 'Gamepad' },
  { icon: Rocket, name: 'rocket', label: 'Rocket' },
  { icon: Code, name: 'code', label: 'Code' },
  { icon: Wrench, name: 'wrench', label: 'Tools' }
];

export const CourseEditor = ({ course, onSave, onCancel, serverOnline = false, isPublishedEdit = false, adminRole = 'admin' }) => {
  const [data, setData] = useState(course);
  const [editingModule, setEditingModule] = useState(null);
  const [editingModuleIndex, setEditingModuleIndex] = useState(null);
  const [customIconPreview, setCustomIconPreview] = useState(course.customIconUrl || null);
  const [csrfToken, setCSRFToken] = useState('');
  const fileInputRef = useRef(null);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  // Generate CSRF token on component mount
  useEffect(() => {
    const token = generateCSRFToken('course-editor');
    setCSRFToken(token);
  }, []);

  const handleAddModule = () => {
    setEditingModule({
      id: `mod-${Date.now()}`,
      title: 'New Module',
      type: 'practice', // practice, article, video
      theory: '',
      instruction: '',
      initialCode: '',
      language: 'python',
      expectedOutput: '',
      requiredSyntax: '',
      hints: [],
      solution: ''
    });
    setEditingModuleIndex(null);
  };

  const handleEditModule = (index) => {
    setEditingModule(data.modules[index]);
    setEditingModuleIndex(index);
  };

  const handleSaveModule = (module) => {
    let modules = [...data.modules];
    if (editingModuleIndex !== null) {
      modules[editingModuleIndex] = module;
    } else {
      modules.push(module);
    }
    setData({ ...data, modules });
    setEditingModule(null);
    setEditingModuleIndex(null);
  };

  const handleDeleteModule = (index) => {
    const modules = data.modules.filter((_, i) => i !== index);
    setData({ ...data, modules });
  };

  const handleDuplicateModule = (index) => {
    const module = { ...data.modules[index], id: `mod-${Date.now()}` };
    setData({ ...data, modules: [...data.modules, module] });
  };

  // Drag and drop handlers
  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.currentTarget);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const newModules = [...data.modules];
    const draggedModule = newModules[draggedIndex];
    
    // Remove from old position
    newModules.splice(draggedIndex, 1);
    
    // Insert at new position
    newModules.splice(dropIndex, 0, draggedModule);
    
    // Renumber module IDs to match new order
    const coursePrefix = data.id || 'course';
    const renumberedModules = newModules.map((module, idx) => ({
      ...module,
      id: `${coursePrefix}-m${idx}`
    }));
    
    setData({ ...data, modules: renumberedModules });
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Export modules as JSON
  const handleExportModules = () => {
    const modulesJSON = JSON.stringify(data.modules, null, 2);
    const blob = new Blob([modulesJSON], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${data.id}-modules.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    logSecurityEvent('modules_exported', { 
      courseId: course.id,
      moduleCount: data.modules.length,
      timestamp: new Date().toISOString()
    });
  };

  // Import modules from JSON
  const handleImportModules = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.json')) {
      alert('Please select a valid JSON file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedModules = JSON.parse(e.target.result);
        
        // Validate structure
        if (!Array.isArray(importedModules)) {
          alert('Invalid format: Expected an array of modules');
          return;
        }

        // Basic validation for each module
        const isValid = importedModules.every(mod => 
          mod.id && mod.title && mod.type
        );

        if (!isValid) {
          alert('Invalid module structure: Each module must have id, title, and type');
          return;
        }

        // Confirm before replacing
        const confirmed = window.confirm(
          `This will replace all ${data.modules.length} existing modules with ${importedModules.length} imported modules. Continue?`
        );

        if (confirmed) {
          setData({ ...data, modules: importedModules });
          logSecurityEvent('modules_imported', { 
            courseId: course.id,
            oldCount: data.modules.length,
            newCount: importedModules.length,
            timestamp: new Date().toISOString()
          });
          alert(`Successfully imported ${importedModules.length} modules!`);
        }
      } catch (error) {
        console.error('Import error:', error);
        alert('Failed to parse JSON file. Please check the file format.');
        logSecurityEvent('modules_import_failed', { 
          courseId: course.id,
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    };

    reader.readAsText(file);
    // Reset input so same file can be selected again
    event.target.value = '';
  };

  // Validate CSRF token before saving
  const handleSaveCourse = () => {
    // Verify CSRF token
    if (!verifyCSRFToken('course-editor', csrfToken)) {
      logSecurityEvent('course_save_csrf_failed', { 
        courseId: course.id,
        timestamp: new Date().toISOString()
      });
      alert('Security error: Invalid form token. Please refresh and try again.');
      return;
    }

    // Only admins can save to database; mods always save to localStorage
    const isAdmin = adminRole === 'admin';
    const saveToDatabase = isPublishedEdit && serverOnline && isAdmin;
    
    logSecurityEvent('course_save_success', { 
      courseId: course.id,
      modules: data.modules.length,
      destination: saveToDatabase ? 'database' : 'localStorage',
      adminRole: adminRole,
      timestamp: new Date().toISOString()
    });
    
    // Pass save destination to parent handler
    onSave(data, saveToDatabase);
    
    // Generate new token for next operation
    const token = generateCSRFToken('course-editor');
    setCSRFToken(token);
  };

  if (editingModule) {
    return (
      <ModuleFormEditor
        module={editingModule}
        onSave={handleSaveModule}
        onCancel={() => {
          setEditingModule(null);
          setEditingModuleIndex(null);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#0d1117] text-white p-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={onCancel}
          className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-3xl font-black">Edit Course</h1>
      </div>

      <div className="grid grid-cols-3 gap-8">
        {/* Course Meta */}
        <div className="col-span-1 bg-gray-900/50 border border-gray-800 rounded-lg p-6">
          <h3 className="font-bold mb-4 text-purple-400">Course Details</h3>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase">Course ID</label>
              <input
                type="text"
                value={data.id}
                onChange={(e) => setData({ ...data, id: sanitizeInput(e.target.value, 50).toLowerCase().replace(/\s+/g, '-') })}
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white mt-1 font-mono text-sm"
                placeholder="e.g., rust-101, web-201"
              />
              <p className="text-xs text-gray-500 mt-1">Unique identifier (lowercase, hyphens only). Used for filename.</p>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-400 uppercase">Title</label>
              <input
                type="text"
                value={data.title}
                onChange={(e) => setData({ ...data, title: sanitizeInput(e.target.value, 200) })}
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white mt-1"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-400 uppercase">Description</label>
              <textarea
                value={data.description}
                onChange={(e) => setData({ ...data, description: sanitizeInput(e.target.value, 1000) })}
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white mt-1 h-24 resize-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-400 uppercase">Tier Level</label>
              <select
                value={data.level}
                onChange={(e) => setData({ ...data, level: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white mt-1"
              >
                {COURSE_TIERS.map(tier => (
                  <option key={tier.value} value={tier.value}>
                    {tier.label} - {tier.description}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-2">Choose the difficulty tier for this course</p>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-400 uppercase">Icon</label>
              <p className="text-xs text-gray-500 mt-1 mb-2">Select a professional icon or upload a custom image (PNG/JPG, max 2MB)</p>
              <div className="grid grid-cols-4 gap-2 mt-2">
                {COURSE_ICONS.map(({ icon: IconComponent, name, label }) => (
                  <button
                    key={name}
                    onClick={() => {
                      setData({ ...data, icon: name, customIconUrl: null });
                      setCustomIconPreview(null);
                    }}
                    title={label}
                    className={`p-3 rounded-lg transition-all flex items-center justify-center ${
                      data.icon === name && !data.customIconUrl
                        ? 'bg-purple-600 border-2 border-purple-400 text-white'
                        : 'bg-gray-800 border border-gray-700 hover:border-gray-600 text-gray-300'
                    }`}
                  >
                    <IconComponent className="w-6 h-6" />
                  </button>
                ))}
              </div>
              
              {/* Custom Icon Upload */}
              <div className="mt-4 p-3 bg-gray-800 rounded-lg border border-gray-700">
                <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Or Upload Custom Icon</label>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      // Validate file size
                      if (file.size > VALIDATION.MAX_ICON_FILE_SIZE) {
                        alert(`File size must be less than ${VALIDATION.MAX_ICON_FILE_SIZE / (1024 * 1024)}MB`);
                        return;
                      }
                      // Validate file type
                      if (!VALIDATION.ALLOWED_ICON_TYPES.includes(file.type)) {
                        alert('File type must be PNG, JPG, WebP, or SVG');
                        return;
                      }
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        const dataUrl = event.target?.result;
                        setCustomIconPreview(dataUrl);
                        setData({ ...data, customIconUrl: dataUrl });
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="text-xs text-gray-400 block w-full"
                />
                {customIconPreview && (
                  <div className="mt-3 flex items-center gap-2">
                    <img src={customIconPreview} alt="custom icon" className="w-12 h-12 rounded border border-gray-600 object-cover" />
                    <button
                      onClick={() => {
                        setCustomIconPreview(null);
                        setData({ ...data, customIconUrl: null, icon: 'book' });
                      }}
                      className="text-xs px-2 py-1 bg-red-600/20 text-red-300 hover:bg-red-600/30 rounded transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 space-y-2">
              {/* Server status indicator */}
              {/* Advanced Options */}
              <button
                onClick={handleSaveCourse}
                className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 rounded-lg font-bold transition-all flex items-center justify-center gap-2 text-white shadow-lg"
              >
                <Save className="w-5 h-5" />
                Save Changes
              </button>
              
              {/* Server Status & Auto-Save Info */}
              {isPublishedEdit && (
                <div className={`text-xs p-3 rounded-lg border flex items-start gap-2 ${
                  adminRole === 'admin' && serverOnline
                    ? 'bg-green-900/20 border-green-600/50 text-green-300' 
                    : 'bg-blue-900/20 border-blue-600/50 text-blue-300'
                }`}>
                  <div className="flex-shrink-0 mt-0.5">
                    {serverOnline ? <Server className="w-4 h-4" /> : <ServerOff className="w-4 h-4" />}
                  </div>
                  <div>
                    {adminRole === 'admin' ? (
                      <>
                        <p className="font-semibold">Server Status: {serverOnline ? 'Online' : 'Offline'}</p>
                        <p className="text-xs opacity-90 mt-0.5">
                          {serverOnline 
                            ? '✅ Changes will be saved directly to production database.' 
                            : '⚠️ Changes will be saved locally and synced when server comes online.'}
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="font-semibold">Mod Permissions</p>
                        <p className="text-xs opacity-90 mt-0.5">
                          💾 Changes are saved locally. An admin will review and publish to production.
                        </p>
                      </>
                    )}
                  </div>
                </div>
              )}
              
              <input type="hidden" value={csrfToken} />
            </div>
          </div>
        </div>

        {/* Modules */}
        <div className="col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold">Modules</h3>
            <button
              onClick={handleAddModule}
              className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 hover:bg-purple-500 rounded text-sm font-bold transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Module
            </button>
          </div>

          <div className="space-y-3">
            {data.modules.map((module, idx) => (
              <div 
                key={module.id}
                draggable
                onDragStart={(e) => handleDragStart(e, idx)}
                onDragOver={(e) => handleDragOver(e, idx)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, idx)}
                onDragEnd={handleDragEnd}
                className={`bg-gray-900/50 border rounded-lg p-4 transition-all ${
                  draggedIndex === idx 
                    ? 'opacity-50 border-purple-500' 
                    : dragOverIndex === idx
                    ? 'border-purple-400 border-2 scale-[1.02]'
                    : 'border-gray-800 hover:border-purple-600/50'
                }`}
              >
                <div className="flex items-start gap-3 mb-2">
                  {/* Drag handle */}
                  <div className="cursor-move pt-1 text-gray-500 hover:text-purple-400 transition-colors">
                    <GripVertical className="w-5 h-5" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs px-1.5 py-0.5 bg-gray-700 text-gray-300 rounded font-mono">
                            #{idx + 1}
                          </span>
                          <h4 className="font-bold truncate">{module.title}</h4>
                        </div>
                        <p className="text-sm text-gray-400 mt-1">Type: {module.type}</p>
                      </div>
                      <span className="text-xs px-2 py-1 bg-blue-600/20 text-blue-300 rounded flex-shrink-0">
                        {module.language || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 ml-8">
                  <button
                    onClick={() => handleEditModule(idx)}
                    className="flex items-center gap-1 px-2 py-1 bg-yellow-600/20 text-yellow-300 hover:bg-yellow-600/30 rounded text-xs font-bold transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDuplicateModule(idx)}
                    className="flex items-center gap-1 px-2 py-1 bg-blue-600/20 text-blue-300 hover:bg-blue-600/30 rounded text-xs font-bold transition-colors"
                  >
                    <Copy className="w-3 h-3" />
                    Copy
                  </button>
                  <button
                    onClick={() => handleDeleteModule(idx)}
                    className="flex items-center gap-1 px-2 py-1 bg-red-600/20 text-red-300 hover:bg-red-600/30 rounded text-xs font-bold transition-colors ml-auto"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
