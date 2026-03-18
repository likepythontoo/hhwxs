

## 高级"历届成员"页面 — 文学社校友档案库

### 概述
将现有的简单成员列表页面重构为一个沉浸式的"数字档案馆"，融合文学感设计、丰富的交互功能和权限管理体系。

### 数据库变更

#### 1. 扩展 `members` 表字段
```sql
ALTER TABLE public.members
  ADD COLUMN IF NOT EXISTS major text,           -- 专业
  ADD COLUMN IF NOT EXISTS introduction text,     -- 个人介绍（长文本）
  ADD COLUMN IF NOT EXISTS literary_tags text[],  -- 文学标签 ['诗歌','小说']
  ADD COLUMN IF NOT EXISTS memoir text,           -- 在文学社的回忆/故事
  ADD COLUMN IF NOT EXISTS city text,             -- 毕业后所在城市
  ADD COLUMN IF NOT EXISTS is_claimed boolean DEFAULT false;  -- 是否已认领
```

#### 2. 扩展 RLS 策略
- 部长（minister）可管理成员记录（新增策略）
- 已认领的成员可编辑自己的 introduction、memoir、literary_tags、city 字段

### 页面结构（自上而下）

#### 区域一：电影感封面 Hero
- 深红色渐变背景 + 毛玻璃纹理
- 大标题："红湖文学社 · 校友档案库"
- 副标题引用一句文学名言
- 搜索框居中（按姓名搜索成员）

#### 区域二：社团统计仪表盘
- 四个统计卡片：成立年份(2006)、历届成员总数、累计作品数、历届社长数
- 数字动画递增效果（framer-motion）
- 米白色背景 + 深灰边框的学术风格

#### 区域三：筛选栏
- 届别筛选（pills）：全部 | 2025届 | 2024届 | ...
- 职位筛选（pills）：全部 | 社长 | 副社长 | 部长 | 社员
- 双重筛选可组合

#### 区域四：成员卡片网格
- 每张卡片：头像、姓名、届别、职位、一句话简介、作品数量标记
- 文学感设计：米白底 + 深红色点缀 + 衬线字体
- 悬浮效果：轻微浮起 + 阴影加深
- 点击进入成员个人详情页（独立路由 `/members/:id`）

#### 区域五：历届社长时间轴
- 垂直时间线，从数据库 `members` 表中筛选 role_title 含"社长"的记录
- 左右交替布局 + 金色节点
- 每个节点：年份、社长姓名、头像

#### 区域六：校友足迹地图
- 基于 `members.city` 字段统计城市分布
- 用中国地图 SVG 或城市气泡图展示
- 标题："红湖文学社足迹"
- 纯前端实现（不需要地图API）

#### 区域七：按届成员照片墙
- 每届一个横向滚动区域，展示该届所有成员头像网格
- 无头像的显示姓名首字

#### 区域八：最受欢迎作者排行榜
- 从 `member_works` + `submissions` 统计每位成员的作品数量
- 显示 Top 10，带排名、姓名、作品数

### 成员个人主页（新路由 `/members/:id`）

独立页面包含：
- **顶部**：头像 + 姓名 + 届别 + 职位 + 专业
- **个人介绍**：长文本展示
- **文学标签**：诗歌/小说/散文等标签展示
- **代表作品列表**：从 member_works JOIN submissions 获取
- **在文学社的回忆**：memoir 字段展示
- **统计卡片**：作品数量（实际统计）
- **"我是这个成员"按钮**：登录用户可认领（将 user_id 绑定到该 member 记录）

### 校友认领功能
- 页面上显示"我是这个成员"按钮（仅登录用户可见）
- 点击后将当前 auth.uid() 写入该 member 的 user_id，设 is_claimed = true
- 认领后可编辑自己的 bio、introduction、memoir、literary_tags、city
- 已认领的成员卡片显示"已认证"徽章

### 权限体系
- **管理员/社长**（admin/president）：完全管理所有成员数据
- **部长**（minister）：可管理成员基本信息（新增 RLS 策略）
- **已认领成员**：仅可编辑自己的资料
- **访客**：只读浏览

### 技术细节
- 使用 framer-motion 实现所有滚动揭示动画
- 配色：深红(primary) + 米白(#FDF6EC) + 深灰(#2D2D2D)
- 中国城市地图用内联 SVG 或简单气泡图（无需外部地图API）
- 统计数字用 useInView + 动画递增
- 搜索使用前端过滤（数据量不大）

### 文件清单
1. **数据库迁移** — 扩展 members 表 + 新增 RLS 策略
2. **`src/pages/Members.tsx`** — 完全重写为档案库主页
3. **`src/pages/MemberProfile.tsx`** — 新建成员个人主页
4. **`src/components/members/MemberCard.tsx`** — 成员卡片组件
5. **`src/components/members/PresidentTimeline.tsx`** — 社长时间轴
6. **`src/components/members/AlumniMap.tsx`** — 校友足迹地图
7. **`src/components/members/MemberStats.tsx`** — 统计仪表盘
8. **`src/components/members/AuthorRanking.tsx`** — 作者排行榜
9. **`src/components/members/PhotoWall.tsx`** — 成员照片墙
10. **`src/App.tsx`** — 添加 `/members/:id` 路由

