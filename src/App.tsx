import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Accent, Language, WordEntry, VideoClip, Bookmark, DurationFilter, TranscriptLine } from './types';
import { CURATED_DICTIONARY, generateFallbackWordEntry, generateClipsForWord, POPULAR_SEARCHES } from './data/dictionary';
import { fetchVideoTranscript, cuesToTranscriptLines } from './services/transcriptService';
import { Navbar } from './components/Navbar';
import { SearchBar } from './components/SearchBar';
import { YouTubePlayer } from './components/YouTubePlayer';
import { TranscriptBanner } from './components/TranscriptBanner';
import { WordGuide } from './components/WordGuide';
import { ExploreLibrary } from './components/ExploreLibrary';
import { BookmarksModal } from './components/BookmarksModal';
import { ShortcutsModal } from './components/ShortcutsModal';
import { RelatedQASection } from './components/RelatedQASection';
import { generateQAForWord } from './data/qaData';
import { 
  Play, 
  RotateCcw, 
  Bookmark as BookmarkIcon, 
  ListVideo, 
  Sparkles,
  Info,
  Plus,
  Video,
  Clock,
  Zap,
  MessageSquareQuote
} from 'lucide-react';

const STORAGE_KEYS = {
  BOOKMARKS: 'youglish_saved_bookmarks_v1',
  HISTORY: 'youglish_search_history_v1',
};

export default function App() {
  const [query, setQuery] = useState<string>('leader');
  const [accent, setAccent] = useState<Accent>('all');
  const [durationFilter, setDurationFilter] = useState<DurationFilter>('under10');
  const [language, setLanguage] = useState<Language>('en');
  const [activeTab, setActiveTab] = useState<'player' | 'explore'>('player');

  const [currentClipIndex, setCurrentClipIndex] = useState<number>(0);
  const [playbackCurrentTime, setPlaybackCurrentTime] = useState<number>(0);
  const [seekTargetTime, setSeekTargetTime] = useState<number | null>(null);
  const [isLooping, setIsLooping] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [extraBatchCount, setExtraBatchCount] = useState<number>(0);

  const [bookmarks, setBookmarks] = useState<Bookmark[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BOOKMARKS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [history, setHistory] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.HISTORY);
      return saved ? JSON.parse(saved) : ['leader', 'success', 'grit', 'water', 'vulnerable', 'comfortable'];
    } catch {
      return ['leader', 'success', 'grit', 'water', 'vulnerable', 'comfortable'];
    }
  });

  const [isBookmarksOpen, setIsBookmarksOpen] = useState<boolean>(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState<boolean>(false);

  // Sync bookmarks to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(bookmarks));
    } catch {
      // ignore
    }
  }, [bookmarks]);

  // Sync history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
    } catch {
      // ignore
    }
  }, [history]);

  // Retrieve current word entry with massive clips (64+ to 120+)
  const currentWordEntry: WordEntry = useMemo(() => {
    const clean = query.trim().toLowerCase();
    const normalizedKey = clean.replace(/[?!.,;:'"]/g, '').trim();
    const totalClipsWanted = 64 + (extraBatchCount * 24);

    const base = CURATED_DICTIONARY[clean] || (normalizedKey ? CURATED_DICTIONARY[normalizedKey] : undefined);
    if (base) {
      if (extraBatchCount > 0) {
        return {
          ...base,
          clips: generateClipsForWord(clean, totalClipsWanted),
        };
      }
      return base;
    }

    const fallback = generateFallbackWordEntry(clean, language);
    return {
      ...fallback,
      clips: generateClipsForWord(clean, totalClipsWanted),
    };
  }, [query, language, extraBatchCount]);

  // Accent counts calculation
  const accentCounts = useMemo(() => {
    const allClips = currentWordEntry.clips;
    return {
      all: allClips.length,
      us: allClips.filter((c) => c.accent === 'us').length,
      uk: allClips.filter((c) => c.accent === 'uk').length,
      aus: allClips.filter((c) => c.accent === 'aus').length,
      ca: allClips.filter((c) => c.accent === 'ca').length,
    };
  }, [currentWordEntry]);

  // Duration counts calculation
  const durationCounts = useMemo(() => {
    const allClips = currentWordEntry.clips;
    return {
      all: allClips.length,
      under20: allClips.filter((c) => c.durationSeconds < 1200).length,
      under15: allClips.filter((c) => c.durationSeconds < 900).length,
      under10: allClips.filter((c) => c.durationSeconds < 600).length,
      under5: allClips.filter((c) => c.durationSeconds < 300).length,
    };
  }, [currentWordEntry]);

  // Recommended Q&A list for the current word
  const qaList = useMemo(() => {
    return currentWordEntry.qaList || generateQAForWord(currentWordEntry.word, language);
  }, [currentWordEntry, language]);

  // Filter clips by both Accent and Duration Filter
  const filteredClips: VideoClip[] = useMemo(() => {
    let clips = currentWordEntry.clips;

    // Apply duration filter
    if (durationFilter === 'under5') {
      const matched = clips.filter((c) => c.durationSeconds < 300);
      if (matched.length > 0) clips = matched;
    } else if (durationFilter === 'under10') {
      const matched = clips.filter((c) => c.durationSeconds < 600);
      if (matched.length > 0) clips = matched;
    } else if (durationFilter === 'under15') {
      const matched = clips.filter((c) => c.durationSeconds < 900);
      if (matched.length > 0) clips = matched;
    } else if (durationFilter === 'under20') {
      const matched = clips.filter((c) => c.durationSeconds < 1200);
      if (matched.length > 0) clips = matched;
    }

    // Apply accent filter
    if (accent !== 'all') {
      const matched = clips.filter((c) => c.accent === accent);
      if (matched.length > 0) clips = matched;
    }

    return clips;
  }, [currentWordEntry, accent, durationFilter]);

  // Keep index in bounds
  const activeClip: VideoClip = useMemo(() => {
    const validIndex = Math.min(Math.max(0, currentClipIndex), filteredClips.length - 1);
    return filteredClips[validIndex] || filteredClips[0];
  }, [filteredClips, currentClipIndex]);

  // Handle new search
  const handleSearch = useCallback((newWord: string, newAccent?: Accent, newLang?: Language) => {
    const cleanWord = newWord.trim().toLowerCase();
    if (!cleanWord) return;

    setQuery(cleanWord);
    setCurrentClipIndex(0);
    setExtraBatchCount(0);
    setActiveTab('player');

    if (newAccent) setAccent(newAccent);
    if (newLang) setLanguage(newLang);

    // Update history
    setHistory((prev) => {
      const updated = [cleanWord, ...prev.filter((w) => w !== cleanWord)].slice(0, 15);
      return updated;
    });
  }, []);

  const handleLoadMoreClips = () => {
    setExtraBatchCount((prev) => prev + 1);
  };

  const handlePrevClip = () => {
    setCurrentClipIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNextClip = () => {
    setCurrentClipIndex((prev) => Math.min(filteredClips.length - 1, prev + 1));
  };

  // Check if active clip is bookmarked
  const isCurrentBookmarked = useMemo(() => {
    if (!activeClip) return false;
    return bookmarks.some((b) => b.clipId === activeClip.id);
  }, [bookmarks, activeClip]);

  const [activeClipLines, setActiveClipLines] = useState<TranscriptLine[] | undefined>(undefined);

  // Sync playback time & enrich authentic transcript when active clip changes
  useEffect(() => {
    if (!activeClip) return;
    setPlaybackCurrentTime(activeClip.startSecond);

    if (activeClip.transcriptLines && activeClip.transcriptLines.length > 1) {
      setActiveClipLines(activeClip.transcriptLines);
      return;
    }

    let cancelled = false;
    fetchVideoTranscript(activeClip.youtubeId).then((cues) => {
      if (cancelled || !cues || cues.length === 0) return;
      const lines = cuesToTranscriptLines(cues, activeClip.startSecond, activeClip.youtubeId);
      activeClip.transcriptLines = lines;
      setActiveClipLines(lines);
    }).catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [activeClip?.id, activeClip?.youtubeId, activeClip?.startSecond]);

  const toggleBookmark = () => {
    if (!activeClip) return;
    if (isCurrentBookmarked) {
      setBookmarks((prev) => prev.filter((b) => b.clipId !== activeClip.id));
    } else {
      const newBookmark: Bookmark = {
        id: `bm-${Date.now()}`,
        word: currentWordEntry.word,
        clipId: activeClip.id,
        youtubeId: activeClip.youtubeId,
        sentence: activeClip.sentence,
        channel: activeClip.channel,
        timestamp: Date.now(),
      };
      setBookmarks((prev) => [newBookmark, ...prev]);
    }
  };

  // Keyboard shortcuts listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input or textarea
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrevClip();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNextClip();
      } else if (e.key === 'l' || e.key === 'L') {
        e.preventDefault();
        setIsLooping((prev) => !prev);
      } else if (e.key === '/') {
        e.preventDefault();
        const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
        searchInput?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [filteredClips.length]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-amber-300 selection:text-amber-950">
      {/* Top Bar Contract compliant Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        savedCount={bookmarks.length}
        onOpenBookmarks={() => setIsBookmarksOpen(true)}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
      />

      {/* Hero & Search Zone */}
      <section className="bg-white border-b border-slate-200/80 pt-6 pb-6 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto space-y-4">
          <div className="text-center max-w-2xl mx-auto space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
              <span>Cover by Eddy</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Hear native speakers pronounce <span className="text-amber-500 font-extrabold underline decoration-amber-400 decoration-wavy decoration-2">anything</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Real YouTube clips timestamped to the exact second. Learn authentic rhythm, intonation & accents.
            </p>
          </div>

          {/* YouGlish Search Bar */}
          <SearchBar
            currentWord={query}
            onSearch={handleSearch}
            accent={accent}
            onChangeAccent={setAccent}
            language={language}
            onChangeLanguage={setLanguage}
            history={history}
            onClearHistory={() => setHistory([])}
            accentCounts={accentCounts}
            durationFilter={durationFilter}
            onChangeDurationFilter={setDurationFilter}
            durationCounts={durationCounts}
          />
        </div>
      </section>

      {/* Main Workspace Stage */}
      <main className="max-w-7xl mx-auto w-full px-3 sm:px-6 py-3 sm:py-4 flex-1">
        {activeTab === 'explore' ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Explore Pronunciation Collections</h2>
                <p className="text-xs text-slate-500">
                  Select curated collections of tricky words, TED Talks, or Vietnamese vocabulary
                </p>
              </div>
            </div>
            <ExploreLibrary
              onSelectWord={(w, acc, lang) => {
                handleSearch(w, acc, lang);
                setActiveTab('player');
              }}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
            {/* Left 7 Columns: Video Player & Subtitles Stage */}
            <div className="lg:col-span-8 space-y-2.5">
              {/* Streamlined YouGlish Video Header Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-1.5 bg-slate-100 rounded-xl border border-slate-200 text-xs">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Play className="w-3.5 h-3.5 fill-red-600 text-red-600" />
                    <span>Clip {currentClipIndex + 1}/{filteredClips.length}</span>
                  </span>
                  <span className="text-slate-300">·</span>
                  <span className="font-semibold text-amber-950 bg-amber-100 border border-amber-300/80 px-2 py-0.5 rounded">
                    "{currentWordEntry.word}"
                  </span>
                  <span className="text-slate-300">·</span>
                  <span className="font-mono text-slate-600 uppercase font-bold text-[11px] bg-white border border-slate-200 px-1.5 py-0.5 rounded">
                    {accent}
                  </span>
                  {activeClip && (
                    <>
                      <span className="text-slate-300">·</span>
                      <span className="text-slate-500 font-mono text-[11px]">
                        {activeClip.durationFormatted}
                      </span>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-slate-500 hidden sm:inline text-xs">Chuyển clip:</span>
                  <select
                    value={currentClipIndex}
                    onChange={(e) => setCurrentClipIndex(Number(e.target.value))}
                    className="bg-white hover:bg-slate-50 border border-slate-300 rounded-lg px-2 py-1 text-xs font-semibold text-slate-800 outline-none cursor-pointer shadow-2xs"
                  >
                    {filteredClips.map((c, i) => (
                      <option key={i} value={i}>
                        Clip {i + 1} ({c.durationFormatted})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* YouTube Video Player */}
              {activeClip && (
                <YouTubePlayer
                  clip={activeClip}
                  clipIndex={currentClipIndex}
                  totalClips={filteredClips.length}
                  onPrevClip={handlePrevClip}
                  onNextClip={handleNextClip}
                  isLooping={isLooping}
                  onToggleLoop={() => setIsLooping(!isLooping)}
                  playbackSpeed={playbackSpeed}
                  onChangeSpeed={setPlaybackSpeed}
                  onTimeUpdate={setPlaybackCurrentTime}
                  seekTime={seekTargetTime}
                  onSeekHandled={() => setSeekTargetTime(null)}
                />
              )}

              {/* Interactive Subtitles / Transcript Banner (Chạy Real-time Karaoke) */}
              {activeClip && (
                <TranscriptBanner
                  clip={activeClipLines ? { ...activeClip, transcriptLines: activeClipLines } : activeClip}
                  targetWord={currentWordEntry.word}
                  onSearchWord={(w) => handleSearch(w, accent, language)}
                  isBookmarked={isCurrentBookmarked}
                  onToggleBookmark={toggleBookmark}
                  currentTime={playbackCurrentTime}
                  onSeekTime={(time) => setSeekTargetTime(time)}
                  onReplaySentence={() => setSeekTargetTime(activeClip.startSecond)}
                />
              )}

              {/* Đề xuất những câu hỏi hoặc trả lời liên quan đến từ tìm kiếm (nằm ngay dưới subtitles) */}
              <RelatedQASection
                word={currentWordEntry.word}
                qaList={qaList}
                onSearchWord={(w) => handleSearch(w, accent, language)}
              />
            </div>

            {/* Right 4 Columns: Word Guide & Clips Queue */}
            <div className="lg:col-span-4 space-y-4">
              {/* Word Guide Summary */}
              <WordGuide
                entry={currentWordEntry}
                onSearchWord={(w) => handleSearch(w, accent, language)}
              />

              {/* Clips Playlist / Queue */}
              <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-4 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase tracking-wide">
                    <ListVideo className="w-4 h-4 text-amber-500" />
                    <span>Video Clips ({filteredClips.length})</span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Filtered: {accent.toUpperCase()}
                  </span>
                </div>

                <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                  {filteredClips.map((clip, idx) => {
                    const isActive = idx === currentClipIndex;
                    return (
                      <button
                        key={clip.id}
                        onClick={() => setCurrentClipIndex(idx)}
                        className={`w-full text-left p-2.5 rounded-lg border transition-all flex items-start gap-2.5 ${
                          isActive
                            ? 'bg-amber-50/80 border-amber-300 ring-1 ring-amber-300'
                            : 'bg-slate-50/70 border-slate-200/70 hover:bg-slate-100/80 hover:border-slate-300'
                        }`}
                      >
                        <span
                          className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                            isActive
                              ? 'bg-amber-400 text-slate-950'
                              : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {idx + 1}
                        </span>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1 mb-0.5">
                            <span className="text-xs font-bold text-slate-800 truncate">
                              {clip.channel}
                            </span>
                            <div className="flex items-center gap-1 shrink-0">
                              <span className="text-[10px] uppercase font-mono font-semibold px-1 py-0.2 rounded bg-slate-200/60 text-slate-600">
                                {clip.accent}
                              </span>
                              <span className={`text-[10px] font-mono font-medium px-1.5 py-0.2 rounded ${
                                clip.isShort ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500'
                              }`}>
                                {clip.durationFormatted}
                              </span>
                            </div>
                          </div>
                          <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                            "{clip.sentence}"
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Load More Clips Button */}
                <div className="pt-2 border-t border-slate-100">
                  <button
                    onClick={handleLoadMoreClips}
                    className="w-full py-2.5 px-3 rounded-lg border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tải thêm video (+24 clips)</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6 px-4 sm:px-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-slate-800">YouGlish Pronounce</span>
            <span className="px-2 py-0.5 bg-amber-100 text-amber-900 text-[11px] font-bold rounded-md border border-amber-200 shadow-2xs">
              Cover by Eddy
            </span>
            <span>·</span>
            <span>Natural language pronunciation through authentic YouTube videos</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <button
              onClick={() => setIsShortcutsOpen(true)}
              className="hover:text-slate-700 transition-colors"
            >
              Shortcuts
            </button>
            <button
              onClick={() => setIsBookmarksOpen(true)}
              className="hover:text-slate-700 transition-colors"
            >
              Saved ({bookmarks.length})
            </button>
            <a
              href="https://youglish.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-700 transition-colors"
            >
              Original YouGlish
            </a>
          </div>
        </div>
      </footer>

      {/* Bookmarks Modal */}
      <BookmarksModal
        isOpen={isBookmarksOpen}
        onClose={() => setIsBookmarksOpen(false)}
        bookmarks={bookmarks}
        onSelectBookmark={(bm) => {
          handleSearch(bm.word);
        }}
        onRemoveBookmark={(id) => {
          setBookmarks((prev) => prev.filter((b) => b.id !== id));
        }}
        onClearAll={() => setBookmarks([])}
      />

      {/* Shortcuts Modal */}
      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />
    </div>
  );
}
