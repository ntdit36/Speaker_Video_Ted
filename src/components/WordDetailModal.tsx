import React, { useState } from 'react';
import { 
  X, 
  Volume2, 
  Bookmark, 
  Check, 
  Mic, 
  Search, 
  BookOpen, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { getWordIPAMetadata, speakWordWithVoice } from '../services/pronunciationService';
import { lookupWordTranslation, translateSentence } from '../services/translationService';
import { saveVocabularyItem } from '../services/storageService';
import { useNavigate } from 'react-router-dom';

interface WordDetailModalProps {
  word: string | null;
  onClose: () => void;
  onSearchWord?: (word: string) => void;
  contextSentence?: string;
  contextVietnamese?: string;
  videoId?: string;
}

export const WordDetailModal: React.FC<WordDetailModalProps> = ({
  word,
  onClose,
  onSearchWord,
  contextSentence,
  contextVietnamese,
  videoId,
}) => {
  const navigate = useNavigate();
  const [saved, setSaved] = useState<boolean>(false);
  const [asyncMeaning, setAsyncMeaning] = useState<string>('');

  if (!word) return null;

  const cleanWord = word.trim().toLowerCase().replace(/[^a-z'-]/g, '');
  if (!cleanWord) return null;

  const ipaMeta = getWordIPAMetadata(cleanWord);
  const trans = lookupWordTranslation(cleanWord);

  React.useEffect(() => {
    if (!trans) {
      translateSentence(cleanWord).then((res) => {
        if (res) setAsyncMeaning(res);
      });
    }
  }, [cleanWord, trans]);

  const viMeaning = trans?.viDefinition || asyncMeaning || 'từ vựng tiếng Anh thông dụng';
  const pos = trans?.partOfSpeech || 'từ vựng';

  const handleSaveToNotebook = async () => {
    await saveVocabularyItem({
      id: `word-${cleanWord}-${Date.now()}`,
      word: cleanWord,
      ipa: { us: ipaMeta.ipaUS, uk: ipaMeta.ipaUK },
      vietnameseMeaning: viMeaning,
      partOfSpeech: pos,
      exampleSentence: contextSentence || `Learn how to pronounce "${cleanWord}" naturally with TED Talks.`,
      vietnameseSentence: contextVietnamese || `Học cách phát âm "${cleanWord}" tự nhiên qua các bài nói TED.`,
      videoId: videoId || 'V74AxCqOTvg',
      leitnerBox: 1,
      createdAt: Date.now(),
      tags: ['Transcript Lookup'],
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleGoToShadowing = () => {
    onClose();
    navigate('/shadowing', {
      state: {
        sentence: contextSentence || `Mastering the word ${cleanWord} in real context.`,
        targetWord: cleanWord,
        videoId: videoId,
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full overflow-hidden text-slate-900 dark:text-slate-100 transition-all scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/30">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <BookOpen className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Tra từ nhanh · Word Inspector
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Main Word + Pronunciation Buttons */}
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <div>
              <div className="flex items-center gap-3">
                <h3 className="text-3xl font-black tracking-tight text-slate-950 dark:text-white capitalize">
                  {cleanWord}
                </h3>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {pos}
                </span>
              </div>

              {/* Syllable Breakdown */}
              <div className="mt-2 flex items-center gap-1.5 text-xs font-mono">
                <span className="text-slate-400">Âm tiết:</span>
                <div className="flex items-center gap-1">
                  {ipaMeta.syllables.map((syl, i) => (
                    <span
                      key={i}
                      className={`px-1.5 py-0.5 rounded ${
                        i === ipaMeta.stressedIndex
                          ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-900 dark:text-amber-300 font-bold border border-amber-300/80'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {syl}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Audio Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => speakWordWithVoice(cleanWord, 'us')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 text-xs font-bold transition-colors"
                title="Nghe phát âm chuẩn Mỹ (US)"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>US {ipaMeta.ipaUS}</span>
              </button>

              <button
                onClick={() => speakWordWithVoice(cleanWord, 'uk')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 dark:bg-sky-950/40 dark:hover:bg-sky-900/40 text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-800/60 text-xs font-bold transition-colors"
                title="Nghe phát âm chuẩn Anh (UK)"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>UK {ipaMeta.ipaUK}</span>
              </button>
            </div>
          </div>

          {/* Vietnamese Meaning Box */}
          <div className="p-3.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/50">
            <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider block mb-1">
              Nghĩa tiếng Việt
            </span>
            <p className="text-sm font-semibold text-slate-900 dark:text-amber-100">
              {viMeaning}
            </p>
          </div>

          {/* Context Sentence */}
          {contextSentence && (
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800 space-y-1.5">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                Ngữ cảnh trong video TED
              </span>
              <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 italic">
                "{contextSentence}"
              </p>
              {contextVietnamese && (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  → {contextVietnamese}
                </p>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
            <button
              onClick={handleSaveToNotebook}
              disabled={saved}
              className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all shadow-xs ${
                saved
                  ? 'bg-emerald-600 text-white'
                  : 'bg-amber-400 hover:bg-amber-300 text-slate-950'
              }`}
            >
              {saved ? <Check className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
              <span>{saved ? 'Đã lưu vào sổ từ vựng!' : 'Lưu vào Sổ từ vựng'}</span>
            </button>

            <button
              onClick={handleGoToShadowing}
              className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white transition-colors shadow-xs"
            >
              <Mic className="w-4 h-4 text-amber-400" />
              <span>Luyện nói trong Shadowing</span>
            </button>
          </div>

          {onSearchWord && (
            <div className="text-center pt-1">
              <button
                onClick={() => {
                  onClose();
                  onSearchWord(cleanWord);
                }}
                className="inline-flex items-center gap-1.5 text-xs text-amber-600 hover:text-amber-700 dark:text-amber-400 hover:underline font-semibold"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Xem tất cả video TED chứa từ "{cleanWord}"</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
