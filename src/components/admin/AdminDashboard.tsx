import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Users, Calendar, ClipboardList, TrendingUp, Crown, Shield, UserCheck } from "lucide-react";

interface Stats {
  totalEvents: number;
  activeEvents: number;
  totalRegistrations: number;
  totalMembers: number;
  adminCount: number;
  ministerCount: number;
  memberCount: number;
  recentRegistrations: { name: string; event_title: string; created_at: string }[];
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<Stats>({
    totalEvents: 0, activeEvents: 0, totalRegistrations: 0,
    totalMembers: 0, adminCount: 0, ministerCount: 0, memberCount: 0,
    recentRegistrations: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const [eventsRes, activeRes, regsRes, rolesRes, recentRes] = await Promise.all([
        supabase.from("events").select("id", { count: "exact", head: true }),
        supabase.from("events").select("id", { count: "exact", head: true }).eq("is_active", true),
        supabase.from("event_registrations").select("id", { count: "exact", head: true }),
        supabase.from("user_roles").select("role"),
        supabase.from("event_registrations").select("name, created_at, event_id").order("created_at", { ascending: false }).limit(5),
      ]);

      const roles = rolesRes.data || [];
      const adminCount = roles.filter(r => r.role === "admin").length;
      const ministerCount = roles.filter(r => r.role === "minister").length;
      const memberCount = roles.filter(r => r.role === "member").length;

      // Get event titles for recent registrations
      let recentRegistrations: Stats["recentRegistrations"] = [];
      if (recentRes.data && recentRes.data.length > 0) {
        const eventIds = [...new Set(recentRes.data.map(r => r.event_id))];
        const { data: events } = await supabase.from("events").select("id, title").in("id", eventIds);
        const eventMap = new Map(events?.map(e => [e.id, e.title]) || []);
        recentRegistrations = recentRes.data.map(r => ({
          name: r.name,
          event_title: eventMap.get(r.event_id) || "未知活动",
          created_at: r.created_at,
        }));
      }

      setStats({
        totalEvents: eventsRes.count || 0,
        activeEvents: activeRes.count || 0,
        totalRegistrations: regsRes.count || 0,
        totalMembers: roles.length,
        adminCount, ministerCount, memberCount,
        recentRegistrations,
      });
      setLoading(false);
    };
    fetchStats();
  }, []);

  if (loading) {
    return <div className="flex justify-center py-20"><p className="text-muted-foreground animate-pulse">加载数据中...</p></div>;
  }

  const cards = [
    { icon: Calendar, label: "活动总数", value: stats.totalEvents, color: "text-primary", bg: "bg-primary/10" },
    { icon: TrendingUp, label: "进行中", value: stats.activeEvents, color: "text-green-600", bg: "bg-green-50" },
    { icon: ClipboardList, label: "报名总数", value: stats.totalRegistrations, color: "text-accent-foreground", bg: "bg-accent/20" },
    { icon: Users, label: "社员总数", value: stats.totalMembers, color: "text-blue-600", bg: "bg-blue-50" },
  ];

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="rounded-xl border border-border bg-card p-5 transition-shadow hover:shadow-md">
            <div className={`mb-3 inline-flex rounded-lg p-2.5 ${card.bg}`}>
              <card.icon className={`h-5 w-5 ${card.color}`} />
            </div>
            <p className="text-2xl font-bold font-serif">{card.value}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Role Distribution + Recent */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Role breakdown */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="mb-4 font-serif text-sm font-bold">角色分布</h3>
          <div className="space-y-3">
            {[
              { icon: Crown, label: "管理员", count: stats.adminCount, color: "text-primary", bar: "bg-primary" },
              { icon: Shield, label: "部长", count: stats.ministerCount, color: "text-amber-600", bar: "bg-amber-500" },
              { icon: UserCheck, label: "社员", count: stats.memberCount, color: "text-blue-600", bar: "bg-blue-500" },
            ].map((role) => (
              <div key={role.label} className="flex items-center gap-3">
                <role.icon className={`h-4 w-4 ${role.color}`} />
                <span className="w-12 text-xs font-medium">{role.label}</span>
                <div className="flex-1 rounded-full bg-secondary h-2">
                  <div
                    className={`h-2 rounded-full ${role.bar} transition-all`}
                    style={{ width: `${stats.totalMembers > 0 ? (role.count / stats.totalMembers) * 100 : 0}%`, minWidth: role.count > 0 ? "8px" : "0" }}
                  />
                </div>
                <span className="w-6 text-right text-xs font-bold">{role.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent registrations */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="mb-4 font-serif text-sm font-bold">最近报名</h3>
          {stats.recentRegistrations.length === 0 ? (
            <p className="py-6 text-center text-xs text-muted-foreground">暂无报名记录</p>
          ) : (
            <div className="space-y-2.5">
              {stats.recentRegistrations.map((r, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg bg-secondary/50 px-3 py-2">
                  <div>
                    <p className="text-xs font-medium">{r.name}</p>
                    <p className="text-[10px] text-muted-foreground">{r.event_title}</p>
                  </div>
                  <p className="text-[10px] text-muted-foreground">{new Date(r.created_at).toLocaleDateString("zh-CN")}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
