import Layout from "@/components/Layout";
import HeroCarousel from "@/components/HeroCarousel";
import NewsSection from "@/components/NewsSection";
import QuickLinks from "@/components/QuickLinks";
import AboutSection from "@/components/AboutSection";
import UpcomingEvents from "@/components/UpcomingEvents";
import VisitorCounter from "@/components/VisitorCounter";
import ScrollReveal from "@/components/ScrollReveal";

const Index = () => {
  return (
    <Layout>
      <HeroCarousel />
      <NewsSection />
      <ScrollReveal>
        <section className="py-8 md:py-12">
          <div className="container mx-auto px-4">
            <UpcomingEvents />
          </div>
        </section>
      </ScrollReveal>
      <QuickLinks />
      <AboutSection />
      <VisitorCounter />
    </Layout>
  );
};

export default Index;
