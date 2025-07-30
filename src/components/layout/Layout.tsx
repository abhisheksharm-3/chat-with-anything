// src/components/layout/Layout.tsx

import React from "react";
import Navbar from "@/components/landing-page/Navbar";
import Footer from "@/components/landing-page/Footer";
import Dither from "@/components/backgrounds/Dither/Dither";
import { LayoutProps } from "@/types/TypeUi"; // Assuming types are defined here

// Default dither configuration
const defaultDitherConfig = {
  waveColor: [0.1, 0.1, 0.2] as [number, number, number],
  fullscreen: false, // NEW: controls if dither covers the whole page
  // ... other default dither props
};

/**
 * Custom Layout wrapper that provides navbar, footer, and a dynamic dither background.
 * Now supports both full-screen and header-only background modes.
 */
const Layout: React.FC<LayoutProps> = ({
  children,
  showDitherBackground = true,
  enableNavbarBlur = true,
  contentClassName = "",
  showFooter = true,
  ditherConfig = {},
}) => {
  // Merge user-provided config with defaults
  const finalDitherConfig = { ...defaultDitherConfig, ...ditherConfig };

  return (
    <div className="relative min-h-screen flex flex-col bg-background">
      {/* Dither background can now be full-screen */}
      {showDitherBackground && (
        <div
          className={`absolute inset-0 z-0 ${
            finalDitherConfig.fullscreen ? "h-full" : "h-32"
          }`}
        >
          <Dither {...finalDitherConfig} />
        </div>
      )}

      {/* Header section with Navbar */}
      <header className="relative z-50">
        {enableNavbarBlur && (
          <div className="absolute inset-0 bg-black/20 backdrop-blur-md border-b border-white/5" />
        )}
        <div className="relative">
          <Navbar />
        </div>
      </header>

      {/* Main content area */}
      <main className={`flex-1 relative z-10 ${contentClassName}`}>
        {children}
      </main>

      {/* Footer */}
      {showFooter && (
        <footer className="relative z-10">
          <Footer />
        </footer>
      )}
    </div>
  );
};

export default Layout;