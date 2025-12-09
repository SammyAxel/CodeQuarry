/**
 * Cosmetic Model
 * Handles cosmetics shop, inventory, gems, and equipped items
 */

import pool from '../connection.js';
import { logActivity } from './Progress.js';

/**
 * Award gems to a user
 */
export const awardGems = async (userId, amount, reason = 'reward') => {
  // Update user_stats
  await pool.query(
    `INSERT INTO user_stats (user_id, total_gems) 
     VALUES ($1, $2) 
     ON CONFLICT (user_id) DO UPDATE SET 
       total_gems = user_stats.total_gems + $2`,
    [userId, amount]
  );
  
  // Sync to users table
  await pool.query(
    `UPDATE users SET total_gems = (
      SELECT total_gems FROM user_stats WHERE user_id = $1
     ) WHERE id = $1`,
    [userId]
  );
  
  await logActivity(userId, 'gems_earned', null, null);
  
  return amount;
};

/**
 * Get user's total gems
 */
export const getUserGems = async (userId) => {
  const result = await pool.query(
    `SELECT total_gems FROM user_stats WHERE user_id = $1`,
    [userId]
  );
  return result.rows[0]?.total_gems || 0;
};

/**
 * Deduct gems from a user
 */
export const deductGems = async (userId, amount) => {
  const result = await pool.query(
    `UPDATE user_stats SET total_gems = GREATEST(0, total_gems - $2)
     WHERE user_id = $1
     RETURNING total_gems`,
    [userId, amount]
  );
  
  // Sync to users table
  await pool.query(
    `UPDATE users SET total_gems = (
      SELECT total_gems FROM user_stats WHERE user_id = $1
     ) WHERE id = $1`,
    [userId]
  );
  
  return result.rows[0]?.total_gems || 0;
};

/**
 * Set user gems to a specific amount (admin function)
 */
export const setUserGems = async (userId, amount) => {
  const result = await pool.query(
    `INSERT INTO user_stats (user_id, total_gems)
     VALUES ($1, $2)
     ON CONFLICT (user_id) DO UPDATE SET
       total_gems = $2
     RETURNING total_gems`,
    [userId, Math.max(0, amount)]
  );
  
  // Sync to users table
  await pool.query(
    `UPDATE users SET total_gems = $1 WHERE id = $2`,
    [Math.max(0, amount), userId]
  );
  
  return result.rows[0]?.total_gems || 0;
};

/**
 * Purchase a cosmetic item
 */
export const purchaseCosmetic = async (userId, cosmeticId) => {
  const result = await pool.query(
    `INSERT INTO cosmetics_inventory (user_id, cosmetic_id)
     VALUES ($1, $2)
     ON CONFLICT (user_id, cosmetic_id) DO NOTHING
     RETURNING *`,
    [userId, cosmeticId]
  );
  return result.rows[0];
};

/**
 * Get user's owned cosmetics
 */
export const getUserCosmetics = async (userId) => {
  const result = await pool.query(
    `SELECT cosmetic_id FROM cosmetics_inventory WHERE user_id = $1`,
    [userId]
  );
  return result.rows.map(r => r.cosmetic_id);
};

/**
 * Equip a cosmetic item
 */
export const equipCosmetic = async (userId, type, cosmeticId) => {
  const columnName = `equipped_${type}`;
  const result = await pool.query(
    `INSERT INTO user_cosmetics (user_id, ${columnName})
     VALUES ($1, $2)
     ON CONFLICT (user_id) DO UPDATE SET
       ${columnName} = $2
     RETURNING *`,
    [userId, cosmeticId]
  );
  return result.rows[0];
};

/**
 * Get user's equipped cosmetics
 */
export const getEquippedCosmetics = async (userId) => {
  const result = await pool.query(
    `SELECT equipped_theme, equipped_title, equipped_name_color FROM user_cosmetics WHERE user_id = $1`,
    [userId]
  );
  return result.rows[0] || { equipped_theme: null, equipped_title: null, equipped_name_color: null };
};
