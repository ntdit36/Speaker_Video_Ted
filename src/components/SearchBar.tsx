import React, { useState, useRef, useEffect } from 'react';
import { Search, X, History, Globe2, Clock, Zap } from 'lucide-react';
import { Accent, Language, DurationFilter } from '../types';
import { POPULAR_SEARCHES } from '../data/dictionary';

interface SearchBarProps {
  currentWord: string;
  onSearch: (word: string, accent: Accent, language: Language) => void;
  accent: Accent;
  onChangeAccent: (accent: Accent) => void;
  language: Language;
  onChangeLanguage: (language: Language) => void;
  history: string[];
  onClearHistory: () => void;
  accentCounts?: Partial<Record<Accent, number>>;
  durationFilter: DurationFilter;
  onChangeDurationFilter: (filter: DurationFilter) => void;
  durationCounts?: {
    all: number;
    under20: number;
    under15: number;
    under10: number;
    under5: number;
  };
}

export const SearchBar: React.FC<SearchBarProps> = ({
  currentWord,
  onSearch,
  accent,
  onChangeAccent,
  language,
  onChangeLanguage,
  history,
  onClearHistory,
  accentCounts,
  durationFilter,
  onChangeDurationFilter,
  durationCounts,
}) => {
  const [inputValue, setInputValue] = useState<string>(currentWord);
  const [showHistoryDropdown, setShowHistoryDropdown] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setInputValue(currentWord);
  }, [currentWord]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowHistoryDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    setShowHistoryDropdown(false);
    onSearch(inputValue.trim(), accent, language);
  };

  const handleSelectHistory = (item: string) => {
    setInputValue(item);
    setShowHistoryDropdown(false);
    onSearch(item, accent, language);
  };

  const accents: { id: Accent; label: string; flag: string }[] = [
    { id: 'all', label: 'All', flag: '🌐' },
    { id: 'us', label: 'US', flag: '🇺🇸' },
    { id: 'uk', label: 'UK', flag: '🇬🇧' },
    { id: 'aus', label: 'AUS', flag: '🇦🇺' },
  ];

  const languages: { id: Language; label: string }[] = [
    { id: 'en', label: 'English' },
    { id: 'vi', label: 'Tiếng Việt' },
    { id: 'es', label: 'Español' },
    { id: 'fr', label: 'Français' },
    { id: 'de', label: 'Deutsch' },
    { id: 'ja', label: '日本語' },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto space-y-3" ref={dropdownRef}>
      {/* Top search form */}
      <form onSubmit={handleSubmit} className="relative flex items-center shadow-sm rounded-xl bg-white border border-slate-300 focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-400/20 transition-all">
        {/* Language selector in input left */}
        <div className="relative pl-3.5 pr-2 py-3 border-r border-slate-200 flex items-center gap-1.5 shrink-0">
          <Globe2 className="w-4 h-4 text-slate-400" />
          <select
            value={language}
            onChange={(e) => onChangeLanguage(e.target.value as Language)}
            className="bg-transparent text-xs font-semibold text-slate-700 outline-none cursor-pointer pr-1"
            title="Choose language"
          >
            {languages.map((l) => (
              <option key={l.id} value={l.id}>
                {l.label}
              </option>
            ))}
          </select>
        </div>

        {/* Search input field */}
        <div className="relative flex-1 flex items-center">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onFocus={() => history.length > 0 && setShowHistoryDropdown(true)}
            placeholder="Tìm từ trong các bài nói TED (@TED): leader, success, grit, water, vulnerable..."
            className="w-full px-4 py-3.5 text-base sm:text-lg text-slate-900 placeholder:text-slate-400 bg-transparent outline-none font-medium"
          />

          {inputValue && (
            <button
              type="button"
              onClick={() => setInputValue('')}
              className="p-1.5 mr-2 text-slate-400 hover:text-slate-600 rounded-full transition-colors"
              title="Clear"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Famous "Say it!" action button */}
        <button
          type="submit"
          className="mr-2 px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-sm rounded-lg transition-all active:scale-95 shadow-xs flex items-center gap-2 whitespace-nowrap shrink-0"
        >
          <Search className="w-4 h-4" />
          <span>Say it!</span>
        </button>

        {/* History Dropdown */}
        {showHistoryDropdown && history.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl z-30 py-2 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-1.5 border-b border-slate-100 text-xs text-slate-400 font-semibold uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <History className="w-3.5 h-3.5" />
                Recent searches
              </span>
              <button
                type="button"
                onClick={onClearHistory}
                className="text-[11px] text-slate-400 hover:text-red-500 font-normal transition-colors"
              >
                Clear all
              </button>
            </div>
            <div className="max-h-56 overflow-y-auto py-1">
              {history.map((item, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleSelectHistory(item)}
                  className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-amber-50/80 hover:text-amber-900 transition-colors flex items-center justify-between"
                >
                  <span className="font-medium capitalize">{item}</span>
                  <Search className="w-3.5 h-3.5 text-slate-300" />
                </button>
              ))}
            </div>
          </div>
        )}
      </form>

      {/* Dual Filter Rows: Accent Filters + Duration (< 10 mins) Filters */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 text-xs">
        {/* Accent Selector */}
        <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-200/80 rounded-lg">
          <span className="px-2 py-1 text-slate-500 font-semibold text-[11px] uppercase tracking-wider">
            Accent:
          </span>
          {accents.map((acc) => {
            const count = accentCounts ? accentCounts[acc.id] : undefined;
            return (
              <button
                key={acc.id}
                type="button"
                onClick={() => onChangeAccent(acc.id)}
                className={`px-3 py-1.5 rounded-md font-semibold text-xs transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                  accent === acc.id
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>{acc.flag}</span>
                <span>{acc.label}</span>
                {count !== undefined && (
                  <span className={`text-[10px] font-mono px-1 py-0.2 rounded ${
                    accent === acc.id ? 'bg-amber-100 text-amber-900 font-bold' : 'bg-slate-200/80 text-slate-600'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Duration Filters */}
        <div className="flex items-center gap-1 p-1 bg-amber-50/90 border border-amber-200/90 rounded-lg flex-wrap">
          <span className="px-2 py-1 text-amber-800 font-bold text-[11px] uppercase tracking-wider flex items-center gap-1">
            <Clock className="w-3 h-3 text-amber-600" />
            <span>Thời lượng:</span>
          </span>

          <button
            type="button"
            onClick={() => onChangeDurationFilter('under5')}
            className={`px-2.5 py-1.5 rounded-md font-semibold text-xs transition-colors whitespace-nowrap flex items-center gap-1 cursor-pointer ${
              durationFilter === 'under5'
                ? 'bg-amber-400 text-slate-950 font-bold shadow-xs'
                : 'text-amber-900 hover:bg-amber-100/80'
            }`}
            title="Video siêu ngắn dưới 5 phút"
          >
            <span>⏱ &lt; 5 phút</span>
            {durationCounts?.under5 !== undefined && (
              <span className={`text-[10px] font-mono px-1 py-0.2 rounded ${
                durationFilter === 'under5' ? 'bg-slate-900 text-white font-bold' : 'bg-amber-200/70 text-amber-950'
              }`}>
                {durationCounts.under5}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => onChangeDurationFilter('under10')}
            className={`px-2.5 py-1.5 rounded-md font-semibold text-xs transition-colors whitespace-nowrap flex items-center gap-1 cursor-pointer ${
              durationFilter === 'under10'
                ? 'bg-amber-400 text-slate-950 font-bold shadow-xs'
                : 'text-amber-900 hover:bg-amber-100/80'
            }`}
            title="Video ngắn dưới 10 phút"
          >
            <span>⚡ &lt; 10 phút</span>
            {durationCounts?.under10 !== undefined && (
              <span className={`text-[10px] font-mono px-1 py-0.2 rounded ${
                durationFilter === 'under10' ? 'bg-slate-900 text-white font-bold' : 'bg-amber-200/70 text-amber-950'
              }`}>
                {durationCounts.under10}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => onChangeDurationFilter('under15')}
            className={`px-2.5 py-1.5 rounded-md font-semibold text-xs transition-colors whitespace-nowrap flex items-center gap-1 cursor-pointer ${
              durationFilter === 'under15'
                ? 'bg-amber-400 text-slate-950 font-bold shadow-xs'
                : 'text-amber-900 hover:bg-amber-100/80'
            }`}
            title="Video dưới 15 phút"
          >
            <span>🎬 &lt; 15 phút</span>
            {durationCounts?.under15 !== undefined && (
              <span className={`text-[10px] font-mono px-1 py-0.2 rounded ${
                durationFilter === 'under15' ? 'bg-slate-900 text-white font-bold' : 'bg-amber-200/70 text-amber-950'
              }`}>
                {durationCounts.under15}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => onChangeDurationFilter('under20')}
            className={`px-2.5 py-1.5 rounded-md font-semibold text-xs transition-colors whitespace-nowrap flex items-center gap-1 cursor-pointer ${
              durationFilter === 'under20'
                ? 'bg-amber-400 text-slate-950 font-bold shadow-xs'
                : 'text-amber-900 hover:bg-amber-100/80'
            }`}
            title="Video dưới 20 phút"
          >
            <span>🎯 &lt; 20 phút</span>
            {durationCounts?.under20 !== undefined && (
              <span className={`text-[10px] font-mono px-1 py-0.2 rounded ${
                durationFilter === 'under20' ? 'bg-slate-900 text-white font-bold' : 'bg-amber-200/70 text-amber-950'
              }`}>
                {durationCounts.under20}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => onChangeDurationFilter('all')}
            className={`px-2.5 py-1.5 rounded-md font-semibold text-xs transition-colors whitespace-nowrap flex items-center gap-1 cursor-pointer ${
              durationFilter === 'all'
                ? 'bg-amber-400 text-slate-950 font-bold shadow-xs'
                : 'text-amber-900 hover:bg-amber-100/80'
            }`}
            title="Tất cả video"
          >
            <span>🌐 Tất cả</span>
            {durationCounts?.all !== undefined && (
              <span className={`text-[10px] font-mono px-1 py-0.2 rounded ${
                durationFilter === 'all' ? 'bg-slate-900 text-white font-bold' : 'bg-amber-200/70 text-amber-950'
              }`}>
                {durationCounts.all}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Popular Quick Suggestions */}
      <div className="flex items-center justify-between text-xs text-slate-500 pt-0.5">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Trending:
          </span>
          {POPULAR_SEARCHES.slice(0, 7).map((pop) => (
            <button
              key={pop}
              type="button"
              onClick={() => onSearch(pop, accent, language)}
              className="text-slate-600 hover:text-amber-700 hover:underline px-1.5 py-0.5 rounded text-xs transition-colors capitalize"
            >
              {pop}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
