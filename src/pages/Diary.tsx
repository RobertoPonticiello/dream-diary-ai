import { useState, useEffect, useCallback } from "react";
import jsPDF from "jspdf";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { DiaryFilters } from "@/components/diary/diary-filters";
import { EntryCard } from "@/components/diary/entry-card";
import { MessageCircle, Download, Plus, BarChart3, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { DiaryEntry, EntryFilters, EmotionLabel } from "@/lib/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import * as api from "@/lib/api";
import { SiteShell } from "@/components/layout/site-shell";

export default function Diary() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
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
      urlFilters.emotionLabel = emotionLabel as EmotionLabel;
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
  const loadEntries = useCallback(async () => {
    try {
      setLoading(true);
  const loadedEntries = await api.getEntries(filters);
      setEntries(loadedEntries);
    } catch (error) {
      console.error('Error loading entries:', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  const handleExport = async () => {
    try {
  const csv = await api.exportToCSV(filters);
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

  // MD export removed in favor of direct PDF export

  const handleExportAnalysisPDF = async () => {
    try {
      const md = await api.exportPeriodAnalysis(filters);
      const doc = new jsPDF({ unit: 'pt', format: 'a4' });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 40;
      let y = margin;

      const addLines = (text: string, options?: { bold?: boolean; size?: number }) => {
        const size = options?.size ?? 12;
        const bold = options?.bold ?? false;
        doc.setFont('helvetica', bold ? 'bold' : 'normal');
        doc.setFontSize(size);
        const lines = doc.splitTextToSize(text, pageWidth - margin * 2);
        lines.forEach((line: string) => {
          if (y > pageHeight - margin) {
            doc.addPage();
            y = margin;
          }
          doc.text(line, margin, y);
          y += size + 6;
        });
      };

      // Title
      addLines('Analisi del periodo', { bold: true, size: 18 });
      const dateFmt = (d?: Date) => d ? d.toISOString().split('T')[0] : undefined;
      const range = `${dateFmt(filters.from) ?? 'inizio'} → ${dateFmt(filters.to) ?? 'oggi'}`;
      addLines(range, { size: 12 });
      y += 6;

      // Convert basic markdown structure into styled sections
      const lines = md.split('\n');
      for (const raw of lines) {
        const line = raw.trimEnd();
        if (!line.trim()) { y += 6; continue; }
        if (line.startsWith('### ')) { addLines(line.replace(/^###\s+/, ''), { bold: true, size: 14 }); continue; }
        if (line.startsWith('## ')) { addLines(line.replace(/^##\s+/, ''), { bold: true, size: 16 }); continue; }
        if (line.startsWith('# ')) { addLines(line.replace(/^#\s+/, ''), { bold: true, size: 18 }); continue; }
        if (line.match(/^[-*]\s+/)) { addLines('• ' + line.replace(/^[-*]\s+/, ''), { size: 12 }); continue; }
        addLines(line, { size: 12 });
      }

      const filename = `analisi-periodo-${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(filename);
    } catch (error) {
      console.error('Error exporting analysis PDF:', error);
    }
  };

  const handleQuickPeriod = (value: string) => {
    const now = new Date();
    if (value === 'all') {
      handleFiltersChange({ ...filters, from: undefined, to: undefined });
      return;
    }
    const days = parseInt(value, 10);
    const from = new Date(now);
    from.setDate(now.getDate() - days + 1);
    handleFiltersChange({ ...filters, from, to: now });
  };

  return (
    <SiteShell>
      {/* Header */}
      <header className="max-w-4xl mx-auto mb-8">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Il Mio Diario
            </h1>
            <p className="text-muted-foreground mt-1">
              {entries.length} {entries.length === 1 ? 'entry' : 'entries'} nel tuo diario
            </p>
          </div>
          
          <div className="flex gap-2 items-center w-full sm:w-auto justify-end">
            <Select onValueChange={handleQuickPeriod}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Periodo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Ultimi 7 giorni</SelectItem>
                <SelectItem value="30">Ultimi 30 giorni</SelectItem>
                <SelectItem value="90">Ultimi 90 giorni</SelectItem>
                <SelectItem value="all">Tutto</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              variant="outline"
              onClick={() => navigate('/analytics')}
              disabled={entries.length === 0}
              className="border-chart-primary/20 text-chart-primary hover:bg-chart-primary hover:text-white"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </Button>
            <Button 
              variant="outline"
              onClick={handleExportAnalysisPDF}
              disabled={entries.length === 0}
            >
              <Download className="w-4 h-4 mr-2" />
              Analisi (PDF)
            </Button>
            <Button 
              onClick={() => navigate('/')}
              className="bg-gradient-to-r from-primary to-accent text-white shadow-md hover:shadow-lg hover:brightness-110"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nuovo Entry
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Toggle theme"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="ml-1"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
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
            {entries.map((entry, index) => (
              <div
                key={entry.id}
                style={{ animationDelay: `${index * 100}ms` }}
                className="animate-slide-up"
              >
                <EntryCard 
                  entry={entry} 
                  onUpdate={loadEntries}
                />
              </div>
            ))}
          </div>
        )}
      </main>
    </SiteShell>
  );
}