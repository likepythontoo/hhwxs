

## 全站搜索功能

### 概述
在顶部导航栏添加搜索按钮，点击后弹出全屏搜索对话框，可搜索**新闻**、**作品**、**活动**三类内容，结果分类展示，点击可跳转到对应页面。

### 实现方案

#### 1. 新建搜索组件 `src/components/GlobalSearch.tsx`
- 使用现有的 `CommandDialog`（cmdk）组件构建搜索弹窗
- 用户输入关键词后，实时查询数据库三张表：
  - `news`（已发布的新闻，匹配 title/content）
  - `submissions`（已审核的作品，匹配 title/content/author_name）
  - `events`（活动，匹配 title/description）
- 搜索结果按类别分组展示（新闻动态 / 作品展示 / 活动中心）
- 点击结果项跳转到对应详情页（`/news`、`/works`、`/events`）
- 支持键盘快捷键 `Ctrl+K` / `⌘+K` 打开

#### 2. 修改 `src/components/TopBar.tsx`
- 在右侧功能区添加搜索图标按钮（Search icon 已导入但未使用）
- 点击打开 GlobalSearch 弹窗

#### 3. 技术细节
- 使用 debounce（300ms）防止频繁查询
- 每类结果最多显示 5 条，避免过多请求
- 利用 Supabase 的 `ilike` 进行模糊匹配
- 无需新建数据库表，直接查询现有表
- RLS 策略已允许公开读取已发布新闻、已审核作品和活动

