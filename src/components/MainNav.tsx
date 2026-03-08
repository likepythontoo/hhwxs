import { useState } from "react";
import { Menu, X } from "lucide-react";

const navItems = [
  { label: "首页", href: "#" },
  { label: "社团概况", href: "#about" },
  { label: "新闻动态", href: "#news" },
  { label: "作品展示", href: "#works" },
  { label: "创作研究", href: "#research" },
  { label: "文学档案馆", href: "#archives" },
  { label: "社员服务", href: "#services" },
  { label: "联系我们", href: "#contact" },
];

const MainNav = () => {
  const [open, setOpen] = useState(false);

  return (
    <nav className="main-nav relative z-50">
      <div className="container mx-auto flex items-center justify-between px-4">
        {/* Desktop nav */}
        <ul className="hidden md:flex">
          {navItems.map((item) => (
            <li key={item.label}>
              <a
                href={item.href}
                className="block px-5 py-3 text-sm font-medium tracking-wider transition-colors hover:bg-palace-red-dark"
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>

        {/* Mobile toggle */}
        <button
          className="py-3 md:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
        <span className="font-serif text-sm tracking-widest md:hidden">导航菜单</span>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="absolute left-0 top-full w-full bg-palace-red shadow-lg md:hidden">
          <ul className="container mx-auto px-4 py-2">
            {navItems.map((item) => (
              <li key={item.label}>
                <a
                  href={item.href}
                  className="block border-b border-palace-red-dark px-4 py-3 text-sm tracking-wider"
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </nav>
  );
};

export default MainNav;
