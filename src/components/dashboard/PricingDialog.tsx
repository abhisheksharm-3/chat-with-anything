"use client"

import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, Check } from 'lucide-react';

interface PricingDialogProps {
  trigger?: React.ReactNode;
  defaultOpen?: boolean;
}

const PricingDialog = ({ trigger, defaultOpen = false }: PricingDialogProps) => {
  const [open, setOpen] = useState(defaultOpen);
  const [selectedPlan, setSelectedPlan] = useState<'annual' | 'lifetime'>('annual');

  const handleClose = () => setOpen(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="bg-[#121212] border border-[#333] text-white sm:max-w-md p-0 rounded-lg overflow-hidden" showCloseButton={false}>
        <div className="p-4 flex items-center justify-between">
          <div>
            <DialogTitle className="text-base font-medium">Select plan</DialogTitle>
            <p className="text-[#A9A9A9] text-xs mt-0.5">Simple and flexible per-user pricing.</p>
          </div>
          <button 
            onClick={handleClose}
            className="text-gray-400 hover:text-white"
          >
            <X size={16} />
          </button>
        </div>
        
        <div className="px-4 py-2">
          {/* Plan selector */}
          <div className="flex justify-center mb-4">
            <div className="bg-[#1A1A1A] rounded-md p-1 inline-flex">
              <button 
                className={`px-4 py-1 rounded-md text-xs font-medium transition-colors ${selectedPlan === 'annual' ? 'bg-primary text-white' : 'text-gray-400'}`}
                onClick={() => setSelectedPlan('annual')}
              >
                Annual
              </button>
              <button 
                className={`px-4 py-1 rounded-md text-xs font-medium transition-colors ${selectedPlan === 'lifetime' ? 'bg-primary text-white' : 'text-gray-400'}`}
                onClick={() => setSelectedPlan('lifetime')}
              >
                Lifetime
              </button>
            </div>
          </div>
          
          {/* Free tier */}
          <div className="border border-[#333] rounded-md p-3 mb-2">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-sm font-medium">Free</h3>
                <p className="text-[#A9A9A9] text-xs">Audionotes Trial</p>
              </div>
              <div className="bg-primary rounded-full p-0.5">
                <Check size={12} className="text-white" />
              </div>
            </div>
            
            <div className="mt-3 space-y-1.5">
              <div className="flex items-start gap-2">
                <Check size={12} className="text-primary mt-0.5 flex-shrink-0" />
                <span className="text-xs">Unlimited Voice Notes (Upto 15 mins/note)</span>
              </div>
              <div className="flex items-start gap-2">
                <Check size={12} className="text-primary mt-0.5 flex-shrink-0" />
                <span className="text-xs">Upload Audio Files (Upto 25 Mb)</span>
              </div>
              <div className="flex items-start gap-2">
                <Check size={12} className="text-primary mt-0.5 flex-shrink-0" />
                <span className="text-xs">Create High Quality Content</span>
              </div>
              <div className="flex items-start gap-2">
                <Check size={12} className="text-primary mt-0.5 flex-shrink-0" />
                <span className="text-xs">Notes, Summaries & Content are saved forever</span>
              </div>
            </div>
          </div>
          
          {/* Personal tier */}
          <div className="border border-[#333] rounded-md p-3 mb-2">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-sm font-medium">₹2299/annual</h3>
                <p className="text-[#A9A9A9] text-xs">Audionotes Personal</p>
              </div>
            </div>
            
            <div className="mt-3 space-y-1.5">
              <div className="flex items-start gap-2">
                <Check size={12} className="text-primary mt-0.5 flex-shrink-0" />
                <span className="text-xs">Everything in Personal (Incl. Unlimited 15 min Notes)</span>
              </div>
              <div className="flex items-start gap-2">
                <Check size={12} className="text-primary mt-0.5 flex-shrink-0" />
                <span className="text-xs">Record Upto 60 mins/note (900 mins/mo or 5000 mins/mo)</span>
              </div>
              <div className="flex items-start gap-2">
                <Check size={12} className="text-primary mt-0.5 flex-shrink-0" />
                <span className="text-xs">Upload Audio Files (Upto 50 Mb)</span>
              </div>
              <div className="flex items-start gap-2">
                <Check size={12} className="text-primary mt-0.5 flex-shrink-0" />
                <span className="text-xs">Create High Quality Content</span>
              </div>
              <div className="flex items-start gap-2">
                <Check size={12} className="text-primary mt-0.5 flex-shrink-0" />
                <span className="text-xs">Audio digitization and One-Click Content Generate</span>
              </div>
            </div>
          </div>
          
          {/* Pro tier */}
          <div className="border border-[#333] rounded-md p-3">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-sm font-medium">₹5999/annual</h3>
                <p className="text-[#A9A9A9] text-xs">Audionotes Pro</p>
                <p className="text-[#A9A9A9] text-xs">5000mins/month</p>
              </div>
            </div>
            
            <div className="mt-3 space-y-1.5">
              <div className="flex items-start gap-2">
                <Check size={12} className="text-primary mt-0.5 flex-shrink-0" />
                <span className="text-xs">Everything in Personal (Incl. Unlimited 15 min Notes)</span>
              </div>
              <div className="flex items-start gap-2">
                <Check size={12} className="text-primary mt-0.5 flex-shrink-0" />
                <span className="text-xs">Record Upto 60 mins/note (900 mins/mo or 5000 mins/mo)</span>
              </div>
              <div className="flex items-start gap-2">
                <Check size={12} className="text-primary mt-0.5 flex-shrink-0" />
                <span className="text-xs">Upload Audio Files (Upto 50 Mb)</span>
              </div>
              <div className="flex items-start gap-2">
                <Check size={12} className="text-primary mt-0.5 flex-shrink-0" />
                <span className="text-xs">Create High Quality Content</span>
              </div>
              <div className="flex items-start gap-2">
                <Check size={12} className="text-primary mt-0.5 flex-shrink-0" />
                <span className="text-xs">Audio digitization and One-Click Content Generate</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-4 border-t border-[#333] flex flex-col gap-2">
          <Button 
            className="w-full bg-primary hover:bg-primary/90 text-white py-2 text-sm rounded-md"
          >
            Subscribe now
          </Button>
          <Button 
            variant="ghost"
            className="w-full text-[#A9A9A9] hover:text-white hover:bg-transparent py-2 text-sm"
            onClick={handleClose}
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PricingDialog; 