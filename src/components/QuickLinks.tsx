import {
  PenLine,
  BookOpen,
  Users,
  CalendarCheck,
  Download,
  FileBarChart,
} from "lucide-react";

const links = [
  { icon: PenLine, label: "投稿系统", desc: "在线提交文学作品" },
  { icon: BookOpen, label: "作品库", desc: "浏览历届优秀作品" },
  { icon: Users, label: "社员名册", desc: "查看社员信息" },
  { icon: CalendarCheck, label: "活动报名", desc: "参与社团活动" },
  { icon: Download, label: "资源下载", desc: "社刊与学习资料" },
  { icon: FileBarChart, label: "年度报告", desc: "社团年度总结" },
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
            <div key={link.label} className="quick-link-card">
              <link.icon className="quick-link-icon h-8 w-8 text-ink-gray transition-colors" />
              <span className="text-sm font-semibold">{link.label}</span>
              <span className="text-center text-xs text-muted-foreground">{link.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default QuickLinks;
