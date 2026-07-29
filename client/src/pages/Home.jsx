import React, { useState, useEffect } from 'react';
import { Plus, Tag, Send, Link, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import PostCard from '../components/PostCard';

const Home = ({
  searchQuery,
  onRecordRequest,
  onCommentClick,
  onAuthRequired
}) => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [feedType, setFeedType] = useState('trending'); // 'trending' | 'rising' | 'new' | 'search'
  const [loading, setLoading] = useState(false);

  // Performance telemetry header states
  const [cacheHit, setCacheHit] = useState('MISS');
  const [cacheTime, setCacheTime] = useState('0ms');

  // Creation form state
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [content, setContent] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchPosts = async (type, query = '') => {
    setLoading(true);
    try {
      let endpoint = `/posts/${type}`;
      if (type === 'search') {
        endpoint = `/posts/search?q=${encodeURIComponent(query)}`;
      }

      const startTime = performance.now();
      const res = await api.get(endpoint);
      const endTime = performance.now();

      const hit = res.headers['x-cache'] || 'MISS';
      const responseTimeVal = res.headers['x-response-time'] || `${(endTime - startTime).toFixed(3)}ms`;

      setPosts(res.data);
      setCacheHit(hit);
      setCacheTime(responseTimeVal);

      // Record performance log
      onRecordRequest(
        endpoint,
        parseFloat(responseTimeVal.replace('ms', '')),
        hit === 'HIT'
      );
    } catch (error) {
      console.error('Failed to load posts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchQuery) {
      setFeedType('search');
      fetchPosts('search', searchQuery);
    } else {
      setFeedType('trending');
      fetchPosts('trending');
    }
  }, [searchQuery]);

  const handleFeedTypeChange = (type) => {
    setFeedType(type);
    fetchPosts(type);
  };

  const handlePostSubmission = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    setSubmitting(true);
    try {
      const tagsArray = tagsInput
        .split(',')
        .map(t => t.trim())
        .filter(t => t.length > 0);

      await api.post('/posts', {
        title,
        url: url.trim() || undefined,
        content: content.trim() || undefined,
        tags: tagsArray
      });

      setTitle('');
      setUrl('');
      setContent('');
      setTagsInput('');
      setShowSubmitForm(false);

      // Reload trending feed
      setFeedType('trending');
      fetchPosts('trending');
    } catch (error) {
      console.error('Submit post error:', error);
      alert(error.response?.data?.message || 'Failed to submit post.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto py-6 px-4">
      {/* Dynamic Collapsible Submit Post Widget */}
      {user && (
        <div className="glass rounded-2xl overflow-hidden border border-zinc-800/80">
          <button
            onClick={() => setShowSubmitForm(!showSubmitForm)}
            className="w-full px-5 py-4 flex items-center justify-between text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors text-xs font-bold uppercase tracking-wider bg-slate-50/60 dark:bg-zinc-900/20"
          >
            <div className="flex items-center gap-2">
              <Plus className={`w-4 h-4 text-emerald-400 transition-transform duration-200 ${showSubmitForm ? 'rotate-45' : ''}`} />
              <span>Share a Code link / Story</span>
            </div>
            {showSubmitForm ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showSubmitForm && (
            <form onSubmit={handlePostSubmission} className="p-5 border-t border-slate-200 dark:border-zinc-800/60 bg-slate-50/40 dark:bg-zinc-950/20 flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <input
                  type="text"
                  placeholder="Enter a descriptive title..."
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full glass-input text-xs px-3.5 py-2.5 rounded-xl focus:outline-none"
                />
              </div>

              <div className="relative">
                <Link className="absolute left-3 top-3 w-4 h-4 text-zinc-500" />
                <input
                  type="url"
                  placeholder="Reference URL (https://...)"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full glass-input text-xs pl-10 pr-4 py-2.5 rounded-xl focus:outline-none"
                />
              </div>

              <div className="relative">
                <FileText className="absolute left-3 top-3 w-4 h-4 text-zinc-500" />
                <textarea
                  placeholder="Write body text description (optional)..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full glass-input text-xs pl-10 pr-4 py-3 rounded-xl h-24 resize-none focus:outline-none"
                />
              </div>

              <div className="relative">
                <Tag className="absolute left-3 top-3 w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Tags (comma-separated: node, cache, ai)"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  className="w-full glass-input text-xs pl-10 pr-4 py-2.5 rounded-xl focus:outline-none"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={submitting || !title.trim()}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Publish Story</span>
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Feed Selectors & Telemetry summary */}
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3 flex-wrap gap-2">
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-zinc-900/60 p-1 rounded-xl border border-slate-200 dark:border-zinc-800/80">
          {['trending', 'rising', 'new'].map((type) => (
            <button
              key={type}
              onClick={() => handleFeedTypeChange(type)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                feedType === type
                  ? 'text-emerald-400 bg-white dark:bg-zinc-800/80 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
              }`}
            >
              {type}
            </button>
          ))}
          {feedType === 'search' && (
            <span className="px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-zinc-800/80">
              Results
            </span>
          )}
        </div>

        {/* Diagnostic telemetry header */}
        <div className="flex items-center gap-1.5 text-[11px] font-semibold">
          <span className="text-zinc-500">Query Status:</span>
          <span className={`font-bold ${cacheHit === 'HIT' ? 'text-emerald-400 glow-emerald' : 'text-amber-400'}`}>
            {cacheHit === 'HIT' ? '⚡ CACHE HIT' : '⏱️ DB MISS'}
          </span>
          <span className="text-zinc-600">({cacheTime})</span>
        </div>
      </div>

      {/* Feed Area */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <div className="w-6 h-6 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest animate-pulse-soft">Resolving tech feed...</span>
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-20 glass rounded-2xl border border-zinc-800">
          <p className="text-zinc-400 font-bold mb-1 text-xs">NO STORIES SUBMITTED</p>
          <p className="text-[10px] text-zinc-500">Add a new post or search other query terms.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {posts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              cacheHit={cacheHit}
              cacheTime={cacheTime}
              onCommentClick={onCommentClick}
              onAuthRequired={onAuthRequired}
              onPostUpdated={(updated) => {
                setPosts(posts.map(p => p._id === updated._id ? updated : p));
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;
