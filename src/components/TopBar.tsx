import { Search, User, Clock, UserPlus } from "lucide-react";
import logo from "@/assets/logo.png";
import schoolLogo from "@/assets/school-logo.png";

const TopBar = () => {
  return (
    <div className="top-bar">
      <div className="container mx-auto flex items-center justify-between px-4 py-1.5 text-sm">
        <div className="flex items-center gap-3">
          <img src={schoolLogo} alt="河北科技学院校徽" className="h-9 w-9 object-contain" />
          <img src={logo} alt="红湖文学社社徽" className="h-9 w-9 object-contain" />
          <span className="font-serif text-base tracking-widest">红湖文学社</span>
          <span className="hidden text-xs opacity-60 sm:inline">Red Lake Literature Society</span>
        </div>
        <div className="flex items-center gap-4">
          <a href="#" className="flex items-center gap-1.5 opacity-80 transition-opacity hover:opacity-100">
            <UserPlus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">加入我们</span>
          </a>
          <a href="#" className="flex items-center gap-1.5 opacity-80 transition-opacity hover:opacity-100">
            <User className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">社员登录</span>
          </a>
          <a href="#" className="flex items-center gap-1.5 opacity-80 transition-opacity hover:opacity-100">
            <Clock className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">​社员论坛</span>
          </a>
          <button className="flex items-center gap-1.5 opacity-80 transition-opacity hover:opacity-100">
            <Search className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">搜索</span>
          </button>
        </div>
      </div>
    </div>);

};

export default TopBar;