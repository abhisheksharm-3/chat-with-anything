import Image from "next/image";
import ButtonCta from "./ButtonCta";
import { WordRotate } from "../shared/WordRotate";
import GlowBackground from "../shared/GlowBackground";
import { FloatingLogosData, RotateWords } from "@/constants/HeroData";

/**
 * The main hero section component for the application's landing page.
 *
 * It features a prominent headline with a dynamic word rotator to showcase
 * the various types of content users can interact with. The section also includes
 * a descriptive sub-headline, a primary call-to-action button, and a visually
 * engaging background with a grid pattern, a glow effect, and decorative floating logos.
 *
 * @component
 * @returns {JSX.Element} The rendered hero section.
 */
const Hero = () => {
  // Background grid component
  const BackgroundGrid = () => (
    <div className="absolute inset-0 z-0">
      <div className="h-full w-full bg-grid-pattern" />
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-[#121212] opacity-90" />
    </div>
  );

  // Floating logos component
  const FloatingLogos = () => (
    <div className="absolute inset-0 z-0 max-w-6xl mx-auto">
      {FloatingLogosData.map((logo) => (
        <div
          key={logo.alt}
          className={`absolute ${logo.position} ${logo.rotation} opacity-70`}
        >
          <Image
            src={logo.src}
            alt={logo.alt}
            width={logo.width}
            height={logo.height}
            className={logo.size}
          />
        </div>
      ))}
    </div>
  );

  // Main content component
  const HeroContent = () => (
    <div className="flex flex-col justify-center relative z-10 w-full">
      <div className="space-y-6 max-w-2xl mx-auto">
        <div className="text-center text-3xl md:text-4xl lg:text-5xl font-extralight tracking-tight">
          Now chat with any{" "}
          <WordRotate className="font-bold" words={RotateWords} />
        </div>
        <div className="max-w-md mx-auto text-center text-base md:text-lg text-gray-400 mt-20 px-10 md:mt-10">
          Using doc2text ask questions, get information from a document, image,
          video, URL, github repo and more.
        </div>
      </div>
      <div className="mt-10 md:min-w-96 mx-auto px-12 md:px-0">
        <ButtonCta className="py-6" showArrow={true} link="/signup" />
      </div>
    </div>
  );

  return (
    <section className="relative mx-auto space-y-20 px-4 overflow-hidden min-h-[80vh] flex items-center border-b border-primary/10">
      <BackgroundGrid />
      <GlowBackground />
      <FloatingLogos />
      <HeroContent />
    </section>
  );
};

export default Hero;
