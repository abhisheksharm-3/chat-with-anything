// src/app/(auth)/layout.tsx

import { Metadata } from "next";
import Layout from "@/components/layout/Layout"; // Import the main layout

/**
 * SEO metadata for all authentication pages.
 */
export const metadata: Metadata = {
  title: "Authentication - Inquora",
  description: "Login or sign up to access your Inquora dashboard.",
};

/**
 * Defines the shared layout for authentication pages using the main Layout component.
 *
 * This component configures the main layout for a focused authentication experience:
 * - Enables a full-screen dither background with the brand color.
 * - Disables the footer to reduce distractions.
 * - Centers the content (the login/signup form) on the page.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const brandViolet: [number, number, number] = [0.408, 0.212, 0.796];

  return (
    <Layout
      showFooter={false}
      enableNavbarBlur={false} // Often cleaner to disable blur when bg is already dynamic
      contentClassName="flex items-center justify-center w-full px-4"
      ditherConfig={{
        waveColor: brandViolet,
        fullscreen: true, // Tell the layout to make the background full-screen
        waveAmplitude: 0.1,
        waveFrequency: 2.5,
      }}
    >
      {children}
    </Layout>
  );
}