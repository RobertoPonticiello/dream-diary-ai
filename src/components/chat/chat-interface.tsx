import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Mic, MicOff, Send, MessageCircle, Brain } from "lucide-react";
import { cn } from "@/lib/utils";
import { diaryDB } from "@/lib/storage";
import { EntryType } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

interface ChatInterfaceProps {
  onEntryAdded?: () => void;
}

export function ChatInterface({ onEntryAdded }: ChatInterfaceProps) {
  const [text, setText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [entryType, setEntryType] = useState<EntryType>("emotion");
  const [isLoading, setIsLoading] = useState(false);
  const recognitionRef = useRef<any>(null);
  const { toast } = useToast();

  const initSpeechRecognition = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast({
        title: "Speech Recognition non supportato",
        description: "Il tuo browser non supporta il riconoscimento vocale",
        variant: "destructive"
      });
      return false;
    }

    const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognitionClass();
    
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'it-IT';

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setText(prev => prev + (prev ? ' ' : '') + transcript);
    };

    recognition.onerror = (event) => {
      setIsListening(false);
      toast({
        title: "Errore riconoscimento vocale",
        description: "Si è verificato un errore durante il riconoscimento vocale",
        variant: "destructive"
      });
    };

    recognitionRef.current = recognition;
    return true;
  };

  const toggleListening = () => {
    if (!recognitionRef.current && !initSpeechRecognition()) {
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
    }
  };

  const handleSubmit = async () => {
    if (!text.trim()) return;

    setIsLoading(true);
    try {
      await diaryDB.addEntry(text.trim(), entryType);
      
      toast({
        title: "✅ Salvato",
        description: `${entryType === 'emotion' ? 'Emozione' : 'Sogno'} salvato con successo`,
      });
      
      setText("");
      onEntryAdded?.();
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile salvare l'entry",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto p-6 shadow-card">
      {/* Type selector */}
      <div className="flex gap-2 mb-4">
        <Button
          variant={entryType === "emotion" ? "default" : "outline"}
          onClick={() => setEntryType("emotion")}
          className="flex-1"
        >
          <MessageCircle className="w-4 h-4 mr-2" />
          Emozione
        </Button>
        <Button
          variant={entryType === "dream" ? "default" : "outline"}
          onClick={() => setEntryType("dream")}
          className="flex-1"
        >
          <Brain className="w-4 h-4 mr-2" />
          Sogno
        </Button>
      </div>

      {/* Text input */}
      <div className="relative mb-4">
        <Textarea
          placeholder={
            entryType === "emotion" 
              ? "Come ti senti oggi? Descrivi le tue emozioni..."
              : "Racconta il tuo sogno..."
          }
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyPress={handleKeyPress}
          className="min-h-[120px] pr-12 resize-none bg-background border-border focus:ring-2 focus:ring-primary/20"
        />
        
        {/* Mic button */}
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className={cn(
            "absolute bottom-2 right-2 w-8 h-8 p-0 transition-colors",
            isListening && "bg-primary text-primary-foreground"
          )}
          onClick={toggleListening}
        >
          {isListening ? (
            <MicOff className="w-4 h-4" />
          ) : (
            <Mic className="w-4 h-4" />
          )}
        </Button>
      </div>

      {/* Submit button */}
      <Button
        onClick={handleSubmit}
        disabled={!text.trim() || isLoading}
        className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-gentle transition-all"
      >
        <Send className="w-4 h-4 mr-2" />
        {isLoading ? "Salvataggio..." : "Aggiungi"}
      </Button>

      {/* Status indicator */}
      {isListening && (
        <div className="mt-3 text-center">
          <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            Sto ascoltando...
          </span>
        </div>
      )}
    </Card>
  );
}