import { DashboardDesktopSidebar } from "@/components/dashboard/DashboardDesktopSidebar";
import { DashboardMobileSidebar } from "@/components/dashboard/DashboardMobileSidebar";
import {
  DashboardDesktopHeader,
  DashboardMobileHeader,
} from "@/components/dashboard/DashboardHeaders";

/**
 * Defines the main layout structure for the authenticated dashboard.
 *
 * This server component assembles the responsive headers and sidebars for both
 * mobile and desktop views, wrapping the active page content.
 *
 * @param props The properties for the component.
 * @param props.children The specific page content to render within the layout.
 * @returns {JSX.Element} The complete dashboard layout with page content.
 */
const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="relative flex h-screen bg-[#121212] text-foreground">
      {/* Sidebar for desktop view (always visible) */}
      <DashboardDesktopSidebar />

      {/* Sidebar for mobile view (hidden by default) */}
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