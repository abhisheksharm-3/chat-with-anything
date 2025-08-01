import { Metadata } from "next";
import Layout from "@/components/layout/Layout";
import { AuthBrandingPanel } from "@/components/auth/AuthBrandingPanel";

export const metadata: Metadata = {
  title: "Authentication - Inquora",
  description: "Login or sign up to access your Inquora dashboard.",
};

/**
 * @description A definitive, asymmetric layout for authentication. It reserves a
 * fixed-width column for the form, ensuring a consistent, app-like feel, while
 * the branding panel dynamically fills the remaining space.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const brandViolet: [number, number, number] = [0.408, 0.212, 0.796];

  return (
    <Layout
      showFooter={false}
      enableNavbarBlur={false}
      contentClassName="w-full"
      ditherConfig={{
        waveColor: brandViolet,
        fullscreen: true,
        waveAmplitude: 0.1,
        waveFrequency: 1.5,
        waveSpeed: 0.02,
      }}
    >
      <div className="absolute inset-0 bg-black/60" />
      <div className="min-h-screen w-full lg:grid lg:grid-cols-[1fr_480px]">
        <AuthBrandingPanel />
        <div className="relative flex items-center justify-center p-4">
          {children}
        </div>
      </div>
    </Layout>
  );
}