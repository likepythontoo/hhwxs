import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Save, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface Setting {
  id: string;
  key: string;
  value: string | null;
}

interface FieldMeta {
  label: string;
  description: string;
  type?: "text" | "email" | "tel" | "boolean" | "number" | "textarea" | "url";
}

const groups: { id: string; label: string; fields: Record<string, FieldMeta> }[] = [
  {
    id: "basic",
    label: "基本信息",
    fields: {
      site_name: { label: "网站名称", description: "显示在浏览器标签页和页眉" },
      site_description: { label: "网站描述", description: "SEO描述，影响搜索引擎展示", type: "textarea" },
      founding_year: { label: "成立年份", description: "文学社创立年份" },
      copyright_text: { label: "版权信息", description: "页脚显示的版权文字" },
    },
  },
  {
    id: "contact",
    label: "联系方式",
    fields: {
      contact_email: { label: "联系邮箱", description: "对外展示的联系邮箱", type: "email" },
      contact_phone: { label: "联系电话", description: "对外展示的联系电话", type: "tel" },
      wechat_id: { label: "微信公众号", description: "公众号ID或名称" },
      footer_address: { label: "校区地址（短）", description: "页脚短地址" },
      footer_address_detail: { label: "校区地址（详细）", description: "完整校区详细地址" },
      footer_amap_url: { label: "高德地图链接", description: "页脚地图弹窗的高德地图URL", type: "url" },
    },
  },
  {
    id: "social",
    label: "社交媒体",
    fields: {
      social_douyin: { label: "抖音账号", description: "抖音账号名称" },
      social_bilibili: { label: "Bilibili账号", description: "B站账号名称" },
      social_weibo: { label: "微博账号", description: "微博账号名称" },
    },
  },
  {
    id: "home",
    label: "首页设置",
    fields: {
      hero_autoplay_interval: { label: "轮播自动切换秒数", description: "首页大图自动播放间隔（秒）", type: "number" },
      recruitment_open: { label: "招新开放", description: "是否开放招新通道", type: "boolean" },
    },
  },
  {
    id: "about",
    label: "关于页",
    fields: {
      about_intro: { label: "社团简介段落", description: "关于页面 / 页脚显示的总体简介", type: "textarea" },
    },
  },
];

const SiteSettings = () => {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changed, setChanged] = useState(false);
  const [activeGroup, setActiveGroup] = useState("basic");

  const fetchSettings = async () => {
    const { data } = await supabase.from("site_settings").select("*");
    setSettings((data as Setting[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchSettings(); }, []);

  const valueOf = (key: string) => settings.find(s => s.key === key)?.value ?? "";

  const updateValue = (key: string, value: string) => {
    setSettings(prev => {
      if (prev.some(s => s.key === key)) {
        return prev.map(s => s.key === key ? { ...s, value } : s);
      }
      return [...prev, { id: crypto.randomUUID(), key, value }];
    });
    setChanged(true);
  };

  const saveAll = async () => {
    setSaving(true);
    try {
      for (const s of settings) {
        await supabase.from("site_settings").upsert({ key: s.key, value: s.value }, { onConflict: "key" });
      }
      toast.success("设置已保存，前台立即生效");
      setChanged(false);
    } catch (e: any) {
      toast.error("保存失败：" + e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="py-10 text-center text-sm text-muted-foreground animate-pulse">加载中...</p>;

  const inputClass = "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none transition";

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-serif text-base font-bold">系统设置</h2>
          <p className="text-xs text-muted-foreground mt-1">修改任何字段后点击"保存全部"，前台会立即同步</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { fetchSettings(); setChanged(false); }} className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs text-muted-foreground transition hover:bg-secondary">
            <RefreshCw className="h-3.5 w-3.5" /> 重置
          </button>
          <button onClick={saveAll} disabled={!changed || saving} className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-medium text-primary-foreground shadow-sm transition hover:opacity-90 disabled:opacity-50">
            <Save className="h-3.5 w-3.5" /> {saving ? "保存中..." : "保存全部"}
          </button>
        </div>
      </div>

      <Tabs value={activeGroup} onValueChange={setActiveGroup}>
        <TabsList className="flex flex-wrap h-auto justify-start gap-1 bg-transparent p-0 mb-4">
          {groups.map(g => (
            <TabsTrigger key={g.id} value={g.id} className="rounded-lg border border-border data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              {g.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {groups.map(g => (
          <TabsContent key={g.id} value={g.id} className="space-y-4 mt-0">
            {Object.entries(g.fields).map(([key, meta]) => {
              const v = valueOf(key);
              return (
                <div key={key} className="rounded-xl border border-border bg-card p-4">
                  <div className="mb-2">
                    <label className="text-sm font-medium">{meta.label}</label>
                    <p className="text-[11px] text-muted-foreground">{meta.description}</p>
                  </div>
                  {meta.type === "boolean" ? (
                    <label className="flex items-center gap-2 cursor-pointer">
                      <div className={`relative h-5 w-9 rounded-full transition ${v === "true" ? "bg-primary" : "bg-muted"}`}>
                        <div className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${v === "true" ? "translate-x-4" : "translate-x-0.5"}`} />
                        <input type="checkbox" className="sr-only" checked={v === "true"} onChange={(e) => updateValue(key, e.target.checked ? "true" : "false")} />
                      </div>
                      <span className="text-xs text-muted-foreground">{v === "true" ? "已开启" : "已关闭"}</span>
                    </label>
                  ) : meta.type === "textarea" ? (
                    <textarea value={v} onChange={(e) => updateValue(key, e.target.value)} rows={4} className={inputClass} />
                  ) : (
                    <input type={meta.type === "number" ? "number" : (meta.type || "text")} value={v} onChange={(e) => updateValue(key, e.target.value)} className={inputClass} />
                  )}
                </div>
              );
            })}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default SiteSettings;
