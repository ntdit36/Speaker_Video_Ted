import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, Pause, RotateCcw, Award, CheckCircle2, AlertCircle } from 'lucide-react';

interface ShadowingStudioProps {
  sentence: string;
  targetWord: string;
  onReplayNative: () => void;
}

export const ShadowingStudio: React.FC<ShadowingStudioProps> = ({
  sentence,
  targetWord,
  onReplayNative,
}) => {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [isPlayingUser, setIsPlayingUser] = useState<boolean>(false);
  const [speechResult, setSpeechResult] = useState<string>('');
  const [recordingTime, setRecordingTime] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const userAudioRef = useRef<HTMLAudioElement | null>(null);
  const timerIntervalRef = useRef<any>(null);
  const recognitionRef = useRef<any>(null);

  // Initialize Speech Recognition if supported
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setSpeechResult(transcript);
        };
        recognition.onerror = () => {
          // ignore error
        };
        recognitionRef.current = recognition;
      } catch (e) {
        console.error(e);
      }
    }

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (userAudioRef.current) {
        userAudioRef.current.pause();
      }
    };
  }, []);

  const startRecording = async () => {
    setErrorMessage(null);
    setSpeechResult('');
    setRecordedAudioUrl(null);
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
        // stop audio tracks
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
        } catch {
          // already running or not supported
        }
      }
    } catch (err: any) {
      console.error('Microphone error:', err);
      setErrorMessage('Microphone access denied or not available. Please allow mic permission in your browser.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
    }
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

  // Evaluate matching words
  const calculateMatch = () => {
    if (!speechResult) return null;
    const targetClean = targetWord.toLowerCase().trim();
    const resultWords = speechResult.toLowerCase().split(/\s+/);
    const hasTarget = resultWords.some((w) => w.includes(targetClean));

    return {
      hasTarget,
      detected: speechResult,
    };
  };

  const matchData = calculateMatch();

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Mic className="w-4 h-4 text-amber-500" />
            <span>Shadowing & Voice Practice</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Luyện nói nhại theo người bản xứ — ghi âm và so sánh trực tiếp
          </p>
        </div>

        <button
          onClick={onReplayNative}
          className="text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-lg border border-amber-200 transition-colors flex items-center gap-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Nghe lại mẫu Native</span>
        </button>
      </div>

      {/* Target sentence display */}
      <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200/70 text-slate-700 text-sm italic">
        "{sentence}"
      </div>

      {errorMessage && (
        <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Recording controls */}
      <div className="flex flex-wrap items-center gap-3">
        {!isRecording ? (
          <button
            onClick={startRecording}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium text-xs shadow-xs transition-colors"
          >
            <Mic className="w-4 h-4" />
            <span>Bắt đầu thu âm</span>
          </button>
        ) : (
          <button
            onClick={stopRecording}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs shadow-xs transition-colors animate-pulse"
          >
            <Square className="w-4 h-4 text-red-400 fill-red-400" />
            <span>Dừng thu ({recordingTime}s)</span>
          </button>
        )}

        {recordedAudioUrl && !isRecording && (
          <button
            onClick={togglePlayUserAudio}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-medium text-xs shadow-xs transition-colors"
          >
            {isPlayingUser ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-slate-950" />}
            <span>{isPlayingUser ? 'Tạm dừng' : 'Nghe giọng của bạn'}</span>
          </button>
        )}
      </div>

      {/* Speech Recognition Feedback */}
      {matchData && (
        <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-600">Giọng nhận diện được:</span>
            {matchData.hasTarget ? (
              <span className="flex items-center gap-1 text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Phát âm chuẩn từ khóa "{targetWord}"
              </span>
            ) : (
              <span className="flex items-center gap-1 text-amber-700 font-bold bg-amber-100 px-2 py-0.5 rounded text-[11px]">
                <Award className="w-3.5 h-3.5" />
                Hãy thử lại để chuẩn âm hơn
              </span>
            )}
          </div>
          <p className="text-slate-800 font-mono text-sm bg-white p-2 rounded border border-slate-200">
            "{matchData.detected}"
          </p>
        </div>
      )}
    </div>
  );
};
