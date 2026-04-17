

## 后台内容管理系统（CMS）扩展方案

### 现状问题
当前网站有大量内容**硬编码在前端代码中**，无法通过后台修改：
- **历届管理团队**（`leadershipData.ts`）— 9届团队信息硬编码
- **首页轮播图**（`HeroCarousel.tsx`）— 3张幻灯片标题/描述硬编码
- **快捷入口**（`QuickLinks.tsx`）— 6个功能入口硬编码
- **关于页面**（`About.tsx`）— 部门介绍、发展历程、荣誉表全部硬编码
- **章程页面**（`Charter.tsx`）— 全部章程条款硬编码
- **页脚**（`SiteFooter.tsx`）— 联系方式、社交媒体硬编码
- **系统设置**仅 7 个简单字段

### 目标
让管理员/社长可以在后台**实时编辑**网站几乎所有可变内容，前端读取后端数据动态渲染。

### 实施方案（分阶段，本次先做核心三块）

#### 第一阶段（本次实施）

**1. 历届管理团队管理（核心）**
- 新建数据表 `leadership_terms`：年份、社长、副社长（数组）、排序
- 新建数据表 `leadership_departments`：所属届、部门名、成员（数组）、排序
- 新建后台模块 `LeadershipManagement.tsx`：
  - 列出所有届，可新增/编辑/删除届
  - 每届可编辑社长、副社长（多人）、部门（动态增减）、每个部门下成员（动态增减）
- 改造 5 个 Leadership 展示组件，从 `leadershipData.ts` 改为从数据库读取

**2. 首页轮播图管理**
- 新建数据表 `hero_slides`：图片URL、主标题、副标题、描述、排序、是否启用
- 新建后台模块 `HeroSlidesManagement.tsx`：增删改查 + 拖拽排序 + 图片上传
- 改造 `HeroCarousel.tsx` 从数据库读取

**3. 系统设置扩展**
- 在现有 `site_settings` 表中新增字段（key-value 模式继续使用）：
  - `footer_address` 校区地址
  - `footer_address_detail` 地址详情
  - `footer_amap_url` 高德地图链接
  - `social_douyin` 抖音账号
  - `social_bilibili` B站账号
  - `social_weibo` 微博账号
  - `copyright_text` 版权文字
  - `hero_autoplay_interval` 轮播自动切换秒数
  - `about_intro` 关于页简介段落（长文本）
- `SiteSettings.tsx` 增加分类标签页（基本信息、联系方式、社交媒体、首页设置、关于页面），每类下分组显示，长文本用 textarea
- 改造 `SiteFooter.tsx`、`AboutSection.tsx` 从数据库读取这些设置

#### 第二阶段（后续可继续）
- 关于页详细内容（部门、发展历程、荣誉）独立 CRUD
- 章程条款独立 CRUD
- 快捷入口管理

### 文件清单（本次）
1. **数据库迁移** — 新建 `leadership_terms`、`leadership_departments`、`hero_slides` 表 + RLS；新增 site_settings 默认值
2. **`src/components/admin/LeadershipManagement.tsx`** — 新建团队管理组件
3. **`src/components/admin/HeroSlidesManagement.tsx`** — 新建轮播图管理组件
4. **`src/components/admin/SiteSettings.tsx`** — 重构为分类标签页 + 更多字段
5. **`src/components/admin/AdminDashboard.tsx`** 或 `src/pages/Admin.tsx` — 添加新模块入口
6. **5 个 Leadership 组件** — 改为从数据库读取（带加载态）
7. **`src/components/HeroCarousel.tsx`** — 改为从数据库读取
8. **`src/components/SiteFooter.tsx`** — 联系信息从设置读取
9. **`src/components/AboutSection.tsx`** — 简介从设置读取

### 技术细节
- 使用 React Query 缓存，编辑后 `invalidateQueries` 触发前台实时刷新
- 团队/轮播图采用乐观更新提升交互流畅度
- 图片上传使用 Lovable Cloud Storage（`journals` 公共桶或新建 `site-assets` 桶）
- 现有硬编码 `leadershipData.ts` 在迁移时作为初始数据 INSERT 进数据库（一次性 seed）

