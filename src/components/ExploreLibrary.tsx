import React, { useState } from 'react';
import { Volume2, Play, BookOpen, Sparkles, Filter } from 'lucide-react';
import { CURATED_DICTIONARY, POPULAR_SEARCHES, TOP_CATEGORIES } from '../data/dictionary';
import { Accent, Language } from '../types';

interface ExploreLibraryProps {
  onSelectWord: (word: string, accent?: Accent, language?: Language) => void;
}

export const ExploreLibrary: React.FC<ExploreLibraryProps> = ({ onSelectWord }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const words = Object.values(CURATED_DICTIONARY);

  const filteredWords = words.filter((w) => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'short') {
      return w.clips.some((c) => c.isShort);
    }
    if (selectedCategory === 'leadership') {
      return ['leader', 'movement', 'motivation'].includes(w.word);
    }
    if (selectedCategory === 'psychology') {
      return ['vulnerable', 'grit', 'stress', 'introvert', 'comfortable'].includes(w.word);
    }
    if (selectedCategory === 'education') {
      return ['creative', 'listen', 'language', 'story'].includes(w.word);
    }
    if (selectedCategory === 'science') {
      return ['water', 'success'].includes(w.word);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Category Filter Pills (Functional Buttons conforming to rule 1.A) */}
      <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-white rounded-xl border border-slate-200/90 shadow-xs">
        {TOP_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              selectedCategory === cat.id
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Grid of Word Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredWords.map((entry) => (
          <div
            key={entry.word}
            className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs hover:border-amber-400 hover:shadow-md transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-bold text-slate-900 capitalize group-hover:text-amber-600 transition-colors">
                  {entry.word}
                </h3>
                <span className="text-xs text-slate-400 font-mono">
                  {entry.clips.length} {entry.clips.length === 1 ? 'clip' : 'clips'}
                </span>
              </div>

              {/* Syllables & Respelling */}
              <div className="text-xs font-mono text-slate-500 mb-2.5">
                {entry.respelling} · {entry.partOfSpeech}
              </div>

              {/* Definition */}
              <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4">
                {entry.definition}
              </p>
            </div>

            {/* Action Bar */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-400 text-[11px] font-medium">
                {entry.clips[0]?.channel || 'TED'}
              </span>

              <button
                onClick={() => onSelectWord(entry.word, 'all', entry.language)}
                className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <Play className="w-3.5 h-3.5 fill-slate-950" />
                <span>Watch Clips</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
