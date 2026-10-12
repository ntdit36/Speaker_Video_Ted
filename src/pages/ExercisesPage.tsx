import React, { useState, useEffect, useMemo } from 'react';
import { 
  BrainCircuit, 
  RotateCcw, 
  CheckCircle2, 
  Volume2, 
  Award, 
  Sparkles, 
  Layers, 
  HelpCircle,
  ArrowRight,
  Flame,
  Check
} from 'lucide-react';
import { getAllVocabulary, updateVocabularyLeitner, recordPracticeSession, VocabularyItem, SEED_VOCABULARY } from '../services/storageService';
import { speakWordWithVoice, getWordIPAMetadata } from '../services/pronunciationService';

export const ExercisesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'flashcards' | 'matching' | 'ipa-quiz'>('flashcards');
  const [vocabulary, setVocabulary] = useState<VocabularyItem[]>(SEED_VOCABULARY);
  const [currentCardIndex, setCurrentCardIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);

  // Matching game state
  const [matchingEnSelected, setMatchingEnSelected] = useState<string | null>(null);
  const [matchingViSelected, setMatchingViSelected] = useState<string | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<string[]>([]);

  // IPA quiz state
  const [ipaQuizQuestionIndex, setIpaQuizQuestionIndex] = useState<number>(0);
  const [ipaQuizSelected, setIpaQuizSelected] = useState<string | null>(null);
  const [ipaScore, setIpaScore] = useState<number>(0);

  useEffect(() => {
    getAllVocabulary().then((items) => {
      if (items && items.length > 0) {
        setVocabulary(items);
      }
    });
  }, []);

  const currentCard = vocabulary[currentCardIndex] || vocabulary[0];

  const handleLeitnerAnswer = async (isCorrect: boolean) => {
    if (!currentCard) return;
    await updateVocabularyLeitner(currentCard.id, isCorrect);
    setIsFlipped(false);
    setCurrentCardIndex((prev) => (prev + 1) % vocabulary.length);

    recordPracticeSession({
      id: `ps-flash-${Date.now()}`,
      type: 'flashcards',
      score: isCorrect ? 100 : 0,
      durationSeconds: 10,
      timestamp: Date.now(),
    });
  };

  // Setup matching game items
  const matchingItems = useMemo(() => {
    const slice = vocabulary.slice(0, 4);
    const enList = slice.map((v) => ({ id: v.id, text: v.word }));
    const viList = slice
      .map((v) => ({ id: v.id, text: v.vietnameseMeaning.split(',')[0] }))
      .sort(() => Math.random() - 0.5);
    return { enList, viList };
  }, [vocabulary]);

  const handleMatchCheck = (enId: string, viId: string) => {
    if (enId === viId) {
      setMatchedPairs((prev) => [...prev, enId]);
      setMatchingEnSelected(null);
      setMatchingViSelected(null);
      if (matchedPairs.length + 1 >= matchingItems.enList.length) {
        recordPracticeSession({
          id: `ps-match-${Date.now()}`,
          type: 'vocabulary',
          score: 100,
          durationSeconds: 30,
          timestamp: Date.now(),
        });
      }
    } else {
      setTimeout(() => {
        setMatchingEnSelected(null);
        setMatchingViSelected(null);
      }, 500);
    }
  };

  // IPA Quiz questions
  const ipaQuizQuestions = useMemo(() => {
    return [
      {
        word: 'leader',
        correctIpa: '/ˈliː.dɚ/',
        options: ['/ˈliː.dɚ/', '/ˈleɪ.dɚ/', '/ˈlɪd.ɚ/'],
      },
      {
        word: 'comfortable',
        correctIpa: '/ˈkʌm.fɚ.t̬ə.bəl/',
        options: ['/kəmˈfɔːr.tə.bəl/', '/ˈkʌm.fɚ.t̬ə.bəl/', '/ˈkɒm.fɔːt.bəl/'],
      },
      {
        word: 'success',
        correctIpa: '/səkˈses/',
        options: ['/ˈsʌk.ses/', '/səkˈses/', '/suːkˈses/'],
      },
      {
        word: 'grit',
        correctIpa: '/ɡrɪt/',
        options: ['/ɡriːt/', '/ɡreɪt/', '/ɡrɪt/'],
      },
    ];
  }, []);

  const currentIpaQuestion = ipaQuizQuestions[ipaQuizQuestionIndex] || ipaQuizQuestions[0];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6 pb-16">
      {/* Page Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
            <BrainCircuit className="w-5 h-5" />
          </span>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            Bài tập & Trắc nghiệm ghi nhớ
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Củng cố từ vựng với Flashcards thuật toán lặp lại ngắt quãng Leitner 5 hộp và trò chơi ghép nghĩa
        </p>

        {/* Tab Buttons */}
        <div className="flex items-center gap-2 mt-4">
          <button
            onClick={() => setActiveTab('flashcards')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'flashcards'
                ? 'bg-amber-400 text-slate-950 shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            Flashcards (Leitner 5 Hộp)
          </button>
          <button
            onClick={() => setActiveTab('matching')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'matching'
                ? 'bg-amber-400 text-slate-950 shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            Ghép từ Anh - Việt
          </button>
          <button
            onClick={() => setActiveTab('ipa-quiz')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'ipa-quiz'
                ? 'bg-amber-400 text-slate-950 shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            Trắc nghiệm nhận diện IPA
          </button>
        </div>
      </div>

      {/* TAB 1: FLASHCARDS */}
      {activeTab === 'flashcards' && currentCard && (
        <div className="max-w-xl mx-auto space-y-6">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>
              Thẻ {currentCardIndex + 1}/{vocabulary.length}
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 font-bold border border-amber-300 dark:border-amber-700">
              Hộp Leitner: Hộp {currentCard.leitnerBox}/5
            </span>
          </div>

          {/* Flashcard Box */}
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="w-full min-h-[300px] p-8 rounded-3xl bg-white dark:bg-slate-900 border-2 border-amber-300 dark:border-amber-600/60 shadow-xl cursor-pointer flex flex-col justify-between items-center text-center transition-all hover:scale-[1.01]"
          >
            {!isFlipped ? (
              // FRONT
              <>
                <div className="w-full flex justify-between items-center text-xs text-slate-400">
                  <span className="uppercase font-semibold tracking-wider">Mặt trước</span>
                  <span className="capitalize">{currentCard.partOfSpeech || 'từ vựng'}</span>
                </div>

                <div className="space-y-3 py-6">
                  <h2 className="text-4xl font-black text-slate-950 dark:text-white capitalize">
                    {currentCard.word}
                  </h2>
                  {currentCard.ipa?.us && (
                    <p className="text-sm font-mono text-slate-500">
                      {currentCard.ipa.us}
                    </p>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      speakWordWithVoice(currentCard.word, 'us');
                    }}
                    className="p-3 rounded-full bg-amber-100 hover:bg-amber-200 text-amber-900 shadow-2xs transition-colors"
                  >
                    <Volume2 className="w-5 h-5" />
                  </button>
                </div>

                <span className="text-xs text-slate-400 italic">
                  👆 Bấm vào thẻ để xem nghĩa & ngữ cảnh câu
                </span>
              </>
            ) : (
              // BACK
              <>
                <div className="w-full flex justify-between items-center text-xs text-amber-600 font-bold">
                  <span className="uppercase tracking-wider">Mặt sau</span>
                  <span>🇻🇳 Nghĩa tiếng Việt</span>
                </div>

                <div className="space-y-4 py-4 w-full">
                  <h3 className="text-2xl font-bold text-amber-900 dark:text-amber-300">
                    {currentCard.vietnameseMeaning}
                  </h3>

                  {currentCard.exampleSentence && (
                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs space-y-1.5 text-left border border-slate-200 dark:border-slate-700">
                      <span className="font-bold text-slate-500 block uppercase text-[10px]">
                        Ví dụ từ TED Talk:
                      </span>
                      <p className="font-semibold text-slate-800 dark:text-slate-200 italic">
                        "{currentCard.exampleSentence}"
                      </p>
                      {currentCard.vietnameseSentence && (
                        <p className="text-slate-500 text-[11px]">
                          → {currentCard.vietnameseSentence}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <span className="text-xs text-slate-400 italic">
                  Chọn mức độ nhớ ở bên dưới để lưu tiến độ
                </span>
              </>
            )}
          </div>

          {/* Leitner Rating Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => handleLeitnerAnswer(false)}
              className="py-3 px-4 rounded-xl bg-red-100 hover:bg-red-200 text-red-900 dark:bg-red-950/60 dark:text-red-300 font-bold text-xs transition-colors cursor-pointer text-center shadow-xs"
            >
              Chưa nhớ (Quay lại Hộp 1)
            </button>
            <button
              onClick={() => handleLeitnerAnswer(true)}
              className="py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs transition-colors cursor-pointer text-center shadow-xs"
            >
              Đã nhớ (+1 Hộp)
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: WORD MATCHING */}
      {activeTab === 'matching' && (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="text-center">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Nối từ tiếng Anh với nghĩa tiếng Việt
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Chọn một từ tiếng Anh và chọn thẻ tiếng Việt tương ứng
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* English Column */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wide block text-center">
                Tiếng Anh
              </span>
              {matchingItems.enList.map((item: { id: string; text: string }) => {
                const isMatched = matchedPairs.includes(item.id);
                const isSelected = matchingEnSelected === item.id;
                return (
                  <button
                    key={item.id}
                    disabled={isMatched}
                    onClick={() => {
                      setMatchingEnSelected(item.id);
                      if (matchingViSelected) handleMatchCheck(item.id, matchingViSelected);
                    }}
                    className={`w-full p-4 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer ${
                      isMatched
                        ? 'bg-emerald-100 border-emerald-300 text-emerald-800 opacity-40 cursor-default'
                        : isSelected
                        ? 'bg-amber-400 border-amber-500 text-slate-950 ring-2 ring-amber-400'
                        : 'bg-white dark:bg-slate-900 hover:bg-slate-50 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <span className="text-sm capitalize">{item.text}</span>
                  </button>
                );
              })}
            </div>

            {/* Vietnamese Column */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wide block text-center">
                Tiếng Việt
              </span>
              {matchingItems.viList.map((item: { id: string; text: string }) => {
                const isMatched = matchedPairs.includes(item.id);
                const isSelected = matchingViSelected === item.id;
                return (
                  <button
                    key={item.id}
                    disabled={isMatched}
                    onClick={() => {
                      setMatchingViSelected(item.id);
                      if (matchingEnSelected) handleMatchCheck(matchingEnSelected, item.id);
                    }}
                    className={`w-full p-4 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer ${
                      isMatched
                        ? 'bg-emerald-100 border-emerald-300 text-emerald-800 opacity-40 cursor-default'
                        : isSelected
                        ? 'bg-amber-400 border-amber-500 text-slate-950 ring-2 ring-amber-400'
                        : 'bg-white dark:bg-slate-900 hover:bg-slate-50 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <span className="text-xs">{item.text}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {matchedPairs.length >= matchingItems.enList.length && (
            <div className="p-4 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-900 text-center text-xs font-bold space-y-2">
              <p>🎉 Chúc mừng! Bạn đã ghép thành công tất cả các cặp từ!</p>
              <button
                onClick={() => setMatchedPairs([])}
                className="px-4 py-2 rounded-lg bg-emerald-700 text-white font-bold cursor-pointer"
              >
                Chơi lại lượt mới
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: IPA QUIZ */}
      {activeTab === 'ipa-quiz' && (
        <div className="max-w-xl mx-auto space-y-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm text-center space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600">
                Câu hỏi {ipaQuizQuestionIndex + 1}/{ipaQuizQuestions.length}
              </span>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white capitalize mt-1">
                "{currentIpaQuestion.word}"
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Chọn phiên âm quốc tế IPA chính xác cho từ này:
              </p>
            </div>

            <button
              onClick={() => speakWordWithVoice(currentIpaQuestion.word, 'us')}
              className="p-3 rounded-full bg-amber-100 hover:bg-amber-200 text-amber-900 inline-flex shadow-2xs"
            >
              <Volume2 className="w-5 h-5" />
            </button>

            {/* Options */}
            <div className="grid grid-cols-1 gap-2.5">
              {currentIpaQuestion.options.map((opt: string, idx: number) => {
                const isSelected = ipaQuizSelected === opt;
                const isCorrect = opt === currentIpaQuestion.correctIpa;
                return (
                  <button
                    key={idx}
                    disabled={ipaQuizSelected !== null}
                    onClick={() => {
                      setIpaQuizSelected(opt);
                      if (isCorrect) setIpaScore((prev) => prev + 1);
                    }}
                    className={`p-3.5 rounded-xl border font-mono text-sm font-bold transition-all cursor-pointer ${
                      ipaQuizSelected === null
                        ? 'bg-slate-50 dark:bg-slate-800 hover:bg-amber-50 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200'
                        : isCorrect
                        ? 'bg-emerald-100 border-emerald-400 text-emerald-900 ring-2 ring-emerald-400'
                        : isSelected
                        ? 'bg-red-100 border-red-400 text-red-900'
                        : 'opacity-50'
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>

            {ipaQuizSelected !== null && (
              <div className="pt-2 animate-in fade-in duration-150">
                <button
                  onClick={() => {
                    setIpaQuizSelected(null);
                    setIpaQuizQuestionIndex((prev) => (prev + 1) % ipaQuizQuestions.length);
                  }}
                  className="px-6 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <span>Câu tiếp theo</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
