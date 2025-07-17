import { buttonVariants } from "@/components/ui/button"
import { VariantProps } from "class-variance-authority"

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