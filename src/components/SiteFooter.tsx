const SiteFooter = () => {
  return (
    <footer className="bg-ink-black text-rice-paper">
      <div className="container mx-auto px-4 py-10">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <h3 className="mb-4 font-serif text-lg tracking-widest">红湖文学社</h3>
            <p className="text-sm leading-relaxed opacity-60">
              一批批的红湖人在河北科技学院历史上各领风骚，一代代的红湖人以低调做人，高调做事的风格活跃在各个领域。回顾红湖的光辉史实，我们为自己是一名红湖人而感到骄傲和自豪。
一批批红湖人投入到服务同学，发展文学，传播热情的工作中来，前仆后继。
            
            </p>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold tracking-wider opacity-80">快速链接</h4>
            <ul className="space-y-2 text-sm opacity-60">
              <li><a href="#about" className="transition hover:opacity-100">社团概况</a></li>
              <li><a href="#news" className="transition hover:opacity-100">新闻动态</a></li>
              <li><a href="#works" className="transition hover:opacity-100">作品展示</a></li>
              <li><a href="#archives" className="transition hover:opacity-100">文学档案馆</a></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold tracking-wider opacity-80">社员服务</h4>
            <ul className="space-y-2 text-sm opacity-60">
              <li><a href="#" className="transition hover:opacity-100">投稿系统</a></li>
              <li><a href="#" className="transition hover:opacity-100">活动报名</a></li>
              <li><a href="#" className="transition hover:opacity-100">入社申请</a></li>
              <li><a href="#" className="transition hover:opacity-100">资源下载</a></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold tracking-wider opacity-80">联系我们</h4>
            <ul className="space-y-2 text-sm opacity-60">
              <li>📍 图书馆 A000</li>
              <li>📧 1330760849@qq.com</li>
              <li>📱 微信公众号：红湖文学社</li>
              <li>🎵 抖音：红湖文学社</li>
              <li>📺 Bilibili：红湖文学社</li>
              <li>👨‍🏫 指导老师：某某某</li>
              <li>📞 老师电话：000-0000-0000</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-rice-paper/10 pt-6 text-center text-xs opacity-40">
          © 2026 红湖文学社 Red Lake Literature Society. All rights reserved.
        </div>
      </div>
    </footer>);};

export default SiteFooter;