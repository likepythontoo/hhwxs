import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

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

const menuVariants = {
  hidden: { opacity: 0, height: 0 },
  visible: {
    opacity: 1,
    height: "auto",
    transition: { duration: 0.3, ease: "easeOut", staggerChildren: 0.04 },
  },
  exit: {
    opacity: 0,
    height: 0,
    transition: { duration: 0.2, ease: "easeIn" },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -16 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.25, ease: "easeOut" } },
};

const MainNav = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  return (
    <nav className="main-nav sticky top-0 z-50 shadow-lg">
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
                {location.pathname === item.href && (
                  <span className="absolute bottom-0 left-1/2 h-[2px] w-6 -translate-x-1/2 bg-gold" />
                )}
              </Link>
            </li>
          ))}
        </ul>

        <button
          className="py-3 md:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          <motion.span
            key={open ? "close" : "menu"}
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="block"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </motion.span>
        </button>
        <span className="font-serif text-sm tracking-widest md:hidden">导航菜单</span>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            variants={menuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute left-0 top-full w-full overflow-hidden bg-primary shadow-xl md:hidden"
          >
            <ul className="container mx-auto px-4 py-2">
              {navItems.map((item) => (
                <motion.li key={item.label} variants={itemVariants}>
                  <Link
                    to={item.href}
                    className={`flex items-center gap-3 border-b border-primary-foreground/10 px-4 py-3.5 text-sm tracking-wider transition-colors hover:bg-palace-red-dark ${
                      location.pathname === item.href
                        ? "bg-palace-red-dark font-bold"
                        : ""
                    }`}
                    onClick={() => setOpen(false)}
                  >
                    {location.pathname === item.href && (
                      <span className="h-1.5 w-1.5 rounded-full bg-gold" />
                    )}
                    <span>{item.label}</span>
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom decorative line */}
      <div className="h-px bg-gradient-to-r from-transparent via-palace-red-dark to-transparent" />
    </nav>
  );
};

export default MainNav;
