import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Save, RefreshCw } from "lucide-react";

interface Setting {
  id: string;
  key: string;
  value: string | null;
}

const settingsLabels: Record<string, { label: string; description: string; type?: string }> = {
  site_name: { label: "网站名称", description: "显示在浏览器标签页和页眉" },
  site_description: { label: "网站描述", description: "SEO描述，影响搜索引擎展示" },
  contact_email: { label: "联系邮箱", description: "对外展示的联系邮箱", type: "email" },
  contact_phone: { label: "联系电话", description: "对外展示的联系电话", type: "tel" },
  wechat_id: { label: "微信公众号", description: "公众号ID或名称" },
  founding_year: { label: "成立年份", description: "文学社创立年份" },
  recruitment_open: { label: "招新开放", description: "是否开放招新通道", type: "boolean" },
};

const SiteSettings = () => {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changed, setChanged] = useState(false);

  const fetchSettings = async () => {
    const { data } = await supabase.from("site_settings").select("*");
    setSettings((data as Setting[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchSettings(); }, []);

  const updateValue = (key: string, value: string) => {
    setSettings(prev => prev.map(s => s.key === key ? { ...s, value } : s));
    setChanged(true);
  };

  const saveAll = async () => {
    setSaving(true);
    for (const s of settings) {
      await supabase.from("site_settings").update({ value: s.value }).eq("key", s.key);
    }
    setSaving(false);
    setChanged(false);
  };

  if (loading) return <p className="py-10 text-center text-sm text-muted-foreground animate-pulse">加载中...</p>;

  const inputClass = "w-full rounded-lg border border-border bg-secondary/30 px-3 py-2 text-sm focus:border-primary focus:outline-none transition";

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-serif text-base font-bold">系统设置</h2>
        <div className="flex gap-2">
          <button onClick={() => { fetchSettings(); setChanged(false); }} className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground transition hover:bg-secondary">
            <RefreshCw className="h-3.5 w-3.5" /> 重置
          </button>
          <button onClick={saveAll} disabled={!changed || saving} className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-1.5 text-xs font-medium text-primary-foreground shadow-sm transition hover:opacity-90 disabled:opacity-50">
            <Save className="h-3.5 w-3.5" /> {saving ? "保存中..." : "保存全部"}
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {settings.map((s) => {
          const meta = settingsLabels[s.key] || { label: s.key, description: "" };
          return (
            <div key={s.key} className="rounded-xl border border-border bg-card p-4">
              <div className="mb-2">
                <label className="text-sm font-medium">{meta.label}</label>
                <p className="text-[11px] text-muted-foreground">{meta.description}</p>
              </div>
              {meta.type === "boolean" ? (
                <label className="flex items-center gap-2 cursor-pointer">
                  <div className={`relative h-5 w-9 rounded-full transition ${s.value === "true" ? "bg-primary" : "bg-muted"}`}>
                    <div className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${s.value === "true" ? "translate-x-4" : "translate-x-0.5"}`} />
                    <input type="checkbox" className="sr-only" checked={s.value === "true"} onChange={(e) => updateValue(s.key, e.target.checked ? "true" : "false")} />
                  </div>
                  <span className="text-xs text-muted-foreground">{s.value === "true" ? "已开启" : "已关闭"}</span>
                </label>
              ) : (
                <input type={meta.type || "text"} value={s.value || ""} onChange={(e) => updateValue(s.key, e.target.value)} className={inputClass} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SiteSettings;
