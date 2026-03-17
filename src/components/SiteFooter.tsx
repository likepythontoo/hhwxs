import { useState } from "react";
import { Link } from "react-router-dom";

const SiteFooter = () => {
  const [showMap, setShowMap] = useState(false);

  return (
    <footer className="relative bg-ink-black text-rice-paper overflow-hidden">
      {/* Subtle top border glow */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
      
      {/* Decorative bg */}
      <div className="absolute -right-32 -top-32 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />

      <div className="container mx-auto px-4 py-12 sm:py-16 relative">
        <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-4">
          <div className="sm:col-span-2 md:col-span-1">
            <h3 className="mb-5 font-serif text-xl tracking-widest">红湖文学社</h3>
            <p className="text-sm leading-[1.9] text-rice-paper/50">
              河北科技学院红湖文学社成立于2003年，社名取自校园内「红湖」，寓意热血、纯净与深邃。一批批的红湖人在河北科技学院历史上各领风骚，一代代的红湖人以低调做人，高调做事的风格活跃在各个领域。
            </p>
          </div>
          <div>
            <h4 className="mb-4 text-sm font-semibold tracking-wider text-rice-paper/70">快速链接</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/about" className="text-rice-paper/45 transition-colors hover:text-gold-light">社团概况</Link></li>
              <li><Link to="/news" className="text-rice-paper/45 transition-colors hover:text-gold-light">新闻动态</Link></li>
              <li><Link to="/works" className="text-rice-paper/45 transition-colors hover:text-gold-light">作品展示</Link></li>
              <li><Link to="/events" className="text-rice-paper/45 transition-colors hover:text-gold-light">活动中心</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 text-sm font-semibold tracking-wider text-rice-paper/70">社团出版物</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/journals" className="text-rice-paper/45 transition-colors hover:text-gold-light">📖 期刊：《红湖》</Link></li>
              <li><Link to="/moxiang" className="text-rice-paper/45 transition-colors hover:text-gold-light">📰 报刊：《墨香阁》</Link></li>
              <li><Link to="/submit" className="text-rice-paper/45 transition-colors hover:text-gold-light">投稿系统</Link></li>
              <li><Link to="/join" className="text-rice-paper/45 transition-colors hover:text-gold-light">入社申请</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 text-sm font-semibold tracking-wider text-rice-paper/70">联系我们</h4>
            <ul className="space-y-2.5 text-sm">
              <li className="relative"
                onMouseEnter={() => setShowMap(true)}
                onMouseLeave={() => setShowMap(false)}
              >
                <span className="cursor-pointer text-rice-paper/45 transition-colors hover:text-gold-light">
                  📍 河北科技学院（曹妃甸校区）
                </span>
                {showMap && (
                  <div className="absolute bottom-full left-0 z-50 mb-1 w-[280px] rounded-lg border border-border bg-card p-3 shadow-xl">
                    <div className="space-y-1.5 text-xs">
                      <p className="font-medium text-foreground">🏫 河北科技学院 · 曹妃甸校区</p>
                      <p className="text-muted-foreground">河北省唐山市曹妃甸区曹妃甸新城行知路36号</p>
                    </div>
                    <a
                      href="https://uri.amap.com/marker?position=118.460007,39.232719&name=河北科技学院曹妃甸校区&src=红湖文学社"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 block rounded bg-primary px-3 py-1.5 text-center text-xs font-medium text-primary-foreground transition hover:bg-primary/90"
                    >
                      🗺️ 在高德地图中查看
                    </a>
                    <div className="absolute left-0 top-full h-1 w-full" />
                  </div>
                )}
              </li>
              <li className="text-rice-paper/45">📧 1330760849@qq.com</li>
              <li className="text-rice-paper/45">📱 微信公众号：红湖文学社</li>
              <li className="text-rice-paper/45">🎵 抖音：红湖文学社</li>
              <li className="text-rice-paper/45">📺 Bilibili：红湖文学社</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Link
            to="/leadership"
            className="inline-block rounded border border-rice-paper/15 px-6 py-2.5 text-xs tracking-wider text-rice-paper/50 transition-all hover:border-gold/30 hover:text-gold-light"
          >
            历届管理团队 →
          </Link>
          <Link
            to="/contact"
            className="inline-block rounded border border-rice-paper/15 px-6 py-2.5 text-xs tracking-wider text-rice-paper/50 transition-all hover:border-gold/30 hover:text-gold-light"
          >
            联系我们 →
          </Link>
        </div>

        <div className="mt-10 border-t border-rice-paper/8 pt-8 text-center text-xs text-rice-paper/30">
          © 2026 红湖文学社 Red Lake Literature Society. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default SiteFooter;
