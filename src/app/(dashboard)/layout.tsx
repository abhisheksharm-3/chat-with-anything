import { DashboardDesktopSidebar } from "@/components/dashboard/DashboardDesktopSidebar";
import { DashboardMobileSidebar } from "@/components/dashboard/DashboardMobileSidebar";
import {
  DashboardDesktopHeader,
  DashboardMobileHeader,
} from "@/components/dashboard/DashboardHeaders";

/**
 * Provides the main layout structure for the authenticated dashboard area.
 *
 * This component wraps all dashboard pages, rendering the appropriate sidebars
 * and headers for both mobile and desktop views. All dynamic logic and state
 * management has been moved to individual child components to enable server-side rendering.
 *
 * @param {object} props - The component props.
 * @param {React.ReactNode} props.children - The specific page content to render within the layout.
 * @returns {Promise<React.ReactElement>} The complete dashboard layout.
 */
const DashboardLayout = async ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="relative flex h-screen bg-[#121212] text-foreground">
      {/* Sidebar for desktop view, always visible. */}
      <DashboardDesktopSidebar />

      {/* Sidebar for mobile view */}
      <DashboardMobileSidebar />

      <div className="flex-1 flex flex-col md:pl-14">
        {/* Header for mobile view */}
        <DashboardMobileHeader />

        {/* Header for desktop view */}
        <DashboardDesktopHeader />

        <main className="flex-1 overflow-auto lg:p-2">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
