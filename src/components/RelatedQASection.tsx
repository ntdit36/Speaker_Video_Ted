import React, { useState } from 'react';
import { QuestionAnswer } from '../types';
import { 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  Volume2, 
  Copy, 
  Check, 
  MessageSquareQuote,
  Sparkles,
  BookOpen,
  Languages
} from 'lucide-react';

interface RelatedQASectionProps {
  word: string;
  qaList: QuestionAnswer[];
  onSearchWord: (word: string) => void;
}

export const RelatedQASection: React.FC<RelatedQASectionProps> = ({
  word,
  qaList,
  onSearchWord,
}) => {
  const [openIds, setOpenIds] = useState<Record<string, boolean>>({
    [qaList[0]?.id || '']: true, // Open the first item by default
  });
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const toggleOpen = (id: string) => {
    setOpenIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const toggleAll = (expand: boolean) => {
    const newState: Record<string, boolean> = {};
    qaList.forEach((q) => {
      newState[q.id] = expand;
    });
    setOpenIds(newState);
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  const copyQA = (qa: QuestionAnswer) => {
    const text = `Q: ${qa.question}\nA: ${qa.answer}`;
    navigator.clipboard.writeText(text);
    setCopiedId(qa.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredQA = qaList.filter((qa) => {
    if (activeCategory === 'all') return true;
    return qa.category === activeCategory;
  });

  const allOpen = filteredQA.every((q) => openIds[q.id]);

  return (
    <div className="w-full bg-white rounded-xl border border-slate-200/90 shadow-xs p-4 sm:p-5 space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center shrink-0 shadow-2xs">
            <MessageSquareQuote className="w-5 h-5 text-amber-700" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
              <span>Đề xuất câu hỏi &amp; trả lời liên quan đến "{word}"</span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                {qaList.length} câu hỏi
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              Các thắc mắc phát âm thường gặp, mẫu hội thoại giao tiếp &amp; mẹo dùng từ ngữ cảnh thực tế
            </p>
          </div>
        </div>

        {/* Category Pills & Expand/Collapse */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => toggleAll(!allOpen)}
            className="px-2 py-1 text-[11px] font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors"
          >
            {allOpen ? 'Thu gọn tất cả' : 'Mở rộng tất cả'}
          </button>

          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-2.5 py-1 rounded-md font-semibold text-[11px] transition-colors ${
                activeCategory === 'all'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tất cả ({qaList.length})
            </button>
            <button
              onClick={() => setActiveCategory('pronunciation')}
              className={`px-2.5 py-1 rounded-md font-semibold text-[11px] transition-colors ${
                activeCategory === 'pronunciation'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Phát âm
            </button>
            <button
              onClick={() => setActiveCategory('conversation')}
              className={`px-2.5 py-1 rounded-md font-semibold text-[11px] transition-colors ${
                activeCategory === 'conversation'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Hội thoại
            </button>
          </div>
        </div>
      </div>

      {/* Suggested Quick Question Badges */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-none">
        <span className="text-slate-400 text-[11px] font-medium shrink-0 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-500" />
          <span>Gợi ý nhanh:</span>
        </span>
        {qaList.slice(0, 4).map((qa) => (
          <button
            key={qa.id}
            type="button"
            onClick={() => {
              setOpenIds((prev) => ({ ...prev, [qa.id]: true }));
              const el = document.getElementById(`qa-card-${qa.id}`);
              el?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }}
            className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-900 text-[11px] font-medium shrink-0 transition-colors border border-slate-200/60 truncate max-w-[220px]"
          >
            {qa.question}
          </button>
        ))}
      </div>

      {/* Accordion Questions List */}
      <div className="space-y-2.5">
        {filteredQA.map((qa) => {
          const isOpen = !!openIds[qa.id];
          return (
            <div
              id={`qa-card-${qa.id}`}
              key={qa.id}
              className={`rounded-xl border transition-all ${
                isOpen
                  ? 'border-amber-300/80 bg-amber-50/20 shadow-2xs'
                  : 'border-slate-200/70 bg-slate-50/50 hover:border-slate-300'
              }`}
            >
              {/* Question Clickable Header */}
              <button
                type="button"
                onClick={() => toggleOpen(qa.id)}
                className="w-full text-left p-3 sm:p-3.5 flex items-start justify-between gap-3 cursor-pointer"
              >
                <div className="flex items-start gap-2.5 flex-1 min-w-0">
                  <span className="font-bold text-amber-700 text-xs mt-0.5 bg-amber-100/90 px-1.5 py-0.5 rounded shrink-0 shadow-2xs">
                    Q
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 leading-snug">
                      {qa.question}
                    </h4>
                    {qa.vietnameseQuestion && (
                      <p className="text-xs text-slate-500 mt-0.5 font-normal">
                        {qa.vietnameseQuestion}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 mt-0.5">
                  <span className="text-[10px] font-semibold uppercase font-mono px-1.5 py-0.5 rounded bg-slate-200/70 text-slate-600">
                    {qa.category}
                  </span>
                  <div className="text-slate-400 hover:text-slate-600">
                    {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>
              </button>

              {/* Answer Expansion Pane */}
              {isOpen && (
                <div className="px-3 pb-3.5 sm:px-4 sm:pb-4 pt-1 border-t border-amber-100/60 space-y-3 text-xs leading-relaxed">
                  <div className="flex items-start gap-2.5">
                    <span className="font-bold text-emerald-700 text-xs mt-0.5 bg-emerald-100 px-1.5 py-0.5 rounded shrink-0 shadow-2xs">
                      A
                    </span>
                    <div className="flex-1 space-y-2">
                      <div className="text-slate-800 text-sm whitespace-pre-line leading-relaxed font-normal">
                        {qa.answer}
                      </div>

                      {qa.vietnameseAnswer && (
                        <div className="bg-amber-100/60 text-slate-700 p-2.5 rounded-lg border border-amber-200/70 text-xs">
                          <strong className="text-amber-900 font-semibold block mb-0.5">
                            💡 Giải thích tiếng Việt:
                          </strong>
                          <span className="leading-relaxed">{qa.vietnameseAnswer}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions for this QA */}
                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 flex-wrap">
                    <button
                      type="button"
                      onClick={() => onSearchWord(qa.question.split(' ').slice(0, 4).join(' '))}
                      className="px-2.5 py-1 text-amber-800 hover:bg-amber-100/80 rounded text-[11px] font-semibold flex items-center gap-1 transition-colors"
                      title="Tìm câu này trên YouGlish"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      <span>Tìm cụm này trên YouGlish</span>
                    </button>

                    <div className="flex items-center gap-1.5 ml-auto">
                      <button
                        type="button"
                        onClick={() => speakText(qa.question)}
                        className="px-2 py-1 text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded text-[11px] font-semibold flex items-center gap-1 transition-colors"
                        title="Nghe phát âm câu hỏi"
                      >
                        <Volume2 className="w-3.5 h-3.5 text-amber-600" />
                        <span>Nghe Q</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => speakText(qa.answer)}
                        className="px-2 py-1 text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded text-[11px] font-semibold flex items-center gap-1 transition-colors"
                        title="Nghe phát âm câu trả lời"
                      >
                        <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Nghe A</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => copyQA(qa)}
                        className="px-2 py-1 text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded text-[11px] font-semibold flex items-center gap-1 transition-colors"
                        title="Sao chép nội dung câu hỏi &amp; trả lời"
                      >
                        {copiedId === qa.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-700">Đã chép</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Sao chép</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
