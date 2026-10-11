export type Language = 'en' | 'vi' | 'es' | 'fr' | 'de' | 'ja';

export type Accent = 'all' | 'us' | 'uk' | 'aus' | 'ca';

export type DurationFilter = 'all' | 'under20' | 'under15' | 'under10' | 'under5';

export interface TranscriptLine {
  id: string;
  startSecond: number;
  endSecond: number;
  text: string;
  isTargetOccurrence?: boolean;
}

export interface VideoClip {
  id: string;
  youtubeId: string;
  title: string;
  channel: string;
  startSecond: number;
  endSecond: number;
  accent: Accent;
  sentence: string;
  targetWord: string;
  category?: string;
  views?: string;
  durationSeconds: number;
  durationFormatted: string;
  isShort: boolean;
  transcriptLines?: TranscriptLine[];
}

export interface QuestionAnswer {
  id: string;
  question: string;
  answer: string;
  vietnameseQuestion?: string;
  vietnameseAnswer?: string;
  category: 'pronunciation' | 'conversation' | 'grammar' | 'idiom';
}

export interface WordEntry {
  word: string;
  language: Language;
  ipa: {
    us?: string;
    uk?: string;
    general?: string;
  };
  respelling: string;
  syllables: string[];
  stressedIndex: number;
  partOfSpeech: string;
  definition: string;
  vietnameseDefinition?: string;
  tips: string[];
  rhymes?: string[];
  collocations?: string[];
  clips: VideoClip[];
  qaList?: QuestionAnswer[];
}

export interface Bookmark {
  id: string;
  word: string;
  clipId: string;
  youtubeId: string;
  sentence: string;
  channel: string;
  timestamp: number;
}

export interface HistoryItem {
  query: string;
  timestamp: number;
  accent: Accent;
  language: Language;
}
