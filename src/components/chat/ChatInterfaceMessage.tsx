import { Loader2 } from "lucide-react";
import { TypeChatInterfaceMessagesProps } from "@/types/TypeChat";
import Image from "next/image";
import { getUserInitials } from "@/utils/dashboard-utils";
import { useUser } from "@/hooks/useUser";

/**
 * Renders the main message display area for the chat interface.
 * This component manages the display of chat messages, handling initial loading states,
 * empty message states, and rendering a list of messages from both the user and the assistant.
 * It also facilitates auto-scrolling to the latest message.
 *
 * @component
 * @param {object} props - The properties for the component.
 * @param {Message[]} props.messages - The array of message objects to be displayed.
 * @param {boolean} props.messagesLoading - A flag indicating if the initial messages are being loaded.
 * @param {React.RefObject<HTMLDivElement>} props.messagesEndRef - A ref attached to a div at the end of the message list to enable auto-scrolling.
 * @returns {JSX.Element} The rendered chat message container.
 */
export const ChatInterfaceMessages: React.FC<
  TypeChatInterfaceMessagesProps
> = ({ messages, messagesLoading, messagesEndRef, isSending = false }) => {
  const { user } = useUser();

  const renderMessageContent = (content: string): React.ReactNode => {
    if (
      content.startsWith("I couldn't process this YouTube video:") ||
      content.startsWith(
        "ERROR: No transcript available for this YouTube video"
      )
    ) {
      return (
        <div className="text-red-400">
          <p>{content}</p>
          <p className="mt-2 text-sm">
            This video doesn&apos;t have available captions or transcripts.
            Please try a different video that has manually added captions.
            Videos with auto-generated captions may not work.
          </p>
        </div>
      );
    }

    if (content.startsWith("I couldn't process this document:")) {
      return (
        <div className="text-red-400">
          <p>{content}</p>
          <p className="mt-2 text-sm">
            The document might be empty, scanned, corrupted, or in an
            unsupported format. For best results, try uploading a different file
            or ensure the document contains readable text.
          </p>
        </div>
      );
    }

    return content;
  };

  // Filter out malformed messages but keep temporary user messages and valid temp messages
  const validMessages = messages.filter(
    (message) =>
      message &&
      message.id &&
      message.content &&
      message.content.trim() !== "" &&
      // Only filter out temp AI messages with "..." content, keep temp user messages
      !(message.id.startsWith("temp-ai-") && message.content === "...")
  );

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 max-w-screen bg-[#181818]">
      {/* Initial loading state */}
      {messagesLoading && validMessages.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="ml-2 text-gray-400">Loading messages...</span>
        </div>
      ) : validMessages.length === 0 ? (
        /* Empty chat state */
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-400 text-sm text-center">
            No messages yet. Start chatting with the document!
          </p>
        </div>
      ) : (
        /* Render messages */
        validMessages.map((message) => (
          <div
            key={message.id}
            className={`flex items-start gap-3 ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {/* Assistant avatar */}
            {message.role === "assistant" && (
              <div className="w-11 h-11 rounded-lg bg-[#272626] flex items-center justify-center flex-shrink-0 p-2">
                <Image
                  src="/logo.png"
                  alt="Logo"
                  className="object-contain"
                  width={44}
                  height={40}
                  priority
                />
              </div>
            )}

            <div
              className={`max-w-[80%] rounded-lg p-3 text-sm ${
                message.role === "user"
                  ? "bg-primary"
                  : message.isError
                  ? "bg-red-900/20 text-red-400"
                  : "bg-[#272626]"
              }`}
            >
              {/* "Thinking" indicator - only show for temporary messages */}
              {message.content === "..." && message.id.startsWith("temp-") ? (
                <div className="flex items-center">
                  <span className="tracking-widest">...</span>
                </div>
              ) : (
                <div className="whitespace-pre-wrap break-words">
                  {renderMessageContent(message.content)}
                </div>
              )}
            </div>

            {/* User avatar with initials */}
            {message.role === "user" && (
              <div className="w-11 h-11 rounded-lg bg-[#272626] flex items-center justify-center flex-shrink-0 text-sm">
                {getUserInitials(user)}
              </div>
            )}
          </div>
        ))
      )}

      {/* Show AI thinking indicator when sending */}
      {isSending && (
        <div className="flex items-start gap-3 justify-start">
          <div className="w-11 h-11 rounded-lg bg-[#272626] flex items-center justify-center flex-shrink-0 p-2">
            <Image
              src="/logo.png"
              alt="Logo"
              className="object-contain"
              width={44}
              height={40}
              priority
            />
          </div>
          <div className="max-w-[80%] rounded-lg p-3 text-sm bg-[#272626]">
            <div className="flex items-center">
              <span className="tracking-widest">...</span>
            </div>
          </div>
        </div>
      )}

      {/* Invisible div to target for auto-scrolling */}
      <div ref={messagesEndRef} />
    </div>
  );
};
