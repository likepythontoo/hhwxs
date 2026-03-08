import TopBar from "@/components/TopBar";
import MainNav from "@/components/MainNav";
import SiteFooter from "@/components/SiteFooter";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <TopBar />
      <MainNav />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
};

export default Layout;
