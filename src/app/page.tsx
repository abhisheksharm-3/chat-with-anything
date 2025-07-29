import Features from "@/components/landing-page/Features";
import Hero from "@/components/landing-page/Hero";
import Pricing from "@/components/landing-page/Pricing";
import Faqs from "@/components/landing-page/Faq";
import Dither from "@/components/backgrounds/Dither/Dither";
import Layout from "@/components/layout/Layout";

/**
 * Renders the main landing page for the application.
 *
 * This server component uses the Layout wrapper and adds a full-screen
 * dither background for the hero section while maintaining the layout structure.
 *
 * @returns {JSX.Element} The complete homepage component.
 */
const Home = () => {
  // Brand color: oklch(0.563 0.194 286.5) ≈ rgb(104, 54, 203)
  const brandViolet: [number, number, number] = [0.408, 0.212, 0.796];

  return (
    <Layout 
      showDitherBackground={false}
      contentClassName="p-0"
    >
      {/* Hero section with full dither background */}
      <div className="relative min-h-screen">
        {/* Full dither background for hero - LOW z-index */}
        <div className="absolute inset-0 z-0">
          <Dither
            waveColor={brandViolet}
            disableAnimation={false}
            enableMouseInteraction={true}
            mouseRadius={0.3}
            colorNum={3}
            waveAmplitude={0.2}
            waveFrequency={1.5}
            waveSpeed={0.02}
          />
        </div>
        <div className="relative z-40">
          <Hero />
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent to-background z-30" />
      </div>
      {/* Rest of the sections */}
      <div className="bg-background relative z-20">
        <Features />
        <Pricing />
        <Faqs />
      </div>
    </Layout>
  );
};

export default Home;