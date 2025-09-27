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
  createdAt: Date;
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

export interface EmotionInsight {
  summary: string;
  patterns: string[];
  suggestions: string[];
  mood_trend: 'positive' | 'negative' | 'neutral';
}

export interface DreamInsight {
  symbolism: string[];
  emotions: string[];
  interpretation: string;
  themes: string[];
}

export interface EntryFilters {
  type?: EntryType;
  from?: Date;
  to?: Date;
  emotionLabel?: EmotionLabel;
  q?: string;
}