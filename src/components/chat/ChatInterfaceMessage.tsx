import React from 'react';
import { Loader2 } from 'lucide-react';
import { TypeChatInterfaceMessagesProps } from '@/types/chat';
import { useUser } from '@/hooks/useUser'; // Import the useUser hook
import Image from 'next/image';

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
export const ChatInterfaceMessages: React.FC<TypeChatInterfaceMessagesProps> = ({
  messages,
  messagesLoading,
  messagesEndRef
}) => {
  const { user } = useUser();

  /**
   * Gets the user's initials from their name or email
   * @returns {string} The user's initials (up to 2 characters)
   */
  const getUserInitials = (): string => {
    if (!user) return 'U';
    
    if (user.name && user.name.trim()) {
      const nameParts = user.name.trim().split(' ');
      if (nameParts.length >= 2) {
        return (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
      }
      return nameParts[0][0].toUpperCase();
    }
    
    if (user.email) {
      return user.email[0].toUpperCase();
    }
    
    return 'U';
  };

  /**
   * Parses and renders the string content of a single message.
   * This function provides rich formatting for special cases, such as displaying
   * detailed error messages for document or YouTube processing failures.
   *
   * @param {string} content - The raw string content of the message.
   * @returns {React.ReactNode} JSX for special error messages or the original string.
   */
  const renderMessageContent = (content: string): React.ReactNode => {
    // Check for specific, known error messages to provide better user feedback.
    if (content.startsWith("I couldn't process this YouTube video:") ||
        content.startsWith("ERROR: No transcript available for this YouTube video")) {
      return (
        <div className="text-red-400">
          <p>{content}</p>
          <p className="mt-2 text-sm">
            This video doesn&apos;t have available captions or transcripts. Please try a different video
            that has manually added captions. Videos with auto-generated captions may not work.
          </p>
        </div>
      );
    }

    if (content.startsWith("I couldn't process this document:")) {
      return (
        <div className="text-red-400">
          <p>{content}</p>
          <p className="mt-2 text-sm">The document might be empty, scanned, or in an unsupported format.</p>
        </div>
      );
    }

    // Return the original content if no special error case is matched.
    return content;
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 max-w-screen">
      {/* Initial loading state */}
      {messagesLoading && messages.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="ml-2 text-gray-400">Loading messages...</span>
        </div>
        /* Empty chat state */
      ) : messages.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-400 text-sm text-center">
            No messages yet. Start chatting with the document!
          </p>
        </div>
        /* Render messages */
      ) : (
        messages.map((message) => (
          <div
            key={message.id}
            className={`flex items-start gap-3 ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {/* Assistant avatar */}
            {message.role === 'assistant' && (
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
              {/* "Thinking" indicator */}
              {message.content === '...' ? (
                <div className="flex items-center">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span>AI is thinking...</span>
                </div>
              ) : (
                <div className="whitespace-pre-wrap break-words">
                  {renderMessageContent(message.content)}
                </div>
              )}
            </div>

            {/* User avatar with initials */}
            {message.role === 'user' && (
              <div className="w-11 h-11 rounded-lg bg-[#272626] flex items-center justify-center flex-shrink-0 text-sm">
                {getUserInitials()}
              </div>
            )}
          </div>
        ))
      )}
      {/* Invisible div to target for auto-scrolling */}
      <div ref={messagesEndRef} />
    </div>
  );
};