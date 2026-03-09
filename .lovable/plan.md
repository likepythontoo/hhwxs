

## 计划：生成 sitemap.xml 并优化 SEO meta 标签

### 1. 创建 `public/sitemap.xml`

为所有公开页面生成静态 sitemap，包含：`/`、`/about`、`/charter`、`/leadership`、`/news`、`/events`、`/works`、`/contact`、`/join`、`/journals`、`/moxiang`、`/forum`、`/documents`。

排除非公开页面：`/auth`、`/admin`、`/profile`、`/checkin`、`/submit`、`/moxiang/:id`。

域名使用已发布的 `https://hhwxs.lovable.app`。

### 2. 更新 `public/robots.txt`

添加 `Sitemap: https://hhwxs.lovable.app/sitemap.xml` 引用，并增加百度爬虫（Baiduspider）规则。

### 3. 优化 `index.html` meta 标签

- 精简 `description`，去除重复语句，控制在 150 字以内
- 添加 `keywords` meta 标签（红湖文学社、河北科技学院、文学社团等）
- 添加 `og:url`、`og:site_name`
- 添加 `canonical` link 标签
- 修正 `twitter:site` 为实际值或移除

### 技术细节

由于项目是 React SPA，sitemap 是静态文件，仅覆盖已知路由。动态路由（如 `/moxiang/:id`）无法在静态 sitemap 中列出。这对百度等不执行 JS 的爬虫已是最大程度的优化。

