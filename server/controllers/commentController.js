import Comment from '../models/Comment.js';
import User from '../models/User.js';
import { cacheInstance } from '../cache/LRUCache.js';

export const getCommentsByPost = async (req, res) => {
  try {
    const postId = req.params.id;

    // Fetch all comments for this post, ordered by date
    const comments = await Comment.find({ post: postId })
      .populate('author', 'username email karma')
      .sort({ createdAt: 1 });

    // Map comments to their IDs for easy O(1) lookup
    const commentMap = {};
    comments.forEach(comment => {
      commentMap[comment._id.toString()] = {
        ...comment.toObject(),
        replies: []
      };
    });

    const rootComments = [];
    comments.forEach(comment => {
      const mapped = commentMap[comment._id.toString()];
      if (comment.parentComment) {
        const parent = commentMap[comment.parentComment.toString()];
        if (parent) {
          parent.replies.push(mapped);
        } else {
          // If parent is missing (e.g. deleted), treat it as a top-level comment
          rootComments.push(mapped);
        }
      } else {
        rootComments.push(mapped);
      }
    });

    return res.json(rootComments);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const addComment = async (req, res) => {
  try {
    const postId = req.params.id;
    const { content, parentComment } = req.body;

    if (!content) {
      return res.status(400).json({ message: 'Comment content is required.' });
    }

    const comment = await Comment.create({
      post: postId,
      author: req.user._id,
      parentComment: parentComment || null,
      content
    });

    // Invalidate comment cache for this specific post
    cacheInstance.invalidate(`comments:post:${postId}`);

    // Optionally reward user for contributing
    await User.findByIdAndUpdate(req.user._id, { $inc: { karma: 2 } });

    // Populate author before returning response
    const populatedComment = await Comment.findById(comment._id).populate('author', 'username email karma');

    return res.status(201).json(populatedComment);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
