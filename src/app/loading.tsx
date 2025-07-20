import { Loader2 } from "lucide-react";
import GlowBackground from "@/components/shared/GlowBackground";

const Loading = () => {
  return (
    <div className="min-h-screen bg-[#121212] relative overflow-hidden flex items-center justify-center">
      {/* Background Grid */}
      <div className="absolute inset-0 z-0">
        <div className="h-full w-full bg-grid-pattern" />
        <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-[#121212] opacity-90" />
      </div>
      {/* Glow Background */}
      <GlowBackground
        glowElements={[
          {
            position: "left-[20%] top-1/2",
            size: { width: 500, height: 500 },
            blur: 150,
            color: "rgba(84, 99, 255, 0.10)",
          },
          {
            position: "right-[20%] top-1/2",
            size: { width: 500, height: 500 },
            blur: 150,
            color: "rgba(84, 99, 255, 0.10)",
          },
        ]}
      />
      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary mb-8" />
        <h1 className="text-2xl md:text-3xl font-light tracking-tight text-foreground mb-2">
          Loading...
        </h1>
        <p className="text-base text-muted-foreground max-w-md mx-auto">
          Please wait while we prepare your experience.
        </p>
      </div>
    </div>
  );
};

export default Loading; 