import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Plus, TrendingUp, TrendingDown, Trash2 } from "lucide-react";

interface Finance {
  id: string;
  type: string;
  amount: number;
  category: string;
  description: string | null;
  transaction_date: string;
  created_at: string;
}

const FinanceManagement = () => {
  const [items, setItems] = useState<Finance[]>([]);
  const [editing, setEditing] = useState<Partial<Finance> | null>(null);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState<"all" | "income" | "expense">("all");

  const fetchFinances = async () => {
    let q = supabase.from("finances").select("*").order("transaction_date", { ascending: false });
    if (filter !== "all") q = q.eq("type", filter);
    const { data } = await q;
    setItems((data as Finance[]) || []);
  };

  useEffect(() => { fetchFinances(); }, [filter]);

  const save = async () => {
    if (!editing?.type || !editing?.amount || !editing?.category) return;
    setSaving(true);
    const payload = {
      type: editing.type,
      amount: editing.amount,
      category: editing.category,
      description: editing.description || null,
      transaction_date: editing.transaction_date || new Date().toISOString().slice(0, 10),
    };
    if (editing.id) {
      await supabase.from("finances").update(payload).eq("id", editing.id);
    } else {
      await supabase.from("finances").insert(payload);
    }
    setSaving(false);
    setEditing(null);
    fetchFinances();
  };

  const deleteItem = async (id: string) => {
    if (!confirm("确定删除？")) return;
    await supabase.from("finances").delete().eq("id", id);
    fetchFinances();
  };

  const totalIncome = items.filter(i => i.type === "income").reduce((s, i) => s + Number(i.amount), 0);
  const totalExpense = items.filter(i => i.type === "expense").reduce((s, i) => s + Number(i.amount), 0);

  const incomeCategories = ["社费", "赞助", "活动收入", "其他收入"];
  const expenseCategories = ["物资采购", "活动经费", "印刷费", "餐饮费", "交通费", "其他支出"];
  const inputClass = "w-full rounded-lg border border-border bg-secondary/30 px-3 py-2 text-sm focus:border-primary focus:outline-none transition";

  return (
    <>
      {/* Summary cards */}
      <div className="mb-6 grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">总收入</p>
          <p className="mt-1 font-serif text-xl font-bold text-green-600">¥{totalIncome.toFixed(2)}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">总支出</p>
          <p className="mt-1 font-serif text-xl font-bold text-red-500">¥{totalExpense.toFixed(2)}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">结余</p>
          <p className={`mt-1 font-serif text-xl font-bold ${totalIncome - totalExpense >= 0 ? "text-primary" : "text-red-500"}`}>¥{(totalIncome - totalExpense).toFixed(2)}</p>
        </div>
      </div>

      <div className="mb-5 flex items-center justify-between">
        <div className="flex gap-1.5">
          {([["all", "全部"], ["income", "收入"], ["expense", "支出"]] as const).map(([k, l]) => (
            <button key={k} onClick={() => setFilter(k)} className={`rounded-full px-3 py-1 text-[11px] font-medium transition ${filter === k ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>{l}</button>
          ))}
        </div>
        <button onClick={() => setEditing({ type: "expense", transaction_date: new Date().toISOString().slice(0, 10) })} className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-medium text-primary-foreground shadow-sm transition hover:opacity-90">
          <Plus className="h-3.5 w-3.5" /> 记一笔
        </button>
      </div>

      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.id} className="group flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3 transition-shadow hover:shadow-md">
            <div className="flex items-center gap-3">
              <div className={`rounded-lg p-2 ${item.type === "income" ? "bg-green-50" : "bg-red-50"}`}>
                {item.type === "income" ? <TrendingUp className="h-4 w-4 text-green-600" /> : <TrendingDown className="h-4 w-4 text-red-500" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">{item.category}</p>
                  {item.description && <p className="text-xs text-muted-foreground">· {item.description}</p>}
                </div>
                <p className="text-[11px] text-muted-foreground">{item.transaction_date}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <p className={`font-serif text-sm font-bold ${item.type === "income" ? "text-green-600" : "text-red-500"}`}>
                {item.type === "income" ? "+" : "-"}¥{Number(item.amount).toFixed(2)}
              </p>
              <button onClick={() => deleteItem(item.id)} className="rounded-lg p-1.5 text-muted-foreground opacity-0 transition group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="py-10 text-center text-sm text-muted-foreground">暂无财务记录</p>}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4 backdrop-blur-sm" onClick={() => setEditing(null)}>
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="mb-5 font-serif text-lg font-bold">💰 记一笔</h3>
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">类型</label>
                <div className="flex gap-2">
                  <button onClick={() => setEditing({ ...editing, type: "income", category: "" })} className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${editing.type === "income" ? "bg-green-600 text-white" : "bg-secondary text-muted-foreground"}`}>收入</button>
                  <button onClick={() => setEditing({ ...editing, type: "expense", category: "" })} className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${editing.type === "expense" ? "bg-red-500 text-white" : "bg-secondary text-muted-foreground"}`}>支出</button>
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">金额 *</label>
                <input type="number" step="0.01" value={editing.amount || ""} onChange={(e) => setEditing({ ...editing, amount: Number(e.target.value) })} className={inputClass} placeholder="0.00" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">分类 *</label>
                <div className="flex flex-wrap gap-1.5">
                  {(editing.type === "income" ? incomeCategories : expenseCategories).map(c => (
                    <button key={c} onClick={() => setEditing({ ...editing, category: c })} className={`rounded-full px-3 py-1 text-xs transition ${editing.category === c ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>{c}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">备注</label>
                <input type="text" value={editing.description || ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} className={inputClass} placeholder="简短说明" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">日期</label>
                <input type="date" value={editing.transaction_date || ""} onChange={(e) => setEditing({ ...editing, transaction_date: e.target.value })} className={inputClass} />
              </div>
            </div>
            <div className="mt-6 flex gap-2">
              <button onClick={() => setEditing(null)} className="flex-1 rounded-lg border border-border py-2.5 text-sm text-muted-foreground">取消</button>
              <button onClick={save} disabled={saving || !editing.amount || !editing.category} className="flex-1 rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground shadow-sm disabled:opacity-50">{saving ? "保存中..." : "保存"}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FinanceManagement;
