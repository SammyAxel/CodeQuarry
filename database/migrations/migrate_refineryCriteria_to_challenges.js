#!/usr/bin/env node
/**
 * Migration script: convert legacy `refineryCriteria` in course modules
 * into `refineryChallenges` array.
 */
import pool from '../connection.js';

const migrate = async () => {
  console.log('Starting refineryCriteria -> refineryChallenges migration...');
  try {
    const res = await pool.query('SELECT id, modules FROM courses');
    for (const row of res.rows) {
      const { id, modules } = row;
      if (!modules) continue;
      let changed = false;
      const newModules = modules.map((m) => {
        if (m.refineryCriteria && !m.refineryChallenges) {
          const ch = {
            id: `migrated-${Date.now()}-${Math.floor(Math.random()*1000)}`,
            title: 'Refinery',
            description: m.refineryCriteria.description || 'Optimize this solution',
            baseGems: m.refineryCriteria.bonusGems || 50,
            maxLines: m.refineryCriteria.maxLines,
            forbiddenPatterns: m.refineryCriteria.forbiddenPatterns || [],
            requiredPatterns: m.refineryCriteria.requiredPatterns || [],
            tests: m.refineryCriteria.tests || []
          };
          m.refineryChallenges = [ch];
          delete m.refineryCriteria;
          changed = true;
        }
        return m;
      });

      if (changed) {
        await pool.query('UPDATE courses SET modules = $1 WHERE id = $2', [JSON.stringify(newModules), id]);
        console.log(`Migrated course ${id}`);
      }
    }

    console.log('Migration complete.');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
};

migrate();
