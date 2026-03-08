import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Users, Calendar, ClipboardList, TrendingUp, Crown, Shield, UserCheck, Wallet, BookOpen, UserPlus } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid } from "recharts";

interface Stats {
  totalEvents: number;
  activeEvents: number;
  totalRegistrations: number;
  totalMembers: number;
  adminCount: number;
  ministerCount: number;
  memberCount: number;
  totalSubmissions: number;
  pendingSubmissions: number;
  totalIncome: number;
  totalExpense: number;
  pendingRecruitment: number;
  recentRegistrations: { name: string; event_title: string; created_at: string }[];
  monthlyRegistrations: { month: string; count: number }[];
  financeByMonth: { month: string; income: number; expense: number }[];
}

const COLORS = ["hsl(0, 72%, 32%)", "hsl(42, 80%, 50%)", "hsl(210, 60%, 50%)"];

const AdminDashboard = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const [eventsRes, activeRes, regsRes, rolesRes, recentRes, subsRes, pendingSubsRes, financeRes, recruitRes] = await Promise.all([
        supabase.from("events").select("id", { count: "exact", head: true }),
        supabase.from("events").select("id", { count: "exact", head: true }).eq("is_active", true),
        supabase.from("event_registrations").select("id, created_at, event_id", { count: "exact" }),
        supabase.from("user_roles").select("role"),
        supabase.from("event_registrations").select("name, created_at, event_id").order("created_at", { ascending: false }).limit(5),
        supabase.from("submissions").select("id", { count: "exact", head: true }),
        supabase.from("submissions").select("id", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("finances").select("type, amount, transaction_date"),
        supabase.from("recruitment_applications").select("id", { count: "exact", head: true }).eq("status", "pending"),
      ]);

      const roles = rolesRes.data || [];
      const adminCount = roles.filter(r => r.role === "admin").length;
      const ministerCount = roles.filter(r => r.role === "minister").length;
      const memberCount = roles.filter(r => r.role === "member").length;

      // Recent registrations with event titles
      let recentRegistrations: Stats["recentRegistrations"] = [];
      if (recentRes.data && recentRes.data.length > 0) {
        const eventIds = [...new Set(recentRes.data.map(r => r.event_id))];
        const { data: events } = await supabase.from("events").select("id, title").in("id", eventIds);
        const eventMap = new Map(events?.map(e => [e.id, e.title]) || []);
        recentRegistrations = recentRes.data.map(r => ({
          name: r.name, event_title: eventMap.get(r.event_id) || "未知", created_at: r.created_at,
        }));
      }

      // Monthly registration stats
      const regData = regsRes.data || [];
      const monthMap = new Map<string, number>();
      regData.forEach(r => {
        const m = new Date(r.created_at).toLocaleDateString("zh-CN", { year: "numeric", month: "short" });
        monthMap.set(m, (monthMap.get(m) || 0) + 1);
      });
      const monthlyRegistrations = Array.from(monthMap.entries()).slice(-6).map(([month, count]) => ({ month, count }));

      // Finance by month
      const finData = (financeRes.data as { type: string; amount: number; transaction_date: string }[]) || [];
      const finMonthMap = new Map<string, { income: number; expense: number }>();
      finData.forEach(f => {
        const m = new Date(f.transaction_date).toLocaleDateString("zh-CN", { year: "numeric", month: "short" });
        const cur = finMonthMap.get(m) || { income: 0, expense: 0 };
        if (f.type === "income") cur.income += Number(f.amount);
        else cur.expense += Number(f.amount);
        finMonthMap.set(m, cur);
      });
      const financeByMonth = Array.from(finMonthMap.entries()).slice(-6).map(([month, data]) => ({ month, ...data }));

      const totalIncome = finData.filter(f => f.type === "income").reduce((s, f) => s + Number(f.amount), 0);
      const totalExpense = finData.filter(f => f.type === "expense").reduce((s, f) => s + Number(f.amount), 0);

      setStats({
        totalEvents: eventsRes.count || 0,
        activeEvents: activeRes.count || 0,
        totalRegistrations: regsRes.count || 0,
        totalMembers: roles.length,
        adminCount, ministerCount, memberCount,
        totalSubmissions: subsRes.count || 0,
        pendingSubmissions: pendingSubsRes.count || 0,
        totalIncome, totalExpense,
        pendingRecruitment: recruitRes.count || 0,
        recentRegistrations, monthlyRegistrations, financeByMonth,
      });
      setLoading(false);
    };
    fetchStats();
  }, []);

  if (loading || !stats) {
    return <div className="flex justify-center py-20"><p className="text-muted-foreground animate-pulse">加载数据中...</p></div>;
  }

  const cards = [
    { icon: Calendar, label: "活动总数", value: stats.totalEvents, sub: `${stats.activeEvents} 进行中`, color: "text-primary", bg: "bg-primary/10" },
    { icon: ClipboardList, label: "报名总数", value: stats.totalRegistrations, color: "text-blue-600", bg: "bg-blue-50" },
    { icon: Users, label: "社员总数", value: stats.totalMembers, color: "text-green-600", bg: "bg-green-50" },
    { icon: BookOpen, label: "作品投稿", value: stats.totalSubmissions, sub: `${stats.pendingSubmissions} 待审`, color: "text-purple-600", bg: "bg-purple-50" },
    { icon: Wallet, label: "财务结余", value: `¥${(stats.totalIncome - stats.totalExpense).toFixed(0)}`, color: "text-accent-foreground", bg: "bg-accent/20" },
    { icon: UserPlus, label: "待审招新", value: stats.pendingRecruitment, color: "text-amber-600", bg: "bg-amber-50" },
  ];

  const pieData = [
    { name: "管理员", value: stats.adminCount },
    { name: "部长", value: stats.ministerCount },
    { name: "社员", value: stats.memberCount },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {cards.map((card) => (
          <div key={card.label} className="rounded-xl border border-border bg-card p-4 transition-shadow hover:shadow-md">
            <div className={`mb-2 inline-flex rounded-lg p-2 ${card.bg}`}>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </div>
            <p className="text-xl font-bold font-serif">{card.value}</p>
            <p className="text-[11px] text-muted-foreground">{card.label}</p>
            {card.sub && <p className="text-[10px] text-primary">{card.sub}</p>}
          </div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Registration Trend */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="mb-4 font-serif text-sm font-bold">📊 报名趋势</h3>
          {stats.monthlyRegistrations.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={stats.monthlyRegistrations}>
                <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ fontSize: 12 }} />
                <Bar dataKey="count" name="报名数" fill="hsl(0, 72%, 32%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="py-10 text-center text-xs text-muted-foreground">暂无数据</p>}
        </div>

        {/* Finance Trend */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="mb-4 font-serif text-sm font-bold">💰 收支趋势</h3>
          {stats.financeByMonth.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={stats.financeByMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(38, 20%, 85%)" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="income" name="收入" stroke="hsl(142, 60%, 40%)" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="expense" name="支出" stroke="hsl(0, 84%, 60%)" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : <p className="py-10 text-center text-xs text-muted-foreground">暂无数据</p>}
        </div>

        {/* Role Distribution */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="mb-4 font-serif text-sm font-bold">👥 角色分布</h3>
          {pieData.length > 0 ? (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="50%" height={150}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={35} outerRadius={55} dataKey="value">
                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2">
                {[
                  { icon: Crown, label: "管理员", count: stats.adminCount, color: "text-primary" },
                  { icon: Shield, label: "部长", count: stats.ministerCount, color: "text-amber-600" },
                  { icon: UserCheck, label: "社员", count: stats.memberCount, color: "text-blue-600" },
                ].map(r => (
                  <div key={r.label} className="flex items-center gap-2">
                    <r.icon className={`h-3.5 w-3.5 ${r.color}`} />
                    <span className="text-xs">{r.label}</span>
                    <span className="font-bold text-xs">{r.count}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : <p className="py-10 text-center text-xs text-muted-foreground">暂无数据</p>}
        </div>
      </div>

      {/* Recent Registrations */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="mb-4 font-serif text-sm font-bold">🆕 最近报名</h3>
        {stats.recentRegistrations.length === 0 ? (
          <p className="py-6 text-center text-xs text-muted-foreground">暂无报名记录</p>
        ) : (
          <div className="space-y-2">
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
  );
};

export default AdminDashboard;
