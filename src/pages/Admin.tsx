import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { LogOut, LayoutDashboard, Calendar, Users } from "lucide-react";
import AdminDashboard from "@/components/admin/AdminDashboard";
import EventManagement from "@/components/admin/EventManagement";
import MemberManagement from "@/components/admin/MemberManagement";

type Tab = "dashboard" | "events" | "members";

const tabs: { key: Tab; label: string; icon: typeof LayoutDashboard }[] = [
  { key: "dashboard", label: "数据总览", icon: LayoutDashboard },
  { key: "events", label: "活动管理", icon: Calendar },
  { key: "members", label: "成员管理", icon: Users },
];

const Admin = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("dashboard");
  const [displayName, setDisplayName] = useState("");

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/auth"); return; }

      const [roleRes, profileRes] = await Promise.all([
        supabase.from("user_roles").select("role").eq("user_id", session.user.id).eq("role", "admin"),
        supabase.from("profiles").select("display_name").eq("user_id", session.user.id).single(),
      ]);

      if (!roleRes.data || roleRes.data.length === 0) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }
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
    <Layout>
      {/* Header */}
      <div className="relative bg-primary py-8 text-primary-foreground">
        <div className="container mx-auto flex items-center justify-between px-4">
          <div>
            <h1 className="font-serif text-2xl font-bold tracking-widest">管理后台</h1>
            <p className="mt-1 text-sm opacity-70">欢迎回来，{displayName}</p>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-1.5 rounded-lg border border-primary-foreground/30 px-3 py-1.5 text-xs transition hover:bg-primary-foreground/10">
            <LogOut className="h-3.5 w-3.5" /> 退出
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto flex gap-1 px-4">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 border-b-2 px-4 py-3 text-xs font-medium transition ${
                tab === t.key
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <t.icon className="h-3.5 w-3.5" /> {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <section className="py-6">
        <div className="container mx-auto px-4">
          {tab === "dashboard" && <AdminDashboard />}
          {tab === "events" && <EventManagement />}
          {tab === "members" && <MemberManagement />}
        </div>
      </section>
    </Layout>
  );
};

export default Admin;
