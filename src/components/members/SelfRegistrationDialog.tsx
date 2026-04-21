import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { motion } from "framer-motion";
import { Upload, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const schema = z.object({
  name: z.string().trim().min(1, "请填写姓名").max(50, "姓名不超过 50 字"),
  term: z.string().trim().min(1, "请填写届别").max(20, "届别不超过 20 字"),
  role_title: z.string().trim().max(50, "职务不超过 50 字").optional(),
  major: z.string().trim().max(50, "专业不超过 50 字").optional(),
  city: z.string().trim().max(50, "城市不超过 50 字").optional(),
  bio: z.string().trim().max(100, "简介不超过 100 字").optional(),
  memoir: z.string().trim().min(10, "请填写至少 10 字的入社经历").max(500, "经历不超过 500 字"),
  contact: z.string().trim().min(1, "请填写联系方式").max(100, "联系方式不超过 100 字"),
});

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

const SelfRegistrationDialog = ({ open, onOpenChange }: Props) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [checking, setChecking] = useState(true);
  const [existingPending, setExistingPending] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);

  const [form, setForm] = useState({
    name: "", term: "", role_title: "", major: "", city: "", bio: "", memoir: "", contact: "",
  });

  useEffect(() => {
    if (!open) return;
    const check = async () => {
      setChecking(true);
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      if (session?.user) {
        const { data } = await supabase
          .from("member_registration_requests" as any)
          .select("id")
          .eq("user_id", session.user.id)
          .eq("status", "pending")
          .maybeSingle();
        setExistingPending(!!data);
      }
      setChecking(false);
    };
    check();
  }, [open]);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) {
      toast({ title: "图片过大", description: "请上传不超过 5MB 的图片", variant: "destructive" });
      return;
    }
    if (!["image/jpeg", "image/png", "image/jpg", "image/webp"].includes(f.type)) {
      toast({ title: "格式不支持", description: "请上传 jpg/png/webp 图片", variant: "destructive" });
      return;
    }
    setEvidenceFile(f);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast({ title: "请检查表单", description: parsed.error.issues[0].message, variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      let evidence_url: string | null = null;
      if (evidenceFile) {
        const ext = evidenceFile.name.split(".").pop();
        const path = `registration-evidence/${user.id}/${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage.from("site-assets").upload(path, evidenceFile);
        if (upErr) throw upErr;
        const { data: pub } = supabase.storage.from("site-assets").getPublicUrl(path);
        evidence_url = pub.publicUrl;
      }

      const { error } = await supabase.from("member_registration_requests" as any).insert({
        user_id: user.id,
        name: parsed.data.name,
        term: parsed.data.term,
        role_title: parsed.data.role_title || null,
        major: parsed.data.major || null,
        city: parsed.data.city || null,
        bio: parsed.data.bio || null,
        memoir: parsed.data.memoir,
        contact: parsed.data.contact,
        evidence_url,
      });
      if (error) throw error;

      toast({ title: "申请已提交", description: "管理员审核通过后您将出现在校友档案库中" });
      onOpenChange(false);
      setForm({ name: "", term: "", role_title: "", major: "", city: "", bio: "", memoir: "", contact: "" });
      setEvidenceFile(null);
      setExistingPending(true);
    } catch (err: any) {
      toast({ title: "提交失败", description: err.message || "请稍后重试", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">📝 校友自助登记</DialogTitle>
          <DialogDescription>
            如果你曾是红湖文学社成员但档案库中没有你的记录，可在此提交补录申请。
          </DialogDescription>
        </DialogHeader>

        {checking ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : !user ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <AlertCircle className="h-10 w-10 text-muted-foreground" />
            <p className="text-sm">请先登录后再提交申请</p>
            <Button onClick={() => { onOpenChange(false); navigate("/auth?redirect=/members"); }}>
              前往登录
            </Button>
          </div>
        ) : existingPending ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <CheckCircle2 className="h-10 w-10 text-primary" />
            <p className="font-medium">您已有一条待审核的申请</p>
            <p className="text-sm text-muted-foreground">请耐心等待管理员审核，审核结果将在个人中心展示。</p>
          </div>
        ) : (
          <motion.form
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="r-name">姓名 *</Label>
                <Input id="r-name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} maxLength={50} required />
              </div>
              <div>
                <Label htmlFor="r-term">届别 *</Label>
                <Input id="r-term" placeholder="如 2018届" value={form.term} onChange={e => setForm({ ...form, term: e.target.value })} maxLength={20} required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="r-role">当时职务</Label>
                <Input id="r-role" placeholder="如 社长 / 部长 / 社员" value={form.role_title} onChange={e => setForm({ ...form, role_title: e.target.value })} maxLength={50} />
              </div>
              <div>
                <Label htmlFor="r-major">专业</Label>
                <Input id="r-major" value={form.major} onChange={e => setForm({ ...form, major: e.target.value })} maxLength={50} />
              </div>
            </div>
            <div>
              <Label htmlFor="r-city">现居城市</Label>
              <Input id="r-city" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} maxLength={50} />
            </div>
            <div>
              <Label htmlFor="r-bio">一句话简介</Label>
              <Input id="r-bio" placeholder="可选，最多 100 字" value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} maxLength={100} />
            </div>
            <div>
              <Label htmlFor="r-memoir">入社经历 / 补充说明 *</Label>
              <Textarea
                id="r-memoir"
                placeholder="请描述你的入社时间、经历、参与活动等，作为审核依据 (10-500 字)"
                value={form.memoir}
                onChange={e => setForm({ ...form, memoir: e.target.value })}
                maxLength={500}
                rows={4}
                required
              />
              <p className="mt-1 text-xs text-muted-foreground">{form.memoir.length}/500</p>
            </div>
            <div>
              <Label htmlFor="r-contact">联系方式 *</Label>
              <Input id="r-contact" placeholder="手机 / 微信 / 邮箱，便于核实" value={form.contact} onChange={e => setForm({ ...form, contact: e.target.value })} maxLength={100} required />
            </div>
            <div>
              <Label>凭证图片（可选）</Label>
              <label className="mt-1 flex cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-border bg-secondary/30 px-3 py-4 text-sm text-muted-foreground transition hover:bg-secondary/60">
                <Upload className="h-4 w-4" />
                {evidenceFile ? evidenceFile.name : "上传老照片 / 聊天记录 / 任职证明（≤5MB）"}
                <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
              </label>
            </div>

            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "提交申请"}
            </Button>
          </motion.form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SelfRegistrationDialog;
