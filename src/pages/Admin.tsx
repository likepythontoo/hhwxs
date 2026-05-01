import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { LogOut, LayoutDashboard, Calendar, Users, Newspaper, BookOpen, Wallet, Settings, UserPlus, ScrollText, Download, MessageSquare, Building2, ClipboardCheck, Star, Library, UsersRound, UserCheck, Menu, X, Crown, Image as ImageIcon, UserPlus2, FileText, Link2, Info, Mail, Home, ExternalLink } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";
import AdminDashboard from "@/components/admin/AdminDashboard";
import EventManagement from "@/components/admin/EventManagement";
import MemberManagement from "@/components/admin/MemberManagement";
import NewsManagement from "@/components/admin/NewsManagement";
import SubmissionsManagement from "@/components/admin/SubmissionsManagement";
import FinanceManagement from "@/components/admin/FinanceManagement";
import SiteSettings from "@/components/admin/SiteSettings";
import RecruitmentManagement from "@/components/admin/RecruitmentManagement";
import AuditLogViewer from "@/components/admin/AuditLogViewer";
import ExportCenter from "@/components/admin/ExportCenter";
import ForumManagement from "@/components/admin/ForumManagement";
import DepartmentManagement from "@/components/admin/DepartmentManagement";
import CheckInManagement from "@/components/admin/CheckInManagement";
import JournalManagement from "@/components/admin/JournalManagement";
import MemberDirectoryManagement from "@/components/admin/MemberDirectoryManagement";
import ClaimManagement from "@/components/admin/ClaimManagement";
import LeadershipManagement from "@/components/admin/LeadershipManagement";
import HeroSlidesManagement from "@/components/admin/HeroSlidesManagement";
import RegistrationRequestManagement from "@/components/admin/RegistrationRequestManagement";
import DocumentManagement from "@/components/admin/DocumentManagement";
import QuickLinksManagement from "@/components/admin/QuickLinksManagement";
import AboutContentManagement from "@/components/admin/AboutContentManagement";
import MessageManagement from "@/components/admin/MessageManagement";
import { useIsMobile } from "@/hooks/use-mobile";
import { motion, AnimatePresence } from "framer-motion";

type AppRole = Database["public"]["Enums"]["app_role"];
type Tab = "dashboard" | "events" | "news" | "submissions" | "journals" | "forum" | "messages" | "members" | "member_directory" | "claims" | "registration_requests" | "departments" | "recruitment" | "finance" | "checkin" | "export" | "audit" | "leadership" | "hero_slides" | "documents" | "quick_links" | "about_content" | "settings";

interface TabConfig {
  key: Tab;
  label: string;
  icon: typeof LayoutDashboard;
  section?: string;
  roles: AppRole[];
}

const tabs: TabConfig[] = [
  { key: "dashboard", label: "数据总览", icon: LayoutDashboard, section: "概览", roles: ["admin", "president", "minister"] },
  { key: "events", label: "活动管理", icon: Calendar, section: "内容管理", roles: ["admin", "president", "minister"] },
  { key: "news", label: "新闻公告", icon: Newspaper, roles: ["admin", "president", "minister"] },
  { key: "submissions", label: "作品投稿", icon: BookOpen, roles: ["admin", "president", "minister"] },
  { key: "forum", label: "论坛管理", icon: MessageSquare, roles: ["admin", "president", "minister"] },
  { key: "messages", label: "留言管理", icon: Mail, roles: ["admin", "president", "minister"] },
  { key: "journals", label: "期刊管理", icon: Library, roles: ["admin", "president", "minister"] },
  { key: "checkin", label: "签到管理", icon: ClipboardCheck, roles: ["admin", "president", "minister"] },
  { key: "members", label: "成员管理", icon: Users, section: "组织管理", roles: ["admin", "president", "minister"] },
  { key: "member_directory", label: "成员风采", icon: UsersRound, roles: ["admin", "president"] },
  { key: "claims", label: "认领审核", icon: UserCheck, roles: ["admin", "president"] },
  { key: "registration_requests", label: "校友登记申请", icon: UserPlus2, roles: ["admin", "president"] },
  { key: "departments", label: "部门管理", icon: Building2, roles: ["admin", "president"] },
  { key: "recruitment", label: "招新审批", icon: UserPlus, roles: ["admin", "president", "minister"] },
  { key: "finance", label: "财务管理", icon: Wallet, section: "运营", roles: ["admin", "president"] },
  { key: "export", label: "数据导出", icon: Download, roles: ["admin", "president"] },
  { key: "audit", label: "操作日志", icon: ScrollText, roles: ["admin", "president"] },
  { key: "hero_slides", label: "首页轮播", icon: ImageIcon, section: "网站内容", roles: ["admin", "president"] },
  { key: "quick_links", label: "快捷入口", icon: Link2, roles: ["admin", "president"] },
  { key: "documents", label: "文件中心", icon: FileText, roles: ["admin", "president"] },
  { key: "about_content", label: "社团概况", icon: Info, roles: ["admin", "president"] },
  { key: "leadership", label: "历届团队", icon: Crown, roles: ["admin", "president"] },
  { key: "settings", label: "系统设置", icon: Settings, section: "系统", roles: ["admin", "president"] },
];

const roleLabels: Record<AppRole, string> = {
  admin: "管理员",
  president: "社长",
  minister: "部长",
  member: "社员",
};

const Admin = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [userRole, setUserRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("dashboard");
  const [displayName, setDisplayName] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userDeptId, setUserDeptId] = useState<string | undefined>();
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const checkAccess = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/auth"); return; }

      const [roleRes, profileRes, deptRes] = await Promise.all([
        supabase.from("user_roles").select("role").eq("user_id", session.user.id),
        supabase.from("profiles").select("display_name").eq("user_id", session.user.id).single(),
        supabase.from("department_members" as any).select("department_id, is_head").eq("user_id", session.user.id) as any,
      ]);

      const roles = roleRes.data?.map(r => r.role) || [];
      const accessRoles: AppRole[] = ["admin", "president", "minister"];
      const foundRole = accessRoles.find(r => roles.includes(r));

      if (!foundRole) { setUserRole(null); setLoading(false); return; }

      setUserRole(foundRole);
      setDisplayName(profileRes.data?.display_name || session.user.email || "");

      const headDept = (deptRes.data || []).find((d: any) => d.is_head);
      if (headDept) setUserDeptId(headDept.department_id);

      setLoading(false);
    };
    checkAccess();
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

  if (!userRole) {
    return (
      <Layout>
        <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
          <div className="rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
            <p className="font-serif text-lg">⚠️ 你没有管理权限</p>
            <p className="mt-2 text-sm text-muted-foreground">请联系社长或管理员获取权限</p>
            <button onClick={() => navigate("/")} className="mt-4 rounded-lg bg-primary px-6 py-2 text-sm text-primary-foreground">返回首页</button>
          </div>
        </div>
      </Layout>
    );
  }

  const visibleTabs = tabs.filter(t => t.roles.includes(userRole));

  const renderContent = () => (
    <>
      {tab === "dashboard" && <AdminDashboard />}
      {tab === "events" && <EventManagement />}
      {tab === "members" && <MemberManagement currentUserRole={userRole} currentUserDeptId={userDeptId} />}
      {tab === "member_directory" && <MemberDirectoryManagement />}
      {tab === "claims" && <ClaimManagement />}
      {tab === "registration_requests" && <RegistrationRequestManagement />}
      {tab === "departments" && <DepartmentManagement />}
      {tab === "news" && <NewsManagement />}
      {tab === "submissions" && <SubmissionsManagement />}
      {tab === "finance" && <FinanceManagement />}
      {tab === "recruitment" && <RecruitmentManagement currentUserRole={userRole} currentUserDeptId={userDeptId} />}
      {tab === "forum" && <ForumManagement />}
      {tab === "messages" && <MessageManagement />}
      {tab === "journals" && <JournalManagement />}
      {tab === "checkin" && <CheckInManagement />}
      {tab === "export" && <ExportCenter />}
      {tab === "audit" && <AuditLogViewer />}
      {tab === "hero_slides" && <HeroSlidesManagement />}
      {tab === "quick_links" && <QuickLinksManagement />}
      {tab === "documents" && <DocumentManagement />}
      {tab === "about_content" && <AboutContentManagement />}
      {tab === "leadership" && <LeadershipManagement />}
      {tab === "settings" && <SiteSettings />}
    </>
  );

  // Group tabs by section for drawer
  const groupedTabs = visibleTabs.reduce<{ section: string; items: TabConfig[] }[]>((acc, t) => {
    if (t.section) {
      acc.push({ section: t.section, items: [t] });
    } else if (acc.length > 0) {
      acc[acc.length - 1].items.push(t);
    }
    return acc;
  }, []);

  if (isMobile) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        {/* Mobile top bar */}
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-card px-4">
          <button
            onClick={() => setDrawerOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-foreground active:bg-secondary"
          >
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="font-serif text-sm font-bold truncate max-w-[200px]">
            {visibleTabs.find(t => t.key === tab)?.label}
          </h1>
          <div className="flex items-center gap-1">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground active:bg-secondary"
              title="新窗口查看前台"
            >
              <Home className="h-5 w-5" />
            </a>
            <button
              onClick={handleLogout}
              className="flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground active:bg-secondary"
              title="退出"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </header>

        {/* Drawer overlay + menu */}
        <AnimatePresence>
          {drawerOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-40 bg-black/50"
                onClick={() => setDrawerOpen(false)}
              />
              <motion.aside
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="fixed inset-y-0 left-0 z-50 w-72 bg-card border-r border-border shadow-xl overflow-y-auto"
              >
                {/* Drawer header */}
                <div className="flex items-center justify-between border-b border-border px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                      {(displayName || "?")[0]}
                    </div>
                    <div>
                      <p className="text-sm font-medium leading-tight truncate max-w-[140px]">{displayName}</p>
                      <p className="text-xs text-primary">{roleLabels[userRole]}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setDrawerOpen(false)}
                    className="flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground active:bg-secondary"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Quick link to frontend */}
                <a
                  href="/"
                  onClick={() => setDrawerOpen(false)}
                  className="flex items-center gap-3 border-b border-border px-4 py-3 text-sm font-medium text-primary hover:bg-primary/5"
                >
                  <Home className="h-5 w-5" />
                  <span>返回前台首页</span>
                </a>

                {/* Drawer nav */}
                <nav className="py-2">
                  {groupedTabs.map((group, gi) => (
                    <div key={group.section}>
                      <p className="px-4 pt-4 pb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                        {group.section}
                      </p>
                      {group.items.map((t, ti) => (
                        <motion.button
                          key={t.key}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: gi * 0.05 + ti * 0.03, duration: 0.2 }}
                          onClick={() => { setTab(t.key); setDrawerOpen(false); }}
                          className={`flex w-full items-center gap-3 px-4 py-3 text-sm font-medium transition ${
                            tab === t.key
                              ? "bg-primary/10 text-primary"
                              : "text-muted-foreground active:bg-secondary"
                          }`}
                        >
                          <t.icon className={`h-5 w-5 flex-shrink-0 ${tab === t.key ? "text-primary" : ""}`} />
                          <span>{t.label}</span>
                        </motion.button>
                      ))}
                    </div>
                  ))}
                </nav>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-4">
          {renderContent()}
        </main>
      </div>
    );
  }

  // Desktop layout (unchanged)
  return (
    <div className="flex min-h-screen bg-background">
      <aside className={`sticky top-0 flex h-screen flex-col border-r border-border bg-card transition-all ${sidebarOpen ? "w-52" : "w-14"}`}>
        <div className="flex items-center gap-2 border-b border-border px-3 py-3.5">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="rounded-lg p-1.5 transition hover:bg-secondary">
            <LayoutDashboard className="h-5 w-5 text-primary" />
          </button>
          {sidebarOpen && <span className="font-serif text-sm font-bold tracking-wide">管理后台</span>}
        </div>

        <nav className="flex-1 overflow-y-auto py-1">
          {visibleTabs.map((t, i) => (
            <div key={t.key}>
              {t.section && sidebarOpen && (
                <p className={`px-4 pb-0.5 text-[9px] font-semibold uppercase tracking-widest text-muted-foreground ${i > 0 ? "pt-3" : "pt-2"}`}>{t.section}</p>
              )}
              <button
                onClick={() => setTab(t.key)}
                className={`flex w-full items-center gap-2 px-3 py-1.5 text-[11px] font-medium transition ${
                  tab === t.key ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
                title={t.label}
              >
                <t.icon className={`h-3.5 w-3.5 flex-shrink-0 ${tab === t.key ? "text-primary" : ""}`} />
                {sidebarOpen && <span>{t.label}</span>}
              </button>
            </div>
          ))}
        </nav>

        <div className="border-t border-border p-2.5">
          {sidebarOpen ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  {(displayName || "?")[0]}
                </div>
                <div>
                  <p className="text-[11px] font-medium leading-tight truncate max-w-[90px]">{displayName}</p>
                  <p className="text-[9px] text-primary">{roleLabels[userRole]}</p>
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

      <main className="flex-1 overflow-y-auto">
        <header className="sticky top-0 z-10 border-b border-border bg-card/80 px-6 py-3 backdrop-blur-sm">
          <h1 className="font-serif text-lg font-bold">{visibleTabs.find(t => t.key === tab)?.label}</h1>
        </header>
        <div className="p-6">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default Admin;
