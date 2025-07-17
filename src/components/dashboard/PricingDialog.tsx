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
  const [selectedPricing, setSelectedPricing] = useState<'free' | 'personal' | 'pro'>('free');

  const handleClose = () => setOpen(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="bg-[#121212] border text-foreground sm:max-w-4xl p-0 rounded-xl overflow-hidden" showCloseButton={false}>
        <div className="p-6 flex items-center justify-between border-b">
          <div>
            <DialogTitle className="text-lg font-semibold tracking-tight">Select plan</DialogTitle>
            <p className="text-muted-foreground text-sm">Simple and flexible per-user pricing.</p>
          </div>
          <button 
            onClick={handleClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6">
          {/* Plan selector */}
          <div className="flex justify-center mb-6">
            <div className="bg-muted rounded-xl p-1 inline-flex">
              <button 
                className={`px-6 py-2 rounded-xl text-sm font-medium transition-colors ${
                  selectedPlan === 'annual' 
                    ? 'bg-primary text-primary-foreground shadow-sm' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                onClick={() => setSelectedPlan('annual')}
              >
                Annual
              </button>
              <button 
                className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedPlan === 'lifetime' 
                    ? 'bg-primary text-primary-foreground shadow-sm' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                onClick={() => setSelectedPlan('lifetime')}
              >
                Lifetime
              </button>
            </div>
          </div>
          
          {/* Pricing cards - horizontal layout */}
          <div className="grid grid-cols-3 gap-4">
            {/* Free tier */}
            <div className="border rounded-lg p-4 relative">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold">Free</h3>
                  <p className="text-muted-foreground text-sm">Audionotes Trial</p>
                </div>
                <div className="flex items-center">
                  <input
                    type="radio"
                    name="pricing"
                    value="free"
                    checked={selectedPricing === 'free'}
                    onChange={() => setSelectedPricing('free')}
                    className="w-4 h-4 text-primary"
                  />
                </div>
              </div>
              
              {selectedPricing === 'free' && (
                <div className="absolute top-4 right-4 bg-primary rounded-full p-1">
                  <Check size={12} className="text-primary-foreground" />
                </div>
              )}
              
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Check size={16} className="text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Unlimited Voice Notes (Upto 15 mins/note)</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check size={16} className="text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Upload Audio Files (Upto 25 Mb)</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check size={16} className="text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Create High Quality Content</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check size={16} className="text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Notes, Summaries & Content are saved forever</span>
                </div>
              </div>
            </div>
            
            {/* Personal tier */}
            <div className="border rounded-lg p-4 relative">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold">₹2299/annual</h3>
                  <p className="text-muted-foreground text-sm">Audionotes Personal</p>
                </div>
                <div className="flex items-center">
                  <input
                    type="radio"
                    name="pricing"
                    value="personal"
                    checked={selectedPricing === 'personal'}
                    onChange={() => setSelectedPricing('personal')}
                    className="w-4 h-4 text-primary"
                  />
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Check size={16} className="text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Everything in Personal (Incl. Unlimited 15 min Notes)</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check size={16} className="text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Record Upto 60 mins/note (900 mins/mo or 5000 mins/mo)</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check size={16} className="text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Upload Audio Files (Upto 50 Mb)</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check size={16} className="text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Create High Quality Content</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check size={16} className="text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Audio digitization and One-Click Content Generate</span>
                </div>
              </div>
            </div>
            
            {/* Pro tier */}
            <div className="border rounded-lg p-4 relative">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold">₹5999/annual</h3>
                  <p className="text-muted-foreground text-sm">Audionotes Pro</p>
                  <p className="text-muted-foreground text-sm">5000mins/month</p>
                </div>
                <div className="flex items-center">
                  <input
                    type="radio"
                    name="pricing"
                    value="pro"
                    checked={selectedPricing === 'pro'}
                    onChange={() => setSelectedPricing('pro')}
                    className="w-4 h-4 text-primary"
                  />
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Check size={16} className="text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Everything in Personal (Incl. Unlimited 15 min Notes)</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check size={16} className="text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Record Upto 60 mins/note (900 mins/mo or 5000 mins/mo)</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check size={16} className="text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Upload Audio Files (Upto 50 Mb)</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check size={16} className="text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Create High Quality Content</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check size={16} className="text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Audio digitization and One-Click Content Generate</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-6 border-t flex flex-col gap-3">
          <Button 
            className="w-full py-3 text-sm font-medium rounded-xl"
            size="lg"
          >
            Subscribe now
          </Button>
          <Button 
            variant="outline"
            className="w-full py-3 text-sm font-medium rounded-xl"
            onClick={handleClose}
            size="lg"
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PricingDialog;