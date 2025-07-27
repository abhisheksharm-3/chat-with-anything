"use client";

import { useState, useEffect } from "react";

/**
 * A client-side custom hook to detect if the current device viewport is of a mobile size.
 *
 * It uses the `window.matchMedia` API for efficient, breakpoint-based media query matching.
 * During server-side rendering (SSR) and initial hydration, it defaults to `false` to
 * prevent layout shifts, providing the true value only after client-side mounting.
 *
 * @param {number} [breakpoint=768] - The width in pixels to use as the mobile threshold.
 * @returns {boolean} `true` if the viewport width is less than the breakpoint, otherwise `false`.
 */
export const useIsMobile = (breakpoint = 768): boolean => {
  // `useState` initializes with a getter function to ensure `window` is only accessed on the client.
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);

    // Function to update state when the media query match changes.
    const handleMediaChange = (event: MediaQueryListEvent) => {
      setIsMobile(event.matches);
    };
    
    // Set the initial value correctly after the component mounts.
    setIsMobile(mediaQuery.matches);

    // Listen for changes to the media query.
    mediaQuery.addEventListener("change", handleMediaChange);

    // Clean up the event listener on component unmount.
    return () => mediaQuery.removeEventListener("change", handleMediaChange);
  }, [breakpoint]);

  return isMobile;
};

export default useIsMobile;