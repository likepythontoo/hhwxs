import { useEffect, useState, useMemo } from "react";
import Layout from "@/components/Layout";
import { Search, Download, FileText, FileSpreadsheet, File, Calendar, Tag, FolderOpen } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

interface DocItem {
  id?: string;
  name: string;
  fileName: string;
  category: string;
  description: string;
  date: string;
  fileType: "doc" | "docx" | "pdf" | "xlsx" | "other";
  fileUrl?: string;
}

const documents: DocItem[] = [
  {
    name: "红湖文学社纳新报名表",
    fileName: "红湖文学社纳新报名表.docx",
    category: "纳新招募",
    description: "新社员入社申请表，包含个人信息、志愿部门、自我介绍等内容。",
    date: "2025-09",
    fileType: "docx",
  },
  {
    name: "红湖文学社活动章程",
    fileName: "红湖文学社活动章程.doc",
    category: "规章制度",
    description: "社团管理细则、社员权利与义务、组织设置、会议制度等完整章程。",
    date: "2020-10",
    fileType: "doc",
  },
  {
    name: "学生社团换届干部竞选报名表",
    fileName: "学生社团换届干部竞选报名表.docx",
    category: "换届选举",
    description: "社团干部换届竞选报名表，用于申请竞选社团各级干部职位。",
    date: "2025-06",
    fileType: "docx",
  },
];

const fileTypeIcons: Record<string, typeof FileText> = {
  doc: FileText,
  docx: FileText,
  pdf: File,
  xlsx: FileSpreadsheet,
  other: File,
};

const fileTypeColors: Record<string, string> = {
  doc: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  docx: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  pdf: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  xlsx: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  other: "bg-muted text-muted-foreground",
};

const Documents = () => {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("全部");
  const [dynamicDocs, setDynamicDocs] = useState<DocItem[]>([]);

  useEffect(() => {
    (supabase.from("documents" as any) as any).select("id,name,file_name,category,description,file_date,file_type,file_url")
      .eq("is_public", true)
      .order("sort_order")
      .then(({ data }: any) => setDynamicDocs((data || []).map((d: any) => ({
        id: d.id,
        name: d.name,
        fileName: d.file_name,
        category: d.category,
        description: d.description || "",
        date: d.file_date || "",
        fileType: ["doc", "docx", "pdf", "xlsx"].includes(d.file_type) ? d.file_type : "other",
        fileUrl: d.file_url || `/files/${d.file_name}`,
      }))));
  }, []);

  const displayDocuments = dynamicDocs.length > 0 ? dynamicDocs : documents;
  const categories = useMemo(() => ["全部", ...Array.from(new Set(displayDocuments.map((d) => d.category)))], [displayDocuments]);

  const filtered = useMemo(() => {
    return displayDocuments.filter((doc) => {
      const matchesSearch =
        !search ||
        doc.name.toLowerCase().includes(search.toLowerCase()) ||
        doc.description.toLowerCase().includes(search.toLowerCase()) ||
        doc.category.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = activeCategory === "全部" || doc.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [search, activeCategory, displayDocuments]);

  return (
    <Layout>
      {/* Hero */}
      <div className="relative bg-primary py-16 text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-serif text-3xl font-bold tracking-widest md:text-4xl">文件中心</h1>
          <div className="gold-divider mx-auto mt-4" />
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed opacity-80">
            社团公开文件资料下载 · 报名表 · 章程 · 表格模板
          </p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-secondary py-6">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="搜索文件名称、描述或分类..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    activeCategory === cat
                      ? "bg-primary text-primary-foreground"
                      : "bg-card text-muted-foreground hover:bg-accent"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* File List */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
            <FolderOpen className="h-4 w-4" />
            <span>
              共 <strong className="text-foreground">{filtered.length}</strong> 个文件
            </span>
          </div>

          {filtered.length === 0 ? (
            <div className="rounded border border-border bg-card py-16 text-center">
              <Search className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
              <p className="text-muted-foreground">未找到匹配的文件</p>
              <p className="mt-1 text-xs text-muted-foreground/60">尝试调整搜索关键词或筛选条件</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((doc) => {
                const Icon = fileTypeIcons[doc.fileType] || File;
                return (
                  <div
                    key={doc.fileName}
                    className="flex items-center gap-4 rounded border border-border bg-card p-4 transition-shadow hover:shadow-md sm:p-5"
                  >
                    {/* File type icon */}
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${fileTypeColors[doc.fileType] || fileTypeColors.other}`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>

                    {/* Info */}
                    <div className="min-w-0 flex-1">
                      <h3 className="font-serif text-sm font-bold sm:text-base">{doc.name}</h3>
                      <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{doc.description}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          <Tag className="mr-1 h-3 w-3" />
                          {doc.category}
                        </Badge>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {doc.date}
                        </span>
                        <span className="text-xs uppercase text-muted-foreground/60">.{doc.fileType}</span>
                      </div>
                    </div>

                    {/* Download */}
                    <a
                      href={doc.fileUrl || `/files/${doc.fileName}`}
                      download
                      className="flex shrink-0 items-center gap-1.5 rounded bg-primary px-4 py-2 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                      <Download className="h-4 w-4" />
                      <span className="hidden sm:inline">下载</span>
                    </a>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Documents;
