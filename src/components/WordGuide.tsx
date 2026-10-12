import React from 'react';
import { WordEntry } from '../types';
import { Volume2, Lightbulb, Languages, BookOpen, Sparkles } from 'lucide-react';

interface WordGuideProps {
  entry: WordEntry;
  onSearchWord: (word: string) => void;
}

export const WordGuide: React.FC<WordGuideProps> = ({ entry, onSearchWord }) => {
  const isPhrase = entry.word.trim().includes(' ') || (entry.syllables && entry.syllables.length === 0);
  const wordsInPhrase = entry.word.trim().split(/\s+/).filter(Boolean);

  const speakAccent = (accent: 'us' | 'uk' | 'aus') => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(entry.word);
      utterance.rate = isPhrase ? 0.9 : 0.85;
      if (accent === 'uk') {
        utterance.lang = 'en-GB';
      } else if (accent === 'aus') {
        utterance.lang = 'en-AU';
      } else {
        utterance.lang = 'en-US';
      }
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-sm p-5 space-y-4">
      {/* Header with Title and Part of Speech */}
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3.5">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {entry.word}
            </h2>
            <span className="text-xs font-semibold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/80 px-2 py-0.5 rounded capitalize">
              {entry.partOfSpeech}
            </span>
          </div>

          {/* IPA Transcription Display */}
          <div className="flex items-center gap-2 text-xs sm:text-sm font-mono text-slate-600 dark:text-slate-300 pt-0.5">
            <span className="text-[11px] font-sans font-bold text-slate-400 uppercase tracking-wider">
              Phiên âm IPA:
            </span>
            <span className="text-amber-600 dark:text-amber-400 font-bold bg-amber-50/60 dark:bg-amber-950/30 px-2 py-0.5 rounded border border-amber-200/60 dark:border-amber-900/60">
              {entry.ipa.us || entry.ipa.uk || entry.ipa.general}
            </span>
          </div>
        </div>

        {/* Audio buttons for different accents */}
        <div className="flex items-center gap-1.5 shrink-0">
          {entry.ipa.us && (
            <button
              onClick={() => speakAccent('us')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-slate-700 dark:text-slate-200 hover:text-amber-800 dark:hover:text-amber-300 border border-slate-200 dark:border-slate-700 transition-colors text-xs font-semibold cursor-pointer shadow-2xs"
              title="Nghe giọng Mỹ (US)"
            >
              <Volume2 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>US</span>
            </button>
          )}

          {entry.ipa.uk && (
            <button
              onClick={() => speakAccent('uk')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-slate-700 dark:text-slate-200 hover:text-blue-800 dark:hover:text-blue-300 border border-slate-200 dark:border-slate-700 transition-colors text-xs font-semibold cursor-pointer shadow-2xs"
              title="Nghe giọng Anh (UK)"
            >
              <Volume2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>UK</span>
            </button>
          )}
        </div>
      </div>

      {/* Meaning & Vietnamese Translation Section */}
      <div className="bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/60 rounded-xl p-3.5 space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wide">
          <Languages className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          <span>Bản dịch tiếng Việt:</span>
        </div>
        <p className="text-sm font-bold text-slate-900 dark:text-amber-100 leading-relaxed">
          {entry.vietnameseDefinition || 'Bản dịch tự động theo ngữ cảnh hội thoại giao tiếp.'}
        </p>
        {entry.definition && entry.definition !== entry.vietnameseDefinition && (
          <p className="text-xs text-slate-600 dark:text-slate-400 border-t border-amber-200/50 dark:border-amber-900/40 pt-1.5 italic">
            EN: {entry.definition}
          </p>
        )}
      </div>

      {/* If Phrase: Render Clickable Word Drilldown */}
      {isPhrase && wordsInPhrase.length > 1 ? (
        <div className="space-y-2 pt-1">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            <BookOpen className="w-3.5 h-3.5 text-amber-500" />
            <span>Tra cứu từng từ trong câu:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {wordsInPhrase.map((tok, i) => (
              <button
                key={i}
                onClick={() => onSearchWord(tok.replace(/[?!.,;:'"]/g, ''))}
                className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-amber-100 dark:hover:bg-amber-950 text-slate-800 dark:text-slate-200 hover:text-amber-900 dark:hover:text-amber-300 font-semibold text-xs border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                title={`Tra từ "${tok}" trong các video`}
              >
                {tok}
              </button>
            ))}
          </div>
        </div>
      ) : (
        /* If Single Word: Interactive Syllables with Stressed Syllable Highlight */
        entry.syllables && entry.syllables.length > 0 && (
          <div className="flex items-center gap-1.5 text-xs font-medium">
            <span className="text-slate-400 uppercase tracking-wider font-semibold mr-1">
              Âm tiết (Syllables):
            </span>
            {entry.syllables.map((syl, i) => (
              <React.Fragment key={i}>
                <span
                  className={`px-2 py-0.5 rounded text-xs ${
                    i === entry.stressedIndex
                      ? 'bg-amber-100 dark:bg-amber-900/60 text-amber-950 dark:text-amber-200 font-bold border border-amber-300 dark:border-amber-700'
                      : 'text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800'
                  }`}
                  title={i === entry.stressedIndex ? 'Trọng âm chính (Primary Stress)' : undefined}
                >
                  {syl}
                </span>
                {i < entry.syllables.length - 1 && <span className="text-slate-300">·</span>}
              </React.Fragment>
            ))}
            {entry.respelling && (
              <span className="text-xs text-slate-400 ml-1 font-mono">({entry.respelling})</span>
            )}
          </div>
        )
      )}

      {/* Pronunciation & Shadowing Tips */}
      {entry.tips && entry.tips.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
            <span>{isPhrase ? 'Bí quyết nói câu & Ngữ điệu tự nhiên' : 'Hướng dẫn phát âm & Trọng âm'}</span>
          </div>
          <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
            {entry.tips.map((tip, idx) => (
              <li key={idx} className="flex items-start gap-2 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
                <span className="font-bold text-amber-600 dark:text-amber-400 shrink-0">#{idx + 1}</span>
                <span className="leading-relaxed">{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Collocations & Phrases */}
      {entry.collocations && entry.collocations.length > 0 && (
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-3 text-xs">
          <div className="space-y-1">
            <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>Cụm từ liên quan:</span>
            </span>
            <div className="flex flex-wrap gap-1.5">
              {entry.collocations.map((col) => (
                <button
                  key={col}
                  onClick={() => onSearchWord(col)}
                  className="text-slate-700 dark:text-slate-300 hover:text-amber-700 dark:hover:text-amber-300 hover:underline bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded text-xs transition-colors cursor-pointer"
                >
                  {col}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
