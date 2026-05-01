import { useState, useEffect } from "react";
import { Search, User, Clock, UserPlus, ClipboardCheck, LogIn, LayoutDashboard } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/logo.png";
import schoolLogo from "@/assets/school-logo.png";
import GlobalSearch from "@/components/GlobalSearch";

const TopBar = () => {
  const [user, setUser] = useState<any>(null);
  const [displayName, setDisplayName] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [hasAdminAccess, setHasAdminAccess] = useState(false);

  const loadUserMeta = async (userId: string, fallbackEmail: string) => {
    const [profileRes, rolesRes] = await Promise.all([
      supabase.from("profiles").select("display_name").eq("user_id", userId).single(),
      supabase.from("user_roles").select("role").eq("user_id", userId),
    ]);
    setDisplayName(profileRes.data?.display_name || fallbackEmail);
    const roles = (rolesRes.data || []).map((r: any) => r.role as string);
    setHasAdminAccess(roles.some(r => ["admin", "president", "minister"].includes(r)));
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(session.user);
        loadUserMeta(session.user.id, session.user.email || "");
      }
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user || null);
      if (session?.user) {
        loadUserMeta(session.user.id, session.user.email || "");
      } else {
        setDisplayName("");
        setHasAdminAccess(false);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  return (
    <div className="top-bar">
      <div className="container mx-auto flex items-center justify-between px-4 py-2 text-sm">
        <div className="flex items-center gap-3">
          <a href="https://www.hbkjxy.edu.cn/" target="_blank" rel="noopener noreferrer">
            <img src={schoolLogo} alt="河北科技学院" className="h-10 object-contain brightness-0 invert" />
          </a>
          <span className="text-white/50">|</span>
          <img src={logo} alt="红湖文学社社徽" className="h-10 w-10 object-contain" />
          <span className="font-serif text-base tracking-widest font-semibold text-white">红 湖 文 学 社</span>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => setSearchOpen(true)} className="flex items-center gap-1.5 opacity-80 transition-opacity hover:opacity-100" title="搜索 (Ctrl+K)">
            <Search className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">搜索</span>
          </button>
          <Link to="/join" className="flex items-center gap-1.5 opacity-80 transition-opacity hover:opacity-100">
            <UserPlus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">加入我们</span>
          </Link>
          <Link to="/checkin" className="flex items-center gap-1.5 opacity-80 transition-opacity hover:opacity-100">
            <ClipboardCheck className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">活动签到</span>
          </Link>
          {user ? (
            <Link to="/profile" className="flex items-center gap-1.5 opacity-80 transition-opacity hover:opacity-100">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-[10px] font-bold">
                {(displayName || "?")[0]}
              </div>
              <span className="hidden sm:inline">{displayName || "个人中心"}</span>
            </Link>
          ) : (
            <Link to="/auth" className="flex items-center gap-1.5 opacity-80 transition-opacity hover:opacity-100">
              <LogIn className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">社员登录</span>
            </Link>
          )}
          <Link to="/forum" className="flex items-center gap-1.5 opacity-80 transition-opacity hover:opacity-100">
            <Clock className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">社员论坛</span>
          </Link>
        </div>
      </div>
      <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />
    </div>
  );
};

export default TopBar;
