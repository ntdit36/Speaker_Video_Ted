import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  Moon, 
  Sun, 
  Languages, 
  Mic, 
  Volume2, 
  Download, 
  Upload, 
  RotateCcw, 
  Check, 
  AlertTriangle 
} from 'lucide-react';
import { 
  getAppSettings, 
  saveAppSettings, 
  AppSettings, 
  exportAllUserData, 
  importUserData, 
  DEFAULT_STATS, 
  saveUserStats 
} from '../services/storageService';

export const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<AppSettings>(getAppSettings());
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [isMicTesting, setIsMicTesting] = useState<boolean>(false);
  const [micLevel, setMicLevel] = useState<number>(0);
  const [micMessage, setMicMessage] = useState<string | null>(null);

  useEffect(() => {
    setSettings(getAppSettings());
  }, []);

  const handleUpdate = (updates: Partial<AppSettings>) => {
    const updated = { ...settings, ...updates };
    setSettings(updated);
    saveAppSettings(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleTestMic = async () => {
    setMicMessage(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setIsMicTesting(true);
      setMicMessage('Đã kết nối microphone thành công!');

      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);
      microphone.connect(analyser);
      analyser.fftSize = 256;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const interval = setInterval(() => {
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        setMicLevel(Math.min(100, Math.round((avg / 128) * 100)));
      }, 100);

      setTimeout(() => {
        clearInterval(interval);
        stream.getTracks().forEach((track) => track.stop());
        setIsMicTesting(false);
        setMicLevel(0);
        audioContext.close();
      }, 5000);
    } catch (err) {
      setMicMessage('Không thể kết nối Microphone. Vui lòng cấp quyền trong trình duyệt.');
      setIsMicTesting(false);
    }
  };

  const handleExport = async () => {
    const data = await exportAllUserData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `speaker-video-ted-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e: any) => {
      const file = e.target.files[0];
      if (file) {
        const text = await file.text();
        const success = await importUserData(text);
        if (success) {
          alert('Khôi phục dữ liệu sao lưu thành công!');
          window.location.reload();
        } else {
          alert('Tập tin không hợp lệ.');
        }
      }
    };
    input.click();
  };

  const handleReset = () => {
    if (confirm('Bạn có chắc chắn muốn đặt lại toàn bộ tiến độ học tập về mặc định?')) {
      saveUserStats(DEFAULT_STATS);
      alert('Đã đặt lại tiến độ học tập!');
      window.location.reload();
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-6 pb-16">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              <SettingsIcon className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">
              Cài đặt ứng dụng
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Tùy biến phụ đề song ngữ, giao diện sáng/tối và quản lý dữ liệu học tập
          </p>
        </div>

        {savedSuccess && (
          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 animate-in fade-in">
            <Check className="w-3.5 h-3.5" />
            <span>Đã lưu!</span>
          </span>
        )}
      </div>

      <div className="space-y-5">
        {/* Section 1: Appearance & Theme */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Sun className="w-4 h-4 text-amber-500" />
            <span>Giao diện & Chủ đề</span>
          </h2>

          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                Chế độ hiển thị
              </span>
              <span className="text-[11px] text-slate-400">
                Chuyển đổi giữa nền sáng dễ nhìn và nền tối bảo vệ mắt ban đêm
              </span>
            </div>

            <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold">
              <button
                onClick={() => handleUpdate({ theme: 'light' })}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                  settings.theme === 'light'
                    ? 'bg-amber-400 text-slate-950 shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <Sun className="w-3.5 h-3.5" />
                <span>Sáng</span>
              </button>
              <button
                onClick={() => handleUpdate({ theme: 'dark' })}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                  settings.theme === 'dark'
                    ? 'bg-amber-400 text-slate-950 shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <Moon className="w-3.5 h-3.5" />
                <span>Tối</span>
              </button>
            </div>
          </div>
        </div>

        {/* Section 2: Subtitle Settings */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Languages className="w-4 h-4 text-amber-500" />
            <span>Tùy chọn phụ đề mặc định</span>
          </h2>

          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                Chế độ phụ đề mặc định
              </span>
              <span className="text-[11px] text-slate-400">
                Lựa chọn hiển thị phụ đề khi mở video mới
              </span>
            </div>

            <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold">
              {[
                { id: 'dual', label: 'Song ngữ' },
                { id: 'en', label: 'Chỉ Anh' },
                { id: 'vi', label: 'Chỉ Việt' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => handleUpdate({ subtitleMode: opt.id as any })}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    settings.subtitleMode === opt.id
                      ? 'bg-amber-400 text-slate-950 shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
            <div>
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                Cỡ chữ phụ đề Karaoke
              </span>
              <span className="text-[11px] text-slate-400">
                Điều chỉnh kích thước chữ chạy trên màn hình
              </span>
            </div>

            <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold">
              {[
                { id: 'sm', label: 'Vừa' },
                { id: 'md', label: 'Lớn' },
                { id: 'lg', label: 'Rất lớn' },
              ].map((sz) => (
                <button
                  key={sz.id}
                  onClick={() => handleUpdate({ subtitleFontSize: sz.id as any })}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    settings.subtitleFontSize === sz.id
                      ? 'bg-amber-400 text-slate-950 shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {sz.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Section 3: Audio & Microphone Test */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Mic className="w-4 h-4 text-amber-500" />
            <span>Kiểm tra Microphone & Âm thanh</span>
          </h2>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                  Kiểm tra tín hiệu Micro
                </span>
                <span className="text-[11px] text-slate-400">
                  Thử nói vào micro để kiểm tra độ nhạy trước khi luyện Shadowing
                </span>
              </div>

              <button
                onClick={handleTestMic}
                disabled={isMicTesting}
                className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer shadow-xs disabled:opacity-50"
              >
                {isMicTesting ? 'Đang kiểm tra (5s)...' : 'Bắt đầu test micro'}
              </button>
            </div>

            {/* Mic Level Bar */}
            {isMicTesting && (
              <div className="space-y-1.5 pt-2">
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Âm lượng thu nhận:</span>
                  <span className="font-bold text-amber-500">{micLevel}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-75"
                    style={{ width: `${micLevel}%` }}
                  />
                </div>
              </div>
            )}

            {micMessage && (
              <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                {micMessage}
              </p>
            )}
          </div>
        </div>

        {/* Section 4: Backup & Reset */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Download className="w-4 h-4 text-amber-500" />
            <span>Sao lưu & Đặt lại dữ liệu</span>
          </h2>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                Sao lưu hoặc chuyển dữ liệu sang thiết bị khác
              </span>
              <span className="text-[11px] text-slate-400">
                Toàn bộ từ vựng, điểm số và tiến độ được lưu an toàn dưới dạng tệp JSON
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleExport}
                className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Xuất file JSON</span>
              </button>
              <button
                onClick={handleImport}
                className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Nhập file</span>
              </button>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-red-600 block">
                Đặt lại toàn bộ tiến độ
              </span>
              <span className="text-[11px] text-slate-400">
                Khôi phục thống kê học tập về 0
              </span>
            </div>

            <button
              onClick={handleReset}
              className="px-3.5 py-2 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-300 font-bold text-xs border border-red-200 dark:border-red-800 cursor-pointer"
            >
              Đặt lại tiến độ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
