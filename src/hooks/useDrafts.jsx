/**
 * useDrafts Hook
 * Manages drafts with database synchronization
 * Allows collaborative course creation with multi-device access
 */

import { useState, useEffect, useCallback } from 'react';
import * as draftApi from '../utils/draftApi';
import { logSecurityEvent } from '../utils/securityUtils';

export const useDrafts = (adminRole = 'admin') => {
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all drafts from database
  const fetchDrafts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await draftApi.getAllDrafts();
      setDrafts(response.drafts || []);
    } catch (err) {
      console.error('Error fetching drafts:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Create a new draft
  const createDraft = useCallback(async (draftData) => {
    try {
      setError(null);
      const response = await draftApi.createDraft(draftData);
      setDrafts([response.draft, ...drafts]);
      
      logSecurityEvent('draft_created', {
        draftId: response.draft.id,
        title: response.draft.title,
        creator: response.draft.createdBy
      });
      
      return response.draft;
    } catch (err) {
      console.error('Error creating draft:', err);
      setError(err.message);
      throw err;
    }
  }, [drafts]);

  // Update a draft
  const updateDraft = useCallback(async (draftId, updates) => {
    try {
      setError(null);
      const response = await draftApi.updateDraft(draftId, updates);
      
      setDrafts(drafts.map(d => d.id === draftId ? response.draft : d));
      
      logSecurityEvent('draft_updated', {
        draftId,
        completionPercentage: updates.completionPercentage,
        status: updates.status
      });
      
      return response.draft;
    } catch (err) {
      console.error('Error updating draft:', err);
      setError(err.message);
      throw err;
    }
  }, [drafts]);

  // Delete a draft
  const deleteDraft = useCallback(async (draftId) => {
    try {
      setError(null);
      await draftApi.deleteDraft(draftId);
      setDrafts(drafts.filter(d => d.id !== draftId));
      
      logSecurityEvent('draft_deleted', { draftId });
      
      return true;
    } catch (err) {
      console.error('Error deleting draft:', err);
      setError(err.message);
      throw err;
    }
  }, [drafts]);

  // Publish a draft (admin only)
  const publishDraft = useCallback(async (draftId) => {
    try {
      if (adminRole !== 'admin') {
        throw new Error('Only admins can publish drafts');
      }
      
      setError(null);
      const response = await draftApi.publishDraft(draftId);
      
      setDrafts(drafts.map(d => d.id === draftId ? response.draft : d));
      
      logSecurityEvent('draft_published', { draftId });
      
      return response.draft;
    } catch (err) {
      console.error('Error publishing draft:', err);
      setError(err.message);
      throw err;
    }
  }, [drafts, adminRole]);

  // Add collaborator
  const addCollaborator = useCallback(async (draftId, userId, userName) => {
    try {
      setError(null);
      const response = await draftApi.addCollaborator(draftId, userId, userName);
      setDrafts(drafts.map(d => d.id === draftId ? response.draft : d));
      
      logSecurityEvent('collaborator_added', { draftId, userId });
      
      return response.draft;
    } catch (err) {
      console.error('Error adding collaborator:', err);
      setError(err.message);
      throw err;
    }
  }, [drafts]);

  // Load drafts on mount
  useEffect(() => {
    fetchDrafts();
  }, [fetchDrafts]);

  return {
    drafts,
    loading,
    error,
    fetchDrafts,
    createDraft,
    updateDraft,
    deleteDraft,
    publishDraft,
    addCollaborator
  };
};

export default useDrafts;
