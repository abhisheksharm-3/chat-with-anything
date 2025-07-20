import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import GlowBackground from "@/components/shared/GlowBackground";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#121212] relative overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 z-0">
        <div className="h-full w-full bg-grid-pattern" />
        {/* Radial blur to fade grid into background */}
        <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-[#121212] opacity-90" />
      </div>

      {/* Glow Background */}
      <GlowBackground
        glowElements={[
          {
            position: "left-[10%] top-1/3",
            size: { width: 400, height: 400 },
            blur: 120,
            color: "rgba(84, 99, 255, 0.12)",
          },
          {
            position: "right-[15%] bottom-1/3",
            size: { width: 350, height: 350 },
            blur: 100,
            color: "rgba(84, 99, 255, 0.08)",
          },
        ]}
      />

      {/* Floating decorative elements */}
      <div className="absolute inset-0 z-0 max-w-6xl mx-auto">
        <div className="absolute top-[20%] left-[20%] w-2 h-2 bg-primary/30 rounded-full animate-pulse" />
        <div className="absolute top-[30%] right-[25%] w-1 h-1 bg-primary/40 rounded-full animate-pulse delay-1000" />
        <div className="absolute bottom-[25%] left-[15%] w-1.5 h-1.5 bg-primary/25 rounded-full animate-pulse delay-500" />
        <div className="absolute bottom-[35%] right-[20%] w-1 h-1 bg-primary/35 rounded-full animate-pulse delay-1500" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 text-center">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* 404 Number */}
          <div className="relative">
            <h1 className="text-8xl md:text-9xl font-extralight tracking-tight text-foreground/10">
              404
            </h1>
            <h1 className="absolute inset-0 text-8xl md:text-9xl font-extralight tracking-tight bg-gradient-to-r from-primary/60 to-primary/30 bg-clip-text text-transparent">
              404
            </h1>
          </div>

          {/* Error Message */}
          <div className="space-y-4">
            <h2 className="text-3xl md:text-4xl font-light tracking-tight text-foreground">
              Page Not Found
            </h2>
            <p className="text-lg text-muted-foreground max-w-md mx-auto leading-relaxed">
              The page you&apos;re looking for doesn&apos;t exist or has been
              moved. Let&apos;s get you back on track.
            </p>
          </div>

          {/* Action Button */}
          <div className="flex justify-center items-center pt-4">
            <Link href="/">
              <Button
                size="lg"
                className="px-8 py-3 font-medium transition-all duration-200 cursor-pointer"
              >
                <Home className="mr-2 h-4 w-4" />
                Go Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
