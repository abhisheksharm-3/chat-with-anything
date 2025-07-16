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
import { XIcon, CheckIcon } from 'lucide-react';

interface PricingDialogProps {
  trigger?: React.ReactNode;
  defaultOpen?: boolean;
}

const PricingDialog = ({ trigger, defaultOpen = false }: PricingDialogProps) => {
  const [open, setOpen] = useState(defaultOpen);
  const [selectedPlan, setSelectedPlan] = useState<'annual' | 'lifetime'>('annual');
  const [selectedTier, setSelectedTier] = useState<'free' | 'personal' | 'pro'>('free');

  const handleClose = () => setOpen(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="bg-black border border-gray-800 text-white max-w-3xl p-0">
        <div className="flex items-center justify-between border-b border-gray-800 p-4">
          <div>
            <DialogTitle className="text-white">Select plan</DialogTitle>
            <p className="text-gray-400 text-sm mt-1">Simple and flexible per-user pricing.</p>
          </div>
          <button 
            onClick={handleClose}
            className="text-gray-400 hover:text-white"
          >
            <XIcon size={18} />
          </button>
        </div>
        
        <div className="p-6">
          {/* Plan selector */}
          <div className="flex justify-center mb-6">
            <div className="bg-gray-900 rounded-md p-1 inline-flex">
              <button 
                className={`px-4 py-1 rounded-md text-sm ${selectedPlan === 'annual' ? 'bg-purple-600 text-white' : 'text-gray-400'}`}
                onClick={() => setSelectedPlan('annual')}
              >
                Annual
              </button>
              <button 
                className={`px-4 py-1 rounded-md text-sm ${selectedPlan === 'lifetime' ? 'bg-purple-600 text-white' : 'text-gray-400'}`}
                onClick={() => setSelectedPlan('lifetime')}
              >
                Lifetime
              </button>
            </div>
          </div>
          
          {/* Pricing tiers */}
          <div className="grid grid-cols-3 gap-4">
            {/* Free tier */}
            <div 
              className={`border rounded-lg p-4 ${selectedTier === 'free' ? 'border-purple-600' : 'border-gray-700'}`}
              onClick={() => setSelectedTier('free')}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-white font-medium">Free</h3>
                  <p className="text-gray-400 text-xs">Audionotes Trial</p>
                </div>
                {selectedTier === 'free' && (
                  <div className="bg-purple-600 rounded-full p-1">
                    <CheckIcon size={14} />
                  </div>
                )}
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-start gap-2">
                  <CheckIcon size={16} className="text-purple-600 mt-0.5" />
                  <span className="text-xs text-gray-300">Unlimited Voice Notes (Upto 15 mins/note)</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckIcon size={16} className="text-purple-600 mt-0.5" />
                  <span className="text-xs text-gray-300">Upload Audio Files (Upto 25 Mb)</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckIcon size={16} className="text-purple-600 mt-0.5" />
                  <span className="text-xs text-gray-300">Create High Quality Content</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckIcon size={16} className="text-purple-600 mt-0.5" />
                  <span className="text-xs text-gray-300">Notes, Summaries & Content are saved forever</span>
                </div>
              </div>
            </div>
            
            {/* Personal tier */}
            <div 
              className={`border rounded-lg p-4 ${selectedTier === 'personal' ? 'border-purple-600' : 'border-gray-700'}`}
              onClick={() => setSelectedTier('personal')}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-white font-medium">₹2299/annual</h3>
                  <p className="text-gray-400 text-xs">Audionotes Personal</p>
                </div>
                {selectedTier === 'personal' && (
                  <div className="bg-purple-600 rounded-full p-1">
                    <CheckIcon size={14} />
                  </div>
                )}
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-start gap-2">
                  <CheckIcon size={16} className="text-purple-600 mt-0.5" />
                  <span className="text-xs text-gray-300">Everything in Personal (Incl. Unlimited 15 min Notes)</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckIcon size={16} className="text-purple-600 mt-0.5" />
                  <span className="text-xs text-gray-300">Record Upto 60 mins/note (900 mins/mo or 5000 mins/mo)</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckIcon size={16} className="text-purple-600 mt-0.5" />
                  <span className="text-xs text-gray-300">Upload Audio Files (Upto 50 Mb)</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckIcon size={16} className="text-purple-600 mt-0.5" />
                  <span className="text-xs text-gray-300">Create High Quality Content</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckIcon size={16} className="text-purple-600 mt-0.5" />
                  <span className="text-xs text-gray-300">Audio digitization and One-Click Content Generate</span>
                </div>
              </div>
            </div>
            
            {/* Pro tier */}
            <div 
              className={`border rounded-lg p-4 ${selectedTier === 'pro' ? 'border-purple-600' : 'border-gray-700'}`}
              onClick={() => setSelectedTier('pro')}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-white font-medium">₹5999/annual</h3>
                  <p className="text-gray-400 text-xs">Audionotes Pro</p>
                  <p className="text-gray-400 text-xs">5000mins/month</p>
                </div>
                {selectedTier === 'pro' && (
                  <div className="bg-purple-600 rounded-full p-1">
                    <CheckIcon size={14} />
                  </div>
                )}
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-start gap-2">
                  <CheckIcon size={16} className="text-purple-600 mt-0.5" />
                  <span className="text-xs text-gray-300">Everything in Personal (Incl. Unlimited 15 min Notes)</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckIcon size={16} className="text-purple-600 mt-0.5" />
                  <span className="text-xs text-gray-300">Record Upto 60 mins/note (900 mins/mo or 5000 mins/mo)</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckIcon size={16} className="text-purple-600 mt-0.5" />
                  <span className="text-xs text-gray-300">Upload Audio Files (Upto 50 Mb)</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckIcon size={16} className="text-purple-600 mt-0.5" />
                  <span className="text-xs text-gray-300">Create High Quality Content</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckIcon size={16} className="text-purple-600 mt-0.5" />
                  <span className="text-xs text-gray-300">Audio digitization and One-Click Content Generate</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-4 flex justify-between border-t border-gray-800">
          <Button 
            variant="outline"
            className="text-gray-400 border-gray-700 hover:bg-gray-800"
            onClick={handleClose}
          >
            Cancel
          </Button>
          <Button 
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            Subscribe now
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PricingDialog; 