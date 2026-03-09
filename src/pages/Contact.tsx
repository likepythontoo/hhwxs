import { useState } from "react";
import Layout from "@/components/Layout";
import { Mail, Phone, MapPin, MessageSquare, Send, ExternalLink, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const socialLinks = [
  { name: "微信公众号", handle: "红湖文学社", icon: "📱" },
  { name: "抖音", handle: "红湖文学社", icon: "🎵" },
  { name: "Bilibili", handle: "红湖文学社", icon: "📺" },
];

const Contact = () => {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !content.trim()) return;
    if (name.trim().length > 100 || content.trim().length > 2000) {
      toast({ title: "内容过长", description: "请缩短姓名或留言内容", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("messages").insert({
      name: name.trim(),
      email: email.trim() || null,
      content: content.trim(),
    });
    setSubmitting(false);
    if (error) {
      toast({ title: "发送失败", description: "请稍后重试", variant: "destructive" });
    } else {
      setSubmitted(true);
      setName(""); setEmail(""); setContent("");
      toast({ title: "留言已发送", description: "感谢你的留言，我们会尽快回复！" });
    }
  };

  return (
    <Layout>
      <div className="relative bg-primary py-12 text-primary-foreground sm:py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-serif text-2xl font-bold tracking-widest sm:text-3xl md:text-4xl">联系我们</h1>
          <p className="mt-3 text-sm text-primary-foreground/70">期待与你的每一次交流</p>
          <div className="gold-divider mx-auto mt-4" />
        </div>
      </div>

      <section className="py-8 sm:py-10 md:py-16">
        <div className="container mx-auto max-w-4xl px-4">
          <div className="grid gap-5 md:grid-cols-2">
            {/* Contact Info */}
            <div className="space-y-5">
              <div className="rounded-xl border border-border bg-card p-5 shadow-sm sm:p-6">
                <h2 className="mb-4 font-serif text-lg font-bold">基本信息</h2>
                <div className="space-y-4 text-sm">
                  <div className="flex items-start gap-3">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <div>
                      <p className="font-medium">社团地址</p>
                      <p className="text-muted-foreground">河北省唐山市曹妃甸区河北科技学院</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Mail className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <div>
                      <p className="font-medium">社长邮箱</p>
                      <p className="text-muted-foreground">1330760849@qq.com</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <div>
                      <p className="font-medium">指导老师</p>
                      <p className="text-muted-foreground">某某某 · 000-0000-0000</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-5 shadow-sm sm:p-6">
                <h2 className="mb-4 font-serif text-lg font-bold">社交媒体</h2>
                <div className="space-y-3">
                  {socialLinks.map((s) => (
                    <div key={s.name} className="flex items-center gap-3 rounded-lg bg-secondary/50 px-4 py-3">
                      <span className="text-lg">{s.icon}</span>
                      <div className="text-sm">
                        <p className="font-medium">{s.name}</p>
                        <p className="text-muted-foreground">{s.handle}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-5 shadow-sm sm:p-6">
                <h2 className="mb-4 font-serif text-lg font-bold">快捷入口</h2>
                <div className="grid grid-cols-2 gap-2">
                  <a href="/join" className="flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-2.5 text-xs font-medium text-primary transition hover:bg-primary/20 sm:px-4 sm:py-3 sm:text-sm">
                    <ExternalLink className="h-3.5 w-3.5 shrink-0" /> 加入我们
                  </a>
                  <a href="/submit" className="flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-2.5 text-xs font-medium text-primary transition hover:bg-primary/20 sm:px-4 sm:py-3 sm:text-sm">
                    <Send className="h-3.5 w-3.5 shrink-0" /> 投稿系统
                  </a>
                  <a href="/events" className="flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-2.5 text-xs font-medium text-primary transition hover:bg-primary/20 sm:px-4 sm:py-3 sm:text-sm">
                    <ExternalLink className="h-3.5 w-3.5 shrink-0" /> 活动中心
                  </a>
                  <a href="/forum" className="flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-2.5 text-xs font-medium text-primary transition hover:bg-primary/20 sm:px-4 sm:py-3 sm:text-sm">
                    <MessageSquare className="h-3.5 w-3.5 shrink-0" /> 社员论坛
                  </a>
                </div>
              </div>
            </div>

            {/* Right column */}
            <div className="space-y-5">
              <div className="rounded-xl border border-border bg-card p-5 shadow-sm sm:p-6">
                <h2 className="mb-4 font-serif text-lg font-bold">📖 社团出版物</h2>
                <div className="space-y-3 text-sm">
                  <div className="rounded-lg bg-secondary/50 px-4 py-3">
                    <p className="font-medium">期刊：《红湖》</p>
                    <p className="mt-1 text-xs text-muted-foreground">社团核心出版物，每年定期出刊，汇集社员优秀文学作品</p>
                  </div>
                  <div className="rounded-lg bg-secondary/50 px-4 py-3">
                    <p className="font-medium">报刊：《墨香阁》</p>
                    <p className="mt-1 text-xs text-muted-foreground">社团文艺副刊，聚焦校园文化与文学评论</p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-5 shadow-sm sm:p-6">
                <h2 className="mb-4 font-serif text-lg font-bold">💬 给我们留言</h2>
                {submitted ? (
                  <div className="flex flex-col items-center gap-3 py-8 text-center">
                    <CheckCircle className="h-10 w-10 text-primary" />
                    <p className="font-serif text-lg font-bold">留言已发送！</p>
                    <p className="text-sm text-muted-foreground">感谢你的留言，我们会尽快回复</p>
                    <button onClick={() => setSubmitted(false)} className="mt-2 text-sm text-primary hover:underline">
                      继续留言
                    </button>
                  </div>
                ) : (
                  <>
                    <p className="mb-4 text-xs text-muted-foreground">有任何建议、合作意向或疑问，欢迎留言</p>
                    <form className="space-y-3" onSubmit={handleSubmit}>
                      <input
                        type="text" required placeholder="你的姓名" maxLength={100}
                        value={name} onChange={(e) => setName(e.target.value)}
                        className="w-full rounded-md border border-border bg-secondary/30 px-3 py-2 text-sm focus:border-primary focus:outline-none"
                      />
                      <input
                        type="email" placeholder="邮箱（选填）" maxLength={255}
                        value={email} onChange={(e) => setEmail(e.target.value)}
                        className="w-full rounded-md border border-border bg-secondary/30 px-3 py-2 text-sm focus:border-primary focus:outline-none"
                      />
                      <textarea
                        required rows={4} placeholder="你的留言内容..." maxLength={2000}
                        value={content} onChange={(e) => setContent(e.target.value)}
                        className="w-full rounded-md border border-border bg-secondary/30 px-3 py-2 text-sm focus:border-primary focus:outline-none"
                      />
                      <button
                        type="submit" disabled={submitting}
                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
                      >
                        {submitting ? (
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                        {submitting ? "发送中..." : "发送留言"}
                      </button>
                    </form>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Contact;
