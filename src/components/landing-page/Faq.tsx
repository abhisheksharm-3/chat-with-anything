"use client";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { FaqData } from "@/constants/FaqData";
import React from "react";


/**
 * A cohesive FAQ section with updated content, matching the "dark glass" UI.
 */
const Faqs = () => {
  return (
    <section id="faq" className="relative w-full bg-cover bg-center py-24 sm:py-32">
      {/* Background Overlay for consistent theme and text visibility */}
      <div className="absolute inset-0 z-0 bg-black/70" />

      <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
        {/* Header structure mirroring the Features and Pricing sections */}
        <div className="mb-8 flex justify-center">
          <Badge
            variant="outline"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-neutral-200 transition-colors hover:bg-white/10"
          >
            <div className="h-2 w-2 animate-pulse rounded-full bg-primary/80" />
            <span className="text-sm font-medium tracking-wide">Questions</span>
          </Badge>
        </div>

        <h2 className="mb-4 text-4xl font-bold leading-tight tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-neutral-50 to-neutral-300 md:text-5xl">
          Frequently Asked Questions
        </h2>
        <p className="mx-auto mb-16 max-w-3xl text-lg font-light text-neutral-300 md:text-xl">
          Have questions? We&apos;ve got answers. If you can&apos;t find what you&apos;re looking for, feel free to reach out to our support team.
        </p>

        {/* Accordion housed in a "glass" card */}
        <div className="rounded-2xl border border-white/10 bg-white/5 text-left">
          <Accordion type="single" collapsible className="w-full">
            {FaqData.map((item, index) => (
              <AccordionItem
                key={item.value}
                value={item.value}
                // Remove bottom border for the last item
                className={index === FaqData.length - 1 ? "border-none" : "border-b border-white/10"}
              >
                <AccordionTrigger className="p-6 text-lg font-medium text-neutral-200 transition-colors hover:bg-white/10 hover:no-underline">
                  <span className="text-left">{item.question}</span>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6 text-base leading-relaxed text-neutral-400">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default Faqs;