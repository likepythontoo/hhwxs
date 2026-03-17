import {
  PenLine,
  BookOpen,
  Users,
  CalendarCheck,
  Download,
  FileBarChart,
} from "lucide-react";
import { Link } from "react-router-dom";
import ScrollReveal from "@/components/ScrollReveal";

const links = [
  { icon: PenLine, label: "投稿系统", desc: "在线提交文学作品", href: "/submit", accent: "from-primary/10 to-primary/5" },
  { icon: BookOpen, label: "作品库", desc: "浏览历届优秀作品", href: "/works", accent: "from-accent/10 to-accent/5" },
  { icon: Users, label: "社员论坛", desc: "社员交流讨论", href: "/forum", accent: "from-primary/10 to-accent/5" },
  { icon: CalendarCheck, label: "活动报名", desc: "参与社团活动", href: "/events", accent: "from-accent/10 to-primary/5" },
  { icon: Download, label: "文件中心", desc: "文件资料下载", href: "/documents", accent: "from-primary/5 to-accent/10" },
  { icon: FileBarChart, label: "社团章程", desc: "规章制度查阅", href: "/charter", accent: "from-accent/5 to-primary/10" },
];

const QuickLinks = () => {
  return (
    <section className="relative py-16 md:py-24 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-b from-secondary/50 to-background" />
      <div className="absolute left-0 top-0 h-px w-full bg-gradient-to-r from-transparent via-border to-transparent" />
      <div className="absolute bottom-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="container mx-auto px-4 relative">
        <ScrollReveal>
          <div className="text-center mb-12">
            <span className="mb-2 inline-block text-xs font-medium uppercase tracking-[0.3em] text-accent">Quick Access</span>
            <h2 className="section-title text-3xl after:left-1/2 after:-translate-x-1/2">
              功能导航
            </h2>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-6">
          {links.map((link, i) => (
            <ScrollReveal key={link.label} delay={i * 0.08}>
              <Link
                to={link.href}
                className="group relative flex flex-col items-center gap-4 rounded-lg border border-border/60 bg-card p-6 transition-all duration-300 hover:border-primary/30 hover:shadow-[var(--shadow-elegant)] hover:-translate-y-1"
              >
                {/* Hover gradient bg */}
                <div className={`absolute inset-0 rounded-lg bg-gradient-to-br ${link.accent} opacity-0 transition-opacity group-hover:opacity-100`} />
                
                <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full border border-border/40 bg-secondary/50 transition-all duration-300 group-hover:border-primary/30 group-hover:bg-primary/10 group-hover:shadow-[0_0_20px_rgba(164,42,42,0.1)]">
                  <link.icon className="h-6 w-6 text-muted-foreground transition-colors duration-300 group-hover:text-primary" />
                </div>
                <span className="relative z-10 text-sm font-semibold tracking-wide">{link.label}</span>
                <span className="relative z-10 text-center text-xs text-muted-foreground">{link.desc}</span>
              </Link>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default QuickLinks;
