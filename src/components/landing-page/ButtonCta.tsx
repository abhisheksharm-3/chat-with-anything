import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { cn } from '@/utils/utils'
import { TypeButtonCta } from '@/types/types'
import { ArrowRight } from 'lucide-react'

const ButtonCta = ({ 
  label = "Get Started", 
  link = "#", 
  variant = "default", 
  size = "lg",
  showArrow = false,
  className,
  ...props
}: TypeButtonCta) => {
  return (
    <Link href={link} className="inline-block w-full">
      <Button 
        variant={variant} 
        size={size} 
        className={cn(
          "font-medium cursor-pointer bg-primary hover:bg-primary/80 rounded-lg px-8 py-4 text-base w-full", 
          className
        )}
        {...props}
      >
        {label}
        {/* 3. Conditionally render the Lucide icon */}
        {showArrow && <ArrowRight className="ml-2 h-4 w-4" />}
      </Button>
    </Link>
  )
}

export default ButtonCta