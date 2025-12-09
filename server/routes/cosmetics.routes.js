/**
 * Cosmetics Routes
 * Handles cosmetics shop, inventory, and equipping
 */

import { Router } from 'express';
import { verifyUserSession } from '../middleware/auth.middleware.js';
import db from '../../database/index.js';
import { getAllCosmetics, getRarityInfo, getCosmeticById } from '../../src/data/cosmetics.js';

const router = Router();

/**
 * GET /api/cosmetics/shop
 * Get full cosmetics catalog (public endpoint)
 */
router.get('/shop', (req, res) => {
  try {
    const cosmetics = getAllCosmetics();
    const enriched = cosmetics.map(c => ({
      ...c,
      rarityInfo: getRarityInfo(c.rarity)
    }));
    res.json({ cosmetics: enriched });
  } catch (error) {
    console.error('Error fetching cosmetics catalog:', error);
    res.status(500).json({ error: 'Failed to fetch catalog' });
  }
});

/**
 * GET /api/cosmetics/gems
 * Get current user's gem balance
 */
router.get('/gems', verifyUserSession, async (req, res) => {
  try {
    const gems = await db.getUserGems(req.user.id);
    res.json({ gems });
  } catch (error) {
    console.error('Error fetching gems:', error);
    res.status(500).json({ error: 'Failed to fetch gems' });
  }
});

/**
 * GET /api/cosmetics/inventory
 * Get user's owned cosmetics
 */
router.get('/inventory', verifyUserSession, async (req, res) => {
  try {
    const inventory = await db.getUserCosmetics(req.user.id);
    res.json({ inventory });
  } catch (error) {
    console.error('Error fetching cosmetics inventory:', error);
    res.status(500).json({ error: 'Failed to fetch inventory' });
  }
});

/**
 * GET /api/cosmetics/equipped
 * Get user's currently equipped cosmetics
 */
router.get('/equipped', verifyUserSession, async (req, res) => {
  try {
    const equipped = await db.getEquippedCosmetics(req.user.id);
    res.json({ equipped });
  } catch (error) {
    console.error('Error fetching equipped cosmetics:', error);
    res.status(500).json({ error: 'Failed to fetch equipped items' });
  }
});

/**
 * POST /api/cosmetics/purchase
 * Purchase a cosmetic with gems
 * Body: { cosmeticId }
 */
router.post('/purchase', verifyUserSession, async (req, res) => {
  try {
    const { cosmeticId } = req.body;
    
    if (!cosmeticId) {
      return res.status(400).json({ error: 'cosmeticId is required' });
    }

    // Get cosmetic details
    const cosmetic = getCosmeticById(cosmeticId);
    if (!cosmetic) {
      return res.status(404).json({ error: 'Cosmetic not found' });
    }

    // Don't let them "buy" the default theme
    if (cosmetic.rarity === 'default') {
      return res.status(400).json({ error: 'This item cannot be purchased' });
    }

    // Check user's gem balance
    const userGems = await db.getUserGems(req.user.id);
    if (userGems < cosmetic.cost) {
      return res.status(400).json({ 
        error: 'Not enough gems', 
        required: cosmetic.cost,
        current: userGems
      });
    }

    // Purchase the cosmetic
    const result = await db.purchaseCosmetic(req.user.id, cosmeticId);
    
    // Deduct gems
    await db.deductGems(req.user.id, cosmetic.cost);
    
    const newBalance = await db.getUserGems(req.user.id);

    res.json({ 
      success: true,
      message: `Purchased ${cosmetic.name}!`,
      gemsSpent: cosmetic.cost,
      newBalance
    });
  } catch (error) {
    console.error('Error purchasing cosmetic:', error);
    res.status(500).json({ error: 'Failed to purchase cosmetic' });
  }
});

/**
 * PATCH /api/cosmetics/equip
 * Equip a cosmetic item
 * Body: { type, cosmeticId }
 * type can be: 'theme', 'title', 'nameColor'
 */
router.patch('/equip', verifyUserSession, async (req, res) => {
  try {
    const { type, cosmeticId } = req.body;
    
    if (!type) {
      return res.status(400).json({ error: 'type is required' });
    }

    // Validate type
    if (!['theme', 'title', 'nameColor'].includes(type)) {
      return res.status(400).json({ error: 'Invalid cosmetic type' });
    }

    // If cosmeticId is null, allow unequipping
    let cosmetic = null;
    if (cosmeticId !== null && cosmeticId !== undefined) {
      // Verify user owns this cosmetic (or it's a default)
      cosmetic = getCosmeticById(cosmeticId);
      
      if (!cosmetic) {
        return res.status(404).json({ error: 'Cosmetic not found' });
      }

      if (cosmetic.rarity !== 'default') {
        const userInventory = await db.getUserCosmetics(req.user.id);
        if (!userInventory.includes(cosmeticId)) {
          return res.status(403).json({ error: 'You do not own this cosmetic' });
        }
      }
    }

    // Map type to underscore format for database function
    const typeMap = {
      'theme': 'theme',
      'title': 'title',
      'nameColor': 'name_color'
    };

    // Equip the cosmetic (or unequip if cosmeticId is null)
    await db.equipCosmetic(req.user.id, typeMap[type], cosmeticId);
    
    // Get updated equipped items
    const equipped = await db.getEquippedCosmetics(req.user.id);

    const message = cosmeticId ? `Equipped ${cosmetic.name}!` : `Unequipped ${type}!`;
    res.json({ 
      success: true,
      message,
      equipped
    });
  } catch (error) {
    console.error('Error equipping cosmetic:', error);
    res.status(500).json({ error: 'Failed to equip cosmetic' });
  }
});

export default router;
