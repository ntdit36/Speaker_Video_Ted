import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { 
  PlaySquare, 
  Mic, 
  Headphones, 
  BookMarked, 
  BarChart3, 
  Settings, 
  Keyboard, 
  Bookmark, 
  Menu, 
  X,
  Volume2,
  BrainCircuit,
  Languages,
  Sparkles
} from 'lucide-react';

interface NavbarProps {
  savedCount: number;
  onOpenBookmarks: () => void;
  onOpenShortcuts: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  savedCount,
  onOpenBookmarks,
  onOpenShortcuts,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { to: '/', label: 'Trang chủ', icon: Sparkles, end: true },
    { to: '/video-dictionary', label: 'YouGlish Video', icon: PlaySquare },
    { to: '/shadowing', label: 'Shadowing', icon: Mic },
    { to: '/pronunciation', label: 'Phát âm & IPA', icon: Languages },
    { to: '/listening', label: 'Luyện nghe', icon: Headphones },
    { to: '/exercises', label: 'Bài tập', icon: BrainCircuit },
    { to: '/vocabulary', label: 'Sổ từ vựng', icon: BookMarked },
    { to: '/dashboard', label: 'Tiến độ', icon: BarChart3 },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 px-4 sm:px-6 py-2.5 sm:py-3">
        {/* Brand Logo */}
        <Link
          to="/"
          className="text-lg sm:text-xl font-black tracking-tight text-slate-900 dark:text-white whitespace-nowrap shrink-0 flex items-center gap-2 group"
        >
          <span className="w-8 h-8 rounded-xl bg-gradient-to-tr from-red-600 to-amber-500 flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
            <PlaySquare className="w-4 h-4 fill-white" />
          </span>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span>
              Speaker<span className="text-red-600">TED</span>
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/50 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-700 shadow-2xs">
              Cover by Eddy
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden xl:flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  `px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-amber-400 text-slate-950 font-bold shadow-2xs'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-950 dark:hover:text-white'
                  }`
                }
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{link.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Mid-screen condensed links */}
        <nav className="hidden md:flex xl:hidden items-center gap-1 text-xs font-semibold text-slate-600 dark:text-slate-300">
          <NavLink
            to="/video-dictionary"
            className={({ isActive }) =>
              `px-2 py-1 rounded-md transition-all ${
                isActive ? 'bg-amber-400 text-slate-950 font-bold' : 'hover:bg-slate-100 dark:hover:bg-slate-800'
              }`
            }
          >
            Video
          </NavLink>
          <NavLink
            to="/shadowing"
            className={({ isActive }) =>
              `px-2 py-1 rounded-md transition-all ${
                isActive ? 'bg-amber-400 text-slate-950 font-bold' : 'hover:bg-slate-100 dark:hover:bg-slate-800'
              }`
            }
          >
            Shadowing
          </NavLink>
          <NavLink
            to="/pronunciation"
            className={({ isActive }) =>
              `px-2 py-1 rounded-md transition-all ${
                isActive ? 'bg-amber-400 text-slate-950 font-bold' : 'hover:bg-slate-100 dark:hover:bg-slate-800'
              }`
            }
          >
            Phát âm
          </NavLink>
          <NavLink
            to="/listening"
            className={({ isActive }) =>
              `px-2 py-1 rounded-md transition-all ${
                isActive ? 'bg-amber-400 text-slate-950 font-bold' : 'hover:bg-slate-100 dark:hover:bg-slate-800'
              }`
            }
          >
            Nghe
          </NavLink>
          <NavLink
            to="/vocabulary"
            className={({ isActive }) =>
              `px-2 py-1 rounded-md transition-all ${
                isActive ? 'bg-amber-400 text-slate-950 font-bold' : 'hover:bg-slate-100 dark:hover:bg-slate-800'
              }`
            }
          >
            Từ vựng
          </NavLink>
        </nav>

        {/* Right utility buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onOpenShortcuts}
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-lg transition-colors"
            title="Phím tắt"
          >
            <Keyboard className="w-3.5 h-3.5" />
            <span>Phím tắt</span>
          </button>

          <button
            onClick={onOpenBookmarks}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-900 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-xs transition-colors shrink-0 cursor-pointer"
            title="Xem danh sách clip đã lưu"
          >
            <Bookmark className="w-3.5 h-3.5 fill-slate-900" />
            <span className="hidden sm:inline">Clip đã lưu</span>
            {savedCount > 0 && (
              <span className="ml-0.5 px-1.5 py-0.2 bg-slate-900 text-white rounded-full text-[10px] font-mono tabular-nums">
                {savedCount}
              </span>
            )}
          </button>

          <Link
            to="/settings"
            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors"
            title="Cài đặt"
          >
            <Settings className="w-4 h-4" />
          </Link>

          {/* Mobile hamburger menu toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 md:hidden transition-colors"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 space-y-1 shadow-lg animate-in slide-in-from-top duration-150">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                    isActive
                      ? 'bg-amber-400 text-slate-950 font-bold'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span>{link.label}</span>
              </NavLink>
            );
          })}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                onOpenShortcuts();
              }}
              className="flex items-center gap-1.5 py-1 text-slate-600 dark:text-slate-300 font-medium"
            >
              <Keyboard className="w-3.5 h-3.5" />
              <span>Phím tắt</span>
            </button>
            <Link
              to="/settings"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-1.5 py-1 text-slate-600 dark:text-slate-300 font-medium"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Cài đặt</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
