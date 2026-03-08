import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { BookOpen, Send, CheckCircle, Image, Paperclip, X } from "lucide-react";

const genres = [
  { value: "诗歌", label: "诗歌", desc: "现代诗、古体诗、词等" },
  { value: "散文", label: "散文", desc: "抒情散文、叙事散文" },
  { value: "小说", label: "小说", desc: "短篇小说、微小说" },
  { value: "书评", label: "书评", desc: "读书笔记、书评影评" },
  { value: "剧本", label: "剧本", desc: "话剧、课本剧、小品" },
  { value: "书法", label: "书法", desc: "硬笔、软笔书法作品（上传图片）" },
  { value: "摄影", label: "摄影", desc: "摄影作品（上传图片）" },
  { value: "绘画", label: "绘画", desc: "国画、插画、手绘等（上传图片）" },
  { value: "朗诵", label: "朗诵", desc: "朗诵稿、朗诵音视频链接" },
  { value: "其他", label: "其他", desc: "其他文学艺术作品" },
];

const imageGenres = ["书法", "摄影", "绘画"];

const Submit = () => {
  const [user, setUser] = useState<any>(null);
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [genre, setGenre] = useState("诗歌");
  const [content, setContent] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [college, setCollege] = useState("");
  const [major, setMajor] = useState("");
  const [className, setClassName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [phone, setPhone] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(session.user);
        supabase.from("profiles").select("display_name").eq("user_id", session.user.id).single()
          .then(({ data }) => {
            const name = data?.display_name || session.user.email || "";
            setDisplayName(name);
            setAuthorName(name);
          });
      }
    });
  }, []);

  const isImageType = imageGenres.includes(genre);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Upload attachment if exists
    let attachmentUrl: string | null = null;
    if (attachmentFile) {
      setUploading(true);
      const ext = attachmentFile.name.split(".").pop();
      const path = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: uploadErr } = await supabase.storage.from("submissions").upload(path, attachmentFile);
      if (uploadErr) {
        setError("附件上传失败，请重试");
        setLoading(false);
        setUploading(false);
        return;
      }
      const { data: urlData } = supabase.storage.from("submissions").getPublicUrl(path);
      attachmentUrl = urlData.publicUrl;
      setUploading(false);
    }

    const { error: err } = await supabase.from("submissions").insert({
      title: title.trim(),
      content: isImageType ? (content.trim() || "（图片作品）") : content.trim(),
      genre,
      author_id: user?.id || null,
      author_name: authorName.trim() || "匿名",
      college: college.trim() || null,
      major: major.trim() || null,
      class_name: className.trim() || null,
      student_id: studentId.trim() || null,
      phone: phone.trim() || null,
      image_url: isImageType && imageUrl.trim() ? imageUrl.trim() : null,
      attachment_url: attachmentUrl,
    } as any);

    if (err) {
      setError("提交失败，请稍后重试");
    } else {
      setSubmitted(true);
    }
    setLoading(false);
  };

  if (submitted) {
    return (
      <Layout>
        <div className="relative bg-primary py-16 text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <h1 className="font-serif text-3xl font-bold tracking-widest md:text-4xl">作品投稿</h1>
            <div className="gold-divider mx-auto mt-4" />
          </div>
        </div>
        <section className="py-16">
          <div className="container mx-auto flex flex-col items-center gap-4 px-4 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <CheckCircle className="h-8 w-8 text-primary" />
            </div>
            <h2 className="font-serif text-2xl font-bold">投稿成功！</h2>
            <p className="max-w-md text-muted-foreground">你的作品已提交，编辑部将尽快审核。{user ? "可在个人中心查看审核状态。" : ""}</p>
            <div className="flex gap-3">
              <button onClick={() => { setSubmitted(false); setTitle(""); setContent(""); setImageUrl(""); setCollege(""); setMajor(""); setClassName(""); setStudentId(""); setPhone(""); setAttachmentFile(null); }}
                className="rounded-lg border border-border px-5 py-2 text-sm transition hover:bg-secondary">继续投稿</button>
              {user && <a href="/profile" className="rounded-lg bg-primary px-5 py-2 text-sm text-primary-foreground transition hover:bg-primary/90">个人中心</a>}
            </div>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="relative bg-primary py-16 text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-serif text-3xl font-bold tracking-widest md:text-4xl">作品投稿</h1>
          <p className="mt-3 text-sm text-primary-foreground/70">诗歌、散文、书法、摄影……展现你的才华</p>
          <div className="gold-divider mx-auto mt-4" />
        </div>
      </div>

      <section className="py-10 md:py-16">
        <div className="container mx-auto px-4">
          <form onSubmit={handleSubmit} className="mx-auto max-w-lg space-y-5 rounded-xl border border-border bg-card p-6 shadow-sm md:p-8">
            <div className="flex items-center gap-2 text-primary">
              <BookOpen className="h-5 w-5" />
              <h2 className="font-serif text-lg font-bold">投稿表单</h2>
            </div>

            {!user && (
              <div className="rounded-lg bg-muted p-3 text-xs text-muted-foreground">
                未登录也可投稿。<a href="/auth" className="text-primary hover:underline">登录</a>后可在个人中心追踪审核状态。
              </div>
            )}

            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">作者姓名/笔名 <span className="text-destructive">*</span></label>
              <input type="text" required value={authorName} onChange={e => setAuthorName(e.target.value)}
                className="w-full rounded-md border border-border bg-secondary/30 px-3 py-2 text-sm focus:border-primary focus:outline-none"
                placeholder="你的姓名或笔名" maxLength={50} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">学院 <span className="text-destructive">*</span></label>
                <input type="text" required value={college} onChange={e => setCollege(e.target.value)}
                  className="w-full rounded-md border border-border bg-secondary/30 px-3 py-2 text-sm focus:border-primary focus:outline-none"
                  placeholder="如：文学院" maxLength={50} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">专业 <span className="text-destructive">*</span></label>
                <input type="text" required value={major} onChange={e => setMajor(e.target.value)}
                  className="w-full rounded-md border border-border bg-secondary/30 px-3 py-2 text-sm focus:border-primary focus:outline-none"
                  placeholder="如：汉语言文学" maxLength={50} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">班级 <span className="text-destructive">*</span></label>
                <input type="text" required value={className} onChange={e => setClassName(e.target.value)}
                  className="w-full rounded-md border border-border bg-secondary/30 px-3 py-2 text-sm focus:border-primary focus:outline-none"
                  placeholder="如：2024级1班" maxLength={50} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">学号 <span className="text-destructive">*</span></label>
                <input type="text" required value={studentId} onChange={e => setStudentId(e.target.value)}
                  className="w-full rounded-md border border-border bg-secondary/30 px-3 py-2 text-sm focus:border-primary focus:outline-none"
                  placeholder="你的学号" maxLength={30} />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">联系方式 <span className="text-destructive">*</span></label>
              <input type="tel" required value={phone} onChange={e => setPhone(e.target.value)}
                className="w-full rounded-md border border-border bg-secondary/30 px-3 py-2 text-sm focus:border-primary focus:outline-none"
                placeholder="手机号码" maxLength={20} />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">作品标题 <span className="text-destructive">*</span></label>
              <input type="text" required value={title} onChange={e => setTitle(e.target.value)}
                className="w-full rounded-md border border-border bg-secondary/30 px-3 py-2 text-sm focus:border-primary focus:outline-none"
                placeholder="作品标题" maxLength={200} />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">作品类型 <span className="text-destructive">*</span></label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {genres.map(g => (
                  <button key={g.value} type="button" onClick={() => setGenre(g.value)}
                    className={`rounded-lg border p-2 text-left text-xs transition ${genre === g.value ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"}`}>
                    <span className="font-medium">{g.label}</span>
                    <p className="mt-0.5 text-[10px] text-muted-foreground">{g.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {isImageType && (
              <div>
                <label className="mb-1 flex items-center gap-1 text-xs font-medium text-muted-foreground">
                  <Image className="h-3.5 w-3.5" /> 图片链接
                </label>
                <input type="url" value={imageUrl} onChange={e => setImageUrl(e.target.value)}
                  className="w-full rounded-md border border-border bg-secondary/30 px-3 py-2 text-sm focus:border-primary focus:outline-none"
                  placeholder="粘贴图片URL（如图床链接）" />
                <p className="mt-1 text-[10px] text-muted-foreground">可使用任意图床上传后粘贴链接</p>
              </div>
            )}

            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                {isImageType ? "作品说明（选填）" : "作品正文"} {!isImageType && <span className="text-destructive">*</span>}
              </label>
              <textarea required={!isImageType} value={content} onChange={e => setContent(e.target.value)}
                rows={isImageType ? 4 : 12}
                className="w-full rounded-md border border-border bg-secondary/30 px-3 py-2 text-sm leading-relaxed focus:border-primary focus:outline-none"
                placeholder={isImageType ? "简要描述你的作品，创作背景等" : "在此书写或粘贴你的作品..."}
                maxLength={50000} />
            </div>

            <div>
              <label className="mb-1 flex items-center gap-1 text-xs font-medium text-muted-foreground">
                <Paperclip className="h-3.5 w-3.5" /> 上传附件（选填）
              </label>
              <div className="relative">
                {attachmentFile ? (
                  <div className="flex items-center gap-2 rounded-md border border-border bg-secondary/30 px-3 py-2 text-sm">
                    <Paperclip className="h-4 w-4 text-muted-foreground" />
                    <span className="flex-1 truncate">{attachmentFile.name}</span>
                    <span className="text-xs text-muted-foreground">{(attachmentFile.size / 1024 / 1024).toFixed(1)}MB</span>
                    <button type="button" onClick={() => setAttachmentFile(null)} className="rounded p-0.5 hover:bg-secondary"><X className="h-3.5 w-3.5" /></button>
                  </div>
                ) : (
                  <label className="flex cursor-pointer items-center gap-2 rounded-md border border-dashed border-border px-3 py-3 text-sm text-muted-foreground transition hover:border-primary/50 hover:bg-secondary/30">
                    <Paperclip className="h-4 w-4" />
                    <span>点击选择文件（PDF、Word、图片等，最大20MB）</span>
                    <input type="file" className="hidden" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.webp,.mp3,.wav,.mp4,.zip"
                      onChange={e => { if (e.target.files?.[0]) { const f = e.target.files[0]; if (f.size > 20 * 1024 * 1024) { setError("附件不能超过20MB"); } else { setError(""); setAttachmentFile(f); } } }} />
                  </label>
                )}
              </div>
            </div>

            {error && <p className="text-xs text-destructive">{error}</p>}

            <button type="submit" disabled={loading || uploading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50">
              <Send className="h-4 w-4" />
              {uploading ? "上传附件中..." : loading ? "提交中..." : "提交作品"}
            </button>
          </form>
        </div>
      </section>
    </Layout>
  );
};

export default Submit;
