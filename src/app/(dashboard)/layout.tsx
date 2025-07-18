"use client";
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Clock,
  Settings,
  LogOut,
  File,
  Plus,
  ChevronsRight,
  ChevronsLeft,
  Loader2,
  FileIcon,
} from "lucide-react";
import SettingsDialog from "@/components/dashboard/SettingsDialog";
import PricingDialog from "@/components/dashboard/PricingDialog";
import LogoutDialog from "@/components/dashboard/LogoutDialog";
import { useUser, useChats, useFileById } from "@/hooks";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

interface FileType {
  data?: {
    type?: string | null;
    name?: string;
  } | null;
}

interface Chat {
  file_id?: string | null;
  type?: string | null;
  title?: string | null;
}

interface User {
  name?: string | null;
  email?: string;
}

// Constants
const NAVIGATION_ITEMS = [
  { href: "/choose", icon: File },
  { href: "/history", icon: Clock },
] as const;

const MOBILE_NAV_ITEMS = [
  {
    href: "/choose",
    icon: FileText,
    title: "New Note",
    description: "Record and create new note",
  },
  {
    href: "/history",
    icon: Clock,
    title: "History",
    description: "Record and create new note",
  },
  {
    href: "/settings",
    icon: Settings,
    title: "Account Settings",
    description: "Manage your account preferences",
  },
] as const;

// Utility functions
const getFileTypeIcon = (type: string | null | undefined) => {
  const iconMap = {
    pdf: <FileText size={16} className="text-red-500" />,
    doc: <FileText size={16} className="text-blue-500" />,
    image: <FileIcon size={16} className="text-green-500" />,
    web: <FileIcon size={16} className="text-purple-500" />,
    url: <FileIcon size={16} className="text-purple-500" />,
    sheet: <FileIcon size={16} className="text-green-500" />,
    slides: <FileIcon size={16} className="text-orange-500" />,
    default: <FileText size={16} className="text-gray-500" />,
  };

  return iconMap[type as keyof typeof iconMap] || iconMap.default;
};

const getUserInitials = (user: User | null | undefined): string => {
  if (!user?.name) return "U";

  const nameParts = user.name.split(" ");
  if (nameParts.length === 1) return nameParts[0].charAt(0).toUpperCase();

  return (
    nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)
  ).toUpperCase();
};

// Sub-components
const Logo = () => (
  <Link href="/choose">
    <Image
      src="/logo.png"
      alt="Logo"
      className="object-contain"
      width={32}
      height={32}
      priority
    />
  </Link>
);

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

const DesktopNavigation = ({ pathname }: { pathname: string }) => (
  <nav className="flex flex-col space-y-2">
    {NAVIGATION_ITEMS.map(({ href, icon: Icon }) => (
      <Link
        key={href}
        href={href}
        className={`p-2 rounded-md transition-colors ${
          pathname === href
            ? "text-white"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <Icon size={20} />
      </Link>
    ))}
    <SettingsDialog
      trigger={
        <button className="p-2 rounded-md text-muted-foreground hover:text-foreground cursor-pointer">
          <Settings size={20} />
        </button>
      }
    />
  </nav>
);

const MobileNavigation = ({
  pathname,
  onItemClick,
}: {
  pathname: string;
  onItemClick: () => void;
}) => (
  <nav className="flex-1 p-4">
    <div className="space-y-2">
      {MOBILE_NAV_ITEMS.map(({ href, icon: Icon, title, description }) => (
        <Link
          key={href}
          href={href}
          className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
            pathname === href
              ? "bg-[#2a2a2a] text-white"
              : "text-gray-400 hover:text-white hover:bg-[#2a2a2a]"
          }`}
          onClick={onItemClick}
        >
          <Icon size={20} />
          <div>
            <div className="text-sm font-medium">{title}</div>
            <div className="text-xs text-gray-500">{description}</div>
          </div>
        </Link>
      ))}
    </div>
  </nav>
);

const UserProfile = ({
  user,
  isLoading,
}: {
  user: User | null | undefined;
  isLoading: boolean;
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
        <span className="text-gray-400 text-sm">Loading...</span>
      </div>
    );
  }

  return (
    <>
      <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
        <span className="text-white text-sm">{getUserInitials(user)}</span>
      </div>
      <div>
        <div className="text-white text-sm font-medium">
          {user?.name || "User"}
        </div>
        <div className="text-gray-400 text-xs">{user?.email || "No email"}</div>
      </div>
      <div className="ml-auto">
        <span className="bg-primary text-xs px-2 py-1 rounded">FREE</span>
      </div>
    </>
  );
};

const ActiveTab = ({
  isChatPage,
  chat,
  file,
}: {
  isChatPage: boolean;
  chat: Chat | null;
  file: FileType | null;
}) => (
  <div className="flex items-center gap-2 bg-[#2a2a2a] px-4 py-2 rounded-l-md border-l-4 border-l-purple-500">
    {isChatPage && chat ? (
      <>
        <span className="text-white">
          {getFileTypeIcon(file?.data?.type || chat.type)}
        </span>
        <span className="text-sm text-white truncate max-w-[200px]">
          {file?.data?.name || chat.title || "Untitled Chat"}
        </span>
      </>
    ) : (
      <>
        <span className="text-white">
          <FileText size={16} />
        </span>
        <span className="text-sm text-white">New Note</span>
      </>
    )}
  </div>
);

const FileTypeTab = ({
  chat,
  file,
}: {
  chat: Chat | null;
  file: FileType | null;
}) => (
  <div className="flex items-center gap-2 px-4 py-2 bg-[#1a1a1a]">
    <span className="text-sm text-gray-400 uppercase">
      {file?.data?.type || chat?.type || "Document"}
    </span>
  </div>
);

const AddTabButton = () => (
  <Link
    href="/choose"
    className="flex items-center justify-center px-3 py-2 rounded-r-md bg-[#1a1a1a] hover:bg-[#2a2a2a] transition-colors"
  >
    <Plus size={16} className="text-gray-400 hover:text-white" />
  </Link>
);

const MobileHeader = ({ onMenuToggle }: { onMenuToggle: () => void }) => {
  const pathname = usePathname();
  const isSettingsPage = pathname === '/settings';
  const router = useRouter();

  return (
  <header className="md:hidden h-16 flex items-center justify-between px-4">
    <div className="flex items-center gap-3 bg-[#181818] rounded-lg border">
        {isSettingsPage ? (
          <button
            onClick={() => router.back()}
            className="p-1 text-gray-400 hover:text-white"
          >
            <ChevronsLeft />
          </button>
        ) : (
      <button
        onClick={onMenuToggle}
        className="p-1 text-gray-400 hover:text-white"
      >
        <ChevronsRight />
      </button>
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

const DesktopHeader = ({
  isHistoryPage,
  isChatPage,
  chat,
  file,
}: {
  isHistoryPage: boolean;
  isChatPage: boolean;
  chat: Chat | null;
  file: FileType | null;
}) => (
  <header className="hidden md:flex h-16 items-center justify-between px-6">
    {!isHistoryPage && (
      <div className="flex items-center">
        <ActiveTab isChatPage={isChatPage} chat={chat} file={file} />
        {isChatPage && chat && <FileTypeTab chat={chat} file={file} />}
        <AddTabButton />
      </div>
    )}
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

const DesktopSidebar = ({ pathname }: { pathname: string }) => (
  <aside className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 z-20 w-12 bg-[#181818] rounded-xl flex-col items-center justify-between py-2 px-2 h-[calc(100vh-1rem)]">
    <Logo />
    <DesktopNavigation pathname={pathname} />
    <LogoutDialog
      trigger={
        <button className="p-2 rounded-md text-muted-foreground hover:text-destructive cursor-pointer">
          <LogOut size={20} />
        </button>
      }
    />
  </aside>
);

const MobileSidebar = ({
  isOpen,
  onClose,
  pathname,
  user,
  isLoading,
}: {
  isOpen: boolean;
  onClose: () => void;
  pathname: string;
  user: User | null | undefined;
  isLoading: boolean;
}) => (
  <>
    {isOpen && (
      <div
        className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />
    )}
    <aside
      className={`md:hidden fixed left-0 top-0 h-full w-full bg-[#181818] z-50 transform transition-transform duration-300 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-[#121212]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center">
              <Image
                src="/logo.png"
                alt="Logo"
                className="object-contain"
                width={44}
                height={40}
                priority
              />
            </div>
            <span className="text-white font-medium">chatwithanything</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white border rounded-lg"
          >
            <ChevronsLeft size={20} />
          </button>
        </div>
        <MobileNavigation pathname={pathname} onItemClick={onClose} />
        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <UserProfile user={user} isLoading={isLoading} />
          </div>
          <PricingDialog
            trigger={
              <Button className="w-full bg-primary hover:bg-primary/90 text-white rounded-lg py-3">
                Upgrade to pro
              </Button>
            }
          />
        </div>
      </div>
    </aside>
  </>
);

// Main component
const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const pathname = usePathname();
  const params = useParams();
  const { user, isLoading } = useUser();
  const { getChatById } = useChats();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Derived values
  const isHistoryPage = pathname === "/history";
  const isChatPage = pathname?.startsWith("/chat/");
  const chatId = isChatPage && params?.id ? params.id.toString() : null;
  const chat = chatId ? getChatById(chatId) : null;

  // Use the separate hook for file fetching
  const fileQuery = useFileById(chat?.file_id || "");
  const file = fileQuery.data;

  const handleMobileMenuToggle = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const handleMobileMenuClose = () => setIsMobileMenuOpen(false);

  return (
    <div className="relative flex h-screen bg-[#121212] text-foreground">
      <DesktopSidebar pathname={pathname} />
      <MobileSidebar
        isOpen={isMobileMenuOpen}
        onClose={handleMobileMenuClose}
        pathname={pathname}
        user={user as User | null | undefined}
        isLoading={isLoading}
      />

      <div className="flex-1 flex flex-col md:pl-14">
        <MobileHeader onMenuToggle={handleMobileMenuToggle} />
        <DesktopHeader
          isHistoryPage={isHistoryPage}
          isChatPage={isChatPage}
          chat={chat as Chat | null}
          file={file as FileType | null}
        />
        <main className="flex-1 overflow-auto p-2">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
