import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Search,
  TrendingUp,
  Newspaper,
  BarChart3,
  ShieldAlert,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Zap,
  Settings,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/" },
  { label: "Stock Research", icon: Search, path: "/research" },
  { label: "Strategy", icon: TrendingUp, path: "/strategy" },
  { label: "News", icon: Newspaper, path: "/news" },
  { label: "Sentiment", icon: BarChart3, path: "/sentiment" },
  { label: "Risk Analysis", icon: ShieldAlert, path: "/risk" },
  { label: "Stock Assist", icon: MessageSquare, path: "/assist" },
  { label: "Settings", icon: Settings, path: "/settings" },
];

interface AppSidebarProps {
  isMobile?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}

const AppSidebar = ({ isMobile = false, isOpen = true, onClose = () => {}, collapsed: externalCollapsed, onCollapsedChange }: AppSidebarProps) => {
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const collapsed = isMobile ? internalCollapsed : (externalCollapsed ?? internalCollapsed);
  
  const handleCollapsedToggle = (newState: boolean) => {
    if (isMobile) {
      setInternalCollapsed(newState);
    } else if (onCollapsedChange) {
      onCollapsedChange(newState);
    }
  };
  const location = useLocation();
  const { user } = useAuth();
  const displayName = user?.user_metadata?.display_name || user?.email?.split("@")[0] || "User";

  return (
    <aside
      className={cn(
        "flex flex-col border-r border-border/50 transition-all duration-300 h-full bg-background",
        isMobile ? "w-60" : collapsed ? "w-16" : "w-60"
      )}
      style={!isMobile ? { background: "var(--gradient-sidebar)" } : { background: "var(--gradient-sidebar)" }}
    >
      {/* Logo */}
      <div className="flex items-center justify-between gap-2.5 px-4 h-16 border-b border-border/50">
        <div className="flex items-center gap-2.5 flex-1">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
            <Zap size={18} className="text-primary" />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="overflow-hidden whitespace-nowrap"
              >
                <span className="font-display font-bold text-sm tracking-tight">
                  Flash<span className="text-primary">Finance</span>
                </span>
                <span className="text-sm text-muted-foreground block leading-none mt-0.5">{displayName}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        {/* Close button on mobile */}
        {isMobile && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onClose}
          >
            <ChevronLeft size={16} />
          </Button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto scrollbar-thin">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => isMobile && onClose()}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              )}
              title={collapsed && !isMobile ? item.label : undefined}
            >
              <item.icon size={18} className="shrink-0" />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    className="overflow-hidden whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </NavLink>
          );
        })}
      </nav>

      {/* Collapse toggle - hidden on mobile */}
      {!isMobile && (
        <button
          onClick={() => handleCollapsedToggle(!collapsed)}
          className="flex items-center justify-center h-12 border-t border-border/50 text-muted-foreground hover:text-foreground transition-colors"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      )}
    </aside>
  );
};

export default AppSidebar;
