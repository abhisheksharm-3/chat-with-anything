import React from 'react';
import { Send } from 'lucide-react';
import { TypeChatInputProps } from '@/types/chat';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

/**
 * A controlled input component for a chat interface, including a text field and a send button.
 * It remains sticky at the bottom of its container.
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
    <div className={`${className} sticky bottom-0 border-t`}>
      <div className="flex items-center gap-2">
        <Input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={onKeyPress}
          placeholder="Message"
          className="flex-1 rounded-lg px-4 py-3 text-sm outline-none border-1"
        />
        <Button
          onClick={onSendMessage}
          disabled={!inputValue.trim()}
          className="p-3 rounded-lg"
        >
          <Send className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
};