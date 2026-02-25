import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook managing published course edits and custom (draft-published) courses.
 * Extracted from App.jsx to reduce that file's state footprint.
 */
export function useCourseEdits() {
  const [publishedCourseEdits, setPublishedCourseEdits] = useState({});
  const [customCourses, setCustomCourses] = useState([]);

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const savedEdits = localStorage.getItem('publishedCourseEdits');
      if (savedEdits) setPublishedCourseEdits(JSON.parse(savedEdits));
    } catch (e) {
      console.error('Failed to load published course edits:', e);
    }

    try {
      const savedCustom = localStorage.getItem('customPublishedCourses');
      if (savedCustom) setCustomCourses(JSON.parse(savedCustom));
    } catch (e) {
      console.error('Failed to load custom courses:', e);
    }
  }, []);

  /** Called by AdminDashboard when courses are bulk-edited */
  const handleUpdatePublishedCourses = useCallback((edits) => {
    setPublishedCourseEdits(edits);
  }, []);

  /** Publish a draft course to the live course list */
  const handlePublishDraft = useCallback((draftCourse) => {
    setCustomCourses((prev) => {
      const updated = [...prev.filter((c) => c.id !== draftCourse.id), draftCourse];
      localStorage.setItem('customPublishedCourses', JSON.stringify(updated));
      return updated;
    });
    return true;
  }, []);

  /** Remove a custom course from the live list */
  const handleUnpublishCourse = useCallback((courseId) => {
    setCustomCourses((prev) => {
      const updated = prev.filter((c) => c.id !== courseId);
      localStorage.setItem('customPublishedCourses', JSON.stringify(updated));
      return updated;
    });
  }, []);

  return {
    publishedCourseEdits,
    customCourses,
    handleUpdatePublishedCourses,
    handlePublishDraft,
    handleUnpublishCourse,
  };
}
