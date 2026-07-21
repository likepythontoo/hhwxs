import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

type AuthorizationDetails = {
  client?: { name?: string; client_uri?: string };
  redirect_uri?: string;
  scope?: string;
  redirect_url?: string;
  redirect_to?: string;
};

// Beta typed wrapper — supabase.auth.oauth is available at runtime but not always in types.
type OAuthAPI = {
  getAuthorizationDetails: (id: string) => Promise<{ data: AuthorizationDetails | null; error: { message: string } | null }>;
  approveAuthorization: (id: string) => Promise<{ data: { redirect_url?: string; redirect_to?: string } | null; error: { message: string } | null }>;
  denyAuthorization: (id: string) => Promise<{ data: { redirect_url?: string; redirect_to?: string } | null; error: { message: string } | null }>;
};
const oauth = (supabase.auth as unknown as { oauth: OAuthAPI }).oauth;

export default function OAuthConsent() {
  const [params] = useSearchParams();
  const authorizationId = params.get("authorization_id") ?? "";
  const [details, setDetails] = useState<AuthorizationDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!authorizationId) {
        setError("缺少 authorization_id 参数");
        return;
      }
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) {
        const next = window.location.pathname + window.location.search;
        window.location.href = "/auth?next=" + encodeURIComponent(next);
        return;
      }
      const { data, error } = await oauth.getAuthorizationDetails(authorizationId);
      if (!active) return;
      if (error) return setError(error.message);
      const immediate = data?.redirect_url ?? data?.redirect_to;
      if (immediate && !data?.client) {
        window.location.href = immediate;
        return;
      }
      setDetails(data);
    })();
    return () => {
      active = false;
    };
  }, [authorizationId]);

  async function decide(approve: boolean) {
    setBusy(true);
    const { data, error } = approve
      ? await oauth.approveAuthorization(authorizationId)
      : await oauth.denyAuthorization(authorizationId);
    if (error) {
      setBusy(false);
      setError(error.message);
      return;
    }
    const target = data?.redirect_url ?? data?.redirect_to;
    if (!target) {
      setBusy(false);
      setError("授权服务器未返回跳转地址");
      return;
    }
    window.location.href = target;
  }

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6 bg-background">
        <div className="max-w-md w-full rounded-lg border border-border bg-card p-6 shadow-sm">
          <h1 className="font-serif text-xl font-bold text-destructive">无法加载授权请求</h1>
          <p className="mt-3 text-sm text-muted-foreground">{error}</p>
        </div>
      </main>
    );
  }

  if (!details) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">加载中…</p>
      </main>
    );
  }

  const clientName = details.client?.name ?? "外部应用";

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="max-w-md w-full rounded-lg border border-border bg-card p-8 shadow-lg">
        <p className="text-xs tracking-[0.3em] text-muted-foreground">红湖文学社 · 授权</p>
        <h1 className="mt-3 font-serif text-2xl font-bold text-foreground">
          将「{clientName}」连接到你的账号？
        </h1>
        <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
          批准后，{clientName} 可以以你的身份调用红湖文学社的 MCP 工具，例如查看你的投稿记录、提交新作品。
          该授权不会绕过网站的权限与后台策略，可随时在个人中心撤销。
        </p>
        {details.scope && (
          <p className="mt-3 text-xs text-muted-foreground">请求权限：{details.scope}</p>
        )}
        <div className="mt-8 flex gap-3">
          <button
            disabled={busy}
            onClick={() => decide(true)}
            className="flex-1 rounded-md bg-primary py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            批准连接
          </button>
          <button
            disabled={busy}
            onClick={() => decide(false)}
            className="flex-1 rounded-md border border-border bg-background py-2.5 text-sm font-medium hover:bg-secondary disabled:opacity-50"
          >
            拒绝
          </button>
        </div>
      </div>
    </main>
  );
}
