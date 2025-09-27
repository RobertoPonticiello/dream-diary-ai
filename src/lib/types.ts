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
}

export interface EntryFilters {
  type?: EntryType;
  from?: Date;
  to?: Date;
  emotionLabel?: EmotionLabel;
  q?: string;
}