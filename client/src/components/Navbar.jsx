import React, { useEffect, useRef } from 'react';
import { Search, BarChart3, Moon, Sun, LogOut, Zap, BookMarked } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Navbar = ({
  searchQuery,
  setSearchQuery,
  onSearch,
  onOpenLogin,
  onOpenRegister,
  currentView,
  setCurrentView
}) => {
  const { user, logoutUser } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const searchInputRef = useRef(null);

  // Bind Ctrl+K / Cmd+K shortcut
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchQuery);
    }
  };

  const handleHomeClick = () => {
    setSearchQuery('');
    setCurrentView('home');
  };

  return (
    <nav className="glass sticky top-0 z-40 w-full border-b border-zinc-800/80 px-6 py-3 flex items-center justify-between gap-4">
      {/* Brand logo & cache state */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleHomeClick}
          className={`flex items-center gap-2 text-base font-black tracking-tight transition-colors hover:text-emerald-400 ${
            darkMode ? 'text-white' : 'text-zinc-900'
          }`}
        >
          <Zap className="w-5 h-5 text-emerald-400 fill-emerald-400 pulse-glow" />
          <span>Cache News</span>
        </button>
        
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-bold text-emerald-400 tracking-wider uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Cache Active</span>
        </div>
      </div>

      {/* Central search bar */}
      <div className="flex-1 max-w-sm mx-4 flex items-center gap-3">
        {currentView === 'home' && (
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-zinc-500" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search tech stories... (⌘K)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full glass-input text-xs text-zinc-200 pl-9 pr-12 py-2 rounded-xl placeholder-zinc-600 focus:outline-none"
            />
            <span className="absolute right-2 top-2 text-[9px] font-mono text-zinc-500 border border-zinc-800 px-1 py-0.5 rounded bg-zinc-900">
              ⌘K
            </span>
          </form>
        )}
      </div>

      {/* Action panel */}
      <div className="flex items-center gap-3">
        {/* Navigation - Feed / Saved */}
        {user && (
          <button
            onClick={() => setCurrentView(currentView === 'saved' ? 'home' : 'saved')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
              currentView === 'saved'
                ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20'
                : darkMode
                  ? 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
                  : 'text-zinc-600 hover:text-zinc-900 hover:bg-slate-200/60'
            }`}
          >
            <BookMarked className="w-4 h-4" />
            <span className="hidden md:inline">Bookmarks</span>
          </button>
        )}

        {/* Telemetry Dashboard Navigation */}
        <button
          onClick={() => setCurrentView(currentView === 'analytics' ? 'home' : 'analytics')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
            currentView === 'analytics'
              ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20'
              : darkMode
                ? 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
                : 'text-zinc-600 hover:text-zinc-900 hover:bg-slate-200/60'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span className="hidden md:inline">Telemetry</span>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className={`p-2 rounded-lg transition-colors ${
            darkMode
              ? 'hover:bg-zinc-800/60 text-zinc-400 hover:text-zinc-200'
              : 'hover:bg-slate-200/60 text-zinc-500 hover:text-zinc-700'
          }`}
          aria-label="Toggle theme"
        >
          {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        <div className="h-4 w-px bg-zinc-800" />

        {/* User profile controls */}
        {user ? (
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-end">
              <span className="text-[11px] font-bold text-zinc-200">{user.username}</span>
              <span className="text-[9px] font-bold text-emerald-500">Karma: {user.karma}</span>
            </div>
            <button
              onClick={logoutUser}
              className="p-1.5 rounded-lg hover:bg-red-500/10 text-zinc-400 hover:text-red-400 transition-all"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            <button
              onClick={onOpenLogin}
              className="px-3 py-1.5 rounded-lg text-xs font-bold text-zinc-300 hover:text-white transition-colors"
            >
              Log In
            </button>
            <button
              onClick={onOpenRegister}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-[0_0_12px_rgba(16,185,129,0.2)]"
            >
              Sign Up
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
