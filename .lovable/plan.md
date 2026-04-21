

## 校友档案库 - 自助登记功能

### 现状
当前 `/members` 页面只能展示**已存在**的成员档案，前社员若发现自己**不在档案库中**（漏登记/遗失），无法自主补录。现有的"认领"功能只针对已存在的成员卡片。

### 目标
新增"**自助登记**"入口，让之前进入过社团但档案缺失的人，可以提交个人信息申请加入档案库，经管理员审核通过后正式录入。

### 实施方案

#### 1. 数据库（新建一张表）
**`member_registration_requests`** —— 自助登记申请表
- `id` uuid 主键
- `user_id` uuid（提交人，已登录）
- `name` text 姓名
- `term` text 届别（如 2018届）
- `role_title` text 当时担任职务（可选）
- `major` text 专业（可选）
- `city` text 现居城市（可选）
- `bio` text 一句话简介（可选）
- `memoir` text 入社经历/补充说明（必填，作为审核依据）
- `contact` text 联系方式（必填，便于核实）
- `evidence_url` text 凭证图片（可选，如老照片、聊天记录等）
- `status` text 默认 `pending`（pending/approved/rejected）
- `reviewer_id` uuid、`reviewer_note` text、`reviewed_at` timestamptz
- `created_at` timestamptz

**RLS 策略**：
- 已登录用户可 INSERT 自己的申请（`auth.uid() = user_id`）
- 用户可 SELECT 自己的申请
- 管理员（`has_admin_access`）可 ALL

凭证图片复用现有 `site-assets` 公共桶，路径 `registration-evidence/{user_id}/{timestamp}.{ext}`。

#### 2. 前端 - 用户提交端
**`src/pages/Members.tsx`** Hero 区域搜索框旁新增按钮"**📝 我也是老社员 · 自助登记**"

**新建 `src/components/members/SelfRegistrationDialog.tsx`** 弹窗表单：
- 未登录 → 提示先登录，跳转 `/auth?redirect=/members`
- 已登录 → 显示表单，使用 zod 校验：姓名/届别/经历/联系方式必填，姓名 ≤50 字、经历 ≤500 字
- 支持上传一张凭证图片（≤5MB，jpg/png）
- 提交后 toast 提示"申请已提交，等待管理员审核"
- 同一用户若已有 pending 申请，显示"您有一条待审核的申请"，禁止重复提交

#### 3. 前端 - 管理员审核端
**新建 `src/components/admin/RegistrationRequestManagement.tsx`**（参考现有 `ClaimManagement.tsx` 风格）：
- 顶部分"待审核 / 已通过 / 已拒绝"三个 Tab
- 每条申请展示：申请人头像、姓名、届别、职务、经历、联系方式、凭证图片预览
- 操作：
  - **通过**：自动在 `members` 表 INSERT 一条新记录（带上 `user_id` + `is_claimed=true`），同时更新申请状态为 approved
  - **拒绝**：填写拒绝理由，状态改为 rejected
- 已处理记录可查看历史

**`src/pages/Admin.tsx`** 在"内容管理"分组中新增 Tab"**校友登记申请**"，图标 `UserPlus`。

#### 4. 通知 & 反馈
- 用户在 `/profile` 个人中心顶部，若有自己的申请记录，展示一张状态卡片（pending/approved/rejected + 拒绝理由）

### 文件清单
1. **数据库迁移** - 新建 `member_registration_requests` 表 + RLS
2. **`src/components/members/SelfRegistrationDialog.tsx`** - 新建用户提交弹窗
3. **`src/pages/Members.tsx`** - Hero 区域增加入口按钮
4. **`src/components/admin/RegistrationRequestManagement.tsx`** - 新建管理员审核组件
5. **`src/pages/Admin.tsx`** - 注册新管理 Tab
6. **`src/pages/Profile.tsx`** - 个人中心展示申请状态（小改动）

### 安全要点
- 表单走 zod 严格校验，长度/必填限制
- 凭证图片走公共桶但路径含 user_id，避免覆盖
- 防重复提交：插入前查询是否已有 pending 记录
- 审核通过创建 members 记录由管理员客户端执行（已有 RLS 保护，仅 admin 可写）

