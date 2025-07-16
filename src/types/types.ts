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