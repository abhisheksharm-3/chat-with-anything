// src/app/loading.tsx

import { Loader2 } from "lucide-react";
import Dither from "@/components/backgrounds/Dither/Dither";

/**
 * Renders a full-screen loading state that matches the application's primary aesthetic.
 *
 * This component uses the dynamic Dither background and a clean, centered loader
 * to provide a visually consistent fallback while server components are rendering.
 *
 * @returns {JSX.Element} The rendered loading page.
 */
const Loading = () => {
  // Use the same brand color for a consistent background theme
  const brandViolet: [number, number, number] = [0.408, 0.212, 0.796];

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden">
      {/* Dynamic Dither Background */}
      <div className="absolute inset-0 -z-10">
        <Dither
          waveColor={brandViolet}
          waveAmplitude={0.1}
          waveFrequency={2.5}
        />
      </div>

      {/* Main Content with a subtle fade-in animation */}
      <div className="relative z-10 flex animate-fade-in flex-col items-center justify-center text-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <h1 className="mt-8 text-3xl font-semibold tracking-tight text-foreground">
          Loading
        </h1>
        <p className="mt-2 text-base text-muted-foreground">
          Please wait while we prepare your experience.
        </p>
      </div>
    </div>
  );
};

export default Loading;