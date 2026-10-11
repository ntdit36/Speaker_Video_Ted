import React from 'react';
import { Bookmark, Keyboard, PlaySquare } from 'lucide-react';

interface NavbarProps {
  activeTab: 'player' | 'explore';
  setActiveTab: (tab: 'player' | 'explore') => void;
  savedCount: number;
  onOpenBookmarks: () => void;
  onOpenShortcuts: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  savedCount,
  onOpenBookmarks,
  onOpenShortcuts,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8 px-4 sm:px-6 py-3.5">
        {/* Zone 1: Single text element wordmark + Cover by Eddy */}
        <a
          href="/"
          className="text-xl font-black tracking-tight text-slate-900 whitespace-nowrap shrink-0 flex items-center gap-2.5 group"
        >
          <span className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white shadow-xs">
            <PlaySquare className="w-5 h-5 fill-white" />
          </span>
          <div className="flex items-center gap-2">
            <span>
              You<span className="text-red-600">Glish</span>
            </span>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs tracking-normal">
              Cover by Eddy
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-200 shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></span>
              TED Talks Exclusive (@TED)
            </span>
          </div>
        </a>

        {/* Zone 2: Clean single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
          <button
            onClick={() => setActiveTab('player')}
            className={`whitespace-nowrap shrink-0 transition-colors pb-0.5 ${
              activeTab === 'player'
                ? 'text-slate-950 font-bold border-b-2 border-amber-500'
                : 'hover:text-slate-950'
            }`}
          >
            Video Pronounce
          </button>
          <button
            onClick={() => setActiveTab('explore')}
            className={`whitespace-nowrap shrink-0 transition-colors pb-0.5 ${
              activeTab === 'explore'
                ? 'text-slate-950 font-bold border-b-2 border-amber-500'
                : 'hover:text-slate-950'
            }`}
          >
            Explore Library
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenShortcuts}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 rounded-lg transition-colors whitespace-nowrap"
            title="Keyboard shortcuts"
          >
            <Keyboard className="w-3.5 h-3.5" />
            <span>Shortcuts</span>
          </button>

          <button
            onClick={onOpenBookmarks}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-900 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-xs transition-colors whitespace-nowrap shrink-0"
          >
            <Bookmark className="w-3.5 h-3.5 fill-slate-900" />
            <span>Saved Clips</span>
            {savedCount > 0 && (
              <span className="ml-0.5 px-1.5 py-0.2 bg-slate-900 text-white rounded-full text-[10px] font-mono tabular-nums">
                {savedCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
