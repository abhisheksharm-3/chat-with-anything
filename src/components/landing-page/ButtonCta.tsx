import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { cn } from '@/utils/utils'
import { TypeButtonCta } from '@/types/types'

const ButtonCta = ({ 
  label = "Get Started", 
  link = "#", 
  variant = "default", 
  size = "lg",
  className,
  ...props
}: TypeButtonCta) => {
  return (
    <Link href={link} className="inline-block w-full">
      <Button 
        variant={variant} 
        size={size} 
        className={cn("font-medium cursor-pointer bg-primary hover:bg-primary/80 rounded-lg px-8 py-4 text-base w-full", className)}
        {...props}
      >
        {label}
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1">
          <path d="M5 12h14"></path>
          <path d="m12 5 7 7-7 7"></path>
        </svg>
      </Button>
    </Link>
  )
}

export default ButtonCta