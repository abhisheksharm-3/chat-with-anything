"use client"

import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import PricingDialog from './PricingDialog';

interface SettingsDialogProps {
  trigger?: React.ReactNode;
  defaultOpen?: boolean;
}

const SettingsDialog = ({ trigger, defaultOpen = false }: SettingsDialogProps) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="bg-[#121212] border border-[#333] max-w-lg p-0 rounded-lg" showCloseButton={false}>
        <div className="p-6 pb-4 border-b">
          <div className="flex items-start justify-between mb-2">
            <div>
              <DialogTitle className="text-lg font-semibold mt-1">Account Settings</DialogTitle>
              <p className="text-[#A9A9A9] text-sm">Everything about your account at one place</p>
            </div>
            <button 
              onClick={() => setOpen(false)}
              className="text-gray-400 hover:text-white mt-2 cursor-pointer"
            >
              <X size={24} />
            </button>
          </div>
        </div>
        
        <div className="px-6 pb-6 space-y-6 font-medium text-lg">
          <div className="space-y-1">
            <p className="text-[#A9A9A9]">Display name</p>
            <p>Shaunak K</p>
          </div>
          
          <div className="space-y-1">
            <p className="text-[#A9A9A9]">Email Address</p>
            <p>shaunak@gmail.com</p>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <p className="text-[#A9A9A9]">Current Plan</p>
              <p>Free</p>
            </div>
            
            <PricingDialog
              trigger={
                <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl py-5 cursor-pointer">
                Upgrade plan
                <span className="ml-2 text-xs bg-primary-foreground/20 text-primary-foreground font-semibold px-1.5 py-0.5 rounded">PRO</span>
              </Button>
              }
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsDialog; 