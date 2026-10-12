import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Accent, Language, WordEntry, VideoClip, Bookmark, DurationFilter, ChannelFilter, TranscriptLine } from '../types';
import { CURATED_DICTIONARY, generateFallbackWordEntry, generateClipsForWord } from '../data/dictionary';
import { fetchVideoTranscript, cuesToTranscriptLines } from '../services/transcriptService';
import { SearchBar } from '../components/SearchBar';
import { YouTubePlayer } from '../components/YouTubePlayer';
import { TranscriptBanner } from '../components/TranscriptBanner';
import { WordGuide } from '../components/WordGuide';
import { ExploreLibrary } from '../components/ExploreLibrary';
import { RelatedQASection } from '../components/RelatedQASection';
import { generateQAForWord } from '../data/qaData';
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
  Mic,
  Search,
  Radio,
  Tv,
  MessageSquare
} from 'lucide-react';

interface VideoDictionaryPageProps {
  bookmarks: Bookmark[];
  onToggleBookmark: (clip: VideoClip, word: string) => void;
}

const CHANNELS_LIST: { id: ChannelFilter; label: string; icon: string; badgeColor: string }[] = [
  { id: 'all', label: 'Tất cả kênh', icon: '🌐', badgeColor: 'bg-slate-200 dark:bg-slate-700' },
  { id: 'bbc', label: 'BBC Learning English', icon: '🇬🇧', badgeColor: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200' },
  { id: 'easy', label: 'Easy English', icon: '💬', badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200' },
  { id: 'tvseries', label: 'Friends & TV Series', icon: '📺', badgeColor: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-200' },
  { id: 'rachel', label: "Rachel's English", icon: '🇺🇸', badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200' },
  { id: 'ted', label: 'TED Talks', icon: '🎙️', badgeColor: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200' },
  { id: 'tedx', label: 'TEDx Talks', icon: '🔴', badgeColor: 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-200' },
  { id: 'voa', label: 'VOA Learning English', icon: '📻', badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200' },
];

function matchChannel(channelName: string, filter: ChannelFilter): boolean {
  if (filter === 'all') return true;
  const ch = (channelName || '').toLowerCase();
  if (filter === 'bbc') return ch.includes('bbc');
  if (filter === 'easy') return ch.includes('easy');
  if (filter === 'tvseries') return ch.includes('tv series') || ch.includes('friends') || ch.includes('movie');
  if (filter === 'rachel') return ch.includes('rachel');
  if (filter === 'ted') return ch === 'ted' || (ch.includes('ted') && !ch.includes('tedx'));
  if (filter === 'tedx') return ch.includes('tedx');
  if (filter === 'voa') return ch.includes('voa');
  return true;
}

export const VideoDictionaryPage: React.FC<VideoDictionaryPageProps> = ({
  bookmarks,
  onToggleBookmark,
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const initialQuery = searchParams.get('q') || 'what is your best friend like';
  const [query, setQuery] = useState<string>(initialQuery);
  const [accent, setAccent] = useState<Accent>('all');
  const [durationFilter, setDurationFilter] = useState<DurationFilter>('under10');
  const [channelFilter, setChannelFilter] = useState<ChannelFilter>('all');
  const [language, setLanguage] = useState<Language>('en');
  const [activeTab, setActiveTab] = useState<'player' | 'explore'>('player');

  const [currentClipIndex, setCurrentClipIndex] = useState<number>(0);
  const [playbackCurrentTime, setPlaybackCurrentTime] = useState<number>(0);
  const [seekTargetTime, setSeekTargetTime] = useState<number | null>(null);
  const [isLooping, setIsLooping] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [extraBatchCount, setExtraBatchCount] = useState<number>(0);

  const [onlineClips, setOnlineClips] = useState<VideoClip[]>([]);
  const [isSearchingOnline, setIsSearchingOnline] = useState<boolean>(false);

  const [history, setHistory] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('youglish_search_history_v1');
      return saved ? JSON.parse(saved) : [
        'what is your best friend like',
        'who is your best friend',
        'leader',
        'success',
        'keep in touch'
      ];
    } catch {
      return ['what is your best friend like', 'leader', 'success'];
    }
  });

  // Sync query from searchParams when URL changes
  useEffect(() => {
    const q = searchParams.get('q');
    if (q && q !== query) {
      setQuery(q);
      setCurrentClipIndex(0);
      setExtraBatchCount(0);
    }
  }, [searchParams]);

  // Sync history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('youglish_search_history_v1', JSON.stringify(history));
    } catch {}
  }, [history]);

  // Background real-time YouTube transcript search for any custom phrase
  useEffect(() => {
    let cancelled = false;
    const clean = query.trim();
    if (!clean) return;

    setIsSearchingOnline(true);
    fetch(`/api/search-youtube?q=${encodeURIComponent(clean)}&channel=${channelFilter}`)
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        setIsSearchingOnline(false);
        if (data && Array.isArray(data.clips) && data.clips.length > 0) {
          setOnlineClips(data.clips);
        }
      })
      .catch(() => {
        if (!cancelled) setIsSearchingOnline(false);
      });

    return () => {
      cancelled = true;
    };
  }, [query, channelFilter]);

  // Retrieve current word entry
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

  // Merge pre-indexed authentic clips with online clips
  const combinedClips: VideoClip[] = useMemo(() => {
    const local = currentWordEntry.clips;
    if (onlineClips.length === 0) return local;

    const seenIds = new Set(local.map((c) => `${c.youtubeId}-${Math.round(c.startSecond)}`));
    const extras: VideoClip[] = [];
    for (const oc of onlineClips) {
      const key = `${oc.youtubeId}-${Math.round(oc.startSecond)}`;
      if (!seenIds.has(key)) {
        seenIds.add(key);
        extras.push(oc);
      }
    }
    return [...local, ...extras];
  }, [currentWordEntry.clips, onlineClips]);

  // Channel counts calculation
  const channelCounts = useMemo(() => {
    const all = combinedClips;
    return {
      all: all.length,
      bbc: all.filter((c) => matchChannel(c.channel, 'bbc')).length,
      easy: all.filter((c) => matchChannel(c.channel, 'easy')).length,
      tvseries: all.filter((c) => matchChannel(c.channel, 'tvseries')).length,
      rachel: all.filter((c) => matchChannel(c.channel, 'rachel')).length,
      ted: all.filter((c) => matchChannel(c.channel, 'ted')).length,
      tedx: all.filter((c) => matchChannel(c.channel, 'tedx')).length,
      voa: all.filter((c) => matchChannel(c.channel, 'voa')).length,
    };
  }, [combinedClips]);

  // Accent counts calculation
  const accentCounts = useMemo(() => {
    const allClips = combinedClips;
    return {
      all: allClips.length,
      us: allClips.filter((c) => c.accent === 'us').length,
      uk: allClips.filter((c) => c.accent === 'uk').length,
      aus: allClips.filter((c) => c.accent === 'aus').length,
      ca: allClips.filter((c) => c.accent === 'ca').length,
    };
  }, [combinedClips]);

  // Duration counts calculation
  const durationCounts = useMemo(() => {
    const allClips = combinedClips;
    return {
      all: allClips.length,
      under20: allClips.filter((c) => c.durationSeconds < 1200).length,
      under15: allClips.filter((c) => c.durationSeconds < 900).length,
      under10: allClips.filter((c) => c.durationSeconds < 600).length,
      under5: allClips.filter((c) => c.durationSeconds < 300).length,
    };
  }, [combinedClips]);

  // Filter clips by Duration, Accent, and Channel Filter
  const filteredClips: VideoClip[] = useMemo(() => {
    let clips = combinedClips;

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

    if (accent !== 'all') {
      const matched = clips.filter((c) => c.accent === accent);
      if (matched.length > 0) clips = matched;
    }

    if (channelFilter !== 'all') {
      const matched = clips.filter((c) => matchChannel(c.channel, channelFilter));
      if (matched.length > 0) clips = matched;
    }

    return clips;
  }, [combinedClips, accent, durationFilter, channelFilter]);

  const activeClip: VideoClip | undefined = useMemo(() => {
    if (filteredClips.length === 0) return undefined;
    const validIndex = Math.min(Math.max(0, currentClipIndex), filteredClips.length - 1);
    return filteredClips[validIndex] || filteredClips[0];
  }, [filteredClips, currentClipIndex]);

  const handleSearch = useCallback((newWord: string, newAccent?: Accent, newLang?: Language) => {
    const cleanWord = newWord.trim().toLowerCase();
    if (!cleanWord) return;

    setQuery(cleanWord);
    setSearchParams({ q: cleanWord });
    setCurrentClipIndex(0);
    setExtraBatchCount(0);
    setActiveTab('player');

    if (newAccent) setAccent(newAccent);
    if (newLang) setLanguage(newLang);

    setHistory((prev) => {
      const updated = [cleanWord, ...prev.filter((w) => w !== cleanWord)].slice(0, 15);
      return updated;
    });
  }, [setSearchParams]);

  const handleLoadMoreClips = () => {
    setExtraBatchCount((prev) => prev + 1);
  };

  const handlePrevClip = () => {
    setCurrentClipIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNextClip = () => {
    setCurrentClipIndex((prev) => Math.min(filteredClips.length - 1, prev + 1));
  };

  const isCurrentBookmarked = useMemo(() => {
    if (!activeClip) return false;
    return bookmarks.some((b) => b.clipId === activeClip.id);
  }, [bookmarks, activeClip]);

  const [activeClipLines, setActiveClipLines] = useState<TranscriptLine[] | undefined>(undefined);

  // Sync playback time & enrich authentic transcript when active clip changes
  useEffect(() => {
    if (!activeClip) {
      setActiveClipLines(undefined);
      return;
    }
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

  const qaList = useMemo(() => {
    return currentWordEntry.qaList || generateQAForWord(currentWordEntry.word, language);
  }, [currentWordEntry, language]);

  const handleOpenShadowing = (sentence: string, targetWord: string, videoId: string) => {
    navigate('/shadowing', {
      state: {
        sentence,
        targetWord,
        videoId,
      },
    });
  };

  return (
    <div className="space-y-4 pb-12">
      {/* Top Search Zone */}
      <section className="bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 pt-5 pb-5 px-4 sm:px-6 transition-colors">
        <div className="max-w-6xl mx-auto space-y-4">
          <div className="text-center max-w-3xl mx-auto space-y-1">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              SpeakerTED · <span className="text-amber-500 font-extrabold underline decoration-amber-400 decoration-wavy decoration-2">BBC, Easy English, Friends & TED</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Tìm kiếm từ &amp; nguyên câu trong hàng ngàn video BBC, Easy English, Friends, Rachel's, VOA, TED kèm phụ đề song ngữ &amp; IPA
            </p>
          </div>

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

          {/* Dedicated Channel Filter Tabs */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider shrink-0 mr-1">
                Kênh Video:
              </span>
              {CHANNELS_LIST.map((ch) => {
                const count = channelCounts[ch.id];
                const isActive = channelFilter === ch.id;
                return (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={() => {
                      setChannelFilter(ch.id);
                      setCurrentClipIndex(0);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer shadow-2xs ${
                      isActive
                        ? 'bg-amber-400 text-slate-950 ring-2 ring-amber-300'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    <span>{ch.icon}</span>
                    <span>{ch.label}</span>
                    {count !== undefined && (
                      <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-bold ${
                        isActive ? 'bg-slate-950 text-amber-300' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                      }`}>
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto w-full px-3 sm:px-6">
        {activeTab === 'explore' ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Tuyển tập từ vựng & chủ đề học tiếng Anh</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Chọn chủ đề hoặc mẫu câu giao tiếp để nghe phát âm và xem clip ngay lập tức
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
            {/* Left 8 Columns: Video Player & Subtitles Stage */}
            <div className="lg:col-span-8 space-y-3">
              {filteredClips.length > 0 && activeClip ? (
                <>
                  {/* Streamlined Video Header Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <Play className="w-3.5 h-3.5 fill-red-600 text-red-600" />
                        <span>Clip {currentClipIndex + 1}/{filteredClips.length}</span>
                      </span>
                      <span className="text-slate-300 dark:text-slate-600">·</span>
                      <span className="font-semibold text-amber-950 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/60 border border-amber-300/80 dark:border-amber-700 px-2 py-0.5 rounded">
                        "{currentWordEntry.word}"
                      </span>
                      <span className="text-slate-300 dark:text-slate-600">·</span>
                      <span className="font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded">
                        {activeClip.channel}
                      </span>
                      <span className="text-slate-300 dark:text-slate-600">·</span>
                      <span className="font-mono text-slate-600 dark:text-slate-300 uppercase font-bold text-[11px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-1.5 py-0.5 rounded">
                        {activeClip.accent}
                      </span>
                      <span className="text-slate-300 dark:text-slate-600">·</span>
                      <span className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                        {activeClip.durationFormatted}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 dark:text-slate-400 hidden sm:inline text-xs">Chuyển clip:</span>
                      <select
                        value={currentClipIndex}
                        onChange={(e) => setCurrentClipIndex(Number(e.target.value))}
                        className="bg-white dark:bg-slate-900 hover:bg-slate-50 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1 text-xs font-semibold text-slate-800 dark:text-slate-200 outline-none cursor-pointer shadow-2xs"
                      >
                        {filteredClips.map((c, i) => (
                          <option key={i} value={i}>
                            Clip {i + 1}: {c.channel} ({c.durationFormatted})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* YouTube Video Player */}
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

                  {/* Interactive Subtitles / Transcript Banner with Dual Subtitles */}
                  <TranscriptBanner
                    clip={activeClipLines ? { ...activeClip, transcriptLines: activeClipLines } : activeClip}
                    targetWord={currentWordEntry.word}
                    onSearchWord={(w) => handleSearch(w, accent, language)}
                    isBookmarked={isCurrentBookmarked}
                    onToggleBookmark={() => onToggleBookmark(activeClip, currentWordEntry.word)}
                    currentTime={playbackCurrentTime}
                    onSeekTime={(time) => setSeekTargetTime(time)}
                    onReplaySentence={() => setSeekTargetTime(activeClip.startSecond)}
                    onOpenShadowing={handleOpenShadowing}
                  />
                </>
              ) : (
                /* Empty state when no clips found for current filter */
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-dashed border-amber-300 dark:border-amber-700/80 p-8 text-center space-y-4 shadow-sm">
                  <div className="w-14 h-14 mx-auto rounded-full bg-amber-100 dark:bg-amber-950/60 flex items-center justify-center text-amber-600 dark:text-amber-400">
                    <Search className="w-7 h-7" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-slate-800 dark:text-white">
                      {isSearchingOnline ? 'Đang tìm kiếm trên YouTube...' : `Không tìm thấy video cho bộ lọc hiện tại`}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                      {isSearchingOnline 
                        ? 'Hệ thống đang dò tìm phụ đề từ YouTube theo thời gian thực, vui lòng chờ trong giây lát...'
                        : `Từ hoặc câu "${query}" chưa có trong kênh "${channelFilter.toUpperCase()}". Hãy thử bấm nút "Tất cả kênh" bên dưới để xem toàn bộ kết quả.`}
                    </p>
                  </div>
                  {combinedClips.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setChannelFilter('all')}
                      className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-lg transition-colors cursor-pointer shadow-xs inline-flex items-center gap-2"
                    >
                      <span>Xem tất cả kênh ({combinedClips.length} clips)</span>
                    </button>
                  )}
                </div>
              )}

              {/* Q&A Section */}
              <RelatedQASection
                word={currentWordEntry.word}
                qaList={qaList}
                onSearchWord={(w) => handleSearch(w, accent, language)}
              />
            </div>

            {/* Right 4 Columns: Word Guide & Clips Queue */}
            <div className="lg:col-span-4 space-y-4">
              {/* Word & Sentence Guide Summary */}
              <WordGuide
                entry={currentWordEntry}
                onSearchWord={(w) => handleSearch(w, accent, language)}
              />

              {/* Clips Playlist / Queue */}
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-xs p-4 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">
                    <ListVideo className="w-4 h-4 text-amber-500" />
                    <span>Danh sách clip ({filteredClips.length})</span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {channelFilter.toUpperCase()}
                  </span>
                </div>

                <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                  {filteredClips.map((clip, idx) => {
                    const isActive = idx === currentClipIndex;
                    return (
                      <button
                        key={clip.id}
                        onClick={() => setCurrentClipIndex(idx)}
                        className={`w-full text-left p-2.5 rounded-lg border transition-all flex items-start gap-2.5 cursor-pointer ${
                          isActive
                            ? 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-300 dark:border-amber-600 ring-1 ring-amber-300'
                            : 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200/70 dark:border-slate-800 hover:bg-slate-100/80 dark:hover:bg-slate-800'
                        }`}
                      >
                        <span
                          className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                            isActive
                              ? 'bg-amber-400 text-slate-950'
                              : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          {idx + 1}
                        </span>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1 mb-0.5">
                            <span className="text-xs font-bold text-slate-800 dark:text-white truncate">
                              {clip.channel}
                            </span>
                            <div className="flex items-center gap-1 shrink-0">
                              <span className="text-[10px] uppercase font-mono font-semibold px-1 py-0.2 rounded bg-slate-200/60 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                                {clip.accent}
                              </span>
                              <span className={`text-[10px] font-mono font-medium px-1.5 py-0.2 rounded ${
                                clip.isShort ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                              }`}>
                                {clip.durationFormatted}
                              </span>
                            </div>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                            "{clip.sentence}"
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Load More Clips Button */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={handleLoadMoreClips}
                    className="w-full py-2.5 px-3 rounded-lg border border-amber-300 dark:border-amber-600 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 text-amber-900 dark:text-amber-200 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
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
    </div>
  );
};
