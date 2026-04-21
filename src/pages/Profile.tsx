import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import {
  User, Building2, BookOpen, CalendarCheck, LogOut, Edit2, Save, Quote,
  PenTool, MessageSquare, Library, Users, Mail, Calendar, MapPin, Clock,
  Award, TrendingUp, ChevronRight
} from "lucide-react";
import { motion } from "framer-motion";

const quickActions = [
  { icon: PenTool, label: "投稿作品", path: "/submit", color: "hsl(var(--primary))" },
  { icon: CalendarCheck, label: "活动签到", path: "/checkin", color: "hsl(var(--primary))" },
  { icon: MessageSquare, label: "社员论坛", path: "/forum", color: "hsl(var(--primary))" },
  { icon: Library, label: "文学期刊", path: "/journals", color: "hsl(var(--primary))" },
  { icon: Users, label: "历届成员", path: "/members", color: "hsl(var(--primary))" },
  { icon: Mail, label: "联系我们", path: "/contact", color: "hsl(var(--primary))" },
];

const roleLabels: Record<string, string> = {
  admin: "管理员", president: "社长", minister: "部长", member: "社员",
};

const statusLabels: Record<string, { label: string; cls: string }> = {
  pending: { label: "待审核", cls: "bg-muted text-muted-foreground" },
  approved: { label: "已通过", cls: "bg-primary/10 text-primary" },
  rejected: { label: "未通过", cls: "bg-destructive/10 text-destructive" },
};

const AnimatedNumber = ({ value }: { value: number }) => {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (value === 0) return;
    let start = 0;
    const step = Math.max(1, Math.floor(value / 30));
    const timer = setInterval(() => {
      start += step;
      if (start >= value) { setDisplay(value); clearInterval(timer); }
      else setDisplay(start);
    }, 30);
    return () => clearInterval(timer);
  }, [value]);
  return <span>{display}</span>;
};

const Profile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [checkIns, setCheckIns] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [memberRecord, setMemberRecord] = useState<any>(null);
  const [memberBio, setMemberBio] = useState("");
  const [editingBio, setEditingBio] = useState(false);
  const [events, setEvents] = useState<any[]>([]);
  const [forumPosts, setForumPosts] = useState<any[]>([]);
  const [registrationRequest, setRegistrationRequest] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/auth"); return; }

      const uid = session.user.id;

      const [profileRes, roleRes, deptRes, checkInRes, subRes, memberRes, eventsRes, postsRes, regReqRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("user_id", uid).single(),
        supabase.from("user_roles").select("role").eq("user_id", uid),
        supabase.from("department_members").select("department_id, is_head, departments(name)").eq("user_id", uid),
        supabase.from("check_ins").select("id, user_name, checked_in_at, events(title)").eq("user_id", uid).order("checked_in_at", { ascending: false }).limit(20),
        supabase.from("submissions").select("id, title, genre, status, created_at").eq("author_id", uid).order("created_at", { ascending: false }).limit(20),
        supabase.from("members").select("*").eq("user_id", uid).limit(1),
        supabase.from("events").select("id, title, event_date, location").gte("event_date", new Date().toISOString()).order("event_date", { ascending: true }).limit(3),
        supabase.from("forum_posts").select("id, title, created_at, view_count").eq("author_id", uid).order("created_at", { ascending: false }).limit(5),
        supabase.from("member_registration_requests" as any).select("*").eq("user_id", uid).order("created_at", { ascending: false }).limit(1),
      ]);

      setProfile(profileRes.data);
      setDisplayName(profileRes.data?.display_name || "");
      setStudentId(profileRes.data?.student_id || "");
      setRoles((roleRes.data || []).map((r: any) => r.role));
      setDepartments(deptRes.data || []);
      setCheckIns(checkInRes.data || []);
      setSubmissions(subRes.data || []);
      const mr = memberRes.data?.[0] || null;
      setMemberRecord(mr);
      setMemberBio(mr?.bio || "");
      setEvents(eventsRes.data || []);
      setForumPosts(postsRes.data || []);
      setRegistrationRequest((regReqRes.data as any)?.[0] || null);
      setLoading(false);
    };
    load();
  }, [navigate]);

  const handleSave = async () => {
    if (!profile) return;
    await supabase.from("profiles").update({
      display_name: displayName,
      student_id: studentId || null,
    }).eq("user_id", profile.user_id);
    setProfile({ ...profile, display_name: displayName, student_id: studentId });
    setEditing(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const approvedCount = submissions.filter(s => s.status === "approved").length;
  const daysSinceJoin = profile?.created_at
    ? Math.floor((Date.now() - new Date(profile.created_at).getTime()) / 86400000)
    : 0;

  if (loading) {
    return (
      <Layout>
        <div className="flex min-h-[50vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Hero */}
      <div className="relative overflow-hidden bg-primary py-12 md:py-16 text-primary-foreground">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 30% 50%, hsl(var(--primary-foreground)) 1px, transparent 1px)", backgroundSize: "30px 30px" }} />
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col items-center gap-4 md:flex-row md:gap-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-primary-foreground/30 bg-primary-foreground/10 text-3xl font-bold font-serif">
              {(profile?.display_name || "?")[0]}
            </div>
            <div className="text-center md:text-left">
              <div className="flex items-center gap-3 justify-center md:justify-start">
                <h1 className="font-serif text-2xl md:text-3xl font-bold">{profile?.display_name || "用户"}</h1>
                {editing ? (
                  <button onClick={handleSave} className="rounded-lg p-1.5 bg-primary-foreground/20 hover:bg-primary-foreground/30 transition" title="保存">
                    <Save className="h-4 w-4" />
                  </button>
                ) : (
                  <button onClick={() => setEditing(true)} className="rounded-lg p-1.5 bg-primary-foreground/10 hover:bg-primary-foreground/20 transition" title="编辑">
                    <Edit2 className="h-4 w-4" />
                  </button>
                )}
                <button onClick={handleLogout} className="rounded-lg p-1.5 bg-primary-foreground/10 hover:bg-primary-foreground/20 transition" title="退出登录">
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
              {editing && (
                <div className="mt-2 flex gap-2 flex-wrap justify-center md:justify-start">
                  <input value={displayName} onChange={e => setDisplayName(e.target.value)}
                    className="rounded-md border border-primary-foreground/30 bg-primary-foreground/10 px-2 py-1 text-sm text-primary-foreground placeholder:text-primary-foreground/50 focus:outline-none" placeholder="昵称" />
                  <input value={studentId} onChange={e => setStudentId(e.target.value)}
                    className="rounded-md border border-primary-foreground/30 bg-primary-foreground/10 px-2 py-1 text-sm text-primary-foreground placeholder:text-primary-foreground/50 focus:outline-none" placeholder="学号（选填）" />
                </div>
              )}
              {profile?.student_id && !editing && <p className="text-sm opacity-70 mt-1">学号: {profile.student_id}</p>}
              <div className="mt-2 flex flex-wrap gap-1.5 justify-center md:justify-start">
                {roles.map(r => (
                  <span key={r} className="rounded-full bg-primary-foreground/15 px-2.5 py-0.5 text-[11px] font-medium">
                    {roleLabels[r] || r}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="py-8 md:py-12">
        <div className="container mx-auto max-w-4xl space-y-8 px-4">

          {/* Self-Registration Status Card */}
          {registrationRequest && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-xl border p-4 shadow-sm ${
                registrationRequest.status === "pending" ? "border-amber-500/30 bg-amber-500/5" :
                registrationRequest.status === "approved" ? "border-primary/30 bg-primary/5" :
                "border-destructive/30 bg-destructive/5"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <p className="font-serif text-sm font-bold">校友自助登记申请</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {registrationRequest.status === "pending" && "您的申请正在审核中，请耐心等待。"}
                    {registrationRequest.status === "approved" && "🎉 审核通过！您已加入校友档案库。"}
                    {registrationRequest.status === "rejected" && "很遗憾，您的申请未通过。"}
                  </p>
                  {registrationRequest.reviewer_note && (
                    <p className="mt-2 text-xs text-destructive">审核备注：{registrationRequest.reviewer_note}</p>
                  )}
                </div>
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${statusLabels[registrationRequest.status]?.cls}`}>
                  {statusLabels[registrationRequest.status]?.label}
                </span>
              </div>
            </motion.div>
          )}
          {/* Stats Row */}
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {[
              { icon: BookOpen, label: "投稿总数", value: submissions.length },
              { icon: Award, label: "已通过", value: approvedCount },
              { icon: CalendarCheck, label: "签到次数", value: checkIns.length },
              { icon: Clock, label: "加入天数", value: daysSinceJoin },
            ].map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="rounded-xl border border-border bg-card p-4 text-center shadow-sm"
              >
                <s.icon className="mx-auto h-5 w-5 text-primary mb-1" />
                <p className="text-2xl font-bold font-serif text-foreground"><AnimatedNumber value={s.value} /></p>
                <p className="text-[11px] text-muted-foreground">{s.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Quick Actions */}
          <div>
            <h2 className="mb-3 font-serif text-base font-bold text-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" /> 快捷操作
            </h2>
            <div className="grid grid-cols-3 gap-3 md:grid-cols-6">
              {quickActions.map((a, i) => (
                <motion.div
                  key={a.path}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 + i * 0.05 }}
                >
                  <Link
                    to={a.path}
                    className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-4 shadow-sm transition hover:shadow-md hover:-translate-y-0.5"
                  >
                    <a.icon className="h-6 w-6 text-primary" />
                    <span className="text-xs font-medium text-foreground">{a.label}</span>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Upcoming Events */}
            <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <h3 className="mb-3 flex items-center gap-2 font-serif text-sm font-bold text-foreground">
                <Calendar className="h-4 w-4 text-primary" /> 近期活动
              </h3>
              {events.length === 0 ? (
                <p className="text-xs text-muted-foreground">暂无近期活动</p>
              ) : (
                <div className="space-y-2">
                  {events.map((ev: any) => (
                    <div key={ev.id} className="rounded-lg bg-secondary/40 px-3 py-2.5">
                      <p className="text-sm font-medium text-foreground">{ev.title}</p>
                      <div className="mt-1 flex items-center gap-3 text-[11px] text-muted-foreground">
                        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(ev.event_date).toLocaleDateString("zh-CN")}</span>
                        {ev.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{ev.location}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Forum Posts */}
            <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <h3 className="mb-3 flex items-center gap-2 font-serif text-sm font-bold text-foreground">
                <MessageSquare className="h-4 w-4 text-primary" /> 我的帖子
              </h3>
              {forumPosts.length === 0 ? (
                <p className="text-xs text-muted-foreground">暂无论坛帖子，<Link to="/forum" className="text-primary hover:underline">去发帖</Link></p>
              ) : (
                <div className="space-y-2">
                  {forumPosts.map((p: any) => (
                    <div key={p.id} className="flex items-center justify-between rounded-lg bg-secondary/40 px-3 py-2.5">
                      <span className="text-sm font-medium text-foreground truncate mr-2">{p.title}</span>
                      <span className="shrink-0 text-[11px] text-muted-foreground">{new Date(p.created_at).toLocaleDateString("zh-CN")}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Departments */}
          {departments.length > 0 && (
            <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <h3 className="mb-3 flex items-center gap-2 font-serif text-sm font-bold text-foreground">
                <Building2 className="h-4 w-4 text-primary" /> 所属部门
              </h3>
              <div className="space-y-2">
                {departments.map((d: any) => (
                  <div key={d.department_id} className="flex items-center justify-between rounded-lg bg-secondary/40 px-3 py-2 text-sm">
                    <span className="text-foreground">{(d as any).departments?.name || "未知部门"}</span>
                    {d.is_head && <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">部长</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Member Bio */}
          {memberRecord && (
            <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <h3 className="mb-3 flex items-center gap-2 font-serif text-sm font-bold text-foreground">
                <Quote className="h-4 w-4 text-primary" /> 个性签名
                <span className="text-[10px] font-normal text-muted-foreground">({memberRecord.term})</span>
              </h3>
              {editingBio ? (
                <div className="space-y-2">
                  <textarea
                    value={memberBio}
                    onChange={e => setMemberBio(e.target.value)}
                    className="w-full rounded-md border border-border bg-secondary/30 px-3 py-2 text-sm focus:border-primary focus:outline-none"
                    rows={3}
                    placeholder="写下你的个性签名..."
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={async () => {
                        await supabase.from("members").update({ bio: memberBio || null }).eq("id", memberRecord.id);
                        setMemberRecord({ ...memberRecord, bio: memberBio });
                        setEditingBio(false);
                      }}
                      className="rounded-lg bg-primary px-3 py-1 text-xs text-primary-foreground"
                    >保存</button>
                    <button onClick={() => { setMemberBio(memberRecord.bio || ""); setEditingBio(false); }}
                      className="rounded-lg bg-secondary px-3 py-1 text-xs">取消</button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between">
                  <p className="text-sm italic text-muted-foreground">{memberRecord.bio || "暂未设置个性签名"}</p>
                  <button onClick={() => setEditingBio(true)} className="rounded-lg p-1 text-muted-foreground hover:bg-secondary">
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Check-in & Submissions side by side */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <h3 className="mb-3 flex items-center gap-2 font-serif text-sm font-bold text-foreground">
                <CalendarCheck className="h-4 w-4 text-primary" /> 签到记录
              </h3>
              {checkIns.length === 0 ? (
                <p className="text-xs text-muted-foreground">暂无签到记录</p>
              ) : (
                <div className="space-y-1.5">
                  {checkIns.slice(0, 10).map((c: any) => (
                    <div key={c.id} className="flex items-center justify-between rounded-lg bg-secondary/40 px-3 py-2 text-sm">
                      <span className="text-foreground">{(c as any).events?.title || "活动"}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(c.checked_in_at).toLocaleDateString("zh-CN")}
                      </span>
                    </div>
                  ))}
                  {checkIns.length > 10 && <p className="text-center text-xs text-muted-foreground pt-1">共 {checkIns.length} 条记录</p>}
                </div>
              )}
            </div>

            <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <h3 className="mb-3 flex items-center gap-2 font-serif text-sm font-bold text-foreground">
                <BookOpen className="h-4 w-4 text-primary" /> 我的投稿
              </h3>
              {submissions.length === 0 ? (
                <p className="text-xs text-muted-foreground">暂无投稿，<Link to="/submit" className="text-primary hover:underline">去投稿</Link></p>
              ) : (
                <div className="space-y-1.5">
                  {submissions.slice(0, 10).map((s: any) => {
                    const st = statusLabels[s.status] || statusLabels.pending;
                    return (
                      <div key={s.id} className="flex items-center justify-between rounded-lg bg-secondary/40 px-3 py-2 text-sm">
                        <div className="truncate mr-2">
                          <span className="font-medium text-foreground">{s.title}</span>
                          {s.genre && <span className="ml-2 text-xs text-muted-foreground">{s.genre}</span>}
                        </div>
                        <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${st.cls}`}>{st.label}</span>
                      </div>
                    );
                  })}
                  {submissions.length > 10 && <p className="text-center text-xs text-muted-foreground pt-1">共 {submissions.length} 条投稿</p>}
                </div>
              )}
            </div>
          </div>

        </div>
      </section>
    </Layout>
  );
};

export default Profile;
