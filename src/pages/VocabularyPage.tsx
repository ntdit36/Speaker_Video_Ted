import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  BookMarked, 
  Search, 
  Plus, 
  Volume2, 
  Trash2, 
  Mic, 
  Sparkles, 
  Download, 
  Upload, 
  Play, 
  ExternalLink,
  Layers,
  CheckCircle2,
  X
} from 'lucide-react';
import { 
  getAllVocabulary, 
  saveVocabularyItem, 
  deleteVocabularyItem, 
  VocabularyItem,
  exportAllUserData,
  importUserData,
  SEED_VOCABULARY
} from '../services/storageService';
import { speakWordWithVoice, getWordIPAMetadata } from '../services/pronunciationService';

export const VocabularyPage: React.FC = () => {
  const navigate = useNavigate();
  const [vocabulary, setVocabulary] = useState<VocabularyItem[]>(SEED_VOCABULARY);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [boxFilter, setBoxFilter] = useState<'all' | 'box1' | 'box2-3' | 'box4-5'>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);

  // New word form state
  const [newWord, setNewWord] = useState<string>('');
  const [newMeaning, setNewMeaning] = useState<string>('');
  const [newSentence, setNewSentence] = useState<string>('');
  const [newVietnameseSentence, setNewVietnameseSentence] = useState<string>('');

  const loadVocab = () => {
    getAllVocabulary().then(setVocabulary);
  };

  useEffect(() => {
    loadVocab();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm('Bạn có chắc muốn xóa từ này khỏi sổ từ vựng không?')) {
      await deleteVocabularyItem(id);
      loadVocab();
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWord.trim()) return;

    const clean = newWord.trim().toLowerCase();
    const meta = getWordIPAMetadata(clean);

    await saveVocabularyItem({
      id: `custom-word-${Date.now()}`,
      word: clean,
      ipa: { us: meta.ipaUS, uk: meta.ipaUK },
      vietnameseMeaning: newMeaning.trim() || 'Từ vựng mới',
      exampleSentence: newSentence.trim() || undefined,
      vietnameseSentence: newVietnameseSentence.trim() || undefined,
      leitnerBox: 1,
      createdAt: Date.now(),
      tags: ['Thủ công'],
    });

    setNewWord('');
    setNewMeaning('');
    setNewSentence('');
    setNewVietnameseSentence('');
    setIsAddModalOpen(false);
    loadVocab();
  };

  const handleExport = async () => {
    const data = await exportAllUserData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `speaker-ted-vocab-${new Date().toISOString().slice(0, 10)}.json`;
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
          alert('Nhập dữ liệu thành công!');
          loadVocab();
        } else {
          alert('File sao lưu không đúng định dạng.');
        }
      }
    };
    input.click();
  };

  // Filtered list
  const filteredVocab = useMemo(() => {
    let list = vocabulary;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (v) =>
          v.word.toLowerCase().includes(q) ||
          v.vietnameseMeaning.toLowerCase().includes(q) ||
          (v.exampleSentence && v.exampleSentence.toLowerCase().includes(q))
      );
    }

    if (boxFilter === 'box1') {
      list = list.filter((v) => v.leitnerBox === 1);
    } else if (boxFilter === 'box2-3') {
      list = list.filter((v) => v.leitnerBox === 2 || v.leitnerBox === 3);
    } else if (boxFilter === 'box4-5') {
      list = list.filter((v) => v.leitnerBox === 4 || v.leitnerBox === 5);
    }

    return list;
  }, [vocabulary, searchQuery, boxFilter]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <BookMarked className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">
              Sổ từ vựng cá nhân ({vocabulary.length})
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Toàn bộ từ vựng & câu trích dẫn bạn đã lưu từ các video TED Talks kèm theo phiên âm IPA và ví dụ
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm từ mới</span>
          </button>

          <Link
            to="/exercises"
            className="px-3.5 py-2 rounded-xl bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <Layers className="w-4 h-4 text-amber-400" />
            <span>Ôn Flashcards ngay</span>
          </Link>

          <button
            onClick={handleExport}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 transition-colors"
            title="Xuất file JSON sao lưu"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={handleImport}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 transition-colors"
            title="Nhập file JSON sao lưu"
          >
            <Upload className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm trong sổ từ vựng..."
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none text-slate-900 dark:text-white focus:border-amber-400"
          />
        </div>

        {/* Leitner Box Filter Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold overflow-x-auto">
          {[
            { id: 'all', label: `Tất cả (${vocabulary.length})` },
            { id: 'box1', label: 'Hộp 1 (Mới)' },
            { id: 'box2-3', label: 'Hộp 2-3 (Đang học)' },
            { id: 'box4-5', label: 'Hộp 4-5 (Thành thạo)' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setBoxFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                boxFilter === tab.id
                  ? 'bg-amber-400 text-slate-950 font-bold shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-950'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Vocabulary Cards Grid */}
      {filteredVocab.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 space-y-3">
          <BookMarked className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
          <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">
            Chưa có từ vựng nào trong danh sách
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Hãy bắt đầu tra cứu video TED hoặc bấm "Thêm từ mới" ở phía trên để lưu từ vào sổ tay!
          </p>
          <button
            onClick={() => navigate('/video-dictionary')}
            className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-slate-950" />
            <span>Khám phá video TED ngay</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVocab.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-3 group"
            >
              <div className="space-y-2">
                {/* Word & Audio */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-slate-900 dark:text-white capitalize">
                      {item.word}
                    </h3>
                    <button
                      onClick={() => speakWordWithVoice(item.word, 'us')}
                      className="p-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 hover:bg-amber-100 transition-colors"
                      title="Nghe phát âm"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    Hộp {item.leitnerBox}/5
                  </span>
                </div>

                {/* IPA */}
                {item.ipa?.us && (
                  <p className="text-xs font-mono text-slate-400">
                    {item.ipa.us}
                  </p>
                )}

                {/* Vietnamese Definition */}
                <div className="p-2.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/40 text-xs text-amber-950 dark:text-amber-200 font-semibold">
                  🇻🇳 {item.vietnameseMeaning}
                </div>

                {/* Example sentence */}
                {item.exampleSentence && (
                  <div className="space-y-0.5 text-xs text-slate-600 dark:text-slate-400 italic">
                    <p className="line-clamp-2 leading-relaxed">
                      "{item.exampleSentence}"
                    </p>
                    {item.vietnameseSentence && (
                      <p className="text-[11px] text-slate-500 not-italic line-clamp-1">
                        → {item.vietnameseSentence}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Actions Footer */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() =>
                      navigate('/shadowing', {
                        state: {
                          sentence: item.exampleSentence || `Learn how to pronounce ${item.word}`,
                          targetWord: item.word,
                          videoId: item.videoId,
                        },
                      })
                    }
                    className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 transition-colors"
                    title="Luyện Shadowing câu này"
                  >
                    <Mic className="w-3.5 h-3.5 text-amber-500" />
                  </button>

                  <button
                    onClick={() => navigate(`/video-dictionary?q=${encodeURIComponent(item.word)}`)}
                    className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 transition-colors"
                    title="Xem các video khác có từ này"
                  >
                    <Play className="w-3.5 h-3.5 text-red-500 fill-red-500" />
                  </button>
                </div>

                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                  title="Xóa từ"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add New Word Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Thêm từ vựng mới vào sổ tay
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Từ tiếng Anh: *
                </label>
                <input
                  type="text"
                  required
                  value={newWord}
                  onChange={(e) => setNewWord(e.target.value)}
                  placeholder="Ví dụ: resilience"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl outline-none text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Nghĩa tiếng Việt: *
                </label>
                <input
                  type="text"
                  required
                  value={newMeaning}
                  onChange={(e) => setNewMeaning(e.target.value)}
                  placeholder="Ví dụ: sự kiên cường, khả năng phục hồi"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl outline-none text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Câu ví dụ tiếng Anh (tùy chọn):
                </label>
                <textarea
                  rows={2}
                  value={newSentence}
                  onChange={(e) => setNewSentence(e.target.value)}
                  placeholder="Ví dụ: Resilience is key to overcoming adversity."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl outline-none text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Dịch câu ví dụ tiếng Việt (tùy chọn):
                </label>
                <input
                  type="text"
                  value={newVietnameseSentence}
                  onChange={(e) => setNewVietnameseSentence(e.target.value)}
                  placeholder="Ví dụ: Sự kiên cường là chìa khóa vượt qua nghịch cảnh."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl outline-none text-slate-900 dark:text-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold shadow-xs cursor-pointer"
                >
                  Lưu vào sổ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
