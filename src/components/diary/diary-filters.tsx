import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Search, Filter, X } from "lucide-react";
import { EntryFilters, EmotionLabel, EntryType } from "@/lib/types";

interface DiaryFiltersProps {
  filters: EntryFilters;
  onFiltersChange: (filters: EntryFilters) => void;
}

const emotionLabels: EmotionLabel[] = [
  'ansia', 'paura', 'rabbia', 'tristezza', 'gioia', 'calma', 'sorpresa', 'disgusto'
];

export function DiaryFilters({ filters, onFiltersChange }: DiaryFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const updateFilter = (key: keyof EntryFilters, value: any) => {
    // Handle special "all" value for clearing filters
    const finalValue = value === "all" ? undefined : value;
    onFiltersChange({
      ...filters,
      [key]: finalValue || undefined
    });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== undefined && value !== '');

  return (
    <Card className="p-4 mb-6">
      {/* Search bar */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Cerca nei tuoi pensieri..."
          value={filters.q || ''}
          onChange={(e) => updateFilter('q', e.target.value)}
          className="pl-10 bg-background"
        />
      </div>

      {/* Quick filters */}
      <div className="flex flex-wrap gap-2 mb-3">
        <Button
          variant={filters.type === 'emotion' ? 'default' : 'outline'}
          size="sm"
          onClick={() => updateFilter('type', filters.type === 'emotion' ? undefined : 'emotion')}
        >
          Emozioni
        </Button>
        <Button
          variant={filters.type === 'dream' ? 'default' : 'outline'}
          size="sm"
          onClick={() => updateFilter('type', filters.type === 'dream' ? undefined : 'dream')}
        >
          Sogni
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <Filter className="w-4 h-4 mr-1" />
          Filtri avanzati
        </Button>
        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={clearFilters}
          >
            <X className="w-4 h-4 mr-1" />
            Pulisci
          </Button>
        )}
      </div>

      {/* Advanced filters */}
      {isExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-border">
          <div>
            <label className="text-sm font-medium mb-2 block">Emozione</label>
            <Select value={filters.emotionLabel || 'all'} onValueChange={(value) => updateFilter('emotionLabel', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Seleziona emozione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutte</SelectItem>
                {emotionLabels.map(emotion => (
                  <SelectItem key={emotion} value={emotion}>
                    {emotion}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Da</label>
            <Input
              type="date"
              value={filters.from ? filters.from.toISOString().split('T')[0] : ''}
              onChange={(e) => updateFilter('from', e.target.value ? new Date(e.target.value) : undefined)}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">A</label>
            <Input
              type="date"
              value={filters.to ? filters.to.toISOString().split('T')[0] : ''}
              onChange={(e) => updateFilter('to', e.target.value ? new Date(e.target.value) : undefined)}
            />
          </div>
        </div>
      )}
    </Card>
  );
}