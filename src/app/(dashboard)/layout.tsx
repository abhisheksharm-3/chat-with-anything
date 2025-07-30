// src/app/dashboard/layout.tsx

import Dither from "@/components/backgrounds/Dither/Dither";
import { DashboardDesktopSidebar } from "@/components/dashboard/DashboardDesktopSidebar";
import { DashboardMobileSidebar } from "@/components/dashboard/DashboardMobileSidebar";
import { DashboardDesktopHeader, DashboardMobileHeader } from "@/components/dashboard/DashboardHeaders";

/**
 * Defines the main dashboard layout with a dynamic "glass" aesthetic.
 */
const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const brandViolet: [number, number, number] = [0.408, 0.212, 0.796];

  return (
    <div className="relative flex h-screen w-full text-foreground">
      {/* Dynamic Dither Background */}
      <div className="absolute inset-0 -z-10">
        <Dither waveColor={brandViolet} waveAmplitude={0.1} />
      </div>

      <DashboardDesktopSidebar />
      <DashboardMobileSidebar />

      {/* Main content area now has a left padding to account for the new fixed sidebar */}
      <div className="flex flex-1 flex-col">
        <DashboardMobileHeader />
        <DashboardDesktopHeader />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;