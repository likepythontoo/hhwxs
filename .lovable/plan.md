# 让国内搜索引擎收录红湖文学社网站

## 现状

- 已有百度站长验证文件 `public/baidu_verify_codeva-wD4e6uujGN.html`
- 已有 `sitemap.xml`、`robots.txt`（已对 Baiduspider 放行）
- `index.html` 已有中文 title/description/keywords
- 但仍是单页应用（SPA），首屏由 JS 渲染，**百度蜘蛛抓取 JS 渲染内容能力很弱**，这是国内搜不到的核心原因
- 站点托管在 `hhwxs.lovable.app`（海外节点），国内访问与抓取都偏慢

## 核心问题

百度/360/搜狗主要靠**静态 HTML** 抓取。当前 `index.html` 的 `<body>` 只有 `<div id="root"></div>`，蜘蛛抓到的页面没有任何中文正文 → 自然无法被收录。

## 优化方案（5 步）

### 1. 在 index.html 注入 SEO 静态正文（关键）
在 `<body>` 的 `#root` 之外追加一段 `<div hidden aria-hidden="true">`，包含网站核心介绍、栏目名、社团历史、关键词的纯文本。蜘蛛能直接读到中文内容，用户看不见，不影响 React 渲染。
内容包括：社团简介、《红湖》《墨香阁》出版物、招新、文学创作、河北科技学院红湖文学社、各栏目链接锚文本等。

### 2. 完善结构化数据（JSON-LD）
在 `<head>` 加入 `Organization` + `WebSite` + `BreadcrumbList` 的 schema.org JSON-LD，便于百度结构化展示（标题+描述+logo+搜索框）。

### 3. 增强 meta 标签（针对国内）
- 添加 `<meta name="baidu-site-verification">`（如果你已在百度站长后台用 meta 方式验证可加上；HTML 文件验证已有）
- 添加 `<meta name="360-site-verification">`、`<meta name="sogou_site_verification">` 占位说明（需要你后续到对应站长平台拿验证码）
- 添加 `<meta name="renderer" content="webkit">`、`<meta name="force-rendering" content="webkit">`（让国产双核浏览器用 Webkit 内核）
- 添加 `<meta name="applicable-device" content="pc,mobile">`
- 添加 `<meta http-equiv="Cache-Control" content="no-siteapp">`（禁止百度转码）
- 添加 `<meta name="MobileOptimized">`、`<meta name="HandheldFriendly">`

### 4. 扩充 sitemap.xml
当前 sitemap 只有 13 个静态路由。补全：
- `/members`、`/leadership`、`/journals`、`/moxiang`、`/forum`、`/checkin`、`/auth`
- 加上 `<lastmod>` 字段提升新鲜度信号
- （可选进阶）后续若想让新闻/作品详情页被收录，需要服务端动态生成 sitemap

### 5. robots.txt 微调 + 添加百度专属指令
- 显式 `Allow: /sitemap.xml`
- 添加 `User-agent: 360Spider`、`Sogou web spider`、`YisouSpider`（神马）放行
- 添加 `Crawl-delay: 1` 给 Baiduspider 友好抓取节奏

## 你需要手动做的事（代码外）

代码改完后，仍需你完成以下"非代码"动作，国内才会真正出现搜索结果：

1. **百度站长平台**（https://ziyuan.baidu.com）
   - 已有验证文件，登录后"用户中心 → 站点管理 → 添加网站 hhwxs.lovable.app"
   - 提交 sitemap：`https://hhwxs.lovable.app/sitemap.xml`
   - 使用"普通收录 → 手动提交"把首页 URL 推一次
   - （强烈建议）绑定一个**国内备案的自有域名**，`.lovable.app` 是海外域，百度对其收录意愿较低

2. **360 搜索站长平台**（https://zhanzhang.so.com）注册并验证

3. **搜狗站长平台**（https://zhanzhang.sogou.com）注册并验证

4. **神马搜索**（https://zhanzhang.sm.cn）移动端流量主要靠它

5. **重要建议：购买并备案国内域名**
   - 海外子域 `*.lovable.app` 在国内无 ICP 备案，百度收录极困难
   - 建议在 Lovable 中绑定一个自有域名（如 `hhwxs.cn`），并到阿里云/腾讯云完成 ICP 备案，国内 SEO 效果会**质变**
   - Lovable 支持自定义域名：项目设置 → Domains → Connect Domain

## 涉及修改的文件

- `index.html` — 注入 SEO 静态正文 + 结构化数据 + 国内 meta
- `public/robots.txt` — 添加 360/搜狗/神马蜘蛛规则
- `public/sitemap.xml` — 补全所有公开路由 + lastmod

## 不会做的事

- 不改动 React 应用渲染逻辑
- 不引入 SSR（Lovable 当前不支持 Next.js 等 SSR 框架）
- 不修改任何业务功能
