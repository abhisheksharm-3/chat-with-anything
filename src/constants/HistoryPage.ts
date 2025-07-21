import { TypeDropdownAction } from "@/types/TypeUi";
import { Download, Send, Trash2 } from "lucide-react";

export const HistoryPageDropdownActions: TypeDropdownAction[] = [
  {
    icon: Download,
    label: "Download file",
    handler: (e, chat, file) => {
      e.preventDefault();
      e.stopPropagation();
      console.log("Download file:", file?.name);
    },
  },
  {
    icon: Send,
    label: "Share file",
    handler: (e, chat, file) => {
      e.preventDefault();
      e.stopPropagation();
      console.log("Share file:", file?.name);
    },
  },
  {
    icon: Trash2,
    label: "Delete",
    handler: (e, chat) => {
      e.preventDefault();
      e.stopPropagation();
      console.log("Delete chat:", chat.id);
    },
  },
];

export const HistoryPageSkeletonItems = Array.from(
  { length: 3 },
  (_, index) => ({ id: index }),
);

export const HistoryPageSkeletonConfigs = {
  title: { height: "h-4", width: "w-32 sm:w-48" },
  badge: { height: "h-4", width: "w-12" },
  mobileSize: { height: "h-2", width: "w-12" },
  mobileTime: { height: "h-2", width: "w-16" },
  desktopSize: { height: "h-3", width: "w-12" },
  desktopTime: { height: "h-3", width: "w-20" },
} as const;
