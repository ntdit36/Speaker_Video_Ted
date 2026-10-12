import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  BarChart3, 
  Flame, 
  Clock, 
  BookMarked, 
  Mic, 
  CheckCircle2, 
  Layers, 
  Award, 
  ArrowRight,
  TrendingUp,
  Calendar,
  Sparkles,
  Headphones
} from 'lucide-react';
import { getUserStats, getAllVocabulary, UserStats, VocabularyItem } from '../services/storageService';

export const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<UserStats>(getUserStats());
  const [vocabulary, setVocabulary] = useState<VocabularyItem[]>([]);

  useEffect(() => {
    setStats(getUserStats());
    getAllVocabulary().then(setVocabulary);
  }, []);

  // Leitner distribution calculation
  const boxCounts = [1, 2, 3, 4, 5].map((box) => ({
    box,
    count: vocabulary.filter((v) => v.leitnerBox === box).length,
  }));

  const masteredCount = vocabulary.filter((v) => v.leitnerBox >= 4).length;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6 pb-16">
      {/* Page Title */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
            <BarChart3 className="w-5 h-5" />
          </span>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            Bảng theo dõi tiến độ & Thống kê học tập
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Theo dõi chuỗi ngày kiên trì rèn luyện, số lượng từ vựng đã ghi nhớ và thời gian luyện nghe nói
        </p>
      </div>

      {/* 4 Big Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Streak */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/15 via-amber-500/5 to-white dark:to-slate-900 border border-amber-300 dark:border-amber-700 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-amber-600 dark:text-amber-400">
            <span className="text-xs font-bold uppercase tracking-wide">Chuỗi ngày học</span>
            <Flame className="w-5 h-5 fill-amber-500 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-black text-slate-950 dark:text-white">
              {stats.streakDays}
            </span>
            <span className="text-xs text-slate-500 font-semibold">ngày liên tiếp</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Giữ vững thói quen học mỗi ngày để duy trì chuỗi
          </p>
        </div>

        {/* Metric 2: Study Time */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-indigo-600 dark:text-indigo-400">
            <span className="text-xs font-bold uppercase tracking-wide">Thời gian đã học</span>
            <Clock className="w-5 h-5" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-black text-slate-950 dark:text-white">
              {stats.totalMinutesStudied}
            </span>
            <span className="text-xs text-slate-500 font-semibold">phút</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Mục tiêu hàng ngày: {stats.dailyGoalMinutes} phút/ngày
          </p>
        </div>

        {/* Metric 3: Vocabulary */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
            <span className="text-xs font-bold uppercase tracking-wide">Từ vựng trong sổ</span>
            <BookMarked className="w-5 h-5" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-black text-slate-950 dark:text-white">
              {vocabulary.length}
            </span>
            <span className="text-xs text-slate-500 font-semibold">từ</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            {masteredCount} từ đã đạt Hộp 4-5 (Thành thạo)
          </p>
        </div>

        {/* Metric 4: Shadowing Sessions */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-red-600 dark:text-red-400">
            <span className="text-xs font-bold uppercase tracking-wide">Lượt Shadowing</span>
            <Mic className="w-5 h-5" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-black text-slate-950 dark:text-white">
              {stats.shadowingCount}
            </span>
            <span className="text-xs text-slate-500 font-semibold">lần thu âm</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Đã hoàn thành {stats.quizzesCompleted} bài kiểm tra
          </p>
        </div>
      </div>

      {/* 15-Minute Daily Guided Practice Routine */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-slate-50 dark:to-slate-900 border border-amber-300 dark:border-amber-700/60 shadow-sm space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <span>Lộ trình rèn luyện 15 phút mỗi ngày</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Phương pháp tối ưu để cải thiện phản xạ và ngữ điệu mà không bị quá tải
            </p>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-400 text-slate-950 shadow-2xs">
            Khuyên dùng mỗi ngày
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          <Link
            to="/video-dictionary"
            className="p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-amber-400 transition-all space-y-2 group"
          >
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-red-600">Bước 1 · 3 phút</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-amber-500">
              Nghe YouGlish TED
            </h3>
            <p className="text-[11px] text-slate-500">
              Tra cứu 1-2 từ và nghe người bản xứ đọc trong video
            </p>
          </Link>

          <Link
            to="/shadowing"
            className="p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-amber-400 transition-all space-y-2 group"
          >
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-amber-600">Bước 2 · 4 phút</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-amber-500">
              Luyện Shadowing
            </h3>
            <p className="text-[11px] text-slate-500">
              Thu âm giọng nói và nhại theo 1 câu trích dẫn TED
            </p>
          </Link>

          <Link
            to="/listening"
            className="p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-amber-400 transition-all space-y-2 group"
          >
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-indigo-600">Bước 3 · 4 phút</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-amber-500">
              Luyện nghe chính tả
            </h3>
            <p className="text-[11px] text-slate-500">
              Điền từ còn thiếu vào câu nói của diễn giả
            </p>
          </Link>

          <Link
            to="/exercises"
            className="p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-amber-400 transition-all space-y-2 group"
          >
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-purple-600">Bước 4 · 4 phút</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-amber-500">
              Ôn Flashcards Leitner
            </h3>
            <p className="text-[11px] text-slate-500">
              Lật thẻ từ vựng và nâng cấp hộp ghi nhớ
            </p>
          </Link>
        </div>
      </div>

      {/* Leitner Box Spaced Repetition Distribution Chart */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-amber-500" />
            <span>Phân bố mức độ ghi nhớ từ vựng (Hộp Leitner 1 → 5)</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Mục tiêu là đưa toàn bộ từ vựng từ Hộp 1 (Mới lưu) lên Hộp 5 (Ghi nhớ vĩnh viễn)
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 pt-2">
          {boxCounts.map((item) => (
            <div
              key={item.box}
              className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center space-y-1.5"
            >
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Hộp {item.box}
              </span>
              <span className="text-2xl font-black text-slate-950 dark:text-white block">
                {item.count}
              </span>
              <span className="text-[10px] text-slate-400 block">
                {item.box === 1
                  ? 'Mới lưu'
                  : item.box <= 3
                  ? 'Đang nhớ'
                  : 'Thành thạo'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
