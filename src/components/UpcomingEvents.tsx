import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CalendarDays, MapPin, Users, Clock, ChevronRight, X, CheckCircle, ChevronLeft } from "lucide-react";
import { z } from "zod";
import { Link } from "react-router-dom";

interface Event {
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

const registrationSchema = z.object({
  name: z.string().trim().min(2, "姓名至少2个字").max(20, "姓名不超过20个字"),
  student_id: z.string().trim().max(20, "学号不超过20位").optional(),
  college: z.string().trim().max(50, "学院名称不超过50字").optional(),
  phone: z.string().trim().regex(/^1[3-9]\d{9}$/, "请输入正确的手机号"),
  email: z.string().trim().email("请输入正确的邮箱").max(100).optional().or(z.literal("")),
  notes: z.string().trim().max(200, "备注不超过200字").optional(),
});

const UpcomingEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [formData, setFormData] = useState({ name: "", student_id: "", college: "", phone: "", email: "", notes: "" });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      const { data } = await supabase
        .from("events")
        .select("*")
        .eq("is_active", true)
        .gte("event_date", new Date().toISOString())
        .order("event_date", { ascending: true })
        .limit(8);
      setEvents(data || []);
      setLoading(false);
    };
    fetchEvents();
  }, []);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  };

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (el) {
      el.addEventListener("scroll", checkScroll, { passive: true });
      window.addEventListener("resize", checkScroll);
      return () => {
        el.removeEventListener("scroll", checkScroll);
        window.removeEventListener("resize", checkScroll);
      };
    }
  }, [events]);

  const scroll = (dir: "left" | "right") => {
    scrollRef.current?.scrollBy({ left: dir === "left" ? -300 : 300, behavior: "smooth" });
  };

  const handleSubmit = async () => {
    const result = registrationSchema.safeParse(formData);
    if (!result.success) {
      const errs: Record<string, string> = {};
      result.error.errors.forEach((e) => { errs[e.path[0] as string] = e.message; });
      setFormErrors(errs);
      return;
    }
    setFormErrors({});
    setSubmitting(true);
    const { error } = await supabase.from("event_registrations").insert({
      event_id: selectedEvent!.id,
      name: result.data.name,
      student_id: result.data.student_id || null,
      college: result.data.college || null,
      phone: result.data.phone,
      email: result.data.email || null,
      notes: result.data.notes || null,
    });
    setSubmitting(false);
    if (error) {
      if (error.message.includes("row-level security")) {
        setFormErrors({ phone: "该手机号已报名此活动" });
      } else {
        setFormErrors({ phone: "提交失败，请稍后重试" });
      }
      return;
    }
    setSubmitted(true);
  };

  if (loading || events.length === 0) return null;

  return (
    <>
      <div className="mb-10 rounded-xl border-2 border-primary/20 bg-card p-4 sm:p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-serif text-lg font-bold text-primary">
            <Clock className="h-5 w-5" />
            近期活动
          </h2>
          <Link to="/events" className="flex items-center gap-1 text-xs text-primary hover:underline">
            查看全部 <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Horizontal scroll container */}
        <div className="relative">
          {/* Left fade + arrow */}
          {canScrollLeft && (
            <>
              <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-8 bg-gradient-to-r from-card to-transparent" />
              <button onClick={() => scroll("left")} className="absolute left-1 top-1/2 z-20 -translate-y-1/2 hidden sm:flex h-7 w-7 items-center justify-center rounded-full bg-card border border-border shadow-sm hover:bg-secondary transition-colors">
                <ChevronLeft className="h-4 w-4 text-foreground" />
              </button>
            </>
          )}
          {/* Right fade + arrow */}
          {canScrollRight && (
            <>
              <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-8 bg-gradient-to-l from-card to-transparent" />
              <button onClick={() => scroll("right")} className="absolute right-1 top-1/2 z-20 -translate-y-1/2 hidden sm:flex h-7 w-7 items-center justify-center rounded-full bg-card border border-border shadow-sm hover:bg-secondary transition-colors">
                <ChevronRight className="h-4 w-4 text-foreground" />
              </button>
            </>
          )}

          <div
            ref={scrollRef}
            className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin"
            style={{ scrollbarWidth: "thin", scrollbarColor: "hsl(var(--border)) transparent" }}
          >
            {events.map((event) => (
              <CompactEventCard key={event.id} event={event} onRegister={() => { setSelectedEvent(event); setSubmitted(false); setFormData({ name: "", student_id: "", college: "", phone: "", email: "", notes: "" }); setFormErrors({}); }} />
            ))}
          </div>
        </div>
      </div>

      {/* Registration Dialog */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4 animate-fade-in" onClick={() => setSelectedEvent(null)}>
          <div className="relative max-h-[85vh] w-full max-w-md overflow-y-auto rounded-xl border-2 border-primary/20 bg-card p-6 shadow-2xl animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setSelectedEvent(null)} className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-secondary transition-colors hover:bg-primary/10">
              <X className="h-4 w-4" />
            </button>

            {submitted ? (
              <div className="py-8 text-center">
                <CheckCircle className="mx-auto mb-4 h-12 w-12 text-primary" />
                <h3 className="mb-2 font-serif text-lg font-bold">报名成功！</h3>
                <p className="text-sm text-muted-foreground">我们已收到您的报名信息，活动详情将通过短信或邮件通知。</p>
                <button onClick={() => setSelectedEvent(null)} className="mt-6 rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground">关闭</button>
              </div>
            ) : (
              <>
                <h3 className="mb-1 pr-8 font-serif text-base font-bold">{selectedEvent.title}</h3>
                <p className="mb-4 text-xs text-muted-foreground">{selectedEvent.event_date && new Date(selectedEvent.event_date).toLocaleDateString("zh-CN")} · {selectedEvent.location}</p>

                <div className="space-y-3">
                  <FormField label="姓名 *" value={formData.name} error={formErrors.name} onChange={(v) => setFormData({ ...formData, name: v })} />
                  <FormField label="学号" value={formData.student_id} error={formErrors.student_id} onChange={(v) => setFormData({ ...formData, student_id: v })} />
                  <FormField label="学院" value={formData.college} error={formErrors.college} onChange={(v) => setFormData({ ...formData, college: v })} />
                  <FormField label="手机号 *" value={formData.phone} error={formErrors.phone} onChange={(v) => setFormData({ ...formData, phone: v })} />
                  <FormField label="邮箱" value={formData.email} error={formErrors.email} onChange={(v) => setFormData({ ...formData, email: v })} />
                  <div>
                    <label className="mb-1 block text-xs font-medium text-muted-foreground">备注</label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className="w-full rounded-md border border-border bg-secondary/30 px-3 py-2 text-sm focus:border-primary focus:outline-none"
                      rows={2}
                      maxLength={200}
                    />
                  </div>
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="mt-5 w-full rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                >
                  {submitting ? "提交中..." : "确认报名"}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

const FormField = ({ label, value, error, onChange }: { label: string; value: string; error?: string; onChange: (v: string) => void }) => (
  <div>
    <label className="mb-1 block text-xs font-medium text-muted-foreground">{label}</label>
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none ${error ? "border-destructive bg-destructive/5" : "border-border bg-secondary/30 focus:border-primary"}`}
    />
    {error && <p className="mt-0.5 text-[11px] text-destructive">{error}</p>}
  </div>
);

const Countdown = ({ targetDate }: { targetDate: string }) => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0 });

  useEffect(() => {
    const calc = () => {
      const diff = new Date(targetDate).getTime() - Date.now();
      if (diff <= 0) return { days: 0, hours: 0, mins: 0 };
      return {
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        mins: Math.floor((diff % 3600000) / 60000),
      };
    };
    setTimeLeft(calc());
    const timer = setInterval(() => setTimeLeft(calc()), 60000);
    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <div className="flex gap-1">
      <span className="rounded bg-primary/10 px-1 py-0.5 text-[10px] font-bold text-primary">{timeLeft.days}天</span>
      <span className="rounded bg-primary/10 px-1 py-0.5 text-[10px] font-bold text-primary">{timeLeft.hours}时</span>
      <span className="rounded bg-primary/10 px-1 py-0.5 text-[10px] font-bold text-primary">{timeLeft.mins}分</span>
    </div>
  );
};

const CompactEventCard = ({ event, onRegister }: { event: Event; onRegister: () => void }) => {
  const eventDate = new Date(event.event_date);
  const isPast = eventDate.getTime() < Date.now();
  const deadlinePassed = event.registration_deadline && new Date(event.registration_deadline).getTime() < Date.now();

  return (
    <div className="flex w-[260px] min-w-[260px] flex-col rounded-lg border border-border bg-secondary/20 p-4 transition-shadow hover:shadow-md">
      {/* Category + countdown */}
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="truncate rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
          {event.category}
        </span>
        {!isPast && <Countdown targetDate={event.event_date} />}
      </div>

      {/* Title */}
      <h3 className="mb-2 font-serif text-sm font-bold leading-snug line-clamp-2">{event.title}</h3>

      {/* Meta */}
      <div className="mb-3 space-y-1 text-[11px] text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <CalendarDays className="h-3 w-3 shrink-0" />
          <span className="truncate">{eventDate.toLocaleDateString("zh-CN")} {eventDate.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}</span>
        </div>
        {event.location && (
          <div className="flex items-center gap-1.5">
            <MapPin className="h-3 w-3 shrink-0" />
            <span className="truncate">{event.location}</span>
          </div>
        )}
        {event.max_participants && (
          <div className="flex items-center gap-1.5">
            <Users className="h-3 w-3 shrink-0" />
            限{event.max_participants}人
          </div>
        )}
      </div>

      {/* Register button */}
      <button
        onClick={onRegister}
        disabled={isPast || !!deadlinePassed}
        className="mt-auto flex items-center justify-center gap-1 rounded-md bg-primary py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {isPast ? "活动已结束" : deadlinePassed ? "报名已截止" : "立即报名"}
        {!isPast && !deadlinePassed && <ChevronRight className="h-3.5 w-3.5" />}
      </button>
    </div>
  );
};

export default UpcomingEvents;
