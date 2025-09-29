import * as React from "react";
import { SiteHeader } from "./site-header";

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[radial-gradient(1200px_600px_at_70%_-10%,hsl(261_83%_12%_/_0.35),transparent),radial-gradient(800px_400px_at_10%_-10%,hsl(142_69%_20%_/_0.25),transparent)] bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-6">
        {children}
      </main>
    </div>
  );
}
