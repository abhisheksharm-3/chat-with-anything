import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/providers/QueryProvider";

/**
 * Font configuration using Space Grotesk and JetBrains Mono
 * 
 * Space Grotesk: Modern, distinctive sans-serif with character and excellent readability
 * JetBrains Mono: Premium monospace font designed specifically for developers
 * 
 * This combination provides a unique, modern aesthetic perfect for AI applications
 * while maintaining excellent readability for chat interfaces and technical content.
 */
const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono", 
  subsets: ["latin"],
  display: "swap",
});

/**
 * Default metadata for the application.
 * Next.js uses this to set the <title> and <meta name="description"> tags
 * in the document's <head>, crucial for SEO and browser tab information.
 */
export const metadata: Metadata = {
  title: "Inquora",
  description: "Inquora – Chat with documents, videos, and more using AI.",
};

/**
 * The root layout component that wraps every page in the application.
 *
 * This component sets up the main HTML structure, applies the optimal font combination,
 * and wraps the entire application in necessary providers, such as the
 * `QueryProvider` for client-side data fetching.
 *
 * Font hierarchy:
 * - Primary: Space Grotesk (UI, body text, headings) - distinctive and modern
 * - Monospace: JetBrains Mono (code, technical content) - developer-focused
 *
 * @param {object} props - The component props.
 * @param {React.ReactNode} props.children - The active page or nested layout to be rendered.
 * @returns {React.ReactElement} The root layout of the application.
 */
const RootLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => (
  <html lang="en" className="dark">
    <body className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} antialiased`}>
      {/* QueryProvider wraps the app to provide a client-side cache for server data */}
      <QueryProvider>{children}</QueryProvider>
    </body>
  </html>
);

export default RootLayout;