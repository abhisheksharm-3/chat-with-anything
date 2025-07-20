import { StaticImageData } from "next/image";

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

export interface TypeUseUploadLogicProps {
  fileType: string;
  onClose: () => void;
}