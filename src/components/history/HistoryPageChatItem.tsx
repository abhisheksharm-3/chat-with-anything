import { useFileById } from "@/hooks/useFiles";
import { TypeChat } from "@/types/TypeSupabase";
import { HistoryPageChatMetadata } from "./HistoryPageChatMetadata";
import { HistorypageChatDropdown } from "./HistoryPageChatDropdown";
import Link from "next/link";

export const HistoryPageChatItem = ({ chat }: { chat: TypeChat }) => {
  const { data: fileData } = useFileById(chat.file_id || "");
  // Only pass the required properties and convert nulls to undefined
  const file = fileData
    ? {
        name: fileData.name,
        type: fileData.type ?? "unknown",
        size: fileData.size ?? 0,
      }
    : undefined;

  return (
    <div className="max-w-[395px] lg:max-w-screen px-2 bg-[#1a1a1a] hover:bg-[#252525] transition-colors relative group">
      <Link href={`/chat/${chat.id}`} className="block">
        <div className="p-3 sm:p-4">
          <HistoryPageChatMetadata chat={chat} file={file} isMobile />
          <HistoryPageChatMetadata chat={chat} file={file} />
        </div>
      </Link>
      <HistorypageChatDropdown chat={chat} file={file} />
    </div>
  );
};
