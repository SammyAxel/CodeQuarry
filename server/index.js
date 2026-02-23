/**
 * Main Server Entry Point
 * Refactored modular structure
 */

// Load environment variables FIRST before any other imports
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import { fileURLToPath } from 'url';
import path from 'path';

// Import configuration (after dotenv is loaded)
import { PORT, CORS_ORIGINS, NODE_ENV } from './config/constants.js';

// Import modular database
import db from '../database/index.js';

// Import routes
import authRoutes from './routes/auth.routes.js';
import usersRoutes from './routes/users.routes.js';
import coursesRoutes from './routes/courses.routes.js';
import draftsRoutes from './routes/drafts.routes.js';
import cosmeticsRoutes from './routes/cosmetics.routes.js';
import progressRoutes from './routes/progress.routes.js';
import adminRoutes from './routes/admin.routes.js';
import translationsRoutes from './routes/translations.routes.js';
import compileRoutes from './routes/compile.routes.js';
import leaderboardRoutes from './routes/leaderboard.routes.js';
import bootcampRoutes from './routes/bootcamp.routes.js';
import batchesRoutes from './routes/batches.routes.js';
import { initBootcampWebSocket } from './bootcamp/websocket.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g., mobile apps, curl)
    if (!origin) return callback(null, true);
    if (CORS_ORIGINS.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
  });
});

// Mount route modules
app.use('/api/auth', authRoutes);
app.use('/api/user', usersRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/courses', coursesRoutes);
app.use('/api/drafts', draftsRoutes);
app.use('/api/cosmetics', cosmeticsRoutes); // Cosmetics shop, inventory, equip
app.use('/api/admin', adminRoutes);
app.use('/api/translations', translationsRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/bootcamp', bootcampRoutes);
app.use('/api/batches', batchesRoutes);
app.use('/api', compileRoutes); // Compile endpoints at root level

// Start server with WebSocket support (database initializes on import)
import { createServer } from 'http';
const server = createServer(app);

// Initialize bootcamp WebSocket on the same HTTP server
initBootcampWebSocket(server);

server.listen(PORT, () => {
  console.log(`✅ CodeQuarry API server running on http://localhost:${PORT}`);
  console.log(`📝 Environment: ${NODE_ENV}`);
  console.log(`🔗 CORS Origins: ${CORS_ORIGINS.join(', ')}`);
});
