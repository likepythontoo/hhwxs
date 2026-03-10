import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Eye } from "lucide-react";

const VisitorCounter = () => {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    const record = async () => {
      // Record this visit
      await supabase.from("site_visits").insert({ page: "/" });

      // Get total count
      const { count: total } = await supabase
        .from("site_visits")
        .select("id", { count: "exact", head: true });

      setCount(total || 0);
    };
    record();
  }, []);

  if (count === null) return null;

  return (
    <div className="flex items-center justify-center gap-2 py-3 text-xs text-muted-foreground">
      <Eye className="h-3.5 w-3.5" />
      <span>本站已被访问 <strong className="text-foreground">{count}</strong> 次</span>
    </div>
  );
};

export default VisitorCounter;
