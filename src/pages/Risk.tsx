import { useState } from "react";
import { ShieldAlert, Loader2, AlertTriangle, Shield, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import StockAutocomplete from "@/components/StockAutocomplete";

interface Risk {
  category: string;
  title: string;
  severity: string;
  likelihood: string;
  description: string;
  mitigation: string;
}

interface RiskData {
  subject: string;
  overallRiskLevel: string;
  riskScore: number;
  risks: Risk[];
  summary: string;
  recommendation: string;
}

const RiskPage = () => {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<RiskData | null>(null);

  const handleAnalyze = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setData(null);
    try {
      const { data: result, error } = await supabase.functions.invoke("stock-risk", {
        body: { query: query.trim() },
      });
      if (error) throw error;
      if (result.error) throw new Error(result.error);
      setData(result);
    } catch (e: any) {
      toast.error(e.message || "Failed to analyze risks");
    } finally {
      setLoading(false);
    }
  };

  const severityColor = (s: string) => {
    const map: Record<string, string> = {
      critical: "bg-[hsl(var(--loss))]/15 text-[hsl(var(--loss))] border-[hsl(var(--loss))]/30",
      high: "bg-[hsl(var(--loss))]/10 text-[hsl(var(--loss))] border-[hsl(var(--loss))]/20",
      medium: "bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))] border-[hsl(var(--warning))]/30",
      low: "bg-secondary/50 text-muted-foreground border-border/50",
    };
    return map[s.toLowerCase()] || map.low;
  };

  const riskLevelIcon = (level: string) => {
    const l = level.toLowerCase();
    if (l === "critical" || l === "high") return <AlertTriangle size={20} className="loss-text" />;
    if (l === "medium") return <Shield size={20} className="text-[hsl(var(--warning))]" />;
    return <ShieldCheck size={20} className="profit-text" />;
  };

  const riskScoreColor = (score: number) => {
    if (score >= 70) return "bg-[hsl(var(--loss))]";
    if (score >= 40) return "bg-[hsl(var(--warning))]";
    return "bg-[hsl(var(--profit))]";
  };

  return (
    <div className="w-full space-y-4 sm:space-y-6 max-w-6xl">
      <div>
        <h2 className="font-display text-xl sm:text-2xl font-bold mb-2">Automated Risk Identification</h2>
        <p className="text-muted-foreground text-xs sm:text-sm">
          Identify key risks for any company or sector to make safer investment decisions.
        </p>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); handleAnalyze(); }} className="flex flex-col sm:flex-row gap-2 sm:gap-3">
        <StockAutocomplete
          value={query}
          onChange={setQuery}
          placeholder="Enter company or sector"
          className="flex-1 bg-secondary/50 text-sm"
        />
        <Button type="submit" disabled={loading || !query.trim()} className="w-full sm:w-auto text-sm">
          {loading ? <Loader2 size={16} className="animate-spin mr-2" /> : null}
          Identify Risks
        </Button>
      </form>

      {loading && (
        <Card className="bg-card border-border/50">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Loader2 size={32} className="animate-spin text-primary mb-4" />
            <p className="text-muted-foreground text-sm">Analyzing risks for "{query}"...</p>
          </CardContent>
        </Card>
      )}

      {!loading && !data && (
        <Card className="bg-card border-border/50 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <ShieldAlert size={40} className="text-muted-foreground/30 mb-4" />
            <CardTitle className="text-lg mb-2 text-muted-foreground">No risk analysis yet</CardTitle>
            <p className="text-sm text-muted-foreground/70">Enter a company or sector to get AI-powered risk identification and assessment.</p>
          </CardContent>
        </Card>
      )}

      {data && (
        <div className="space-y-4">
          {/* Overview */}
          <Card className="bg-card border-border/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {riskLevelIcon(data.overallRiskLevel)}
                  <div>
                    <h3 className="font-display text-xl font-bold">{data.subject}</h3>
                    <p className="text-sm text-muted-foreground">Overall Risk: <span className="font-semibold text-foreground">{data.overallRiskLevel}</span></p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-mono font-bold">{data.riskScore}</p>
                  <p className="text-xs text-muted-foreground">/ 100</p>
                </div>
              </div>
              <div className="w-full h-2 rounded-full bg-secondary overflow-hidden">
                <div className={`h-full rounded-full transition-all ${riskScoreColor(data.riskScore)}`} style={{ width: `${data.riskScore}%` }} />
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mt-4">{data.summary}</p>
              <div className="mt-3 p-3 rounded-lg bg-primary/5 border border-primary/10">
                <p className="text-sm"><span className="font-semibold text-primary">Recommendation:</span> {data.recommendation}</p>
              </div>
            </CardContent>
          </Card>

          {/* Risk Cards */}
          <div className="space-y-3">
            {data.risks.map((risk, i) => (
              <Card key={i} className="bg-card border-border/50">
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">{risk.category}</Badge>
                        <h4 className="text-sm font-semibold">{risk.title}</h4>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{risk.description}</p>
                    </div>
                    <div className="flex flex-col gap-1 shrink-0 items-end">
                      <Badge variant="outline" className={`text-xs ${severityColor(risk.severity)}`}>{risk.severity}</Badge>
                      <span className="text-xs text-muted-foreground">Likelihood: {risk.likelihood}</span>
                    </div>
                  </div>
                  <div className="mt-2 p-2 rounded bg-secondary/20">
                    <p className="text-xs text-muted-foreground"><span className="font-medium text-foreground">Mitigation:</span> {risk.mitigation}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RiskPage;
