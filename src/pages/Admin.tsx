import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { LogOut, LayoutDashboard, Calendar, Users, Shield, Newspaper, BookOpen, Wallet, Settings } from "lucide-react";
import AdminDashboard from "@/components/admin/AdminDashboard";
import EventManagement from "@/components/admin/EventManagement";
import MemberManagement from "@/components/admin/MemberManagement";
import NewsManagement from "@/components/admin/NewsManagement";
import SubmissionsManagement from "@/components/admin/SubmissionsManagement";
import FinanceManagement from "@/components/admin/FinanceManagement";
import SiteSettings from "@/components/admin/SiteSettings";

type Tab = "dashboard" | "events" | "members" | "news" | "submissions" | "finance" | "settings";

const tabs: { key: Tab; label: string; icon: typeof LayoutDashboard; section?: string }[] = [
  { key: "dashboard", label: "数据总览", icon: LayoutDashboard, section: "概览" },
  { key: "events", label: "活动管理", icon: Calendar, section: "内容" },
  { key: "news", label: "新闻公告", icon: Newspaper },
  { key: "submissions", label: "作品投稿", icon: BookOpen },
  { key: "members", label: "成员管理", icon: Users, section: "组织" },
  { key: "finance", label: "财务管理", icon: Wallet },
  { key: "settings", label: "系统设置", icon: Settings, section: "系统" },
];

const Admin = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("dashboard");
  const [displayName, setDisplayName] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/auth"); return; }
      const [roleRes, profileRes] = await Promise.all([
        supabase.from("user_roles").select("role").eq("user_id", session.user.id).eq("role", "admin"),
        supabase.from("profiles").select("display_name").eq("user_id", session.user.id).single(),
      ]);
      if (!roleRes.data || roleRes.data.length === 0) { setIsAdmin(false); setLoading(false); return; }
      setIsAdmin(true);
      setDisplayName(profileRes.data?.display_name || session.user.email || "");
      setLoading(false);
    };
    checkAdmin();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex min-h-[50vh] items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="text-sm text-muted-foreground">加载中...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!isAdmin) {
    return (
      <Layout>
        <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
          <div className="rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
            <p className="font-serif text-lg">⚠️ 你没有管理员权限</p>
            <p className="mt-2 text-sm text-muted-foreground">请联系社长获取管理员权限</p>
            <button onClick={() => navigate("/")} className="mt-4 rounded-lg bg-primary px-6 py-2 text-sm text-primary-foreground">返回首页</button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className={`sticky top-0 flex h-screen flex-col border-r border-border bg-card transition-all ${sidebarOpen ? "w-56" : "w-14"}`}>
        {/* Header */}
        <div className="flex items-center gap-2 border-b border-border px-3 py-4">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="rounded-lg p-1.5 transition hover:bg-secondary">
            <LayoutDashboard className="h-5 w-5 text-primary" />
          </button>
          {sidebarOpen && <span className="font-serif text-sm font-bold tracking-wide">管理后台</span>}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-2">
          {tabs.map((t, i) => (
            <div key={t.key}>
              {t.section && sidebarOpen && (
                <p className={`px-4 pb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground ${i > 0 ? "pt-4" : "pt-2"}`}>{t.section}</p>
              )}
              <button
                onClick={() => setTab(t.key)}
                className={`flex w-full items-center gap-2.5 px-3 py-2 text-xs font-medium transition ${
                  tab === t.key ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
                title={t.label}
              >
                <t.icon className={`h-4 w-4 flex-shrink-0 ${tab === t.key ? "text-primary" : ""}`} />
                {sidebarOpen && <span>{t.label}</span>}
              </button>
            </div>
          ))}
        </nav>

        {/* User */}
        <div className="border-t border-border p-3">
          {sidebarOpen ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  {(displayName || "?")[0]}
                </div>
                <div>
                  <p className="text-xs font-medium leading-tight">{displayName}</p>
                  <p className="text-[10px] text-primary">管理员</p>
                </div>
              </div>
              <button onClick={handleLogout} className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-secondary hover:text-foreground" title="退出">
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <button onClick={handleLogout} className="mx-auto block rounded-lg p-1.5 text-muted-foreground transition hover:bg-secondary" title="退出">
              <LogOut className="h-4 w-4" />
            </button>
          )}
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        {/* Top bar */}
        <header className="sticky top-0 z-10 border-b border-border bg-card/80 px-6 py-3 backdrop-blur-sm">
          <h1 className="font-serif text-lg font-bold">
            {tabs.find(t => t.key === tab)?.label}
          </h1>
        </header>

        <div className="p-6">
          {tab === "dashboard" && <AdminDashboard />}
          {tab === "events" && <EventManagement />}
          {tab === "members" && <MemberManagement />}
          {tab === "news" && <NewsManagement />}
          {tab === "submissions" && <SubmissionsManagement />}
          {tab === "finance" && <FinanceManagement />}
          {tab === "settings" && <SiteSettings />}
        </div>
      </main>
    </div>
  );
};

export default Admin;
