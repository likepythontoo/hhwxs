import { Search, User, Clock, UserPlus } from "lucide-react";
import logo from "@/assets/logo.png";
import schoolLogo from "@/assets/school-logo.png";

const TopBar = () => {
  return (
    <div className="top-bar">
      <div className="container mx-auto flex items-center justify-between px-4 py-2 text-sm">
        <div className="flex items-center gap-3">
          <a href="https://www.hbkjxy.cn" target="_blank" rel="noopener noreferrer">
            <img src={schoolLogo} alt="河北科技学院" className="h-10 object-contain brightness-0 invert" />
          </a>
          <span className="text-white/50">|</span>
          <img src={logo} alt="红湖文学社社徽" className="h-10 w-10 object-contain" />
          <span className="font-serif text-base tracking-widest font-semibold text-white">红 湖 文 学 社</span>
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