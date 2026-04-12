

## 校友档案库认领审核功能

### 概述
将现有的"一键认领"改为"申请认领 → 管理员/社长审核 → 通过后生效"流程。

### 数据库变更

#### 1. 新建 `member_claims` 表
```sql
CREATE TABLE public.member_claims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id uuid NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending',  -- pending / approved / rejected
  note text,                               -- 申请备注（如"我是2024届张三"）
  reviewer_id uuid,
  reviewer_note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz
);

ALTER TABLE public.member_claims ENABLE ROW LEVEL SECURITY;

-- 登录用户可以提交申请
CREATE POLICY "Authenticated can submit claims"
  ON public.member_claims FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 用户可以查看自己的申请
CREATE POLICY "Users can view own claims"
  ON public.member_claims FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- 管理员/社长可管理所有申请
CREATE POLICY "Admin can manage claims"
  ON public.member_claims FOR ALL
  USING (has_admin_access(auth.uid()));
```

### 前端变更

#### 1. 成员个人页 `MemberProfile.tsx`
- 移除直接设置 `is_claimed = true` 的逻辑
- "我是这个成员"按钮改为弹出申请表单（含备注输入框，如"请说明你的身份"）
- 提交后插入 `member_claims` 记录（status=pending）
- 提交后按钮变为"认领审核中…"（查询该用户是否有 pending 的 claim）
- 若已通过则正常显示已认证状态和编辑功能

#### 2. 后台管理 — 新建 `ClaimManagement` 组件
- 在 `AdminDashboard.tsx` 添加"认领审核"标签页
- 列出所有 pending 状态的认领申请：申请人、目标成员、备注、申请时间
- 管理员可"通过"或"拒绝"：
  - 通过：更新 claim 状态为 approved，同时更新 `members` 表的 `user_id` 和 `is_claimed`
  - 拒绝：更新 claim 状态为 rejected，可填写拒绝理由

#### 3. 成员卡片 `MemberCard.tsx`
- 已认领（`is_claimed = true`）的成员显示绿色"已认证"徽章（现有逻辑不变）

### 文件清单
1. **数据库迁移** — 创建 `member_claims` 表 + RLS
2. **`src/pages/MemberProfile.tsx`** — 认领改为申请流程
3. **`src/components/admin/ClaimManagement.tsx`** — 新建认领审核管理组件
4. **`src/components/admin/AdminDashboard.tsx`** — 添加认领审核标签页

