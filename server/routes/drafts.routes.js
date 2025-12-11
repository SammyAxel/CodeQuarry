/**
 * Drafts Routes
 * Handles collaborative course draft creation and management
 * Supports multiple creators/mods working on same draft with commission tracking
 */

import { Router } from 'express';
import { verifySession, requireCreator } from '../middleware/auth.middleware.js';
import db from '../../database/index.js';

const router = Router();

/**
 * GET /api/drafts
 * Get all drafts (filtered by user if mod, all if admin)
 */
router.get('/', verifySession, async (req, res) => {
  try {
    const role = req.body?.role || sessionStorage?.getItem('adminRole');
    const userId = req.body?.userId;
    
    let filters = {};
    if (role === 'mod' && userId) {
      // Mods can only see their own drafts and ones they collaborate on
      filters.collaborator = userId;
    }
    
    const drafts = await db.getAllDrafts(filters);
    res.json({ drafts });
  } catch (error) {
    console.error('Error fetching drafts:', error);
    res.status(500).json({ error: 'Failed to fetch drafts' });
  }
});

/**
 * GET /api/drafts/:id
 * Get a specific draft by ID
 */
router.get('/:id', verifySession, async (req, res) => {
  try {
    const draft = await db.getDraft(parseInt(req.params.id));
    
    if (!draft) {
      return res.status(404).json({ error: 'Draft not found' });
    }
    
    res.json({ draft });
  } catch (error) {
    console.error('Error fetching draft:', error);
    res.status(500).json({ error: 'Failed to fetch draft' });
  }
});

/**
 * GET /api/drafts/course/:courseId
 * Get all drafts for a specific course
 */
router.get('/course/:courseId', verifySession, async (req, res) => {
  try {
    const drafts = await db.getDraftsByCourse(req.params.courseId);
    res.json({ drafts });
  } catch (error) {
    console.error('Error fetching course drafts:', error);
    res.status(500).json({ error: 'Failed to fetch course drafts' });
  }
});

/**
 * POST /api/drafts
 * Create a new draft
 */
router.post('/', verifySession, async (req, res) => {
  try {
    const { courseId, title, description, icon, customIconUrl, language, difficulty, tier, modules, commission } = req.body;
    
    // Get creator info from session
    const creatorId = req.user?.id;
    const creatorName = req.user?.username || 'Unknown';
    
    if (!title || !creatorId) {
      return res.status(400).json({ error: 'Missing required fields: title, creator' });
    }
    
    const draft = await db.createDraft({
      courseId,
      title,
      description,
      icon,
      customIconUrl,
      language: language || 'javascript',
      difficulty: difficulty || 'easy',
      tier: tier || 'Copper',
      modules: modules || [],
      createdBy: creatorId,
      creatorName,
      commission: commission || 0
    });
    
    res.status(201).json({ draft, message: 'Draft created successfully' });
  } catch (error) {
    console.error('Error creating draft:', error);
    res.status(500).json({ error: 'Failed to create draft' });
  }
});

/**
 * PUT /api/drafts/:id
 * Update a draft (content, status, completion)
 */
router.put('/:id', verifySession, async (req, res) => {
  try {
    const draftId = parseInt(req.params.id);
    const { title, description, icon, customIconUrl, language, difficulty, tier, modules, status, reviewNotes, completionPercentage } = req.body;
    
    // Get editor info
    const editorId = req.user?.id;
    const editorName = req.user?.username || 'Unknown';
    
    // Check permissions: creator, collaborator, or admin can edit
    const draft = await db.getDraft(draftId);
    if (!draft) {
      return res.status(404).json({ error: 'Draft not found' });
    }
    
    const isCreator = draft.createdBy === editorId;
    const isCollaborator = draft.collaborators.some(c => c.id === editorId);
    const isAdmin = req.user?.role === 'admin';
    
    if (!isCreator && !isCollaborator && !isAdmin) {
      return res.status(403).json({ error: 'You do not have permission to edit this draft' });
    }
    
    const updatedDraft = await db.updateDraft(draftId, {
      title: title || draft.title,
      description: description !== undefined ? description : draft.description,
      icon: icon !== undefined ? icon : draft.icon,
      customIconUrl: customIconUrl !== undefined ? customIconUrl : draft.customIconUrl,
      language: language || draft.language,
      difficulty: difficulty || draft.difficulty,
      tier: tier || draft.tier,
      modules,
      lastEditedBy: editorId,
      lastEditedByName: editorName,
      status: status || draft.status,
      reviewNotes: reviewNotes !== undefined ? reviewNotes : draft.reviewNotes,
      completionPercentage: completionPercentage !== undefined ? completionPercentage : draft.completionPercentage
    });
    
    res.json({ draft: updatedDraft, message: 'Draft updated successfully' });
  } catch (error) {
    console.error('Error updating draft:', error);
    res.status(500).json({ error: 'Failed to update draft' });
  }
});

/**
 * POST /api/drafts/:id/collaborators
 * Add a collaborator to a draft
 */
router.post('/:id/collaborators', verifySession, async (req, res) => {
  try {
    const draftId = parseInt(req.params.id);
    const { userId, userName } = req.body;
    
    if (!userId || !userName) {
      return res.status(400).json({ error: 'Missing required fields: userId, userName' });
    }
    
    // Check permissions: only creator or admin can add collaborators
    const draft = await db.getDraft(draftId);
    if (!draft) {
      return res.status(404).json({ error: 'Draft not found' });
    }
    
    if (draft.createdBy !== req.user?.id && req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Only the draft creator or admin can add collaborators' });
    }
    
    const updatedDraft = await db.addCollaborator(draftId, userId, userName);
    res.json({ draft: updatedDraft, message: 'Collaborator added successfully' });
  } catch (error) {
    console.error('Error adding collaborator:', error);
    res.status(500).json({ error: 'Failed to add collaborator' });
  }
});

/**
 * DELETE /api/drafts/:id/collaborators/:userId
 * Remove a collaborator from a draft
 */
router.delete('/:id/collaborators/:userId', verifySession, async (req, res) => {
  try {
    const draftId = parseInt(req.params.id);
    const userId = parseInt(req.params.userId);
    
    // Check permissions: only creator or admin can remove collaborators
    const draft = await db.getDraft(draftId);
    if (!draft) {
      return res.status(404).json({ error: 'Draft not found' });
    }
    
    if (draft.createdBy !== req.user?.id && req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Only the draft creator or admin can remove collaborators' });
    }
    
    const updatedDraft = await db.removeCollaborator(draftId, userId);
    res.json({ draft: updatedDraft, message: 'Collaborator removed successfully' });
  } catch (error) {
    console.error('Error removing collaborator:', error);
    res.status(500).json({ error: 'Failed to remove collaborator' });
  }
});

/**
 * POST /api/drafts/:id/publish
 * Publish a draft (admin only) - converts to published course
 */
router.post('/:id/publish', verifySession, async (req, res) => {
  try {
    const draftId = parseInt(req.params.id);
    
    // Admin only
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can publish drafts' });
    }
    
    const draft = await db.getDraft(draftId);
    if (!draft) {
      return res.status(404).json({ error: 'Draft not found' });
    }
    
    // Mark draft as approved
    const publishedDraft = await db.publishDraft(draftId, req.user.id);
    
    res.json({ draft: publishedDraft, message: 'Draft published successfully' });
  } catch (error) {
    console.error('Error publishing draft:', error);
    res.status(500).json({ error: 'Failed to publish draft' });
  }
});

/**
 * DELETE /api/drafts/:id
 * Delete a draft
 */
router.delete('/:id', verifySession, async (req, res) => {
  try {
    const draftId = parseInt(req.params.id);
    
    const draft = await db.getDraft(draftId);
    if (!draft) {
      return res.status(404).json({ error: 'Draft not found' });
    }
    
    // Check permissions: creator or admin can delete
    if (draft.createdBy !== req.user?.id && req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'You do not have permission to delete this draft' });
    }
    
    await db.deleteDraft(draftId);
    res.json({ message: 'Draft deleted successfully' });
  } catch (error) {
    console.error('Error deleting draft:', error);
    res.status(500).json({ error: 'Failed to delete draft' });
  }
});

export default router;
