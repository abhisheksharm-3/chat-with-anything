"use client";

import React, { useState } from "react";
import { usePathname, useParams } from "next/navigation";
import { useUser, useChats, useFileById } from "@/hooks";
import { TypeChat, TypeFile, TypeUser } from "@/types/supabase";
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
 * and headers for both mobile and desktop views. It determines the current
 * page context (e.g., history page, specific chat page) based on the URL
 * and fetches necessary data to pass down to its children, such as the header.
 *
 * @param {object} props - The component props.
 * @param {React.ReactNode} props.children - The specific page content to render within the layout.
 * @returns {React.ReactElement} The complete dashboard layout.
 */
const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const params = useParams();
  const { user, isLoading } = useUser();
  const { getChatById } = useChats();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // --- Derived Values ---
  // Determine the current page context based on the URL.
  const isHistoryPage = pathname === "/history";
  const isChatPage = pathname?.startsWith("/chat/");
  const chatId = isChatPage && params?.id ? params.id.toString() : null;
  const chat = chatId ? getChatById(chatId) : null;

  // Fetch file details associated with the current chat, if any.
  const fileQuery = useFileById(chat?.file_id || "");
  const file = fileQuery.data;

  // --- Handlers ---
  /** Toggles the visibility of the mobile sidebar. */
  const handleMobileMenuToggle = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  /** Closes the mobile sidebar. */
  const handleMobileMenuClose = () => setIsMobileMenuOpen(false);

  return (
    <div className="relative flex h-screen bg-[#121212] text-foreground">
      {/* Sidebar for desktop view, always visible. */}
      <DashboardDesktopSidebar pathname={pathname} />
      {/* Sidebar for mobile view, visibility is controlled by state. */}
      <DashboardMobileSidebar
        isOpen={isMobileMenuOpen}
        onClose={handleMobileMenuClose}
        pathname={pathname}
        user={user as TypeUser | null | undefined}
        isLoading={isLoading}
      />

      <div className="flex-1 flex flex-col md:pl-14">
        {/* Header for mobile view, includes menu toggle button. */}
        <DashboardMobileHeader onMenuToggle={handleMobileMenuToggle} />
        {/* Header for desktop view, displays contextual information. */}
        <DashboardDesktopHeader
          isHistoryPage={isHistoryPage}
          isChatPage={isChatPage}
          chat={chat as TypeChat | null}
          file={file as TypeFile | null}
        />
        <main className="flex-1 overflow-auto lg:p-2">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
