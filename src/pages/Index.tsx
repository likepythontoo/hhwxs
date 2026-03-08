import TopBar from "@/components/TopBar";
import MainNav from "@/components/MainNav";
import HeroCarousel from "@/components/HeroCarousel";
import NewsSection from "@/components/NewsSection";
import QuickLinks from "@/components/QuickLinks";
import AboutSection from "@/components/AboutSection";
import SiteFooter from "@/components/SiteFooter";

const Index = () => {
  return (
    <div className="min-h-screen">
      <TopBar />
      <MainNav />
      <HeroCarousel />
      <NewsSection />
      <QuickLinks />
      <AboutSection />
      <SiteFooter />
    </div>
  );
};

export default Index;
