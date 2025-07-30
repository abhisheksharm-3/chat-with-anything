// src/app/error.tsx

"use client";

import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Dither from "@/components/backgrounds/Dither/Dither";
import { TypeErrorProps } from "@/types/TypeUi";

/**
 * Renders a user-friendly error boundary page, redesigned to match the application's UI.
 *
 * This component catches runtime errors and provides a fallback UI with a themed,
 * dynamic background and options to recover.
 *
 * @param props The props for the component, automatically provided by Next.js.
 * @param props.error The error object.
 * @param props.reset A function to reset the error boundary by re-rendering.
 * @returns {JSX.Element} The rendered error page.
 */
const Error = ({ error, reset }: TypeErrorProps) => {
  // A reddish hue for the dither background to match the error state
  const destructiveColor: [number, number, number] = [0.9, 0.2, 0.2];

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden p-4">
      {/* Dynamic Dither Background with a destructive color tint */}
      <div className="absolute inset-0 -z-10">
        <Dither
          waveColor={destructiveColor}
          waveAmplitude={0.1}
        />
      </div>

      {/* Main Content Panel */}
      <div className="relative z-10 flex w-full max-w-lg flex-col items-center justify-center rounded-2xl border border-destructive/20 bg-black/20 p-8 text-center shadow-2xl shadow-black/40 backdrop-blur-lg sm:p-12">
        {/* Error Icon */}
        <div className="flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full border border-destructive/20 bg-destructive/10">
            <AlertTriangle className="h-10 w-10 text-destructive" />
          </div>
        </div>

        {/* Error Message */}
        <div className="mt-6 space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Something went wrong
          </h1>
          <p className="text-lg leading-relaxed text-muted-foreground">
            We encountered an unexpected error. Our team has been notified and
            is working to fix it.
          </p>
        </div>

        {/* Error Details (Development only) */}
        {process.env.NODE_ENV === "development" && (
          <div className="mt-6 w-full rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-left">
            <h3 className="mb-2 text-sm font-medium text-destructive-foreground">
              Error Details:
            </h3>
            <p className="font-mono text-xs text-muted-foreground break-all">
              {error.message}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-8 flex w-full flex-col gap-4 sm:flex-row sm:justify-center">
          <Button size="lg" variant="destructive" onClick={reset}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Go Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Error;