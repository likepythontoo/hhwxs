import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { User, Building2, BookOpen, CalendarCheck, LogOut, Edit2, Save, Quote } from "lucide-react";

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

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/auth"); return; }

      const uid = session.user.id;

      const [profileRes, roleRes, deptRes, checkInRes, subRes, memberRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("user_id", uid).single(),
        supabase.from("user_roles").select("role").eq("user_id", uid),
        supabase.from("department_members").select("department_id, is_head, departments(name)").eq("user_id", uid),
        supabase.from("check_ins").select("id, user_name, checked_in_at, events(title)").eq("user_id", uid).order("checked_in_at", { ascending: false }).limit(20),
        supabase.from("submissions").select("id, title, genre, status, created_at").eq("author_id", uid).order("created_at", { ascending: false }).limit(20),
        supabase.from("members").select("*").eq("user_id", uid).limit(1),
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

  const roleLabels: Record<string, string> = {
    admin: "管理员", president: "社长", minister: "部长", member: "社员",
  };

  const statusLabels: Record<string, { label: string; cls: string }> = {
    pending: { label: "待审核", cls: "bg-muted text-muted-foreground" },
    approved: { label: "已通过", cls: "bg-primary/10 text-primary" },
    rejected: { label: "未通过", cls: "bg-destructive/10 text-destructive" },
  };

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
      <div className="relative bg-primary py-16 text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-serif text-3xl font-bold tracking-widest md:text-4xl">个人中心</h1>
          <div className="gold-divider mx-auto mt-4" />
        </div>
      </div>

      <section className="py-8 md:py-12">
        <div className="container mx-auto max-w-2xl space-y-6 px-4">

          {/* Profile Card */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
                  {(profile?.display_name || "?")[0]}
                </div>
                <div>
                  {editing ? (
                    <div className="space-y-2">
                      <input value={displayName} onChange={e => setDisplayName(e.target.value)}
                        className="rounded-md border border-border bg-secondary/30 px-2 py-1 text-sm focus:border-primary focus:outline-none" placeholder="昵称" />
                      <input value={studentId} onChange={e => setStudentId(e.target.value)}
                        className="rounded-md border border-border bg-secondary/30 px-2 py-1 text-sm focus:border-primary focus:outline-none" placeholder="学号（选填）" />
                    </div>
                  ) : (
                    <>
                      <p className="font-serif text-base font-bold">{profile?.display_name}</p>
                      {profile?.student_id && <p className="text-xs text-muted-foreground">学号: {profile.student_id}</p>}
                    </>
                  )}
                  <div className="mt-1 flex flex-wrap gap-1">
                    {roles.map(r => (
                      <span key={r} className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                        {roleLabels[r] || r}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-1">
                {editing ? (
                  <button onClick={handleSave} className="rounded-lg p-2 text-primary transition hover:bg-secondary" title="保存">
                    <Save className="h-4 w-4" />
                  </button>
                ) : (
                  <button onClick={() => setEditing(true)} className="rounded-lg p-2 text-muted-foreground transition hover:bg-secondary" title="编辑">
                    <Edit2 className="h-4 w-4" />
                  </button>
                )}
                <button onClick={handleLogout} className="rounded-lg p-2 text-muted-foreground transition hover:bg-secondary" title="退出登录">
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Departments */}
          {departments.length > 0 && (
            <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <h3 className="mb-3 flex items-center gap-2 font-serif text-sm font-bold">
                <Building2 className="h-4 w-4 text-primary" /> 所属部门
              </h3>
              <div className="space-y-2">
                {departments.map((d: any) => (
                  <div key={d.department_id} className="flex items-center justify-between rounded-lg bg-secondary/40 px-3 py-2 text-sm">
                    <span>{(d as any).departments?.name || "未知部门"}</span>
                    {d.is_head && <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">部长</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Check-in History */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <h3 className="mb-3 flex items-center gap-2 font-serif text-sm font-bold">
              <CalendarCheck className="h-4 w-4 text-primary" /> 签到记录
            </h3>
            {checkIns.length === 0 ? (
              <p className="text-xs text-muted-foreground">暂无签到记录</p>
            ) : (
              <div className="space-y-1.5">
                {checkIns.map((c: any) => (
                  <div key={c.id} className="flex items-center justify-between rounded-lg bg-secondary/40 px-3 py-2 text-sm">
                    <span>{(c as any).events?.title || "活动"}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(c.checked_in_at).toLocaleDateString("zh-CN")}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submissions */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <h3 className="mb-3 flex items-center gap-2 font-serif text-sm font-bold">
              <BookOpen className="h-4 w-4 text-primary" /> 我的投稿
            </h3>
            {submissions.length === 0 ? (
              <p className="text-xs text-muted-foreground">暂无投稿</p>
            ) : (
              <div className="space-y-1.5">
                {submissions.map((s: any) => {
                  const st = statusLabels[s.status] || statusLabels.pending;
                  return (
                    <div key={s.id} className="flex items-center justify-between rounded-lg bg-secondary/40 px-3 py-2 text-sm">
                      <div>
                        <span className="font-medium">{s.title}</span>
                        {s.genre && <span className="ml-2 text-xs text-muted-foreground">{s.genre}</span>}
                      </div>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${st.cls}`}>{st.label}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </section>
    </Layout>
  );
};

export default Profile;
