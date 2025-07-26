import { Metadata } from "next";
import Navbar from "@/components/landing-page/Navbar";
import Footer from "@/components/landing-page/Footer";

/**
 * SEO metadata for all authentication pages.
 */
export const metadata: Metadata = {
  title: "Authentication - Chat With Anything",
  description: "Login or sign up to Chat With Anything",
};

/**
 * Defines the shared layout for authentication pages like login and signup.
 *
 * This server component wraps its children with a standard Navbar and Footer,
 * ensuring a uniform look and feel across the authentication flow.
 *
 * @param props The properties for the component.
 * @param props.children The specific page content (e.g., a login form) to be rendered.
 * @returns The authentication layout component with the page content.
 */
const AuthLayout = async ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-[#121212] flex flex-col w-full items-center justify-between">
      <Navbar />
      <main className="flex-1 flex items-center justify-center w-full px-4">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default AuthLayout;
