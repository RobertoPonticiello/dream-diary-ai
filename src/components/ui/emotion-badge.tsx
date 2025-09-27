import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { EmotionLabel } from "@/lib/types";

interface EmotionBadgeProps {
  emotion: EmotionLabel;
  intensity?: number | null;
  className?: string;
}

const emotionConfig: Record<EmotionLabel, { color: string; emoji: string }> = {
  ansia: { color: 'bg-emotion-ansia text-white', emoji: '😰' },
  paura: { color: 'bg-emotion-paura text-white', emoji: '😱' },
  rabbia: { color: 'bg-emotion-rabbia text-white', emoji: '🤬' },
  tristezza: { color: 'bg-emotion-tristezza text-white', emoji: '😢' },
  gioia: { color: 'bg-emotion-gioia text-white', emoji: '😊' },
  calma: { color: 'bg-emotion-calma text-white', emoji: '😌' },
  sorpresa: { color: 'bg-emotion-sorpresa text-white', emoji: '😮' },
  disgusto: { color: 'bg-emotion-disgusto text-white', emoji: '🤢' },
};

export function EmotionBadge({ emotion, intensity, className }: EmotionBadgeProps) {
  const config = emotionConfig[emotion];
  
  return (
    <Badge 
      className={cn(
        config.color, 
        "font-medium transition-transform hover:scale-105",
        className
      )}
    >
      {config.emoji} {emotion}
      {intensity && (
        <span className="ml-1 opacity-90">
          {'★'.repeat(intensity)}
        </span>
      )}
    </Badge>
  );
}