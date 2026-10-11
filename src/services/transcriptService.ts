import { AUTHENTIC_TRANSCRIPTS, RawSubtitleCue } from '../data/knownTranscripts';
import { TranscriptLine, Accent } from '../types';

// In-memory cache of authentic video transcripts
const transcriptCache = new Map<string, RawSubtitleCue[]>();

// Seed cache with pre-indexed verified transcripts strictly from official TED Talks
for (const [vid, cues] of Object.entries(AUTHENTIC_TRANSCRIPTS)) {
  transcriptCache.set(vid, cues);
}

// Known video metadata catalog - strictly official TED channel (https://www.youtube.com/@TED)
export interface VideoCatalogItem {
  youtubeId: string;
  title: string;
  speaker: string;
  channel: 'TED';
  accent: Accent;
  category: string;
  views: string;
  durationSeconds: number;
}

export const KNOWN_VIDEO_CATALOG: Record<string, VideoCatalogItem> = {
  'V74AxCqOTvg': {
    youtubeId: 'V74AxCqOTvg',
    title: 'How to start a movement | Derek Sivers | TED',
    speaker: 'Derek Sivers',
    channel: 'TED',
    accent: 'us',
    category: 'Leadership',
    views: '11M views',
    durationSeconds: 189,
  },
  'UNP03fDSj1U': {
    youtubeId: 'UNP03fDSj1U',
    title: 'Try something new for 30 days | Matt Cutts | TED',
    speaker: 'Matt Cutts',
    channel: 'TED',
    accent: 'us',
    category: 'Self Improvement',
    views: '14M views',
    durationSeconds: 207,
  },
  'd6wRkzCW5qI': {
    youtubeId: 'd6wRkzCW5qI',
    title: '8 secrets of success | Richard St. John | TED',
    speaker: 'Richard St. John',
    channel: 'TED',
    accent: 'us',
    category: 'Success & Passion',
    views: '15M views',
    durationSeconds: 210,
  },
  'Y24eMh5v41U': {
    youtubeId: 'Y24eMh5v41U',
    title: 'How to tie your shoes | Terry Moore | TED',
    speaker: 'Terry Moore',
    channel: 'TED',
    accent: 'us',
    category: 'Life Hacks',
    views: '11M views',
    durationSeconds: 179,
  },
  'rS_yUfxmZMo': {
    youtubeId: 'rS_yUfxmZMo',
    title: 'Less stuff, more happiness | Graham Hill | TED',
    speaker: 'Graham Hill',
    channel: 'TED',
    accent: 'us',
    category: 'Minimalism',
    views: '6M views',
    durationSeconds: 349,
  },
  'H14bBuluwB8': {
    youtubeId: 'H14bBuluwB8',
    title: 'Grit: the power of passion and perseverance | Angela Duckworth | TED',
    speaker: 'Angela Duckworth',
    channel: 'TED',
    accent: 'us',
    category: 'Psychology & Grit',
    views: '30M views',
    durationSeconds: 372,
  },
  'eIho2S0ZahI': {
    youtubeId: 'eIho2S0ZahI',
    title: 'How to speak so that people want to listen | Julian Treasure | TED',
    speaker: 'Julian Treasure',
    channel: 'TED',
    accent: 'uk',
    category: 'Communication',
    views: '35M views',
    durationSeconds: 598,
  },
  'qp0HIF3SfI4': {
    youtubeId: 'qp0HIF3SfI4',
    title: 'How Great Leaders Inspire Action | Simon Sinek | TED',
    speaker: 'Simon Sinek',
    channel: 'TED',
    accent: 'us',
    category: 'Leadership & Vision',
    views: '60M views',
    durationSeconds: 1080,
  },
  'iCvmsMzlF7o': {
    youtubeId: 'iCvmsMzlF7o',
    title: 'The power of vulnerability | Brené Brown | TED',
    speaker: 'Brené Brown',
    channel: 'TED',
    accent: 'us',
    category: 'Vulnerability & Courage',
    views: '58M views',
    durationSeconds: 1200,
  },
  'arj7oStGLkU': {
    youtubeId: 'arj7oStGLkU',
    title: 'Inside the mind of a master procrastinator | Tim Urban | TED',
    speaker: 'Tim Urban',
    channel: 'TED',
    accent: 'us',
    category: 'Psychology & Humor',
    views: '65M views',
    durationSeconds: 840,
  },
  'iG9CE55wbtY': {
    youtubeId: 'iG9CE55wbtY',
    title: 'Do schools kill creativity? | Sir Ken Robinson | TED',
    speaker: 'Sir Ken Robinson',
    channel: 'TED',
    accent: 'uk',
    category: 'Education & Creativity',
    views: '74M views',
    durationSeconds: 1140,
  },
  'Ks-_Mh1QhMc': {
    youtubeId: 'Ks-_Mh1QhMc',
    title: 'Your body language may shape who you are | Amy Cuddy | TED',
    speaker: 'Amy Cuddy',
    channel: 'TED',
    accent: 'us',
    category: 'Body Language',
    views: '22M views',
    durationSeconds: 960,
  },
  'rrkrvAUbU9Y': {
    youtubeId: 'rrkrvAUbU9Y',
    title: 'The puzzle of motivation | Dan Pink | TED',
    speaker: 'Dan Pink',
    channel: 'TED',
    accent: 'us',
    category: 'Motivation & Work',
    views: '30M views',
    durationSeconds: 1110,
  },
  'c0KYU2j0TM4': {
    youtubeId: 'c0KYU2j0TM4',
    title: 'The power of introverts | Susan Cain | TED',
    speaker: 'Susan Cain',
    channel: 'TED',
    accent: 'us',
    category: 'Introversion & Personality',
    views: '34M views',
    durationSeconds: 1140,
  },
  'RcGyVTAoXEU': {
    youtubeId: 'RcGyVTAoXEU',
    title: 'How to make stress your friend | Kelly McGonigal | TED',
    speaker: 'Kelly McGonigal',
    channel: 'TED',
    accent: 'us',
    category: 'Health & Resilience',
    views: '28M views',
    durationSeconds: 870,
  },
  'GXy__kBVq1M': {
    youtubeId: 'GXy__kBVq1M',
    title: 'The happy secret to better work | Shawn Achor | TED',
    speaker: 'Shawn Achor',
    channel: 'TED',
    accent: 'us',
    category: 'Happiness & Success',
    views: '25M views',
    durationSeconds: 740,
  },
  'q-7zAkwAOYg': {
    youtubeId: 'q-7zAkwAOYg',
    title: 'What makes a good life? Lessons from the longest study on happiness | Robert Waldinger | TED',
    speaker: 'Robert Waldinger',
    channel: 'TED',
    accent: 'us',
    category: 'Happiness & Relationships',
    views: '45M views',
    durationSeconds: 780,
  },
  'D9Ihs241zeg': {
    youtubeId: 'D9Ihs241zeg',
    title: 'The danger of a single story | Chimamanda Ngozi Adichie | TED',
    speaker: 'Chimamanda Ngozi Adichie',
    channel: 'TED',
    accent: 'all',
    category: 'Culture & Storytelling',
    views: '33M views',
    durationSeconds: 1110,
  },
  'KM4Xe6Dlp0Y': {
    youtubeId: 'KM4Xe6Dlp0Y',
    title: 'Looks aren\'t everything. Believe me, I\'m a model | Cameron Russell | TED',
    speaker: 'Cameron Russell',
    channel: 'TED',
    accent: 'us',
    category: 'Society & Image',
    views: '38M views',
    durationSeconds: 570,
  },
  'RKK7wGAYP6k': {
    youtubeId: 'RKK7wGAYP6k',
    title: 'How language shapes the way we think | Lera Boroditsky | TED',
    speaker: 'Lera Boroditsky',
    channel: 'TED',
    accent: 'us',
    category: 'Language & Mind',
    views: '16M views',
    durationSeconds: 850,
  },
  'rXepkIWPhFQ': {
    youtubeId: 'rXepkIWPhFQ',
    title: 'How to make filthy water drinkable | Michael Pritchard | TED',
    speaker: 'Michael Pritchard',
    channel: 'TED',
    accent: 'uk',
    category: 'Innovation & Science',
    views: '4.5M views',
    durationSeconds: 570,
  },
};

/**
 * Fetch or get authentic transcript cues for a given video ID
 */
export async function fetchVideoTranscript(videoId: string): Promise<RawSubtitleCue[]> {
  if (transcriptCache.has(videoId)) {
    return transcriptCache.get(videoId)!;
  }

  try {
    const response = await fetch(`/api/transcript?videoId=${encodeURIComponent(videoId)}`);
    if (response.ok) {
      const data = await response.json();
      if (data && Array.isArray(data.cues) && data.cues.length > 0) {
        transcriptCache.set(videoId, data.cues);
        return data.cues;
      }
    }
  } catch (err) {
    console.warn(`[transcriptService] Could not fetch online transcript for ${videoId}:`, err);
  }

  // Fallback to pre-indexed AUTHENTIC_TRANSCRIPTS
  const fallback = AUTHENTIC_TRANSCRIPTS[videoId] || [];
  if (fallback.length > 0) {
    transcriptCache.set(videoId, fallback);
  }
  return fallback;
}

/**
 * Synchronous getter from cache or pre-indexed catalog
 */
export function getLoadedTranscript(videoId: string): RawSubtitleCue[] | null {
  return transcriptCache.get(videoId) || AUTHENTIC_TRANSCRIPTS[videoId] || null;
}

/**
 * Formats seconds to mm:ss
 */
export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/**
 * Converts RawSubtitleCue array into TranscriptLine[] with target identification
 */
export function cuesToTranscriptLines(
  cues: RawSubtitleCue[],
  targetSecond: number,
  videoId: string
): TranscriptLine[] {
  let closestIdx = 0;
  let minDiff = Infinity;

  cues.forEach((cue, idx) => {
    const diff = Math.abs(cue.start - targetSecond);
    if (diff < minDiff) {
      minDiff = diff;
      closestIdx = idx;
    }
  });

  return cues.map((cue, idx) => ({
    id: `cue-${videoId}-${idx}`,
    startSecond: cue.start,
    endSecond: cue.end,
    text: cue.text,
    isTargetOccurrence: idx === closestIdx,
  }));
}
