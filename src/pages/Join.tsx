import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { User, Phone, Mail, BookOpen, Building2, GraduationCap, Send, CheckCircle, MapPin, Calendar, Star, MessageCircle, Download } from "lucide-react";

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
    gender: "",
    campus: "",
    student_id: "",
    college: "",
    birthdate: "",
    hometown: "",
    hobbies: "",
    phone: "",
    qq: "",
    email: "",
    accept_reassign: "",
    department_id: "",
    self_intro: "",
    awards: "",
    work_plan: "",
    literary_works: "",
  });

  useEffect(() => {
    supabase.from("departments").select("id, name, description").then(({ data }) => {
      if (data) setDepartments(data);
    });
  }, []);

  const update = (key: string, value: string) => setForm(prev => ({ ...prev, [key]: value }));

  const inputClass = "w-full rounded-md border border-border bg-secondary/30 px-3 py-2 text-sm focus:border-primary focus:outline-none";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const dept = departments.find(d => d.id === form.department_id);

    // Combine extra fields into self_intro
    const extraInfo = [
      form.gender && `性别：${form.gender}`,
      form.campus && `校区：${form.campus}`,
      form.birthdate && `出生年月：${form.birthdate}`,
      form.hometown && `籍贯：${form.hometown}`,
      form.hobbies && `兴趣特长：${form.hobbies}`,
      form.qq && `QQ：${form.qq}`,
      form.accept_reassign && `是否接受调剂：${form.accept_reassign}`,
      form.awards && `获奖情况：${form.awards}`,
      form.work_plan && `工作设想：${form.work_plan}`,
    ].filter(Boolean).join("\n");

    const fullIntro = [form.self_intro, extraInfo].filter(Boolean).join("\n\n---\n");

    const { error: err } = await supabase.from("recruitment_applications").insert({
      name: form.name,
      student_id: form.student_id || null,
      college: form.college || null,
      phone: form.phone,
      email: form.email || null,
      department_id: form.department_id || null,
      preferred_department: dept?.name || null,
      self_intro: fullIntro || null,
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
      <div className="relative bg-primary py-12 text-primary-foreground sm:py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-serif text-2xl font-bold tracking-widest sm:text-3xl md:text-4xl">加入红湖文学社</h1>
          <p className="mt-3 text-sm text-primary-foreground/70">填写以下信息，开启你的文学之旅</p>
          <div className="gold-divider mx-auto mt-4" />
        </div>
      </div>

      <section className="py-8 sm:py-10 md:py-16">
        <div className="container mx-auto px-4">
          {/* Download link */}
          <div className="mx-auto mb-5 max-w-2xl">
            <a
              href="/files/红湖文学社纳新报名表.docx"
              download
              className="flex items-center justify-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm font-medium text-primary transition hover:bg-primary/10"
            >
              <Download className="h-4 w-4" />
              下载纳新报名表（Word 版）
            </a>
          </div>

          <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-6 rounded-xl border border-border bg-card p-5 shadow-sm sm:p-6 md:p-8">
            <h2 className="font-serif text-lg font-bold">河北科技学院红湖文学社纳新报名表</h2>

            {/* 个人信息 */}
            <div>
              <h3 className="mb-3 flex items-center gap-2 border-b border-border pb-2 text-sm font-semibold text-primary">
                <User className="h-4 w-4" /> 个人信息
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">
                    姓名 <span className="text-destructive">*</span>
                  </label>
                  <input type="text" required value={form.name} onChange={e => update("name", e.target.value)}
                    className={inputClass} placeholder="真实姓名" maxLength={50} />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">性别</label>
                  <select value={form.gender} onChange={e => update("gender", e.target.value)} className={inputClass}>
                    <option value="">请选择</option>
                    <option value="男">男</option>
                    <option value="女">女</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">校区</label>
                  <input type="text" value={form.campus} onChange={e => update("campus", e.target.value)}
                    className={inputClass} placeholder="如：曹妃甸校区" maxLength={50} />
                </div>
                <div>
                  <label className="mb-1 flex items-center gap-1 text-xs font-medium text-muted-foreground">
                    <GraduationCap className="h-3.5 w-3.5" /> 学院/年级
                  </label>
                  <input type="text" value={form.college} onChange={e => update("college", e.target.value)}
                    className={inputClass} placeholder="如：智能制造工程学院2024级" maxLength={100} />
                </div>
                <div>
                  <label className="mb-1 flex items-center gap-1 text-xs font-medium text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" /> 出生年月
                  </label>
                  <input type="month" value={form.birthdate} onChange={e => update("birthdate", e.target.value)}
                    className={inputClass} />
                </div>
                <div>
                  <label className="mb-1 flex items-center gap-1 text-xs font-medium text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" /> 籍贯
                  </label>
                  <input type="text" value={form.hometown} onChange={e => update("hometown", e.target.value)}
                    className={inputClass} placeholder="如：河北唐山" maxLength={50} />
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1 flex items-center gap-1 text-xs font-medium text-muted-foreground">
                    <Star className="h-3.5 w-3.5" /> 兴趣特长
                  </label>
                  <input type="text" value={form.hobbies} onChange={e => update("hobbies", e.target.value)}
                    className={inputClass} placeholder="如：写作、朗诵、书法等" maxLength={200} />
                </div>
              </div>
            </div>

            {/* 联系方式 */}
            <div>
              <h3 className="mb-3 flex items-center gap-2 border-b border-border pb-2 text-sm font-semibold text-primary">
                <Phone className="h-4 w-4" /> 联系方式
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">
                    手机号 <span className="text-destructive">*</span>
                  </label>
                  <input type="tel" required value={form.phone} onChange={e => update("phone", e.target.value)}
                    className={inputClass} placeholder="11位手机号" pattern="[0-9]{11}" maxLength={11} />
                </div>
                <div>
                  <label className="mb-1 flex items-center gap-1 text-xs font-medium text-muted-foreground">
                    <MessageCircle className="h-3.5 w-3.5" /> QQ
                  </label>
                  <input type="text" value={form.qq} onChange={e => update("qq", e.target.value)}
                    className={inputClass} placeholder="QQ号码" maxLength={15} />
                </div>
                <div>
                  <label className="mb-1 flex items-center gap-1 text-xs font-medium text-muted-foreground">
                    <Mail className="h-3.5 w-3.5" /> 邮箱
                  </label>
                  <input type="email" value={form.email} onChange={e => update("email", e.target.value)}
                    className={inputClass} placeholder="选填" maxLength={100} />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">是否接受调剂</label>
                  <select value={form.accept_reassign} onChange={e => update("accept_reassign", e.target.value)} className={inputClass}>
                    <option value="">请选择</option>
                    <option value="是">是</option>
                    <option value="否">否</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 意向部门 */}
            <div>
              <h3 className="mb-3 flex items-center gap-2 border-b border-border pb-2 text-sm font-semibold text-primary">
                <Building2 className="h-4 w-4" /> 意向部门
              </h3>
              <p className="mb-2 text-xs text-muted-foreground">请选择你最感兴趣的部门（单选）</p>
              <select
                value={form.department_id} onChange={e => update("department_id", e.target.value)}
                className={inputClass}
              >
                <option value="">不限 / 服从分配</option>
                {departments.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
              {departments.length === 0 && (
                <p className="mt-2 text-xs text-muted-foreground">
                  可选部门：组织部、办公室、宣传部、评议部、学术科技类社团联络部、文化体育类社团联络部、思想政治类社团联络部、创新创业类社团联络部、志愿公益类社团联络部等
                </p>
              )}
            </div>

            {/* 个人陈述 */}
            <div>
              <h3 className="mb-3 flex items-center gap-2 border-b border-border pb-2 text-sm font-semibold text-primary">
                <BookOpen className="h-4 w-4" /> 个人陈述
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">
                    个人优势及任职情况（不超过500字）
                  </label>
                  <textarea value={form.self_intro} onChange={e => update("self_intro", e.target.value)}
                    className={inputClass} rows={3} placeholder="简单介绍一下自己的优势、曾任职务等" maxLength={500} />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">获奖情况</label>
                  <textarea value={form.awards} onChange={e => update("awards", e.target.value)}
                    className={inputClass} rows={2} placeholder="列举你获得的荣誉或奖项" maxLength={500} />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">
                    工作设想（不超过500字）
                  </label>
                  <textarea value={form.work_plan} onChange={e => update("work_plan", e.target.value)}
                    className={inputClass} rows={3} placeholder="如果加入，你有什么工作计划和设想？" maxLength={500} />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">
                    最深刻经历及原因（不超过500字）
                  </label>
                  <textarea value={form.literary_works} onChange={e => update("literary_works", e.target.value)}
                    className={inputClass} rows={3} placeholder="分享一段对你影响最深的经历" maxLength={500} />
                </div>
              </div>
            </div>

            {error && <p className="text-xs text-destructive">{error}</p>}

            <button
              type="submit" disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
              ) : (
                <Send className="h-4 w-4" />
              )}
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
