import { DiaryEntry, EmotionLabel, EntryType } from './types';
import { config } from './config';
import OpenAI from 'openai';

export function generateEmotionInsight(text: string, emotion: EmotionLabel, intensity: number) {
  const insights: Record<EmotionLabel, any> = {
    ansia: {
      summary: "L'ansia riflette preoccupazioni naturali per il futuro.",
      patterns: ["Tensione corporea", "Pensieri ripetitivi", "Anticipazione negativa"],
      suggestions: ["Respirazione profonda", "Meditazione mindfulness", "Esercizio fisico leggero"],
      mood_trend: intensity > 3 ? 'negative' : 'neutral'
    },
    paura: {
      summary: "La paura è un'emozione protettiva che segnala pericoli percepiti.",
      patterns: ["Reazione di allerta", "Evitamento", "Tensione muscolare"],
      suggestions: ["Tecniche di grounding", "Affrontamento graduale", "Sostegno sociale"],
      mood_trend: 'negative'
    },
    rabbia: {
      summary: "La rabbia indica che i tuoi confini o valori sono stati violati.",
      patterns: ["Energia intensa", "Necessità di cambiamento", "Frustrazione"],
      suggestions: ["Attività fisica", "Espressione creativa", "Comunicazione assertiva"],
      mood_trend: intensity > 3 ? 'negative' : 'neutral'
    },
    tristezza: {
      summary: "La tristezza è un processo naturale di elaborazione delle perdite.",
      patterns: ["Bisogno di elaborazione", "Riflessione profonda", "Connessione emotiva"],
      suggestions: ["Accettazione gentile", "Sostegno sociale", "Attività creative"],
      mood_trend: 'negative'
    },
    gioia: {
      summary: "La gioia riflette allineamento con i tuoi valori e desideri.",
      patterns: ["Energia positiva", "Connessione", "Gratitudine"],
      suggestions: ["Condivisione", "Espressione creativa", "Mindfulness del momento"],
      mood_trend: 'positive'
    },
    calma: {
      summary: "La calma indica equilibrio e connessione con il presente.",
      patterns: ["Rilassamento", "Chiarezza mentale", "Pace interiore"],
      suggestions: ["Mantieni le pratiche attuali", "Condividi la tua tranquillità", "Rifletti sui fattori positivi"],
      mood_trend: 'positive'
    },
    sorpresa: {
      summary: "La sorpresa apre nuove possibilità e prospettive.",
      patterns: ["Apertura mentale", "Adattabilità", "Curiosità"],
      suggestions: ["Esplora le implicazioni", "Resta aperto al cambiamento", "Integra le nuove informazioni"],
      mood_trend: 'neutral'
    },
    disgusto: {
      summary: "Il disgusto segnala incompatibilità con i tuoi valori.",
      patterns: ["Rifiuto", "Necessità di distanza", "Protezione dei confini"],
      suggestions: ["Rispetta i tuoi limiti", "Cerca alternative", "Rifletti sui tuoi valori"],
      mood_trend: 'negative'
    }
  };

  return insights[emotion] || {
    summary: "Ogni emozione ha un messaggio importante per te.",
    patterns: ["Osserva i tuoi pattern", "Nota i trigger", "Riconosci i tuoi bisogni"],
    suggestions: ["Auto-osservazione", "Journaling", "Supporto professionale se necessario"],
    mood_trend: 'neutral'
  };
}

export function generateDreamInsight(text: string, themes: string[]) {
  const dreamSymbols: Record<string, string[]> = {
    'ansia/urgenza': ['Pressione temporale', 'Perdita di controllo', 'Responsabilità'],
    'lavoro/scuola': ['Performance', 'Valutazione', 'Crescita personale'],
    'inseguimento': ['Evitamento', 'Confronto con paure', 'Fuga da responsabilità'],
    'caduta/volo': ['Libertà vs controllo', 'Cambiamenti nella vita', 'Prospettiva elevata'],
    'relazione': ['Connessione emotiva', 'Bisogni affettivi', 'Dinamiche interpersonali'],
    'casa/luoghi': ['Sicurezza', 'Identità', 'Spazi emotivi'],
    'acqua/fuoco': ['Emozioni profonde', 'Trasformazione', 'Purificazione']
  };

  const symbolism = themes.flatMap((theme) => dreamSymbols[theme] || ['Simbolismo personale']);

  const interpretation = themes.length > 0
    ? `Il tuo sogno riflette temi di ${themes.join(', ')}. Potrebbe indicare un processo di elaborazione emotiva in corso.`
    : 'I sogni sono finestre sulla nostra psiche. Presta attenzione alle emozioni che evocano.';

  return {
    symbolism: [...new Set(symbolism)],
    emotions: ['Elaborazione', 'Integrazione', 'Riflessione'],
    interpretation,
    themes: themes.length > 0 ? themes : ['Sogno personale']
  };
}

export async function generateAIInsight(entry: DiaryEntry): Promise<string> {
  // If OpenAI API key is present, use it; otherwise fallback to local rules
  if (config.OPENAI_API_KEY) {
    try {
      const client = new OpenAI({
        apiKey: config.OPENAI_API_KEY,
        project: config.OPENAI_PROJECT || undefined,
      });
      const system = `Sei uno psicologo digitale. Fornisci in italiano un insight empatico e conciso (max 120 parole) su un diario ${entry.type}.
      Usa markdown semplice con:
      - Una riga iniziale con emoji (🧠 per emozione, 🌙 per sogno) e un titolo breve
      - 2-3 bullet di pattern
      - 2-3 suggerimenti pratici`;
      const user = entry.type === 'emotion'
        ? `Testo: ${entry.text}\nEmozione: ${entry.emotionLabel || 'sconosciuta'}\nIntensità: ${entry.emotionIntensity || 'n/d'}`
        : `Testo: ${entry.text}\nTemi: ${(entry.dreamThemes || []).join(', ') || 'n/d'}`;

      const completion = await client.chat.completions.create({
        model: config.AI_MODEL,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user }
        ],
        temperature: 0.7,
      });
      const content = completion.choices[0]?.message?.content?.trim();
      if (content) return content;
    } catch (err: any) {
      const status = err?.status ?? err?.code ?? 'unknown';
      const message = err?.message ?? String(err);
      console.warn(`[ai] OpenAI call failed (status=${status}): ${message}. Using local fallback.`);
      // fall through to local
    }
  } else {
    console.warn('[ai] OPENAI_API_KEY not set; using local fallback insights.');
  }

  // Local fallback
  await new Promise((r) => setTimeout(r, 200));
  if (entry.type === 'emotion' && entry.emotionLabel && entry.emotionIntensity) {
    const insight = generateEmotionInsight(entry.text, entry.emotionLabel, entry.emotionIntensity);
    return `🧠 **Insight AI**: ${insight.summary}\n\n**Pattern rilevati**: ${insight.patterns.join(', ')}\n\n**Suggerimenti**: ${insight.suggestions.join(', ')}`;
  } else if (entry.type === 'dream' && entry.dreamThemes) {
    const insight = generateDreamInsight(entry.text, entry.dreamThemes);
    return `🌙 **Analisi del Sogno**: ${insight.interpretation}\n\n**Simbolismo**: ${insight.symbolism.join(', ')}\n\n**Temi**: ${insight.themes.join(', ')}`;
  }
  return `💡 **Riflessione**: Questo log rappresenta un momento importante del tuo percorso emotivo. L'auto-osservazione è il primo passo verso la crescita personale.`;
}

// Lightweight extractors for server-side auto-tagging
const EMOTION_KEYWORDS: Record<EmotionLabel, string[]> = {
  ansia: ['ansioso', 'preoccupato', 'agitato', 'in ansia', 'teso', 'stressato', '😰', '😟', 'ansia', 'stress'],
  paura: ['paura', 'spaventato', 'terrorizzato', 'impaurito', '😱', 'terrore', 'fobia', 'timore'],
  rabbia: ['arrabbiato', 'furioso', 'irritato', 'incazzato', '🤬', 'rabbia', 'ira', 'collera', 'nervoso'],
  tristezza: ['triste', 'giù', 'depresso', 'abbattuto', '😢', '😭', 'tristezza', 'malinconia', 'sconforto'],
  gioia: ['felice', 'contento', 'sereno', 'entusiasta', '😊', '😄', 'gioia', 'allegria', 'euforia'],
  calma: ['calmo', 'tranquillo', 'rilassato', 'sereno', '😌', 'pace', 'relax', 'serenità'],
  sorpresa: ['sorpreso', 'stupito', 'incredulo', '😮', 'sorpresa', 'meraviglia', 'stupore'],
  disgusto: ['disgustato', 'schifato', '🤢', 'disgusto', 'ribrezzo', 'nausea', 'repulsione']
};

const INTENSIFIERS = {
  low: ["un po'", 'leggermente', 'poco'],
  medium: ['abbastanza', 'piuttosto'],
  high: ['molto', 'tanto', 'parecchio'],
  extreme: ['tantissimo', 'estremamente', 'terribilmente', 'incredibilmente', 'a pezzi', 'devastato', 'furioso', 'terrorizzato', 'strafelice']
};

const DREAM_THEMES: Record<string, string[]> = {
  'ansia/urgenza': ['ritardo', 'perdere treno', 'perdere aereo', 'scadenza', 'fretta', 'in ritardo', 'perdere tempo'],
  'lavoro/scuola': ['esame', 'interrogazione', 'ufficio', 'compito', 'lavoro', 'scuola', 'università', 'professore', 'capo'],
  'inseguimento': ['inseguire', 'inseguito', 'correre', 'scappare', 'fuga', 'caccia'],
  'caduta/volo': ['cadere', 'precipitare', 'volare', 'altezza', 'caduta', 'volo', 'precipizio'],
  'relazione': ['partner', 'ex', 'litigo', 'bacio', 'amore', 'fidanzato', 'fidanzata', 'matrimonio'],
  'casa/luoghi': ['casa', 'stanza', 'corridoio', 'città', 'palazzo', 'edificio', 'camera'],
  'acqua/fuoco': ['mare', 'fiume', 'incendio', 'fiamme', 'acqua', 'fuoco', 'nuotare', 'annegare']
};

export function extractEmotion(text: string): { label: EmotionLabel | null; intensity: number | null } {
  const lowerText = text.toLowerCase();
  let detected: EmotionLabel | null = null;
  let max = 0;
  for (const [emotion, keywords] of Object.entries(EMOTION_KEYWORDS)) {
    const matches = keywords.filter((k) => lowerText.includes(k.toLowerCase())).length;
    if (matches > max) {
      max = matches;
      detected = emotion as EmotionLabel;
    }
  }
  if (!detected) return { label: null, intensity: null };
  let intensity = 3;
  if (INTENSIFIERS.extreme.some((w) => lowerText.includes(w))) intensity = 5;
  else if (INTENSIFIERS.high.some((w) => lowerText.includes(w))) intensity = 4;
  else if (INTENSIFIERS.medium.some((w) => lowerText.includes(w))) intensity = 3;
  else if (INTENSIFIERS.low.some((w) => lowerText.includes(w))) intensity = 2;
  const intenseEmojis = ['😱', '🤬', '😭', '😰'];
  if (intenseEmojis.some((e) => text.includes(e))) intensity = Math.min(5, intensity + 1);
  return { label: detected, intensity };
}

export function extractDreamThemes(text: string): string[] {
  const lowerText = text.toLowerCase();
  const themes: string[] = [];
  for (const [theme, keywords] of Object.entries(DREAM_THEMES)) {
    if (keywords.some((k) => lowerText.includes(k.toLowerCase()))) themes.push(theme);
  }
  return themes;
}

// --- AI-based classification helpers ---

function safeJson<T = any>(s: string): T | null {
  try {
    return JSON.parse(s) as T;
  } catch {
    return null;
  }
}

export async function classifyEmotionAI(text: string): Promise<{ label: EmotionLabel | null; intensity: number | null }> {
  // Fallback quickly if no key
  if (!config.OPENAI_API_KEY) {
    const local = extractEmotion(text);
    return { label: local.label, intensity: local.intensity };
  }

  try {
    const client = new OpenAI({ apiKey: config.OPENAI_API_KEY, project: config.OPENAI_PROJECT || undefined });
    const system = `Sei un classificatore di emozioni. Rispondi SOLO in JSON senza testo extra.
Campi:
- label: una tra [ansia, paura, rabbia, tristezza, gioia, calma, sorpresa, disgusto] oppure null se incerta
- intensity: numero intero 1..5 oppure null se incerta`;
    const user = `Testo: ${text}`;
    const completion = await client.chat.completions.create({
      model: config.AI_MODEL,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user }
      ],
      temperature: 0,
      response_format: { type: 'json_object' as any },
    });
    const raw = completion.choices[0]?.message?.content?.trim() || '';
    const data = safeJson<{ label: EmotionLabel | null; intensity: number | null }>(raw);
    if (data && (data.label === null || typeof data.label === 'string')) {
      // sanity
      const allowed: EmotionLabel[] = ['ansia','paura','rabbia','tristezza','gioia','calma','sorpresa','disgusto'];
      const label = (allowed as string[]).includes((data.label as any) || '') ? (data.label as EmotionLabel) : null;
      const intensity = typeof data.intensity === 'number' ? Math.max(1, Math.min(5, Math.round(data.intensity))) : null;
      return { label, intensity };
    }
  } catch (err: any) {
    const status = err?.status ?? err?.code ?? 'unknown';
    console.warn(`[ai] classifyEmotionAI failed (status=${status}). Falling back to local.`);
  }

  // Local fallback
  const local = extractEmotion(text);
  return { label: local.label, intensity: local.intensity };
}

export async function analyzeEntry(text: string, type: EntryType): Promise<{ emotionLabel: EmotionLabel | null; emotionIntensity: number | null; dreamThemes: string[] | null }> {
  const { label, intensity } = await classifyEmotionAI(text);
  const themes = type === 'dream' ? extractDreamThemes(text) : null;
  return { emotionLabel: label, emotionIntensity: intensity, dreamThemes: themes };
}

export async function generatePeriodAnalysis(entries: DiaryEntry[], from?: string, to?: string): Promise<string> {
  const period = from || to ? `Periodo: ${from || 'inizio'} → ${to || 'oggi'}` : 'Periodo: completo';
  if (config.OPENAI_API_KEY) {
    try {
      const client = new OpenAI({ apiKey: config.OPENAI_API_KEY, project: config.OPENAI_PROJECT || undefined });
      const system = `Sei uno psicologo dei dati. Riceverai un JSON con log di diario (emozioni e sogni).
Scrivi in italiano un report conciso, empatico e professionale (max ~600 parole) strutturato così:
1) Sintesi del periodo
2) Pattern/emozioni ricorrenti e intensità
3) Relazioni tra sogni ed emozioni (interazioni)
4) Spunti pratici e suggerimenti
Usa markdown semplice con titoli e bullet. Evita di ripetere ogni singolo log; individua trend.`;
      const payload = {
        period,
        count: entries.length,
        entries: entries.map((e) => ({
          id: e.id,
          date: e.createdAt,
          type: e.type,
          text: e.text,
          emotionLabel: e.emotionLabel,
          emotionIntensity: e.emotionIntensity,
          dreamThemes: e.dreamThemes,
          isStarred: e.isStarred,
        })),
      };
      const completion = await client.chat.completions.create({
        model: config.AI_MODEL,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: JSON.stringify(payload) }
        ],
        temperature: 0.6,
      });
      const content = completion.choices[0]?.message?.content?.trim();
      if (content) return content;
    } catch (err: any) {
      console.warn('[ai] generatePeriodAnalysis failed; falling back to local. ', err?.message || err);
    }
  }

  // Local fallback summary
  const emotions = entries
    .filter(e => e.emotionLabel)
    .reduce<Record<string, number>>((acc, e) => {
      const key = e.emotionLabel as string;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
  const top = Object.entries(emotions).sort((a,b)=>b[1]-a[1])[0]?.[0] || 'n/d';
  const dreams = entries.filter(e => e.type === 'dream');
  const lines = [
    `# Report periodo`,
    period,
    `Totale voci: ${entries.length}`,
    '',
    `## Pattern`,
    `Emozione più ricorrente: ${top}`,
    `Sogni registrati: ${dreams.length}`,
    '',
    `## Relazioni sogni ↔ emozioni`,
    `Osserva come i temi dei sogni possano correlare con le emozioni giornaliere.`,
    '',
    `## Suggerimenti`,
    `- Continua a registrare costantemente`,
    `- Nota trigger e contesti ricorrenti`,
    `- Integra pratiche di consapevolezza`
  ];
  return lines.join('\n');
}
