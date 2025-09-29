export type EmotionLabel =
  | 'ansia'
  | 'paura'
  | 'rabbia'
  | 'tristezza'
  | 'gioia'
  | 'calma'
  | 'sorpresa'
  | 'disgusto';

export type EntryType = 'emotion' | 'dream';

export interface DiaryEntry {
  id: string;
  createdAt: string; // ISO string for portability on server
  type: EntryType;
  text: string;
  emotionLabel?: EmotionLabel | null;
  emotionIntensity?: number | null; // 1-5
  dreamThemes?: string[] | null;
  wakeMood?: number | null; // 1-5
  source: string;
  isStarred: boolean;
  aiInsight?: string | null; // AI-generated insight
  insightGenerated?: boolean; // Whether insight has been generated
}

export interface EntryFilters {
  type?: EntryType;
  from?: string; // ISO date string
  to?: string; // ISO date string
  emotionLabel?: EmotionLabel;
  q?: string;
}
