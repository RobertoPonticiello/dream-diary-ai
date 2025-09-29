import { Link, useLocation } from "react-router-dom";
import Button from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";
import { BookOpen, BarChart3, Moon, Sun, MessageCirclePlus } from "lucide-react";
import { useTheme } from "next-themes";

export function SiteHeader() {
  const { pathname } = useLocation();
  const { theme, setTheme } = useTheme();

  const isActive = (to: string) => (pathname === to);

  return (
    <header className="w-full sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-background/70 bg-background/90 border-b border-border/60">
      <div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between gap-3">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/80 to-accent/80 shadow" />
          <span className="font-semibold tracking-tight">Dream Diary</span>
        </Link>

        {/* Nav */}
        <nav className="hidden sm:flex items-center gap-1">
          <Link
            to="/"
            className={cn(
              buttonVariants({ variant: isActive("/") ? "soft" : "ghost", size: "sm" }),
            )}
          >
            <BookOpen className="w-4 h-4 mr-2" /> Nuovo
          </Link>
          <Link
            to="/diario"
            className={cn(
              buttonVariants({ variant: isActive("/diario") ? "soft" : "ghost", size: "sm" }),
            )}
          >
            <MessageCirclePlus className="w-4 h-4 mr-2" /> Diario
          </Link>
          <Link
            to="/analytics"
            className={cn(
              buttonVariants({ variant: isActive("/analytics") ? "soft" : "ghost", size: "sm" }),
            )}
          >
            <BarChart3 className="w-4 h-4 mr-2" /> Analytics
          </Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Toggle theme"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>
          <Link
            to="/"
            className={cn(
              buttonVariants({ variant: "default", size: "sm" }),
              "hidden xs:flex bg-gradient-to-r from-primary to-accent text-white shadow-md hover:shadow-lg hover:brightness-110"
            )}
          >
            Nuovo Entry
          </Link>
        </div>
      </div>
    </header>
  );
}
