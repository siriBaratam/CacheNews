import React, { useState } from 'react';
import { ArrowBigUp, MessageSquare, Tag, ExternalLink, Bookmark } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import SpeedBadge from './SpeedBadge';

const PostCard = ({ post, onPostUpdated, cacheHit, cacheTime, onCommentClick, onAuthRequired }) => {
  const { user, updateUserKarma } = useAuth();
  const [upvotes, setUpvotes] = useState(post.upvotes || []);
  const [upvoteCount, setUpvoteCount] = useState(post.upvoteCount || 0);
  const [isUpvoting, setIsUpvoting] = useState(false);

  const [isSaved, setIsSaved] = useState(() => {
    if (!user || !user.savedPosts) return false;
    return user.savedPosts.includes(post._id);
  });
  const [saving, setSaving] = useState(false);

  const hasUpvoted = user ? upvotes.includes(user._id) : false;

  const handleSaveToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      if (onAuthRequired) onAuthRequired();
      return;
    }

    if (saving) return;

    // Optimistic toggle
    const prevSaved = isSaved;
    setIsSaved(!isSaved);

    try {
      setSaving(true);
      const res = await api.post(`/posts/${post._id}/save`);
      
      // Update local storage user profile with updated savedPosts array
      const updatedUser = { ...user, savedPosts: res.data.savedPosts };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setIsSaved(res.data.saved);
    } catch (error) {
      console.error('Failed to toggle bookmark:', error);
      setIsSaved(prevSaved); // Revert
    } finally {
      setSaving(false);
    }
  };

  const handleUpvote = async (e) => {

    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      if (onAuthRequired) {
        onAuthRequired();
      } else {
        alert('Please log in to upvote posts.');
      }
      return;
    }

    if (isUpvoting) return;

    // Optimistic UI Update
    const previousUpvotes = [...upvotes];
    const previousCount = upvoteCount;
    const isAdding = !hasUpvoted;

    const newUpvotes = isAdding
      ? [...upvotes, user._id]
      : upvotes.filter(id => id.toString() !== user._id.toString());
    const newCount = isAdding ? upvoteCount + 1 : upvoteCount - 1;

    setUpvotes(newUpvotes);
    setUpvoteCount(newCount);
    
    // Optimistically update logged in user's karma if upvoting someone else's post
    if (post.author?._id && post.author._id.toString() !== user._id.toString()) {
      updateUserKarma(isAdding ? 1 : -1);
    }

    try {
      setIsUpvoting(true);
      const response = await api.post(`/posts/${post._id}/upvote`);
      
      // Sync with exact backend state
      setUpvotes(response.data.upvotes || []);
      setUpvoteCount(response.data.upvoteCount || 0);
      
      if (onPostUpdated) {
        onPostUpdated(response.data);
      }
    } catch (error) {
      console.error('Upvote request failed:', error);
      // Revert optimistic updates on error
      setUpvotes(previousUpvotes);
      setUpvoteCount(previousCount);
      if (post.author?._id && post.author._id.toString() !== user._id.toString()) {
        updateUserKarma(isAdding ? -1 : 1);
      }
    } finally {
      setIsUpvoting(false);
    }
  };

  return (
    <div className="glass-card p-5 rounded-xl flex gap-4 items-start relative overflow-hidden">
      {/* Upvote Action Section */}
      <div className="flex flex-col items-center gap-1">
        <button
          onClick={handleUpvote}
          className={`p-2 rounded-lg transition-all ${
            hasUpvoted ? 'text-emerald-400 bg-emerald-500/10 shadow-[0_0_10px_rgba(16,185,129,0.1)]' : 'text-zinc-500 hover:text-zinc-700 hover:bg-slate-200/60'
          }`}
          aria-label="Upvote"
        >
          <ArrowBigUp className={`w-6 h-6 transition-transform ${hasUpvoted ? 'fill-emerald-400 scale-110' : ''}`} />
        </button>
        <span className={`text-xs font-bold tracking-tight ${hasUpvoted ? 'text-emerald-400 glow-emerald' : 'text-zinc-400'}`}>
          {upvoteCount}
        </span>
      </div>

      {/* Main Content Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1.5">
          <span className="text-[11px] text-zinc-500">
            posted by <span className="text-zinc-300 font-semibold">{post.author?.username || 'anonymous'}</span>
          </span>
          <span className="text-[11px] text-zinc-600">•</span>
          <span className="text-[11px] text-zinc-500">{new Date(post.createdAt).toLocaleDateString()}</span>
          {post.author?.karma && (
            <>
              <span className="text-[11px] text-zinc-600">•</span>
              <span className="text-[11px] text-emerald-500 font-medium">Karma: {post.author.karma}</span>
            </>
          )}
        </div>

        {post.url ? (
          <a
            href={post.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-base font-bold text-zinc-100 hover:text-emerald-400 transition-colors mb-2 break-all"
          >
            {post.title}
            <ExternalLink className="w-3.5 h-3.5 flex-shrink-0 text-zinc-500" />
          </a>
        ) : (
          <h2 className="text-base font-bold text-zinc-100 mb-2 break-words">
            {post.title}
          </h2>
        )}

        {post.content && (
          <p className="text-sm text-zinc-400 line-clamp-2 mb-3 break-words leading-relaxed">
            {post.content}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-3 mt-4 text-xs text-zinc-400 border-t border-zinc-800/40 pt-3">
          {/* Tags list */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {post.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 border border-slate-200 dark:bg-zinc-900 dark:border-zinc-800 text-[10px] font-semibold text-zinc-600 dark:text-zinc-300 uppercase tracking-wider"
                >
                  <Tag className="w-2.5 h-2.5 text-emerald-400" />
                  {tag.replace('#', '')}
                </span>
              ))}
            </div>
          )}

          {/* Push comments to right side */}
          <div className="flex-1" />

          {/* Telemetry Badge */}
          {cacheTime && <SpeedBadge hit={cacheHit} time={cacheTime} />}

          {/* Navigation to comments thread */}
          <button
            onClick={() => onCommentClick && onCommentClick(post._id)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800/40 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 transition-all border border-slate-200 dark:border-zinc-700/20 text-xs font-semibold"
          >
            <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
            <span>Comments</span>
          </button>

          {/* Bookmark Button */}
          {user && (
            <button
              onClick={handleSaveToggle}
              className={`flex items-center justify-center p-1.5 rounded-lg border transition-all ${
                isSaved
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.15)] pulse-glow'
                  : 'bg-slate-100 border-slate-200 dark:bg-zinc-800/40 dark:border-zinc-700/20 text-zinc-500 hover:text-zinc-700 hover:bg-slate-200 dark:hover:text-zinc-300 dark:hover:bg-zinc-800'
              }`}
              title={isSaved ? 'Remove bookmark' : 'Bookmark story'}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-emerald-400' : ''}`} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostCard;
