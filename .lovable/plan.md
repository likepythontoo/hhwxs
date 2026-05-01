## 需求

目前登录后台后，要查看前台效果只能退出登录或手动改地址栏，非常不方便。希望后台和前台之间能一键互相跳转，**无需登出**。

## 方案

实现"前台 ↔ 后台"双向快捷切换，登录状态保持不变（Supabase session 本来就是全局的，切换路由不会登出）。

### 1. 后台增加"查看前台"按钮（`src/pages/Admin.tsx`）

**桌面端**：在左侧侧边栏底部用户信息区，"退出"按钮旁边新增一个图标按钮 `Home`（来自 lucide-react），点击在**新标签页**打开 `/`，这样后台页面状态（当前所在 tab、滚动位置）不会丢失。

**移动端**：在顶部 header 中，"菜单"按钮和"退出"按钮之间新增一个 `Home` 图标按钮，同样在新标签页打开前台首页。

同时在移动端抽屉菜单顶部用户信息卡片下方，增加一行"返回前台首页"的链接项，点击直接跳转（同窗口）。

### 2. 前台导航增加"管理后台"入口（`src/components/TopBar.tsx`）

当已登录用户拥有管理权限（admin / president / minister）时，在右侧工具栏的"个人中心"旁边显示一个 `LayoutDashboard` 图标 + "管理后台"链接，指向 `/admin`。普通社员（member）不显示此入口。

**实现细节**：
- 在现有的 `useEffect` 中，登录后并行查询 `user_roles` 表，用 `useState<boolean>` 存 `hasAdminAccess`。
- 判断逻辑：`roles.some(r => ['admin','president','minister'].includes(r))`。
- 登出时重置为 `false`。

### 3. （可选小优化）后台 header 标题可点击

桌面端后台顶部 header 的标题区域，左侧加一个小的"↗ 前台"文字链接（`text-xs text-muted-foreground hover:text-primary`），点击在新标签打开 `/`。这样在大屏幕上不用跑到侧边栏底部就能切换。

## 涉及文件

- `src/pages/Admin.tsx`：桌面侧边栏底部 + 移动端 header + 桌面端 header 增加"返回前台"入口
- `src/components/TopBar.tsx`：登录用户若有管理权限，显示"管理后台"快捷入口

## 用户体验

- 在后台工作时，点击右下角 🏠 → 新窗口打开前台，**两个窗口并存**，可以一边改一边看效果。
- 在前台浏览时，顶部能直接看到"管理后台"入口，一键回到后台，**无需重新登录**。
- 登录态由 Supabase 自动维持，切换不影响 session。
