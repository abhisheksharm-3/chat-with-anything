import { TypeFile, TypeMessage } from "./TypeSupabase";

export interface TypeChatInterfaceMessagesProps {
  messages: TypeMessage[];
  messagesLoading: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  isSending?: boolean;
}

export interface TypeChatInputProps {
  inputValue: string;
  setInputValue: (value: string) => void;
  onSendMessage: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  className?: string;
}

export interface TypeChatInterfaceDocumentViewerProps {
  file: TypeFile;
  isLoading: boolean;
  isError: boolean;
  title: string;
}

export interface TypeChatInterfaceMobileTabsProps {
  showDocument: boolean;
  setShowDocument: (show: boolean) => void;
}

export interface TypeControlsProps {
  zoomLevel: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onDownload: () => void;
  onOpenInNewTab: () => void;
  showControls: boolean;
  file?: TypeFile;
}

export type TypeChatError = Error & {
  name: "ChatError";
  code?: string;
  statusCode?: number;
};
