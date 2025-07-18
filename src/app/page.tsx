import Features from "@/components/landing-page/Features";
import Footer from "@/components/landing-page/Footer";
import FAQs from "@/components/landing-page/FAQs";
import Hero from "@/components/landing-page/Hero";
import Pricing from "@/components/landing-page/Pricing";
import Navbar from "@/components/landing-page/Navbar";

/**
 * Renders the main landing page of the application.
 *
 * This server component assembles the various sections of the homepage,
 * including the navigation bar, hero section, features, pricing, FAQs,
 * and the footer, into a single, cohesive view.
 *
 * @returns {Promise<React.ReactElement>} The fully rendered homepage component.
 */
const Home = async () => {
  return (
    <div className="bg-[#121212]">
      <Navbar />

      <div className="mx-auto pt-2 lg:pt-10 lg:px-28">
        <Hero />
        <Features />
        <Pricing />
        <FAQs />
        <Footer />
      </div>
    </div>
  );
};

export default Home;