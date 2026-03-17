import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const navItems = [
  { label: "首页", href: "/" },
  { label: "社团概况", href: "/about" },
  { label: "社团章程", href: "/charter" },
  { label: "新闻动态", href: "/news" },
  { label: "活动中心", href: "/events" },
  { label: "作品展示", href: "/works" },
  { label: "历届成员", href: "/members" },
  { label: "社员论坛", href: "/forum" },
  { label: "联系我们", href: "/contact" },
];

const MainNav = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  return (
    <nav className="main-nav sticky top-0 z-50 shadow-lg">
      {/* Top decorative gold line */}
      <div className="h-[2px] bg-gradient-to-r from-transparent via-gold/60 to-transparent" />
      
      <div className="container mx-auto flex items-center justify-between px-4">
        <ul className="hidden md:flex">
          {navItems.map((item) => (
            <li key={item.label}>
              <Link
                to={item.href}
                className={`group relative block px-5 py-3.5 text-sm font-medium tracking-wider transition-colors hover:bg-palace-red-dark ${
                  location.pathname === item.href ? "bg-palace-red-dark" : ""
                }`}
              >
                {item.label}
                {/* Active indicator */}
                {location.pathname === item.href && (
                  <span className="absolute bottom-0 left-1/2 h-[2px] w-6 -translate-x-1/2 bg-gold" />
                )}
              </Link>
            </li>
          ))}
        </ul>

        <button className="py-3 md:hidden" onClick={() => setOpen(!open)} aria-label="Toggle menu">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
        <span className="font-serif text-sm tracking-widest md:hidden">导航菜单</span>
      </div>

      {open && (
        <div className="absolute left-0 top-full w-full bg-palace-red shadow-xl md:hidden">
          <ul className="container mx-auto px-4 py-2">
            {navItems.map((item) => (
              <li key={item.label}>
                <Link
                  to={item.href}
                  className={`block border-b border-palace-red-dark/50 px-4 py-3.5 text-sm tracking-wider transition-colors hover:bg-palace-red-dark ${
                    location.pathname === item.href ? "bg-palace-red-dark" : ""
                  }`}
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Bottom decorative line */}
      <div className="h-px bg-gradient-to-r from-transparent via-palace-red-dark to-transparent" />
    </nav>
  );
};

export default MainNav;
