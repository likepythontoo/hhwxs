## 目标

把仓库根目录的 `README.md` 从 Lovable 默认模板，替换成这个项目自己的中文说明文档，让人在 GitHub 上打开就能明白这是什么网站、有哪些功能、怎么跑起来。

## README 结构

1. **标题与简介** — 红湖文学社官网（河北科技学院），一句话定位 + 在线地址 https://hhwxs.lovable.app/
2. **徽章行** — React 18 / Vite 5 / TypeScript / Tailwind / Supabase（静态 shields.io 徽章）
3. **功能特性** — 分组列出：
   - 前台：首页轮播与快捷入口、新闻中心（含详情页）、活动与签到、在线投稿、作品展示、《红湖》期刊与《墨香阁》互动报纸阅读器、校友档案库（卡片/列表/时间轴/关系图多视图、标签云、玫瑰图、寄语墙）、社员自助认领登记、招新报名、论坛、文件中心、全站 Ctrl+K 搜索
   - 后台：新闻/活动/成员/投稿/期刊/招新/财务/文件/快捷入口/关于页内容/首页轮播/历届管理团队/留言/审计日志/导出中心/站点设置
   - 权限：admin / president / minister 等角色，基于独立 `user_roles` 表 + RLS
   - MCP：OAuth 保护的 Agent 集成，8 个工具
4. **技术栈** — 前端、后端（Lovable Cloud / Supabase：数据库、鉴权、存储、Edge Functions）、关键库（framer-motion、recharts、react-hook-form + zod、xlsx、embla）
5. **本地开发** — `npm i` / `npm run dev` / `npm run build` / `npm run lint` / `npm run test`，以及所需的 `.env` 变量名（VITE_SUPABASE_URL、VITE_SUPABASE_PUBLISHABLE_KEY、VITE_SUPABASE_PROJECT_ID，只写变量名不写值）
6. **目录结构** — ```text 代码块，列出 src/pages、src/components/admin、src/components/members、src/lib/mcp、supabase/functions 等主要目录及职责
7. **数据库概览** — 主要表的一句话说明表格（news、events、members、submissions、journals、documents、quick_links、about_content_items、site_settings、user_roles、member_registration_requests 等）
8. **SEO 说明** — 已做的国内搜索引擎优化（index.html 静态正文、robots.txt 放行 Baiduspider、sitemap.xml、JSON-LD），以及建议绑定备案域名
9. **部署** — Lovable 一键发布；GitHub 同步说明；自托管提示
10. **贡献与许可** — 简短的分支/PR 约定，版权归红湖文学社所有

## 技术细节

- 只改 `README.md` 一个文件，不动任何代码。
- 全中文撰写，与站点语言一致；命令与变量名保留英文。
- 不写入任何密钥或真实环境变量值，只列变量名。
- 不引用 Supabase 控制台链接，后端统一称为 Lovable Cloud。
- 数据库表清单在动笔前先读 `src/integrations/supabase/types.ts` 核对，只列真实存在的表。
