import TopNavigation from "./components/TopNavBar";
import HeroSection from "@/app/components/HeroSection";
import AboutSection from "./components/AboutSection";
import CTASection from "./components/CTASection";
import Footer from "@/app/components/FooterSection";
import InterfaceSection from "./components/InterfaceSection";

export default function Home() {
  return (
    <>
      <TopNavigation />
      <HeroSection />
      <AboutSection />
      <InterfaceSection/>
      <CTASection />
      <Footer/>
    </>
  );
}
