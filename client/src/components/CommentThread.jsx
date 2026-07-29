import React, { useState } from 'react';
import { Reply, CornerDownRight, MessageSquare, Send } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const CommentNode = ({ comment, onAddReply }) => {
  const { user } = useAuth();
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmitReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    setSubmitting(true);
    const success = await onAddReply(replyText, comment._id);
    if (success) {
      setReplyText('');
      setShowReplyForm(false);
    }
    setSubmitting(false);
  };

  return (
    <div className="flex flex-col gap-2 mt-3 relative">
      <div className="flex items-start gap-2">
        {comment.parentComment && (
          <CornerDownRight className="w-4 h-4 text-zinc-600 mt-1.5 flex-shrink-0" />
        )}
        <div className="flex-1 glass bg-slate-50/60 dark:bg-zinc-900/20 p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800/80">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
              {comment.author?.username || 'anonymous'}
            </span>
            <span className="text-[10px] text-zinc-500">•</span>
            <span className="text-[10px] text-zinc-500">
              {new Date(comment.createdAt).toLocaleDateString()}
            </span>
            {comment.author?.karma !== undefined && (
              <>
                <span className="text-[10px] text-zinc-500">•</span>
                <span className="text-[10px] text-emerald-500 font-semibold">
                  Karma: {comment.author.karma}
                </span>
              </>
            )}
          </div>
          <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap break-all">
            {comment.content}
          </p>

          {user && (
            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-200 dark:border-zinc-800/40">
              <button
                onClick={() => setShowReplyForm(!showReplyForm)}
                className="flex items-center gap-1 text-[10px] font-bold text-zinc-400 hover:text-emerald-400 transition-colors"
              >
                <Reply className="w-3 h-3" />
                Reply
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Nested Reply Input */}
      {showReplyForm && (
        <form onSubmit={handleSubmitReply} className="flex gap-2 ml-6 mt-1.5 items-end">
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder={`Reply to ${comment.author?.username || 'user'}...`}
            className="flex-1 glass-input text-xs p-2.5 rounded-lg h-14 resize-none focus:outline-none"
          />
          <button
            type="submit"
            disabled={submitting || !replyText.trim()}
            className="px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] flex items-center gap-1 transition-all disabled:opacity-50 h-8"
          >
            <Send className="w-3 h-3" />
            <span>Send</span>
          </button>
        </form>
      )}

      {/* Recursive Render for Child Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="ml-6 border-l border-slate-200 dark:border-zinc-800/80 pl-3 flex flex-col gap-1">
          {comment.replies.map((reply) => (
            <CommentNode key={reply._id} comment={reply} onAddReply={onAddReply} />
          ))}
        </div>
      )}
    </div>
  );
};

const CommentThread = ({ comments, onAddComment, onAuthRequired }) => {
  const { user } = useAuth();
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Flatten comments count including child replies
  const getCommentsCount = (list) => {
    let count = list.length;
    list.forEach(c => {
      if (c.replies) count += getCommentsCount(c.replies);
    });
    return count;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    if (!user) {
      if (onAuthRequired) onAuthRequired();
      return;
    }

    setSubmitting(true);
    const success = await onAddComment(commentText, null);
    if (success) {
      setCommentText('');
    }
    setSubmitting(false);
  };

  return (
    <div className="mt-8 border-t border-zinc-800/60 pt-6">
      <h3 className="text-sm font-bold text-zinc-700 dark:text-zinc-200 mb-4 flex items-center gap-2 uppercase tracking-wider">
        <MessageSquare className="w-4 h-4 text-emerald-400" />
        <span>Discussion ({getCommentsCount(comments)})</span>
      </h3>

      {/* Comment Input */}
      {user ? (
        <form onSubmit={handleSubmit} className="flex flex-col gap-2 mb-6">
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Participate in this discussion thread..."
            className="w-full glass-input text-xs p-3 rounded-xl h-20 resize-none focus:outline-none"
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting || !commentText.trim()}
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 transition-all disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Post Comment</span>
            </button>
          </div>
        </form>
      ) : (
        <div className="glass p-4 rounded-xl border border-zinc-800 text-center mb-6">
          <p className="text-xs text-zinc-400">
            Please{' '}
            <button onClick={onAuthRequired} className="text-emerald-400 font-bold hover:underline">
              login
            </button>{' '}
            or{' '}
            <button onClick={onAuthRequired} className="text-emerald-400 font-bold hover:underline">
              register
            </button>{' '}
            to add to the discussion.
          </p>
        </div>
      )}

      {/* Comments List */}
      {comments.length === 0 ? (
        <div className="text-center py-8 text-zinc-600 text-xs font-semibold">
          No comments yet. Write a response below.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {comments.map((comment) => (
            <CommentNode key={comment._id} comment={comment} onAddReply={onAddComment} />
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentThread;
