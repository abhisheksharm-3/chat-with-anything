// src/components/history/HistoryPageChatItem.tsx

import { useFileById } from "@/hooks/useFiles";
import { TypeChat } from "@/types/TypeSupabase";
import { HistoryPageChatMetadata } from "./HistoryPageChatMetadata";
import { HistorypageChatDropdown } from "./HistoryPageChatDropdown";
import Link from "next/link";

/**
 * A themed list item representing a single chat in the history.
 */
export const HistoryPageChatItem = ({ chat }: { chat: TypeChat }) => {
  const { data: fileData } = useFileById(chat.file_id || "");
  const file = fileData ? {
    name: fileData.name,
    type: fileData.type ?? "unknown",
    size: fileData.size ?? 0,
  } : undefined;

  return (
    <div className="group relative rounded-lg border border-border bg-card transition-colors hover:bg-accent hover:border-primary/30">
      <Link href={`/chat/${chat.id}`} className="block p-4">
        <HistoryPageChatMetadata chat={chat} file={file} />
      </Link>
      <HistorypageChatDropdown chat={chat} file={file} />
    </div>
  );
};