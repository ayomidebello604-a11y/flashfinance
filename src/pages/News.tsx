import { useState } from "react";
import type { FormEvent } from "react";
import { AlertCircle, ExternalLink, Loader2, Newspaper } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "#src/components/ui/button";
import { Card, CardContent } from "#src/components/ui/card";
import { Badge } from "#src/components/ui/badge";
import { Alert, AlertDescription } from "#src/components/ui/alert";
import { fetchLiveNews } from "#src/lib/api";
import StockAutocomplete from "#src/components/StockAutocomplete";

const News = () => {
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const {
    data,
    isFetching: loading,
    error: requestError,
    refetch,
  } = useQuery({
    queryKey: ["live-market-news", search],
    queryFn: () => fetchLiveNews(search),
    staleTime: 30000,
  });
  const articles = data?.articles ?? [];
  const notice = data?.notice ?? null;
  const error = requestError instanceof Error ? requestError.message : null;

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextSearch = query.trim();
    if (nextSearch === search) void refetch();
    else setSearch(nextSearch);
  };

  return (
    <div className="w-full space-y-4 sm:space-y-6 max-w-6xl">
      <div>
        <h2 className="font-display text-xl sm:text-2xl font-bold mb-2">Live Market News</h2>
        <p className="text-muted-foreground text-xs sm:text-sm">
          Published headlines and source links from Finnhub. Feed availability and update frequency depend on your provider plan.
        </p>
      </div>

      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2 sm:gap-3">
        <StockAutocomplete
          value={query}
          onChange={setQuery}
          placeholder="Search a ticker or market topic"
          className="flex-1 bg-secondary/50 text-sm"
        />
        <Button type="submit" disabled={loading} className="w-full sm:w-auto text-sm">
          {loading ? <Loader2 size={16} className="animate-spin mr-2" /> : null}
          {query.trim() ? "Search News" : "Refresh News"}
        </Button>
      </form>

      {error && (
        <Alert className="bg-[hsl(var(--loss))]/10 border-[hsl(var(--loss))]/30">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {notice && (
        <Alert>
          <Newspaper className="h-4 w-4" />
          <AlertDescription>{notice}</AlertDescription>
        </Alert>
      )}

      {loading && (
        <Card className="bg-card border-border/50">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Loader2 size={32} className="animate-spin text-primary mb-4" />
            <p className="text-muted-foreground text-sm">
              Loading {query.trim() ? `live news for "${query.trim()}"` : "latest live market headlines"}...
            </p>
          </CardContent>
        </Card>
      )}

      {!loading && !error && articles.length === 0 && (
        <Card className="bg-card border-border/50">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Newspaper size={32} className="text-muted-foreground/50 mb-3" />
            <p className="text-sm text-muted-foreground">No live headlines are available for this search.</p>
          </CardContent>
        </Card>
      )}

      {!loading && articles.length > 0 && (
        <div className="space-y-3">
          {articles.map((article) => (
            <Card key={article.id} className="bg-card border-border/50 hover:border-primary/20 transition-colors">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-start gap-2 text-sm font-semibold hover:text-primary"
                    >
                      <span>{article.title}</span>
                      <ExternalLink size={14} className="mt-0.5 shrink-0" />
                    </a>
                    {article.summary && (
                      <p className="text-sm text-muted-foreground leading-relaxed mt-2">{article.summary}</p>
                    )}
                    <div className="flex items-center gap-2 mt-3">
                      <span className="text-xs text-muted-foreground">{article.source}</span>
                      <span className="text-xs text-muted-foreground/50">·</span>
                      <span className="text-xs text-muted-foreground">{article.timeAgo}</span>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs shrink-0">{article.category}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default News;
