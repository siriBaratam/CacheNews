import Post from '../models/Post.js';
import User from '../models/User.js';
import { cacheInstance } from '../cache/LRUCache.js';

export const createPost = async (req, res) => {
  try {
    const { title, url, content, tags } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Title is required.' });
    }

    // Clean up tags: Ensure they start with # and filter empty items
    const parsedTags = tags
      ? tags.map(tag => {
          const t = tag.trim();
          return t.startsWith('#') ? t : `#${t}`;
        }).filter(t => t.length > 1)
      : [];

    const post = await Post.create({
      title,
      url,
      content,
      tags: parsedTags,
      author: req.user._id
    });

    // Invalidate feeds cache
    cacheInstance.invalidate('feed:');

    // Reward author karma
    await User.findByIdAndUpdate(req.user._id, { $inc: { karma: 5 } });

    // Populate author details to return to client
    const populatedPost = await Post.findById(post._id).populate('author', 'username email karma');

    return res.status(201).json(populatedPost);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const upvotePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found.' });
    }

    const hasUpvoted = post.upvotes.includes(userId);
    let voteDiff = 0;

    if (hasUpvoted) {
      // Remove upvote
      post.upvotes = post.upvotes.filter(uid => uid.toString() !== userId.toString());
      post.upvoteCount -= 1;
      voteDiff = -1;
    } else {
      // Add upvote
      post.upvotes.push(userId);
      post.upvoteCount += 1;
      voteDiff = 1;
    }

    await post.save();

    // Invalidate specific cache keys
    cacheInstance.invalidate(`post:${id}`);
    cacheInstance.invalidate('feed:trending');
    cacheInstance.invalidate('feed:rising');
    cacheInstance.invalidate('feed:new');

    // Update karma of the post author
    if (post.author.toString() !== userId.toString()) {
      await User.findByIdAndUpdate(post.author, { $inc: { karma: voteDiff } });
    }

    // Populate post before returning
    const updatedPost = await Post.findById(id).populate('author', 'username email karma');
    return res.json(updatedPost);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getTrendingPosts = async (req, res) => {
  try {
    const now = new Date();
    
    // Aggregation query to sort by HN-like algorithm: score = (upvoteCount + 1) / (hours + 2)^1.5
    const posts = await Post.aggregate([
      {
        $addFields: {
          hoursSinceCreation: {
            $max: [
              0.0001,
              {
                $divide: [
                  { $subtract: [now, '$createdAt'] },
                  3600000 // convert ms to hours
                ]
              }
            ]
          }
        }
      },
      {
        $addFields: {
          score: {
            $divide: [
              { $add: ['$upvoteCount', 1] },
              { $pow: [{ $add: ['$hoursSinceCreation', 2] }, 1.5] }
            ]
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'author',
          foreignField: '_id',
          as: 'author'
        }
      },
      { $unwind: '$author' },
      {
        $project: {
          'author.password': 0,
          hoursSinceCreation: 0
        }
      },
      { $sort: { score: -1 } },
      { $limit: 50 }
    ]);

    return res.json(posts);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getRisingPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('author', 'username email karma')
      .sort({ upvoteCount: -1 })
      .limit(50);
    return res.json(posts);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getNewPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('author', 'username email karma')
      .sort({ createdAt: -1 })
      .limit(50);
    return res.json(posts);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate('author', 'username email karma');
    if (!post) {
      return res.status(404).json({ message: 'Post not found.' });
    }
    return res.json(post);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const searchPosts = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.json([]);
    }

    // Text search using the compound index
    const posts = await Post.find(
      { $text: { $search: q } },
      { score: { $meta: 'textScore' } }
    )
      .populate('author', 'username email karma')
      .sort({ score: { $meta: 'textScore' } })
      .limit(50);

    return res.json(posts);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const toggleSavePost = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const index = user.savedPosts.indexOf(id);
    let isSaved = false;

    if (index > -1) {
      user.savedPosts.splice(index, 1);
    } else {
      user.savedPosts.push(id);
      isSaved = true;
    }

    await user.save();
    return res.json({ saved: isSaved, savedPosts: user.savedPosts });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getSavedPosts = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'savedPosts',
      populate: {
        path: 'author',
        select: 'username email karma'
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Return only valid existing posts (in case a saved post was deleted from the system)
    const validSavedPosts = user.savedPosts.filter(p => p !== null);
    return res.json(validSavedPosts);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

