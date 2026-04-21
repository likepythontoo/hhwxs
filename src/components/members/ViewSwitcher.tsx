import { LayoutGrid, List, GitBranch, Clock } from "lucide-react";

export type ViewMode = "card" | "list" | "timeline" | "graph";
export type SortMode = "term" | "works" | "name" | "joined";

interface Props {
  view: ViewMode;
  onViewChange: (v: ViewMode) => void;
  sort: SortMode;
  onSortChange: (s: SortMode) => void;
}

const views: { key: ViewMode; label: string; icon: typeof LayoutGrid }[] = [
  { key: "card", label: "卡片", icon: LayoutGrid },
  { key: "list", label: "列表", icon: List },
  { key: "timeline", label: "时间轴", icon: Clock },
  { key: "graph", label: "关系图", icon: GitBranch },
];

const sorts: { key: SortMode; label: string }[] = [
  { key: "term", label: "按届别" },
  { key: "works", label: "按作品数" },
  { key: "name", label: "按姓名" },
  { key: "joined", label: "按入社时间" },
];

const ViewSwitcher = ({ view, onViewChange, sort, onSortChange }: Props) => (
  <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-[hsl(var(--archive-cream))]/50 p-2">
    <div className="flex flex-wrap items-center gap-1">
      {views.map(({ key, label, icon: Icon }) => (
        <button
          key={key}
          onClick={() => onViewChange(key)}
          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
            view === key
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:bg-secondary"
          }`}
        >
          <Icon className="h-3.5 w-3.5" />
          {label}
        </button>
      ))}
    </div>
    <div className="flex items-center gap-1.5">
      <span className="text-[11px] text-muted-foreground">排序：</span>
      <select
        value={sort}
        onChange={(e) => onSortChange(e.target.value as SortMode)}
        className="rounded-lg border border-border bg-background px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
      >
        {sorts.map((s) => (
          <option key={s.key} value={s.key}>{s.label}</option>
        ))}
      </select>
    </div>
  </div>
);

export default ViewSwitcher;
