// This is the entry component for the landing page of the application.

import Features from "@/components/landing-page/Features";
import Footer from "@/components/landing-page/Footer";
import FAQs from "@/components/landing-page/FAQs";
import Hero from "@/components/landing-page/Hero";
import Pricing from "@/components/landing-page/Pricing";
import Navbar from "@/components/landing-page/Navbar";

export default async function Home() {
  return (
    <div className="bg-[#121212]">
      <Navbar />

      <div className="mx-auto pt-10 px-28">
        <Hero />
        <Features />
        <Pricing />
        <FAQs />
        <Footer />
      </div>
    </div>
  );
}
