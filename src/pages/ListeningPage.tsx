import React, { useState, useEffect, useMemo } from 'react';
import { 
  Headphones, 
  Volume2, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  Sparkles, 
  Award, 
  HelpCircle, 
  ArrowRight,
  Flame,
  Check,
  Undo2
} from 'lucide-react';
import { speakWordWithVoice } from '../services/pronunciationService';
import { recordPracticeSession } from '../services/storageService';

interface ListeningChallenge {
  id: string;
  sentence: string;
  vietnamese: string;
  blanks: string[]; // words to blank out for dictation
  speaker: string;
  topic: string;
}

const LISTENING_CHALLENGES: ListeningChallenge[] = [
  {
    id: 'lc-1',
    sentence: "A leader needs the guts to stand out and be ridiculed.",
    vietnamese: "Một người lãnh đạo cần sự can đảm để nổi bật và chấp nhận bị chế giễu.",
    blanks: ['guts', 'ridiculed'],
    speaker: "Derek Sivers",
    topic: "Leadership",
  },
  {
    id: 'lc-2',
    sentence: "Grit is passion and perseverance for very long-term goals.",
    vietnamese: "Ý chí kiên định là niềm đam mê và sự bền bỉ hướng tới các mục tiêu dài hạn.",
    blanks: ['passion', 'perseverance'],
    speaker: "Angela Duckworth",
    topic: "Psychology",
  },
  {
    id: 'lc-3',
    sentence: "Vulnerability is the birthplace of innovation, creativity and change.",
    vietnamese: "Sự dám mở lòng và dễ tổn thương chính là cội nguồn của sự đổi mới, sáng tạo và thay đổi.",
    blanks: ['innovation', 'creativity'],
    speaker: "Brené Brown",
    topic: "Emotion",
  },
  {
    id: 'lc-4',
    sentence: "The human voice is the instrument we all play.",
    vietnamese: "Giọng nói con người là nhạc cụ mà tất cả chúng ta đều chơi.",
    blanks: ['voice', 'instrument'],
    speaker: "Julian Treasure",
    topic: "Communication",
  },
  {
    id: 'lc-5',
    sentence: "People don't buy what you do; they buy why you do it.",
    vietnamese: "Mọi người không mua những gì bạn làm; họ mua lý do tại sao bạn làm điều đó.",
    blanks: ['buy', 'why'],
    speaker: "Simon Sinek",
    topic: "Leadership",
  },
];

export const ListeningPage: React.FC = () => {
  const [mode, setMode] = useState<'blanks' | 'unscramble' | 'dictation'>('blanks');
  const [challengeIndex, setChallengeIndex] = useState<number>(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);

  // Blanks state
  const [blankInputs, setBlankInputs] = useState<Record<string, string>>({});
  const [blanksChecked, setBlanksChecked] = useState<boolean>(false);
  const [blanksResult, setBlanksResult] = useState<Record<string, boolean>>({});

  // Full dictation state
  const [dictationInput, setDictationInput] = useState<string>('');
  const [dictationChecked, setDictationChecked] = useState<boolean>(false);
  const [dictationAccuracy, setDictationAccuracy] = useState<number | null>(null);

  // Unscramble state
  const [unscrambleAvailableWords, setUnscrambleAvailableWords] = useState<{ id: string; word: string }[]>([]);
  const [unscrambleSelectedWords, setUnscrambleSelectedWords] = useState<{ id: string; word: string }[]>([]);
  const [unscrambleChecked, setUnscrambleChecked] = useState<boolean>(false);
  const [unscrambleIsCorrect, setUnscrambleIsCorrect] = useState<boolean | null>(null);

  const currentChallenge = LISTENING_CHALLENGES[challengeIndex] || LISTENING_CHALLENGES[0];

  // Setup challenge on change
  useEffect(() => {
    setBlankInputs({});
    setBlanksChecked(false);
    setBlanksResult({});

    setDictationInput('');
    setDictationChecked(false);
    setDictationAccuracy(null);

    // Setup unscramble shuffled words
    const words = currentChallenge.sentence.replace(/[.,;?!]/g, '').split(/\s+/);
    const shuffled = words
      .map((w, idx) => ({ id: `word-${idx}-${w}`, word: w }))
      .sort(() => Math.random() - 0.5);

    setUnscrambleAvailableWords(shuffled);
    setUnscrambleSelectedWords([]);
    setUnscrambleChecked(false);
    setUnscrambleIsCorrect(null);
  }, [challengeIndex, currentChallenge]);

  const playAudio = () => {
    speakWordWithVoice(currentChallenge.sentence, 'us', playbackSpeed);
  };

  // Check blanks
  const handleCheckBlanks = () => {
    const results: Record<string, boolean> = {};
    currentChallenge.blanks.forEach((blank) => {
      const userVal = (blankInputs[blank] || '').trim().toLowerCase();
      results[blank] = userVal === blank.toLowerCase();
    });
    setBlanksResult(results);
    setBlanksChecked(true);

    const isAllCorrect = Object.values(results).every(Boolean);
    recordPracticeSession({
      id: `ps-listen-${Date.now()}`,
      type: 'listening',
      score: isAllCorrect ? 100 : 50,
      durationSeconds: 15,
      timestamp: Date.now(),
    });
  };

  // Check dictation
  const handleCheckDictation = () => {
    const cleanTarget = currentChallenge.sentence.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim().split(/\s+/);
    const cleanUser = dictationInput.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim().split(/\s+/);

    let matchCount = 0;
    cleanTarget.forEach((word) => {
      if (cleanUser.includes(word)) matchCount++;
    });

    const accuracy = Math.round((matchCount / cleanTarget.length) * 100);
    setDictationAccuracy(accuracy);
    setDictationChecked(true);

    recordPracticeSession({
      id: `ps-dict-${Date.now()}`,
      type: 'listening',
      score: accuracy,
      durationSeconds: 30,
      timestamp: Date.now(),
    });
  };

  // Handle word unscramble click
  const handleSelectWord = (wordObj: { id: string; word: string }) => {
    if (unscrambleChecked) return;
    setUnscrambleAvailableWords((prev) => prev.filter((w) => w.id !== wordObj.id));
    setUnscrambleSelectedWords((prev) => [...prev, wordObj]);
  };

  const handleDeselectWord = (wordObj: { id: string; word: string }) => {
    if (unscrambleChecked) return;
    setUnscrambleSelectedWords((prev) => prev.filter((w) => w.id !== wordObj.id));
    setUnscrambleAvailableWords((prev) => [...prev, wordObj]);
  };

  const handleCheckUnscramble = () => {
    const userSentence = unscrambleSelectedWords.map((w) => w.word.toLowerCase()).join(' ');
    const targetSentence = currentChallenge.sentence.replace(/[.,;?!]/g, '').toLowerCase().trim();
    const isCorrect = userSentence === targetSentence;
    setUnscrambleIsCorrect(isCorrect);
    setUnscrambleChecked(true);

    recordPracticeSession({
      id: `ps-unscramble-${Date.now()}`,
      type: 'listening',
      score: isCorrect ? 100 : 40,
      durationSeconds: 20,
      timestamp: Date.now(),
    });
  };

  const handleNextChallenge = () => {
    setChallengeIndex((prev) => (prev + 1) % LISTENING_CHALLENGES.length);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6 pb-16">
      {/* Page Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
            <Headphones className="w-5 h-5" />
          </span>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            Luyện nghe & Chép chính tả TED Talks
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Rèn luyện khả năng bắt âm, phân tách từ ngữ và kiểm tra độ chính xác khi nghe câu nói hoàn chỉnh
        </p>

        {/* Mode Selector */}
        <div className="flex items-center gap-2 mt-4">
          <button
            onClick={() => setMode('blanks')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              mode === 'blanks'
                ? 'bg-amber-400 text-slate-950 shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            Điền từ còn thiếu (Dictation)
          </button>
          <button
            onClick={() => setMode('dictation')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              mode === 'dictation'
                ? 'bg-amber-400 text-slate-950 shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            Chép chính tả cả câu
          </button>
          <button
            onClick={() => setMode('unscramble')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              mode === 'unscramble'
                ? 'bg-amber-400 text-slate-950 shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            Xếp từ thành câu (Unscramble)
          </button>
        </div>
      </div>

      {/* Main Challenge Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-amber-600 dark:text-amber-400">
              Câu {challengeIndex + 1}/{LISTENING_CHALLENGES.length}
            </span>
            <span>·</span>
            <span>Diễn giả: {currentChallenge.speaker}</span>
          </div>

          {/* Speed Controls */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-[11px]">
            {[0.75, 1.0].map((spd) => (
              <button
                key={spd}
                onClick={() => setPlaybackSpeed(spd)}
                className={`px-2 py-0.5 rounded font-bold cursor-pointer ${
                  playbackSpeed === spd ? 'bg-amber-400 text-slate-950 shadow-2xs' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>
        </div>

        {/* Audio Playback Center */}
        <div className="text-center py-2 space-y-2">
          <button
            onClick={playAudio}
            className="w-20 h-20 rounded-full bg-gradient-to-tr from-indigo-600 to-amber-500 hover:from-indigo-500 hover:to-amber-400 text-white flex items-center justify-center shadow-lg mx-auto transition-transform hover:scale-105 cursor-pointer"
            title="Bấm để nghe đoạn câu"
          >
            <Volume2 className="w-8 h-8" />
          </button>
          <span className="text-xs text-slate-400 block">Bấm để nghe âm thanh (hoặc nghe lại nhiều lần)</span>
        </div>

        {/* MODE 1: FILL IN THE BLANKS */}
        {mode === 'blanks' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 leading-loose text-base sm:text-lg">
              {currentChallenge.sentence.split(/\s+/).map((word, idx) => {
                const cleanWord = word.toLowerCase().replace(/[^a-z]/g, '');
                const isBlank = currentChallenge.blanks.includes(cleanWord);

                if (isBlank) {
                  const isChecked = blanksChecked;
                  const isCorrect = blanksResult[cleanWord];
                  return (
                    <span key={idx} className="inline-block mx-1">
                      <input
                        type="text"
                        value={blankInputs[cleanWord] || ''}
                        disabled={blanksChecked}
                        onChange={(e) =>
                          setBlankInputs((prev) => ({ ...prev, [cleanWord]: e.target.value }))
                        }
                        placeholder="____"
                        className={`px-2 py-1 text-sm font-bold border-2 rounded-lg outline-none w-28 text-center transition-all ${
                          !isChecked
                            ? 'bg-white dark:bg-slate-900 border-amber-300 dark:border-amber-600'
                            : isCorrect
                            ? 'bg-emerald-100 border-emerald-500 text-emerald-900'
                            : 'bg-red-100 border-red-500 text-red-900'
                        }`}
                      />
                    </span>
                  );
                }

                return (
                  <span key={idx} className="mr-1 text-slate-800 dark:text-slate-200 font-medium">
                    {word}
                  </span>
                );
              })}
            </div>

            {/* Vietnamese Translation hint */}
            <p className="text-xs text-slate-500 italic">
              🇻🇳 Gợi ý nghĩa: "{currentChallenge.vietnamese}"
            </p>

            <div className="pt-2 flex items-center justify-between">
              {!blanksChecked ? (
                <button
                  onClick={handleCheckBlanks}
                  className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-xs cursor-pointer"
                >
                  Kiểm tra đáp án
                </button>
              ) : (
                <button
                  onClick={handleNextChallenge}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 text-white font-bold text-xs shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                >
                  <span>Câu tiếp theo</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* MODE 2: FULL SENTENCE DICTATION */}
        {mode === 'dictation' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Gõ lại toàn bộ câu bạn nghe được:
              </label>
              <textarea
                value={dictationInput}
                onChange={(e) => setDictationInput(e.target.value)}
                disabled={dictationChecked}
                rows={3}
                placeholder="Nhập câu tiếng Anh tại đây..."
                className="w-full p-3.5 text-sm sm:text-base rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>

            {dictationChecked && dictationAccuracy !== null && (
              <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700 dark:text-slate-300">Độ chính xác:</span>
                  <span className="font-black text-amber-700 dark:text-amber-300 text-sm">
                    {dictationAccuracy}%
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Câu gốc của diễn giả:</span>
                  <p className="font-bold text-slate-900 dark:text-white mt-0.5">
                    "{currentChallenge.sentence}"
                  </p>
                </div>
              </div>
            )}

            <div className="pt-2 flex items-center justify-between">
              {!dictationChecked ? (
                <button
                  onClick={handleCheckDictation}
                  disabled={!dictationInput.trim()}
                  className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-xs cursor-pointer disabled:opacity-50"
                >
                  Kiểm tra độ chính xác
                </button>
              ) : (
                <button
                  onClick={handleNextChallenge}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 text-white font-bold text-xs shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                >
                  <span>Câu tiếp theo</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* MODE 3: SENTENCE UNSCRAMBLE */}
        {mode === 'unscramble' && (
          <div className="space-y-4">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
              Bấm vào các từ bên dưới theo đúng thứ tự bạn nghe được:
            </span>

            {/* Selected words dropzone */}
            <div className="min-h-16 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border-2 border-dashed border-amber-300 dark:border-amber-600/60 flex flex-wrap gap-2 items-center">
              {unscrambleSelectedWords.length === 0 ? (
                <span className="text-xs text-slate-400 italic">Chọn các từ bên dưới để xếp vào đây...</span>
              ) : (
                unscrambleSelectedWords.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleDeselectWord(item)}
                    className="px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-2xs cursor-pointer transition-all flex items-center gap-1"
                  >
                    <span>{item.word}</span>
                    <span className="text-[10px] text-amber-900">×</span>
                  </button>
                ))
              )}
            </div>

            {/* Available words bank */}
            <div className="flex flex-wrap gap-2 pt-2">
              {unscrambleAvailableWords.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleSelectWord(item)}
                  className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-medium text-xs cursor-pointer transition-all shadow-2xs"
                >
                  {item.word}
                </button>
              ))}
            </div>

            {unscrambleChecked && (
              <div className={`p-3.5 rounded-xl text-xs font-bold border ${
                unscrambleIsCorrect
                  ? 'bg-emerald-100 border-emerald-300 text-emerald-800'
                  : 'bg-red-100 border-red-300 text-red-800'
              }`}>
                {unscrambleIsCorrect
                  ? '🎉 Hoàn toàn chính xác! Tuyệt vời!'
                  : `Chưa chính xác. Câu đúng: "${currentChallenge.sentence}"`}
              </div>
            )}

            <div className="pt-2 flex items-center justify-between">
              {!unscrambleChecked ? (
                <button
                  onClick={handleCheckUnscramble}
                  disabled={unscrambleSelectedWords.length === 0}
                  className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-xs cursor-pointer disabled:opacity-50"
                >
                  Kiểm tra thứ tự câu
                </button>
              ) : (
                <button
                  onClick={handleNextChallenge}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 text-white font-bold text-xs shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                >
                  <span>Câu tiếp theo</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
