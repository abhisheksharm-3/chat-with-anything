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
import { XIcon } from 'lucide-react';
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
      <DialogContent className="bg-black border border-gray-800 text-white w-[400px] p-0">
        <div className="flex items-center justify-between border-b border-gray-800 p-4">
          <DialogTitle className="text-white">Account Settings</DialogTitle>
          <button 
            onClick={() => setOpen(false)}
            className="text-gray-400 hover:text-white"
          >
            <XIcon size={18} />
          </button>
        </div>
        
        <div className="p-4 space-y-4">
          <div className="space-y-1">
            <p className="text-xs text-gray-400">Display name</p>
            <p className="text-sm">Shradha K</p>
          </div>
          
          <div className="space-y-1">
            <p className="text-xs text-gray-400">Email Address</p>
            <p className="text-sm">example@gmail.com</p>
          </div>
          
          <div className="space-y-1">
            <p className="text-xs text-gray-400">Current Plan</p>
            <p className="text-sm">Free</p>
          </div>
        </div>
        
        <div className="p-4 flex justify-end">
          <PricingDialog
            trigger={
              <Button 
                className="bg-purple-600 hover:bg-purple-700 text-white text-xs"
              >
                Upgrade plan <span className="ml-1 bg-purple-500 px-1.5 py-0.5 rounded text-[10px]">$10</span>
              </Button>
            }
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsDialog; 