"use client"

import { useState, useEffect } from 'react';

/**
 * Hook to detect if the current device is mobile based on screen width
 * @param breakpoint - The width threshold in pixels (default: 768px)
 * @returns boolean indicating if the device is mobile
 */
export const useIsMobile = (breakpoint = 768): boolean => {
  // Initialize with null to indicate "not determined yet"
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  useEffect(() => {
    // Function to update state based on window size
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };

    // Initial check
    checkIsMobile();

    // Add event listener for resize
    window.addEventListener('resize', checkIsMobile);

    // Clean up
    return () => window.removeEventListener('resize', checkIsMobile);
  }, [breakpoint]);

  // Return false during SSR to prevent layout shifts
  // Only return the actual value once it's been determined on the client
  return isMobile === null ? false : isMobile;
};

export default useIsMobile; 