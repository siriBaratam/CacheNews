import React, { useState } from 'react';
import { X, Lock, Mail, User, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AuthModal = ({ isOpen, onClose, initialTab = 'login' }) => {
  const { loginUser, registerUser, error, setError } = useAuth();
  const [tab, setTab] = useState(initialTab); // 'login' | 'register'
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    let res;
    if (tab === 'login') {
      res = await loginUser(email, password);
    } else {
      res = await registerUser(username, email, password);
    }
    setLoading(false);
    
    if (res.success) {
      onClose();
      setUsername('');
      setEmail('');
      setPassword('');
    }
  };

  const handleTabSwitch = (newTab) => {
    setTab(newTab);
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-[4px]">
      <div className="relative w-full max-w-md glass rounded-2xl p-6 shadow-2xl border border-zinc-800">
        {/* Close Modal */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Title */}
        <div className="text-center mb-6">
          <h2 className="text-lg font-black tracking-tight text-zinc-900 dark:text-white mb-1 uppercase tracking-wider">
            {tab === 'login' ? 'Welcome Back' : 'Initialize Account'}
          </h2>
          <p className="text-xs text-zinc-400">
            {tab === 'login'
              ? 'Authenticate to query and upvote cached feeds.'
              : 'Join Cache News and write code stories.'}
          </p>
        </div>

        {/* Error alert */}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs font-semibold text-red-400 text-center">
            {error}
          </div>
        )}

        {/* Forms */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {tab === 'register' && (
            <div className="relative">
              <User className="absolute left-3 top-3 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                placeholder="Username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full glass-input text-xs pl-10 pr-4 py-3 rounded-xl focus:outline-none"
              />
            </div>
          )}

          <div className="relative">
            <Mail className="absolute left-3 top-3 w-4 h-4 text-zinc-500" />
            <input
              type="email"
              placeholder="Email address"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full glass-input text-xs text-zinc-200 pl-10 pr-4 py-3 rounded-xl focus:outline-none"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-3 w-4 h-4 text-zinc-500" />
            <input
              type="password"
              placeholder="Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full glass-input text-xs text-zinc-200 pl-10 pr-4 py-3 rounded-xl focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(16,185,129,0.25)] disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <span>{tab === 'login' ? 'Sign In' : 'Register Account'}</span>
            )}
          </button>
        </form>

        {/* Footer toggles */}
        <div className="mt-6 text-center text-xs text-zinc-500">
          {tab === 'login' ? (
            <>
              Don't have an account?{' '}
              <button
                onClick={() => handleTabSwitch('register')}
                className="text-emerald-400 font-bold hover:underline focus:outline-none"
              >
                Sign Up
              </button>
            </>
          ) : (
            <>
              Already registered?{' '}
              <button
                onClick={() => handleTabSwitch('login')}
                className="text-emerald-400 font-bold hover:underline focus:outline-none"
              >
                Log In
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
