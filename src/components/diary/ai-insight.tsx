import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Brain, Loader2, Sparkles } from "lucide-react";
import { DiaryEntry } from "@/lib/types";
import { generateAIInsight } from "@/lib/ai-insights";
import { diaryDB } from "@/lib/storage";

interface AIInsightProps {
  entry: DiaryEntry;
  onUpdate?: () => void;
}

export function AIInsight({ entry, onUpdate }: AIInsightProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [insight, setInsight] = useState(entry.aiInsight);
  const [hasGenerated, setHasGenerated] = useState(entry.insightGenerated);

  const handleGenerateInsight = async () => {
    setIsGenerating(true);
    try {
      const newInsight = await generateAIInsight(entry);
      setInsight(newInsight);
      setHasGenerated(true);
      
      // Salva nel database
      await diaryDB.updateEntry(entry.id, {
        aiInsight: newInsight,
        insightGenerated: true
      });
      
      onUpdate?.();
    } catch (error) {
      console.error('Error generating insight:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!hasGenerated && !insight) {
    return (
      <div className="mt-4 p-4 bg-insight-background border border-insight-border rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-insight-accent" />
            <span className="text-sm font-medium text-insight-text">
              Genera Insight AI
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleGenerateInsight}
            disabled={isGenerating}
            className="border-insight-border hover:bg-insight-accent hover:text-white"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                Analizzando...
              </>
            ) : (
              <>
                <Sparkles className="w-3 h-3 mr-1" />
                Genera
              </>
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          L'AI analizzerà il tuo log per fornire insight personalizzati
        </p>
      </div>
    );
  }

  if (insight) {
    return (
      <Card className="mt-4 p-4 bg-gradient-to-r from-insight-background to-card border border-insight-border animate-fade-in">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-insight-accent/10 rounded-lg flex-shrink-0">
            <Brain className="w-4 h-4 text-insight-accent" />
          </div>
          <div className="flex-1">
            <div className="prose prose-sm max-w-none text-insight-text">
              {insight.split('\n').map((line, index) => {
                if (line.startsWith('**') && line.endsWith('**')) {
                  return (
                    <p key={index} className="font-semibold text-foreground mb-1">
                      {line.replace(/\*\*/g, '')}
                    </p>
                  );
                }
                if (line.startsWith('🧠') || line.startsWith('🌙') || line.startsWith('💡')) {
                  return (
                    <p key={index} className="font-medium text-foreground mb-2">
                      {line}
                    </p>
                  );
                }
                return line ? (
                  <p key={index} className="mb-1">
                    {line}
                  </p>
                ) : (
                  <div key={index} className="h-2" />
                );
              })}
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return null;
}