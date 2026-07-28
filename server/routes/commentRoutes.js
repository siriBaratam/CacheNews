import express from 'express';
import { getCommentsByPost, addComment } from '../controllers/commentController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { cacheMiddleware } from '../cache/cacheMiddleware.js';

const router = express.Router();

// Public routes with caching (TTL 15s)
router.get('/:id/comments', cacheMiddleware((req) => `comments:post:${req.params.id}`, 15), getCommentsByPost);

// Protected routes (requireAuth)
router.post('/:id/comments', requireAuth, addComment);

export default router;
