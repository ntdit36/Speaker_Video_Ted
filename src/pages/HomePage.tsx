import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Search, 
  Play, 
  Mic, 
  Headphones, 
  BookMarked, 
  BarChart3, 
  Languages, 
  Flame, 
  Sparkles, 
  ArrowRight, 
  Clock, 
  CheckCircle2, 
  Compass,
  Award,
  Video
} from 'lucide-react';
import { KNOWN_VIDEO_CATALOG } from '../services/transcriptService';
import { getUserStats, getAllVocabulary, UserStats } from '../services/storageService';

const TOPIC_TAGS = [
  { label: 'Lãnh đạo & Tầm nhìn', word: 'leader' },
  { label: 'Ý chí kiên cường (Grit)', word: 'grit' },
  { label: 'Sự mở lòng (Vulnerability)', word: 'vulnerable' },
  { label: 'Nghệ thuật nói & Lắng nghe', word: 'listen' },
  { label: 'Bí quyết thành công', word: 'success' },
  { label: 'Hạnh phúc & Ý nghĩa sống', word: 'happiness' },
  { label: 'Thói quen 30 ngày', word: 'habit' },
  { label: 'Trì hoãn công việc', word: 'procrastinator' },
];

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState('');
  const [stats, setStats] = useState<UserStats>(getUserStats());
  const [vocabCount, setVocabCount] = useState<number>(0);

  useEffect(() => {
    setStats(getUserStats());
    getAllVocabulary().then((items) => setVocabCount(items.length));
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = searchInput.trim();
    if (clean) {
      navigate(`/video-dictionary?q=${encodeURIComponent(clean)}`);
    }
  };

  const featuredVideos = Object.values(KNOWN_VIDEO_CATALOG).slice(0, 6);

  return (
    <div className="space-y-10 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-amber-500/10 via-amber-500/5 to-transparent border-b border-slate-200/80 dark:border-slate-800 pt-10 pb-12 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 text-xs font-bold shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            <span>Nền tảng luyện tiếng Anh thực chiến từ diễn giả TED Talks</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-slate-950 dark:text-white tracking-tight leading-tight">
            Luyện phát âm & Nghe nói tiếng Anh chuẩn cùng{' '}
            <span className="text-red-600 underline decoration-amber-400 decoration-wavy decoration-2">
              TED Talks
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Tra cứu cách người bản xứ phát âm từng từ, luyện nhại tiếng (Shadowing) có chấm điểm bằng giọng nói,
            học phụ đề song ngữ Anh - Việt và ghi nhớ từ vựng với phương pháp lặp lại ngắt quãng.
          </p>

          {/* Quick Search Input */}
          <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto">
            <div className="relative flex items-center shadow-lg rounded-2xl bg-white dark:bg-slate-900 border-2 border-amber-300 dark:border-amber-500/50 p-1.5 focus-within:ring-4 focus-within:ring-amber-400/20 transition-all">
              <Search className="w-5 h-5 text-amber-500 ml-3.5 shrink-0" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Nhập từ hoặc cụm từ bạn muốn nghe phát âm (ví dụ: leader, grit, vulnerable)..."
                className="w-full px-3 py-2.5 text-sm sm:text-base bg-transparent text-slate-900 dark:text-white placeholder-slate-400 outline-none"
              />
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs sm:text-sm shrink-0 transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <span>Tìm video</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Quick Topic Chips */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <span className="text-xs text-slate-400 font-semibold mr-1">Chủ đề gợi ý:</span>
            {TOPIC_TAGS.map((tag) => (
              <button
                key={tag.word}
                onClick={() => navigate(`/video-dictionary?q=${encodeURIComponent(tag.word)}`)}
                className="px-2.5 py-1 rounded-lg text-xs font-medium bg-white dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-amber-950/50 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-amber-300 transition-all cursor-pointer shadow-2xs"
              >
                {tag.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Daily Progress & Streak Quick Widget */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-gradient-to-r from-amber-500/10 via-red-500/5 to-slate-100 dark:from-slate-900 dark:to-slate-800/80 rounded-2xl border border-amber-200/80 dark:border-slate-700 p-5 sm:p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-400/20 border border-amber-300 dark:border-amber-600 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
              <Flame className="w-8 h-8 fill-amber-500 text-amber-500 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-slate-900 dark:text-white">
                  Chuỗi ngày học: {stats.streakDays} ngày liên tiếp
                </h2>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                  Đang hoạt động
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1">
                Đã học {stats.totalMinutesStudied}/{stats.dailyGoalMinutes} phút hôm nay · {vocabCount} từ vựng trong sổ tay · {stats.shadowingCount} lượt luyện Shadowing
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <Link
              to="/shadowing"
              className="flex-1 md:flex-none text-center px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              <Mic className="w-4 h-4 text-amber-400" />
              <span>Luyện Shadowing ngay</span>
            </Link>
            <Link
              to="/dashboard"
              className="flex-1 md:flex-none text-center px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 text-slate-800 dark:text-white font-bold text-xs border border-slate-200 dark:border-slate-700 shadow-2xs transition-colors flex items-center justify-center gap-1.5"
            >
              <BarChart3 className="w-4 h-4 text-amber-500" />
              <span>Xem chi tiết</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Core Learning Modes Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-5">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Compass className="w-6 h-6 text-amber-500" />
            <span>Phương pháp học toàn diện 4 kỹ năng</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Kết hợp ngữ cảnh thực tế từ diễn giả quốc tế và công cụ công nghệ thông minh
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {/* Card 1: Video Dictionary */}
          <Link
            to="/video-dictionary"
            className="group p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-amber-300 dark:hover:border-amber-500/50 shadow-xs hover:shadow-md transition-all space-y-3 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 flex items-center justify-center text-red-600">
                <Play className="w-5 h-5 fill-red-600" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                YouGlish Video Dictionary
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Tìm kiếm và nghe cách người bản xứ phát âm từng từ trong các bài TED Talks. Phụ đề chạy song ngữ Anh - Việt chính xác từng mili-giây.
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400 pt-2">
              <span>Bắt đầu tra từ</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Card 2: Shadowing Studio */}
          <Link
            to="/shadowing"
            className="group p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-amber-300 dark:hover:border-amber-500/50 shadow-xs hover:shadow-md transition-all space-y-3 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-600">
                <Mic className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                Shadowing Studio (Luyện nói nhại)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Nghe người bản xứ, thu âm giọng nói của bạn, lặp lại nhiều lần với chế độ loop, nhận diện giọng nói và chấm điểm độ chuẩn xác.
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400 pt-2">
              <span>Mở phòng thu âm</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Card 3: Pronunciation & IPA */}
          <Link
            to="/pronunciation"
            className="group p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-amber-300 dark:hover:border-amber-500/50 shadow-xs hover:shadow-md transition-all space-y-3 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 flex items-center justify-center text-sky-600">
                <Languages className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                Luyện phát âm & Bảng phiên âm IPA
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Chuyên biệt cho người Việt: Luyện các cặp âm tối thiểu hay nhầm lẫn (/θ/ vs /s/, /iː/ vs /ɪ/...) và quy tắc nhấn trọng âm từ chuẩn.
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400 pt-2">
              <span>Học phát âm chuẩn</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Card 4: Listening Comprehension */}
          <Link
            to="/listening"
            className="group p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-amber-300 dark:hover:border-amber-500/50 shadow-xs hover:shadow-md transition-all space-y-3 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600">
                <Headphones className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                Luyện nghe & Chép chính tả
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                4 chế độ luyện nghe: Điền từ còn thiếu (Dictation), chép chính tả câu hoàn chỉnh, xếp từ thành câu và trắc nghiệm nội dung TED.
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400 pt-2">
              <span>Thử thách nghe</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Card 5: Vocabulary & Flashcards */}
          <Link
            to="/vocabulary"
            className="group p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-amber-300 dark:hover:border-amber-500/50 shadow-xs hover:shadow-md transition-all space-y-3 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600">
                <BookMarked className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                Sổ từ vựng & Flashcards Leitner
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Lưu từ vựng kèm ngữ cảnh câu nói TED thật. Ôn tập flashcard thông minh theo 5 hộp Leitner để ghi nhớ vĩnh viễn vào trí nhớ dài hạn.
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400 pt-2">
              <span>Mở sổ từ vựng ({vocabCount})</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Card 6: Dashboard & Analytics */}
          <Link
            to="/dashboard"
            className="group p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-amber-300 dark:hover:border-amber-500/50 shadow-xs hover:shadow-md transition-all space-y-3 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 flex items-center justify-center text-purple-600">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                Tiến độ & Phân tích học tập
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Theo dõi biểu đồ chuỗi ngày học liên tục, phân bổ mức độ thuần thục từ vựng và gợi ý lộ trình 15 phút rèn luyện mỗi ngày.
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400 pt-2">
              <span>Xem báo cáo</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </section>

      {/* Featured Authentic TED Talks Shelf */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Video className="w-6 h-6 text-red-600" />
              <span>Kho bài nói TED truyền cảm hứng tuyển chọn</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Các bài diễn thuyết có phát âm mẫu mực, lượng từ vựng đắt giá và phụ đề song ngữ hoàn chỉnh
            </p>
          </div>

          <Link
            to="/video-dictionary"
            className="hidden sm:flex items-center gap-1 text-xs font-bold text-amber-600 hover:text-amber-700 dark:text-amber-400"
          >
            <span>Xem tất cả video</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {featuredVideos.map((vid) => (
            <div
              key={vid.youtubeId}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
            >
              {/* Thumbnail Container */}
              <div className="relative aspect-video bg-slate-900 overflow-hidden">
                <img
                  src={`https://img.youtube.com/vi/${vid.youtubeId}/hqdefault.jpg`}
                  alt={vid.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>

                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-full bg-red-600 text-white font-bold text-[10px] tracking-wide uppercase">
                    TED Talk
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-black/60 text-white font-mono text-[10px] uppercase font-bold">
                    {vid.accent}
                  </span>
                </div>

                <div className="absolute bottom-2.5 right-2.5 text-[11px] font-mono text-white bg-black/70 px-2 py-0.5 rounded">
                  {Math.floor(vid.durationSeconds / 60)}:{(vid.durationSeconds % 60).toString().padStart(2, '0')}
                </div>
              </div>

              {/* Card Meta & Actions */}
              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                    <span className="font-semibold text-amber-600 dark:text-amber-400">{vid.speaker}</span>
                    <span>{vid.views}</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2 leading-snug">
                    {vid.title}
                  </h3>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                    {vid.category}
                  </span>

                  <button
                    onClick={() => navigate(`/video-dictionary?q=${encodeURIComponent(vid.speaker.split(' ')[0].toLowerCase())}`)}
                    className="px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center gap-1 transition-colors shadow-2xs cursor-pointer"
                  >
                    <Play className="w-3 h-3 fill-slate-950" />
                    <span>Luyện ngay</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
