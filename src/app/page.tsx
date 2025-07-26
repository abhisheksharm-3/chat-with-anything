import Features from "@/components/landing-page/Features";
import Footer from "@/components/landing-page/Footer";
import Hero from "@/components/landing-page/Hero";
import Pricing from "@/components/landing-page/Pricing";
import Navbar from "@/components/landing-page/Navbar";
import Faqs from "@/components/landing-page/Faq";

/**
 * Renders the main landing page for the application.
 *
 * This server component serves as a layout that assembles all the major
 * sections of the homepage, such as the Hero, Features, Pricing, and Footer.
 *
 * @returns {JSX.Element} The complete homepage component.
 */
const Home = () => {
  return (
    <div className="bg-[#121212]">
      <Navbar />

      <div className="mx-auto pt-2 lg:pt-10 lg:px-28">
        <Hero />
        <Features />
        <Pricing />
        <Faqs />
        <Footer />
      </div>
    </div>
  );
};

export default Home;
