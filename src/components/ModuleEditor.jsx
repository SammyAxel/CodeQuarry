import React, { useState, useEffect } from 'react';
import { ChevronLeft, Plus, X, Copy, AlertCircle, Server, ServerOff, Save, Upload } from 'lucide-react';
import { ModuleFormEditor } from './ModuleFormEditor';
import { generateCSRFToken, verifyCSRFToken, logSecurityEvent, sanitizeInput } from '../utils/securityUtils';

const ICONS = ['📚', '🐍', '🟨', '⚙️', '🎮', '🚀', '💻', '🔧'];

export const CourseEditor = ({ course, onSave, onCancel, serverOnline = false, isPublishedEdit = false }) => {
  const [data, setData] = useState(course);
  const [editingModule, setEditingModule] = useState(null);
  const [editingModuleIndex, setEditingModuleIndex] = useState(null);
  const [customIconPreview, setCustomIconPreview] = useState(course.customIconUrl || null);
  const [csrfToken, setCSRFToken] = useState('');

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

    // Save course
    logSecurityEvent('course_save_success', { 
      courseId: course.id,
      modules: data.modules.length,
      timestamp: new Date().toISOString()
    });
    
    onSave(data);
    
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
                <option value="Copper">🥉 Copper - Foundational</option>
                <option value="Silver">⚪ Silver - Intermediate</option>
                <option value="Gold">🟡 Gold - Advanced</option>
                <option value="Platinum">💎 Platinum - Expert</option>
              </select>
              <p className="text-xs text-gray-500 mt-2">Choose the difficulty tier for this course</p>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-400 uppercase">Icon</label>
              <p className="text-xs text-gray-500 mt-1 mb-2">Choose an emoji or upload a custom image (PNG/JPG, max 2MB)</p>
              <div className="grid grid-cols-4 gap-2 mt-2">
                {ICONS.map((icon) => (
                  <button
                    key={icon}
                    onClick={() => {
                      setData({ ...data, icon, customIconUrl: null });
                      setCustomIconPreview(null);
                    }}
                    className={`p-3 text-2xl rounded-lg transition-all ${
                      data.icon === icon && !data.customIconUrl
                        ? 'bg-purple-600 border-2 border-purple-400'
                        : 'bg-gray-800 border border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
              
              {/* Custom Icon Upload */}
              <div className="mt-4 p-3 bg-gray-800 rounded-lg border border-gray-700">
                <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Or Upload Custom Icon</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
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
                        setData({ ...data, customIconUrl: null, icon: '📚' });
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
              {isPublishedEdit && (
                <div className={`flex items-center gap-2 text-xs px-3 py-2 rounded ${serverOnline ? 'bg-green-900/30 text-green-400' : 'bg-yellow-900/30 text-yellow-400'}`}>
                  {serverOnline ? <Server className="w-3 h-3" /> : <ServerOff className="w-3 h-3" />}
                  {serverOnline ? 'Server online - can save to file' : 'Server offline - saves to browser only'}
                </div>
              )}
              
              {/* Save to localStorage (default) */}
              <button
                onClick={handleSaveCourse}
                className="w-full px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg font-bold transition-colors flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                {isPublishedEdit ? 'Save to Browser' : 'Save Course'}
              </button>
              
              {/* Save to file (if server online and editing published course) */}
              {isPublishedEdit && serverOnline && (
                <button
                  onClick={() => {
                    if (!verifyCSRFToken('course-editor', csrfToken)) {
                      alert('Security error: Invalid form token.');
                      return;
                    }
                    onSave(data, true); // true = save to file
                    const token = generateCSRFToken('course-editor');
                    setCSRFToken(token);
                  }}
                  className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg font-bold transition-colors flex items-center justify-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Save to File
                </button>
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
              <div key={module.id} className="bg-gray-900/50 border border-gray-800 rounded-lg p-4 hover:border-purple-600/50 transition-all">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="font-bold">{module.title}</h4>
                    <p className="text-sm text-gray-400">Type: {module.type}</p>
                  </div>
                  <span className="text-xs px-2 py-1 bg-blue-600/20 text-blue-300 rounded">
                    {module.language || 'N/A'}
                  </span>
                </div>

                <div className="flex gap-2">
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
