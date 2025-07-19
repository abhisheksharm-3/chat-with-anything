import { buttonVariants } from "@/components/ui/button";
import { VariantProps } from "class-variance-authority";
import { StaticImageData } from "next/image";

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

export interface TypePricingTier {
  price: string;
  subtitle: string;
  features: string[];
  billingNote?: string;
}

export interface TypePricingData {
  annual: {
    free: TypePricingTier;
    personal: TypePricingTier;
    pro: TypePricingTier;
  };
  lifetime: {
    free: TypePricingTier;
    personal: TypePricingTier;
    pro: TypePricingTier;
  };
}

export interface TypeFileTypeConfig {
  type: string;
  name: string;
  image: StaticImageData;
  accept: string;
  maxSize: number;
  comingSoon?: boolean;
  urlOnly?: boolean;
}

export interface TypeFileType {
  data?: {
    type?: string | null;
    name?: string;
  } | null;
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

export interface TypeUploadModalAreaProps {
  fileTypeConfig: TypeFileTypeConfig;
  selectedFile: File | null;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export interface TypeUploadModalSuccessProps {
  fileName: string;
  handleRemoveFile: () => void;
}

export interface TypeUploadModalUrlInputProps {
  url: string;
  fileTypeConfig: TypeFileTypeConfig;
  isUrlOnly: boolean;
  handleUrlChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleUrlSubmit: () => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  isUploading: boolean;
}

export interface TypeUploadModalErrorProps {
  error: string;
  handleRetry: () => void;
}

export interface TypeUploadModalProps {
  trigger?: React.ReactNode;
  defaultOpen?: boolean;
  fileType: string;
}

export type TypeFaqItem = {
  value: string;
  question: string;
  answer: string;
};

export interface TypeUseUploadLogicProps {
  fileType: string;
  onClose: () => void;
}
