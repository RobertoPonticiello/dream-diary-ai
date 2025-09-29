import express, { Request, Response } from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import { DiaryEntry, EntryFilters } from './types';
import { readAll, upsert, remove } from './storage';
import { extractEmotion, extractDreamThemes, generateAIInsight, analyzeEntry, generatePeriodAnalysis } from './ai';
import { config } from './config';

const app = express();
const PORT = process.env.PORT || 8787;

app.use(cors());
app.use(express.json({ limit: '1mb' }));

// Health
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ ok: true });
});

// AI status (for diagnostics)
app.get('/api/ai/status', (_req: Request, res: Response) => {
  res.json({
    provider: config.AI_PROVIDER,
    model: config.AI_MODEL,
    keyPresent: Boolean(config.OPENAI_API_KEY),
    project: config.OPENAI_PROJECT || null,
  });
});

// List entries with filters
app.get('/api/entries', (req: Request, res: Response) => {
  const filters: EntryFilters = {
    type: (req.query.type as any) || undefined,
    emotionLabel: (req.query.emotionLabel as any) || undefined,
    q: (req.query.q as string) || undefined,
    from: (req.query.from as string) || undefined,
    to: (req.query.to as string) || undefined
  };

  const all = readAll();
  let entries = all;
  if (filters.type) entries = entries.filter((e) => e.type === filters.type);
  if (filters.emotionLabel) entries = entries.filter((e) => e.emotionLabel === filters.emotionLabel);
  if (filters.from) entries = entries.filter((e) => new Date(e.createdAt) >= new Date(filters.from!));
  if (filters.to) entries = entries.filter((e) => new Date(e.createdAt) <= new Date(filters.to!));
  if (filters.q) {
    const q = filters.q.toLowerCase();
    entries = entries.filter((e) => e.text.toLowerCase().includes(q));
  }
  entries.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  res.json(entries);
});

// Create entry (auto-tagging server-side)
app.post('/api/entries', async (req: Request, res: Response) => {
  const { text, type = 'emotion' } = req.body || {};
  if (!text || typeof text !== 'string') return res.status(400).json({ error: 'text is required' });
  if (!['emotion', 'dream'].includes(type)) return res.status(400).json({ error: 'invalid type' });

  const id = uuidv4();
  const createdAt = new Date().toISOString();
  let emotionLabel: DiaryEntry['emotionLabel'] = null;
  let emotionIntensity: DiaryEntry['emotionIntensity'] = null;
  let dreamThemes: DiaryEntry['dreamThemes'] = null;

  // New: AI-driven analysis for both emotions and dreams
  try {
    const analysis = await analyzeEntry(text, type as any);
    emotionLabel = analysis.emotionLabel;
    emotionIntensity = analysis.emotionIntensity;
    dreamThemes = analysis.dreamThemes;
  } catch (e) {
    // Fallback safely to local heuristics
    if (type === 'emotion') {
      const heur = extractEmotion(text);
      emotionLabel = heur.label;
      emotionIntensity = heur.intensity;
    } else {
      dreamThemes = extractDreamThemes(text);
    }
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
    source: 'api',
    isStarred: false,
    aiInsight: null,
    insightGenerated: false
  };
  // Generate AI insight immediately
  try {
    const insight = await generateAIInsight(entry);
    entry.aiInsight = insight;
    entry.insightGenerated = true;
  } catch {
    // ignore, keep entry without insight if it fails
  }
  upsert(entry);
  res.status(201).json(entry);
});

// Update entry
app.patch('/api/entries/:id', (req: Request, res: Response) => {
  const id = req.params.id;
  const entries = readAll();
  const current = entries.find((e) => e.id === id);
  if (!current) return res.status(404).json({ error: 'Not found' });
  const updates = req.body || {};
  const updated: DiaryEntry = { ...current, ...updates };
  upsert(updated);
  res.json(updated);
});

// Delete entry
app.delete('/api/entries/:id', (req: Request, res: Response) => {
  const id = req.params.id;
  remove(id);
  res.status(204).end();
});

// Export CSV
app.get('/api/entries.csv', (req: Request, res: Response) => {
  const filters: EntryFilters = {
    type: (req.query.type as any) || undefined,
    emotionLabel: (req.query.emotionLabel as any) || undefined,
    q: (req.query.q as string) || undefined,
    from: (req.query.from as string) || undefined,
    to: (req.query.to as string) || undefined
  };

  let entries = readAll();
  if (filters.type) entries = entries.filter((e) => e.type === filters.type);
  if (filters.emotionLabel) entries = entries.filter((e) => e.emotionLabel === filters.emotionLabel);
  if (filters.from) entries = entries.filter((e) => new Date(e.createdAt) >= new Date(filters.from!));
  if (filters.to) entries = entries.filter((e) => new Date(e.createdAt) <= new Date(filters.to!));
  if (filters.q) {
    const q = filters.q.toLowerCase();
    entries = entries.filter((e) => e.text.toLowerCase().includes(q));
  }
  const headers = [
    'ID', 'Data', 'Tipo', 'Testo', 'Emozione', 'Intensità',
    'Temi Sogno', 'Umore Risveglio', 'Sorgente', 'Stellina'
  ];
  const rows = entries.map((e) => [
    e.id,
    e.createdAt,
    e.type,
    '"' + (e.text || '').replace(/"/g, '""') + '"',
    e.emotionLabel || '',
    e.emotionIntensity || '',
    e.dreamThemes ? '"' + e.dreamThemes.join(', ') + '"' : '',
    e.wakeMood || '',
    e.source,
    e.isStarred ? 'Sì' : 'No'
  ].join(','));
  const csv = [headers.join(','), ...rows].join('\n');
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.send(csv);
});

// Export Period Analysis (markdown text)
app.get('/api/analysis', async (req: Request, res: Response) => {
  const filters: EntryFilters = {
    type: (req.query.type as any) || undefined,
    emotionLabel: (req.query.emotionLabel as any) || undefined,
    q: (req.query.q as string) || undefined,
    from: (req.query.from as string) || undefined,
    to: (req.query.to as string) || undefined
  };

  let entries = readAll();
  if (filters.from) entries = entries.filter((e) => new Date(e.createdAt) >= new Date(filters.from!));
  if (filters.to) entries = entries.filter((e) => new Date(e.createdAt) <= new Date(filters.to!));
  if (filters.type) entries = entries.filter((e) => e.type === filters.type);
  if (filters.emotionLabel) entries = entries.filter((e) => e.emotionLabel === filters.emotionLabel);
  if (filters.q) {
    const q = filters.q.toLowerCase();
    entries = entries.filter((e) => e.text.toLowerCase().includes(q));
  }
  entries.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  const md = await generatePeriodAnalysis(entries, filters.from, filters.to);
  res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="analysis-${Date.now()}.md"`);
  res.send(md);
});

// Generate AI Insight and store
app.post('/api/entries/:id/insight', async (req: Request, res: Response) => {
  const id = req.params.id;
  const entries = readAll();
  const entry = entries.find((e) => e.id === id);
  if (!entry) return res.status(404).json({ error: 'Not found' });
  const insight = await generateAIInsight(entry);
  const updated = { ...entry, aiInsight: insight, insightGenerated: true };
  upsert(updated);
  res.json({ aiInsight: insight });
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening on http://localhost:${PORT}`);
  console.log(`[ai] provider=${config.AI_PROVIDER}, model=${config.AI_MODEL}, keyPresent=${Boolean(config.OPENAI_API_KEY)}`);
});
