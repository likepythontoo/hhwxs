import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Trash2, Upload, Image as ImageIcon, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

interface Slide {
  id: string;
  image_url: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  link_url: string | null;
  link_text: string | null;
  sort_order: number;
  is_active: boolean;
}

const HeroSlidesManagement = () => {
  const qc = useQueryClient();
  const [uploading, setUploading] = useState<string | null>(null);

  const { data: slides = [], isLoading } = useQuery<Slide[]>({
    queryKey: ["admin_hero_slides"],
    queryFn: async () => {
      const { data } = await supabase.from("hero_slides" as any).select("*").order("sort_order", { ascending: true });
      return (data as any) || [];
    },
  });

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["admin_hero_slides"] });
    qc.invalidateQueries({ queryKey: ["hero_slides"] });
  };

  const createSlide = async () => {
    const max = slides.reduce((m, s) => Math.max(m, s.sort_order), 0);
    const { error } = await supabase.from("hero_slides" as any).insert({
      image_url: "", title: "新幻灯片", subtitle: "", description: "", sort_order: max + 1, is_active: true,
    });
    if (error) toast.error(error.message); else { toast.success("已新增"); refresh(); }
  };

  const updateSlide = async (id: string, patch: Partial<Slide>) => {
    await supabase.from("hero_slides" as any).update(patch).eq("id", id);
    refresh();
  };

  const deleteSlide = async (id: string) => {
    if (!confirm("确认删除该幻灯片？")) return;
    await supabase.from("hero_slides" as any).delete().eq("id", id);
    toast.success("已删除");
    refresh();
  };

  const uploadImage = async (id: string, file: File) => {
    setUploading(id);
    try {
      const ext = file.name.split(".").pop();
      const path = `hero/${id}-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("site-assets").upload(path, file, { upsert: true });
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from("site-assets").getPublicUrl(path);
      await updateSlide(id, { image_url: pub.publicUrl });
      toast.success("图片已上传");
    } catch (e: any) {
      toast.error("上传失败：" + e.message);
    } finally {
      setUploading(null);
    }
  };

  if (isLoading) return <p className="py-10 text-center text-sm text-muted-foreground animate-pulse">加载中...</p>;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-serif text-base font-bold">首页轮播图</h2>
          <p className="text-xs text-muted-foreground mt-1">未启用时使用默认轮播图。如有启用幻灯片则替换默认。</p>
        </div>
        <button onClick={createSlide} className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-medium text-primary-foreground transition hover:opacity-90">
          <Plus className="h-3.5 w-3.5" /> 新增幻灯片
        </button>
      </div>

      <div className="space-y-4">
        {slides.map((s) => (
          <div key={s.id} className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="grid gap-4 p-4 sm:grid-cols-[200px_1fr]">
              {/* Image preview + upload */}
              <div>
                <div className="aspect-video rounded-lg border border-border bg-secondary/30 overflow-hidden flex items-center justify-center">
                  {s.image_url ? (
                    <img src={s.image_url} alt={s.title} className="h-full w-full object-cover" />
                  ) : (
                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                  )}
                </div>
                <label className="mt-2 flex items-center justify-center gap-1.5 cursor-pointer rounded-lg border border-border bg-secondary/30 px-3 py-2 text-xs hover:bg-secondary">
                  <Upload className="h-3.5 w-3.5" />
                  {uploading === s.id ? "上传中..." : "上传图片"}
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                    const f = e.target.files?.[0]; if (f) uploadImage(s.id, f);
                  }} />
                </label>
              </div>

              {/* Fields */}
              <div className="space-y-2">
                <div className="grid gap-2 sm:grid-cols-2">
                  <label className="block">
                    <span className="text-[11px] font-medium text-muted-foreground">主标题</span>
                    <input defaultValue={s.title} onBlur={(e) => e.target.value !== s.title && updateSlide(s.id, { title: e.target.value })} className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
                  </label>
                  <label className="block">
                    <span className="text-[11px] font-medium text-muted-foreground">副标题</span>
                    <input defaultValue={s.subtitle || ""} onBlur={(e) => e.target.value !== (s.subtitle || "") && updateSlide(s.id, { subtitle: e.target.value })} className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
                  </label>
                </div>
                <label className="block">
                  <span className="text-[11px] font-medium text-muted-foreground">描述</span>
                  <input defaultValue={s.description || ""} onBlur={(e) => e.target.value !== (s.description || "") && updateSlide(s.id, { description: e.target.value })} className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
                </label>
                <div className="grid gap-2 sm:grid-cols-[80px_1fr_auto_auto]">
                  <label className="block">
                    <span className="text-[11px] font-medium text-muted-foreground">排序</span>
                    <input type="number" defaultValue={s.sort_order} onBlur={(e) => Number(e.target.value) !== s.sort_order && updateSlide(s.id, { sort_order: Number(e.target.value) })} className="mt-1 w-full rounded-lg border border-border bg-background px-2 py-2 text-sm" />
                  </label>
                  <label className="block">
                    <span className="text-[11px] font-medium text-muted-foreground">图片URL（可直接填写）</span>
                    <input defaultValue={s.image_url} onBlur={(e) => e.target.value !== s.image_url && updateSlide(s.id, { image_url: e.target.value })} className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-xs" />
                  </label>
                  <button onClick={() => updateSlide(s.id, { is_active: !s.is_active })} className={`mt-5 flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-medium ${s.is_active ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground"}`}>
                    {s.is_active ? <><Eye className="h-3.5 w-3.5" />已启用</> : <><EyeOff className="h-3.5 w-3.5" />已停用</>}
                  </button>
                  <button onClick={() => deleteSlide(s.id)} className="mt-5 rounded-lg p-2 text-destructive hover:bg-destructive/10">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
        {slides.length === 0 && (
          <div className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
            暂无幻灯片，前台将使用默认 3 张图。点击"新增幻灯片"开始管理。
          </div>
        )}
      </div>

      <p className="mt-6 text-xs text-muted-foreground italic">提示：所有字段失焦自动保存。</p>
    </div>
  );
};

export default HeroSlidesManagement;
