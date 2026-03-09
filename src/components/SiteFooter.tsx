import { Link } from "react-router-dom";

const SiteFooter = () => {
  return (
    <footer className="bg-ink-black text-rice-paper">
      <div className="container mx-auto px-4 py-8 sm:py-10">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
          <div className="sm:col-span-2 md:col-span-1">
            <h3 className="mb-4 font-serif text-lg tracking-widest">红湖文学社</h3>
            <p className="text-sm leading-relaxed opacity-60">
              河北科技学院红湖文学社成立于2003年，社名取自校园内「红湖」，寓意热血、纯净与深邃。一批批的红湖人在河北科技学院历史上各领风骚，一代代的红湖人以低调做人，高调做事的风格活跃在各个领域。
            </p>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold tracking-wider opacity-80">快速链接</h4>
            <ul className="space-y-2 text-sm opacity-60">
              <li><Link to="/about" className="transition hover:opacity-100">社团概况</Link></li>
              <li><Link to="/news" className="transition hover:opacity-100">新闻动态</Link></li>
              <li><Link to="/works" className="transition hover:opacity-100">作品展示</Link></li>
              <li><Link to="/events" className="transition hover:opacity-100">活动中心</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold tracking-wider opacity-80">社团出版物</h4>
            <ul className="space-y-2 text-sm opacity-60">
              <li>📖 期刊：《红湖》</li>
              <li>📰 报刊：《墨香阁》</li>
              <li><Link to="/submit" className="transition hover:opacity-100">投稿系统</Link></li>
              <li><Link to="/join" className="transition hover:opacity-100">入社申请</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold tracking-wider opacity-80">联系我们</h4>
            <ul className="space-y-2 text-sm opacity-60">
              <li>📍 河北科技学院</li>
              <li>📧 1330760849@qq.com</li>
              <li>📱 微信公众号：红湖文学社</li>
              <li>🎵 抖音：红湖文学社</li>
              <li>📺 Bilibili：红湖文学社</li>
            </ul>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            to="/leadership"
            className="inline-block rounded border border-rice-paper/20 px-5 py-2 text-xs tracking-wider opacity-60 transition hover:opacity-100 sm:px-6 sm:text-sm"
          >
            历届管理团队 →
          </Link>
          <Link
            to="/contact"
            className="inline-block rounded border border-rice-paper/20 px-5 py-2 text-xs tracking-wider opacity-60 transition hover:opacity-100 sm:px-6 sm:text-sm"
          >
            联系我们 →
          </Link>
        </div>
        <div className="mt-6 border-t border-rice-paper/10 pt-6 text-center text-xs opacity-40">
          © 2026 红湖文学社 Red Lake Literature Society. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default SiteFooter;
