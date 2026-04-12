import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, BookOpen, Quote, MapPin, UserCheck, Edit3, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";

interface MemberDetail {
  id: string;
  name: string;
  term: string;
  role_title: string | null;
  bio: string | null;
  avatar_url: string | null;
  major: string | null;
  introduction: string | null;
  literary_tags: string[] | null;
  memoir: string | null;
  city: string | null;
  is_claimed: boolean;
  user_id: string | null;
}

interface WorkItem {
  id: string;
  submissions: {
    id: string;
    title: string;
    genre: string | null;
    author_name: string;
    content: string;
  };
}

const MemberProfile = () => {
  const { id } = useParams<{ id: string }>();
  const [member, setMember] = useState<MemberDetail | null>(null);
  const [works, setWorks] = useState<WorkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({ introduction: "", memoir: "", city: "", literary_tags: "" });
  const [claiming, setClaiming] = useState(false);
  const [claimNote, setClaimNote] = useState("");
  const [showClaimForm, setShowClaimForm] = useState(false);
  const [claimStatus, setClaimStatus] = useState<string | null>(null); // pending / approved / rejected / null

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setCurrentUserId(data.user?.id || null));
  }, []);

  useEffect(() => {
    if (!id) return;
    const fetch = async () => {
      const [memberRes, worksRes] = await Promise.all([
        supabase.from("members").select("*").eq("id", id).single(),
        supabase.from("member_works").select("id, submission_id, submissions(id, title, genre, author_name, content)").eq("member_id", id) as any,
      ]);
      setMember(memberRes.data as MemberDetail);
      setWorks(worksRes.data || []);
      setLoading(false);
    };
    fetch();
  }, [id]);

  const isOwner = currentUserId && member?.user_id === currentUserId;

  const handleClaim = async () => {
    if (!currentUserId || !member) return;
    setClaiming(true);
    const { error } = await supabase
      .from("members")
      .update({ user_id: currentUserId, is_claimed: true } as any)
      .eq("id", member.id);
    if (error) {
      toast({ title: "认领失败", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "认领成功！", description: "您现在可以编辑自己的资料了" });
      setMember({ ...member, user_id: currentUserId, is_claimed: true });
    }
    setClaiming(false);
  };

  const startEdit = () => {
    if (!member) return;
    setEditData({
      introduction: member.introduction || "",
      memoir: member.memoir || "",
      city: member.city || "",
      literary_tags: (member.literary_tags || []).join(", "),
    });
    setEditing(true);
  };

  const saveEdit = async () => {
    if (!member) return;
    const tags = editData.literary_tags.split(/[,，]/).map(t => t.trim()).filter(Boolean);
    const { error } = await supabase
      .from("members")
      .update({
        introduction: editData.introduction || null,
        memoir: editData.memoir || null,
        city: editData.city || null,
        literary_tags: tags.length > 0 ? tags : null,
      } as any)
      .eq("id", member.id);
    if (error) {
      toast({ title: "保存失败", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "保存成功" });
      setMember({ ...member, introduction: editData.introduction || null, memoir: editData.memoir || null, city: editData.city || null, literary_tags: tags.length > 0 ? tags : null });
      setEditing(false);
    }
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

  if (!member) {
    return (
      <Layout>
        <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
          <p className="text-muted-foreground">未找到该成员</p>
          <Link to="/members" className="text-sm text-primary hover:underline">返回成员列表</Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Header */}
      <div className="bg-[hsl(var(--archive-charcoal))] py-16 text-[hsl(var(--archive-cream))]">
        <div className="container mx-auto max-w-3xl px-4">
          <Link to="/members" className="mb-6 inline-flex items-center gap-1.5 text-xs opacity-60 hover:opacity-100 transition">
            <ArrowLeft className="h-3.5 w-3.5" /> 返回档案库
          </Link>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-start gap-5">
            <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-primary/20 font-serif text-2xl font-bold text-primary ring-2 ring-primary/40">
              {member.avatar_url ? (
                <img src={member.avatar_url} alt={member.name} className="h-full w-full rounded-full object-cover" />
              ) : (
                member.name[0]
              )}
              {member.is_claimed && (
                <CheckCircle2 className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-[hsl(var(--archive-charcoal))] text-emerald-500" />
              )}
            </div>
            <div>
              <h1 className="font-serif text-2xl font-bold tracking-wide">{member.name}</h1>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-sm opacity-70">
                <span>{member.term}</span>
                {member.role_title && <><span>·</span><span className="text-primary">{member.role_title}</span></>}
                {member.major && <><span>·</span><span>{member.major}</span></>}
              </div>
              {member.city && (
                <div className="mt-2 flex items-center gap-1 text-xs opacity-50">
                  <MapPin className="h-3 w-3" /> {member.city}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto max-w-3xl px-4 py-10 space-y-8">
        {/* Actions */}
        <div className="flex gap-3">
          {currentUserId && !member.is_claimed && !member.user_id && (
            <Button variant="outline" size="sm" onClick={handleClaim} disabled={claiming}>
              <UserCheck className="mr-1.5 h-4 w-4" /> 我是这个成员
            </Button>
          )}
          {isOwner && !editing && (
            <Button variant="outline" size="sm" onClick={startEdit}>
              <Edit3 className="mr-1.5 h-4 w-4" /> 编辑资料
            </Button>
          )}
        </div>

        {/* Literary tags */}
        {!editing && member.literary_tags && member.literary_tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {member.literary_tags.map(tag => (
              <Badge key={tag} variant="secondary" className="font-serif">{tag}</Badge>
            ))}
          </div>
        )}

        {/* Bio */}
        {member.bio && (
          <div className="rounded-xl border border-border bg-[hsl(var(--archive-cream))] p-5">
            <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-primary">
              <Quote className="h-3.5 w-3.5" /> 一句话简介
            </div>
            <p className="font-serif text-sm leading-relaxed italic">"{member.bio}"</p>
          </div>
        )}

        {/* Edit form */}
        {editing ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 rounded-xl border border-primary/20 bg-card p-6">
            <div>
              <label className="mb-1 block text-xs font-medium">文学标签（逗号分隔）</label>
              <Input value={editData.literary_tags} onChange={e => setEditData(d => ({ ...d, literary_tags: e.target.value }))} placeholder="诗歌, 小说, 散文" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium">所在城市</label>
              <Input value={editData.city} onChange={e => setEditData(d => ({ ...d, city: e.target.value }))} placeholder="北京" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium">个人介绍</label>
              <Textarea value={editData.introduction} onChange={e => setEditData(d => ({ ...d, introduction: e.target.value }))} rows={4} placeholder="写下你的故事..." />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium">在文学社的回忆</label>
              <Textarea value={editData.memoir} onChange={e => setEditData(d => ({ ...d, memoir: e.target.value }))} rows={4} placeholder="那些难忘的日子..." />
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={saveEdit}>保存</Button>
              <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>取消</Button>
            </div>
          </motion.div>
        ) : (
          <>
            {/* Introduction */}
            {member.introduction && (
              <div>
                <h3 className="mb-2 font-serif text-base font-bold text-[hsl(var(--archive-charcoal))]">个人介绍</h3>
                <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line">{member.introduction}</p>
              </div>
            )}

            {/* Memoir */}
            {member.memoir && (
              <div className="rounded-xl border border-border bg-[hsl(var(--archive-cream))] p-5">
                <h3 className="mb-2 font-serif text-base font-bold text-[hsl(var(--archive-charcoal))]">在文学社的回忆</h3>
                <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line">{member.memoir}</p>
              </div>
            )}
          </>
        )}

        {/* Works */}
        <div>
          <h3 className="mb-3 flex items-center gap-1.5 font-serif text-base font-bold text-[hsl(var(--archive-charcoal))]">
            <BookOpen className="h-4 w-4 text-primary" /> 代表作品 <span className="text-sm font-normal text-muted-foreground">({works.length})</span>
          </h3>
          {works.length === 0 ? (
            <p className="text-sm text-muted-foreground">暂无关联作品</p>
          ) : (
            <div className="space-y-3">
              {works.map(w => (
                <div key={w.id} className="rounded-xl border border-border bg-card p-4 transition hover:border-primary/20 hover:shadow-sm">
                  <p className="font-serif text-sm font-bold">{w.submissions?.title}</p>
                  {w.submissions?.genre && (
                    <Badge variant="secondary" className="mt-1 text-[10px]">{w.submissions.genre}</Badge>
                  )}
                  <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-muted-foreground">
                    {w.submissions?.content?.replace(/<[^>]*>/g, "").slice(0, 200)}...
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="flex gap-4">
          <div className="rounded-xl border border-border bg-card p-4 text-center">
            <p className="font-serif text-2xl font-bold text-primary">{works.length}</p>
            <p className="text-xs text-muted-foreground">作品数量</p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default MemberProfile;
