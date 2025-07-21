import { TypeHistoryPageChatMetadataProps } from "@/types/TypeUi";
import { formatFileSize, formatTimeAgo } from "@/utils/history-page-utils";

export const HistoryPageChatMetadata = ({
  chat,
  file,
  isMobile = false,
}: TypeHistoryPageChatMetadataProps) => {
  const title = chat.title || file?.name || "Untitled Chat";
  const fileType = file?.type?.toUpperCase() || "FILE";

  const baseClasses = isMobile ? "flex sm:hidden" : "hidden sm:flex";
  const titleClasses = isMobile
    ? "font-normal text-sm text-white truncate"
    : "font-normal text-base text-white truncate";
  const typeClasses = isMobile
    ? "text-[10px] text-[#A9A9A9] uppercase bg-[#2a2a2a] px-1.5 py-0.5 rounded whitespace-nowrap"
    : "text-xs text-[#A9A9A9] uppercase bg-[#2a2a2a] px-2 py-1 rounded whitespace-nowrap";
  const metaTextClasses = isMobile ? "text-[10px]" : "text-xs";

  if (isMobile) {
    return (
      <div className={`${baseClasses} items-start justify-between`}>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className={titleClasses}>{title}</h3>
            <span className={typeClasses}>{fileType}</span>
          </div>
          <div
            className={`flex items-center gap-3 ${metaTextClasses} text-[#A9A9A9]`}
          >
            {file?.size && <span>{formatFileSize(file.size)}</span>}
            <span>{formatTimeAgo(chat.created_at)}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${baseClasses} items-center justify-between`}>
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <h3 className={titleClasses}>{title}</h3>
        <span className={typeClasses}>{fileType}</span>
      </div>
      <div className="flex items-center gap-6 flex-shrink-0 pr-10">
        {file?.size && (
          <span className={`${metaTextClasses} text-[#A9A9A9]`}>
            {formatFileSize(file.size)}
          </span>
        )}
        <span className={`${metaTextClasses} text-[#A9A9A9]`}>
          {formatTimeAgo(chat.created_at)}
        </span>
      </div>
    </div>
  );
};
