import { useState, useEffect } from "react";
import { Search, User, Clock, UserPlus, ClipboardCheck, LogIn } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/logo.png";
import schoolLogo from "@/assets/school-logo.png";

const TopBar = () => {
  const [user, setUser] = useState<any>(null);
  const [displayName, setDisplayName] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(session.user);
        supabase.from("profiles").select("display_name").eq("user_id", session.user.id).single()
          .then(({ data }) => setDisplayName(data?.display_name || session.user.email || ""));
      }
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user || null);
      if (session?.user) {
        supabase.from("profiles").select("display_name").eq("user_id", session.user.id).single()
          .then(({ data }) => setDisplayName(data?.display_name || session.user.email || ""));
      } else {
        setDisplayName("");
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
    </div>
  );
};

export default TopBar;
