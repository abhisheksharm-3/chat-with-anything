// src/components/history/HistoryPageChatMetadata.tsx

import { Badge } from "@/components/ui/badge";
import { formatFileSize, formatTimeAgo } from "@/utils/history-page-utils";
import { TypeHistoryPageChatMetadataProps } from "@/types/TypeUi";

/**
 * Displays themed and responsive metadata for a single chat item.
 */
export const HistoryPageChatMetadata = ({ chat, file }: TypeHistoryPageChatMetadataProps) => {
  const title = chat.title || file?.name || "Untitled Chat";
  const fileType = file?.type?.toUpperCase() || "FILE";

  return (
    <div className="flex w-full items-center justify-between gap-4">
      {/* Left side: Title and Type Badge */}
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <h3 className="truncate font-medium text-foreground">{title}</h3>
        <Badge variant="secondary" className="hidden sm:inline-block">{fileType}</Badge>
      </div>

      {/* Right side: File Size and Time */}
      <div className="flex flex-shrink-0 items-center gap-4 text-xs text-muted-foreground sm:gap-6">
        {file?.size && (
          <span className="hidden md:inline">{formatFileSize(file.size)}</span>
        )}
        <span>{formatTimeAgo(chat.created_at)}</span>
      </div>
    </div>
  );
};