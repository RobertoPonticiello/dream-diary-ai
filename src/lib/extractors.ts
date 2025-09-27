import { EmotionLabel } from './types';

// Dizionario emozioni con sinonimi e emoji
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

// Intensificatori per calcolare l'intensità
const INTENSIFIERS = {
  low: ['un po\'', 'leggermente', 'poco'],
  medium: ['abbastanza', 'piuttosto'],
  high: ['molto', 'tanto', 'parecchio'],
  extreme: ['tantissimo', 'estremamente', 'terribilmente', 'incredibilmente', 'a pezzi', 'devastato', 'furioso', 'terrorizzato', 'strafelice']
};

// Temi per i sogni
const DREAM_THEMES = {
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
  
  // Trova l'emozione
  let detectedEmotion: EmotionLabel | null = null;
  let maxMatches = 0;
  
  for (const [emotion, keywords] of Object.entries(EMOTION_KEYWORDS)) {
    const matches = keywords.filter(keyword => lowerText.includes(keyword.toLowerCase())).length;
    if (matches > maxMatches) {
      maxMatches = matches;
      detectedEmotion = emotion as EmotionLabel;
    }
  }
  
  if (!detectedEmotion) {
    return { label: null, intensity: null };
  }
  
  // Calcola intensità
  let intensity = 3; // intensità base
  
  // Controlla intensificatori
  if (INTENSIFIERS.extreme.some(word => lowerText.includes(word))) {
    intensity = 5;
  } else if (INTENSIFIERS.high.some(word => lowerText.includes(word))) {
    intensity = 4;
  } else if (INTENSIFIERS.medium.some(word => lowerText.includes(word))) {
    intensity = 3;
  } else if (INTENSIFIERS.low.some(word => lowerText.includes(word))) {
    intensity = 2;
  }
  
  // Emoji intense aggiungono intensità
  const intenseEmojis = ['😱', '🤬', '😭', '😰'];
  if (intenseEmojis.some(emoji => text.includes(emoji))) {
    intensity = Math.min(5, intensity + 1);
  }
  
  return { label: detectedEmotion, intensity };
}

export function extractDreamThemes(text: string): string[] {
  const lowerText = text.toLowerCase();
  const themes: string[] = [];
  
  for (const [theme, keywords] of Object.entries(DREAM_THEMES)) {
    if (keywords.some(keyword => lowerText.includes(keyword.toLowerCase()))) {
      themes.push(theme);
    }
  }
  
  return themes;
}