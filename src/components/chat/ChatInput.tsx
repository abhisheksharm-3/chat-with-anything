import React from 'react';
import { Send } from 'lucide-react';
import { ChatInputProps } from '@/types/chat';

export const ChatInput: React.FC<ChatInputProps> = ({
  inputValue,
  setInputValue,
  onSendMessage,
  onKeyPress,
  className = "py-2"
}) => {
  return (
    <div className={`${className} sticky bottom-0 border-t`}>
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={onKeyPress}
          placeholder="Message"
          className="flex-1 bg-[#1E1E1E] text-white rounded-lg px-4 py-3 text-sm outline-none border-1"
        />
        <button
          onClick={onSendMessage}
          disabled={!inputValue.trim()}
          className="p-3 rounded-lg bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="w-5 h-5 text-white" />
        </button>
      </div>
    </div>
  );
};