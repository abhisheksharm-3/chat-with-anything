import { TypeFile, TypeMessage } from "./supabase";

export interface TypeChatInterfaceProps {
  title?: string;
  chatId: string;
  source?: string;
}

export interface ChatMessagesProps {
  messages: TypeMessage[];
  messagesLoading: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
}

export interface ChatInputProps {
  inputValue: string;
  setInputValue: (value: string) => void;
  onSendMessage: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  className?: string;
}

export interface DocumentViewerProps {
  file: TypeFile;
  isLoading: boolean;
  isError: boolean;
  title: string;
}

export interface MobileTabsProps {
  showPDF: boolean;
  setShowPDF: (show: boolean) => void;
} 