import { useState, useRef } from "react";
import * as XLSX from "xlsx";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileSpreadsheet, Download, AlertCircle, CheckCircle2, X } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImported: () => void;
}

interface ParsedRow {
  rowIndex: number;
  data: any;
  error?: string;
}

// header(CN) → db field
const FIELD_MAP: Array<{ header: string; field: string; required?: boolean; type?: "date" | "tags" }> = [
  { header: "姓名", field: "name", required: true },
  { header: "届别", field: "term", required: true },
  { header: "职务", field: "role_title" },
  { header: "简介", field: "bio" },
  { header: "个人格言", field: "featured_quote" },
  { header: "专业", field: "major" },
  { header: "城市", field: "city" },
  { header: "加入日期", field: "joined_date", type: "date" },
  { header: "生日", field: "birthday", type: "date" },
  { header: "文学标签", field: "literary_tags", type: "tags" },
  { header: "头像URL", field: "avatar_url" },
  { header: "回忆录", field: "memoir" },
];

const parseDate = (v: any): string | null => {
  if (v === null || v === undefined || v === "") return null;
  // Excel serial date
  if (typeof v === "number") {
    const d = XLSX.SSF.parse_date_code(v);
    if (!d) return null;
    return `${d.y}-${String(d.m).padStart(2, "0")}-${String(d.d).padStart(2, "0")}`;
  }
  const s = String(v).trim();
  const m = s.match(/^(\d{4})[-/.年](\d{1,2})[-/.月](\d{1,2})/);
  if (m) return `${m[1]}-${m[2].padStart(2, "0")}-${m[3].padStart(2, "0")}`;
  const d = new Date(s);
  if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10);
  return null;
};

const MemberBulkImportDialog = ({ open, onOpenChange, onImported }: Props) => {
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [fileName, setFileName] = useState("");
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<{ success: number; failed: number; errors: string[] } | null>(null);
  const [skipDuplicates, setSkipDuplicates] = useState(true);

  const reset = () => {
    setRows([]);
    setFileName("");
    setResult(null);
    setProgress(0);
    if (fileRef.current) fileRef.current.value = "";
  };

  const downloadTemplate = () => {
    const headers = FIELD_MAP.map(f => f.header);
    const example1 = ["张三", "2024级", "社长", "热爱诗歌的青年", "笔耕不辍", "汉语言文学", "石家庄", "2024-09-01", "2003-05-12", "诗歌、散文", "", "在文学社的三年..."];
    const example2 = ["李四", "2024级", "宣传部部长", "", "", "新闻学", "保定", "2024-09-01", "", "小说", "", ""];
    const ws = XLSX.utils.aoa_to_sheet([headers, example1, example2]);
    ws["!cols"] = headers.map(() => ({ wch: 16 }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "成员导入模板");
    XLSX.writeFile(wb, "成员导入模板.xlsx");
  };

  const handleFile = async (file: File) => {
    setFileName(file.name);
    setResult(null);
    const buf = await file.arrayBuffer();
    const wb = XLSX.read(buf, { type: "array" });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const raw: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1, blankrows: false });
    if (raw.length < 2) {
      toast({ title: "文件为空", description: "未检测到数据行", variant: "destructive" });
      return;
    }
    const headerRow: string[] = (raw[0] || []).map((h: any) => String(h ?? "").trim());
    const colIndex: Record<string, number> = {};
    FIELD_MAP.forEach(f => {
      const idx = headerRow.findIndex(h => h === f.header);
      if (idx >= 0) colIndex[f.field] = idx;
    });

    const parsed: ParsedRow[] = [];
    for (let i = 1; i < raw.length; i++) {
      const row = raw[i] || [];
      // skip empty rows
      if (row.every(c => c === null || c === undefined || String(c).trim() === "")) continue;
      const data: any = {};
      let error: string | undefined;
      for (const f of FIELD_MAP) {
        const idx = colIndex[f.field];
        if (idx === undefined) continue;
        let val: any = row[idx];
        if (val === undefined || val === null || String(val).trim() === "") {
          if (f.required) {
            error = `${f.header}为空`;
            break;
          }
          continue;
        }
        if (f.type === "date") {
          const d = parseDate(val);
          if (d) data[f.field] = d;
        } else if (f.type === "tags") {
          data[f.field] = String(val).split(/[,，、;；]/).map(s => s.trim()).filter(Boolean);
        } else {
          data[f.field] = String(val).trim();
        }
      }
      parsed.push({ rowIndex: i + 1, data, error });
    }
    setRows(parsed);
  };

  const validRows = rows.filter(r => !r.error);
  const errorRows = rows.filter(r => r.error);

  const doImport = async () => {
    if (validRows.length === 0) return;
    setImporting(true);
    setProgress(0);
    const errors: string[] = [];
    let success = 0;

    // optionally check duplicates
    let existingKeys = new Set<string>();
    if (skipDuplicates) {
      const { data: existing } = await supabase.from("members").select("name, term");
      existingKeys = new Set((existing || []).map(m => `${m.name}__${m.term}`));
    }

    const toInsert = validRows
      .map(r => r.data)
      .filter(d => !skipDuplicates || !existingKeys.has(`${d.name}__${d.term}`));

    const skipped = validRows.length - toInsert.length;

    const BATCH = 100;
    for (let i = 0; i < toInsert.length; i += BATCH) {
      const batch = toInsert.slice(i, i + BATCH);
      const { error } = await supabase.from("members").insert(batch);
      if (error) {
        errors.push(`第 ${i + 1}-${i + batch.length} 行: ${error.message}`);
      } else {
        success += batch.length;
      }
      setProgress(Math.round(((i + batch.length) / toInsert.length) * 100));
    }

    setResult({
      success,
      failed: toInsert.length - success + errorRows.length,
      errors: [
        ...errorRows.map(r => `第 ${r.rowIndex} 行: ${r.error}`),
        ...errors,
        ...(skipped > 0 ? [`已跳过 ${skipped} 条重复记录（同姓名+届别已存在）`] : []),
      ],
    });
    setImporting(false);
    onImported();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) reset();
        onOpenChange(o);
      }}
    >
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif">批量导入成员</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Step 1: Template */}
          <div className="rounded-lg border border-border bg-secondary/30 p-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium">1. 下载导入模板</p>
                <p className="mt-0.5 text-xs text-muted-foreground">推荐使用模板填写，避免字段错位</p>
              </div>
              <button
                onClick={downloadTemplate}
                className="flex shrink-0 items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition hover:bg-primary/90"
              >
                <Download className="h-3.5 w-3.5" /> 下载模板
              </button>
            </div>
          </div>

          {/* Step 2: Upload */}
          <div className="rounded-lg border border-dashed border-border p-4">
            <p className="mb-2 text-sm font-medium">2. 上传文件</p>
            <p className="mb-3 text-xs text-muted-foreground">支持 .xlsx / .xls / .csv，必填字段：姓名、届别</p>
            <input
              ref={fileRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
              }}
              className="block w-full text-xs file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-primary-foreground hover:file:bg-primary/90"
            />
            {fileName && (
              <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                <FileSpreadsheet className="h-3.5 w-3.5" />
                已选择：{fileName}
              </p>
            )}
          </div>

          {/* Preview */}
          {rows.length > 0 && !result && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">3. 预览数据</p>
                <div className="flex gap-3 text-xs">
                  <span className="text-primary">✓ 有效 {validRows.length}</span>
                  {errorRows.length > 0 && <span className="text-destructive">✗ 错误 {errorRows.length}</span>}
                </div>
              </div>

              <label className="flex items-center gap-2 text-xs text-muted-foreground">
                <input
                  type="checkbox"
                  checked={skipDuplicates}
                  onChange={(e) => setSkipDuplicates(e.target.checked)}
                  className="rounded"
                />
                跳过重复记录（同姓名 + 届别已存在）
              </label>

              <div className="overflow-x-auto rounded-lg border border-border">
                <table className="w-full text-xs">
                  <thead className="bg-secondary/50">
                    <tr>
                      <th className="px-2 py-1.5 text-left font-medium">#</th>
                      <th className="px-2 py-1.5 text-left font-medium">姓名</th>
                      <th className="px-2 py-1.5 text-left font-medium">届别</th>
                      <th className="px-2 py-1.5 text-left font-medium">职务</th>
                      <th className="px-2 py-1.5 text-left font-medium">状态</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {rows.slice(0, 10).map((r) => (
                      <tr key={r.rowIndex} className={r.error ? "bg-destructive/5" : ""}>
                        <td className="px-2 py-1.5 text-muted-foreground">{r.rowIndex}</td>
                        <td className="px-2 py-1.5">{r.data.name || "-"}</td>
                        <td className="px-2 py-1.5">{r.data.term || "-"}</td>
                        <td className="px-2 py-1.5 text-muted-foreground">{r.data.role_title || "-"}</td>
                        <td className="px-2 py-1.5">
                          {r.error ? (
                            <span className="flex items-center gap-1 text-destructive">
                              <AlertCircle className="h-3 w-3" /> {r.error}
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-primary">
                              <CheckCircle2 className="h-3 w-3" /> 就绪
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {rows.length > 10 && (
                  <p className="bg-secondary/30 px-2 py-1.5 text-center text-xs text-muted-foreground">
                    仅显示前 10 条，共 {rows.length} 条
                  </p>
                )}
              </div>

              {importing && (
                <div className="space-y-1">
                  <div className="h-2 overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-center text-xs text-muted-foreground">导入中... {progress}%</p>
                </div>
              )}

              <div className="flex justify-end gap-2">
                <button
                  onClick={reset}
                  disabled={importing}
                  className="rounded-lg bg-secondary px-3 py-1.5 text-xs disabled:opacity-50"
                >
                  重选文件
                </button>
                <button
                  onClick={doImport}
                  disabled={importing || validRows.length === 0}
                  className="rounded-lg bg-primary px-4 py-1.5 text-xs font-medium text-primary-foreground disabled:opacity-50"
                >
                  {importing ? "导入中..." : `确认导入 ${validRows.length} 条`}
                </button>
              </div>
            </div>
          )}

          {/* Result */}
          {result && (
            <div className="rounded-lg border border-border p-4">
              <div className="mb-3 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <p className="font-serif text-sm font-bold">导入完成</p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg bg-primary/5 p-3 text-center">
                  <p className="text-2xl font-bold text-primary">{result.success}</p>
                  <p className="text-xs text-muted-foreground">成功</p>
                </div>
                <div className="rounded-lg bg-destructive/5 p-3 text-center">
                  <p className="text-2xl font-bold text-destructive">{result.failed}</p>
                  <p className="text-xs text-muted-foreground">失败/跳过</p>
                </div>
              </div>
              {result.errors.length > 0 && (
                <div className="mt-3 max-h-32 overflow-y-auto rounded-md bg-secondary/30 p-2 text-xs">
                  {result.errors.map((e, i) => (
                    <p key={i} className="text-muted-foreground">• {e}</p>
                  ))}
                </div>
              )}
              <div className="mt-3 flex justify-end gap-2">
                <button
                  onClick={() => { reset(); }}
                  className="rounded-lg bg-secondary px-3 py-1.5 text-xs"
                >
                  继续导入
                </button>
                <button
                  onClick={() => { reset(); onOpenChange(false); }}
                  className="rounded-lg bg-primary px-3 py-1.5 text-xs text-primary-foreground"
                >
                  完成
                </button>
              </div>
            </div>
          )}

          {!rows.length && !result && fileName === "" && (
            <p className="text-center text-xs text-muted-foreground">请先下载模板，填写后上传</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MemberBulkImportDialog;
