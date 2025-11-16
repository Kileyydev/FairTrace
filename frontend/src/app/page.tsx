"use client";

import TopNavigation from "./components/TopNavBar";
import AboutSection from "./components/AboutSection";
import CTASection from "./components/CTASection";
import InterfaceSection from "./components/InterfaceSection";
import HeroSection from "./components/HeroSection";
import Footer from "./components/FooterSection";

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
