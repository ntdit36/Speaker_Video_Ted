import React from 'react';
import { WordEntry } from '../types';
import { Volume2, Lightbulb, Link2 } from 'lucide-react';

interface WordGuideProps {
  entry: WordEntry;
  onSearchWord: (word: string) => void;
}

export const WordGuide: React.FC<WordGuideProps> = ({ entry, onSearchWord }) => {
  const speakAccent = (accent: 'us' | 'uk' | 'aus') => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(entry.word);
      utterance.rate = 0.85; // slightly slower for clear phonetic practice
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
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm p-5 space-y-5">
      {/* Word Header with Syllables and Accents */}
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight capitalize">
              {entry.word}
            </h1>
            <span className="text-xs font-medium text-slate-500 italic bg-slate-100 px-2 py-0.5 rounded">
              {entry.partOfSpeech}
            </span>
          </div>

          {/* Interactive Syllables with Stressed Syllable Highlight */}
          <div className="mt-2 flex items-center gap-1.5 text-sm font-medium">
            <span className="text-slate-400 text-xs uppercase tracking-wider font-semibold mr-1">
              Syllables:
            </span>
            {entry.syllables.map((syl, i) => (
              <React.Fragment key={i}>
                <span
                  className={`px-1.5 py-0.5 rounded ${
                    i === entry.stressedIndex
                      ? 'bg-amber-100 text-amber-900 font-bold border border-amber-300'
                      : 'text-slate-700 bg-slate-50'
                  }`}
                  title={i === entry.stressedIndex ? 'Primary Stress Syllable' : undefined}
                >
                  {syl}
                </span>
                {i < entry.syllables.length - 1 && <span className="text-slate-300">·</span>}
              </React.Fragment>
            ))}
            <span className="text-xs text-slate-400 ml-2">({entry.respelling})</span>
          </div>
        </div>

        {/* Audio buttons for different accents */}
        <div className="flex items-center gap-2">
          {entry.ipa.us && (
            <button
              onClick={() => speakAccent('us')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-amber-50 text-slate-700 hover:text-amber-800 border border-slate-200 transition-colors text-xs font-semibold"
              title="Listen in US American accent"
            >
              <Volume2 className="w-3.5 h-3.5 text-amber-600" />
              <span>US</span>
            </button>
          )}

          {entry.ipa.uk && (
            <button
              onClick={() => speakAccent('uk')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-amber-50 text-slate-700 hover:text-amber-800 border border-slate-200 transition-colors text-xs font-semibold"
              title="Listen in UK British accent"
            >
              <Volume2 className="w-3.5 h-3.5 text-blue-600" />
              <span>UK</span>
            </button>
          )}

          {entry.ipa.general && (
            <button
              onClick={() => speakAccent('us')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-amber-50 text-slate-700 hover:text-amber-800 border border-slate-200 transition-colors text-xs font-semibold"
              title="Listen Audio"
            >
              <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Audio</span>
            </button>
          )}
        </div>
      </div>


      {/* Pronunciation Tips / Secrets */}
      {entry.tips && entry.tips.length > 0 && (
        <div className="space-y-2.5 pt-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 uppercase tracking-wider">
            <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
            <span>Pronunciation Tips & Native Traps</span>
          </div>
          <ul className="space-y-2 text-xs text-slate-600">
            {entry.tips.map((tip, idx) => (
              <li key={idx} className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <span className="font-bold text-amber-600 shrink-0">#{idx + 1}</span>
                <span className="leading-relaxed">{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Rhymes & Collocations */}
      {((entry.rhymes && entry.rhymes.length > 0) || (entry.collocations && entry.collocations.length > 0)) && (
        <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-4 text-xs">
          {entry.rhymes && entry.rhymes.length > 0 && (
            <div className="space-y-1">
              <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                Rhymes with:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {entry.rhymes.map((rhyme) => (
                  <button
                    key={rhyme}
                    onClick={() => onSearchWord(rhyme)}
                    className="text-slate-600 hover:text-amber-700 hover:underline bg-slate-100 px-2 py-0.5 rounded text-xs transition-colors"
                  >
                    {rhyme}
                  </button>
                ))}
              </div>
            </div>
          )}

          {entry.collocations && entry.collocations.length > 0 && (
            <div className="space-y-1">
              <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                Common phrases:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {entry.collocations.map((col) => (
                  <button
                    key={col}
                    onClick={() => onSearchWord(col)}
                    className="text-slate-600 hover:text-amber-700 hover:underline bg-slate-100 px-2 py-0.5 rounded text-xs transition-colors"
                  >
                    {col}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
