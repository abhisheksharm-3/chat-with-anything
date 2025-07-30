// src/components/dashboard/DashboardHeaders.tsx

"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, PanelLeft } from "lucide-react";

import PricingDialog from "./PricingDialog";
import { useSidebarState } from "@/hooks/useMobileSidebarState";
import { useChats } from "@/hooks/useChats";
import { useFileById } from "@/hooks/useFiles";
import { TypeChat, TypeFile } from "@/types/TypeSupabase";

// This sub-component is used by the Desktop Header
const ActiveTab = ({ chat, file }: { chat: TypeChat | null; file: TypeFile | null }) => (
  <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-2 px-3 shadow-sm">
    <div className="h-full w-1 self-stretch rounded-full bg-primary" />
    <div className="min-w-0">
      <p className="truncate text-sm font-medium text-foreground">{file?.name || chat?.title || "New Chat"}</p>
    </div>
    <Badge variant="secondary">{file?.type?.toUpperCase() || chat?.type?.toUpperCase() || "DOC"}</Badge>
  </div>
);

// This sub-component is used by the Desktop Header
const AddTabButton = () => (
  <Button asChild variant="outline" size="icon">
    <Link href="/choose"><Plus className="h-4 w-4" /></Link>
  </Button>
);

/**
 * The header for mobile views, now correctly implemented.
 * It is sticky and contains the sidebar trigger.
 */
export const DashboardMobileHeader = () => {
  const { openSidebar } = useSidebarState();

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-white/10 bg-black/30 px-4 backdrop-blur-md md:hidden">
      <Button variant="ghost" size="icon" onClick={openSidebar}>
        <PanelLeft className="h-5 w-5" />
        <span className="sr-only">Open Sidebar</span>
      </Button>
      <Link href="/dashboard">
        <Image src="/logo.png" alt="Logo" width={28} height={28} priority />
      </Link>
      <PricingDialog trigger={<Button size="sm">Upgrade</Button>} />
    </header>
  );
};

/**
 * The header for desktop views.
 */
export const DashboardDesktopHeader = () => {
  const params = useParams();
  const pathname = usePathname();
  const { getChatById } = useChats();
  const isHistoryPage = pathname === "/history";
  const isChatPage = pathname?.startsWith("/chat/");
  const chatId = isChatPage && params?.id ? params.id.toString() : null;
  const chat = chatId ? getChatById(chatId) : null;
  const { data: file } = useFileById(chat?.file_id || "");

  return (
    <header className="hidden h-16 shrink-0 items-center justify-between border-b border-white/10 bg-black/20 px-6 backdrop-blur-md md:flex">
      <div className="flex items-center gap-2">
        {!isHistoryPage && <ActiveTab chat={chat ?? null} file={file || null} />}
        <AddTabButton />
      </div>
      <PricingDialog
        trigger={
          <Button size="sm">
            Upgrade plan
            <Badge variant="secondary" className="ml-2 bg-white/20">PRO</Badge>
          </Button>
        }
      />
    </header>
  );
};