import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Download } from "lucide-react";

interface Registration {
  id: string;
  name: string;
  student_id: string | null;
  college: string | null;
  phone: string;
  email: string | null;
  notes: string | null;
  created_at: string;
}

interface Props {
  eventId: string;
  eventTitle: string;
  onBack: () => void;
}

const RegistrationView = ({ eventId, eventTitle, onBack }: Props) => {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("event_registrations")
        .select("*")
        .eq("event_id", eventId)
        .order("created_at", { ascending: false });
      setRegistrations(data || []);
      setLoading(false);
    };
    fetch();
  }, [eventId]);

  const exportCSV = () => {
    if (registrations.length === 0) return;
    const headers = ["姓名", "学号", "学院", "手机", "邮箱", "备注", "报名时间"];
    const rows = registrations.map(r => [
      r.name,
      r.student_id || "",
      r.college || "",
      r.phone,
      r.email || "",
      r.notes || "",
      new Date(r.created_at).toLocaleString("zh-CN"),
    ]);
    const csv = "\uFEFF" + [headers, ...rows].map(row => row.map(c => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${eventTitle}_报名记录.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="rounded-lg p-2 transition hover:bg-secondary">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h2 className="font-serif text-base font-bold">{eventTitle}</h2>
            <p className="text-xs text-muted-foreground">共 {registrations.length} 人报名</p>
          </div>
        </div>
        {registrations.length > 0 && (
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium transition hover:bg-secondary"
          >
            <Download className="h-3.5 w-3.5" /> 导出 CSV
          </button>
        )}
      </div>

      {loading ? (
        <p className="py-10 text-center text-sm text-muted-foreground animate-pulse">加载中...</p>
      ) : registrations.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">暂无报名记录</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full min-w-[650px] text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="px-4 py-3 text-left text-xs font-semibold">#</th>
                <th className="px-4 py-3 text-left text-xs font-semibold">姓名</th>
                <th className="px-4 py-3 text-left text-xs font-semibold">学号</th>
                <th className="px-4 py-3 text-left text-xs font-semibold">学院</th>
                <th className="px-4 py-3 text-left text-xs font-semibold">手机</th>
                <th className="px-4 py-3 text-left text-xs font-semibold">邮箱</th>
                <th className="px-4 py-3 text-left text-xs font-semibold">报名时间</th>
              </tr>
            </thead>
            <tbody>
              {registrations.map((r, i) => (
                <tr key={r.id} className="border-b border-border/50 transition hover:bg-secondary/30">
                  <td className="px-4 py-2.5 text-xs text-muted-foreground">{i + 1}</td>
                  <td className="px-4 py-2.5 font-medium">{r.name}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{r.student_id || "-"}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{r.college || "-"}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{r.phone}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{r.email || "-"}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{new Date(r.created_at).toLocaleString("zh-CN")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default RegistrationView;
