import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Upload } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  memberId: string;
  userId: string;
  onSubmitted?: () => void;
}

const MemberContentEditDialog = ({ open, onOpenChange, memberId, userId, onSubmitted }: Props) => {
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [photo, setPhoto] = useState({ image_url: "", caption: "", taken_on: "" });
  const [timeline, setTimeline] = useState({ year_label: "", kind: "other", title: "", description: "" });
  const [honor, setHonor] = useState({ year: "", title: "", issuer: "", description: "" });

  const uploadPhoto = async (file: File) => {
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `member-photos/${memberId}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("site-assets").upload(path, file, { upsert: false });
    if (error) {
      toast({ title: "上传失败", description: error.message, variant: "destructive" });
    } else {
      const { data } = supabase.storage.from("site-assets").getPublicUrl(path);
      setPhoto(p => ({ ...p, image_url: data.publicUrl }));
      toast({ title: "照片已上传" });
    }
    setUploading(false);
  };

  const done = (label: string) => {
    toast({ title: `${label}已提交`, description: "管理员审核通过后将公开显示" });
    onSubmitted?.();
    onOpenChange(false);
  };

  const submitPhoto = async () => {
    if (!photo.image_url) return toast({ title: "请先上传照片", variant: "destructive" });
    setSaving(true);
    const { error } = await supabase.from("member_photos").insert({
      member_id: memberId,
      submitted_by: userId,
      image_url: photo.image_url,
      caption: photo.caption || null,
      taken_on: photo.taken_on || null,
    });
    setSaving(false);
    if (error) return toast({ title: "提交失败", description: error.message, variant: "destructive" });
    setPhoto({ image_url: "", caption: "", taken_on: "" });
    done("照片");
  };

  const submitTimeline = async () => {
    if (!timeline.title.trim()) return toast({ title: "请填写标题", variant: "destructive" });
    setSaving(true);
    const { error } = await supabase.from("member_timeline").insert({
      member_id: memberId,
      submitted_by: userId,
      year_label: timeline.year_label || null,
      kind: timeline.kind,
      title: timeline.title,
      description: timeline.description || null,
    });
    setSaving(false);
    if (error) return toast({ title: "提交失败", description: error.message, variant: "destructive" });
    setTimeline({ year_label: "", kind: "other", title: "", description: "" });
    done("经历");
  };

  const submitHonor = async () => {
    if (!honor.title.trim()) return toast({ title: "请填写荣誉名称", variant: "destructive" });
    setSaving(true);
    const { error } = await supabase.from("member_honors").insert({
      member_id: memberId,
      submitted_by: userId,
      year: honor.year ? Number(honor.year) : null,
      title: honor.title,
      issuer: honor.issuer || null,
      description: honor.description || null,
    });
    setSaving(false);
    if (error) return toast({ title: "提交失败", description: error.message, variant: "destructive" });
    setHonor({ year: "", title: "", issuer: "", description: "" });
    done("荣誉");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-serif">补充我的档案</DialogTitle>
          <DialogDescription>提交的内容会进入审核队列，管理员通过后公开显示。</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="photo">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="photo">照片</TabsTrigger>
            <TabsTrigger value="timeline">经历</TabsTrigger>
            <TabsTrigger value="honor">荣誉</TabsTrigger>
          </TabsList>

          <TabsContent value="photo" className="space-y-3 pt-3">
            <div>
              <Label className="text-xs">照片文件</Label>
              <div className="mt-1 flex items-center gap-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={e => e.target.files?.[0] && uploadPhoto(e.target.files[0])}
                  disabled={uploading}
                />
                {uploading && <Upload className="h-4 w-4 animate-pulse text-primary" />}
              </div>
              {photo.image_url && (
                <img src={photo.image_url} alt="预览" className="mt-2 h-28 w-full rounded-lg object-cover" />
              )}
            </div>
            <div>
              <Label className="text-xs">照片说明</Label>
              <Input value={photo.caption} onChange={e => setPhoto(p => ({ ...p, caption: e.target.value }))} placeholder="例如：2019年社庆合影" />
            </div>
            <div>
              <Label className="text-xs">拍摄日期</Label>
              <Input type="date" value={photo.taken_on} onChange={e => setPhoto(p => ({ ...p, taken_on: e.target.value }))} />
            </div>
            <Button onClick={submitPhoto} disabled={saving || uploading} className="w-full">提交审核</Button>
          </TabsContent>

          <TabsContent value="timeline" className="space-y-3 pt-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">时间</Label>
                <Input value={timeline.year_label} onChange={e => setTimeline(t => ({ ...t, year_label: e.target.value }))} placeholder="2020 秋" />
              </div>
              <div>
                <Label className="text-xs">类别</Label>
                <select
                  className="mt-0 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  value={timeline.kind}
                  onChange={e => setTimeline(t => ({ ...t, kind: e.target.value }))}
                >
                  <option value="join">入社</option>
                  <option value="role">任职</option>
                  <option value="award">获奖</option>
                  <option value="work">作品</option>
                  <option value="graduate">毕业去向</option>
                  <option value="other">其他</option>
                </select>
              </div>
            </div>
            <div>
              <Label className="text-xs">标题</Label>
              <Input value={timeline.title} onChange={e => setTimeline(t => ({ ...t, title: e.target.value }))} placeholder="担任编辑部部长" />
            </div>
            <div>
              <Label className="text-xs">详细说明</Label>
              <Textarea rows={3} value={timeline.description} onChange={e => setTimeline(t => ({ ...t, description: e.target.value }))} />
            </div>
            <Button onClick={submitTimeline} disabled={saving} className="w-full">提交审核</Button>
          </TabsContent>

          <TabsContent value="honor" className="space-y-3 pt-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">年份</Label>
                <Input type="number" value={honor.year} onChange={e => setHonor(h => ({ ...h, year: e.target.value }))} placeholder="2021" />
              </div>
              <div>
                <Label className="text-xs">颁发单位</Label>
                <Input value={honor.issuer} onChange={e => setHonor(h => ({ ...h, issuer: e.target.value }))} placeholder="校团委" />
              </div>
            </div>
            <div>
              <Label className="text-xs">荣誉名称</Label>
              <Input value={honor.title} onChange={e => setHonor(h => ({ ...h, title: e.target.value }))} placeholder="校园文学奖一等奖" />
            </div>
            <div>
              <Label className="text-xs">说明</Label>
              <Textarea rows={3} value={honor.description} onChange={e => setHonor(h => ({ ...h, description: e.target.value }))} />
            </div>
            <Button onClick={submitHonor} disabled={saving} className="w-full">提交审核</Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default MemberContentEditDialog;
