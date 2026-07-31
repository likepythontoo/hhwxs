# 红湖文学社官网

河北科技学院红湖文学社的官方网站，一个带完整后台内容管理系统的校园文学社团平台：新闻发布、活动签到、在线投稿与审稿、期刊阅读、校友档案库、招新报名，全部内容均可在后台实时维护。

在线地址：<https://hhwxs.lovable.app/>
网站域名：<https://www.hhwxs.cn/>

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-06B6D4?logo=tailwindcss&logoColor=white)
![Supabase](https://img.shields.io/badge/Lovable%20Cloud-Supabase-3ECF8E?logo=supabase&logoColor=white)

---

## 功能特性

### 前台

| 模块 | 说明 |
| --- | --- |
| 首页 | 英雄轮播、快捷入口、最新动态、近期活动、访问统计 |
| 新闻中心 | 社情快讯 / 通知公告 / 文学前沿三大分类，含独立详情页 `/news/:id` |
| 活动 | 活动列表、报名，配合 `/checkin` 现场签到（签到码由后端 RPC 校验） |
| 在线投稿 | 表单校验 + 附件上传，稿件进入后台审核队列 |
| 作品展示 | 展示审核通过的诗歌、小说、散文等作品 |
| 刊物 | 《红湖》期刊 PDF 列表，以及《墨香阁》互动报纸阅读器（按体裁切换排版） |
| 校友档案库 | 卡片 / 列表 / 时间轴 / 关系图多视图，文学标签云、体裁玫瑰图、届别金字塔、寄语墙、周年纪念、新入社动态 |
| 社员认领 | 老社员可自助提交登记申请并上传证明材料，管理员审核后自动建档 |
| 招新 | 分部门报名表单，各部门负责人只看得到本部门申请 |
| 其他 | 论坛、文件中心、社团章程、关于我们、联系我们、个人中心 |
| 全站搜索 | `Ctrl + K` 唤起，跨新闻 / 作品 / 活动模糊搜索 |

### 后台（`/admin`）

新闻、活动、成员、校友名录（支持 Excel/CSV 批量导入）、投稿审核、期刊与墨香阁、招新、部门、财务、签到、文件中心、首页轮播、快捷入口、关于页内容、历届管理团队、留言、认领与登记申请、审计日志、导出中心、站点设置。

后台改动即时反映到前台，无需改代码。前后台可互相一键跳转，无需重复登录。

### 权限模型

角色存放在独立的 `user_roles` 表（`admin` / `president` / `minister` 等），通过 `has_role()` 安全定义函数配合 RLS 策略控制访问，**不**把角色写在用户资料表上。

### Agent 集成（MCP）

内置一台受 OAuth 保护的 MCP 服务器（`supabase/functions/mcp`），提供 8 个工具：
`list_news`、`get_news`、`list_events`、`list_members`、`list_works`、`get_my_profile`、`list_my_submissions`、`create_submission`。
所有调用均以登录用户身份执行，受 RLS 约束。授权同意页位于 `/.lovable/oauth/consent`。

---

## 技术栈

- **前端**：React 18、Vite 5、TypeScript、Tailwind CSS 3、shadcn/ui（Radix UI）
- **后端**：Lovable Cloud（Supabase）— Postgres + RLS、鉴权、对象存储、Edge Functions
- **关键库**：framer-motion（动效）、recharts（图表）、react-hook-form + zod（表单校验）、@tanstack/react-query（数据请求）、embla-carousel（轮播）、xlsx（批量导入导出）、cmdk（全局搜索）
- **测试**：Vitest + Testing Library

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
| `npm run preview` | 本地预览构建产物 |
| `npm run lint` | ESLint 检查 |
| `npm run test` | 运行单元测试 |

根目录 `.env` 需要以下变量（由 Lovable Cloud 自动生成，仅列变量名，切勿把真实值提交到仓库）：

```
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
VITE_SUPABASE_PROJECT_ID=
```

---

## 目录结构

```text
├── index.html                  站点入口，含 SEO meta、JSON-LD 与静态兜底正文
├── public/
│   ├── robots.txt              放行 Baiduspider / 360Spider 等国内蜘蛛
│   └── sitemap.xml             全部公开路由
├── src/
│   ├── pages/                  路由页面（首页、新闻、活动、校友、后台等）
│   ├── components/             通用组件（导航、页脚、轮播、全局搜索…）
│   │   ├── admin/              后台各管理模块
│   │   ├── members/            校友档案库的视图与数据可视化组件
│   │   └── ui/                 shadcn/ui 基础组件
│   ├── hooks/                  自定义 Hook
│   ├── integrations/supabase/  自动生成的客户端与数据库类型（勿手改）
│   ├── lib/mcp/                MCP 服务器定义与工具
│   └── index.css               设计令牌（配色、字体、阴影）
├── supabase/
│   └── functions/mcp/          MCP Edge Function（由 Vite 插件自动生成）
└── tailwind.config.ts
```

---

## 数据库概览

| 表 | 用途 |
| --- | --- |
| `news` | 新闻与公告 |
| `events` / `event_registrations` / `check_ins` | 活动、报名与现场签到 |
| `members` / `member_works` / `member_claims` | 校友档案、代表作、档案认领 |
| `member_registration_requests` | 老社员自助登记申请 |
| `submissions` | 投稿及审核状态 |
| `journals` / `journal_articles` | 《红湖》期刊与《墨香阁》文章 |
| `leadership_terms` / `leadership_departments` | 历届管理团队 |
| `departments` / `department_members` | 部门与部门成员 |
| `recruitment_applications` | 招新报名 |
| `forum_posts` / `forum_comments` | 论坛 |
| `documents` | 文件中心 |
| `hero_slides` / `quick_links` / `about_content_items` / `site_settings` | 前台可配置内容 |
| `messages` | 联系我们留言 |
| `finances` | 财务收支 |
| `profiles` / `user_roles` | 用户资料与角色 |
| `audit_logs` / `site_visits` | 操作审计与访问统计 |

数据库函数：`has_role()`、`is_department_head()`、`validate_checkin_code()`。所有公开表均已启用 RLS。

---

## SEO

- `index.html` 内置针对国内搜索引擎的 meta（`renderer`、`no-siteapp`、`applicable-device` 等）与隐藏静态正文，便于不执行 JS 的蜘蛛抓取
- `robots.txt` 显式放行 Baiduspider、360Spider、Sogou、YisouSpider
- `sitemap.xml` 覆盖全部公开路由
- 注入 `Organization` 与 `WebSite` 的 JSON-LD 结构化数据
- Google Search Console 已完成站点验证

> 建议：绑定并备案国内域名，海外子域在百度的收录效果有限。

---

## 部署

- **Lovable**：打开项目点击 Share → Publish 即可发布；也可在 Project → Settings → Domains 绑定自定义域名
- **GitHub 同步**：仓库与 Lovable 双向同步，本地推送的改动会自动回流到 Lovable
- **自托管**：代码为标准 Vite + React 项目，`npm run build` 后把 `dist/` 部署到任意静态托管平台，并在托管环境配置上述环境变量

---

## 贡献

1. 从默认分支切出 `feat/xxx` 或 `fix/xxx` 分支
2. 提交前跑一遍 `npm run lint` 与 `npm run test`
3. 提 PR 并说明改动范围与影响的页面

---

## 版权

© 红湖文学社 · 河北科技学院。站内文字与作品版权归原作者及社团所有，未经许可请勿转载。
