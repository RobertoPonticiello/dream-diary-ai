import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  Calendar, 
  Heart, 
  Brain,
  ArrowLeft,
  Smile,
  Frown,
  Star,
  Activity
} from "lucide-react";
import { DiaryEntry, EmotionLabel } from "@/lib/types";
import * as api from "@/lib/api";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

export default function Analytics() {
  const navigate = useNavigate();
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    try {
      setLoading(true);
  const loadedEntries = await api.getEntries();
      setEntries(loadedEntries);
    } catch (error) {
      console.error('Error loading entries:', error);
    } finally {
      setLoading(false);
    }
  };

  // Analisi dati
  const emotionEntries = entries.filter(e => e.type === 'emotion' && e.emotionLabel);
  const dreamEntries = entries.filter(e => e.type === 'dream');
  const starredEntries = entries.filter(e => e.isStarred);

  // Dati per i grafici
  const emotionData = Object.entries(
    emotionEntries.reduce((acc, entry) => {
      if (entry.emotionLabel) {
        acc[entry.emotionLabel] = (acc[entry.emotionLabel] || 0) + 1;
      }
      return acc;
    }, {} as Record<EmotionLabel, number>)
  ).map(([emotion, count]) => ({
    emotion,
    count,
    fill: `hsl(var(--emotion-${emotion}))`
  }));

  // Trend dell'umore negli ultimi 30 giorni
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - 29 + i);
    return date;
  });

  const moodTrendData = last30Days.map(date => {
    const dayEntries = emotionEntries.filter(entry => 
      entry.createdAt.toDateString() === date.toDateString()
    );
    
    const avgIntensity = dayEntries.length > 0 
      ? dayEntries.reduce((sum, entry) => sum + (entry.emotionIntensity || 3), 0) / dayEntries.length
      : null;

    const positiveEmotions = ['gioia', 'calma'];
    const avgMood = dayEntries.length > 0
      ? dayEntries.reduce((sum, entry) => {
          const isPositive = positiveEmotions.includes(entry.emotionLabel || '');
          const intensity = entry.emotionIntensity || 3;
          return sum + (isPositive ? intensity : 6 - intensity);
        }, 0) / dayEntries.length
      : null;

    return {
      date: date.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' }),
      mood: avgMood,
      intensity: avgIntensity,
      entries: dayEntries.length
    };
  });

  // Statistiche generali
  const stats = {
    totalEntries: entries.length,
    emotionEntries: emotionEntries.length,
    dreamEntries: dreamEntries.length,
    starredEntries: starredEntries.length,
    avgDailyEntries: entries.length > 0 ? (entries.length / 30).toFixed(1) : '0',
    mostCommonEmotion: emotionData.reduce((max, curr) => 
      curr.count > max.count ? curr : max, 
      { emotion: 'Nessuna', count: 0 }
    ),
    happyDays: moodTrendData.filter(day => day.mood && day.mood > 3).length,
    difficultDays: moodTrendData.filter(day => day.mood && day.mood < 3).length
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Caricamento analisi...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 p-4">
      {/* Header */}
      <header className="max-w-6xl mx-auto mb-8">
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate('/diario')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Torna al Diario
          </Button>
        </div>
        
        <div className="text-center">
          <h1 className="text-4xl font-bold bg-gradient-analytics bg-clip-text text-transparent mb-2">
            Le Tue Insights
          </h1>
          <p className="text-muted-foreground">
            Analizza i tuoi pattern emotivi e scopri le tue tendenze
          </p>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-4 text-center bg-gradient-to-br from-card to-card/50 border border-border/50">
            <Activity className="w-6 h-6 text-chart-primary mx-auto mb-2" />
            <div className="text-2xl font-bold text-foreground">{stats.totalEntries}</div>
            <div className="text-sm text-muted-foreground">Logs Totali</div>
          </Card>
          
          <Card className="p-4 text-center bg-gradient-to-br from-card to-card/50 border border-border/50">
            <Heart className="w-6 h-6 text-chart-secondary mx-auto mb-2" />
            <div className="text-2xl font-bold text-foreground">{stats.avgDailyEntries}</div>
            <div className="text-sm text-muted-foreground">Media Giornaliera</div>
          </Card>
          
          <Card className="p-4 text-center bg-gradient-to-br from-card to-card/50 border border-border/50">
            <Smile className="w-6 h-6 text-chart-tertiary mx-auto mb-2" />
            <div className="text-2xl font-bold text-foreground">{stats.happyDays}</div>
            <div className="text-sm text-muted-foreground">Giorni Felici</div>
          </Card>
          
          <Card className="p-4 text-center bg-gradient-to-br from-card to-card/50 border border-border/50">
            <Star className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-foreground">{stats.starredEntries}</div>
            <div className="text-sm text-muted-foreground">Momenti Speciali</div>
          </Card>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto">
        <Tabs defaultValue="emotions" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="emotions" className="flex items-center gap-2">
              <Heart className="w-4 h-4" />
              Emozioni
            </TabsTrigger>
            <TabsTrigger value="trends" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Tendenze
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-2">
              <Brain className="w-4 h-4" />
              Insight
            </TabsTrigger>
          </TabsList>

          <TabsContent value="emotions" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Distribuzione Emozioni */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-chart-primary" />
                  Distribuzione Emozioni
                </h3>
                {emotionData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={emotionData}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        dataKey="count"
                        label={({ emotion, count }) => `${emotion} (${count})`}
                      >
                        {emotionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    Nessun dato sulle emozioni ancora
                  </div>
                )}
              </Card>

              {/* Frequenza Emozioni */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Frequenza per Emozione</h3>
                {emotionData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={emotionData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--chart-grid))" />
                      <XAxis dataKey="emotion" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="hsl(var(--chart-primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    Inizia a registrare le tue emozioni per vedere i grafici
                  </div>
                )}
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-chart-secondary" />
                Andamento Umore (Ultimi 30 giorni)
              </h3>
              {moodTrendData.some(day => day.mood !== null) ? (
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={moodTrendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--chart-grid))" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[1, 5]} />
                    <Tooltip 
                      labelFormatter={(label) => `Data: ${label}`}
                      formatter={(value: number | null) => [
                        value ? value.toFixed(1) : 'N/A', 
                        'Umore'
                      ]}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="mood" 
                      stroke="hsl(var(--chart-secondary))" 
                      strokeWidth={3}
                      dot={{ fill: "hsl(var(--chart-secondary))", strokeWidth: 2, r: 4 }}
                      connectNulls={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  Continua a scrivere per vedere le tendenze del tuo umore
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6 bg-gradient-insight border border-insight-border">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Smile className="w-5 h-5 text-chart-tertiary" />
                  I Tuoi Momenti Migliori
                </h3>
                <div className="space-y-3">
                  <div className="text-2xl font-bold text-chart-tertiary">{stats.happyDays} giorni</div>
                  <p className="text-sm text-muted-foreground">
                    con umore prevalentemente positivo
                  </p>
                  <div className="text-sm">
                    <strong>Emozione più frequente:</strong> {stats.mostCommonEmotion.emotion}
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-gradient-insight border border-insight-border">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Brain className="w-5 h-5 text-chart-quaternary" />
                  Pattern Identificati
                </h3>
                <div className="space-y-3">
                  <div className="text-sm">
                    <strong>Sogni registrati:</strong> {dreamEntries.length}
                  </div>
                  <div className="text-sm">
                    <strong>Giorni difficili:</strong> {stats.difficultDays}
                  </div>
                  <div className="text-sm">
                    <strong>Consistenza:</strong> {stats.avgDailyEntries} logs/giorno
                  </div>
                </div>
              </Card>
            </div>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Suggerimenti Personalizzati</h3>
              <div className="space-y-3 text-sm text-muted-foreground">
                {stats.happyDays > stats.difficultDays ? (
                  <p>🌟 Ottimo lavoro! Il tuo umore è prevalentemente positivo. Continua così!</p>
                ) : (
                  <p>💙 Nota che stai attraversando un periodo più sfidante. Considera di parlare con qualcuno di fiducia.</p>
                )}
                
                {stats.totalEntries < 10 && (
                  <p>📝 Continua a scrivere regolarmente per ottenere insight più accurati sui tuoi pattern.</p>
                )}
                
                {stats.starredEntries > 0 && (
                  <p>⭐ Hai {stats.starredEntries} momenti speciali salvati. Rileggili quando ne hai bisogno!</p>
                )}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}