"use client";

import { useState, useEffect } from "react";

/**
 * A client-side custom hook to detect if the current device viewport is of a mobile size.
 *
 * It listens for window resize events and updates its state accordingly. During server-side
 * rendering (SSR) and initial client hydration, it returns `false` to prevent layout shifts
 * and mismatches, only providing the true value once the component has mounted on the client.
 *
 * @param {number} [breakpoint=768] - The width in pixels to use as the threshold for what is considered a mobile device.
 * @returns {boolean} Returns `true` if `window.innerWidth` is less than the breakpoint, otherwise `false`.
 */
export const useIsMobile = (breakpoint = 768): boolean => {
  // Initialize with null to safely handle server-side rendering
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  useEffect(() => {
    // This function runs only on the client
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };

    // Set the initial value after mounting
    checkIsMobile();

    // Update the value on window resize
    window.addEventListener("resize", checkIsMobile);

    // Clean up the event listener on component unmount
    return () => window.removeEventListener("resize", checkIsMobile);
  }, [breakpoint]);

  // Return a default of `false` during SSR and initial hydration
  return isMobile === null ? false : isMobile;
};

export default useIsMobile;
