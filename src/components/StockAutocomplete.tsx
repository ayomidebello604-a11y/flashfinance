import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

const POPULAR_STOCKS = [
  { ticker: "AAPL", name: "Apple Inc." },
  { ticker: "MSFT", name: "Microsoft Corp." },
  { ticker: "GOOGL", name: "Alphabet Inc." },
  { ticker: "AMZN", name: "Amazon.com Inc." },
  { ticker: "NVDA", name: "NVIDIA Corp." },
  { ticker: "TSLA", name: "Tesla Inc." },
  { ticker: "META", name: "Meta Platforms Inc." },
  { ticker: "JPM", name: "JPMorgan Chase" },
  { ticker: "V", name: "Visa Inc." },
  { ticker: "JNJ", name: "Johnson & Johnson" },
  { ticker: "WMT", name: "Walmart Inc." },
  { ticker: "PG", name: "Procter & Gamble" },
  { ticker: "MA", name: "Mastercard Inc." },
  { ticker: "UNH", name: "UnitedHealth Group" },
  { ticker: "HD", name: "Home Depot Inc." },
  { ticker: "DIS", name: "Walt Disney Co." },
  { ticker: "BAC", name: "Bank of America" },
  { ticker: "NFLX", name: "Netflix Inc." },
  { ticker: "ADBE", name: "Adobe Inc." },
  { ticker: "CRM", name: "Salesforce Inc." },
  { ticker: "AMD", name: "Advanced Micro Devices" },
  { ticker: "INTC", name: "Intel Corp." },
  { ticker: "PYPL", name: "PayPal Holdings" },
  { ticker: "CSCO", name: "Cisco Systems" },
  { ticker: "CMCSA", name: "Comcast Corp." },
  { ticker: "PEP", name: "PepsiCo Inc." },
  { ticker: "KO", name: "Coca-Cola Co." },
  { ticker: "COST", name: "Costco Wholesale" },
  { ticker: "AVGO", name: "Broadcom Inc." },
  { ticker: "QCOM", name: "Qualcomm Inc." },
];

interface StockAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const StockAutocomplete = ({ value, onChange, placeholder, className }: StockAutocompleteProps) => {
  const [open, setOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<typeof POPULAR_STOCKS>([]);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!value.trim()) {
      setSuggestions([]);
      return;
    }
    const q = value.toUpperCase();
    const filtered = POPULAR_STOCKS.filter(
      (s) => s.ticker.includes(q) || s.name.toUpperCase().includes(q)
    ).slice(0, 6);
    setSuggestions(filtered);
    setOpen(filtered.length > 0);
  }, [value]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={wrapperRef} className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => value.trim() && suggestions.length > 0 && setOpen(true)}
        placeholder={placeholder}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
      />
      {open && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 rounded-md border border-border bg-popover shadow-lg overflow-hidden">
          {suggestions.map((stock) => (
            <button
              key={stock.ticker}
              type="button"
              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-secondary/50 transition-colors text-left"
              onClick={() => {
                onChange(stock.ticker);
                setOpen(false);
              }}
            >
              <span className="font-mono font-semibold text-primary w-12">{stock.ticker}</span>
              <span className="text-muted-foreground">{stock.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default StockAutocomplete;
export { POPULAR_STOCKS };
