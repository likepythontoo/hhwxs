import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { Mail, Lock, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const literaryQuotes = [
  "「文学是人类灵魂的镜子。」—— 莎士比亚",
  "「一个人的阅读史就是他的精神成长史。」—— 朱永新",
  "「书籍是全世界的营养品。」—— 莎士比亚",
  "「读书是在别人思想的帮助下，建立起自己的思想。」—— 鲁巴金",
  "「生活里没有书籍，就好像没有阳光。」—— 莎士比亚",
  "「吾生也有涯，而知也无涯。」—— 庄子",
];

const roleLabels: Record<string, string> = {
  admin: "管理员",
  president: "社长",
  minister: "部长",
  member: "社员",
};

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [welcome, setWelcome] = useState<{
    name: string;
    roleLabel: string;
    quote: string;
    target: string;
  } | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    if (isLogin) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message === "Invalid login credentials" ? "邮箱或密码错误" : error.message);
        setLoading(false);
        return;
      }
      if (data.user) {
        // Fetch profile + roles in parallel
        const [profileRes, rolesRes] = await Promise.all([
          supabase.from("profiles").select("display_name").eq("user_id", data.user.id).single(),
          supabase.from("user_roles").select("role").eq("user_id", data.user.id),
        ]);

        const name = profileRes.data?.display_name || data.user.email?.split("@")[0] || "用户";
        const roles = (rolesRes.data || []).map((r: any) => r.role as string);
        const hasManagement = roles.some(r => ["admin", "president", "minister"].includes(r));
        const target = hasManagement ? "/admin" : "/profile";

        // Pick the highest priority role label
        let roleLabel = "";
        if (roles.includes("admin")) roleLabel = roleLabels.admin;
        else if (roles.includes("president")) roleLabel = roleLabels.president;
        else if (roles.includes("minister")) roleLabel = roleLabels.minister;

        const quote = literaryQuotes[Math.floor(Math.random() * literaryQuotes.length)];

        setWelcome({ name, roleLabel, quote, target });

        setTimeout(() => {
          navigate(target);
        }, 2500);
      }
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { display_name: displayName },
          emailRedirectTo: window.location.origin,
        },
      });
      if (error) {
        setError(error.message);
      } else {
        setMessage("注册成功！请查收邮箱确认链接。");
      }
    }
    setLoading(false);
  };

  return (
    <>
      {/* Welcome Overlay */}
      <AnimatePresence>
        {welcome && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(0 45% 25%) 50%, hsl(0 30% 15%) 100%)",
            }}
          >
            {/* Decorative particles */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              {Array.from({ length: 20 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute rounded-full"
                  style={{
                    width: Math.random() * 4 + 2,
                    height: Math.random() * 4 + 2,
                    background: "hsla(40, 70%, 65%, 0.4)",
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                  animate={{
                    y: [0, -30, 0],
                    opacity: [0.2, 0.8, 0.2],
                  }}
                  transition={{
                    duration: 2 + Math.random() * 2,
                    repeat: Infinity,
                    delay: Math.random() * 2,
                  }}
                />
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative z-10 text-center px-6"
            >
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-lg tracking-[0.3em]"
                style={{ color: "hsla(40, 60%, 70%, 0.8)" }}
              >
                红湖文学社
              </motion.p>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="mt-6 font-serif text-3xl md:text-5xl font-bold"
                style={{ color: "hsl(40, 70%, 75%)" }}
              >
                你好呀！欢迎回来
                {welcome.roleLabel && (
                  <span className="block mt-2 text-2xl md:text-3xl" style={{ color: "hsl(40, 60%, 65%)" }}>
                    {welcome.roleLabel} ·{" "}
                  </span>
                )}
                <span className={welcome.roleLabel ? "" : "block mt-2"}>
                  {!welcome.roleLabel && <><br /></>}
                  {welcome.name}
                </span>
              </motion.h1>

              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.9, duration: 0.6 }}
                className="mx-auto mt-8 h-px w-48"
                style={{ background: "linear-gradient(90deg, transparent, hsl(40, 60%, 65%), transparent)" }}
              />

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
                className="mt-6 max-w-md mx-auto font-serif text-sm italic leading-relaxed"
                style={{ color: "hsla(40, 40%, 70%, 0.7)" }}
              >
                {welcome.quote}
              </motion.p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Layout>
        <div className="relative bg-primary py-16 text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <h1 className="font-serif text-3xl font-bold tracking-widest md:text-4xl">
              {isLogin ? "社员登录" : "社员注册"}
            </h1>
            <div className="gold-divider mx-auto mt-4" />
          </div>
        </div>

        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-sm">
              <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-border bg-card p-6 shadow-sm">
                {!isLogin && (
                  <div>
                    <label className="mb-1 block text-xs font-medium text-muted-foreground">昵称</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="w-full rounded-md border border-border bg-secondary/30 py-2 pl-9 pr-3 text-sm focus:border-primary focus:outline-none"
                        placeholder="你的昵称"
                        required={!isLogin}
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">邮箱</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-md border border-border bg-secondary/30 py-2 pl-9 pr-3 text-sm focus:border-primary focus:outline-none"
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">密码</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-md border border-border bg-secondary/30 py-2 pl-9 pr-3 text-sm focus:border-primary focus:outline-none"
                      placeholder="至少6位密码"
                      required
                      minLength={6}
                    />
                  </div>
                </div>

                {error && <p className="text-xs text-destructive">{error}</p>}
                {message && <p className="text-xs text-primary">{message}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-md bg-primary py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                >
                  {loading ? "处理中..." : isLogin ? "登录" : "注册"}
                </button>

                <p className="text-center text-xs text-muted-foreground">
                  {isLogin ? "还没有账号？" : "已有账号？"}
                  <button type="button" onClick={() => { setIsLogin(!isLogin); setError(""); setMessage(""); }} className="ml-1 text-primary hover:underline">
                    {isLogin ? "立即注册" : "去登录"}
                  </button>
                </p>
              </form>
            </div>
          </div>
        </section>
      </Layout>
    </>
  );
};

export default Auth;
