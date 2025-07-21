import { buttonVariants } from "@/components/ui/button";
import { VariantProps } from "class-variance-authority";
import { TypeChat } from "./supabase";

export interface TypeButtonCta
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string;
  link?: string;
  variant?: VariantProps<typeof buttonVariants>["variant"];
  size?: VariantProps<typeof buttonVariants>["size"];
  className?: string;
  showArrow?: boolean;
}

export interface TypeGlowProps {
  className?: string;
  glowElements?: {
    position: string;
    size: {
      width: number;
      height: number;
    };
    blur?: number;
    color?: string;
  }[];
}

export interface TypeDialogProps {
  trigger?: React.ReactNode;
  defaultOpen?: boolean;
}

export interface TypeSectionHeaderProps {
  subtitle?: string;
  title?: string;
  subtitleClassName?: string;
  titleClassName?: string;
}
export interface TypeDropdownAction {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  handler: (
    e: React.MouseEvent,
    chat: TypeChat,
    file?: { name?: string },
  ) => void;
}

export interface TypeSkeletonConfig {
  height: string;
  width: string;
  className?: string;
}

export interface TypeHistoryPageChatMetadataProps {
  chat: TypeChat;
  file?: { name?: string; type?: string; size?: number } | null;
  isMobile?: boolean;
}

export interface TypeHistoryPageChatDropdownProps {
  chat: TypeChat;
  file?: { name?: string } | null;
}
