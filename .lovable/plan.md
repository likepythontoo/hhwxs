

## 历届社团成员展示 + 个性签名 & 作品集

### 概述
新建数据库表存储每届社团成员信息（含个性签名），并与现有 `submissions` 表关联展示个人作品集。前台新增"历届成员"页面，按届分组展示，点击成员可查看详情（签名 + 作品列表）。

### 数据库变更

#### 1. 新建 `members` 表
```sql
CREATE TABLE public.members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,  -- 可选关联
  name text NOT NULL,
  term text NOT NULL,           -- 如 "2025届"
  role_title text,              -- 如 "社长"、"编辑部部长"、"社员"
  bio text,                     -- 个性签名
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;

-- 公开可读
CREATE POLICY "Members viewable by everyone" ON public.members
  FOR SELECT TO public USING (true);

-- 管理员可管理
CREATE POLICY "Admin can manage members" ON public.members
  FOR ALL TO public USING (has_admin_access(auth.uid()));

-- 本人可编辑自己的签名
CREATE POLICY "Users can update own member record" ON public.members
  FOR UPDATE TO authenticated USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

#### 2. 新建 `member_works` 关联表
将成员与已有的 `submissions` 表关联，展示个人作品集：
```sql
CREATE TABLE public.member_works (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id uuid NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  submission_id uuid NOT NULL REFERENCES public.submissions(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(member_id, submission_id)
);

ALTER TABLE public.member_works ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Member works viewable by everyone" ON public.member_works
  FOR SELECT TO public USING (true);

CREATE POLICY "Admin can manage member works" ON public.member_works
  FOR ALL TO public USING (has_admin_access(auth.uid()));
```

### 前端实现

#### 1. 新页面 `src/pages/Members.tsx`
- 按届（term）分组展示成员卡片网格
- 每个卡片显示：头像、姓名、职务、个性签名摘要
- 点击卡片弹出详情弹窗，显示完整签名 + 作品列表（从 `member_works` JOIN `submissions` 获取）
- 支持按届筛选

#### 2. 路由注册
- `App.tsx` 添加 `/members` 路由
- 导航菜单中添加入口（在"历届管理团队"附近）

#### 3. 后台管理 `src/components/admin/MemberDirectoryManagement.tsx`
- 管理员可按届添加/编辑/删除成员
- 可为成员关联已审核通过的投稿作为作品集
- 可从 `leadershipData` 批量导入历届干部数据作为初始数据

#### 4. 个人中心集成
- `Profile.tsx` 中如果当前用户关联了 `members` 记录，显示编辑个性签名入口

### 技术细节
- 作品集复用现有 `submissions` 表数据，不重复存储
- `leadershipData.ts` 中的历史数据可通过管理后台一键导入到 `members` 表
- 成员本人可通过个人中心修改自己的 `bio`（个性签名）

