"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { File, Plus, ChevronsRight, ChevronsLeft } from "lucide-react";
import PricingDialog from "@/components/dashboard/PricingDialog";
import { TypeChat, TypeFile } from "@/types/supabase";
import { useSidebarState } from "@/hooks/useMobileSidebarState";
import { useChats } from "@/hooks/useChats";
import { useFileById } from "@/hooks/useFiles";

/**
 * Renders the application logo for the mobile header.
 * @component
 */
const MobileLogo = () => (
  <div className="w-8 h-8 flex items-center justify-center translate-x-5">
    <Image
      src="/logo.png"
      alt="Logo"
      className="object-contain"
      width={44}
      height={40}
      priority
    />
  </div>
);

/**
 * Renders the active tab in the desktop header, displaying the current chat/file name or "New Note".
 * @component
 * @param {object} props - The component's properties.
 * @param {boolean} props.isChatPage - Flag to determine if the active page is a chat.
 * @param {TypeChat | null} props.chat - The data for the current chat session.
 * @param {TypeFile | null} props.file - The data for the file associated with the chat.
 */
const ActiveTab = ({
  isChatPage,
  chat,
  file,
}: {
  isChatPage: boolean;
  chat: TypeChat | null;
  file: TypeFile | null;
}) => (
  <div className="flex items-center gap-4 bg-[#181818] border border-[#272626] px-2 py-2  border-l-4 border-l-primary rounded-xl">
    {isChatPage && chat ? (
      <>
        <span className="text-sm text-white truncate max-w-[200px]">
          {file?.name || chat.title || "Untitled Chat"}
        </span>
        <FileTypeTab chat={chat} file={file} />
      </>
    ) : (
      <>
        <span className="text-white">
          <File size={16} />
        </span>
        <span className="text-sm text-white">New Note</span>
        <FileTypeTab chat={chat} file={file} />
      </>
    )}
  </div>
);

/**
 * Renders a secondary tab displaying the file type of the current document.
 * @component
 * @param {object} props - The component's properties.
 * @param {TypeChat | null} props.chat - The current chat data to derive the type from.
 * @param {TypeFile | null} props.file - The current file data to derive the type from.
 */
const FileTypeTab = ({
  chat,
  file,
}: {
  chat: TypeChat | null;
  file: TypeFile | null;
}) => (
  <div className="flex items-center gap-2 px-1 py-1 bg-[#262525] rounded-lg">
    <span className="text-xs font-semibold text-gray-400 uppercase">
      {file?.type || chat?.type || "Document"}
    </span>
  </div>
);

/**
 * Renders a button with a plus icon that links to the '/choose' page to create a new chat.
 * @component
 */
const AddTabButton = () => (
  <Link
    href="/choose"
    className="flex items-center justify-center px-1 py-1 rounded-lg bg-[#181818] hover:bg-[#2a2a2a] transition-colors border border-[#272626]"
  >
    <Plus size={16} className="text-gray-400 hover:text-white" />
  </Link>
);

/**
 * The main header component for mobile views.
 * It includes a menu toggle, the logo, and an upgrade button.
 * Now handles its own state and communicates with the mobile sidebar.
 * @component
 */
export const DashboardMobileHeader = () => {
  const pathname = usePathname();
  const isSettingsPage = pathname === "/settings";
  const router = useRouter();

  const { openSidebar } = useSidebarState();

  const handleMenuToggle = () => {
    openSidebar();
  };

  return (
    <header className="md:hidden h-16 flex items-center justify-between px-4 max-w-screen bg-[#121212]">
      <div className="flex items-center gap-3 bg-[#181818] rounded-lg border">
        {isSettingsPage ? (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="text-gray-400 hover:text-white"
          >
            <ChevronsLeft className="size-8" />
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleMenuToggle}
            className="text-gray-400 hover:text-white"
          >
            <ChevronsRight className="size-8" />
          </Button>
        )}
      </div>
      <MobileLogo />
      <div className="flex items-center gap-2">
        <PricingDialog
          trigger={
            <Button
              size="sm"
              className="bg-primary hover:bg-primary/90 text-white rounded-lg px-3 py-5 text-lg font-medium"
            >
              Upgrade
            </Button>
          }
        />
      </div>
    </header>
  );
};

/**
 * The main header component for desktop views.
 * It displays a tabbed interface for the current chat and an upgrade button.
 * Now handles its own data fetching and page context logic.
 * @component
 * @param {object} props - The component's properties.
 * @param {string} props.pathname - The current URL path from SSR.
 */
export const DashboardDesktopHeader = () => {
  const params = useParams();
  const pathname = usePathname();
  const { getChatById } = useChats();

  // --- Derived Values (moved from layout) ---
  // Determine the current page context based on the URL.
  const isHistoryPage = pathname === "/history";
  const isChatPage = pathname?.startsWith("/chat/");
  const chatId = isChatPage && params?.id ? params.id.toString() : null;
  const chat = chatId ? getChatById(chatId) : null;

  // Fetch file details associated with the current chat, if any.
  const fileQuery = useFileById(chat?.file_id || "");
  const file = fileQuery.data || null; // Explicitly handle undefined case

  return (
    <header className="hidden md:flex h-16 items-center justify-between px-2">
      {!isHistoryPage && (
        <div className="flex items-center gap-3">
          <ActiveTab isChatPage={isChatPage} chat={chat || null} file={file} />
          <AddTabButton />
        </div>
      )}
      {/* Placeholder to keep the 'Upgrade' button to the right on the history page */}
      {isHistoryPage && <div></div>}
      <PricingDialog
        trigger={
          <Button
            size="sm"
            className="rounded-xl py-5 cursor-pointer"
          >
            Upgrade plan
            <span className="ml-2 text-xs bg-primary-foreground/20 text-primary-foreground font-semibold px-1.5 py-0.5 rounded">
              PRO
            </span>
          </Button>
        }
      />
    </header>
  );
};