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
  { label: "社员论坛", href: "/forum" },
  { label: "联系我们", href: "/contact" },
];

const MainNav = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  return (
    <nav className="main-nav relative z-50">
      <div className="container mx-auto flex items-center justify-between px-4">
        <ul className="hidden md:flex">
          {navItems.map((item) => (
            <li key={item.label}>
              <Link
                to={item.href}
                className={`block px-5 py-3 text-sm font-medium tracking-wider transition-colors hover:bg-palace-red-dark ${
                  location.pathname === item.href ? "bg-palace-red-dark" : ""
                }`}
              >
                {item.label}
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
        <div className="absolute left-0 top-full w-full bg-palace-red shadow-lg md:hidden">
          <ul className="container mx-auto px-4 py-2">
            {navItems.map((item) => (
              <li key={item.label}>
                <Link
                  to={item.href}
                  className="block border-b border-palace-red-dark px-4 py-3 text-sm tracking-wider"
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </nav>
  );
};

export default MainNav;
