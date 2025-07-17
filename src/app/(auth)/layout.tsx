import React from "react";
import { Metadata } from "next";
import Navbar from "@/components/landing-page/Navbar";
import Footer from "@/components/landing-page/Footer";

export const metadata: Metadata = {
  title: "Authentication - Chat With Anything",
  description: "Login or sign up to Chat With Anything",
};

const AuthLayout = async ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <div className="min-h-screen bg-[#121212]">
      <Navbar />
      {children}
      <Footer />
    </div>
  );
};

export default AuthLayout;