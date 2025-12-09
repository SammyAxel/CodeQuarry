/**
 * Server Configuration
 * Environment variables and constants
 */

import dotenv from 'dotenv';
dotenv.config();

export const PORT = process.env.PORT || 5000;
export const API_ENDPOINT = process.env.API_ENDPOINT || 'https://emkc.org/api/v2/piston/execute';
export const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:4000';
export const NODE_ENV = process.env.NODE_ENV || 'development';

// Admin passwords from environment
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
export const MOD_PASSWORD = process.env.MOD_PASSWORD;

// Validate required environment variables
if (!ADMIN_PASSWORD || !MOD_PASSWORD) {
  console.error('❌ ERROR: ADMIN_PASSWORD and MOD_PASSWORD must be set in environment variables');
  process.exit(1);
}

console.log('✅ Authentication passwords loaded from environment');
