"use client";

import TopNavigation from "./components/TopNavBar";
import AboutSection from "./components/AboutSection";
import CTASection from "./components/CTASection";
import InterfaceSection from "./components/InterfaceSection";
import React from "react";
import HeroSection from "./components/hero";
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
