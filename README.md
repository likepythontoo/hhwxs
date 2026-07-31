# 红湖文学社官网

河北科技学院红湖文学社的官方网站，一个带完整后台内容管理系统的校园文学社团平台：新闻发布、活动签到、在线投稿与审稿、期刊阅读、校友档案库、招新报名，全部内容均可在后台实时维护，改完即刻生效，不需要改一行代码。

- 在线地址：<https://hhwxs.lovable.app/>
- 网站域名：<https://www.hhwxs.cn/>

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-06B6D4?logo=tailwindcss&logoColor=white)
![Supabase](https://img.shields.io/badge/Lovable%20Cloud-Supabase-3ECF8E?logo=supabase&logoColor=white)

---

## 目录

- [项目定位](#项目定位)
- [路由一览](#路由一览)
- [功能特性](#功能特性)
  - [前台](#前台)
  - [后台](#后台admin)
  - [权限模型](#权限模型)
  - [Agent 集成（MCP）](#agent-集成mcp)
- [技术栈](#技术栈)
- [本地开发](#本地开发)
- [目录结构](#目录结构)
- [数据库概览](#数据库概览)
- [存储桶与文件安全](#存储桶与文件安全)
- [设计系统](#设计系统)
- [SEO](#seo)
- [部署](#部署)
- [常见运维操作](#常见运维操作)
- [常见问题排查](#常见问题排查)
- [贡献](#贡献)
- [版权](#版权)

---

## 项目定位

这不是一个静态的社团介绍页，而是一套「前台展示 + 后台运营」的完整系统：

- **对访客**：了解社团、读新闻与作品、看期刊、报名活动、投稿、查校友档案。
- **对社员**：登录后查看个人中心、投稿进度、活动报名与签到记录，认领自己的校友档案。
- **对管理层**：一个覆盖 20+ 模块的后台，新闻、活动、成员、财务、招新、站点配置全都可视化管理，权限按角色和部门隔离。

数据全部存放在 Lovable Cloud（Supabase）的 Postgres 中，所有公开表启用 RLS，前端只能读到策略允许的数据。

---

## 路由一览

| 路由 | 页面 | 是否需要登录 |
| --- | --- | --- |
| `/` | 首页：英雄轮播、快捷入口、最新动态、近期活动、访问统计 | 否 |
| `/about` | 关于我们：统计卡片、发展历程、荣誉里程碑、核心特色 | 否 |
| `/charter` | 社团章程 | 否 |
| `/leadership` | 历届管理团队（多种展示形态） | 否 |
| `/news` | 新闻中心列表 | 否 |
| `/news/:id` | 新闻详情 | 否 |
| `/events` | 活动列表与报名 | 报名需登录 |
| `/checkin` | 活动现场签到（输入签到码） | 是 |
| `/submit` | 在线投稿 | 是 |
| `/works` | 作品展示（已审核通过的稿件） | 否 |
| `/journals` | 《红湖》期刊 PDF 列表 | 否 |
| `/moxiang` | 《墨香阁》互动报纸目录 | 否 |
| `/moxiang/:id` | 《墨香阁》阅读器 | 否 |
| `/members` | 校友档案库（多视图 + 数据可视化） | 否 |
| `/members/:id` | 校友个人档案页 | 否 |
| `/join` | 招新报名 | 否 |
| `/forum` | 论坛 | 发帖需登录 |
| `/documents` | 文件中心 | 否 |
| `/contact` | 联系我们（留言表单 + 地图） | 否 |
| `/profile` | 个人中心 | 是 |
| `/auth` | 登录 / 注册（支持 `?next=` 回跳） | — |
| `/admin` | 后台管理面板 | 是（需管理角色） |
| `/.lovable/oauth/consent` | MCP OAuth 授权同意页 | 是 |

---

## 功能特性

### 前台

| 模块 | 说明 |
| --- | --- |
| 首页 | 英雄轮播（后台可配图文与跳转）、快捷入口宫格、最新动态、近期活动、访问统计计数 |
| 新闻中心 | 社情快讯 / 通知公告 / 文学前沿三大分类，封面图 + 正文富文本，独立详情页 `/news/:id` |
| 活动 | 活动列表、状态区分（即将开始 / 已结束）、在线报名；`/checkin` 现场签到，签到码由后端 RPC `validate_checkin_code()` 校验，前端拿不到明文 |
| 在线投稿 | react-hook-form + zod 校验，支持附件上传，稿件进入后台审核队列并可追踪状态与审稿意见 |
| 作品展示 | 按体裁筛选，展示 `submissions` 中 `status = approved` 的作品 |
| 刊物 | 《红湖》期刊 PDF 在线阅读/下载；《墨香阁》互动报纸阅读器，按体裁（诗歌 / 散文 / 小说）自动切换排版与字体 |
| 校友档案库 | 卡片 / 列表 / 时间轴 / 关系图四种视图切换；卡片支持 3D 翻转查看寄语与文学标签；配套文学标签云、体裁玫瑰图、届别金字塔、社长时间轴、校友地图、寄语墙、周年纪念卡、新入社动态流 |
| 社员认领与自助登记 | 老社员可提交登记申请并上传证明材料，管理员审核通过后系统自动建档；已有档案可发起「认领」绑定到本人账号 |
| 招新 | 分部门报名表单，各部门负责人只看得到本部门的申请，支持导出 |
| 论坛 | 发帖与评论，后台可管理 |
| 文件中心 | 分类文件下载，后台上传维护 |
| 全站搜索 | `Ctrl + K`（macOS `⌘K`）唤起 cmdk 面板，跨新闻 / 作品 / 活动模糊搜索 |
| 前后台互跳 | 管理角色登录后，前台顶栏显示金色「管理后台」入口；后台侧栏也可一键回前台，会话共享无需重复登录 |

### 后台（`/admin`）

侧边栏模块清单：

| 分组 | 模块 |
| --- | --- |
| 内容 | 新闻管理、活动管理、投稿审核、期刊与墨香阁、论坛管理、文件中心 |
| 人员 | 成员管理、校友名录（支持 Excel/CSV 批量导入）、认领申请、自助登记申请、部门管理、历届管理团队 |
| 运营 | 招新管理、签到管理、财务收支、留言管理、导出中心 |
| 站点配置 | 首页轮播、快捷入口、关于页内容、站点设置 |
| 系统 | 审计日志、数据看板 |

要点：

- **批量导入**：`MemberBulkImportDialog` 基于 `xlsx` 解析 Excel/CSV，提供模板下载、字段映射、导入预览与「跳过重复」选项。
- **导出中心**：招新报名、成员名录等数据可一键导出为表格。
- **审计日志**：关键写操作记录在 `audit_logs`，可按操作人与时间检索。
- **即时生效**：后台保存后前台直接读取数据库，刷新即见，无需重新部署。

### 权限模型

角色存放在**独立的 `user_roles` 表**（`admin` / `president` / `minister` 等），绝不写在用户资料表上，避免提权攻击。

访问控制由三个 security definer 函数配合 RLS 策略完成：

| 函数 | 作用 |
| --- | --- |
| `has_role(_user_id, _role)` | 判断用户是否拥有某个角色 |
| `has_admin_access(_user_id)` | 是否具备后台管理权限 |
| `has_management_access(_user_id)` | 是否具备管理层（含部门负责人）权限 |
| `is_department_head(_user_id, _department)` | 是否为某部门负责人，用于招新数据隔离 |

### Agent 集成（MCP）

内置一台受 OAuth 保护的 MCP 服务器（`supabase/functions/mcp`，源码定义在 `src/lib/mcp/`），可接入 ChatGPT / Claude / Cursor 等客户端。

| 工具 | 说明 | 需登录 |
| --- | --- | --- |
| `list_news` | 列出已发布新闻 | 否 |
| `get_news` | 按 ID 获取新闻正文 | 否 |
| `list_events` | 列出活动，可按 upcoming / past 过滤 | 否 |
| `list_members` | 查询历届成员，可按届别或姓名搜索 | 否 |
| `list_works` | 查询已通过审核的公开作品 | 否 |
| `get_my_profile` | 获取当前用户资料、角色与关联档案 | 是 |
| `list_my_submissions` | 查看自己的投稿与审核意见 | 是 |
| `create_submission` | 以当前用户身份提交作品 | 是 |

所有调用均以登录用户身份执行，受 RLS 约束；授权同意页位于 `/.lovable/oauth/consent`，未登录时跳转 `/auth?next=...` 并在登录后回到授权流程。

---

## 技术栈

| 层 | 选型 |
| --- | --- |
| 框架 | React 18 + Vite 5 + TypeScript 5 |
| 样式 | Tailwind CSS 3、shadcn/ui（Radix UI）、`@tailwindcss/typography` |
| 后端 | Lovable Cloud（Supabase）：Postgres + RLS、Auth、Storage、Edge Functions |
| 数据请求 | `@supabase/supabase-js`、`@tanstack/react-query` |
| 表单 | `react-hook-form` + `zod`（`@hookform/resolvers`） |
| 动效 | `framer-motion` |
| 图表 | `recharts`（玫瑰图、金字塔、财务统计） |
| 轮播 | `embla-carousel-react` |
| 表格导入导出 | `xlsx` |
| 命令面板 | `cmdk` |
| 图标 | `lucide-react` |
| 通知 | `sonner` + shadcn toaster |
| 测试 | Vitest + Testing Library + jsdom |
| MCP | `@lovable.dev/mcp-js`（Vite 插件自动生成 Edge Function） |

---

## 本地开发

需要 Node.js 18+（推荐用 [nvm](https://github.com/nvm-sh/nvm#installing-and-updating) 安装）。

```sh
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>
npm i
npm run dev
```

常用脚本：

| 命令 | 作用 |
| --- | --- |
| `npm run dev` | 启动开发服务器（默认 8080 端口） |
| `npm run build` | 生产构建 |
| `npm run build:dev` | development 模式构建（便于排查压缩后问题） |
| `npm run preview` | 本地预览构建产物 |
| `npm run lint` | ESLint 检查 |
| `npm run test` | 运行单元测试（Vitest 一次性） |
| `npm run test:watch` | 监听模式跑测试 |

根目录 `.env` 需要以下变量（由 Lovable Cloud 自动生成，仅列变量名，切勿把真实值提交到仓库）：

```
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
VITE_SUPABASE_PROJECT_ID=
```

> `VITE_SUPABASE_PUBLISHABLE_KEY` 是可公开的 anon key，安全边界由 RLS 保证；service role key 不在本仓库出现，也不应该出现。

---

## 目录结构

```text
├── index.html                  站点入口，含 SEO meta、JSON-LD 与静态兜底正文
├── public/
│   ├── robots.txt              放行 Baiduspider / 360Spider 等国内蜘蛛
│   ├── sitemap.xml             全部公开路由
│   └── baidu_verify_*.html     百度站长平台验证文件
├── src/
│   ├── pages/                  路由页面（首页、新闻、活动、校友、后台等）
│   ├── components/
│   │   ├── admin/              后台各管理模块，一个模块一个组件
│   │   ├── members/            校友档案库的视图与数据可视化组件
│   │   ├── ui/                 shadcn/ui 基础组件
│   │   ├── MainNav / TopBar / SiteFooter    全站框架
│   │   ├── HeroCarousel / QuickLinks / NewsSection / UpcomingEvents  首页区块
│   │   ├── Leadership*.tsx     历届团队的多种展示形态
│   │   └── GlobalSearch.tsx    Ctrl+K 全站搜索
│   ├── hooks/                  自定义 Hook（useLeadershipData、use-mobile、use-toast）
│   ├── integrations/supabase/  自动生成的客户端与数据库类型（勿手改）
│   ├── lib/mcp/                MCP 服务器定义与 8 个工具
│   ├── data/                   早期硬编码数据（已迁移至数据库，保留作兜底）
│   ├── test/                   Vitest 配置与用例
│   └── index.css               设计令牌（配色、字体、阴影）
├── supabase/
│   ├── config.toml             项目配置（自动生成）
│   └── functions/mcp/          MCP Edge Function（由 Vite 插件自动生成）
├── tailwind.config.ts
├── vite.config.ts              含 mcpPlugin 与 lovable-tagger
└── vitest.config.ts
```

---

## 数据库概览

| 表 | 用途 |
| --- | --- |
| `news` | 新闻与公告（分类、封面、是否发布） |
| `events` | 活动信息、时间、地点、签到码 |
| `event_registrations` | 活动报名记录 |
| `check_ins` | 现场签到记录 |
| `members` | 校友档案（届别、部门、简介、标签、寄语） |
| `member_works` | 校友代表作 |
| `member_claims` | 档案认领申请 |
| `member_registration_requests` | 老社员自助登记申请（含证明材料） |
| `submissions` | 投稿正文、体裁、审核状态与审稿意见 |
| `journals` | 《红湖》期刊与《墨香阁》报纸 |
| `journal_articles` | 墨香阁单篇文章（体裁决定阅读器排版） |
| `leadership_terms` | 历届管理团队届别 |
| `leadership_departments` | 各届部门与成员构成 |
| `departments` | 社团部门 |
| `department_members` | 部门成员与负责人 |
| `recruitment_applications` | 招新报名表 |
| `forum_posts` / `forum_comments` | 论坛帖子与评论 |
| `documents` | 文件中心 |
| `hero_slides` | 首页轮播 |
| `quick_links` | 首页快捷入口 |
| `about_content_items` | 关于页统计 / 历程 / 荣誉 / 特色 |
| `site_settings` | 站点级键值配置（联系方式、文案等） |
| `messages` | 联系我们留言 |
| `finances` | 财务收支 |
| `profiles` | 用户资料（姓名、学号等） |
| `user_roles` | 用户角色（权限唯一来源） |
| `audit_logs` | 操作审计 |
| `site_visits` | 访问统计 |

数据库函数：`has_role()`、`has_admin_access()`、`has_management_access()`、`is_department_head()`、`validate_checkin_code()`。所有 public 表均已启用 RLS 并配置 GRANT。

---

## 存储桶与文件安全

- **公开资源**（轮播图、期刊 PDF、文件中心、成员头像）放在公开桶，直接用公开 URL。
- **投稿附件与登记证明材料**放在**私有桶**，前端一律通过 **Signed URL** 临时访问，不暴露长期地址。
- 上传统一走 Supabase Storage 客户端，路径按 `用户ID/时间戳-文件名` 组织，避免覆盖。

---

## 设计系统

- 视觉基调：**电影感学术风**——深红 + 米白 + 深灰，金色作点缀。
- 所有颜色、渐变、阴影都定义为 `src/index.css` 中的语义化设计令牌（HSL），组件里**不写死** `text-white`、`bg-[#xxx]` 之类的工具类，保证主题一致与暗色模式可用。
- 滚动进场、玻璃拟态、卡片 3D 翻转等动效统一用 `framer-motion`（见 `ScrollReveal.tsx`）。
- 移动端导航为宫墙红抽屉，带交错淡入动画。
- 字体通过非阻塞异步方式加载 Google Fonts，避免拖慢首屏 FCP。

---

## SEO

- `index.html` 内置针对国内搜索引擎的 meta（`renderer`、`no-siteapp`、`applicable-device` 等）与隐藏静态正文，便于不执行 JS 的蜘蛛抓取
- `robots.txt` 显式放行 Baiduspider、360Spider、Sogou、YisouSpider
- `sitemap.xml` 覆盖全部公开路由
- 注入 `Organization` 与 `WebSite` 的 JSON-LD 结构化数据
- 单一 H1、语义化标签、图片 alt、图片懒加载
- Google Search Console 已完成站点验证；`public/baidu_verify_*.html` 为百度站长验证文件

> 建议：绑定并备案国内域名，海外子域在百度的收录效果有限。

---

## 部署

- **Lovable**：打开项目点击 Share → Publish 即可发布；也可在 Project → Settings → Domains 绑定自定义域名
- **GitHub 同步**：仓库与 Lovable 双向同步，本地推送的改动会自动回流到 Lovable
- **自托管**：代码为标准 Vite + React 项目，`npm run build` 后把 `dist/` 部署到任意静态托管平台，并在托管环境配置上述环境变量。仓库内 `vercel.json` 已配置 SPA rewrite，其他平台需自行把所有路由回退到 `index.html`

---

## 常见运维操作

| 我想… | 怎么做 |
| --- | --- |
| 改首页轮播图 | 后台 → 首页轮播，新增/排序/上下架 |
| 发一条新闻 | 后台 → 新闻管理 → 新建，选好分类并勾选「发布」 |
| 办一场活动并签到 | 后台 → 活动管理新建活动 → 生成签到码 → 现场让大家在 `/checkin` 输入 |
| 审稿 | 后台 → 投稿审核，通过后自动出现在 `/works` |
| 一次导入一届名单 | 后台 → 校友名录 → 批量导入，先下载模板 |
| 改联系方式 / 站点文案 | 后台 → 站点设置 |
| 给某人管理员权限 | 在 `user_roles` 表为该用户新增一条 `admin` 角色记录 |

---

## 常见问题排查

- **后台改了前台没变**：先确认内容的「发布 / 启用」开关已打开；再硬刷新（`Ctrl+Shift+R`）。
- **报「permission denied」**：多半是新表缺少 RLS 策略或 GRANT，检查该表的策略是否覆盖当前角色。
- **登录后进不了 `/admin`**：检查 `user_roles` 中是否有该用户的管理角色记录。
- **MCP 客户端提示 Unsupported provider / 授权失败**：确认已发布站点，且 OAuth 同意页可正常访问。
- **上传的附件打不开**：私有桶资源必须走 Signed URL，直接拼公开地址会 403。

---

## 贡献

1. 从默认分支切出 `feat/xxx` 或 `fix/xxx` 分支
2. 提交前跑一遍 `npm run lint` 与 `npm run test`
3. 提 PR 并说明改动范围与影响的页面
4. 不要手改 `src/integrations/supabase/client.ts`、`types.ts`、`.env` 与 `supabase/config.toml`（均为自动生成）

---

## 版权

© 红湖文学社 · 河北科技学院。站内文字与作品版权归原作者及社团所有，未经许可请勿转载。
