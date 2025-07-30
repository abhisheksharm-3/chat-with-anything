// src/app/not-found.tsx

import Link from "next/link";
import { Button } from "@/components/ui/button";
import Dither from "@/components/backgrounds/Dither/Dither";
import { Home } from "lucide-react";

/**
 * Renders the application's custom 404 'Not Found' page, redesigned
 * to match the primary application aesthetic.
 */
const NotFound = () => {
  // Use the same brand color for a consistent background theme
  const brandViolet: [number, number, number] = [0.408, 0.212, 0.796];

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden p-4">
      {/* Dynamic Dither Background */}
      <div className="absolute inset-0 -z-10">
        <Dither
          waveColor={brandViolet}
          waveAmplitude={0.1}
          waveFrequency={2.5}
        />
      </div>

      {/* Main Content Panel */}
      <div className="relative z-10 flex w-full max-w-lg flex-col items-center justify-center rounded-2xl border border-white/10 bg-black/20 p-8 text-center shadow-2xl shadow-black/40 backdrop-blur-lg sm:p-12">
        {/* Large 404 Number */}
        <h1 className="text-9xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white/50 to-white/10 md:text-[150px]">
          404
        </h1>

        {/* Error Message */}
        <div className="mt-6 space-y-4">
          <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Page Not Found
          </h2>
          <p className="text-lg leading-relaxed text-muted-foreground">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
            Let&apos;s get you back on track.
          </p>
        </div>

        {/* Action Button */}
        <div className="mt-10">
          <Button
            size="lg"
            className="h-12 w-full bg-primary px-6 text-md font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all duration-300 hover:scale-105 hover:bg-primary/90 active:scale-100 sm:w-auto"
            asChild
          >
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Go to Homepage
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;