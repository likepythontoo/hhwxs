import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { QrCode, Users, Download, ArrowLeft, Copy, Check } from "lucide-react";

interface EventWithCode {
  id: string;
  title: string;
  event_date: string;
  check_in_code: string | null;
  is_active: boolean | null;
}

interface CheckInRecord {
  id: string;
  user_name: string;
  student_id: string | null;
  checked_in_at: string;
}

const CheckInManagement = () => {
  const [events, setEvents] = useState<EventWithCode[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<EventWithCode | null>(null);
  const [records, setRecords] = useState<CheckInRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const fetchEvents = async () => {
    const { data } = await supabase.from("events").select("id, title, event_date, check_in_code, is_active").order("event_date", { ascending: false }) as any;
    setEvents(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchEvents(); }, []);

  const fetchRecords = async (eventId: string) => {
    const { data } = await supabase.from("check_ins" as any).select("id, user_name, student_id, checked_in_at").eq("event_id", eventId).order("checked_in_at", { ascending: false }) as any;
    setRecords(data || []);
  };

  const generateCode = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  };

  const setCheckInCode = async (eventId: string) => {
    const code = generateCode();
    await supabase.from("events").update({ check_in_code: code } as any).eq("id", eventId);
    fetchEvents();
  };

  const viewEvent = (ev: EventWithCode) => {
    setSelectedEvent(ev);
    fetchRecords(ev.id);
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const exportRecords = () => {
    if (!selectedEvent || records.length === 0) return;
    const headers = ["姓名", "学号", "签到时间"];
    const rows = records.map(r => [r.user_name, r.student_id || "", new Date(r.checked_in_at).toLocaleString("zh-CN")]);
    const csv = "\uFEFF" + [headers, ...rows].map(row => row.map(c => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `${selectedEvent.title}_签到记录.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <p className="py-10 text-center text-sm text-muted-foreground animate-pulse">加载中...</p>;

  if (selectedEvent) {
    return (
      <div>
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setSelectedEvent(null)} className="rounded-lg p-2 transition hover:bg-secondary"><ArrowLeft className="h-4 w-4" /></button>
            <div>
              <h2 className="font-serif text-base font-bold">{selectedEvent.title}</h2>
              <p className="text-xs text-muted-foreground">签到记录 · {records.length} 人已签到</p>
            </div>
          </div>
          <div className="flex gap-2">
            {selectedEvent.check_in_code && (
              <div className="flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-4 py-2">
                <QrCode className="h-4 w-4 text-primary" />
                <span className="font-mono text-lg font-bold tracking-widest text-primary">{selectedEvent.check_in_code}</span>
                <button onClick={() => copyCode(selectedEvent.check_in_code!)} className="rounded p-1 transition hover:bg-primary/10">
                  {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4 text-muted-foreground" />}
                </button>
              </div>
            )}
            {records.length > 0 && (
              <button onClick={exportRecords} className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs transition hover:bg-secondary">
                <Download className="h-3.5 w-3.5" /> 导出
              </button>
            )}
          </div>
        </div>

        <div className="space-y-2">
          {records.map((r, i) => (
            <div key={r.id} className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-2.5">
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-6">{i + 1}</span>
                <div>
                  <p className="text-xs font-medium">{r.user_name}</p>
                  {r.student_id && <p className="text-[10px] text-muted-foreground">{r.student_id}</p>}
                </div>
              </div>
              <span className="text-[11px] text-muted-foreground">{new Date(r.checked_in_at).toLocaleString("zh-CN")}</span>
            </div>
          ))}
          {records.length === 0 && <p className="py-10 text-center text-sm text-muted-foreground">暂无签到记录</p>}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-5">
        <h2 className="font-serif text-base font-bold">签到管理</h2>
        <p className="mt-1 text-xs text-muted-foreground">为活动生成签到码，社员输入签到码完成签到</p>
      </div>

      <div className="space-y-3">
        {events.map(ev => (
          <div key={ev.id} className="group flex items-center justify-between rounded-xl border border-border bg-card p-4 transition-shadow hover:shadow-md">
            <div className="flex-1 cursor-pointer" onClick={() => viewEvent(ev)}>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold">{ev.title}</h3>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${ev.is_active ? "bg-green-50 text-green-700" : "bg-muted text-muted-foreground"}`}>
                  {ev.is_active ? "进行中" : "已结束"}
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">📅 {new Date(ev.event_date).toLocaleDateString("zh-CN")}</p>
            </div>
            <div className="flex items-center gap-2">
              {ev.check_in_code ? (
                <div className="flex items-center gap-2">
                  <span className="rounded-lg bg-primary/10 px-3 py-1 font-mono text-sm font-bold tracking-widest text-primary">{ev.check_in_code}</span>
                  <button onClick={() => copyCode(ev.check_in_code!)} className="rounded p-1 hover:bg-secondary">
                    {copied ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5 text-muted-foreground" />}
                  </button>
                </div>
              ) : (
                <button onClick={() => setCheckInCode(ev.id)} className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground">
                  <QrCode className="h-3.5 w-3.5" /> 生成签到码
                </button>
              )}
            </div>
          </div>
        ))}
        {events.length === 0 && <p className="py-10 text-center text-sm text-muted-foreground">暂无活动</p>}
      </div>
    </div>
  );
};

export default CheckInManagement;
