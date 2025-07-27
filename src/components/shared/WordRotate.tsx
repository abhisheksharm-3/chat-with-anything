"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { cn } from "@/utils/cn";
import { TypeWordRotateProps } from "@/types/TypeUi";

/**
 * A client-side component that animates through a list of words, rotating them one by one.
 *
 * It uses Framer Motion's `AnimatePresence` to create smooth transitions between words.
 *
 * @param {TypeWordRotateProps} props - The properties for the component.
 * @returns {JSX.Element} The rendered word rotation animation.
 */
export const WordRotate = ({
  words,
  duration = 2500,
  motionProps = {
    initial: { opacity: 0, y: -50 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 50 },
    transition: { duration: 0.25, ease: "easeOut" },
  },
  className,
}: TypeWordRotateProps) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % words.length);
    }, duration);

    // Clean up the interval on component unmount
    return () => clearInterval(interval);
  }, [words, duration]);

  return (
    <div className="overflow-hidden py-2">
      <AnimatePresence mode="wait">
        <motion.h1
          key={words[index]}
          className={cn(className)}
          {...motionProps}
        >
          {words[index]}
        </motion.h1>
      </AnimatePresence>
    </div>
  );
};