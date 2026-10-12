import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { 
  Mic, 
  Square, 
  Play, 
  Pause, 
  RotateCcw, 
  Award, 
  CheckCircle2, 
  AlertCircle, 
  Sliders, 
  Sparkles, 
  Volume2, 
  BookMarked, 
  ListFilter,
  History,
  Languages,
  ArrowRight
} from 'lucide-react';
import { speakWordWithVoice, getSentenceIPATranscription } from '../services/pronunciationService';
import { getVietnameseSubtitle, translateSentence } from '../services/translationService';
import { saveShadowingRecord, getRecentShadowingRecords, saveVocabularyItem, ShadowingRecord } from '../services/storageService';

// Curated inspiring sentences from authentic TED Talks
const PRESET_SHADOWING_SENTENCES = [
  {
    sentence: "A leader needs the guts to stand out and be ridiculed.",
    vietnamese: "Một người lãnh đạo cần sự can đảm để nổi bật và chấp nhận bị chế giễu.",
    speaker: "Derek Sivers",
    topic: "Leadership",
    targetWord: "leader",
    videoId: "V74AxCqOTvg",
    startTime: 27.6,
  },
  {
    sentence: "The first follower is what transforms a lone nut into a leader.",
    vietnamese: "Chính người đi theo đầu tiên đã biến một kẻ kỳ quặc đơn độc thành một nhà lãnh đạo.",
    speaker: "Derek Sivers",
    topic: "Leadership",
    targetWord: "follower",
    videoId: "V74AxCqOTvg",
    startTime: 154.0,
  },
  {
    sentence: "Grit is passion and perseverance for very long-term goals.",
    vietnamese: "Ý chí kiên định là niềm đam mê và sự bền bỉ hướng tới các mục tiêu dài hạn.",
    speaker: "Angela Duckworth",
    topic: "Grit & Psychology",
    targetWord: "grit",
    videoId: "H14bBuluwB8",
    startTime: 120.0,
  },
  {
    sentence: "Vulnerability is the birthplace of innovation, creativity and change.",
    vietnamese: "Sự dám mở lòng và dễ tổn thương chính là cội nguồn của sự đổi mới, sáng tạo và thay đổi.",
    speaker: "Brené Brown",
    topic: "Vulnerability",
    targetWord: "vulnerability",
    videoId: "iCvmsMzlF7o",
    startTime: 180.0,
  },
  {
    sentence: "People don't buy what you do; they buy why you do it.",
    vietnamese: "Mọi người không mua những gì bạn làm; họ mua lý do tại sao bạn làm điều đó.",
    speaker: "Simon Sinek",
    topic: "Inspiration",
    targetWord: "buy",
    videoId: "qp0HIF3SfI4",
    startTime: 190.0,
  },
  {
    sentence: "The human voice: it's the instrument we all play.",
    vietnamese: "Giọng nói con người: đó là nhạc cụ mà tất cả chúng ta đều chơi.",
    speaker: "Julian Treasure",
    topic: "Communication",
    targetWord: "voice",
    videoId: "eIho2S0ZahI",
    startTime: 15.0,
  },
  {
    sentence: "Our bodies change our minds and our minds can change our behavior.",
    vietnamese: "Cơ thể thay đổi tâm trí, và tâm trí có thể thay đổi hành vi của chúng ta.",
    speaker: "Amy Cuddy",
    topic: "Body Language",
    targetWord: "bodies",
    videoId: "Ks-_Mh1QhMc",
    startTime: 620.0,
  },
  {
    sentence: "If you're not prepared to be wrong, you'll never come up with anything original.",
    vietnamese: "Nếu bạn không chuẩn bị tâm lý để đón nhận sai sót, bạn sẽ không bao giờ sáng tạo ra điều gì độc đáo.",
    speaker: "Sir Ken Robinson",
    topic: "Creativity",
    targetWord: "original",
    videoId: "iG9CE55wbtY",
    startTime: 310.0,
  },
];

export const ShadowingPage: React.FC = () => {
  const location = useLocation();
  const passedState = location.state as { sentence?: string; targetWord?: string; videoId?: string } | undefined;

  const [currentSentence, setCurrentSentence] = useState<string>(
    passedState?.sentence || PRESET_SHADOWING_SENTENCES[0].sentence
  );
  const [currentTargetWord, setCurrentTargetWord] = useState<string>(
    passedState?.targetWord || PRESET_SHADOWING_SENTENCES[0].targetWord
  );
  const [currentVideoId, setCurrentVideoId] = useState<string>(
    passedState?.videoId || PRESET_SHADOWING_SENTENCES[0].videoId
  );

  const [vietnameseTranslation, setVietnameseTranslation] = useState<string>('');
  const [ipaSentence, setIpaSentence] = useState<string>('');
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [isLooping, setIsLooping] = useState<boolean>(false);
  const [customInputOpen, setCustomInputOpen] = useState<boolean>(false);
  const [customText, setCustomText] = useState<string>('');

  // Audio recording state
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [isPlayingUser, setIsPlayingUser] = useState<boolean>(false);
  const [speechResult, setSpeechResult] = useState<string>('');
  const [recordingTime, setRecordingTime] = useState<number>(0);
  const [score, setScore] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [recentRecords, setRecentRecords] = useState<ShadowingRecord[]>([]);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const userAudioRef = useRef<HTMLAudioElement | null>(null);
  const timerIntervalRef = useRef<any>(null);
  const recognitionRef = useRef<any>(null);

  // Compute translation & IPA whenever current sentence changes
  useEffect(() => {
    const cached = getVietnameseSubtitle(currentSentence, currentVideoId);
    if (cached) {
      setVietnameseTranslation(cached);
    } else {
      setVietnameseTranslation('');
      translateSentence(currentSentence).then((vi) => {
        if (vi) setVietnameseTranslation(vi);
      });
    }
    setIpaSentence(getSentenceIPATranscription(currentSentence));
    setRecordedAudioUrl(null);
    setSpeechResult('');
    setScore(null);
    setErrorMessage(null);
  }, [currentSentence, currentVideoId]);

  // Load recent records
  useEffect(() => {
    getRecentShadowingRecords().then(setRecentRecords);
  }, []);

  // Initialize Web Speech Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          let text = '';
          for (let i = 0; i < event.results.length; i++) {
            text += event.results[i][0].transcript;
          }
          setSpeechResult(text);
        };
        recognitionRef.current = recognition;
      } catch (e) {
        console.warn('Speech recognition init warning:', e);
      }
    }

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (userAudioRef.current) userAudioRef.current.pause();
    };
  }, []);

  // Play native audio via speech synthesis at selected speed
  const playNativeAudio = () => {
    speakWordWithVoice(currentSentence, 'us', playbackSpeed);
  };

  // Start recording
  const startRecording = async () => {
    setErrorMessage(null);
    setSpeechResult('');
    setRecordedAudioUrl(null);
    setScore(null);
    audioChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setRecordedAudioUrl(audioUrl);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);

      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch {}
      }
    } catch (err: any) {
      setErrorMessage('Không thể truy cập Microphone. Vui lòng cấp quyền micro trong cài đặt trình duyệt.');
    }
  };

  // Stop recording & score
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }

      // Calculate score based on recognized text comparison
      setTimeout(() => {
        computeScore();
      }, 600);
    }
  };

  const computeScore = () => {
    const cleanTarget = currentSentence.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim().split(/\s+/);
    const recognized = (speechResult || '').toLowerCase().replace(/[^a-z0-9\s]/g, '').trim().split(/\s+/);

    if (recognized.length === 0 || !recognized[0]) {
      setScore(60);
      return;
    }

    let matched = 0;
    cleanTarget.forEach((word) => {
      if (recognized.includes(word)) matched++;
    });

    const calculated = Math.min(100, Math.max(45, Math.round((matched / cleanTarget.length) * 100)));
    setScore(calculated);

    // Save record to database
    const newRecord: ShadowingRecord = {
      id: `shadow-${Date.now()}`,
      sentence: currentSentence,
      targetWord: currentTargetWord,
      videoId: currentVideoId,
      timestamp: Date.now(),
      score: calculated,
      detectedText: speechResult || 'Audio recorded',
      audioDurationSeconds: recordingTime || 4,
      createdAt: Date.now(),
    };
    saveShadowingRecord(newRecord);
    setRecentRecords((prev) => [newRecord, ...prev.slice(0, 9)]);
  };

  const togglePlayUserAudio = () => {
    if (!recordedAudioUrl) return;

    if (!userAudioRef.current) {
      userAudioRef.current = new Audio(recordedAudioUrl);
      userAudioRef.current.onended = () => setIsPlayingUser(false);
    }

    if (isPlayingUser) {
      userAudioRef.current.pause();
      setIsPlayingUser(false);
    } else {
      userAudioRef.current.play();
      setIsPlayingUser(true);
    }
  };

  // Detailed word comparison
  const wordComparison = useMemo(() => {
    const targetWords = currentSentence.split(/\s+/);
    const detectedWords = (speechResult || '').toLowerCase().split(/\s+/);

    return targetWords.map((word) => {
      const clean = word.toLowerCase().replace(/[^a-z]/g, '');
      const isMatched = detectedWords.some((dw) => dw.includes(clean) || clean.includes(dw));
      return { word, clean, isMatched };
    });
  }, [currentSentence, speechResult]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Page Title */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Mic className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">
              Shadowing Studio · Luyện nhại giọng bản xứ
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Nghe và nhại lại theo nhịp điệu của diễn giả TED Talks, ghi âm và nhận phản hồi tức thì
          </p>
        </div>

        <button
          onClick={() => setCustomInputOpen(!customInputOpen)}
          className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
        >
          <ListFilter className="w-4 h-4 text-amber-500" />
          <span>{customInputOpen ? 'Đóng nhập câu' : 'Nhập câu tùy chọn'}</span>
        </button>
      </div>

      {/* Custom Sentence Input Box */}
      {customInputOpen && (
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-600/60 shadow-xs space-y-3 animate-in fade-in duration-150">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
            Dán hoặc nhập câu tiếng Anh bạn muốn luyện tập:
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder="Ví dụ: Success is a journey, not a destination..."
              className="flex-1 px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl outline-none text-slate-900 dark:text-white"
            />
            <button
              onClick={() => {
                if (customText.trim()) {
                  setCurrentSentence(customText.trim());
                  setCurrentTargetWord(customText.trim().split(' ')[0] || '');
                  setCustomInputOpen(false);
                }
              }}
              className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs cursor-pointer shadow-xs"
            >
              Luyện câu này
            </button>
          </div>
        </div>
      )}

      {/* Main Studio Arena */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 8 Cols: Target Sentence & Recording */}
        <div className="lg:col-span-8 space-y-5">
          {/* Main Sentence Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-3">
              <span className="font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wide text-[11px]">
                🎯 Câu mẫu luyện tập
              </span>
              <div className="flex items-center gap-3">
                {/* Speed Controls */}
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-[11px]">
                  {[0.75, 1.0, 1.25].map((spd) => (
                    <button
                      key={spd}
                      onClick={() => setPlaybackSpeed(spd)}
                      className={`px-2 py-0.5 rounded font-bold transition-all cursor-pointer ${
                        playbackSpeed === spd
                          ? 'bg-amber-400 text-slate-950 shadow-2xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                      }`}
                    >
                      {spd}x
                    </button>
                  ))}
                </div>

                <button
                  onClick={playNativeAudio}
                  className="px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-800 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Nghe giọng bản xứ đọc mẫu"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Nghe mẫu</span>
                </button>
              </div>
            </div>

            {/* English Sentence Display */}
            <div className="space-y-2">
              <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white leading-relaxed">
                "{currentSentence}"
              </p>

              {/* Vietnamese Translation */}
              {vietnameseTranslation && (
                <p className="text-sm sm:text-base font-semibold text-amber-800 dark:text-amber-300 italic">
                  🇻🇳 {vietnameseTranslation}
                </p>
              )}

              {/* IPA Sentence */}
              {ipaSentence && (
                <p className="text-xs font-mono text-slate-400 dark:text-slate-500 pt-1">
                  IPA: /{ipaSentence}/
                </p>
              )}
            </div>

            {/* Error Message if any */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Recording Controls Section */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                {!isRecording ? (
                  <button
                    onClick={startRecording}
                    className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer hover:scale-102"
                  >
                    <Mic className="w-4 h-4" />
                    <span>Bắt đầu thu âm</span>
                  </button>
                ) : (
                  <button
                    onClick={stopRecording}
                    className="px-5 py-2.5 rounded-xl bg-slate-950 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer animate-pulse ring-4 ring-red-500/30"
                  >
                    <Square className="w-4 h-4 text-red-400 fill-red-400" />
                    <span>Dừng & Chấm điểm ({recordingTime}s)</span>
                  </button>
                )}

                {recordedAudioUrl && !isRecording && (
                  <button
                    onClick={togglePlayUserAudio}
                    className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs sm:text-sm shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    {isPlayingUser ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-slate-950" />}
                    <span>{isPlayingUser ? 'Tạm dừng' : 'Nghe giọng của bạn'}</span>
                  </button>
                )}
              </div>

              {/* Bookmark Sentence button */}
              <button
                onClick={async () => {
                  await saveVocabularyItem({
                    id: `sent-shadow-${Date.now()}`,
                    word: currentTargetWord || 'Shadowing sentence',
                    vietnameseMeaning: vietnameseTranslation,
                    exampleSentence: currentSentence,
                    vietnameseSentence: vietnameseTranslation,
                    videoId: currentVideoId,
                    leitnerBox: 1,
                    createdAt: Date.now(),
                    tags: ['Shadowing'],
                  });
                  alert('Đã lưu câu này vào Sổ từ vựng!');
                }}
                className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <BookMarked className="w-3.5 h-3.5" />
                <span>Lưu vào Sổ từ</span>
              </button>
            </div>
          </div>

          {/* Feedback & Word Comparison Arena */}
          {(score !== null || speechResult) && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm p-5 sm:p-6 space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Kết quả phân tích giọng nói AI
                </span>
                {score !== null && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 font-medium">Độ chính xác:</span>
                    <span className={`px-3 py-1 rounded-full font-black text-xs ${
                      score >= 80
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : score >= 60
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : 'bg-red-100 text-red-800 border border-red-300'
                    }`}>
                      {score}%
                    </span>
                  </div>
                )}
              </div>

              {/* Word-by-word visual breakdown */}
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-slate-500">So khớp từng từ:</span>
                <div className="flex flex-wrap gap-1.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  {wordComparison.map((item, idx) => (
                    <span
                      key={idx}
                      className={`px-2 py-1 rounded-lg text-xs font-bold transition-all ${
                        item.isMatched
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300'
                          : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300'
                      }`}
                      title={item.isMatched ? 'Phát âm rõ ràng' : 'Cần nhấn rõ hơn'}
                    >
                      {item.word} {item.isMatched ? '✓' : '•'}
                    </span>
                  ))}
                </div>
              </div>

              {/* Speech Recognition raw text */}
              {speechResult && (
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-slate-500">Văn bản máy nhận diện được từ giọng bạn:</span>
                  <p className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 font-mono text-xs text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 italic">
                    "{speechResult}"
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right 4 Cols: Curated TED Sentence Presets & History */}
        <div className="lg:col-span-4 space-y-4">
          {/* Preset TED Sentences Shelf */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wide text-slate-800 dark:text-white flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Câu nói TED tuyển chọn</span>
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                {PRESET_SHADOWING_SENTENCES.length} câu
              </span>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {PRESET_SHADOWING_SENTENCES.map((item, idx) => {
                const isActive = item.sentence === currentSentence;
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      setCurrentSentence(item.sentence);
                      setCurrentTargetWord(item.targetWord);
                      setCurrentVideoId(item.videoId);
                    }}
                    className={`w-full text-left p-3 rounded-xl border transition-all text-xs space-y-1 ${
                      isActive
                        ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-600 ring-1 ring-amber-300'
                        : 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                      <span className="font-bold text-amber-700 dark:text-amber-400">{item.speaker}</span>
                      <span className="bg-slate-200 dark:bg-slate-700 px-1.5 py-0.2 rounded text-[10px]">
                        {item.topic}
                      </span>
                    </div>
                    <p className="font-medium text-slate-900 dark:text-white line-clamp-2">
                      "{item.sentence}"
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Recent Shadowing History */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wide text-slate-800 dark:text-white flex items-center gap-1.5">
                <History className="w-4 h-4 text-amber-500" />
                <span>Lịch sử luyện tập gần đây</span>
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                {recentRecords.length}
              </span>
            </div>

            {recentRecords.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">
                Chưa có bản ghi âm nào. Hãy bắt đầu luyện tập câu đầu tiên!
              </p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {recentRecords.map((rec) => (
                  <div
                    key={rec.id}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 dark:text-slate-200 truncate max-w-[180px]">
                        "{rec.sentence}"
                      </span>
                      <span className="font-black text-amber-600 dark:text-amber-400 text-[11px]">
                        {rec.score}%
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {new Date(rec.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
