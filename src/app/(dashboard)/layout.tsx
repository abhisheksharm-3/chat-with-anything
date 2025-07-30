// src/app/dashboard/layout.tsx

import { DashboardDesktopSidebar } from "@/components/dashboard/DashboardDesktopSidebar";
import { DashboardMobileSidebar } from "@/components/dashboard/DashboardMobileSidebar";
import {
  DashboardDesktopHeader,
  DashboardMobileHeader,
} from "@/components/dashboard/DashboardHeaders";

/**
 * Defines the main layout structure for the authenticated dashboard.
 */
const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    // Use theme variables for background and text color
    <div className="relative flex h-screen bg-background text-foreground">
      {/* Your existing sidebar components are preserved */}
      <DashboardDesktopSidebar />
      <DashboardMobileSidebar />

      <div className="flex flex-1 flex-col md:pl-14">
        {/* Your existing header components are preserved */}
        <DashboardMobileHeader />
        <DashboardDesktopHeader />

        {/* Main content area with improved padding */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;