import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, MapPin, Users, Clock, ChevronRight, Tag } from "lucide-react";

interface Event {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  location: string | null;
  category: string | null;
  scope: string | null;
  max_participants: number | null;
  registration_deadline: string | null;
  is_active: boolean | null;
}

const Events = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "public" | "internal">("all");
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  // Registration form
  const [regName, setRegName] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regStudentId, setRegStudentId] = useState("");
  const [regCollege, setRegCollege] = useState("");
  const [regLoading, setRegLoading] = useState(false);
  const [regResult, setRegResult] = useState<{ ok: boolean; msg: string } | null>(null);

  useEffect(() => {
    supabase.from("events").select("id, title, description, event_date, location, category, scope, max_participants, registration_deadline, is_active").eq("is_active", true)
      .order("event_date", { ascending: true })
      .then(({ data }) => { setEvents(data || []); setLoading(false); });
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent) return;
    setRegLoading(true);
    setRegResult(null);

    const { error } = await supabase.from("event_registrations").insert({
      event_id: selectedEvent.id,
      name: regName.trim(),
      phone: regPhone.trim(),
      student_id: regStudentId.trim() || null,
      college: regCollege.trim() || null,
    });

    if (error) {
      setRegResult({ ok: false, msg: error.message.includes("duplicate") ? "你已经报名过了" : "报名失败，请稍后重试" });
    } else {
      setRegResult({ ok: true, msg: "报名成功！" });
    }
    setRegLoading(false);
  };

  const filtered = filter === "all" ? events : events.filter(e => e.scope === filter);
  const upcoming = filtered.filter(e => new Date(e.event_date) >= new Date());
  const past = filtered.filter(e => new Date(e.event_date) < new Date());

  const formatDate = (d: string) => {
    const date = new Date(d);
    return date.toLocaleDateString("zh-CN", { month: "long", day: "numeric", weekday: "short" });
  };

  // Event detail + registration
  if (selectedEvent) {
    const isPast = new Date(selectedEvent.event_date) < new Date();
    const deadlinePassed = selectedEvent.registration_deadline && new Date(selectedEvent.registration_deadline) < new Date();

    return (
      <Layout>
        <div className="relative bg-primary py-16 text-primary-foreground">
          <div className="container mx-auto px-4">
            <button onClick={() => { setSelectedEvent(null); setRegResult(null); }} className="mb-3 flex items-center gap-1 text-sm opacity-70 hover:opacity-100">
              ← 返回列表
            </button>
            <div className="flex items-center gap-2">
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${selectedEvent.scope === "internal" ? "bg-white/20" : "bg-accent/80 text-accent-foreground"}`}>
                {selectedEvent.scope === "internal" ? "社内活动" : "全校活动"}
              </span>
              {selectedEvent.category && <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px]">{selectedEvent.category}</span>}
            </div>
            <h1 className="mt-2 font-serif text-2xl font-bold md:text-3xl">{selectedEvent.title}</h1>
          </div>
        </div>

        <section className="py-8 md:py-12">
          <div className="container mx-auto max-w-2xl space-y-6 px-4">
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <div className="grid gap-3 text-sm">
                <div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-primary" /> {formatDate(selectedEvent.event_date)}</div>
                {selectedEvent.location && <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> {selectedEvent.location}</div>}
                {selectedEvent.max_participants && <div className="flex items-center gap-2"><Users className="h-4 w-4 text-primary" /> 限{selectedEvent.max_participants}人</div>}
                {selectedEvent.registration_deadline && <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-primary" /> 报名截止: {formatDate(selectedEvent.registration_deadline)}</div>}
              </div>
              {selectedEvent.description && (
                <div className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">{selectedEvent.description}</div>
              )}
            </div>

            {/* Registration */}
            {!isPast && !deadlinePassed && selectedEvent.scope === "public" && (
              <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                <h3 className="mb-4 font-serif text-base font-bold">活动报名</h3>
                {regResult ? (
                  <div className={`rounded-lg p-4 text-center text-sm ${regResult.ok ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"}`}>
                    {regResult.msg}
                    {regResult.ok && <p className="mt-1 text-xs text-muted-foreground">活动当天请准时参加</p>}
                  </div>
                ) : (
                  <form onSubmit={handleRegister} className="space-y-3">
                    <input required value={regName} onChange={e => setRegName(e.target.value)}
                      className="w-full rounded-md border border-border bg-secondary/30 px-3 py-2 text-sm focus:border-primary focus:outline-none" placeholder="姓名 *" />
                    <input required value={regPhone} onChange={e => setRegPhone(e.target.value)} pattern="[0-9]{11}"
                      className="w-full rounded-md border border-border bg-secondary/30 px-3 py-2 text-sm focus:border-primary focus:outline-none" placeholder="手机号 *" />
                    <input value={regStudentId} onChange={e => setRegStudentId(e.target.value)}
                      className="w-full rounded-md border border-border bg-secondary/30 px-3 py-2 text-sm focus:border-primary focus:outline-none" placeholder="学号（选填）" />
                    <input value={regCollege} onChange={e => setRegCollege(e.target.value)}
                      className="w-full rounded-md border border-border bg-secondary/30 px-3 py-2 text-sm focus:border-primary focus:outline-none" placeholder="学院（选填）" />
                    <button type="submit" disabled={regLoading}
                      className="w-full rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50">
                      {regLoading ? "提交中..." : "立即报名"}
                    </button>
                  </form>
                )}
              </div>
            )}
            {isPast && <p className="text-center text-sm text-muted-foreground">该活动已结束</p>}
            {deadlinePassed && !isPast && <p className="text-center text-sm text-muted-foreground">报名已截止</p>}
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="relative bg-primary py-16 text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-serif text-3xl font-bold tracking-widest md:text-4xl">活动中心</h1>
          <p className="mt-3 text-sm text-primary-foreground/70">精彩活动，等你参与</p>
          <div className="gold-divider mx-auto mt-4" />
        </div>
      </div>

      <section className="py-8 md:py-12">
        <div className="container mx-auto max-w-3xl px-4">
          <div className="mb-6 flex gap-1.5">
            {([["all", "全部"], ["public", "全校活动"], ["internal", "社内活动"]] as const).map(([key, label]) => (
              <button key={key} onClick={() => setFilter(key)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition ${filter === key ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-secondary/80"}`}>
                {label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : (
            <>
              {upcoming.length > 0 && (
                <div className="mb-8">
                  <h2 className="mb-3 font-serif text-sm font-bold text-muted-foreground">即将举行</h2>
                  <div className="space-y-2">
                    {upcoming.map(event => (
                      <button key={event.id} onClick={() => setSelectedEvent(event)}
                        className="flex w-full items-center gap-4 rounded-xl border border-border bg-card p-4 text-left shadow-sm transition hover:border-primary/30">
                        <div className="flex flex-col items-center rounded-lg bg-primary/10 px-3 py-2 text-center">
                          <span className="text-lg font-bold text-primary">{new Date(event.event_date).getDate()}</span>
                          <span className="text-[10px] text-primary">{new Date(event.event_date).toLocaleDateString("zh-CN", { month: "short" })}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-serif text-sm font-bold truncate">{event.title}</span>
                            <span className={`rounded-full px-1.5 py-0.5 text-[9px] ${event.scope === "internal" ? "bg-muted text-muted-foreground" : "bg-accent/20 text-accent-foreground"}`}>
                              {event.scope === "internal" ? "社内" : "全校"}
                            </span>
                          </div>
                          <div className="mt-1 flex items-center gap-2 text-[10px] text-muted-foreground">
                            {event.location && <span className="flex items-center gap-0.5"><MapPin className="h-3 w-3" />{event.location}</span>}
                            {event.category && <span className="flex items-center gap-0.5"><Tag className="h-3 w-3" />{event.category}</span>}
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {past.length > 0 && (
                <div>
                  <h2 className="mb-3 font-serif text-sm font-bold text-muted-foreground">往期活动</h2>
                  <div className="space-y-2">
                    {past.map(event => (
                      <button key={event.id} onClick={() => setSelectedEvent(event)}
                        className="flex w-full items-center gap-4 rounded-xl border border-border bg-card p-4 text-left opacity-70 shadow-sm transition hover:opacity-100">
                        <div className="flex flex-col items-center rounded-lg bg-muted px-3 py-2 text-center">
                          <span className="text-lg font-bold text-muted-foreground">{new Date(event.event_date).getDate()}</span>
                          <span className="text-[10px] text-muted-foreground">{new Date(event.event_date).toLocaleDateString("zh-CN", { month: "short" })}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="font-serif text-sm font-bold truncate">{event.title}</span>
                          <div className="mt-1 flex items-center gap-2 text-[10px] text-muted-foreground">
                            {event.location && <span>{event.location}</span>}
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {upcoming.length === 0 && past.length === 0 && (
                <p className="py-12 text-center text-sm text-muted-foreground">暂无活动</p>
              )}
            </>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Events;
