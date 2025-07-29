import React from "react";
import Navbar from "@/components/landing-page/Navbar";
import Footer from "@/components/landing-page/Footer";
import Dither from "@/components/backgrounds/Dither/Dither";
import { LayoutProps } from "@/types/TypeUi";

/**
 * Custom Layout wrapper component that provides navbar, footer, and optional dither background.
 * 
 * This component can be used to wrap any page content while maintaining consistent
 * navigation and styling across the application.
 * 
 * @param children - The page content to render
 * @param showDitherBackground - Whether to show the animated dither background
 * @param enableNavbarBlur - Whether to apply backdrop blur to the navbar
 * @param contentClassName - Additional CSS classes for the content wrapper
 * @param showFooter - Whether to show the footer
 * @param ditherConfig - Custom configuration for the dither background
 */
const Layout: React.FC<LayoutProps> = ({
  children,
  showDitherBackground = true,
  enableNavbarBlur = true,
  contentClassName = "",
  showFooter = true,
  ditherConfig = {
    waveColor: [0.1, 0.1, 0.2],
    disableAnimation: false,
    enableMouseInteraction: true,
    mouseRadius: 0.3,
    colorNum: 3,
    waveAmplitude: 0.2,
    waveFrequency: 1.5,
    waveSpeed: 0.02,
  },
}) => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header section with optional dither background */}
      <div className="relative">
        {/* Dither background for navbar area */}
        {showDitherBackground && (
          <div className="absolute inset-0 z-0 h-32">
            <Dither
              waveColor={ditherConfig.waveColor}
              disableAnimation={ditherConfig.disableAnimation}
              enableMouseInteraction={ditherConfig.enableMouseInteraction}
              mouseRadius={ditherConfig.mouseRadius}
              colorNum={ditherConfig.colorNum}
              waveAmplitude={ditherConfig.waveAmplitude}
              waveFrequency={ditherConfig.waveFrequency}
              waveSpeed={ditherConfig.waveSpeed}
            />
          </div>
        )}

        {/* Navbar with optional blur overlay - HIGH z-index for navbar */}
        <div className="relative z-50">
          {enableNavbarBlur && (
            <div className="absolute inset-0 bg-black/20 backdrop-blur-md border-b border-white/5" />
          )}
          <div className="relative z-10">
            <Navbar />
          </div>
        </div>

        {/* Gradient overlay for smooth transition */}
        {showDitherBackground && (
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-b from-transparent to-background z-5" />
        )}
      </div>

      {/* Main content area - LOW z-index to allow content to control its own layering */}
      <main className={`flex-1 relative z-10 bg-background ${contentClassName}`}>
        {children}
      </main>

      {/* Footer */}
      {showFooter && (
        <div className="relative z-10 bg-background">
          <Footer />
        </div>
      )}
    </div>
  );
};

export default Layout;