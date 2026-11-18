import { Toaster } from "#src/components/ui/toaster";
import { Toaster as Sonner } from "#src/components/ui/sonner";
import { TooltipProvider } from "#src/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "#src/contexts/AuthContext";
import { useEffect } from "react";
import ProtectedRoute from "#src/components/ProtectedRoute";
import AppLayout from "#src/components/layout/AppLayout";
import Dashboard from "#src/pages/Dashboard";
import StockResearch from "#src/pages/StockResearch";
import Strategy from "#src/pages/Strategy";
import News from "#src/pages/News";
import Sentiment from "#src/pages/Sentiment";
import Risk from "#src/pages/Risk";
import StockAssist from "#src/pages/StockAssist";
import Settings from "#src/pages/Settings";
import Auth from "#src/pages/Auth";
import NotFound from "#src/pages/NotFound";

const queryClient = new QueryClient();

const ThemeInit = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ThemeInit>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/research" element={<StockResearch />} />
                <Route path="/strategy" element={<Strategy />} />
                <Route path="/news" element={<News />} />
                <Route path="/sentiment" element={<Sentiment />} />
                <Route path="/risk" element={<Risk />} />
                <Route path="/assist" element={<StockAssist />} />
                <Route path="/settings" element={<Settings />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </ThemeInit>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
