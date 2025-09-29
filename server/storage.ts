import fs from 'fs';
import path from 'path';
import { DiaryEntry } from './types';

const DATA_DIR = path.join(process.cwd(), 'server', 'data');
const DATA_FILE = path.join(DATA_DIR, 'entries.json');

function ensureStore() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, '[]', 'utf-8');
}

export function readAll(): DiaryEntry[] {
  ensureStore();
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    const parsed = JSON.parse(raw) as DiaryEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeAll(entries: DiaryEntry[]) {
  ensureStore();
  fs.writeFileSync(DATA_FILE, JSON.stringify(entries, null, 2), 'utf-8');
}

export function upsert(entry: DiaryEntry) {
  const entries = readAll();
  const idx = entries.findIndex((e) => e.id === entry.id);
  if (idx >= 0) entries[idx] = entry;
  else entries.push(entry);
  writeAll(entries);
}

export function remove(id: string) {
  const entries = readAll().filter((e) => e.id !== id);
  writeAll(entries);
}
