import { ChatInterface } from "@/components/chat/chat-interface";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";
import { SiteShell } from "@/components/layout/site-shell";

export default function Chat() {
  const navigate = useNavigate();

  return (
    <SiteShell>
      <div className="text-center mb-8">
          <h2 className="text-xl font-semibold mb-2">
            Come ti senti oggi?
          </h2>
          <p className="text-muted-foreground">
            Scrivi o detta le tue emozioni. Ti aiuterò a tracciare il tuo benessere emotivo.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <ChatInterface onEntryAdded={() => {}} />
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            💡 Tip: Usa il microfono per dettare velocemente i tuoi pensieri
          </p>
        </div>
    </SiteShell>
  );
}