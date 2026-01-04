import React from "react";
import HeroSection from "../components/landing/HeroSection";
import HowItWorks from "../components/landing/HowItWorks";
import Features from "../components/landing/Features";
import CTASection from "../components/landing/CTASection";

const Landing = () => {
  return (
    <>
      <HeroSection />
      <HowItWorks />
      <Features />
      <CTASection />
    </>
  );
};

export default Landing;
