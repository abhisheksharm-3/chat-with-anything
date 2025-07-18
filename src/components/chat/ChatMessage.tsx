import React from 'react';
import { Loader2 } from 'lucide-react';
import { ChatMessagesProps } from '@/types/chat';

export const ChatMessages: React.FC<ChatMessagesProps> = ({ 
  messages, 
  messagesLoading, 
  messagesEndRef 
}) => {
  const renderMessageContent = (content: string) => {
    // Check if the content is an error message about YouTube transcripts
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
    
    // Check if the content is an error message about document processing
    if (content.startsWith("I couldn't process this document:")) {
      return (
        <div className="text-red-400">
          <p>{content}</p>
          <p className="mt-2 text-sm">The document might be empty, scanned, or in an unsupported format.</p>
        </div>
      );
    }
    
    // Check if the content contains a YouTube video ID pattern
    const youtubeRegex = /youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})|youtu\.be\/([a-zA-Z0-9_-]{11})/g;
    let match;
    let lastIndex = 0;
    const parts = [];
    
    while ((match = youtubeRegex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push(content.substring(lastIndex, match.index));
      }
      
      const videoId = match[1] || match[2];
      
      parts.push(
        <div key={`youtube-${match.index}`} className="my-2 w-full">
          <iframe 
            src={`https://www.youtube.com/embed/${videoId}`}
            width="100%"
            height="315"
            frameBorder="0"
            allowFullScreen
            title={`YouTube Video ${videoId}`}
            className="rounded-lg"
          />
        </div>
      );
      
      lastIndex = match.index + match[0].length;
    }
    
    if (lastIndex < content.length) {
      parts.push(content.substring(lastIndex));
    }
    
    if (parts.length === 0) {
      return content;
    }
    
    return <>{parts}</>;
  };

  return (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messagesLoading && messages.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="ml-2 text-gray-400">Loading messages...</span>
        </div>
      ) : messages.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-400 text-sm text-center">
            No messages yet. Start chatting with the document!
          </p>
        </div>
      ) : (
        messages.map((message) => (
          <div
            key={message.id}
            className={`flex items-start gap-3 ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {message.role === 'assistant' && (
              <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center flex-shrink-0">
                <svg
                  viewBox="0 0 24 24"
                  className="w-5 h-5 text-white"
                  fill="currentColor"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
                </svg>
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.role === "user"
                  ? "bg-purple-600 text-white"
                  : message.isError 
                    ? "bg-red-900/20 text-red-400" 
                    : "bg-[#1E1E1E] text-white"
              }`}
            >
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
          </div>
        ))
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};