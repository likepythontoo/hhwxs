import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Newspaper, BookOpen, CalendarDays } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";

interface SearchResult {
  id: string;
  title: string;
  subtitle: string;
  type: "news" | "work" | "event";
}

const GlobalSearch = ({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) => {
  const navigate = useNavigate();
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");

  // Keyboard shortcut
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, onOpenChange]);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const timer = setTimeout(() => {
      setLoading(true);
      const q = `%${query.trim()}%`;
      Promise.all([
        supabase.from("news").select("id, title, category").eq("is_published", true).or(`title.ilike.${q},content.ilike.${q}`).limit(5),
        supabase.from("submissions").select("id, title, author_name, genre").eq("status", "approved").or(`title.ilike.${q},content.ilike.${q},author_name.ilike.${q}`).limit(5),
        supabase.from("events").select("id, title, location, event_date").or(`title.ilike.${q},description.ilike.${q}`).limit(5),
      ]).then(([news, works, events]) => {
        const r: SearchResult[] = [
          ...(news.data || []).map(n => ({ id: n.id, title: n.title, subtitle: n.category || "新闻", type: "news" as const })),
          ...(works.data || []).map(w => ({ id: w.id, title: w.title, subtitle: `${w.author_name}${w.genre ? " · " + w.genre : ""}`, type: "work" as const })),
          ...(events.data || []).map(e => ({ id: e.id, title: e.title, subtitle: e.location || new Date(e.event_date).toLocaleDateString("zh-CN"), type: "event" as const })),
        ];
        setResults(r);
        setLoading(false);
      });
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = useCallback((item: SearchResult) => {
    onOpenChange(false);
    setQuery("");
    if (item.type === "news") navigate("/news");
    else if (item.type === "work") navigate("/works");
    else navigate("/events");
  }, [navigate, onOpenChange]);

  const newsResults = results.filter(r => r.type === "news");
  const workResults = results.filter(r => r.type === "work");
  const eventResults = results.filter(r => r.type === "event");

  return (
    <CommandDialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) setQuery(""); }}>
      <CommandInput placeholder="搜索新闻、作品、活动..." value={query} onValueChange={setQuery} />
      <CommandList>
        {loading ? (
          <div className="flex justify-center py-6">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : (
          <>
            <CommandEmpty>未找到相关内容</CommandEmpty>
            {newsResults.length > 0 && (
              <CommandGroup heading="新闻动态">
                {newsResults.map(r => (
                  <CommandItem key={r.id} onSelect={() => handleSelect(r)} className="cursor-pointer">
                    <Newspaper className="mr-2 h-4 w-4 text-muted-foreground" />
                    <div className="flex-1 truncate">
                      <span className="text-sm">{r.title}</span>
                      <span className="ml-2 text-xs text-muted-foreground">{r.subtitle}</span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            {workResults.length > 0 && (
              <CommandGroup heading="作品展示">
                {workResults.map(r => (
                  <CommandItem key={r.id} onSelect={() => handleSelect(r)} className="cursor-pointer">
                    <BookOpen className="mr-2 h-4 w-4 text-muted-foreground" />
                    <div className="flex-1 truncate">
                      <span className="text-sm">{r.title}</span>
                      <span className="ml-2 text-xs text-muted-foreground">{r.subtitle}</span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            {eventResults.length > 0 && (
              <CommandGroup heading="活动中心">
                {eventResults.map(r => (
                  <CommandItem key={r.id} onSelect={() => handleSelect(r)} className="cursor-pointer">
                    <CalendarDays className="mr-2 h-4 w-4 text-muted-foreground" />
                    <div className="flex-1 truncate">
                      <span className="text-sm">{r.title}</span>
                      <span className="ml-2 text-xs text-muted-foreground">{r.subtitle}</span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
};

export default GlobalSearch;
