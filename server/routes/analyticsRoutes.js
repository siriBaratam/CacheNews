import express from 'express';
import { getCacheStats } from '../controllers/analyticsController.js';

const router = express.Router();

// Public telemetry stats (uncached)
router.get('/cache-stats', getCacheStats);

export default router;
