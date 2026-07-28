import express from 'express';
import {
  createPost,
  upvotePost,
  getTrendingPosts,
  getRisingPosts,
  getNewPosts,
  getPostById,
  searchPosts,
  toggleSavePost,
  getSavedPosts
} from '../controllers/postController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { cacheMiddleware } from '../cache/cacheMiddleware.js';

const router = express.Router();

// Public feeds with caching
router.get('/trending', cacheMiddleware('feed:trending', 30), getTrendingPosts);
router.get('/rising', cacheMiddleware('feed:rising', 30), getRisingPosts);
router.get('/new', cacheMiddleware('feed:new', 30), getNewPosts);
router.get('/search', cacheMiddleware((req) => `feed:search:${req.query.q || ''}`, 60), searchPosts);

// Bookmark route (must be before :id to prevent collision)
router.get('/saved', requireAuth, getSavedPosts);

// Public single post details
router.get('/:id', cacheMiddleware((req) => `post:${req.params.id}`, 30), getPostById);

// Protected routes (requireAuth)
router.post('/', requireAuth, createPost);
router.post('/:id/upvote', requireAuth, upvotePost);
router.post('/:id/save', requireAuth, toggleSavePost);

export default router;

