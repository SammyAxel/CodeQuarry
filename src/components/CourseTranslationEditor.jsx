import React, { useState, useEffect } from 'react';
import { Languages, Save, X, Plus, Trash2, Globe, Layers } from 'lucide-react';
import { getCourseTranslation, setCourseTranslation, removeCourseTranslation, getCourseLanguages } from '../utils/courseTranslations';

const LANGUAGES = [
  { code: 'id', name: 'Indonesian', flag: '🇮🇩' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
];

export const CourseTranslationEditor = ({ course, onClose, onSave }) => {
  const [selectedLanguage, setSelectedLanguage] = useState('id');
  const [translation, setTranslation] = useState({
    title: '',
    description: '',
    modules: []
  });
  const [availableLanguages, setAvailableLanguages] = useState([]);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    // Load available languages for this course
    const languages = getCourseLanguages(course.id);
    setAvailableLanguages(languages);
    
    // Load translation for selected language
    const trans = getCourseTranslation(course.id, selectedLanguage);
    if (trans) {
      setTranslation(trans);
      setIsEditing(true);
    } else {
      // Initialize with empty translation
      setTranslation({
        title: course.title,
        description: course.description,
        modules: course.modules.map(m => ({
          title: m.title,
          theory: m.theory || '',
          instruction: m.instruction || '',
          hints: m.hints || []
        }))
      });
      setIsEditing(false);
    }
  }, [course, selectedLanguage]);

  const handleSave = async () => {
    try {
      await setCourseTranslation(course.id, selectedLanguage, translation);
      setAvailableLanguages([...new Set([...availableLanguages, selectedLanguage])]);
      setIsEditing(true);
      if (onSave) onSave();
      alert('✅ Translation saved successfully!');
    } catch (error) {
      console.error('Error saving translation:', error);
      alert('Failed to save translation. Changes saved locally as backup.');
    }
  };

  const handleDelete = async () => {
    if (confirm(`Delete ${LANGUAGES.find(l => l.code === selectedLanguage)?.name} translation?`)) {
      try {
        await removeCourseTranslation(course.id, selectedLanguage);
        setAvailableLanguages(availableLanguages.filter(l => l !== selectedLanguage));
        setIsEditing(false);
        // Reset to empty
        setTranslation({
          title: course.title,
          description: course.description,
          modules: course.modules.map(m => ({
            title: m.title,
            theory: m.theory || '',
            instruction: m.instruction || '',
            hints: m.hints || []
          }))
        });
        alert('✅ Translation deleted successfully!');
      } catch (error) {
        console.error('Error deleting translation:', error);
        alert('Failed to delete translation from server.');
      }
    }
  };

  const updateModuleTranslation = (moduleIndex, field, value) => {
    const newModules = [...translation.modules];
    newModules[moduleIndex] = {
      ...newModules[moduleIndex],
      [field]: value
    };
    setTranslation({ ...translation, modules: newModules });
  };

  const updateModuleHint = (moduleIndex, hintIndex, value) => {
    const newModules = [...translation.modules];
    const newHints = [...(newModules[moduleIndex].hints || [])];
    newHints[hintIndex] = value;
    newModules[moduleIndex] = {
      ...newModules[moduleIndex],
      hints: newHints
    };
    setTranslation({ ...translation, modules: newModules });
  };

  const selectedLang = LANGUAGES.find(l => l.code === selectedLanguage);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-xl border border-gray-800 max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-800 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <Languages className="w-6 h-6 text-purple-400" />
              <h2 className="text-2xl font-bold">Translate Course</h2>
            </div>
            <p className="text-gray-400 mt-1 text-sm">Course: {course.title}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Language Selector */}
        <div className="p-6 border-b border-gray-800">
          <label className="block text-sm font-bold text-gray-400 mb-2">Target Language</label>
          <div className="flex gap-2 flex-wrap">
            {LANGUAGES.map(lang => (
              <button
                key={lang.code}
                onClick={() => setSelectedLanguage(lang.code)}
                className={`px-4 py-2 rounded-lg font-bold transition-colors flex items-center gap-2 ${
                  selectedLanguage === lang.code
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <span className="text-xl">{lang.flag}</span>
                {lang.name}
                {availableLanguages.includes(lang.code) && (
                  <Globe className="w-4 h-4 text-green-400" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Translation Form */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Course Info */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-400 mb-2">
                Course Title ({selectedLang?.flag} {selectedLang?.name})
              </label>
              <input
                type="text"
                value={translation.title}
                onChange={(e) => setTranslation({ ...translation, title: e.target.value })}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500"
                placeholder={course.title}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-400 mb-2">
                Course Description ({selectedLang?.flag} {selectedLang?.name})
              </label>
              <textarea
                value={translation.description}
                onChange={(e) => setTranslation({ ...translation, description: e.target.value })}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500 h-24 resize-none"
                placeholder={course.description}
              />
            </div>
          </div>

          {/* Modules */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Layers className="w-5 h-5 text-purple-400" />
              Modules ({course.modules.length})
            </h3>
            {course.modules.map((module, index) => (
              <div key={module.id} className="bg-gray-800/50 rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-lg">Module {index + 1}: {module.title}</h4>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-400 mb-2">Module Title</label>
                  <input
                    type="text"
                    value={translation.modules[index]?.title || ''}
                    onChange={(e) => updateModuleTranslation(index, 'title', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500 text-sm"
                    placeholder={module.title}
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-400 mb-2">Theory (Markdown)</label>
                  <textarea
                    value={translation.modules[index]?.theory || ''}
                    onChange={(e) => updateModuleTranslation(index, 'theory', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500 text-sm h-32 resize-none font-mono"
                    placeholder={module.theory}
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-400 mb-2">Instructions</label>
                  <textarea
                    value={translation.modules[index]?.instruction || ''}
                    onChange={(e) => updateModuleTranslation(index, 'instruction', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500 text-sm h-20 resize-none"
                    placeholder={module.instruction}
                  />
                </div>

                {module.hints && module.hints.length > 0 && (
                  <div>
                    <label className="block text-sm font-bold text-gray-400 mb-2">Hints</label>
                    {module.hints.map((hint, hintIndex) => (
                      <input
                        key={hintIndex}
                        type="text"
                        value={translation.modules[index]?.hints?.[hintIndex] || ''}
                        onChange={(e) => updateModuleHint(index, hintIndex, e.target.value)}
                        className="w-full px-3 py-2 mb-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500 text-sm"
                        placeholder={hint}
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-800 flex justify-between">
          <div>
            {isEditing && (
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-900/50 hover:bg-red-900/70 text-red-400 rounded-lg font-bold transition-colors flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete Translation
              </button>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg font-bold transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-bold transition-colors flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save Translation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
