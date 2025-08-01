"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel";
import { cn } from "@/utils/cn";

// Types for our slide configuration
type SlideType = "image" | "video";

interface Slide {
  type: SlideType;
  src: string;
  caption: string;
  title?: string;
}

// Premium slides with titles and captions
const slides: Slide[] = [
  {
    type: "video",
    src: "https://cdn.dribbble.com/userupload/10419472/file/original-b2a5925064e72346613c76f629a997a4.mp4",
    title: "AI-Powered Analytics",
    caption: "Generate insightful reports in seconds with our advanced AI engine.",
  },
  {
    type: "image",
    src: "https://cdn.dribbble.com/userupload/12557688/file/original-27488b75cb44e8c15d742918b9df4b48.png",
    title: "Intuitive Dashboards",
    caption: "Visualize your most important data at a glance with customizable views.",
  },
  {
    type: "image",
    src: "https://cdn.dribbble.com/userupload/8493923/file/original-1b492b45f4350595a388456d8a243409.png",
    title: "Seamless Collaboration",
    caption: "Collaborate with your entire team in real-time across all devices.",
  },
];

// Browser frame component for a more premium look
const BrowserFrame: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="overflow-hidden rounded-xl border border-white/15 bg-black/40 shadow-2xl shadow-violet-900/30 backdrop-blur-md">
    <div className="flex items-center gap-2 border-b border-white/10 bg-gradient-to-r from-black/50 to-black/30 p-3">
      <div className="flex gap-1.5">
        <div className="h-3 w-3 rounded-full bg-rose-500/80"></div>
        <div className="h-3 w-3 rounded-full bg-amber-500/80"></div>
        <div className="h-3 w-3 rounded-full bg-emerald-500/80"></div>
      </div>
      <div className="mx-auto flex h-6 w-2/3 items-center justify-center rounded-md bg-black/30 px-3 text-xs text-neutral-400">
        app.inquora.com
      </div>
    </div>
    {children}
  </div>
);

// Navigation dot component
const NavigationDot: React.FC<{
  active: boolean;
  onClick: () => void;
  index: number;
}> = ({ active, onClick, index }) => (
  <button
    onClick={onClick}
    className="group relative"
    aria-label={`Go to slide ${index + 1}`}
  >
    <span className="absolute -inset-2" />
    <motion.span
      initial={false}
      animate={{
        scale: active ? 1 : 0.65,
        opacity: active ? 1 : 0.6,
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30,
      }}
      className={cn(
        "block h-2 w-2 rounded-full transition-all duration-300",
        active ? "bg-white" : "bg-neutral-400 group-hover:bg-white/80"
      )}
    />
  </button>
);

// Caption component with animation
const SlideCaption: React.FC<{ slide: Slide; visible: boolean }> = ({ slide, visible }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 20 }}
    transition={{ duration: 0.4 }}
    className="space-y-1.5"
  >
    {slide.title && (
      <h3 className="font-semibold text-white text-xl">{slide.title}</h3>
    )}
    <p className="text-base text-neutral-200">{slide.caption}</p>
  </motion.div>
);

// Main component
export const AuthBrandingPanel: React.FC = () => {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!api) return;
    
    const onSelect = () => {
      setCurrent(api.selectedScrollSnap());
    };
    
    setCurrent(api.selectedScrollSnap());
    api.on("select", onSelect);
    
    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  return (
    <div className="relative hidden h-full flex-col justify-between p-10 lg:flex">

      {/* Product showcase carousel */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.8 }}
        className="relative z-10"
      >
        <Carousel
          setApi={setApi}
          opts={{
            loop: true,
            skipSnaps: false,
            duration: 20,
          }}
          className="w-full"
        >
          <BrowserFrame>
            <CarouselContent>
              {slides.map((slide, index) => (
                <CarouselItem key={index}>
                  <div className="aspect-video overflow-hidden">
                    {slide.type === "image" ? (
                      <img 
                        src={slide.src} 
                        alt={slide.caption} 
                        className="h-full w-full object-cover object-center" 
                      />
                    ) : (
                      <video
                        src={slide.src}
                        className="h-full w-full object-cover object-center"
                        autoPlay
                        muted
                        loop
                        playsInline
                      />
                    )}
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </BrowserFrame>

          <div className="mt-7 flex flex-col gap-6">
            {/* Caption with animation */}
            <div className="h-16">
              <AnimatePresence mode="wait">
                {slides.map((slide, idx) => (
                  idx === current && (
                    <SlideCaption 
                      key={idx} 
                      slide={slide} 
                      visible={idx === current} 
                    />
                  )
                ))}
              </AnimatePresence>
            </div>
          </div>
        </Carousel>
      </motion.div>
    </div>
  );
};