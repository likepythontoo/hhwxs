# 校友档案库 2.0 · 功能扩展

在现有「红湖文学社 · 校友档案库」基础上，新增四类内容：校友互动、更丰富的个人档案、更深的数据统计、校友活动与聚会。所有由校友本人填写的内容都要经管理员审核后才公开；管理员在后台统一审核与维护。

## 一、校友互动（留言墙 + 寻人）

- 档案库主页新增「校友寄语墙」板块：任何登录用户可给某位校友或整个社团留言祝福，可点赞。
- 留言提交后进入待审核状态，管理员通过后才在页面显示。
- 个人档案页显示收到的祝福列表。
- 新增「寻人启事」：发帖找失联同届同学，管理员审核后公开。

## 二、更丰富的个人档案

个人档案页（/members/:id）扩展为三块内容：

- 照片集：多张老照片 + 说明文字。
- 经历时间线：入社、任职、获奖、毕业去向等条目，按时间排序展示。
- 荣誉与代表作：荣誉条目，以及已有作品的关联展示。

已认领档案的校友可在个人中心提交这些内容的新增/修改，提交后进入审核队列；管理员通过后生效。

## 三、数据与统计升级

档案库主页新增统计板块：

- 届别对比：人数、作品数、认领率横向对比。
- 地域分布深化：按省份聚合，点击省份筛选该地校友。
- 活跃度榜：按留言、作品、活动参与综合排名。
- 档案完整度进度条：提示还有多少校友资料待补全。

## 四、校友活动与聚会

- 新建独立页面 `/alumni-events`：展示返校活动、同届聚会。
- 校友可发起聚会召集（届别、时间、地点、说明），管理员审核后公开。
- 其他校友可一键报名，页面显示已报名人数与名单。
- 档案库主页显示最近 3 条活动概览，点击进入独立页面。

## 五、后台管理

在后台侧边栏「校友档案」分组下新增：

- 校友内容审核：统一处理照片、经历、荣誉、留言、寻人、聚会召集的待审队列，支持通过/驳回并填写理由。
- 校友活动管理：编辑活动信息、查看报名名单、导出。

---

## 技术方案

### 新增数据表（均含 RLS + GRANT）

| 表 | 用途 | 关键字段 |
| --- | --- | --- |
| `member_photos` | 校友照片集 | member_id, image_url, caption, sort_order, status |
| `member_timeline` | 经历时间线 | member_id, happened_on, title, description, kind, status |
| `member_honors` | 荣誉条目 | member_id, year, title, issuer, status |
| `member_messages` | 寄语/祝福 | target_member_id(nullable), author_id, author_name, content, like_count, status |
| `alumni_lookups` | 寻人启事 | author_id, term, target_name, content, contact, status |
| `alumni_gatherings` | 校友聚会 | title, term, gather_at, location, description, organizer_id, status |
| `alumni_gathering_signups` | 聚会报名 | gathering_id, user_id, name, contact |

审核模型统一用 `status text` (`pending`/`approved`/`rejected`) + `reviewer_id` + `reviewer_note` + `reviewed_at`。

### RLS 规则

- 公众（anon/authenticated）只能读 `status = 'approved'` 的行。
- 登录用户可插入自己的内容（`author_id = auth.uid()`），强制 `status='pending'`（通过默认值 + 策略校验）。
- 档案本人（`members.user_id = auth.uid()`）可读自己的 pending 内容。
- `has_management_access(auth.uid())` 可读全部并更新状态；`has_admin_access` 可删除。
- 报名表：本人可增删自己的报名，管理员可读全部；公开只暴露聚合人数（通过视图或前端计数）。

### 前端改动

- `src/pages/Members.tsx`：新增寄语墙、届别对比、地域深化、活跃度榜、档案完整度、最近聚会概览板块。
- `src/pages/MemberProfile.tsx`：新增照片集、时间线、荣誉，及「本人编辑」入口。
- 新建 `src/pages/AlumniEvents.tsx` 并在 `App.tsx` 注册 `/alumni-events`，`MainNav` 增加入口。
- 新建组件目录 `src/components/members/`：`MessageWall`、`LookupBoard`、`MemberPhotoGallery`、`MemberTimelineDetail`、`MemberHonors`、`TermComparison`、`ProvinceMap`、`ActivityRanking`、`ArchiveCompleteness`、`GatheringCard`、`GatheringSignupDialog`、`MemberContentEditDialog`。
- 新建后台组件 `src/components/admin/AlumniContentReview.tsx` 与 `AlumniGatheringManagement.tsx`，接入 `Admin.tsx` 侧边栏。
- 照片上传复用现有 `site-assets` 公共存储桶。
- 视觉延续现有档案库风格（archive-cream/charcoal + 衬线字体 + Framer Motion）。
