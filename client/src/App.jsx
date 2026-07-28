import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import PostDetails from './pages/PostDetails';
import SavedPosts from './pages/SavedPosts';
import Analytics from './pages/Analytics';
import AuthModal from './components/AuthModal';

function AppContent() {
  const [currentView, setCurrentView] = useState('home'); // 'home' | 'post-details' | 'saved' | 'analytics'
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [requestHistory, setRequestHistory] = useState([]);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState('login');

  const handleRecordRequest = (path, latency, hit) => {
    setRequestHistory((prev) => {
      const next = [...prev, { path, latency, hit, timestamp: Date.now() }];
      // Keep up to 1050 items (sufficient for 1000 simulation history points)
      if (next.length > 1050) {
        return next.slice(next.length - 1050);
      }
      return next;
    });
  };

  const handleClearHistory = () => {
    setRequestHistory([]);
  };

  const handleCommentClick = (postId) => {
    setSelectedPostId(postId);
    setCurrentView('post-details');
  };

  const handleBackToHome = () => {
    setCurrentView('home');
    setSelectedPostId(null);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    setCurrentView('home');
  };

  const openAuth = (tabName = 'login') => {
    setAuthTab(tabName);
    setIsAuthOpen(true);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-emerald-500/30 transition-colors duration-300 relative">
      {/* Decorative gradient overlay */}
      <div className="absolute top-0 left-0 right-0 h-[400px] bg-[radial-gradient(ellipse_60%_40%_at_50%_-10%,rgba(16,185,129,0.06),rgba(255,255,255,0))] pointer-events-none" />

      <Navbar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSearch={handleSearch}
        onOpenLogin={() => openAuth('login')}
        onOpenRegister={() => openAuth('register')}
        currentView={currentView}
        setCurrentView={setCurrentView}
      />

      <main className="relative z-10 pb-12">
        {currentView === 'home' && (
          <Home
            searchQuery={searchQuery}
            onRecordRequest={handleRecordRequest}
            onCommentClick={handleCommentClick}
            onAuthRequired={() => openAuth('login')}
          />
        )}

        {currentView === 'post-details' && (
          <PostDetails
            postId={selectedPostId}
            onBack={handleBackToHome}
            onRecordRequest={handleRecordRequest}
            onAuthRequired={() => openAuth('login')}
          />
        )}

        {currentView === 'saved' && (
          <SavedPosts
            onRecordRequest={handleRecordRequest}
            onCommentClick={handleCommentClick}
            onAuthRequired={() => openAuth('login')}
            onBack={handleBackToHome}
          />
        )}

        {currentView === 'analytics' && (
          <Analytics
            requestHistory={requestHistory}
            onRecordRequest={handleRecordRequest}
            onClearHistory={handleClearHistory}
          />
        )}
      </main>

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        initialTab={authTab}
      />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
