import React from 'react';
import { X, Keyboard } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'Space', desc: 'Play / Pause YouTube video' },
    { key: '←', desc: 'Previous clip' },
    { key: '→', desc: 'Next clip' },
    { key: 'R', desc: 'Replay current sentence / phrase' },
    { key: 'L', desc: 'Toggle continuous sentence loop' },
    { key: '/', desc: 'Quick jump to search box' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Keyboard className="w-5 h-5 text-slate-700" />
            <h2 className="text-base font-bold text-slate-900">Keyboard Shortcuts</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Shortcuts list */}
        <div className="p-6 space-y-3">
          {shortcuts.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between text-sm py-1 border-b border-slate-50 last:border-0">
              <span className="text-slate-600 text-xs">{item.desc}</span>
              <kbd className="px-2.5 py-1 bg-slate-100 border border-slate-300 rounded font-mono text-xs font-semibold text-slate-800 shadow-xs">
                {item.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 text-right">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
