import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Pencil, Trash2, LogOut, Users, Calendar, Eye } from "lucide-react";

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

interface Registration {
  id: string;
  name: string;
  student_id: string | null;
  college: string | null;
  phone: string;
  email: string | null;
  created_at: string;
}

const Admin = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<Event[]>([]);
  const [tab, setTab] = useState<"events" | "registrations">("events");
  const [editingEvent, setEditingEvent] = useState<Partial<Event> | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/auth"); return; }

      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .eq("role", "admin");

      if (!data || data.length === 0) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }
      setIsAdmin(true);
      setLoading(false);
      fetchEvents();
    };
    checkAdmin();
  }, [navigate]);

  const fetchEvents = async () => {
    const { data } = await supabase
      .from("events")
      .select("*")
      .order("event_date", { ascending: false });
    setEvents(data || []);
  };

  const fetchRegistrations = async (eventId: string) => {
    setSelectedEventId(eventId);
    const { data } = await supabase
      .from("event_registrations")
      .select("*")
      .eq("event_id", eventId)
      .order("created_at", { ascending: false });
    setRegistrations(data || []);
    setTab("registrations");
  };

  const saveEvent = async () => {
    if (!editingEvent?.title || !editingEvent?.event_date) return;
    setSaving(true);

    if (editingEvent.id) {
      await supabase.from("events").update({
        title: editingEvent.title,
        description: editingEvent.description,
        event_date: editingEvent.event_date,
        location: editingEvent.location,
        category: editingEvent.category,
        max_participants: editingEvent.max_participants,
        registration_deadline: editingEvent.registration_deadline,
        is_active: editingEvent.is_active,
      }).eq("id", editingEvent.id);
    } else {
      await supabase.from("events").insert({
        title: editingEvent.title,
        description: editingEvent.description || null,
        event_date: editingEvent.event_date,
        location: editingEvent.location || null,
        category: editingEvent.category || "文学活动",
        max_participants: editingEvent.max_participants || null,
        registration_deadline: editingEvent.registration_deadline || null,
        is_active: editingEvent.is_active ?? true,
      });
    }

    setSaving(false);
    setEditingEvent(null);
    fetchEvents();
  };

  const deleteEvent = async (id: string) => {
    if (!confirm("确定删除此活动？")) return;
    await supabase.from("events").delete().eq("id", id);
    fetchEvents();
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex min-h-[50vh] items-center justify-center">
          <p className="text-muted-foreground">加载中...</p>
        </div>
      </Layout>
    );
  }

  if (!isAdmin) {
    return (
      <Layout>
        <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
          <p className="font-serif text-lg text-muted-foreground">⚠️ 你没有管理员权限</p>
          <p className="text-sm text-muted-foreground">请联系社长获取管理员权限</p>
          <button onClick={() => navigate("/")} className="rounded bg-primary px-4 py-2 text-sm text-primary-foreground">返回首页</button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="relative bg-primary py-10 text-primary-foreground">
        <div className="container mx-auto flex items-center justify-between px-4">
          <div>
            <h1 className="font-serif text-2xl font-bold tracking-widest">管理后台</h1>
            <p className="mt-1 text-sm opacity-70">活动管理 · 报名查看</p>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-1.5 rounded border border-primary-foreground/30 px-3 py-1.5 text-xs transition hover:bg-primary-foreground/10">
            <LogOut className="h-3.5 w-3.5" /> 退出
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-secondary py-3">
        <div className="container mx-auto flex gap-2 px-4">
          <button onClick={() => setTab("events")} className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-medium ${tab === "events" ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground"}`}>
            <Calendar className="h-3.5 w-3.5" /> 活动管理
          </button>
          <button onClick={() => setTab("registrations")} className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-medium ${tab === "registrations" ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground"}`}>
            <Users className="h-3.5 w-3.5" /> 报名记录
          </button>
        </div>
      </div>

      <section className="py-8">
        <div className="container mx-auto px-4">
          {tab === "events" && (
            <>
              <div className="mb-5 flex items-center justify-between">
                <h2 className="font-serif text-base font-bold">所有活动</h2>
                <button
                  onClick={() => setEditingEvent({ is_active: true, category: "文学活动" })}
                  className="flex items-center gap-1.5 rounded bg-primary px-4 py-2 text-xs font-medium text-primary-foreground"
                >
                  <Plus className="h-3.5 w-3.5" /> 新增活动
                </button>
              </div>

              <div className="space-y-3">
                {events.map((ev) => (
                  <div key={ev.id} className="flex items-center justify-between rounded-lg border border-border bg-card p-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-serif text-sm font-bold">{ev.title}</h3>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] ${ev.is_active ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                          {ev.is_active ? "进行中" : "已关闭"}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {new Date(ev.event_date).toLocaleDateString("zh-CN")} · {ev.location} · {ev.category}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => fetchRegistrations(ev.id)} className="rounded p-2 text-muted-foreground transition hover:bg-secondary" title="查看报名">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button onClick={() => setEditingEvent(ev)} className="rounded p-2 text-muted-foreground transition hover:bg-secondary" title="编辑">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button onClick={() => deleteEvent(ev.id)} className="rounded p-2 text-destructive/60 transition hover:bg-destructive/10" title="删除">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
                {events.length === 0 && <p className="py-10 text-center text-sm text-muted-foreground">暂无活动</p>}
              </div>
            </>
          )}

          {tab === "registrations" && (
            <>
              <div className="mb-5 flex items-center justify-between">
                <h2 className="font-serif text-base font-bold">
                  报名记录 {selectedEventId && `(${registrations.length} 人)`}
                </h2>
                <button onClick={() => setTab("events")} className="text-xs text-primary hover:underline">← 返回活动列表</button>
              </div>

              {!selectedEventId ? (
                <p className="py-10 text-center text-sm text-muted-foreground">请先在活动列表中点击 👁 查看报名</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[600px] text-sm">
                    <thead>
                      <tr className="border-b-2 border-primary/20">
                        <th className="px-3 py-2 text-left text-xs font-semibold">姓名</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold">学号</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold">学院</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold">手机</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold">邮箱</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold">报名时间</th>
                      </tr>
                    </thead>
                    <tbody>
                      {registrations.map((r) => (
                        <tr key={r.id} className="border-b border-border/50">
                          <td className="px-3 py-2 font-medium">{r.name}</td>
                          <td className="px-3 py-2 text-muted-foreground">{r.student_id || "-"}</td>
                          <td className="px-3 py-2 text-muted-foreground">{r.college || "-"}</td>
                          <td className="px-3 py-2 text-muted-foreground">{r.phone}</td>
                          <td className="px-3 py-2 text-muted-foreground">{r.email || "-"}</td>
                          <td className="px-3 py-2 text-muted-foreground">{new Date(r.created_at).toLocaleString("zh-CN")}</td>
                        </tr>
                      ))}
                      {registrations.length === 0 && (
                        <tr><td colSpan={6} className="py-8 text-center text-muted-foreground">暂无报名记录</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Edit/Create Dialog */}
      {editingEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4" onClick={() => setEditingEvent(null)}>
          <div className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-xl bg-card p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="mb-4 font-serif text-base font-bold">{editingEvent.id ? "编辑活动" : "新增活动"}</h3>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">活动名称 *</label>
                <input type="text" value={editingEvent.title || ""} onChange={(e) => setEditingEvent({ ...editingEvent, title: e.target.value })}
                  className="w-full rounded-md border border-border bg-secondary/30 px-3 py-2 text-sm focus:border-primary focus:outline-none" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">活动描述</label>
                <textarea value={editingEvent.description || ""} onChange={(e) => setEditingEvent({ ...editingEvent, description: e.target.value })}
                  className="w-full rounded-md border border-border bg-secondary/30 px-3 py-2 text-sm focus:border-primary focus:outline-none" rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">活动日期 *</label>
                  <input type="datetime-local" value={editingEvent.event_date ? editingEvent.event_date.slice(0, 16) : ""}
                    onChange={(e) => setEditingEvent({ ...editingEvent, event_date: e.target.value })}
                    className="w-full rounded-md border border-border bg-secondary/30 px-3 py-2 text-sm focus:border-primary focus:outline-none" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">报名截止</label>
                  <input type="datetime-local" value={editingEvent.registration_deadline ? editingEvent.registration_deadline.slice(0, 16) : ""}
                    onChange={(e) => setEditingEvent({ ...editingEvent, registration_deadline: e.target.value || null })}
                    className="w-full rounded-md border border-border bg-secondary/30 px-3 py-2 text-sm focus:border-primary focus:outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">地点</label>
                  <input type="text" value={editingEvent.location || ""} onChange={(e) => setEditingEvent({ ...editingEvent, location: e.target.value })}
                    className="w-full rounded-md border border-border bg-secondary/30 px-3 py-2 text-sm focus:border-primary focus:outline-none" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">类别</label>
                  <input type="text" value={editingEvent.category || ""} onChange={(e) => setEditingEvent({ ...editingEvent, category: e.target.value })}
                    className="w-full rounded-md border border-border bg-secondary/30 px-3 py-2 text-sm focus:border-primary focus:outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">人数上限</label>
                  <input type="number" value={editingEvent.max_participants || ""} onChange={(e) => setEditingEvent({ ...editingEvent, max_participants: e.target.value ? Number(e.target.value) : null })}
                    className="w-full rounded-md border border-border bg-secondary/30 px-3 py-2 text-sm focus:border-primary focus:outline-none" />
                </div>
                <div className="flex items-end gap-2 pb-1">
                  <label className="flex items-center gap-2 text-xs">
                    <input type="checkbox" checked={editingEvent.is_active ?? true} onChange={(e) => setEditingEvent({ ...editingEvent, is_active: e.target.checked })} />
                    活动开放中
                  </label>
                </div>
              </div>
            </div>
            <div className="mt-5 flex gap-2">
              <button onClick={() => setEditingEvent(null)} className="flex-1 rounded-md border border-border py-2 text-sm text-muted-foreground">取消</button>
              <button onClick={saveEvent} disabled={saving} className="flex-1 rounded-md bg-primary py-2 text-sm font-medium text-primary-foreground disabled:opacity-50">
                {saving ? "保存中..." : "保存"}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Admin;
