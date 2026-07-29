import React, { useState, useEffect } from 'react';
import { ArrowLeft, BookMarked, Bookmark } from 'lucide-react';
import api from '../api/axios';
import PostCard from '../components/PostCard';

const SavedPosts = ({
  onRecordRequest,
  onCommentClick,
  onAuthRequired,
  onBack
}) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Authenticated requests are user-specific and uncached by design
  const [cacheTime, setCacheTime] = useState('0ms');

  const fetchSavedPosts = async () => {
    setLoading(true);
    try {
      const endpoint = '/posts/saved';
      const startTime = performance.now();
      const res = await api.get(endpoint);
      const endTime = performance.now();

      const hit = res.headers['x-cache'] || 'MISS';
      const timeVal = res.headers['x-response-time'] || `${(endTime - startTime).toFixed(3)}ms`;

      setPosts(res.data);
      setCacheTime(timeVal);

      // Log request latency
      onRecordRequest(
        endpoint,
        parseFloat(timeVal.replace('ms', '')),
        hit === 'HIT'
      );
    } catch (error) {
      console.error('Failed to load bookmarks:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedPosts();
  }, []);

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto py-6 px-4">
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors uppercase tracking-wider"
      >
        <ArrowLeft className="w-4 h-4 text-emerald-400" />
        <span>Back to Stories</span>
      </button>

      {/* Page header */}
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
        <h2 className="text-xs font-bold text-zinc-700 dark:text-zinc-200 flex items-center gap-2 uppercase tracking-wider">
          <BookMarked className="w-4.5 h-4.5 text-emerald-400" />
          <span>Bookmarked Stories ({posts.length})</span>
        </h2>
        
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-zinc-500">
          <span>Query latency:</span>
          <span className="text-amber-400 font-bold">{cacheTime}</span>
        </div>
      </div>

      {/* Saved Bookmarks List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <div className="w-6 h-6 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest animate-pulse-soft">Loading bookmarks...</span>
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-20 glass rounded-2xl border border-zinc-800">
          <Bookmark className="w-8 h-8 text-zinc-700 mx-auto mb-3" />
          <p className="text-zinc-400 font-bold mb-1 text-xs uppercase tracking-wider">No Bookmarks Saved</p>
          <p className="text-[10px] text-zinc-500">Press the bookmark icons on stories to index them here.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {posts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              cacheHit={false}
              cacheTime={cacheTime}
              onCommentClick={onCommentClick}
              onAuthRequired={onAuthRequired}
              onPostUpdated={fetchSavedPosts} // Refresh if unvoted / modified
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedPosts;
