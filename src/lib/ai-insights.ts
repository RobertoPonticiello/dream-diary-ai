import { DiaryEntry, EmotionLabel, EmotionInsight, DreamInsight } from './types';

// Simulazione di AI insights - in produzione userebbe una vera API AI
export function generateEmotionInsight(text: string, emotion: EmotionLabel, intensity: number): EmotionInsight {
  const insights: Record<EmotionLabel, EmotionInsight> = {
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

export function generateDreamInsight(text: string, themes: string[]): DreamInsight {
  const dreamSymbols: Record<string, string[]> = {
    'ansia/urgenza': ['Pressione temporale', 'Perdita di controllo', 'Responsabilità'],
    'lavoro/scuola': ['Performance', 'Valutazione', 'Crescita personale'],
    'inseguimento': ['Evitamento', 'Confronto con paure', 'Fuga da responsabilità'],
    'caduta/volo': ['Libertà vs controllo', 'Cambiamenti nella vita', 'Prospettiva elevata'],
    'relazione': ['Connessione emotiva', 'Bisogni affettivi', 'Dinamiche interpersonali'],
    'casa/luoghi': ['Sicurezza', 'Identità', 'Spazi emotivi'],
    'acqua/fuoco': ['Emozioni profonde', 'Trasformazione', 'Purificazione']
  };

  const symbolism = themes.flatMap(theme => dreamSymbols[theme] || ['Simbolismo personale']);
  
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
  // Simula una chiamata API AI con delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  if (entry.type === 'emotion' && entry.emotionLabel && entry.emotionIntensity) {
    const insight = generateEmotionInsight(entry.text, entry.emotionLabel, entry.emotionIntensity);
    return `🧠 **Insight AI**: ${insight.summary}\n\n**Pattern rilevati**: ${insight.patterns.join(', ')}\n\n**Suggerimenti**: ${insight.suggestions.join(', ')}`;
  } else if (entry.type === 'dream' && entry.dreamThemes) {
    const insight = generateDreamInsight(entry.text, entry.dreamThemes);
    return `🌙 **Analisi del Sogno**: ${insight.interpretation}\n\n**Simbolismo**: ${insight.symbolism.join(', ')}\n\n**Temi**: ${insight.themes.join(', ')}`;
  }
  
  return `💡 **Riflessione**: Questo log rappresenta un momento importante del tuo percorso emotivo. L'auto-osservazione è il primo passo verso la crescita personale.`;
}