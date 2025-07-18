import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { File, Plus, ChevronsRight, ChevronsLeft } from "lucide-react";
import PricingDialog from "@/components/dashboard/PricingDialog";
import { TypeChat } from "@/types/supabase";
import { TypeFileType } from "@/types/types";
import { getFileTypeIcon } from "@/utils/dashboard-utils";

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

const ActiveTab = ({
  isChatPage,
  chat,
  file,
}: {
  isChatPage: boolean;
  chat: TypeChat | null;
  file: TypeFileType | null;
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
          <File size={16} />
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
  chat: TypeChat | null;
  file: TypeFileType | null;
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

export const MobileHeader = ({ onMenuToggle }: { onMenuToggle: () => void }) => {
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

export const DesktopHeader = ({
  isHistoryPage,
  isChatPage,
  chat,
  file,
}: {
  isHistoryPage: boolean;
  isChatPage: boolean;
  chat: TypeChat | null;
  file: TypeFileType | null;
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