import {
  PenLine,
  BookOpen,
  Users,
  CalendarCheck,
  Download,
  FileBarChart,
} from "lucide-react";
import { Link } from "react-router-dom";

const links = [
  { icon: PenLine, label: "投稿系统", desc: "在线提交文学作品", href: "/submit" },
  { icon: BookOpen, label: "作品库", desc: "浏览历届优秀作品", href: "/works" },
  { icon: Users, label: "社员论坛", desc: "社员交流讨论", href: "/forum" },
  { icon: CalendarCheck, label: "活动报名", desc: "参与社团活动", href: "/events" },
  { icon: Download, label: "文件中心", desc: "文件资料下载", href: "/documents" },
  { icon: FileBarChart, label: "社团章程", desc: "规章制度查阅", href: "/charter" },
];

const QuickLinks = () => {
  return (
    <section className="bg-secondary py-12 md:py-16">
      <div className="container mx-auto px-4">
        <h2 className="section-title mb-8 text-center after:left-1/2 after:-translate-x-1/2">
          功能导航
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
          {links.map((link) => (
            <Link key={link.label} to={link.href} className="quick-link-card">
              <link.icon className="quick-link-icon h-8 w-8 text-ink-gray transition-colors" />
              <span className="text-sm font-semibold">{link.label}</span>
              <span className="text-center text-xs text-muted-foreground">{link.desc}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default QuickLinks;
