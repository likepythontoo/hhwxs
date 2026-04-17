import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Term } from "@/data/leadershipData";

export const useLeadershipData = () => {
  return useQuery<Term[]>({
    queryKey: ["leadership"],
    queryFn: async () => {
      const [termsRes, deptsRes] = await Promise.all([
        supabase.from("leadership_terms" as any).select("*").order("sort_order", { ascending: true }),
        supabase.from("leadership_departments" as any).select("*").order("sort_order", { ascending: true }),
      ]);

      const terms = (termsRes.data as any[]) || [];
      const depts = (deptsRes.data as any[]) || [];

      return terms.map((t) => ({
        year: t.year,
        president: t.president,
        vicePresidents: t.vice_presidents || [],
        departments: depts
          .filter((d) => d.term_id === t.id)
          .map((d) => ({ title: d.title, names: d.members || [] })),
      })) as Term[];
    },
    staleTime: 60_000,
  });
};

export const useSiteSettings = () => {
  return useQuery<Record<string, string>>({
    queryKey: ["site_settings"],
    queryFn: async () => {
      const { data } = await supabase.from("site_settings").select("key, value");
      const map: Record<string, string> = {};
      (data || []).forEach((s) => { map[s.key] = s.value || ""; });
      return map;
    },
    staleTime: 60_000,
  });
};
