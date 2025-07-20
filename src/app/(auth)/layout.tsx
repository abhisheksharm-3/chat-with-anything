import { Metadata } from "next";
import Navbar from "@/components/landing-page/Navbar";
import Footer from "@/components/landing-page/Footer";

/**
 * Metadata for pages using this layout.
 * This sets the title and description for the browser tab and for SEO purposes.
 */
export const metadata: Metadata = {
  title: "Authentication - Chat With Anything",
  description: "Login or sign up to Chat With Anything",
};

/**
 * Provides a consistent layout wrapper for authentication pages like login and signup.
 *
 * This server component wraps its children with a standard Navbar and Footer,
 * ensuring a uniform look and feel across the authentication flow.
 *
 * @param {object} props - The component props.
 * @param {React.ReactNode} props.children - The specific page content (e.g., a login or signup form) to be rendered inside the layout.
 * @returns {JSX.Element} The authentication layout component.
 */
const AuthLayout = async ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-[#121212]">
      <Navbar />
      {children}
      <Footer />
    </div>
  );
};

export default AuthLayout;
