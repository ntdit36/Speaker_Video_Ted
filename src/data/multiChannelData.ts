import catalogJson from './multiChannelCatalog.json';
import transcriptsJson from './multiChannelTranscripts.json';
import { RawSubtitleCue } from './knownTranscripts';
import { Accent } from '../types';

export interface MultiChannelVideoItem {
  youtubeId: string;
  title: string;
  speaker: string;
  channel: string;
  accent: Accent;
  category: string;
  views: string;
  durationSeconds: number;
}

export const MULTI_CHANNEL_CATALOG: MultiChannelVideoItem[] = catalogJson as MultiChannelVideoItem[];

export const MULTI_CHANNEL_TRANSCRIPTS: Record<string, RawSubtitleCue[]> = transcriptsJson as Record<string, RawSubtitleCue[]>;
