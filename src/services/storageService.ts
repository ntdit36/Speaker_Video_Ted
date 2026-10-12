import { openDB, IDBPDatabase } from 'idb';

export interface VocabularyItem {
  id: string;
  word: string;
  ipa?: {
    us?: string;
    uk?: string;
  };
  vietnameseMeaning: string;
  englishDefinition?: string;
  partOfSpeech?: string;
  exampleSentence?: string;
  vietnameseSentence?: string;
  videoId?: string;
  timestamp?: number;
  tags?: string[];
  leitnerBox: number; // 1 to 5
  lastReviewed?: number;
  nextReviewDate?: number;
  notes?: string;
  createdAt: number;
}

export interface ShadowingRecord {
  id: string;
  sentence: string;
  targetWord?: string;
  videoId?: string;
  timestamp: number;
  score: number;
  detectedText: string;
  audioDurationSeconds: number;
  createdAt: number;
}

export interface PracticeSession {
  id: string;
  type: 'shadowing' | 'listening' | 'pronunciation' | 'vocabulary' | 'flashcards';
  score: number;
  totalQuestions?: number;
  correctAnswers?: number;
  durationSeconds: number;
  timestamp: number;
}

export interface UserStats {
  streakDays: number;
  lastActiveDate: string; // YYYY-MM-DD
  totalMinutesStudied: number;
  wordsLearned: number;
  shadowingCount: number;
  quizzesCompleted: number;
  dailyGoalMinutes: number;
}

export interface AppSettings {
  theme: 'light' | 'dark';
  subtitleMode: 'dual' | 'en' | 'vi';
  subtitleFontSize: 'sm' | 'md' | 'lg';
  accentPreference: 'all' | 'us' | 'uk' | 'aus';
  autoLoop: boolean;
  defaultSpeed: number;
}

const DB_NAME = 'speaker_video_ted_db';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<any>> | null = null;

function getDB(): Promise<IDBPDatabase<any>> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('vocabulary')) {
          const vocabStore = db.createObjectStore('vocabulary', { keyPath: 'id' });
          vocabStore.createIndex('by_word', 'word');
          vocabStore.createIndex('by_box', 'leitnerBox');
          vocabStore.createIndex('by_created', 'createdAt');
        }
        if (!db.objectStoreNames.contains('shadowing_records')) {
          const shadowStore = db.createObjectStore('shadowing_records', { keyPath: 'id' });
          shadowStore.createIndex('by_created', 'createdAt');
        }
        if (!db.objectStoreNames.contains('practice_sessions')) {
          const sessionStore = db.createObjectStore('practice_sessions', { keyPath: 'id' });
          sessionStore.createIndex('by_type', 'type');
          sessionStore.createIndex('by_timestamp', 'timestamp');
        }
      },
    });
  }
  return dbPromise;
}

const LOCAL_STORAGE_KEYS = {
  VOCAB_BACKUP: 'svt_vocab_backup',
  SETTINGS: 'svt_app_settings',
  STATS: 'svt_user_stats',
  BOOKMARKS: 'youglish_saved_bookmarks_v1',
  HISTORY: 'youglish_search_history_v1',
};

// Initial default settings
export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'light',
  subtitleMode: 'dual',
  subtitleFontSize: 'md',
  accentPreference: 'all',
  autoLoop: false,
  defaultSpeed: 1.0,
};

// Initial default stats
export const DEFAULT_STATS: UserStats = {
  streakDays: 1,
  lastActiveDate: new Date().toISOString().slice(0, 10),
  totalMinutesStudied: 12,
  wordsLearned: 5,
  shadowingCount: 3,
  quizzesCompleted: 4,
  dailyGoalMinutes: 15,
};

// Seed vocabulary for initial delightful experience
export const SEED_VOCABULARY: VocabularyItem[] = [
  {
    id: 'seed-leader',
    word: 'leader',
    ipa: { us: '/ˈliː.dɚ/', uk: '/ˈliː.də/' },
    vietnameseMeaning: 'người lãnh đạo, người dẫn dắt',
    englishDefinition: 'A person who guides, directs, or has influence over others.',
    partOfSpeech: 'noun',
    exampleSentence: 'A leader needs the guts to stand out and be ridiculed.',
    vietnameseSentence: 'Một người lãnh đạo cần sự can đảm để nổi bật và chấp nhận bị chế giễu.',
    videoId: 'V74AxCqOTvg',
    leitnerBox: 3,
    createdAt: Date.now() - 86400000 * 2,
    lastReviewed: Date.now() - 86400000,
    nextReviewDate: Date.now() + 86400000 * 2,
    tags: ['TED Talks', 'Leadership'],
  },
  {
    id: 'seed-vulnerable',
    word: 'vulnerable',
    ipa: { us: '/ˈvʌl.nɚ.ə.bəl/', uk: '/ˈvʌl.nər.ə.bəl/' },
    vietnameseMeaning: 'dễ bị tổn thương, yếu thế',
    englishDefinition: 'Susceptible to physical emotional attack or harm.',
    partOfSpeech: 'adjective',
    exampleSentence: 'Vulnerability is the birthplace of innovation, creativity and change.',
    vietnameseSentence: 'Sự dễ tổn thương chính là cội nguồn của đổi mới, sáng tạo và thay đổi.',
    videoId: 'iCvmsMzlF7o',
    leitnerBox: 2,
    createdAt: Date.now() - 86400000 * 3,
    lastReviewed: Date.now() - 86400000,
    nextReviewDate: Date.now() + 86400000,
    tags: ['TED Talks', 'Psychology'],
  },
  {
    id: 'seed-grit',
    word: 'grit',
    ipa: { us: '/ɡrɪt/', uk: '/ɡrɪt/' },
    vietnameseMeaning: 'sự bền bỉ, ý chí kiên định',
    englishDefinition: 'Courage and resolve; strength of character over long-term goals.',
    partOfSpeech: 'noun',
    exampleSentence: 'Grit is passion and perseverance for very long-term goals.',
    vietnameseSentence: 'Ý chí kiên định là niềm đam mê và sự kiên trì cho các mục tiêu dài hạn.',
    videoId: 'H14bBuluwB8',
    leitnerBox: 4,
    createdAt: Date.now() - 86400000 * 4,
    lastReviewed: Date.now() - 86400000,
    nextReviewDate: Date.now() + 86400000 * 4,
    tags: ['TED Talks', 'Success'],
  },
  {
    id: 'seed-procrastinator',
    word: 'procrastinator',
    ipa: { us: '/prəˈkræs.tə.neɪ.t̬ɚ/', uk: '/prəˈkræs.tɪ.neɪ.tə/' },
    vietnameseMeaning: 'người hay trì hoãn công việc',
    englishDefinition: 'A person who habitually puts off doing tasks that need to be done.',
    partOfSpeech: 'noun',
    exampleSentence: 'Inside the mind of a master procrastinator.',
    vietnameseSentence: 'Bên trong tâm trí của một bậc thầy trì hoãn.',
    videoId: 'arj7oStGLkU',
    leitnerBox: 1,
    createdAt: Date.now() - 86400000,
    lastReviewed: Date.now() - 86400000,
    nextReviewDate: Date.now() + 86400000,
    tags: ['TED Talks', 'Psychology'],
  },
];

// --- Vocabulary Storage API ---

export async function getAllVocabulary(): Promise<VocabularyItem[]> {
  try {
    const db = await getDB();
    const items = await db.getAll('vocabulary');
    if (items && items.length > 0) {
      return items;
    }
  } catch (e) {
    console.warn('[Storage] IndexedDB read error, falling back to localStorage', e);
  }

  // Fallback to localStorage
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.VOCAB_BACKUP);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}

  // Initialize with seed vocabulary
  try {
    const db = await getDB();
    for (const item of SEED_VOCABULARY) {
      await db.put('vocabulary', item).catch(() => {});
    }
    localStorage.setItem(LOCAL_STORAGE_KEYS.VOCAB_BACKUP, JSON.stringify(SEED_VOCABULARY));
  } catch {}

  return SEED_VOCABULARY;
}

export async function saveVocabularyItem(item: VocabularyItem): Promise<void> {
  // Update sync backup in localStorage
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.VOCAB_BACKUP);
    const existing: VocabularyItem[] = stored ? JSON.parse(stored) : [];
    const updated = [item, ...existing.filter((i) => i.id !== item.id && i.word.toLowerCase() !== item.word.toLowerCase())];
    localStorage.setItem(LOCAL_STORAGE_KEYS.VOCAB_BACKUP, JSON.stringify(updated));
  } catch {}

  try {
    const db = await getDB();
    await db.put('vocabulary', item);
  } catch (e) {
    console.warn('[Storage] IndexedDB put error:', e);
  }
}

export async function deleteVocabularyItem(id: string): Promise<void> {
  try {
    const db = await getDB();
    await db.delete('vocabulary', id);
  } catch {}

  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.VOCAB_BACKUP);
    const existing: VocabularyItem[] = stored ? JSON.parse(stored) : [];
    const filtered = existing.filter((i) => i.id !== id);
    localStorage.setItem(LOCAL_STORAGE_KEYS.VOCAB_BACKUP, JSON.stringify(filtered));
  } catch {}
}

export async function updateVocabularyLeitner(
  id: string,
  isCorrect: boolean
): Promise<VocabularyItem | null> {
  const all = await getAllVocabulary();
  const item = all.find((i) => i.id === id);
  if (!item) return null;

  let newBox = item.leitnerBox;
  if (isCorrect) {
    newBox = Math.min(5, newBox + 1);
  } else {
    newBox = Math.max(1, newBox - 1);
  }

  // Spaced repetition intervals: Box 1: 1 day, Box 2: 2 days, Box 3: 4 days, Box 4: 7 days, Box 5: 14 days
  const intervalsDays = [0, 1, 2, 4, 7, 14];
  const nextInterval = intervalsDays[newBox] || 1;

  const updated: VocabularyItem = {
    ...item,
    leitnerBox: newBox,
    lastReviewed: Date.now(),
    nextReviewDate: Date.now() + nextInterval * 86400000,
  };

  await saveVocabularyItem(updated);
  return updated;
}

// --- Shadowing Records Storage API ---

export async function saveShadowingRecord(record: ShadowingRecord): Promise<void> {
  try {
    const db = await getDB();
    await db.put('shadowing_records', record);
  } catch (e) {
    console.warn('[Storage] IndexedDB shadow error:', e);
  }
  // Record session & update stats
  await recordPracticeSession({
    id: `ps-${Date.now()}`,
    type: 'shadowing',
    score: record.score,
    durationSeconds: record.audioDurationSeconds || 5,
    timestamp: Date.now(),
  });
}

export async function getRecentShadowingRecords(limit = 10): Promise<ShadowingRecord[]> {
  try {
    const db = await getDB();
    const all = await db.getAll('shadowing_records');
    return all.sort((a, b) => b.createdAt - a.createdAt).slice(0, limit);
  } catch {
    return [];
  }
}

// --- Practice Sessions & Stats ---

export async function recordPracticeSession(session: PracticeSession): Promise<void> {
  try {
    const db = await getDB();
    await db.put('practice_sessions', session);
  } catch {}

  // Update UserStats
  const stats = getUserStats();
  const today = new Date().toISOString().slice(0, 10);

  let newStreak = stats.streakDays;
  if (stats.lastActiveDate !== today) {
    const lastDate = new Date(stats.lastActiveDate);
    const currentDate = new Date(today);
    const diffDays = Math.round((currentDate.getTime() - lastDate.getTime()) / (1000 * 3600 * 24));
    if (diffDays === 1) {
      newStreak += 1;
    } else if (diffDays > 1) {
      newStreak = 1;
    }
  }

  const updatedStats: UserStats = {
    ...stats,
    streakDays: newStreak,
    lastActiveDate: today,
    totalMinutesStudied: stats.totalMinutesStudied + Math.round((session.durationSeconds || 30) / 60),
    quizzesCompleted: stats.quizzesCompleted + 1,
    shadowingCount: session.type === 'shadowing' ? stats.shadowingCount + 1 : stats.shadowingCount,
  };

  saveUserStats(updatedStats);
}

export function getUserStats(): UserStats {
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.STATS);
    if (stored) return { ...DEFAULT_STATS, ...JSON.parse(stored) };
  } catch {}
  return DEFAULT_STATS;
}

export function saveUserStats(stats: UserStats): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEYS.STATS, JSON.stringify(stats));
  } catch {}
}

// --- App Settings ---

export function getAppSettings(): AppSettings {
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.SETTINGS);
    if (stored) return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
  } catch {}
  return DEFAULT_SETTINGS;
}

export function saveAppSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    // Apply dark mode class to documentElement
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  } catch {}
}

// --- Data Export & Import ---

export async function exportAllUserData(): Promise<string> {
  const vocab = await getAllVocabulary();
  const stats = getUserStats();
  const settings = getAppSettings();
  const bookmarks = (() => {
    try {
      return JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.BOOKMARKS) || '[]');
    } catch {
      return [];
    }
  })();

  const exportObj = {
    version: 1,
    exportedAt: new Date().toISOString(),
    vocabulary: vocab,
    stats,
    settings,
    bookmarks,
  };

  return JSON.stringify(exportObj, null, 2);
}

export async function importUserData(jsonString: string): Promise<boolean> {
  try {
    const data = JSON.parse(jsonString);
    if (Array.isArray(data.vocabulary)) {
      for (const item of data.vocabulary) {
        await saveVocabularyItem(item);
      }
    }
    if (data.stats) {
      saveUserStats(data.stats);
    }
    if (data.settings) {
      saveAppSettings(data.settings);
    }
    if (Array.isArray(data.bookmarks)) {
      localStorage.setItem(LOCAL_STORAGE_KEYS.BOOKMARKS, JSON.stringify(data.bookmarks));
    }
    return true;
  } catch (e) {
    console.error('Import failed:', e);
    return false;
  }
}
