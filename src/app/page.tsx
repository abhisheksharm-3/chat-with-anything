import Features from "@/components/landing-page/Features";
import Hero from "@/components/landing-page/Hero";
import Pricing from "@/components/landing-page/Pricing";
import Faqs from "@/components/landing-page/Faq";
import Layout from "@/components/layout/Layout";
import Dither from "@/components/backgrounds/Dither/Dither";

/**
 * The main landing page of the application.
 *
 * This component assembles the various sections of the homepage within a
 * standard layout. It features a unique, full-screen dither effect for the
 * hero section and a clean, solid background for the subsequent content.
 *
 * @returns {JSX.Element} The rendered homepage.
 */
const Home = () => {
  // Defines the primary brand color in a format compatible with the Dither component.
  // The color is oklch(0.563 0.194 286.5), which is approximately rgb(104, 54, 203).
  const brandViolet: [number, number, number] = [0.408, 0.212, 0.796];

  return (
    <Layout
      // The Layout's default dither background is disabled to allow for a custom
      // implementation in the hero section.
      showDitherBackground={false}
      // Removes default padding from the main content area, enabling sections
      // like the hero to span the full screen width and height.
      contentClassName="p-0"
    >
      {/* Container for the hero section, designed to fill the entire viewport. */}
      <div className="relative min-h-screen">
        {/*
         * The Dither component is positioned absolutely to act as a background
         * for the hero section. A low z-index ensures it stays behind all other content.
         */}
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

        {/* Wrapper for the Hero component, ensuring it appears above the background. */}
        <div className="relative z-40">
          <Hero />
        </div>

        {/* A gradient overlay that creates a smooth transition from the dithered
            hero background to the solid background of the content below. */}
        <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-b from-transparent to-background z-30" />
      </div>

      {/* Wrapper for the rest of the landing page sections. It has a solid
          background and a z-index that places it correctly in the page's visual stack. */}
      <div className="bg-black/70 relative z-20">
        <Features />
        <Pricing />
        <Faqs />
      </div>
    </Layout>
  );
};

export default Home;