import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, StarOff, MessageCircle, Brain } from "lucide-react";
import { DiaryEntry } from "@/lib/types";
import { EmotionBadge } from "@/components/ui/emotion-badge";
import { DreamThemes } from "@/components/ui/dream-themes";
import { AIInsight } from "./ai-insight";
import * as api from "@/lib/api";
import { cn } from "@/lib/utils";

interface EntryCardProps {
  entry: DiaryEntry;
  onUpdate?: () => void;
}

export function EntryCard({ entry, onUpdate }: EntryCardProps) {
  const [isStarred, setIsStarred] = useState(entry.isStarred);

  const emotionTint = (label?: DiaryEntry['emotionLabel']) => {
    switch (label) {
      case 'ansia': return 'bg-emotion-ansia/8 hover:bg-emotion-ansia/12';
      case 'paura': return 'bg-emotion-paura/8 hover:bg-emotion-paura/12';
      case 'rabbia': return 'bg-emotion-rabbia/8 hover:bg-emotion-rabbia/12';
      case 'tristezza': return 'bg-emotion-tristezza/8 hover:bg-emotion-tristezza/12';
      case 'gioia': return 'bg-emotion-gioia/8 hover:bg-emotion-gioia/12';
      case 'calma': return 'bg-emotion-calma/8 hover:bg-emotion-calma/12';
      case 'sorpresa': return 'bg-emotion-sorpresa/8 hover:bg-emotion-sorpresa/12';
      case 'disgusto': return 'bg-emotion-disgusto/8 hover:bg-emotion-disgusto/12';
      default: return '';
    }
  };

  const toggleStar = async () => {
    try {
  const newStarred = !isStarred;
  await api.updateEntry(entry.id, { isStarred: newStarred });
      setIsStarred(newStarred);
      onUpdate?.();
    } catch (error) {
      console.error('Error updating star:', error);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('it-IT', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getTypeIcon = () => {
    return entry.type === 'emotion' ? (
      <MessageCircle className="w-4 h-4" />
    ) : (
      <Brain className="w-4 h-4" />
    );
  };

  return (
    <Card className={cn(
      "p-6 transition-all duration-300 hover:shadow-float border-l-4 animate-fade-in",
      entry.type === 'emotion' 
        ? "border-l-primary" 
        : "border-l-accent",
      "bg-card/80 backdrop-blur-sm",
      emotionTint(entry.emotionLabel ?? undefined)
    )}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {getTypeIcon()}
          <span className="capitalize font-medium">{entry.type === 'emotion' ? '💭 Emozione' : '🌙 Sogno'}</span>
          <span>•</span>
          <time>{formatDate(entry.createdAt)}</time>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleStar}
          className={cn(
            "h-8 w-8 p-0 transition-all duration-200 hover:scale-105",
            isStarred && "text-yellow-500 hover:text-yellow-600 bg-yellow-50"
          )}
        >
          {isStarred ? (
            <Star className="w-4 h-4 fill-current" />
          ) : (
            <StarOff className="w-4 h-4" />
          )}
        </Button>
      </div>

      {/* Content */}
      <div className="mb-4">
        <p className="text-foreground leading-relaxed whitespace-pre-wrap">
          {entry.text}
        </p>
      </div>

      {/* Tags and metadata */}
      <div className="flex flex-wrap gap-2 items-center mb-4">
        {entry.emotionLabel && (
          <EmotionBadge 
            emotion={entry.emotionLabel} 
            intensity={entry.emotionIntensity}
          />
        )}
        
        {entry.dreamThemes && entry.dreamThemes.length > 0 && (
          <DreamThemes themes={entry.dreamThemes} />
        )}
        
        {entry.wakeMood && (
          <Badge variant="outline" className="text-xs">
            Risveglio: {'😊'.repeat(entry.wakeMood)}
          </Badge>
        )}
      </div>

      {/* AI Insight */}
      <AIInsight entry={entry} onUpdate={onUpdate} />
    </Card>
  );
}