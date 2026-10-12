import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { Bookmark, VideoClip } from './types';
import { Navbar } from './components/Navbar';
import { BookmarksModal } from './components/BookmarksModal';
import { ShortcutsModal } from './components/ShortcutsModal';
import { HomePage } from './pages/HomePage';
import { VideoDictionaryPage } from './pages/VideoDictionaryPage';
import { ShadowingPage } from './pages/ShadowingPage';
import { PronunciationPage } from './pages/PronunciationPage';
import { ListeningPage } from './pages/ListeningPage';
import { ExercisesPage } from './pages/ExercisesPage';
import { VocabularyPage } from './pages/VocabularyPage';
import { DashboardPage } from './pages/DashboardPage';
import { SettingsPage } from './pages/SettingsPage';
import { getAppSettings } from './services/storageService';

const STORAGE_KEYS = {
  BOOKMARKS: 'youglish_saved_bookmarks_v1',
};

function AppContent() {
  const navigate = useNavigate();

  const [bookmarks, setBookmarks] = useState<Bookmark[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BOOKMARKS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isBookmarksOpen, setIsBookmarksOpen] = useState<boolean>(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState<boolean>(false);

  // Initialize theme from settings
  useEffect(() => {
    const settings = getAppSettings();
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Sync bookmarks to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(bookmarks));
    } catch {}
  }, [bookmarks]);

  const toggleBookmark = (activeClip: VideoClip, currentWord: string) => {
    if (!activeClip) return;
    const isBookmarked = bookmarks.some((b) => b.clipId === activeClip.id);
    if (isBookmarked) {
      setBookmarks((prev) => prev.filter((b) => b.clipId !== activeClip.id));
    } else {
      const newBookmark: Bookmark = {
        id: `bm-${Date.now()}`,
        word: currentWord,
        clipId: activeClip.id,
        youtubeId: activeClip.youtubeId,
        sentence: activeClip.sentence,
        channel: activeClip.channel,
        timestamp: Date.now(),
      };
      setBookmarks((prev) => [newBookmark, ...prev]);
    }
  };

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.key === '?') {
        e.preventDefault();
        setIsShortcutsOpen(true);
      } else if (e.key === '/') {
        e.preventDefault();
        const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        } else {
          navigate('/video-dictionary');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans selection:bg-amber-300 selection:text-amber-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Top Global Navbar */}
      <Navbar
        savedCount={bookmarks.length}
        onOpenBookmarks={() => setIsBookmarksOpen(true)}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
      />

      {/* Main Routed Stage */}
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route
            path="/video-dictionary"
            element={
              <VideoDictionaryPage
                bookmarks={bookmarks}
                onToggleBookmark={toggleBookmark}
              />
            }
          />
          <Route path="/shadowing" element={<ShadowingPage />} />
          <Route path="/pronunciation" element={<PronunciationPage />} />
          <Route path="/listening" element={<ListeningPage />} />
          <Route path="/exercises" element={<ExercisesPage />} />
          <Route path="/vocabulary" element={<VocabularyPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </div>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-6 px-4 sm:px-6 text-xs text-slate-500 dark:text-slate-400 transition-colors">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-wrap text-center sm:text-left">
            <span className="font-bold text-slate-800 dark:text-white">Speaker Video TED</span>
            <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 text-[11px] font-bold rounded-md border border-amber-200 dark:border-amber-800 shadow-2xs">
              Cover by Eddy
            </span>
            <span className="hidden sm:inline">·</span>
            <span>Học tiếng Anh chuẩn từ bài diễn thuyết thực tế với phụ đề song ngữ và AI Shadowing</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <button
              onClick={() => setIsShortcutsOpen(true)}
              className="hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
            >
              Phím tắt (?)
            </button>
            <button
              onClick={() => setIsBookmarksOpen(true)}
              className="hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
            >
              Clip đã lưu ({bookmarks.length})
            </button>
            <a
              href="https://youglish.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
            >
              YouGlish
            </a>
            <a
              href="https://corodomo.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
            >
              Corodomo
            </a>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <BookmarksModal
        isOpen={isBookmarksOpen}
        onClose={() => setIsBookmarksOpen(false)}
        bookmarks={bookmarks}
        onSelectBookmark={(bm) => {
          navigate(`/video-dictionary?q=${encodeURIComponent(bm.word)}`);
        }}
        onRemoveBookmark={(id) => {
          setBookmarks((prev) => prev.filter((b) => b.id !== id));
        }}
        onClearAll={() => setBookmarks([])}
      />

      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
