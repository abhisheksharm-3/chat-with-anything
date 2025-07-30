"use client";

import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import React from "react";

/**
 * A list of key features available to all users during the free beta period.
 */
const featuresIncluded = [
  "AI-powered conversations",
  "Support for all document formats",
  "Unlimited uploads & queries",
  "Secure cloud storage",
  "Real-time collaboration",
];

/**
 * A cohesive pricing section matching the "dark glass" UI of the Features component.
 */
const Pricing = () => {
  return (
    <section
      id="pricing"
      className="relative w-full border-b border-white/10 bg-cover bg-center py-24 sm:py-32"
    >
      {/* Background Overlay for consistent theme and text visibility */}
      <div className="absolute inset-0 z-0" />

      <div className="relative z-10 mx-auto max-w-7xl px-6 text-center">
        {/* Badge with pulsing dot - exactly like the Features section */}
        <div className="mb-8 flex justify-center">
          <Badge
            variant="outline"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-neutral-200 transition-colors hover:bg-white/10"
          >
            <div className="h-2 w-2 animate-pulse rounded-full bg-primary/80" />
            <span className="text-sm font-medium tracking-wide">Pricing</span>
          </Badge>
        </div>

        {/* Headline with the same gradient as the Features section */}
        <h2 className="mb-4 text-4xl font-bold leading-tight tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-neutral-50 to-neutral-300 md:text-5xl">
          Free While We&apos;re in Beta
        </h2>
        <p className="mx-auto mb-16 max-w-3xl text-lg font-light text-neutral-300 md:text-xl">
          Join our journey and enjoy full access to Inquora. No limits, no costs—just your feedback to help us build the best product possible.
        </p>

        {/* Pricing details presented in a card with the same "glass" style */}
        <div className="relative mx-auto max-w-2xl rounded-2xl border border-white/10 bg-white/5 p-8 text-left">
          <div className="flex flex-col gap-8 md:flex-row md:items-center">
            {/* Left side: Price */}
            <div className="flex-1 text-center md:text-left">
              <p className="text-sm font-medium text-primary">PLAN</p>
              <p className="mt-2 text-7xl font-bold tracking-tighter text-neutral-50">
                Free
              </p>
              <p className="text-neutral-400">During our Beta phase</p>
            </div>

            {/* Right side: Features */}
            <div className="flex-1 border-t border-white/10 pt-8 md:border-l md:border-t-0 md:pl-8 md:pt-0">
              <p className="mb-4 font-semibold text-neutral-200">
                Includes full access to:
              </p>
              <ul className="space-y-3">
                {featuresIncluded.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <Check className="h-5 w-5 flex-shrink-0 text-primary" />
                    <span className="text-neutral-400">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Footer with CTA */}
          <div className="mt-10 border-t border-white/10 pt-8">
            <Button
              size="lg"
              className="w-full bg-neutral-100 font-semibold text-black transition-all hover:bg-neutral-300 active:scale-[0.98]"
            >
              Get Started for Free
            </Button>
            <p className="mt-3 text-center text-xs text-neutral-500">
              No credit card required.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;