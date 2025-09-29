import { DiaryEntry, EntryFilters, EntryType } from './types';

// Prefer same-origin in dev so Vite proxy can route /api to the backend.
// Allow overriding with VITE_API_URL for production or custom setups.
const API_URL = (import.meta.env.DEV && !import.meta.env.VITE_API_URL)
  ? ''
  : (import.meta.env.VITE_API_URL || 'http://localhost:8787');

type DiaryEntryDTO = Omit<DiaryEntry, 'createdAt'> & { createdAt: string };

function toDiaryEntry(dto: DiaryEntryDTO): DiaryEntry {
  return {
    ...dto,
    createdAt: new Date(dto.createdAt),
  };
}

function buildQuery(filters: EntryFilters = {}): string {
  const params = new URLSearchParams();
  if (filters.type) params.set('type', filters.type);
  if (filters.emotionLabel) params.set('emotionLabel', filters.emotionLabel);
  if (filters.q) params.set('q', filters.q);
  if (filters.from) params.set('from', filters.from.toISOString());
  if (filters.to) params.set('to', filters.to.toISOString());
  const s = params.toString();
  return s ? `?${s}` : '';
}

export async function addEntry(text: string, type: EntryType = 'emotion'): Promise<DiaryEntry> {
  const res = await fetch(`${API_URL}/api/entries`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, type }),
  });
  if (!res.ok) throw new Error('Failed to add entry');
  const data = await res.json();
  return toDiaryEntry(data);
}

export async function getEntries(filters: EntryFilters = {}): Promise<DiaryEntry[]> {
  const res = await fetch(`${API_URL}/api/entries${buildQuery(filters)}`);
  if (!res.ok) throw new Error('Failed to load entries');
  const data: DiaryEntryDTO[] = await res.json();
  return data.map(toDiaryEntry);
}

export async function updateEntry(id: string, updates: Partial<DiaryEntry>): Promise<DiaryEntry> {
  // Convert Date to ISO if present
  const body: Record<string, unknown> = { ...updates };
  if (updates.createdAt instanceof Date) {
    (body as { createdAt: string }).createdAt = updates.createdAt.toISOString();
  }
  const res = await fetch(`${API_URL}/api/entries/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error('Failed to update entry');
  const data = await res.json();
  return toDiaryEntry(data);
}

export async function exportToCSV(filters: EntryFilters = {}): Promise<string> {
  const res = await fetch(`${API_URL}/api/entries.csv${buildQuery(filters)}`);
  if (!res.ok) throw new Error('Failed to export CSV');
  return await res.text();
}

export async function generateInsight(id: string): Promise<string> {
  const res = await fetch(`${API_URL}/api/entries/${id}/insight`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to generate insight');
  const data = await res.json();
  return data.aiInsight as string;
}

export async function exportPeriodAnalysis(filters: EntryFilters = {}): Promise<string> {
  // Returns markdown text; caller can save as .md or pass to a PDF generator client-side
  const res = await fetch(`${API_URL}/api/analysis${buildQuery(filters)}`);
  if (!res.ok) throw new Error('Failed to export analysis');
  return await res.text();
}
