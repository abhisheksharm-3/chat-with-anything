import React from 'react';
import { Send } from 'lucide-react';
import { TypeChatInputProps } from '@/types/chat';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

/**
 * A controlled input component for a chat interface, including a text field and a send button.
 * It remains sticky at the bottom of its container and is fully responsive.
 * @component
 * @param {TypeChatInputProps} props - The props for the ChatInterfaceInput component.
 * @param {string} props.inputValue - The current value of the text input.
 * @param {React.Dispatch<React.SetStateAction<string>>} props.setInputValue - The state setter function to update the input value.
 * @param {() => void} props.onSendMessage - The callback function triggered when the send button is clicked.
 * @param {(event: React.KeyboardEvent<HTMLInputElement>) => void} props.onKeyPress - The callback for key press events, typically to handle 'Enter' submissions.
 * @param {string} [props.className="py-2"] - Optional additional CSS classes for the main container.
 * @returns {JSX.Element} The chat input interface component.
 */
export const ChatInterfaceInput: React.FC<TypeChatInputProps> = ({
  inputValue,
  setInputValue,
  onSendMessage,
  onKeyPress,
  className = "py-2"
}) => {
  return (
    <div className={`${className} sticky bottom-0 border-t border-[#272626] px-2 sm:px-4 lg:px-6`}>
      <div className="flex items-center gap-1 sm:gap-2 max-w-4xl mx-auto">
        <Input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={onKeyPress}
          placeholder="Message"
          className="flex-1 rounded-xl px-3 py-3 sm:px-4 sm:py-4 lg:py-5 text-sm sm:text-base lg:text-lg outline-none border border-[#272626] bg-[#181818] min-w-0"
        />
        <Button
          onClick={onSendMessage}
          disabled={!inputValue.trim()}
          className="p-2 sm:p-3 rounded-xl flex-shrink-0"
        >
          <Send className="w-4 h-4 sm:w-5 sm:h-5" />
        </Button>
      </div>
    </div>
  );
};