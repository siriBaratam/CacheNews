import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import api from '../api/axios';
import PostCard from '../components/PostCard';
import CommentThread from '../components/CommentThread';

const PostDetails = ({
  postId,
  onBack,
  onRecordRequest,
  onAuthRequired
}) => {
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loadingPost, setLoadingPost] = useState(true);
  const [loadingComments, setLoadingComments] = useState(true);

  // Telemetry caching headers for detailed post
  const [postCacheHit, setPostCacheHit] = useState('MISS');
  const [postCacheTime, setPostCacheTime] = useState('0ms');

  // Telemetry caching headers for nested comments
  const [commentsCacheHit, setCommentsCacheHit] = useState('MISS');
  const [commentsCacheTime, setCommentsCacheTime] = useState('0ms');

  const fetchPostDetails = async () => {
    setLoadingPost(true);
    try {
      const endpoint = `/posts/${postId}`;
      const startTime = performance.now();
      const res = await api.get(endpoint);
      const endTime = performance.now();

      const hit = res.headers['x-cache'] || 'MISS';
      const timeVal = res.headers['x-response-time'] || `${(endTime - startTime).toFixed(3)}ms`;

      setPost(res.data);
      setPostCacheHit(hit);
      setPostCacheTime(timeVal);

      // Log request
      onRecordRequest(
        endpoint,
        parseFloat(timeVal.replace('ms', '')),
        hit === 'HIT'
      );
    } catch (error) {
      console.error('Post details load error:', error);
    } finally {
      setLoadingPost(false);
    }
  };

  const fetchComments = async () => {
    setLoadingComments(true);
    try {
      const endpoint = `/posts/${postId}/comments`;
      const startTime = performance.now();
      const res = await api.get(endpoint);
      const endTime = performance.now();

      const hit = res.headers['x-cache'] || 'MISS';
      const timeVal = res.headers['x-response-time'] || `${(endTime - startTime).toFixed(3)}ms`;

      setComments(res.data);
      setCommentsCacheHit(hit);
      setCommentsCacheTime(timeVal);

      // Log comments API latency
      onRecordRequest(
        endpoint,
        parseFloat(timeVal.replace('ms', '')),
        hit === 'HIT'
      );
    } catch (error) {
      console.error('Comments load error:', error);
    } finally {
      setLoadingComments(false);
    }
  };

  useEffect(() => {
    if (postId) {
      fetchPostDetails();
      fetchComments();
    }
  }, [postId]);

  const handleAddComment = async (content, parentCommentId = null) => {
    try {
      await api.post(`/posts/${postId}/comments`, {
        content,
        parentComment: parentCommentId
      });

      // Clear cache on creation and retrieve freshly updated threads
      await fetchComments();
      return true;
    } catch (error) {
      console.error('Failed to submit comment:', error);
      alert(error.response?.data?.message || 'Failed to submit comment.');
      return false;
    }
  };

  if (loadingPost && !post) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <div className="w-6 h-6 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
        <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest animate-pulse-soft">Resolving story metadata...</span>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-2xl mx-auto py-10 px-4">
        <button onClick={onBack}        className="flex items-center gap-1 text-xs font-bold text-zinc-400 hover:text-zinc-900 dark:hover:text-white mb-6 uppercase tracking-wider transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Feed</span>
        </button>
        <div className="glass p-8 rounded-2xl border border-zinc-800 text-center">
          <p className="text-zinc-400 font-bold mb-1 text-xs">STORY NOT FOUND</p>
          <p className="text-[10px] text-zinc-500">The story link may have been expired or deleted.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-6 px-4">
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-zinc-900 dark:hover:text-white mb-6 transition-colors uppercase tracking-wider"
      >
        <ArrowLeft className="w-4 h-4 text-emerald-400" />
        <span>Back to Stories</span>
      </button>

      {/* Main Post Card */}
      <div className="flex flex-col gap-6">
        <PostCard
          post={post}
          cacheHit={postCacheHit}
          cacheTime={postCacheTime}
          onAuthRequired={onAuthRequired}
          onPostUpdated={(updated) => setPost(updated)}
        />

        {/* Story Body Content */}
        {post.content && post.url && (
          <div className="glass p-5 rounded-2xl border border-slate-200 dark:border-zinc-800/80 bg-slate-50/60 dark:bg-zinc-950/15 leading-relaxed text-xs text-zinc-600 dark:text-zinc-300 break-all whitespace-pre-wrap">
            {post.content}
          </div>
        )}

        {/* Nested Comments section */}
        {loadingComments && comments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-2">
            <div className="w-5 h-5 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest animate-pulse-soft">Loading discussions...</span>
          </div>
        ) : (
          <div className="relative">
            <div className="absolute right-0 top-0 flex items-center gap-1 text-[10px] font-semibold">
              <span className="text-zinc-500">Replies:</span>
              <span className={`font-bold ${commentsCacheHit === 'HIT' ? 'text-emerald-400 glow-emerald' : 'text-amber-400'}`}>
                {commentsCacheHit === 'HIT' ? '⚡ CACHE HIT' : '⏱️ DB MISS'}
              </span>
              <span className="text-zinc-600">({commentsCacheTime})</span>
            </div>
            
            <CommentThread
              comments={comments}
              onAddComment={handleAddComment}
              onAuthRequired={onAuthRequired}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default PostDetails;
