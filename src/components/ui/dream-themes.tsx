import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface DreamThemesProps {
  themes: string[];
  className?: string;
}

const themeEmojis: Record<string, string> = {
  'ansia/urgenza': '⏰',
  'lavoro/scuola': '📚',
  'inseguimento': '🏃',
  'caduta/volo': '🕊️',
  'relazione': '💕',
  'casa/luoghi': '🏠',
  'acqua/fuoco': '🌊',
};

export function DreamThemes({ themes, className }: DreamThemesProps) {
  if (!themes || themes.length === 0) return null;
  
  return (
    <div className={cn("flex flex-wrap gap-1", className)}>
      {themes.map((theme, index) => (
        <Badge
          key={index}
          variant="secondary"
          className="text-xs bg-muted/50 hover:bg-muted/70 transition-colors"
        >
          {themeEmojis[theme] || '💭'} {theme}
        </Badge>
      ))}
    </div>
  );
}