"use client";

import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import GlowBackground from "@/components/shared/GlowBackground";
import { TypeErrorProps } from "@/types/TypeUi";

const Error = ({ error, reset }: TypeErrorProps) => {
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
            color: "rgba(220, 38, 38, 0.08)",
          },
          {
            position: "right-[15%] bottom-1/3",
            size: { width: 350, height: 350 },
            blur: 100,
            color: "rgba(220, 38, 38, 0.06)",
          },
        ]}
      />

      {/* Floating decorative elements */}
      <div className="absolute inset-0 z-0 max-w-6xl mx-auto">
        <div className="absolute top-[20%] left-[20%] w-2 h-2 bg-destructive/30 rounded-full animate-pulse" />
        <div className="absolute top-[30%] right-[25%] w-1 h-1 bg-destructive/40 rounded-full animate-pulse delay-1000" />
        <div className="absolute bottom-[25%] left-[15%] w-1.5 h-1.5 bg-destructive/25 rounded-full animate-pulse delay-500" />
        <div className="absolute bottom-[35%] right-[20%] w-1 h-1 bg-destructive/35 rounded-full animate-pulse delay-1500" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 text-center">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Error Icon */}
          <div className="flex justify-center">
            <div className="w-24 h-24 bg-destructive/10 rounded-full flex items-center justify-center border border-destructive/20">
              <AlertTriangle className="h-12 w-12 text-destructive" />
            </div>
          </div>

          {/* Error Message */}
          <div className="space-y-4">
            <h1 className="text-3xl md:text-4xl font-light tracking-tight text-foreground">
              Something went wrong
            </h1>
            <p className="text-lg text-muted-foreground max-w-md mx-auto leading-relaxed">
              We encountered an unexpected error. Don&apos;t worry, our team has
              been notified and is working to fix it.
            </p>
          </div>

          {/* Error Details (Development only) */}
          {process.env.NODE_ENV === "development" && (
            <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-4 text-left">
              <h3 className="text-sm font-medium text-destructive mb-2">
                Error Details:
              </h3>
              <p className="text-xs text-muted-foreground font-mono break-all">
                {error.message}
              </p>
              {error.digest && (
                <p className="text-xs text-muted-foreground font-mono mt-2">
                  Error ID: {error.digest}
                </p>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Button
              onClick={reset}
              size="lg"
              className="px-8 py-3 rounded-lg font-medium transition-all duration-200 cursor-pointer"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>

            <Link href="/">
              <Button
                variant="outline"
                size="lg"
                className="border-border/50 bg-background/50 hover:bg-background/80 text-foreground px-8 py-3 rounded-lg font-medium transition-all duration-200 cursor-pointer"
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
};

export default Error;
