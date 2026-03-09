import { useState } from "react";
import Layout from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { QrCode, CheckCircle, AlertCircle } from "lucide-react";

const CheckIn = () => {
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResult(null);
    setLoading(true);

    // Validate check-in code via secure RPC (never exposes codes to client)
    const { data: eventData } = await supabase
      .rpc("validate_checkin_code", { p_code: code.trim() });

    const event = eventData && eventData.length > 0 ? eventData[0] : null;

    if (!event) {
      setResult({ success: false, message: "签到码无效或活动已结束" });
      setLoading(false);
      return;
    }

    // Check duplicate
    const { data: existing } = await supabase
      .from("check_ins")
      .select("id")
      .eq("event_id", event.id)
      .eq("user_name", name.trim());

    if (existing && existing.length > 0) {
      setResult({ success: false, message: "你已经签到过此活动了" });
      setLoading(false);
      return;
    }

    // Get current user if logged in
    const { data: { session } } = await supabase.auth.getSession();

    const { error } = await supabase.from("check_ins").insert({
      event_id: event.id,
      user_name: name.trim(),
      student_id: studentId.trim() || null,
      user_id: session?.user?.id || null,
    });

    if (error) {
      setResult({ success: false, message: "签到失败，请稍后重试" });
    } else {
      setResult({ success: true, message: `已成功签到「${event.title}」` });
    }
    setLoading(false);
  };

  return (
    <Layout>
      <div className="relative bg-primary py-16 text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-serif text-3xl font-bold tracking-widest md:text-4xl">活动签到</h1>
          <p className="mt-3 text-sm text-primary-foreground/70">输入签到码完成活动签到</p>
          <div className="gold-divider mx-auto mt-4" />
        </div>
      </div>

      <section className="py-10 md:py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-sm">
            {result ? (
              <div className="flex flex-col items-center gap-4 rounded-xl border border-border bg-card p-8 text-center shadow-sm">
                <div className={`flex h-14 w-14 items-center justify-center rounded-full ${result.success ? "bg-primary/10" : "bg-destructive/10"}`}>
                  {result.success ? (
                    <CheckCircle className="h-7 w-7 text-primary" />
                  ) : (
                    <AlertCircle className="h-7 w-7 text-destructive" />
                  )}
                </div>
                <p className={`font-serif text-lg font-bold ${result.success ? "text-foreground" : "text-destructive"}`}>
                  {result.success ? "签到成功！" : "签到失败"}
                </p>
                <p className="text-sm text-muted-foreground">{result.message}</p>
                <button
                  onClick={() => { setResult(null); setCode(""); }}
                  className="mt-2 rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
                >
                  {result.success ? "再次签到" : "重试"}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-border bg-card p-6 shadow-sm">
                <div className="flex items-center gap-2 text-primary">
                  <QrCode className="h-5 w-5" />
                  <h2 className="font-serif text-base font-bold">输入签到信息</h2>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">签到码 <span className="text-destructive">*</span></label>
                  <input
                    type="text" required value={code}
                    onChange={e => setCode(e.target.value.toUpperCase())}
                    className="w-full rounded-md border border-border bg-secondary/30 px-3 py-2.5 text-center font-mono text-lg tracking-[0.3em] focus:border-primary focus:outline-none"
                    placeholder="6位签到码"
                    maxLength={6}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">姓名 <span className="text-destructive">*</span></label>
                  <input
                    type="text" required value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full rounded-md border border-border bg-secondary/30 px-3 py-2 text-sm focus:border-primary focus:outline-none"
                    placeholder="你的真实姓名"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">学号</label>
                  <input
                    type="text" value={studentId}
                    onChange={e => setStudentId(e.target.value)}
                    className="w-full rounded-md border border-border bg-secondary/30 px-3 py-2 text-sm focus:border-primary focus:outline-none"
                    placeholder="选填"
                  />
                </div>

                <button
                  type="submit" disabled={loading}
                  className="w-full rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
                >
                  {loading ? "签到中..." : "确认签到"}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default CheckIn;
