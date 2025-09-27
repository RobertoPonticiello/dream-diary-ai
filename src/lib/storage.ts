import { DiaryEntry, EntryFilters, EntryType } from './types';
import { extractEmotion, extractDreamThemes } from './extractors';

// IndexedDB per persistenza locale
const DB_NAME = 'emotion-diary';
const DB_VERSION = 1;
const STORE_NAME = 'entries';

class DiaryDB {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('createdAt', 'createdAt');
          store.createIndex('type', 'type');
          store.createIndex('emotionLabel', 'emotionLabel');
        }
      };
    });
  }

  async addEntry(text: string, type: EntryType = 'emotion'): Promise<DiaryEntry> {
    if (!this.db) await this.init();
    
    const id = crypto.randomUUID();
    const createdAt = new Date();
    
    // Auto-tagging
    let emotionLabel = null;
    let emotionIntensity = null;
    let dreamThemes = null;
    
    if (type === 'emotion') {
      const emotion = extractEmotion(text);
      emotionLabel = emotion.label;
      emotionIntensity = emotion.intensity;
    } else if (type === 'dream') {
      dreamThemes = extractDreamThemes(text);
    }
    
    const entry: DiaryEntry = {
      id,
      createdAt,
      type,
      text,
      emotionLabel,
      emotionIntensity,
      dreamThemes,
      wakeMood: null,
      source: 'chat',
      isStarred: false
    };
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.add(entry);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(entry);
    });
  }

  async getEntries(filters: EntryFilters = {}): Promise<DiaryEntry[]> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        let entries: DiaryEntry[] = request.result;
        
        // Converti date strings a Date objects
        entries = entries.map(entry => ({
          ...entry,
          createdAt: new Date(entry.createdAt)
        }));
        
        // Applica filtri
        if (filters.type) {
          entries = entries.filter(entry => entry.type === filters.type);
        }
        
        if (filters.emotionLabel) {
          entries = entries.filter(entry => entry.emotionLabel === filters.emotionLabel);
        }
        
        if (filters.from) {
          entries = entries.filter(entry => entry.createdAt >= filters.from!);
        }
        
        if (filters.to) {
          entries = entries.filter(entry => entry.createdAt <= filters.to!);
        }
        
        if (filters.q) {
          const query = filters.q.toLowerCase();
          entries = entries.filter(entry => 
            entry.text.toLowerCase().includes(query)
          );
        }
        
        // Ordina per data (più recenti prima)
        entries.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        
        resolve(entries);
      };
    });
  }

  async updateEntry(id: string, updates: Partial<DiaryEntry>): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      
      const getRequest = store.get(id);
      getRequest.onsuccess = () => {
        const entry = getRequest.result;
        if (entry) {
          Object.assign(entry, updates);
          const putRequest = store.put(entry);
          putRequest.onsuccess = () => resolve();
          putRequest.onerror = () => reject(putRequest.error);
        } else {
          reject(new Error('Entry not found'));
        }
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  async exportToCSV(filters: EntryFilters = {}): Promise<string> {
    const entries = await this.getEntries(filters);
    
    const headers = [
      'ID', 'Data', 'Tipo', 'Testo', 'Emozione', 'Intensità', 
      'Temi Sogno', 'Umore Risveglio', 'Sorgente', 'Stellina'
    ];
    
    const rows = entries.map(entry => [
      entry.id,
      entry.createdAt.toISOString(),
      entry.type,
      `"${entry.text.replace(/"/g, '""')}"`,
      entry.emotionLabel || '',
      entry.emotionIntensity || '',
      entry.dreamThemes ? `"${entry.dreamThemes.join(', ')}"` : '',
      entry.wakeMood || '',
      entry.source,
      entry.isStarred ? 'Sì' : 'No'
    ]);
    
    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  }
}

export const diaryDB = new DiaryDB();