import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Check, X, Clock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

interface Claim {
  id: string;
  member_id: string;
  user_id: string;
  status: string;
  note: string | null;
  reviewer_note: string | null;
  created_at: string;
  reviewed_at: string | null;
  member_name?: string;
  member_term?: string;
  applicant_name?: string;
}

const ClaimManagement = () => {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({});
  const [processing, setProcessing] = useState<string | null>(null);

  const fetchClaims = async () => {
    const { data } = await supabase
      .from("member_claims")
      .select("*")
      .order("created_at", { ascending: false });

    if (!data) { setLoading(false); return; }

    // Fetch member names and applicant profiles
    const memberIds = [...new Set(data.map(c => c.member_id))];
    const userIds = [...new Set(data.map(c => c.user_id))];

    const [membersRes, profilesRes] = await Promise.all([
      memberIds.length > 0 ? supabase.from("members").select("id, name, term").in("id", memberIds) : { data: [] },
      userIds.length > 0 ? supabase.from("profiles").select("user_id, display_name").in("user_id", userIds) : { data: [] },
    ]);

    const memberMap = new Map((membersRes.data || []).map(m => [m.id, m]));
    const profileMap = new Map((profilesRes.data || []).map(p => [p.user_id, p.display_name]));

    const enriched: Claim[] = data.map(c => ({
      ...c,
      member_name: memberMap.get(c.member_id)?.name || "未知",
      member_term: memberMap.get(c.member_id)?.term || "",
      applicant_name: profileMap.get(c.user_id) || "未知用户",
    }));

    setClaims(enriched);
    setLoading(false);
  };

  useEffect(() => { fetchClaims(); }, []);

  const handleReview = async (claim: Claim, action: "approved" | "rejected") => {
    setProcessing(claim.id);
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase
      .from("member_claims")
      .update({
        status: action,
        reviewer_id: user?.id,
        reviewer_note: reviewNotes[claim.id] || null,
        reviewed_at: new Date().toISOString(),
      } as any)
      .eq("id", claim.id);

    if (error) {
      toast({ title: "操作失败", description: error.message, variant: "destructive" });
      setProcessing(null);
      return;
    }

    // If approved, update the member record
    if (action === "approved") {
      await supabase.from("members").update({
        user_id: claim.user_id,
        is_claimed: true,
      } as any).eq("id", claim.member_id);
    }

    toast({ title: action === "approved" ? "已通过认领" : "已拒绝认领" });
    setProcessing(null);
    fetchClaims();
  };

  if (loading) {
    return <div className="flex justify-center py-20"><p className="text-muted-foreground animate-pulse">加载中...</p></div>;
  }

  const pendingClaims = claims.filter(c => c.status === "pending");
  const resolvedClaims = claims.filter(c => c.status !== "pending");

  return (
    <div className="space-y-6">
      {/* Pending */}
      <div>
        <h3 className="mb-3 font-serif text-sm font-bold flex items-center gap-2">
          <Clock className="h-4 w-4 text-amber-500" /> 待审核 ({pendingClaims.length})
        </h3>
        {pendingClaims.length === 0 ? (
          <p className="rounded-xl border border-border bg-card p-6 text-center text-sm text-muted-foreground">暂无待审核的认领申请</p>
        ) : (
          <div className="space-y-3">
            {pendingClaims.map(claim => (
              <div key={claim.id} className="rounded-xl border border-border bg-card p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-primary" />
                      <span className="font-serif text-sm font-bold">{claim.applicant_name}</span>
                      <span className="text-xs text-muted-foreground">申请认领</span>
                      <span className="font-serif text-sm font-bold text-primary">{claim.member_name}</span>
                      <Badge variant="secondary" className="text-[10px]">{claim.member_term}</Badge>
                    </div>
                    {claim.note && (
                      <p className="mt-1.5 text-xs text-muted-foreground bg-secondary/50 rounded-lg px-3 py-1.5">
                        "{claim.note}"
                      </p>
                    )}
                    <p className="mt-1 text-[10px] text-muted-foreground">
                      {new Date(claim.created_at).toLocaleString("zh-CN")}
                    </p>
                  </div>
                </div>

                <div className="flex items-end gap-3">
                  <div className="flex-1">
                    <Textarea
                      placeholder="审核备注（可选）"
                      rows={1}
                      className="text-xs"
                      value={reviewNotes[claim.id] || ""}
                      onChange={e => setReviewNotes(prev => ({ ...prev, [claim.id]: e.target.value }))}
                    />
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleReview(claim, "approved")}
                    disabled={processing === claim.id}
                    className="gap-1"
                  >
                    <Check className="h-3.5 w-3.5" /> 通过
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleReview(claim, "rejected")}
                    disabled={processing === claim.id}
                    className="gap-1"
                  >
                    <X className="h-3.5 w-3.5" /> 拒绝
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Resolved */}
      {resolvedClaims.length > 0 && (
        <div>
          <h3 className="mb-3 font-serif text-sm font-bold">已处理记录</h3>
          <div className="space-y-2">
            {resolvedClaims.map(claim => (
              <div key={claim.id} className="flex items-center justify-between rounded-lg bg-secondary/50 px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium">{claim.applicant_name}</span>
                  <span className="text-[10px] text-muted-foreground">→</span>
                  <span className="text-xs font-medium">{claim.member_name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={claim.status === "approved" ? "default" : "destructive"} className="text-[10px]">
                    {claim.status === "approved" ? "已通过" : "已拒绝"}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground">
                    {claim.reviewed_at ? new Date(claim.reviewed_at).toLocaleDateString("zh-CN") : ""}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ClaimManagement;
