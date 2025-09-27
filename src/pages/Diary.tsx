import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { DiaryFilters } from "@/components/diary/diary-filters";
import { EntryCard } from "@/components/diary/entry-card";
import { MessageCircle, Download, Plus } from "lucide-react";
import { DiaryEntry, EntryFilters } from "@/lib/types";
import { diaryDB } from "@/lib/storage";

export default function Diary() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<EntryFilters>({});

  // Load filters from URL on mount
  useEffect(() => {
    const urlFilters: EntryFilters = {};
    
    const type = searchParams.get('type');
    if (type === 'emotion' || type === 'dream') {
      urlFilters.type = type;
    }
    
    const emotionLabel = searchParams.get('emotionLabel');
    if (emotionLabel) {
      urlFilters.emotionLabel = emotionLabel as any;
    }
    
    const q = searchParams.get('q');
    if (q) {
      urlFilters.q = q;
    }
    
    const from = searchParams.get('from');
    if (from) {
      urlFilters.from = new Date(from);
    }
    
    const to = searchParams.get('to');
    if (to) {
      urlFilters.to = new Date(to);
    }
    
    setFilters(urlFilters);
  }, [searchParams]);

  // Update URL when filters change
  const handleFiltersChange = (newFilters: EntryFilters) => {
    setFilters(newFilters);
    
    const params = new URLSearchParams();
    
    if (newFilters.type) params.set('type', newFilters.type);
    if (newFilters.emotionLabel) params.set('emotionLabel', newFilters.emotionLabel);
    if (newFilters.q) params.set('q', newFilters.q);
    if (newFilters.from) params.set('from', newFilters.from.toISOString().split('T')[0]);
    if (newFilters.to) params.set('to', newFilters.to.toISOString().split('T')[0]);
    
    setSearchParams(params);
  };

  // Load entries
  const loadEntries = async () => {
    try {
      setLoading(true);
      const loadedEntries = await diaryDB.getEntries(filters);
      setEntries(loadedEntries);
    } catch (error) {
      console.error('Error loading entries:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEntries();
  }, [filters]);

  const handleExport = async () => {
    try {
      const csv = await diaryDB.exportToCSV(filters);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `diario-emotivo-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error exporting:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 p-4">
      {/* Header */}
      <header className="max-w-4xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Il Mio Diario
            </h1>
            <p className="text-muted-foreground mt-1">
              {entries.length} {entries.length === 1 ? 'entry' : 'entries'} nel tuo diario
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={handleExport}
              disabled={entries.length === 0}
            >
              <Download className="w-4 h-4 mr-2" />
              Esporta CSV
            </Button>
            <Button 
              onClick={() => navigate('/')}
            >
              <Plus className="w-4 h-4 mr-2" />
              Nuovo Entry
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-4xl mx-auto">
        <DiaryFilters 
          filters={filters} 
          onFiltersChange={handleFiltersChange} 
        />

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="mt-4 text-muted-foreground">Caricamento...</p>
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-12">
            <MessageCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Nessun log ancora</h3>
            <p className="text-muted-foreground mb-6">
              Prova a scrivere come ti senti.
            </p>
            <Button onClick={() => navigate('/')}>
              <Plus className="w-4 h-4 mr-2" />
              Aggiungi la tua prima entry
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {entries.map((entry) => (
              <EntryCard 
                key={entry.id} 
                entry={entry} 
                onUpdate={loadEntries}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}