import React, { useState, useEffect } from 'react';
import { FileText, Plus, Edit2, Trash2, Check, Eye, Download, Upload, FolderOpen } from 'lucide-react';
import { CourseEditor } from './ModuleEditor';
import { CoursePreview } from './CoursePreview';

export const AdminDashboard = ({ adminRole = 'admin' }) => {
  const [view, setView] = useState('list'); // list, editor, preview, review
  const [drafts, setDrafts] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [editingCourse, setEditingCourse] = useState(null);
  
  // Check if user is admin (can publish/delete/edit all)
  const isAdmin = adminRole === 'admin';
  // Mods can create and edit but not publish

  // Load drafts from localStorage
  useEffect(() => {
    const savedDrafts = localStorage.getItem('courseDrafts');
    if (savedDrafts) {
      setDrafts(JSON.parse(savedDrafts));
    }
  }, []);

  // Save drafts to localStorage
  const saveDrafts = (updatedDrafts) => {
    setDrafts(updatedDrafts);
    localStorage.setItem('courseDrafts', JSON.stringify(updatedDrafts));
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

  // Save course
  const handleSaveCourse = (course) => {
    const existingIndex = drafts.findIndex(d => d.id === course.id);
    let updated;
    
    if (existingIndex >= 0) {
      updated = [...drafts];
      updated[existingIndex] = { ...course, updatedAt: new Date().toISOString() };
    } else {
      updated = [...drafts, { ...course, createdAt: new Date().toISOString() }];
    }
    
    saveDrafts(updated);
    setView('list');
    setEditingCourse(null);
  };

  // Delete draft
  const handleDeleteDraft = (id) => {
    const updated = drafts.filter(d => d.id !== id);
    saveDrafts(updated);
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

  // Import course JSON
  const handleImportCourse = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const imported = JSON.parse(event.target?.result);
          const updated = [...drafts, { ...imported, id: `course-${Date.now()}` }];
          saveDrafts(updated);
        } catch (err) {
          alert('Failed to import: Invalid JSON');
        }
      };
      reader.readAsText(file);
    }
  };

  if (view === 'editor' && editingCourse) {
    return (
      <CourseEditor
        course={editingCourse}
        onSave={handleSaveCourse}
        onCancel={() => {
          setView('list');
          setEditingCourse(null);
        }}
      />
    );
  }

  if (view === 'preview' && selectedCourse) {
    return (
      <CoursePreview
        course={selectedCourse}
        adminRole={adminRole}
        onBack={() => {
          setView('list');
          setSelectedCourse(null);
        }}
        onExport={() => handleExportCourse(selectedCourse)}
        onPublish={() => {
          // TODO: Copy to src/data
          alert('Course published! (Admin only - implement in App.jsx)');
          setView('list');
        }}
      />
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
          </div>
        </div>
        <p className="text-gray-400">
          Manage course drafts. Edit, preview, and export for admin review.
        </p>
      </div>

      {/* Drafts List */}
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
                      {course.level === 'Copper' ? '🥉' : course.level === 'Silver' ? '⚪' : course.level === 'Gold' ? '🟡' : '💎'} {course.level}
                    </span>
                    <span className="text-xs px-2 py-1 bg-purple-600/20 text-purple-300 rounded">
                      {course.modules?.length || 0} modules
                    </span>
                    <span className="text-xs text-gray-500">
                      {course.updatedAt ? `Updated ${new Date(course.updatedAt).toLocaleDateString()}` : 'Draft'}
                    </span>
                  </div>
                </div>
                <div className="text-2xl">{course.icon}</div>
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
                {isAdmin && (
                  <button
                    onClick={() => handleDeleteDraft(course.id)}
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
      </div>

      {/* Info Box */}
      <div className="mt-8 p-4 bg-purple-600/10 border border-purple-600/30 rounded-lg">
        <h4 className="font-bold text-purple-300 mb-2">How it works:</h4>
        <ul className="text-sm text-gray-300 space-y-1">
          <li>✓ Create new courses with the form builder</li>
          <li>✓ Edit and preview as you build</li>
          <li>✓ Export as JSON for version control</li>
          <li>✓ Admin (you) reviews and publishes to src/data/</li>
        </ul>
      </div>
    </div>
  );
};
