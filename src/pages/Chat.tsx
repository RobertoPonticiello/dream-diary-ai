import { ChatInterface } from "@/components/chat/chat-interface";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BookOpen, Download } from "lucide-react";

export default function Chat() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 p-4">
      {/* Header */}
      <header className="max-w-4xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Diario Emotivo
            </h1>
            <p className="text-muted-foreground mt-1">
              Registra le tue emozioni e i tuoi sogni
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={() => navigate('/diario')}
              className="hidden sm:flex"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Visualizza Diario
            </Button>
            <Button 
              variant="outline"
              onClick={() => navigate('/export')}
              size="icon"
              className="sm:hidden"
            >
              <BookOpen className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-xl font-semibold mb-2">
            Come ti senti oggi?
          </h2>
          <p className="text-muted-foreground">
            Scrivi o detta le tue emozioni. Ti aiuterò a tracciare il tuo benessere emotivo.
          </p>
        </div>
        
        <ChatInterface onEntryAdded={() => {}} />
        
        {/* Quick tip */}
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            💡 Tip: Usa il microfono per dettare velocemente i tuoi pensieri
          </p>
        </div>
      </main>
    </div>
  );
}