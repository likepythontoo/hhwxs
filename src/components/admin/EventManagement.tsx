import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Pencil, Trash2, Eye, Download } from "lucide-react";
import RegistrationView from "./RegistrationView";
import EventFormDialog from "./EventFormDialog";

export interface Event {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  location: string | null;
  category: string | null;
  max_participants: number | null;
  registration_deadline: string | null;
  is_active: boolean | null;
}

const EventManagement = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [editingEvent, setEditingEvent] = useState<Partial<Event> | null>(null);
  const [viewingRegistrations, setViewingRegistrations] = useState<string | null>(null);

  const fetchEvents = async () => {
    const { data } = await supabase
      .from("events").select("*").order("event_date", { ascending: false });
    setEvents(data || []);
  };

  useEffect(() => { fetchEvents(); }, []);

  const deleteEvent = async (id: string) => {
    if (!confirm("确定删除此活动？相关报名记录也会被删除。")) return;
    await supabase.from("events").delete().eq("id", id);
    fetchEvents();
  };

  if (viewingRegistrations) {
    return (
      <RegistrationView
        eventId={viewingRegistrations}
        eventTitle={events.find(e => e.id === viewingRegistrations)?.title || ""}
        onBack={() => setViewingRegistrations(null)}
      />
    );
  }

  return (
    <>
      <div className="mb-5 flex items-center justify-between">
        <h2 className="font-serif text-base font-bold">所有活动 ({events.length})</h2>
        <button
          onClick={() => setEditingEvent({ is_active: true, category: "文学活动" })}
          className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-medium text-primary-foreground shadow-sm transition hover:opacity-90"
        >
          <Plus className="h-3.5 w-3.5" /> 新增活动
        </button>
      </div>

      <div className="space-y-3">
        {events.map((ev) => (
          <div key={ev.id} className="group flex items-center justify-between rounded-xl border border-border bg-card p-4 transition-shadow hover:shadow-md">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-sm font-bold">{ev.title}</h3>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                  ev.is_active ? "bg-green-50 text-green-700" : "bg-muted text-muted-foreground"
                }`}>
                  {ev.is_active ? "进行中" : "已关闭"}
                </span>
                {ev.category && (
                  <span className="rounded-full bg-accent/20 px-2 py-0.5 text-[10px] text-accent-foreground">
                    {ev.category}
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                📅 {new Date(ev.event_date).toLocaleDateString("zh-CN")}
                {ev.location && ` · 📍 ${ev.location}`}
                {ev.max_participants && ` · 👥 上限 ${ev.max_participants} 人`}
              </p>
              {ev.description && (
                <p className="mt-1.5 line-clamp-1 text-xs text-muted-foreground/70">{ev.description}</p>
              )}
            </div>
            <div className="flex gap-1 opacity-60 transition-opacity group-hover:opacity-100">
              <button onClick={() => setViewingRegistrations(ev.id)} className="rounded-lg p-2 transition hover:bg-secondary" title="查看报名">
                <Eye className="h-4 w-4" />
              </button>
              <button onClick={() => setEditingEvent(ev)} className="rounded-lg p-2 transition hover:bg-secondary" title="编辑">
                <Pencil className="h-4 w-4" />
              </button>
              <button onClick={() => deleteEvent(ev.id)} className="rounded-lg p-2 text-destructive/60 transition hover:bg-destructive/10" title="删除">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
        {events.length === 0 && <p className="py-10 text-center text-sm text-muted-foreground">暂无活动，点击上方按钮新增</p>}
      </div>

      {editingEvent && (
        <EventFormDialog
          event={editingEvent}
          onClose={() => setEditingEvent(null)}
          onSaved={() => { setEditingEvent(null); fetchEvents(); }}
        />
      )}
    </>
  );
};

export default EventManagement;
