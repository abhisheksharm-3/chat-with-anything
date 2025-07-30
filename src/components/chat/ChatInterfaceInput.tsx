// src/components/chat/ChatInterfaceInput.tsx

import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { TypeChatInputProps } from "@/types/TypeChat";

/**
 * A themed "glass" input area for the chat interface. Uses a Textarea for better UX.
 */
export const ChatInterfaceInput: React.FC<TypeChatInputProps> = ({
  inputValue, setInputValue, onSendMessage, onKeyPress, isSending,
}) => {
  return (
    <div className="border-t border-white/10 p-4">
      <div className="relative mx-auto max-w-4xl">
        <Textarea
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={onKeyPress}
          placeholder="Ask a question about the document..."
          rows={1}
          className="w-full resize-none rounded-lg border border-border bg-card p-3 pr-12 text-sm shadow-sm"
          disabled={isSending}
        />
        <Button
          onClick={onSendMessage}
          disabled={!inputValue.trim() || isSending}
          size="icon"
          className="absolute right-2 top-1/2 -translate-y-1/2"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};