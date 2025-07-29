"use client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { ArrowRight, Lock, Zap, Infinity } from "lucide-react"; // Using icons for clarity
import Link from "next/link";

/**
 * A conversion-focused hero section for Inquora.
 * Addresses text visibility, branding, and user engagement to reduce bounce rate.
 * @component
 * @returns {JSX.Element} The rendered hero section.
 */
const Hero = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Ensures animations run after the component mounts
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    // The `bg-black/60` adds a dark overlay, ensuring text is readable on any background image.
    // Make sure you have a background image set on a parent container or this section itself.
    // Example: style={{ backgroundImage: 'url(/path/to/your/image.jpg)' }}
    <section className="relative w-full min-h-screen flex items-center justify-center overflow-hidden bg-cover bg-center">
      {/* Background Overlay for Text Visibility */}
      <div className="absolute inset-0 bg-black/60 z-0" />

      {/* Main content */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center flex flex-col items-center">
        {/* New Feature Badge */}
        <div
          className={`mb-6 transition-all duration-1000 ease-out ${
            isLoaded ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0"
          }`}
        >
          <Badge
            variant="secondary"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 text-neutral-200 hover:bg-white/10 transition-all duration-300 shadow-sm group"
          >
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium tracking-wide">
              New: Video & Image Analysis
            </span>
            <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:translate-x-1 transition-transform" />
          </Badge>
        </div>

        {/* Main Headline for "inquora" */}
        <div className="mb-6">
          <h1
            className={`text-5xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-neutral-50 to-neutral-300 leading-tight tracking-tighter transition-all duration-1000 ease-out ${
              isLoaded ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
            }`}
            style={{ transitionDelay: "200ms" }}
          >
            Inquire Anything.
          </h1>
          <h1
            className={`text-5xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-neutral-50 to-neutral-300 leading-tight tracking-tighter transition-all duration-1000 ease-out ${
              isLoaded ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
            }`}
            style={{ transitionDelay: "400ms" }}
          >
            Understand Everything.
          </h1>
        </div>

        {/* Enhanced description */}
        <div
          className={`mb-10 transition-all duration-1000 ease-out ${
            isLoaded ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
          }`}
          style={{ transitionDelay: "600ms" }}
        >
          <p className="text-lg md:text-xl text-neutral-300 font-light leading-relaxed max-w-3xl mx-auto">
            Instantly turn your documents, code, images, and videos into
            intelligent, interactive conversations with our secure AI platform.
          </p>
        </div>

        {/* --- High-Conversion CTA Section --- */}
        <div
          className={`flex flex-col items-center gap-6 transition-all duration-1000 ease-out ${
            isLoaded ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
          }`}
          style={{ transitionDelay: "800ms" }}
        >
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              className="px-8 text-md font-semibold rounded-full w-52 transition-all duration-300 hover:scale-105 active:scale-95 bg-white text-black hover:bg-neutral-200"
              asChild
            >
              <a href="/signup">
                Start for Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </a>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="px-8 text-md font-medium rounded-full w-52 transition-all duration-300 hover:scale-105 active:scale-95 bg-transparent border-neutral-700 text-neutral-300 hover:bg-neutral-800/50 hover:text-white"
              asChild
            >
              <Link href="/#how-it-works">
                See it in Action
              </Link>
            </Button>
          </div>

          {/* Trust Signals with Icons */}
          <div className="mt-4 flex items-center justify-center gap-6 text-sm text-neutral-400 font-medium">
            <span className="flex items-center gap-2">
              <Infinity className="w-4 h-4 text-blue-500" />
              <span>Unlimited Queries</span>
            </span>
            <span className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-blue-500" />
              <span>Enterprise Secure</span>
            </span>
            <span className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-blue-500" />
              <span>Instant Setup</span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
