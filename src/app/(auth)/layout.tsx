import React from "react";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { supabaseServerClient } from "@/utils/supabase/server";

export const metadata: Metadata = {
  title: "Authentication - Chat With Anything",
  description: "Login or sign up to Chat With Anything",
};

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check if user is already authenticated
  const supabase = await supabaseServerClient();
  const { data: { session } } = await supabase.auth.getSession();

  // If user is already logged in, redirect to dashboard
  if (session) {
    redirect("/choose");
  }

  return (
    <div className="min-h-screen bg-[#121212]">
      {children}
    </div>
  );
} 