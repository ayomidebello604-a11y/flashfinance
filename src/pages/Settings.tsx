import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, User, Mail, Moon, Sun, Loader2 } from "lucide-react";
import { toast } from "sonner";

const Settings = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState("");
  const [saving, setSaving] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    if (user) {
      // Load profile
      supabase
        .from("profiles")
        .select("display_name")
        .eq("id", user.id)
        .single()
        .then(({ data }) => {
          if (data?.display_name) setDisplayName(data.display_name);
        });
    }
    // Check current theme
    setDarkMode(document.documentElement.classList.contains("dark"));
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ display_name: displayName, updated_at: new Date().toISOString() })
      .eq("id", user.id);
    if (error) {
      toast.error("Failed to update profile");
    } else {
      toast.success("Profile updated!");
    }
    setSaving(false);
  };

  const toggleTheme = (isDark: boolean) => {
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  return (
    <div className="w-full space-y-4 sm:space-y-6 max-w-2xl">
      <div className="flex items-center gap-2 sm:gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="h-9 w-9">
          <ArrowLeft size={18} />
        </Button>
        <div>
          <h2 className="font-display text-xl sm:text-2xl font-bold">Settings</h2>
          <p className="text-muted-foreground text-xs sm:text-sm">Manage your account and preferences</p>
        </div>
      </div>

      {/* Profile */}
      <Card className="bg-card border-border/50">
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className="text-sm sm:text-base font-medium flex items-center gap-2">
            <User size={16} className="text-primary" /> Profile Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2 text-xs sm:text-sm">
              <Mail size={14} className="text-muted-foreground" /> Email
            </Label>
            <Input
              id="email"
              value={user?.email || ""}
              disabled
              className="bg-secondary/30 border-border/50 opacity-70 text-sm"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="displayName" className="text-xs sm:text-sm">Display Name</Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your display name"
              className="bg-secondary/50 border-border/50 text-sm"
            />
          </div>
          <Button onClick={handleSave} disabled={saving} className="gap-2 w-full sm:w-auto text-sm">
            {saving && <Loader2 size={14} className="animate-spin" />}
            Save Changes
          </Button>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card className="bg-card border-border/50">
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className="text-sm sm:text-base font-medium flex items-center gap-2">
            {darkMode ? <Moon size={16} className="text-primary" /> : <Sun size={16} className="text-primary" />}
            Appearance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-medium">Dark Mode</p>
              <p className="text-xs text-muted-foreground">Toggle between light and dark themes</p>
            </div>
            <Switch checked={darkMode} onCheckedChange={toggleTheme} className="shrink-0" />
          </div>
        </CardContent>
      </Card>

      {/* Sign Out */}
      <Card className="bg-card border-border/50">
        <CardContent className="pt-4 sm:pt-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-medium">Sign Out</p>
              <p className="text-xs text-muted-foreground">Sign out of your account</p>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={async () => {
                await signOut();
                navigate("/auth");
              }}
              className="w-full sm:w-auto text-xs sm:text-sm"
            >
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
