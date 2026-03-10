import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { Mail, Lock, User } from "lucide-react";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
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
      } else if (data.user) {
        // Check if user has admin/president/minister role
        const { data: roles } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", data.user.id);
        const hasManagement = roles?.some(r =>
          ["admin", "president", "minister"].includes(r.role)
        );
        navigate(hasManagement ? "/admin" : "/profile");
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
  );
};

export default Auth;
