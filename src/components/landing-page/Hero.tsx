"use client";

// Imports for UI components, state management, icons, and routing.
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

/**
 * A conversion-focused hero section with a reveal animation on load.
 */
const Hero = () => {
  // State to trigger animations after the component has mounted.
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="relative w-full min-h-screen flex items-center justify-center overflow-hidden bg-cover bg-center">
      {/* Dark overlay to ensure text is readable over any background image. */}
      <div className="absolute inset-0 bg-black/60" />

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center flex flex-col items-center">
        {/* Animated "New Feature" badge that appears on load. */}
        <div
          className={`mb-6 transition-all duration-1000 ease-out ${
            isLoaded ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0"
          }`}
        >
          <Badge
            variant="secondary"
            className="group inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-neutral-200 shadow-sm transition-colors hover:bg-white/10"
          >
            <div className="h-2 w-2 animate-pulse rounded-full bg-primary" />
            <span className="text-sm font-medium tracking-wide">
              New: Video & Image Analysis
            </span>
            <ArrowRight className="h-4 w-4 text-neutral-400 transition-transform group-hover:translate-x-1" />
          </Badge>
        </div>

        {/* The main headline, revealed with a staggered animation. */}
        <div className="mb-6">
          <h1
            className={`text-5xl font-bold leading-tight tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-neutral-50 to-neutral-300 transition-all duration-1000 ease-out md:text-7xl ${
              isLoaded ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
            }`}
            style={{ transitionDelay: "200ms" }}
          >
            Inquire Anything.
          </h1>
          <h1
            className={`text-5xl font-bold leading-tight tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-neutral-50 to-neutral-300 transition-all duration-1000 ease-out md:text-7xl ${
              isLoaded ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
            }`}
            style={{ transitionDelay: "400ms" }}
          >
            Understand Everything.
          </h1>
        </div>

        {/* Animated paragraph describing the product's value. */}
        <div
          className={`mb-10 transition-all duration-1000 ease-out ${
            isLoaded ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
          }`}
          style={{ transitionDelay: "600ms" }}
        >
          <p className="mx-auto max-w-3xl text-lg font-light leading-relaxed text-neutral-300 md:text-xl">
            Instantly turn your documents, code, images, and videos into
            intelligent, interactive conversations with our secure AI platform.
          </p>
        </div>

        {/* Call-to-action buttons and trust signals. */}
        <div
          className={`flex flex-col items-center gap-6 transition-all duration-1000 ease-out ${
            isLoaded ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
          }`}
          style={{ transitionDelay: "800ms" }}
        >
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              size="lg"
              className="w-52 rounded-full bg-white px-8 text-md font-semibold text-black transition-all duration-300 hover:scale-105 hover:bg-neutral-200 active:scale-95"
              asChild
            >
              <a href="/signup">
                Start for Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </a>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-52 rounded-full border-neutral-700 bg-transparent px-8 text-md font-medium text-neutral-300 transition-all duration-300 hover:scale-105 hover:border-neutral-600 hover:bg-neutral-800/50 hover:text-white active:scale-95"
              asChild
            >
              <Link href="/#how-it-works">See it in Action</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;