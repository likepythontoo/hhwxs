import Layout from "@/components/Layout";
import HeroCarousel from "@/components/HeroCarousel";
import NewsSection from "@/components/NewsSection";
import QuickLinks from "@/components/QuickLinks";
import AboutSection from "@/components/AboutSection";

const Index = () => {
  return (
    <Layout>
      <HeroCarousel />
      <NewsSection />
      <QuickLinks />
      <AboutSection />
    </Layout>
  );
};

export default Index;
