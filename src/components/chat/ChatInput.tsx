import React from 'react';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';

interface ChatInputProps {
  inputValue: string;
  setInputValue: (value: string) => void;
  onSendMessage: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  className?: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  inputValue,
  setInputValue,
  onSendMessage,
  onKeyPress,
  className = "p-4 border-t border-[#333] bg-[#181818]"
}) => {
  return (
    <div className={className}>
      <div className="relative">
        <textarea
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={onKeyPress}
          placeholder="Type your message..."
          className="w-full bg-[#2a2a2a] border border-[#333] rounded-lg py-3 pl-4 pr-12 text-sm text-foreground focus:outline-none focus:border-primary resize-none"
          rows={2}
        />
        <Button
          onClick={onSendMessage}
          disabled={!inputValue.trim()}
          className="absolute right-2 bottom-2 p-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md"
        >
          <Send size={16} />
        </Button>
      </div>
    </div>
  );
};