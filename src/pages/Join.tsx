import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { User, Phone, Mail, BookOpen, Building2, GraduationCap, Send, CheckCircle } from "lucide-react";

interface Department {
  id: string;
  name: string;
  description: string | null;
}

const Join = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    student_id: "",
    college: "",
    phone: "",
    email: "",
    department_id: "",
    self_intro: "",
    literary_works: "",
  });

  useEffect(() => {
    supabase.from("departments").select("id, name, description").then(({ data }) => {
      if (data) setDepartments(data);
    });
  }, []);

  const update = (key: string, value: string) => setForm(prev => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const dept = departments.find(d => d.id === form.department_id);
    const { error: err } = await supabase.from("recruitment_applications").insert({
      name: form.name,
      student_id: form.student_id || null,
      college: form.college || null,
      phone: form.phone,
      email: form.email || null,
      department_id: form.department_id || null,
      preferred_department: dept?.name || null,
      self_intro: form.self_intro || null,
      literary_works: form.literary_works || null,
    });

    if (err) {
      setError("提交失败，请稍后重试");
    } else {
      setSubmitted(true);
    }
    setLoading(false);
  };

  if (submitted) {
    return (
      <Layout>
        <div className="relative bg-primary py-16 text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <h1 className="font-serif text-3xl font-bold tracking-widest md:text-4xl">加入我们</h1>
            <div className="gold-divider mx-auto mt-4" />
          </div>
        </div>
        <section className="py-16 md:py-24">
          <div className="container mx-auto flex flex-col items-center gap-4 px-4 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <CheckCircle className="h-8 w-8 text-primary" />
            </div>
            <h2 className="font-serif text-2xl font-bold">申请已提交！</h2>
            <p className="max-w-md text-muted-foreground">
              感谢你的申请，我们会尽快审核。审核结果将通过你留下的联系方式通知你。
            </p>
            <a href="/" className="mt-4 inline-block rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90">
              返回首页
            </a>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="relative bg-primary py-16 text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-serif text-3xl font-bold tracking-widest md:text-4xl">加入红湖文学社</h1>
          <p className="mt-3 text-sm text-primary-foreground/70">填写以下信息，开启你的文学之旅</p>
          <div className="gold-divider mx-auto mt-4" />
        </div>
      </div>

      <section className="py-10 md:py-16">
        <div className="container mx-auto px-4">
          <form onSubmit={handleSubmit} className="mx-auto max-w-lg space-y-5 rounded-xl border border-border bg-card p-6 shadow-sm md:p-8">
            <h2 className="font-serif text-lg font-bold">入社申请表</h2>

            {/* 姓名 */}
            <div>
              <label className="mb-1 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <User className="h-3.5 w-3.5" /> 姓名 <span className="text-destructive">*</span>
              </label>
              <input
                type="text" required value={form.name} onChange={e => update("name", e.target.value)}
                className="w-full rounded-md border border-border bg-secondary/30 px-3 py-2 text-sm focus:border-primary focus:outline-none"
                placeholder="真实姓名"
              />
            </div>

            {/* 学号 */}
            <div>
              <label className="mb-1 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <GraduationCap className="h-3.5 w-3.5" /> 学号
              </label>
              <input
                type="text" value={form.student_id} onChange={e => update("student_id", e.target.value)}
                className="w-full rounded-md border border-border bg-secondary/30 px-3 py-2 text-sm focus:border-primary focus:outline-none"
                placeholder="如 2024010001"
              />
            </div>

            {/* 学院 */}
            <div>
              <label className="mb-1 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Building2 className="h-3.5 w-3.5" /> 学院
              </label>
              <input
                type="text" value={form.college} onChange={e => update("college", e.target.value)}
                className="w-full rounded-md border border-border bg-secondary/30 px-3 py-2 text-sm focus:border-primary focus:outline-none"
                placeholder="所在学院"
              />
            </div>

            {/* 手机号 */}
            <div>
              <label className="mb-1 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Phone className="h-3.5 w-3.5" /> 手机号 <span className="text-destructive">*</span>
              </label>
              <input
                type="tel" required value={form.phone} onChange={e => update("phone", e.target.value)}
                className="w-full rounded-md border border-border bg-secondary/30 px-3 py-2 text-sm focus:border-primary focus:outline-none"
                placeholder="11位手机号"
                pattern="[0-9]{11}"
              />
            </div>

            {/* 邮箱 */}
            <div>
              <label className="mb-1 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Mail className="h-3.5 w-3.5" /> 邮箱
              </label>
              <input
                type="email" value={form.email} onChange={e => update("email", e.target.value)}
                className="w-full rounded-md border border-border bg-secondary/30 px-3 py-2 text-sm focus:border-primary focus:outline-none"
                placeholder="选填"
              />
            </div>

            {/* 意向部门 */}
            <div>
              <label className="mb-1 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Building2 className="h-3.5 w-3.5" /> 意向部门
              </label>
              <select
                value={form.department_id} onChange={e => update("department_id", e.target.value)}
                className="w-full rounded-md border border-border bg-secondary/30 px-3 py-2 text-sm focus:border-primary focus:outline-none"
              >
                <option value="">不限 / 服从分配</option>
                {departments.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>

            {/* 自我介绍 */}
            <div>
              <label className="mb-1 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <BookOpen className="h-3.5 w-3.5" /> 自我介绍
              </label>
              <textarea
                value={form.self_intro} onChange={e => update("self_intro", e.target.value)}
                className="w-full rounded-md border border-border bg-secondary/30 px-3 py-2 text-sm focus:border-primary focus:outline-none"
                rows={3}
                placeholder="简单介绍一下自己，兴趣爱好等"
              />
            </div>

            {/* 作品展示 */}
            <div>
              <label className="mb-1 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <BookOpen className="h-3.5 w-3.5" /> 文学作品（选填）
              </label>
              <textarea
                value={form.literary_works} onChange={e => update("literary_works", e.target.value)}
                className="w-full rounded-md border border-border bg-secondary/30 px-3 py-2 text-sm focus:border-primary focus:outline-none"
                rows={4}
                placeholder="可以粘贴你的诗歌、散文或其他文学作品片段"
              />
            </div>

            {error && <p className="text-xs text-destructive">{error}</p>}

            <button
              type="submit" disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
              {loading ? "提交中..." : "提交申请"}
            </button>

            <p className="text-center text-[11px] text-muted-foreground">
              提交即表示你同意我们收集以上信息用于招新审核
            </p>
          </form>
        </div>
      </section>
    </Layout>
  );
};

export default Join;
