import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/providers/QueryProvider";

/**
 * Initializes the Inter font with the 'latin' subset and sets it up
 * to be used via a CSS variable for consistent typography.
 */
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

/**
 * Default metadata for the application.
 * Next.js uses this to set the <title> and <meta name="description"> tags
 * in the document's <head>, crucial for SEO and browser tab information.
 */
export const metadata: Metadata = {
  title: "Chat With Anything",
  description: "Chat with any of your data sources",
};

/**
 * The root layout component that wraps every page in the application.
 *
 * This component sets up the main HTML structure, applies the global font,
 * and wraps the entire application in necessary providers, such as the
 * `QueryProvider` for client-side data fetching.
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
    <body className={`${inter.variable} antialiased`}>
      {/* QueryProvider wraps the app to provide a client-side cache for server data */}
      <QueryProvider>{children}</QueryProvider>
    </body>
  </html>
);

export default RootLayout;
