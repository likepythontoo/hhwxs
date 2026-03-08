import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Event } from "./EventManagement";

interface Props {
  event: Partial<Event>;
  onClose: () => void;
  onSaved: () => void;
}

const EventFormDialog = ({ event, onClose, onSaved }: Props) => {
  const [form, setForm] = useState<Partial<Event>>(event);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!form.title || !form.event_date) return;
    setSaving(true);

    const payload = {
      title: form.title,
      description: form.description || null,
      event_date: form.event_date,
      location: form.location || null,
      category: form.category || "文学活动",
      max_participants: form.max_participants || null,
      registration_deadline: form.registration_deadline || null,
      is_active: form.is_active ?? true,
    };

    if (form.id) {
      await supabase.from("events").update(payload).eq("id", form.id);
    } else {
      await supabase.from("events").insert(payload);
    }

    setSaving(false);
    onSaved();
  };

  const inputClass = "w-full rounded-lg border border-border bg-secondary/30 px-3 py-2 text-sm focus:border-primary focus:outline-none transition";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <h3 className="mb-5 font-serif text-lg font-bold">{form.id ? "编辑活动" : "✨ 新增活动"}</h3>
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">活动名称 *</label>
            <input type="text" value={form.title || ""} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputClass} placeholder="如：春日诗歌朗诵会" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">活动描述</label>
            <textarea value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} className={inputClass} rows={3} placeholder="活动详情..." />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">活动日期 *</label>
              <input type="datetime-local" value={form.event_date ? form.event_date.slice(0, 16) : ""} onChange={(e) => setForm({ ...form, event_date: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">报名截止</label>
              <input type="datetime-local" value={form.registration_deadline ? form.registration_deadline.slice(0, 16) : ""} onChange={(e) => setForm({ ...form, registration_deadline: e.target.value || null })} className={inputClass} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">地点</label>
              <input type="text" value={form.location || ""} onChange={(e) => setForm({ ...form, location: e.target.value })} className={inputClass} placeholder="如：图书馆报告厅" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">类别</label>
              <input type="text" value={form.category || ""} onChange={(e) => setForm({ ...form, category: e.target.value })} className={inputClass} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">人数上限</label>
              <input type="number" value={form.max_participants || ""} onChange={(e) => setForm({ ...form, max_participants: e.target.value ? Number(e.target.value) : null })} className={inputClass} />
            </div>
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 text-xs cursor-pointer">
                <div className={`relative h-5 w-9 rounded-full transition ${form.is_active ? "bg-primary" : "bg-muted"}`}>
                  <div className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${form.is_active ? "translate-x-4" : "translate-x-0.5"}`} />
                  <input type="checkbox" className="sr-only" checked={form.is_active ?? true} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
                </div>
                活动开放中
              </label>
            </div>
          </div>
        </div>
        <div className="mt-6 flex gap-2">
          <button onClick={onClose} className="flex-1 rounded-lg border border-border py-2.5 text-sm text-muted-foreground transition hover:bg-secondary">取消</button>
          <button onClick={save} disabled={saving || !form.title || !form.event_date} className="flex-1 rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-90 disabled:opacity-50">
            {saving ? "保存中..." : "保存"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventFormDialog;
