import React, { useState } from 'react';
import { 
  Languages, 
  Volume2, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  Sparkles, 
  BookOpen, 
  Award,
  ChevronRight,
  RotateCcw
} from 'lucide-react';
import { 
  MINIMAL_PAIRS_DATABASE, 
  SYLLABLE_STRESS_DRILLS, 
  speakWordWithVoice,
  MinimalPair,
  SyllableStressDrill
} from '../services/pronunciationService';

export const PronunciationPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'minimal-pairs' | 'stress' | 'quiz'>('minimal-pairs');
  const [selectedPairIndex, setSelectedPairIndex] = useState<number>(0);
  const [selectedStressDrillIndex, setSelectedStressDrillIndex] = useState<number>(0);

  // Minimal pair listening quiz state
  const [quizWord, setQuizWord] = useState<{ target: 1 | 2; word1: string; word2: string } | null>(null);
  const [quizAnswerSelected, setQuizAnswerSelected] = useState<1 | 2 | null>(null);
  const [quizScore, setQuizScore] = useState<number>(0);
  const [quizQuestionsAnswered, setQuizQuestionsAnswered] = useState<number>(0);

  const activePair: MinimalPair = MINIMAL_PAIRS_DATABASE[selectedPairIndex] || MINIMAL_PAIRS_DATABASE[0];
  const activeStressDrill: SyllableStressDrill = SYLLABLE_STRESS_DRILLS[selectedStressDrillIndex] || SYLLABLE_STRESS_DRILLS[0];

  // Start a new quiz question
  const startQuizQuestion = () => {
    const pair = MINIMAL_PAIRS_DATABASE[Math.floor(Math.random() * MINIMAL_PAIRS_DATABASE.length)];
    const item = pair.words[Math.floor(Math.random() * pair.words.length)];
    const target = Math.random() > 0.5 ? 1 : 2;
    setQuizWord({
      target,
      word1: item.word1,
      word2: item.word2,
    });
    setQuizAnswerSelected(null);
    // Play the target audio
    const wordToPlay = target === 1 ? item.word1 : item.word2;
    speakWordWithVoice(wordToPlay, 'us');
  };

  const handleSelectQuizAnswer = (selected: 1 | 2) => {
    if (!quizWord || quizAnswerSelected !== null) return;
    setQuizAnswerSelected(selected);
    setQuizQuestionsAnswered((prev) => prev + 1);
    if (selected === quizWord.target) {
      setQuizScore((prev) => prev + 1);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6 pb-16">
      {/* Page Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400">
            <Languages className="w-5 h-5" />
          </span>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            Phát âm chuẩn & Phiên âm quốc tế IPA
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Hệ thống luyện phát âm chuyên sâu giúp người Việt khắc phục nuốt âm đuôi, nhầm lẫn nguyên âm và lệch trọng âm
        </p>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mt-4">
          <button
            onClick={() => setActiveTab('minimal-pairs')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'minimal-pairs'
                ? 'bg-amber-400 text-slate-950 shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            Cặp âm tối thiểu (Minimal Pairs)
          </button>
          <button
            onClick={() => setActiveTab('stress')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'stress'
                ? 'bg-amber-400 text-slate-950 shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            Quy tắc trọng âm từ
          </button>
          <button
            onClick={() => {
              setActiveTab('quiz');
              if (!quizWord) startQuizQuestion();
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'quiz'
                ? 'bg-amber-400 text-slate-950 shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            Trắc nghiệm phân biệt âm
          </button>
        </div>
      </div>

      {/* TAB 1: MINIMAL PAIRS */}
      {activeTab === 'minimal-pairs' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left 4 Cols: Category selector */}
          <div className="lg:col-span-4 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block px-1">
              Chọn cặp âm rèn luyện
            </span>
            <div className="space-y-1.5">
              {MINIMAL_PAIRS_DATABASE.map((pair, idx) => (
                <button
                  key={pair.id}
                  onClick={() => setSelectedPairIndex(idx)}
                  className={`w-full text-left p-3 rounded-xl border transition-all text-xs flex items-center justify-between cursor-pointer ${
                    idx === selectedPairIndex
                      ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-600 ring-1 ring-amber-300 font-bold text-slate-950 dark:text-white'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-slate-50 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div>
                    <span className="font-mono text-amber-700 dark:text-amber-400 font-bold block">
                      {pair.phonemePair}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                      {pair.description}
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                </button>
              ))}
            </div>
          </div>

          {/* Right 8 Cols: Pair detail & interactive drill */}
          <div className="lg:col-span-8 space-y-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-4">
              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white font-mono text-amber-600 dark:text-amber-400">
                  {activePair.phonemePair}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {activePair.description}
                </p>
              </div>

              {/* Vietnamese Tip Box */}
              <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-slate-800 dark:text-amber-100 space-y-1">
                <span className="font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wide block text-[11px]">
                  💡 Mẹo phát âm cho người Việt:
                </span>
                <p className="leading-relaxed">
                  {activePair.vietnameseTip}
                </p>
              </div>

              {/* Word Pairs Comparison Table */}
              <div className="space-y-2 pt-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Danh sách cặp từ đối sánh trực tiếp:
                </span>
                <div className="grid grid-cols-1 gap-2.5">
                  {activePair.words.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3 text-xs"
                    >
                      {/* Word 1 */}
                      <div className="flex items-center gap-2.5 flex-1 min-w-[140px]">
                        <button
                          onClick={() => speakWordWithVoice(item.word1, 'us')}
                          className="p-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold transition-colors cursor-pointer shadow-2xs"
                          title={`Nghe "${item.word1}"`}
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-900 dark:text-white text-sm">{item.word1}</span>
                            <span className="font-mono text-slate-500 dark:text-slate-400">{item.ipa1}</span>
                          </div>
                          <span className="text-[11px] text-slate-500 italic">"{item.viMeaning1}"</span>
                        </div>
                      </div>

                      <span className="text-slate-300 dark:text-slate-600 font-bold hidden sm:inline">VS</span>

                      {/* Word 2 */}
                      <div className="flex items-center gap-2.5 flex-1 min-w-[140px] justify-start sm:justify-end">
                        <div>
                          <div className="flex items-center gap-1.5 sm:justify-end">
                            <span className="font-bold text-slate-900 dark:text-white text-sm">{item.word2}</span>
                            <span className="font-mono text-slate-500 dark:text-slate-400">{item.ipa2}</span>
                          </div>
                          <span className="text-[11px] text-slate-500 italic block sm:text-right">"{item.viMeaning2}"</span>
                        </div>
                        <button
                          onClick={() => speakWordWithVoice(item.word2, 'us')}
                          className="p-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-white font-bold transition-colors cursor-pointer shadow-2xs"
                          title={`Nghe "${item.word2}"`}
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SYLLABLE STRESS */}
      {activeTab === 'stress' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-4 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block px-1">
              Quy luật trọng âm
            </span>
            <div className="space-y-1.5">
              {SYLLABLE_STRESS_DRILLS.map((drill, idx) => (
                <button
                  key={drill.id}
                  onClick={() => setSelectedStressDrillIndex(idx)}
                  className={`w-full text-left p-3 rounded-xl border transition-all text-xs flex items-center justify-between cursor-pointer ${
                    idx === selectedStressDrillIndex
                      ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-600 ring-1 ring-amber-300 font-bold text-slate-950 dark:text-white'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-slate-50 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span className="line-clamp-2">{drill.category}</span>
                  <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-8 space-y-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  {activeStressDrill.category}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  {activeStressDrill.ruleDescription}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {activeStressDrill.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 dark:text-white text-sm">{item.word}</span>
                      <button
                        onClick={() => speakWordWithVoice(item.word.split(' ')[0], 'us')}
                        className="p-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 cursor-pointer shadow-2xs"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-1 font-mono text-xs">
                      {item.syllables.map((syl, sIdx) => (
                        <span
                          key={sIdx}
                          className={`px-2 py-0.5 rounded ${
                            sIdx === item.stressedIndex
                              ? 'bg-amber-400 text-slate-950 font-black shadow-2xs'
                              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          {syl}
                        </span>
                      ))}
                    </div>

                    <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-slate-700">
                      <span className="font-mono">{item.ipa}</span>
                      <span className="italic">{item.viMeaning}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: LISTENING QUIZ */}
      {activeTab === 'quiz' && (
        <div className="max-w-xl mx-auto space-y-4">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm text-center space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wide text-amber-600 dark:text-amber-400">
                Thử thách phân biệt âm
              </span>
              <h3 className="text-xl font-black text-slate-900 dark:text-white mt-1">
                Máy vừa phát âm từ nào?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Lắng nghe kỹ khẩu âm và chọn từ chính xác
              </p>
            </div>

            {/* Score Tracker */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300">
              <Award className="w-4 h-4 text-amber-500" />
              <span>Điểm số: {quizScore}/{quizQuestionsAnswered} câu đúng</span>
            </div>

            {/* Audio Replay Button */}
            {quizWord && (
              <div className="py-2">
                <button
                  onClick={() => {
                    const toPlay = quizWord.target === 1 ? quizWord.word1 : quizWord.word2;
                    speakWordWithVoice(toPlay, 'us');
                  }}
                  className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 flex items-center justify-center shadow-lg mx-auto transition-transform hover:scale-105 cursor-pointer"
                  title="Nghe lại âm thanh"
                >
                  <Volume2 className="w-8 h-8" />
                </button>
                <span className="text-xs text-slate-400 mt-2 block">Bấm vào để nghe lại</span>
              </div>
            )}

            {/* Answer Options */}
            {quizWord && (
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => handleSelectQuizAnswer(1)}
                  disabled={quizAnswerSelected !== null}
                  className={`p-4 rounded-xl border text-sm font-bold transition-all cursor-pointer ${
                    quizAnswerSelected === null
                      ? 'bg-slate-50 dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-amber-950/40 border-slate-200 dark:border-slate-700'
                      : quizWord.target === 1
                      ? 'bg-emerald-100 dark:bg-emerald-950/60 border-emerald-400 text-emerald-900 dark:text-emerald-200 ring-2 ring-emerald-400'
                      : quizAnswerSelected === 1
                      ? 'bg-red-100 dark:bg-red-950/60 border-red-400 text-red-900 dark:text-red-200'
                      : 'opacity-50'
                  }`}
                >
                  <span className="text-lg block capitalize">{quizWord.word1}</span>
                </button>

                <button
                  onClick={() => handleSelectQuizAnswer(2)}
                  disabled={quizAnswerSelected !== null}
                  className={`p-4 rounded-xl border text-sm font-bold transition-all cursor-pointer ${
                    quizAnswerSelected === null
                      ? 'bg-slate-50 dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-amber-950/40 border-slate-200 dark:border-slate-700'
                      : quizWord.target === 2
                      ? 'bg-emerald-100 dark:bg-emerald-950/60 border-emerald-400 text-emerald-900 dark:text-emerald-200 ring-2 ring-emerald-400'
                      : quizAnswerSelected === 2
                      ? 'bg-red-100 dark:bg-red-950/60 border-red-400 text-red-900 dark:text-red-200'
                      : 'opacity-50'
                  }`}
                >
                  <span className="text-lg block capitalize">{quizWord.word2}</span>
                </button>
              </div>
            )}

            {/* Next Question Button */}
            {quizAnswerSelected !== null && (
              <div className="pt-2 animate-in fade-in duration-150">
                <button
                  onClick={startQuizQuestion}
                  className="px-6 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 text-white font-bold text-xs transition-colors shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                >
                  <span>Câu tiếp theo</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
