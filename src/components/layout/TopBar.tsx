import { useLocation, useNavigate } from "react-router-dom";
import { Bell, Search, LogOut, Settings, Menu } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const pageTitles: Record<string, string> = {
  "/": "Dashboard",
  "/research": "AI Stock Research",
  "/strategy": "LLM Strategy Builder",
  "/news": "Synthesized News",
  "/sentiment": "Market Sentiment",
  "/risk": "Risk Analysis",
  "/assist": "Stock Assist",
  "/settings": "Settings",
};

interface TopBarProps {
  onMenuClick?: () => void;
  sidebarOpen?: boolean;
}

const TopBar = ({ onMenuClick, sidebarOpen = false }: TopBarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const title = pageTitles[location.pathname] || "FlashFinance AI";

  return (
    <header className="h-16 border-b border-border/50 bg-background/80 backdrop-blur-sm flex items-center justify-between px-4 sm:px-6 shrink-0 sticky top-0 z-10">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden h-9 w-9 shrink-0"
          onClick={onMenuClick}
        >
          <Menu size={18} />
        </Button>
        <h1 className="font-display text-base sm:text-lg font-semibold truncate">{title}</h1>
      </div>

      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        <div className="relative hidden sm:block">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search stocks..."
            className="w-40 sm:w-64 pl-9 h-9 bg-secondary/50 border-border/50 text-sm"
          />
        </div>
        <button
          onClick={signOut}
          className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors h-9 w-9 flex items-center justify-center shrink-0"
          title="Sign out"
        >
          <LogOut size={16} />
        </button>
        <button
          onClick={() => navigate("/settings")}
          className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-display font-bold text-xs hover:bg-primary/30 transition-colors cursor-pointer shrink-0"
          title="Settings"
        >
          {user?.email?.charAt(0).toUpperCase() || "U"}
        </button>
      </div>
    </header>
  );
};

export default TopBar;
