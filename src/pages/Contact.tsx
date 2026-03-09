import Layout from "@/components/Layout";
import { Mail, Phone, MapPin, MessageSquare, Send, ExternalLink } from "lucide-react";

const socialLinks = [
  { name: "微信公众号", handle: "红湖文学社", icon: "📱" },
  { name: "抖音", handle: "红湖文学社", icon: "🎵" },
  { name: "Bilibili", handle: "红湖文学社", icon: "📺" },
];

const Contact = () => {
  return (
    <Layout>
      <div className="relative bg-primary py-16 text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-serif text-3xl font-bold tracking-widest md:text-4xl">联系我们</h1>
          <p className="mt-3 text-sm text-primary-foreground/70">期待与你的每一次交流</p>
          <div className="gold-divider mx-auto mt-4" />
        </div>
      </div>

      <section className="py-10 md:py-16">
        <div className="container mx-auto max-w-4xl px-4">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Contact Info */}
            <div className="space-y-5">
              <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
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

              <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
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

              <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                <h2 className="mb-4 font-serif text-lg font-bold">快捷入口</h2>
                <div className="grid grid-cols-2 gap-2">
                  <a href="/join" className="flex items-center gap-2 rounded-lg bg-primary/10 px-4 py-3 text-sm font-medium text-primary transition hover:bg-primary/20">
                    <ExternalLink className="h-3.5 w-3.5" /> 加入我们
                  </a>
                  <a href="/submit" className="flex items-center gap-2 rounded-lg bg-primary/10 px-4 py-3 text-sm font-medium text-primary transition hover:bg-primary/20">
                    <Send className="h-3.5 w-3.5" /> 投稿系统
                  </a>
                  <a href="/events" className="flex items-center gap-2 rounded-lg bg-primary/10 px-4 py-3 text-sm font-medium text-primary transition hover:bg-primary/20">
                    <ExternalLink className="h-3.5 w-3.5" /> 活动中心
                  </a>
                  <a href="/forum" className="flex items-center gap-2 rounded-lg bg-primary/10 px-4 py-3 text-sm font-medium text-primary transition hover:bg-primary/20">
                    <MessageSquare className="h-3.5 w-3.5" /> 社员论坛
                  </a>
                </div>
              </div>
            </div>

            {/* Message / Info */}
            <div className="space-y-5">
              <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
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

              <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                <h2 className="mb-4 font-serif text-lg font-bold">💬 给我们留言</h2>
                <p className="mb-4 text-xs text-muted-foreground">有任何建议、合作意向或疑问，欢迎留言</p>
                <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); alert("留言功能即将上线，请通过邮箱联系我们！"); }}>
                  <input
                    type="text" required placeholder="你的姓名"
                    className="w-full rounded-md border border-border bg-secondary/30 px-3 py-2 text-sm focus:border-primary focus:outline-none"
                  />
                  <input
                    type="email" placeholder="邮箱（选填）"
                    className="w-full rounded-md border border-border bg-secondary/30 px-3 py-2 text-sm focus:border-primary focus:outline-none"
                  />
                  <textarea
                    required rows={4} placeholder="你的留言内容..."
                    className="w-full rounded-md border border-border bg-secondary/30 px-3 py-2 text-sm focus:border-primary focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
                  >
                    <Send className="h-4 w-4" /> 发送留言
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Contact;
