import { buttonVariants } from "@/components/ui/button"
import { VariantProps } from "class-variance-authority"
import { StaticImageData } from "next/image"

export interface TypeButtonCta extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string
  link?: string
  variant?: VariantProps<typeof buttonVariants>["variant"]
  size?: VariantProps<typeof buttonVariants>["size"]
  className?: string
  showArrow?: boolean
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