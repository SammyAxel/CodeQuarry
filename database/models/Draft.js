/**
 * Draft Model
 * Handles course draft CRUD operations with collaboration support
 * Tracks multiple creators/mods working on the same draft
 */

import pool from '../connection.js';

/**
 * Format draft from DB to API format
 */
const formatDraft = (row) => ({
  id: row.id,
  courseId: row.course_id,
  title: row.title,
  description: row.description,
  icon: row.icon,
  customIconUrl: row.custom_icon_url,
  language: row.language,
  difficulty: row.difficulty,
  tier: row.tier,
  modules: row.modules ? JSON.parse(row.modules) : [],
  createdBy: row.created_by,
  createdByName: row.creator_name,
  lastEditedBy: row.last_edited_by,
  lastEditedByName: row.editor_name,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  status: row.status, // 'in_progress' | 'ready_for_review' | 'approved'
  reviewNotes: row.review_notes,
  commission: row.commission,
  completionPercentage: row.completion_percentage,
  collaborators: row.collaborators ? JSON.parse(row.collaborators) : []
});

/**
 * Create a new draft
 */
export const createDraft = async (draftData) => {
  const { 
    courseId, title, description, icon, customIconUrl, language, 
    difficulty, tier, modules, createdBy, creatorName, commission 
  } = draftData;
  
  const result = await pool.query(
    `INSERT INTO drafts 
     (course_id, title, description, icon, custom_icon_url, language, difficulty, tier, modules, created_by, creator_name, last_edited_by, editor_name, status, commission, completion_percentage, collaborators)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $10, $11, 'in_progress', $12, 0, $13)
     RETURNING *`,
    [courseId, title, description, icon, customIconUrl, language || 'javascript', 
     difficulty || 'easy', tier || 'Copper', JSON.stringify(modules || []), 
     createdBy, creatorName, commission || 0, JSON.stringify([{ id: createdBy, name: creatorName, joinedAt: new Date() }])]
  );
  
  return formatDraft(result.rows[0]);
};

/**
 * Get all drafts (optionally filter by creator or status)
 */
export const getAllDrafts = async (filters = {}) => {
  let query = 'SELECT * FROM drafts WHERE 1=1';
  const params = [];
  
  if (filters.createdBy) {
    query += ` AND created_by = $${params.length + 1}`;
    params.push(filters.createdBy);
  }
  
  if (filters.status) {
    query += ` AND status = $${params.length + 1}`;
    params.push(filters.status);
  }
  
  if (filters.collaborator) {
    query += ` AND collaborators::text LIKE $${params.length + 1}`;
    params.push(`%"id":${filters.collaborator}%`);
  }
  
  query += ' ORDER BY updated_at DESC';
  
  const result = await pool.query(query, params);
  return result.rows.map(formatDraft);
};

/**
 * Get a draft by ID
 */
export const getDraft = async (draftId) => {
  const result = await pool.query('SELECT * FROM drafts WHERE id = $1', [draftId]);
  return result.rows[0] ? formatDraft(result.rows[0]) : null;
};

/**
 * Get drafts by course ID
 */
export const getDraftsByCourse = async (courseId) => {
  const result = await pool.query(
    'SELECT * FROM drafts WHERE course_id = $1 ORDER BY updated_at DESC',
    [courseId]
  );
  return result.rows.map(formatDraft);
};

/**
 * Update a draft
 */
export const updateDraft = async (draftId, updates) => {
  const {
    title, description, icon, customIconUrl, language, difficulty, tier,
    modules, lastEditedBy, lastEditedByName, status, reviewNotes, completionPercentage
  } = updates;
  
  const result = await pool.query(
    `UPDATE drafts SET
       title = COALESCE($2, title),
       description = COALESCE($3, description),
       icon = COALESCE($4, icon),
       custom_icon_url = $5,
       language = COALESCE($6, language),
       difficulty = COALESCE($7, difficulty),
       tier = COALESCE($8, tier),
       modules = COALESCE($9, modules),
       last_edited_by = COALESCE($10, last_edited_by),
       editor_name = COALESCE($11, editor_name),
       status = COALESCE($12, status),
       review_notes = $13,
       completion_percentage = COALESCE($14, completion_percentage),
       updated_at = CURRENT_TIMESTAMP
     WHERE id = $1
     RETURNING *`,
    [draftId, title, description, icon, customIconUrl, language, difficulty, tier,
     modules ? JSON.stringify(modules) : null, lastEditedBy, lastEditedByName, status, reviewNotes, completionPercentage]
  );
  
  return result.rows[0] ? formatDraft(result.rows[0]) : null;
};

/**
 * Add a collaborator to a draft
 */
export const addCollaborator = async (draftId, userId, userName) => {
  const draft = await getDraft(draftId);
  if (!draft) throw new Error('Draft not found');
  
  // Check if already a collaborator
  const isCollaborator = draft.collaborators.some(c => c.id === userId);
  if (isCollaborator) return formatDraft(draft);
  
  // Add new collaborator
  const newCollaborators = [
    ...draft.collaborators,
    { id: userId, name: userName, joinedAt: new Date().toISOString() }
  ];
  
  const result = await pool.query(
    'UPDATE drafts SET collaborators = $1 WHERE id = $2 RETURNING *',
    [JSON.stringify(newCollaborators), draftId]
  );
  
  return result.rows[0] ? formatDraft(result.rows[0]) : null;
};

/**
 * Remove a collaborator from a draft
 */
export const removeCollaborator = async (draftId, userId) => {
  const draft = await getDraft(draftId);
  if (!draft) throw new Error('Draft not found');
  
  const newCollaborators = draft.collaborators.filter(c => c.id !== userId);
  
  const result = await pool.query(
    'UPDATE drafts SET collaborators = $1 WHERE id = $2 RETURNING *',
    [JSON.stringify(newCollaborators), draftId]
  );
  
  return result.rows[0] ? formatDraft(result.rows[0]) : null;
};

/**
 * Delete a draft
 */
export const deleteDraft = async (draftId) => {
  await pool.query('DELETE FROM drafts WHERE id = $1', [draftId]);
};

/**
 * Publish a draft (convert to published course)
 * This is called by admins to promote a draft to published
 */
export const publishDraft = async (draftId, adminId) => {
  const draft = await getDraft(draftId);
  if (!draft) throw new Error('Draft not found');
  
  // Update draft status to approved
  await pool.query(
    'UPDATE drafts SET status = $1, last_edited_by = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3',
    ['approved', adminId, draftId]
  );
  
  return formatDraft(await getDraft(draftId));
};

export default {
  createDraft,
  getAllDrafts,
  getDraft,
  getDraftsByCourse,
  updateDraft,
  addCollaborator,
  removeCollaborator,
  deleteDraft,
  publishDraft
};
