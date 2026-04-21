

## 校友档案库丰富化方案

### 现状盘点

当前 `/members` 页面已有：成员卡片网格、届别/职位筛选、统计数字、社长时间线、城市分布、合影墙、作者排行、自助登记。但视觉单调、信息密度低、互动性弱。

### 增强方向（5 大模块）

#### 1. 视图切换 + 排序（卡片更丰富）
- 顶部增加 **"卡片 / 列表 / 时间轴 / 关系图"** 4 种视图切换
- 增加排序：按届别、按作品数、按姓名拼音、按入社时间
- `MemberCard` 增强：显示文学标签胶囊、所在城市、作品数徽章、悬停时翻转显示更多信息（背面：寄语/回忆首句）

#### 2. 文学流派 / 标签云
- 新增 **`LiteraryTagCloud.tsx`** 组件：聚合所有成员 `literary_tags`，按出现频次生成动态字号标签云
- 点击标签 → 筛选出该流派所有成员
- 配合"诗歌系 / 小说系 / 散文系"分类着色

#### 3. 校友风采 · 精选寄语墙
- 新增 **`MemoirWall.tsx`**：从所有成员的 `memoir`/`bio` 字段抽取，瀑布流卡片，poster 风格引文
- 每张卡随机不同高度、轻微旋转角度、纸张纹理底色
- 配合作者姓名与届别水印

#### 4. 互动性增强
- **生日 / 入社纪念日**：在 `members` 表新增 `joined_date`、`birthday`（可选），首页轮播"今日纪念"卡片
- **校友寻人板**：基于 `member_registration_requests` 的"待审核 + 已通过"组合，公开展示"最近 X 位刚加入档案库的校友"动态时间流
- **排行榜扩展**：除作品数排行，新增"最受推荐作品作者"（基于 `submissions.recommend_count`）、"最活跃届别"、"地域明星"

#### 5. 数据可视化升级
- **届别金字塔图**：横向条形图，每届人数 + 该届产出作品数双指标
- **流派玫瑰图**：用 SVG 玫瑰图展示文学流派分布
- **地域热力卡**：现有 `AlumniMap` 升级为带数字气泡 + 排名前 3 高亮

### 文件清单

**数据库**
- 迁移：`members` 表增加 `joined_date date`、`birthday date`、`featured_quote text`（可选纪念字段）

**新增组件**
- `src/components/members/ViewSwitcher.tsx` — 视图模式切换器
- `src/components/members/MemberListView.tsx` — 紧凑列表视图（Excel 风格）
- `src/components/members/MemberRelationGraph.tsx` — D3/SVG 校友关系图（同届连线）
- `src/components/members/LiteraryTagCloud.tsx` — 标签云
- `src/components/members/MemoirWall.tsx` — 寄语瀑布流墙
- `src/components/members/AnniversaryCard.tsx` — 今日纪念卡
- `src/components/members/RecentJoinFeed.tsx` — 新加入校友时间流
- `src/components/members/TermPyramid.tsx` — 届别金字塔图
- `src/components/members/GenreRoseChart.tsx` — 流派玫瑰图

**修改组件**
- `src/components/members/MemberCard.tsx` — 翻转效果、标签、作品徽章
- `src/components/members/AlumniMap.tsx` — 加排名气泡
- `src/components/members/AuthorRanking.tsx` — 新增 Tab：作品数 / 推荐数 / 活跃度
- `src/pages/Members.tsx` — 集成新模块、视图切换、排序
- `src/pages/MemberProfile.tsx` — 编辑表单加入生日/入社日/精选寄语

### 视觉风格
延续"考究学术档案"风格：米色纸张 + 深栗红 + 墨黑印章感；新模块统一使用 Framer Motion 滚动入场、轻微旋转/位移；标签云、玫瑰图采用 archive-cream/charcoal 主色谱。

### 实施顺序
1. 数据库迁移 + 视图切换框架
2. MemberCard 翻转 + 列表视图
3. 标签云 + 寄语墙（最具视觉冲击）
4. 数据可视化（金字塔 + 玫瑰图）
5. 关系图 + 纪念卡（互动收尾）

