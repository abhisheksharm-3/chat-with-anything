import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { File, Plus, ChevronsRight, ChevronsLeft } from "lucide-react";
import PricingDialog from "@/components/dashboard/PricingDialog";
import { TypeChat, TypeFile } from "@/types/supabase";
import { getFileTypeIcon } from "@/utils/dashboard-utils";

/**
 * Renders the application logo for the mobile header.
 * @component
 */
const MobileLogo = () => (
  <div className="w-8 h-8 flex items-center justify-center">
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
  <div className="flex items-center gap-2 bg-[#2a2a2a] px-4 py-2 rounded-l-md border-l-4 border-l-purple-500">
    {isChatPage && chat ? (
      <>
        <span className="text-white">
          {getFileTypeIcon(file?.type || chat.type)}
        </span>
        <span className="text-sm text-white truncate max-w-[200px]">
          {file?.name || chat.title || "Untitled Chat"}
        </span>
      </>
    ) : (
      <>
        <span className="text-white">
          <File size={16} />
        </span>
        <span className="text-sm text-white">New Note</span>
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
  <div className="flex items-center gap-2 px-4 py-2 bg-[#1a1a1a]">
    <span className="text-sm text-gray-400 uppercase">
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
    className="flex items-center justify-center px-3 py-2 rounded-r-md bg-[#1a1a1a] hover:bg-[#2a2a2a] transition-colors"
  >
    <Plus size={16} className="text-gray-400 hover:text-white" />
  </Link>
);

/**
 * The main header component for mobile views.
 * It includes a menu toggle, the logo, and an upgrade button.
 * @component
 * @param {object} props - The component's properties.
 * @param {() => void} props.onMenuToggle - Callback function to open/close the mobile sidebar.
 */
export const DashboardMobileHeader = ({ onMenuToggle }: { onMenuToggle: () => void }) => {
  const pathname = usePathname();
  const isSettingsPage = pathname === '/settings';
  const router = useRouter();

  return (
    <header className="md:hidden h-16 flex items-center justify-between px-4">
      <div className="flex items-center gap-3 bg-[#181818] rounded-lg border">
        {isSettingsPage ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="text-gray-400 hover:text-white"
            >
              <ChevronsLeft />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              onClick={onMenuToggle}
              className="text-gray-400 hover:text-white"
            >
              <ChevronsRight />
            </Button>
        )}
      </div>
      <MobileLogo />
      <div className="flex items-center gap-2">
        <PricingDialog
          trigger={
            <Button
              size="sm"
              className="bg-primary hover:bg-primary/90 text-white rounded-lg px-3 py-1"
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
 * @component
 * @param {object} props - The component's properties.
 * @param {boolean} props.isHistoryPage - Flag to conditionally hide tabs on the history page.
 * @param {boolean} props.isChatPage - Flag indicating if the current view is a chat page.
 * @param {TypeChat | null} props.chat - The data for the current chat session.
 * @param {TypeFile | null} props.file - The data for the file associated with the chat.
 */
export const DashboardDesktopHeader = ({
  isHistoryPage,
  isChatPage,
  chat,
  file,
}: {
  isHistoryPage: boolean;
  isChatPage: boolean;
  chat: TypeChat | null;
  file: TypeFile | null;
}) => (
  <header className="hidden md:flex h-16 items-center justify-between px-6">
    {!isHistoryPage && (
      <div className="flex items-center">
        <ActiveTab isChatPage={isChatPage} chat={chat} file={file} />
        {isChatPage && chat && <FileTypeTab chat={chat} file={file} />}
        <AddTabButton />
      </div>
    )}
    {/* Placeholder to keep the 'Upgrade' button to the right on the history page */}
    {isHistoryPage && <div></div>} 
    <PricingDialog
      trigger={
        <Button
          size="sm"
          className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl py-5 cursor-pointer"
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