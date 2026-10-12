import React, { useState, useEffect, useRef, useMemo } from 'react';
import { VideoClip, TranscriptLine } from '../types';
import { generateFullTranscriptForClip } from '../data/transcriptGenerator';
import { 
  Volume2, 
  Bookmark, 
  Check, 
  Copy, 
  Search, 
  Sparkles, 
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Target,
  ScrollText,
  MessageSquare,
  Clock,
  ArrowRight,
  Zap,
  Sliders,
  Plus,
  Minus,
  Gauge,
  Mic,
  Languages,
  BookOpen
} from 'lucide-react';
import { WordDetailModal } from './WordDetailModal';
import { getVietnameseSubtitle, translateSentence, translateBatch, onTranslationUpdate } from '../services/translationService';
import { getSentenceIPATranscription } from '../services/pronunciationService';
import { saveVocabularyItem } from '../services/storageService';

interface TranscriptBannerProps {
  clip: VideoClip;
  targetWord: string;
  onSearchWord: (word: string) => void;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
  currentTime?: number;
  onSeekTime?: (time: number) => void;
  onReplaySentence?: () => void;
  onOpenShadowing?: (sentence: string, targetWord: string, videoId: string) => void;
}

export const TranscriptBanner: React.FC<TranscriptBannerProps> = ({
  clip,
  targetWord,
  onSearchWord,
  isBookmarked,
  onToggleBookmark,
  currentTime,
  onSeekTime,
  onReplaySentence,
  onOpenShadowing,
}) => {
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [selectedWordIndex, setSelectedWordIndex] = useState<number | null>(null);
  const [detailModalWord, setDetailModalWord] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [savedSentenceNotice, setSavedSentenceNotice] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'live' | 'full' | 'dual'>('live');
  const [subtitleMode, setSubtitleMode] = useState<'dual' | 'en' | 'vi'>('dual');
  const [showIPA, setShowIPA] = useState<boolean>(false);
  const [autoScroll, setAutoScroll] = useState<boolean>(true);
  const [filterQuery, setFilterQuery] = useState<string>('');

  // Subtitle Speed & Latency Sync calibration
  const [subtitleSpeed, setSubtitleSpeed] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('yg_sub_speed');
      return saved ? parseFloat(saved) : 1.0; // 1.0x standard baseline sync
    } catch {
      return 1.0;
    }
  });

  const [leadOffset, setLeadOffset] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('yg_sub_lead');
      return saved !== null ? parseFloat(saved) : 0.0; // 0.0s true sync baseline (user can nudge ±0.05s / ±0.1s)
    } catch {
      return 0.0;
    }
  });

  const [showSyncPanel, setShowSyncPanel] = useState<boolean>(false);

  const handleUpdateSpeed = (speed: number) => {
    setSubtitleSpeed(speed);
    try {
      localStorage.setItem('yg_sub_speed', speed.toString());
    } catch {}
  };

  const handleUpdateLeadOffset = (offset: number) => {
    const clamped = Math.round(Math.max(-1.0, Math.min(2.0, offset)) * 100) / 100;
    setLeadOffset(clamped);
    try {
      localStorage.setItem('yg_sub_lead', clamped.toString());
    } catch {}
  };

  const activeLineRef = useRef<HTMLDivElement>(null);
  const transcriptContainerRef = useRef<HTMLDivElement>(null);

  // Reactive state to trigger re-render when new translations arrive
  const [translationVersion, setTranslationVersion] = useState<number>(0);

  useEffect(() => {
    return onTranslationUpdate(() => {
      setTranslationVersion((v) => v + 1);
    });
  }, []);

  // Retrieve or proceduralize full video transcript lines (covering 0s to durationSeconds)
  const lines: TranscriptLine[] = useMemo(() => {
    const raw = (clip.transcriptLines && clip.transcriptLines.length > 0)
      ? clip.transcriptLines
      : generateFullTranscriptForClip(clip);
    return raw.map((line) => ({
      ...line,
      vietnameseText: line.vietnameseText || getVietnameseSubtitle(line.text, clip.youtubeId),
      ipa: line.ipa || getSentenceIPATranscription(line.text),
    }));
  }, [clip, translationVersion]);

  // Pre-fetch translations for uncached transcript lines in background
  useEffect(() => {
    if (lines.length > 0) {
      const uncached = lines
        .filter((l) => !l.vietnameseText)
        .map((l) => l.text);
      if (uncached.length > 0) {
        translateBatch(uncached);
      }
    }
  }, [clip.youtubeId, lines.length]);

  const currentSec = currentTime !== undefined ? currentTime : clip.startSecond;
  // Apply lead time offset so subtitle switches at the exact moment the speaker speaks
  const effectiveSec = currentSec + leadOffset;

  // Single target line for this clip
  const targetIdx = useMemo(() => {
    const idx = lines.findIndex((l) => l.isTargetOccurrence);
    return idx !== -1 ? idx : 0;
  }, [lines]);

  const targetLine = lines[targetIdx];

  // Determine which line is currently being spoken at this video timestamp
  const activeLineIndex = useMemo(() => {
    if (lines.length === 0) return 0;

    // 1. Direct interval match with effectiveSec
    const idx = lines.findIndex((l) => effectiveSec >= l.startSecond && effectiveSec < l.endSecond);
    if (idx !== -1) return idx;

    // 2. If between sentences (pause / gap), keep the current sentence until the next sentence actually begins
    for (let i = lines.length - 1; i >= 0; i--) {
      if (effectiveSec >= lines[i].startSecond) {
        return i;
      }
    }

    return 0;
  }, [lines, effectiveSec]);

  const activeLine = lines[activeLineIndex] || {
    id: 'current-fallback',
    startSecond: clip.startSecond,
    endSecond: clip.endSecond,
    text: clip.sentence,
    isTargetOccurrence: true,
  };

  const prevLine = activeLineIndex > 0 ? lines[activeLineIndex - 1] : null;
  const nextLine = activeLineIndex < lines.length - 1 ? lines[activeLineIndex + 1] : null;

  // Real-time synchronization math for currently spoken line:
  const rawDuration = Math.max(0.4, activeLine.endSecond - activeLine.startSecond);
  const lineDuration = rawDuration;
  // Exact 100% cue duration covers active speech paced by subtitle speed
  const effectiveDuration = Math.max(0.3, rawDuration / subtitleSpeed);
  const elapsed = effectiveSec - activeLine.startSecond;
  const lineElapsed = Math.max(0, elapsed);
  const lineProgress = Math.min(1, Math.max(0, elapsed / effectiveDuration));
  const isWithinActiveLine = effectiveSec >= activeLine.startSecond && effectiveSec <= activeLine.endSecond + 0.15;

  const words = useMemo(() => activeLine.text.split(/\s+/).filter(Boolean), [activeLine.text]);

  // Weight words by length so short words ("a", "in", "is") take minimal time and long words take proper time
  const activeWordIndex = useMemo(() => {
    if (!isWithinActiveLine || words.length === 0 || elapsed < 0) return -1;
    if (words.length === 1) return 0;
    if (lineProgress >= 1.0) return words.length - 1;

    const weights = words.map(w => {
      const clean = w.replace(/^[^\w]+|[^\w]+$/g, '');
      return Math.max(1, Math.min(12, clean.length));
    });
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);

    const targetWeight = lineProgress * totalWeight;
    let accumulated = 0;

    for (let i = 0; i < words.length; i++) {
      accumulated += weights[i];
      if (accumulated >= targetWeight) {
        return i;
      }
    }
    return words.length - 1;
  }, [words, isWithinActiveLine, lineProgress, elapsed]);

  // Auto-scroll full transcript to active line as video plays
  useEffect(() => {
    if ((activeTab === 'full' || activeTab === 'dual') && autoScroll && activeLineRef.current && transcriptContainerRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [activeLineIndex, activeTab, autoScroll]);

  const cleanWordForLookup = (raw: string) => {
    return raw.replace(/^[^\w\u00C0-\u1EF9]+|[^\w\u00C0-\u1EF9]+$/gu, '').toLowerCase();
  };

  const handleWordClick = (word: string, index: number) => {
    const cleaned = cleanWordForLookup(word);
    if (!cleaned) return;
    setSelectedWord(cleaned);
    setSelectedWordIndex(index);
  };

  const handleSeekToWord = (wordIndex: number) => {
    if (!onSeekTime) return;
    const wordProgress = wordIndex / Math.max(1, words.length);
    const targetSecond = activeLine.startSecond + wordProgress * lineDuration;
    onSeekTime(targetSecond);
  };

  const handleScrubberClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!onSeekTime) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickRatio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const targetSecond = activeLine.startSecond + clickRatio * lineDuration;
    onSeekTime(targetSecond);
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      if (clip.accent === 'uk') {
        utterance.lang = 'en-GB';
      } else if (clip.accent === 'aus') {
        utterance.lang = 'en-AU';
      } else {
        utterance.lang = 'en-US';
      }
      window.speechSynthesis.speak(utterance);
    }
  };

  const copySentence = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const targetLineIndex = lines.findIndex((l) => l.isTargetOccurrence);

  // Filter lines if user searches inside transcript
  const displayedLines = useMemo(() => {
    if (!filterQuery.trim()) return lines;
    const q = filterQuery.toLowerCase();
    return lines.filter((l) => l.text.toLowerCase().includes(q));
  }, [lines, filterQuery]);

  return (
    <div className="w-full bg-white rounded-xl border border-slate-200/90 shadow-sm p-3 sm:p-3.5 relative transition-all space-y-2.5">
      {/* Top Header bar with Modes & Global Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-100 text-xs">
        {/* Left: Compact Mode Tabs */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <div className="flex items-center p-0.5 bg-slate-100 rounded-lg border border-slate-200/60">
            <button
              onClick={() => setActiveTab('live')}
              className={`px-2.5 py-1 rounded-md font-semibold text-xs transition-all flex items-center gap-1 cursor-pointer ${
                activeTab === 'live'
                  ? 'bg-slate-900 text-white shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Chế độ Karaoke tập trung theo video"
            >
              <MessageSquare className="w-3 h-3 text-amber-400" />
              <span>Karaoke</span>
            </button>
            <button
              onClick={() => setActiveTab('dual')}
              className={`px-2.5 py-1 rounded-md font-semibold text-xs transition-all flex items-center gap-1 cursor-pointer ${
                activeTab === 'dual'
                  ? 'bg-slate-900 text-white shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Xem Karaoke kết hợp Timeline"
            >
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Song song</span>
            </button>
            <button
              onClick={() => setActiveTab('full')}
              className={`px-2.5 py-1 rounded-md font-semibold text-xs transition-all flex items-center gap-1 cursor-pointer ${
                activeTab === 'full'
                  ? 'bg-slate-900 text-white shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Toàn bộ danh sách phụ đề video"
            >
              <ScrollText className="w-3 h-3 text-amber-400" />
              <span>Toàn bài ({lines.length})</span>
            </button>
          </div>

          {/* Bilingual Subtitle Mode Toggle */}
          <div className="flex items-center p-0.5 bg-slate-100 rounded-lg border border-slate-200/60 text-[11px]">
            <button
              type="button"
              onClick={() => setSubtitleMode('dual')}
              className={`px-2 py-0.5 rounded font-bold transition-all cursor-pointer ${
                subtitleMode === 'dual'
                  ? 'bg-amber-400 text-slate-950 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Phụ đề song ngữ Anh - Việt"
            >
              Song ngữ
            </button>
            <button
              type="button"
              onClick={() => setSubtitleMode('en')}
              className={`px-2 py-0.5 rounded font-bold transition-all cursor-pointer ${
                subtitleMode === 'en'
                  ? 'bg-amber-400 text-slate-950 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Chỉ tiếng Anh"
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => setSubtitleMode('vi')}
              className={`px-2 py-0.5 rounded font-bold transition-all cursor-pointer ${
                subtitleMode === 'vi'
                  ? 'bg-amber-400 text-slate-950 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Chỉ tiếng Việt"
            >
              VI
            </button>
          </div>

          {/* IPA Phonetics Toggle */}
          <button
            type="button"
            onClick={() => setShowIPA(!showIPA)}
            className={`px-2 py-1 rounded-md text-xs font-semibold border flex items-center gap-1 transition-all cursor-pointer ${
              showIPA
                ? 'bg-amber-100 text-amber-950 border-amber-300 ring-2 ring-amber-300/60 font-bold shadow-2xs'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
            }`}
            title="Bật / tắt phiên âm quốc tế IPA"
          >
            <Languages className="w-3 h-3 text-amber-600" />
            <span>IPA</span>
          </button>

          {/* Subtitle Speed & Sync Tuner Button */}
          <button
            type="button"
            onClick={() => setShowSyncPanel((prev) => !prev)}
            className={`px-2 py-1 rounded-md text-xs font-semibold border flex items-center gap-1 transition-all cursor-pointer ${
              showSyncPanel
                ? 'bg-amber-100 text-amber-950 border-amber-300 ring-2 ring-amber-300/60 shadow-2xs font-bold'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
            }`}
            title="Tùy chỉnh tốc độ phụ đề & độ trễ khớp giọng nói"
          >
            <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
            <span>{subtitleSpeed}x</span>
            {leadOffset !== 0 && (
              <span className="text-slate-400 font-mono text-[10px]">
                ({leadOffset > 0 ? `+${leadOffset}s` : `${leadOffset}s`})
              </span>
            )}
            <Sliders className="w-2.5 h-2.5 text-slate-400" />
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5">
          {/* Target Word Quick Jump */}
          {targetLineIndex !== -1 && (
            <button
              onClick={() => onSeekTime && onSeekTime(lines[targetLineIndex].startSecond)}
              className="px-2.5 py-1 rounded-lg text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200/80 transition-colors flex items-center gap-1 text-[11px] font-bold shadow-2xs"
              title={`Nhảy trực tiếp đến câu chứa từ khóa "${targetWord}"`}
            >
              <Target className="w-3.5 h-3.5 text-amber-600" />
              <span>Câu có "{targetWord}"</span>
            </button>
          )}

          {/* Audio TTS of active sentence */}
          <button
            onClick={() => speakText(activeLine.text)}
            className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            title="Nghe máy đọc câu này"
          >
            <Volume2 className="w-4 h-4" />
          </button>

          {/* Copy sentence button */}
          <button
            onClick={() => copySentence(activeLine.text)}
            className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            title="Sao chép câu đang phát"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
          </button>

          {/* Bookmark Clip button */}
          <button
            onClick={onToggleBookmark}
            className={`p-1.5 rounded-lg transition-colors ${
              isBookmarked
                ? 'text-amber-500 bg-amber-50 hover:bg-amber-100'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
            title={isBookmarked ? 'Xóa khỏi bookmark' : 'Lưu clip này'}
          >
            <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-amber-500' : ''}`} />
          </button>
        </div>
      </div>

      {/* Subtitle Speed & Latency Sync Calibration Panel */}
      {showSyncPanel && (
        <div className="bg-amber-50/90 border border-amber-200/90 rounded-xl p-3 sm:p-4 space-y-3 transition-all text-xs shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-200/60 pb-2.5">
            <div className="flex items-center gap-1.5 font-bold text-amber-950 text-sm">
              <Gauge className="w-4 h-4 text-amber-600" />
              <span>Đồng bộ Tốc độ Subtitle với Giọng nói Video</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-amber-900 bg-amber-100/80 px-2 py-0.5 rounded font-mono">
                ⚡ {subtitleSpeed}x {leadOffset !== 0 ? `(Bù ${leadOffset > 0 ? `+${leadOffset}s` : `${leadOffset}s`})` : '(0.0s)'}
              </span>
              <button
                type="button"
                onClick={() => {
                  handleUpdateSpeed(1.0);
                  handleUpdateLeadOffset(0.0);
                }}
                className="text-[10px] text-amber-800 hover:text-amber-950 underline font-bold cursor-pointer"
              >
                Khôi phục chuẩn (1.0x / 0.0s)
              </button>
            </div>
          </div>

          {/* Real-time Diagnostics Bar */}
          <div className="bg-white/80 p-2 rounded-lg border border-amber-200/60 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-slate-700">
            <div className="flex items-center gap-2">
              <span className="text-slate-500">Video:</span>
              <strong className="text-amber-950 font-bold">{currentSec.toFixed(2)}s</strong>
              <span className="text-slate-300">|</span>
              <span className="text-slate-500">Mốc câu:</span>
              <span>[{activeLine.startSecond.toFixed(1)}s - {activeLine.endSecond.toFixed(1)}s]</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500">Từ đang phát:</span>
              <span className="px-1.5 py-0.5 rounded bg-amber-200 font-bold text-amber-900">
                "{words[activeWordIndex] || '...'}" ({activeWordIndex >= 0 ? activeWordIndex + 1 : 0}/{words.length})
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-0.5">
            {/* 1. Subtitle Pacing Speed */}
            <div className="space-y-1.5 bg-white/70 p-2.5 rounded-lg border border-amber-200/50">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span>Tốc độ chạy chữ (Karaoke Speed):</span>
                </span>
                <span className="font-mono font-bold text-amber-950 bg-amber-200/90 px-1.5 py-0.5 rounded text-[11px]">
                  {subtitleSpeed}x
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Tốc độ lướt từng từ theo nhịp đọc của câu.
              </p>
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                {[
                  { val: 0.9, label: '0.9x' },
                  { val: 1.0, label: '1.0x (Chuẩn ⭐)' },
                  { val: 1.1, label: '1.1x' },
                  { val: 1.2, label: '1.2x (Nhanh)' },
                  { val: 1.35, label: '1.35x' },
                ].map((item) => (
                  <button
                    key={item.val}
                    type="button"
                    onClick={() => handleUpdateSpeed(item.val)}
                    className={`px-2 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                      subtitleSpeed === item.val
                        ? 'bg-amber-500 text-slate-950 font-bold shadow-2xs'
                        : 'bg-white hover:bg-amber-100 text-slate-700 border border-slate-200'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Audio Lead Offset (Latency compensation) */}
            <div className="space-y-1.5 bg-white/70 p-2.5 rounded-lg border border-amber-200/50">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  <span>Độ lệch thời gian (Offset Nudge):</span>
                </span>
                <span className="font-mono font-bold text-amber-950 bg-amber-200/90 px-1.5 py-0.5 rounded text-[11px]">
                  {leadOffset > 0 ? `+${leadOffset}s` : `${leadOffset}s`}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Nhích phụ đề sớm hoặc trễ theo phần trăm giây để khớp tai nghe/loa.
              </p>
              <div className="flex items-center gap-1.5 pt-1 flex-wrap">
                <button
                  type="button"
                  onClick={() => handleUpdateLeadOffset(leadOffset - 0.05)}
                  className="px-1.5 py-1 rounded bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-[11px] cursor-pointer"
                  title="Lùi 0.05s"
                >
                  -0.05s
                </button>
                
                {[-0.2, -0.1, 0.0, 0.1, 0.2].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => handleUpdateLeadOffset(val)}
                    className={`px-2 py-1 rounded-md text-[11px] font-mono font-semibold transition-all cursor-pointer ${
                      leadOffset === val
                        ? 'bg-amber-500 text-slate-950 font-bold shadow-2xs'
                        : 'bg-white hover:bg-amber-100 text-slate-600 border border-slate-200'
                    }`}
                  >
                    {val === 0 ? '0.0s ⭐' : val > 0 ? `+${val}s` : `${val}s`}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => handleUpdateLeadOffset(leadOffset + 0.05)}
                  className="px-1.5 py-1 rounded bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-[11px] cursor-pointer"
                  title="Tiến 0.05s"
                >
                  +0.05s
                </button>

                <button
                  type="button"
                  onClick={() => {
                    handleUpdateSpeed(1.0);
                    handleUpdateLeadOffset(0.0);
                  }}
                  className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 font-semibold text-[11px] cursor-pointer ml-auto flex items-center gap-1"
                  title="Đặt lại tốc độ 1.0x và độ lệch 0.0s chuẩn"
                >
                  <RotateCcw className="w-3 h-3 text-slate-500" />
                  <span>Đặt lại chuẩn (0.0s)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 1: Phụ đề Real-time Live Karaoke (Theo chuẩn YouGlish gọn gàng, vừa khung hình) */}
      {(activeTab === 'live' || activeTab === 'dual') && (
        <div className="space-y-2">
          {/* Main Active Sentence Card with Real-time Word-by-Word Karaoke */}
          <div className="p-3.5 sm:p-4 rounded-xl bg-amber-50/40 border border-amber-200/90 shadow-2xs space-y-2.5">
            {/* Header: Sentence info + Quick Steppers */}
            <div className="flex items-center justify-between text-xs text-slate-500 border-b border-amber-200/60 pb-2">
              <div className="flex items-center gap-1.5 font-semibold text-slate-700 flex-wrap">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Câu {activeLineIndex + 1}/{lines.length}</span>
                <span className="text-slate-300">·</span>
                <span className="font-mono text-slate-500">[{formatTime(activeLine.startSecond)} - {formatTime(activeLine.endSecond)}]</span>
                {activeLine.isTargetOccurrence && (
                  <span className="px-1.5 py-0.2 rounded bg-amber-200 text-amber-900 font-bold text-[10px] border border-amber-300">
                    🎯 Từ khóa
                  </span>
                )}
              </div>

              {/* Steppers & Replay directly inside header */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={!prevLine}
                  onClick={() => prevLine && onSeekTime && onSeekTime(prevLine.startSecond)}
                  className={`px-2 py-0.5 rounded text-[11px] font-semibold flex items-center gap-0.5 transition-colors ${
                    prevLine
                      ? 'bg-white hover:bg-amber-100 text-slate-700 border border-amber-200/80 cursor-pointer'
                      : 'opacity-40 text-slate-400 cursor-not-allowed'
                  }`}
                  title="Về câu trước"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Trước</span>
                </button>

                <button
                  type="button"
                  onClick={() => onSeekTime && onSeekTime(activeLine.startSecond)}
                  className="px-2 py-0.5 rounded text-[11px] font-semibold bg-white hover:bg-amber-100 text-amber-900 border border-amber-200/80 flex items-center gap-1 transition-colors cursor-pointer"
                  title="Phát lại câu này từ đầu"
                >
                  <RotateCcw className="w-3 h-3 text-amber-600" />
                  <span className="hidden sm:inline">Lặp lại</span>
                </button>

                <button
                  type="button"
                  disabled={!nextLine}
                  onClick={() => nextLine && onSeekTime && onSeekTime(nextLine.startSecond)}
                  className={`px-2 py-0.5 rounded text-[11px] font-semibold flex items-center gap-0.5 transition-colors ${
                    nextLine
                      ? 'bg-white hover:bg-amber-100 text-slate-700 border border-amber-200/80 cursor-pointer'
                      : 'opacity-40 text-slate-400 cursor-not-allowed'
                  }`}
                  title="Sang câu tiếp theo"
                >
                  <span className="hidden sm:inline">Sau</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Karaoke Words stream: High visibility, YouGlish typography */}
            <div className="text-xl sm:text-2xl font-medium leading-relaxed tracking-normal select-text min-h-[52px] flex flex-wrap items-center">
              {words.map((word, idx) => {
                const cleaned = cleanWordForLookup(word);
                const cleanTarget = (targetWord || '').trim().toLowerCase().replace(/[?!.,;:'"]/g, '');
                const targetTokens = cleanTarget.split(/\s+/).filter(Boolean);
                const isTarget = Boolean(
                  cleanTarget && (
                    cleaned === cleanTarget ||
                    targetTokens.includes(cleaned) ||
                    word.toLowerCase().includes(cleanTarget) ||
                    (targetTokens.length > 1 && cleanTarget.includes(cleaned) && cleaned.length >= 2)
                  )
                );
                const isActiveRealtime = idx === activeWordIndex;
                const isSpoken = isWithinActiveLine && idx < activeWordIndex;

                return (
                  <span key={idx} className="inline-block mr-1.5 my-0.5">
                    <button
                      type="button"
                      onClick={() => handleWordClick(word, idx)}
                      onDoubleClick={() => setDetailModalWord(cleaned)}
                      className={`transition-all rounded px-1.5 py-0.5 inline-block text-left cursor-pointer duration-100 ${
                        isActiveRealtime && isTarget
                          ? 'bg-amber-400 text-amber-950 font-black ring-3 ring-amber-400/80 scale-105 shadow-md shadow-amber-300/40 z-10'
                          : isActiveRealtime
                          ? 'bg-amber-300 text-amber-950 font-extrabold ring-2 ring-amber-400/70 scale-105 shadow-2xs z-10'
                          : isTarget
                          ? 'bg-amber-200/90 text-amber-950 font-bold ring-1 ring-amber-400/50 hover:bg-amber-300'
                          : isSpoken
                          ? 'text-slate-900 font-semibold hover:bg-slate-100'
                          : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                      }`}
                      title={`Nhấn để tra từ hoặc tua video: "${cleaned}"`}
                    >
                      {word}
                    </button>
                  </span>
                );
              })}
            </div>

            {/* Bilingual Vietnamese Translation Row */}
            {subtitleMode !== 'en' && (
              <div className="pt-2 border-t border-amber-200/60 min-h-[28px] flex items-center">
                {activeLine.vietnameseText ? (
                  <p className="text-sm sm:text-base font-semibold text-amber-950 leading-relaxed italic">
                    🇻🇳 {activeLine.vietnameseText}
                  </p>
                ) : (
                  <p className="text-xs text-amber-800/60 font-medium italic animate-pulse flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                    <span>Đang dịch phụ đề tiếng Việt...</span>
                  </p>
                )}
              </div>
            )}

            {/* Phonetic IPA Transcription Row */}
            {showIPA && activeLine.ipa && (
              <div className="pt-1 text-xs font-mono text-slate-500 flex items-center gap-1.5">
                <span className="font-bold text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded text-[10px]">IPA</span>
                <span>/{activeLine.ipa}/</span>
              </div>
            )}

            {/* Per-Sentence Action Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-amber-200/40 text-xs">
              <div className="flex items-center gap-2">
                {onOpenShadowing && (
                  <button
                    type="button"
                    onClick={() => onOpenShadowing(activeLine.text, targetWord, clip.youtubeId)}
                    className="px-2.5 py-1 rounded-lg bg-slate-900 text-white font-bold text-[11px] hover:bg-slate-800 transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
                    title="Mở câu này trong Shadowing Studio để luyện nói"
                  >
                    <Mic className="w-3.5 h-3.5 text-amber-400" />
                    <span>Luyện nói Shadowing</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={async () => {
                    await saveVocabularyItem({
                      id: `sent-${Date.now()}`,
                      word: targetWord || (words[0] ? cleanWordForLookup(words[0]) : 'TED Quote'),
                      vietnameseMeaning: activeLine.vietnameseText || 'Câu trích từ TED Talk',
                      exampleSentence: activeLine.text,
                      vietnameseSentence: activeLine.vietnameseText,
                      videoId: clip.youtubeId,
                      timestamp: activeLine.startSecond,
                      leitnerBox: 1,
                      createdAt: Date.now(),
                      tags: ['TED Sentence', clip.channel],
                    });
                    setSavedSentenceNotice('Đã lưu câu vào Sổ từ vựng!');
                    setTimeout(() => setSavedSentenceNotice(null), 2500);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-950 font-bold text-[11px] border border-amber-300 transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
                  title="Lưu câu và bản dịch vào Sổ từ vựng cá nhân"
                >
                  <Bookmark className="w-3.5 h-3.5 text-amber-700" />
                  <span>{savedSentenceNotice ? 'Đã lưu!' : 'Lưu câu vào Sổ'}</span>
                </button>
              </div>

              <div className="flex items-center gap-2 text-slate-500">
                <button
                  type="button"
                  onClick={() => copySentence(`${activeLine.text}\n→ ${activeLine.vietnameseText || ''}`)}
                  className="px-2 py-0.5 rounded hover:bg-amber-100 text-[11px] font-semibold text-slate-600 transition-colors flex items-center gap-1 cursor-pointer"
                  title="Sao chép câu tiếng Anh và bản dịch"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copied ? 'Đã chép!' : 'Chép câu & dịch'}</span>
                </button>
              </div>
            </div>

            {/* Real-time Sentence Scrubber Bar */}
            <div className="space-y-1 pt-1">
              <div 
                onClick={handleScrubberClick}
                className="w-full h-1.5 bg-slate-200/70 hover:h-2 rounded-full overflow-hidden cursor-pointer relative transition-all group"
                title="Nhấn vào thanh này để tua video trong câu"
              >
                <div 
                  className="h-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-100 ease-linear rounded-full relative" 
                  style={{ width: `${isWithinActiveLine ? lineProgress * 100 : (currentSec > activeLine.endSecond ? 100 : 0)}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono px-0.5">
                <span>{formatTime(activeLine.startSecond)}</span>
                <span className="text-amber-700 font-bold">
                  {isWithinActiveLine ? `${lineElapsed.toFixed(1)}s / ${lineDuration.toFixed(1)}s` : 'Đang chuyển câu'}
                </span>
                <span>{formatTime(activeLine.endSecond)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: Toàn bộ Video Transcript (Dạng Timeline tương tác) */}
      {(activeTab === 'full' || activeTab === 'dual') && (
        <div className={`space-y-3 ${activeTab === 'dual' ? 'pt-4 border-t border-slate-200/90 mt-2' : ''}`}>
          {activeTab === 'dual' && (
            <div className="flex items-center justify-between text-xs text-slate-500 font-bold px-1">
              <span className="flex items-center gap-1.5 text-slate-800">
                <ScrollText className="w-4 h-4 text-amber-500" />
                <span>Toàn bộ timeline phụ đề ({lines.length} câu)</span>
              </span>
              <span className="text-[11px] font-normal text-slate-400">
                Tự động cuộn theo tiến trình nói
              </span>
            </div>
          )}
          {/* Transcript Control bar: search & auto-scroll */}
          <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-50 p-2 rounded-lg border border-slate-200/70 text-xs">
            <div className="flex items-center gap-2 flex-1 max-w-sm">
              <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <input
                type="text"
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                placeholder="Tìm từ bất kỳ trong phụ đề video..."
                className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs outline-none focus:border-amber-400"
              />
              {filterQuery && (
                <button
                  onClick={() => setFilterQuery('')}
                  className="text-slate-400 hover:text-slate-600 text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            <label className="flex items-center gap-2 cursor-pointer select-none text-[11px] font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={autoScroll}
                onChange={(e) => setAutoScroll(e.target.checked)}
                className="rounded text-amber-500 focus:ring-amber-400"
              />
              <span>Tự động cuộn theo video (Auto-scroll)</span>
            </label>
          </div>

          {/* Scrollable list of all sentences */}
          <div 
            ref={transcriptContainerRef}
            className="space-y-1.5 max-h-[380px] overflow-y-auto pr-1 border border-slate-200/80 rounded-xl p-2 bg-slate-50/40 divide-y divide-slate-100"
          >
            {displayedLines.map((line, idx) => {
              const isCurrent = activeLine.id === line.id;
              const cleanTarget = (targetWord || '').trim().toLowerCase().replace(/[?!.,;:'"]/g, '');
              const targetTokens = cleanTarget.split(/\s+/).filter(Boolean);
              const lineLower = line.text.toLowerCase();
              const containsTarget = line.isTargetOccurrence || (
                cleanTarget.length > 0 && (
                  lineLower.includes(cleanTarget) ||
                  (targetTokens.length > 1 && targetTokens.every(tok => lineLower.includes(tok)))
                )
              );

              return (
                <div
                  key={line.id || idx}
                  ref={isCurrent ? activeLineRef : null}
                  onClick={() => onSeekTime && onSeekTime(line.startSecond)}
                  className={`p-3 rounded-lg cursor-pointer transition-all flex items-start gap-3 ${
                    isCurrent
                      ? 'bg-amber-100/80 border border-amber-300 ring-2 ring-amber-300/60 shadow-xs'
                      : 'hover:bg-white hover:border hover:border-slate-200/80 bg-transparent'
                  }`}
                >
                  {/* Timestamp tag */}
                  <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold shrink-0 mt-0.5 ${
                    isCurrent
                      ? 'bg-amber-400 text-slate-950'
                      : 'bg-slate-200/80 text-slate-600'
                  }`}>
                    {formatTime(line.startSecond)}
                  </span>

                  {/* Sentence text */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm leading-relaxed ${
                      isCurrent
                        ? 'font-bold text-slate-950'
                        : containsTarget
                        ? 'font-semibold text-slate-800'
                        : 'text-slate-600'
                    }`}>
                      {line.text}
                    </p>

                    {subtitleMode !== 'en' && line.vietnameseText && (
                      <p className="text-xs text-amber-900/90 font-medium italic mt-0.5 leading-relaxed">
                        {line.vietnameseText}
                      </p>
                    )}

                    {showIPA && line.ipa && (
                      <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                        /{line.ipa}/
                      </p>
                    )}

                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      {isCurrent && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-600 uppercase font-mono animate-pulse">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
                          <span>Đang phát</span>
                        </span>
                      )}

                      {containsTarget && (
                        <span className="text-[10px] font-bold text-amber-800 bg-amber-200/70 px-1.5 py-0.2 rounded">
                          🎯 Có chứa "{targetWord}"
                        </span>
                      )}

                      {onOpenShadowing && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenShadowing(line.text, targetWord, clip.youtubeId);
                          }}
                          className="text-[10px] text-slate-700 hover:text-slate-950 font-bold bg-white hover:bg-amber-100 border border-slate-200 px-2 py-0.5 rounded flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                          title="Luyện nói câu này trong Shadowing Studio"
                        >
                          <Mic className="w-3 h-3 text-amber-600" />
                          <span>Luyện Shadowing</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick Word Popup / Inspection Drawer */}
      {selectedWord && (
        <div className="mt-4 pt-3 border-t border-slate-100 bg-amber-50/50 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-sm border border-amber-200/60 animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="flex items-center gap-2.5">
            <span className="font-bold text-slate-900 text-base capitalize bg-white px-2.5 py-0.5 rounded-md border border-slate-200 shadow-2xs">
              {selectedWord}
            </span>
            <button
              onClick={() => speakText(selectedWord)}
              className="p-1.5 rounded-full bg-white text-slate-700 hover:text-amber-600 shadow-xs border border-slate-200 transition-colors"
              title={`Nghe phát âm từ "${selectedWord}"`}
            >
              <Volume2 className="w-4 h-4 text-amber-600" />
            </button>
            {selectedWordIndex !== null && onSeekTime && (
              <button
                onClick={() => handleSeekToWord(selectedWordIndex)}
                className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs rounded-lg border border-slate-200 transition-colors flex items-center gap-1 shadow-2xs cursor-pointer"
                title="Tua video đến đúng từ này"
              >
                <span>⏩ Tua video đến từ này</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => {
                setDetailModalWord(selectedWord);
              }}
              className="px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-950 font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs border border-amber-300 cursor-pointer"
              title="Mở bảng tra cứu từ vựng chi tiết với IPA và lưu sổ"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-700" />
              <span>Tra từ chi tiết & Lưu</span>
            </button>
            <button
              onClick={() => {
                onSearchWord(selectedWord);
                setSelectedWord(null);
              }}
              className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-900 font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Tìm kiếm "{selectedWord}"</span>
            </button>
            <button
              onClick={() => setSelectedWord(null)}
              className="px-2.5 py-1.5 text-xs text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            >
              Đóng
            </button>
          </div>
        </div>
      )}

      {/* Word Detail Modal */}
      {detailModalWord && (
        <WordDetailModal
          word={detailModalWord}
          onClose={() => setDetailModalWord(null)}
          onSearchWord={onSearchWord}
          contextSentence={activeLine.text}
          contextVietnamese={activeLine.vietnameseText}
          videoId={clip.youtubeId}
        />
      )}
    </div>
  );
};
