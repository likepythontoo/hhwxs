import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Loader2, Check, X, Image as ImageIcon, Phone, MapPin, GraduationCap, Calendar } from "lucide-react";
import { motion } from "framer-motion";

interface Request {
  id: string;
  user_id: string;
  name: string;
  term: string;
  role_title: string | null;
  major: string | null;
  city: string | null;
  bio: string | null;
  memoir: string;
  contact: string;
  evidence_url: string | null;
  status: string;
  reviewer_note: string | null;
  reviewed_at: string | null;
  created_at: string;
}

const statusLabel: Record<string, { label: string; cls: string }> = {
  pending: { label: "待审核", cls: "bg-amber-500/10 text-amber-600" },
  approved: { label: "已通过", cls: "bg-primary/10 text-primary" },
  rejected: { label: "已拒绝", cls: "bg-destructive/10 text-destructive" },
};

const RegistrationRequestManagement = () => {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"pending" | "approved" | "rejected">("pending");
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectNote, setRejectNote] = useState("");
  const [processing, setProcessing] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("member_registration_requests" as any)
      .select("*")
      .order("created_at", { ascending: false });
    setRequests((data as any) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleApprove = async (req: Request) => {
    setProcessing(req.id);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      // 1. 创建 members 记录
      const { error: memErr } = await supabase.from("members").insert({
        user_id: req.user_id,
        name: req.name,
        term: req.term,
        role_title: req.role_title,
        major: req.major,
        city: req.city,
        bio: req.bio,
        memoir: req.memoir,
        is_claimed: true,
      });
      if (memErr) throw memErr;

      // 2. 更新申请状态
      const { error: updErr } = await supabase
        .from("member_registration_requests" as any)
        .update({
          status: "approved",
          reviewer_id: session?.user.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", req.id);
      if (updErr) throw updErr;

      toast({ title: "已通过", description: `${req.name} 已加入校友档案库` });
      load();
    } catch (err: any) {
      toast({ title: "操作失败", description: err.message, variant: "destructive" });
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async () => {
    if (!rejectingId) return;
    setProcessing(rejectingId);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const { error } = await supabase
        .from("member_registration_requests" as any)
        .update({
          status: "rejected",
          reviewer_note: rejectNote.trim() || null,
          reviewer_id: session?.user.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", rejectingId);
      if (error) throw error;
      toast({ title: "已拒绝" });
      setRejectingId(null);
      setRejectNote("");
      load();
    } catch (err: any) {
      toast({ title: "操作失败", description: err.message, variant: "destructive" });
    } finally {
      setProcessing(null);
    }
  };

  const filtered = requests.filter(r => r.status === filter);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-serif text-lg font-bold">校友登记申请</h2>
        <p className="text-sm text-muted-foreground">审核前社员的自助补录申请，通过后将自动加入校友档案库。</p>
      </div>

      <Tabs value={filter} onValueChange={v => setFilter(v as any)}>
        <TabsList>
          <TabsTrigger value="pending">
            待审核 {requests.filter(r => r.status === "pending").length > 0 && (
              <Badge className="ml-2 bg-primary text-primary-foreground">{requests.filter(r => r.status === "pending").length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="approved">已通过</TabsTrigger>
          <TabsTrigger value="rejected">已拒绝</TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="mt-4">
          {loading ? (
            <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : filtered.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">暂无{statusLabel[filter].label}申请</p>
          ) : (
            <div className="space-y-3">
              {filtered.map((req, i) => (
                <motion.div
                  key={req.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="rounded-xl border border-border bg-card p-4 shadow-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-serif text-base font-bold">{req.name}</h3>
                        <Badge variant="outline">{req.term}</Badge>
                        {req.role_title && <Badge variant="secondary">{req.role_title}</Badge>}
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusLabel[req.status].cls}`}>
                          {statusLabel[req.status].label}
                        </span>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        {req.major && <span className="flex items-center gap-1"><GraduationCap className="h-3 w-3" />{req.major}</span>}
                        {req.city && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{req.city}</span>}
                        <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{req.contact}</span>
                        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(req.created_at).toLocaleDateString()}</span>
                      </div>
                      {req.bio && <p className="mt-2 text-sm italic text-muted-foreground">"{req.bio}"</p>}
                      <div className="mt-2 rounded-lg bg-secondary/40 p-3 text-sm whitespace-pre-wrap">{req.memoir}</div>
                      {req.reviewer_note && (
                        <p className="mt-2 text-xs text-destructive">审核备注：{req.reviewer_note}</p>
                      )}
                    </div>
                    {req.evidence_url && (
                      <a href={req.evidence_url} target="_blank" rel="noopener noreferrer" className="block">
                        <img src={req.evidence_url} alt="凭证" className="h-24 w-24 rounded-lg border border-border object-cover transition hover:scale-105" />
                      </a>
                    )}
                  </div>

                  {req.status === "pending" && (
                    <div className="mt-3 flex gap-2 border-t border-border pt-3">
                      <Button size="sm" onClick={() => handleApprove(req)} disabled={processing === req.id}>
                        {processing === req.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Check className="h-4 w-4 mr-1" />通过</>}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => { setRejectingId(req.id); setRejectNote(""); }} disabled={processing === req.id}>
                        <X className="h-4 w-4 mr-1" />拒绝
                      </Button>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={!!rejectingId} onOpenChange={v => !v && setRejectingId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>拒绝申请</DialogTitle>
          </DialogHeader>
          <Textarea
            placeholder="请填写拒绝理由（可选，会展示给申请人）"
            value={rejectNote}
            onChange={e => setRejectNote(e.target.value)}
            maxLength={200}
            rows={4}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectingId(null)}>取消</Button>
            <Button variant="destructive" onClick={handleReject} disabled={!!processing}>
              {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : "确认拒绝"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RegistrationRequestManagement;
