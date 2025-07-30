"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Check } from "lucide-react";

import { PricingData } from "@/constants/PricingData";
import { TypeDialogProps } from "@/types/TypeUi";

type BillingCycle = "annual" | "lifetime";
type PricingTier = "free" | "personal" | "pro";

/**
 * A redesigned pricing dialog with a corrected layout to prevent overflow.
 */
const PricingDialog = ({ trigger }: TypeDialogProps) => {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("annual");
  const [selectedTier, setSelectedTier] = useState<PricingTier>("personal");

  const currentPricingData = PricingData[billingCycle];
  const selectedTierData = currentPricingData[selectedTier];
  const tiers: PricingTier[] = ["free", "personal", "pro"];

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      {/* FIX: DialogContent is now a flex column with a max height to contain its children */}
      <DialogContent className="flex h-full max-h-[90vh] w-full max-w-4xl flex-col p-0">
        <DialogHeader className="shrink-0 p-6 pb-4">
          <DialogTitle>Upgrade Your Plan</DialogTitle>
          <DialogDescription>
            Choose the plan that best fits your needs.
          </DialogDescription>
        </DialogHeader>

        {/* FIX: This new wrapper allows the central content to scroll */}
        <div className="flex-1 overflow-y-auto px-6">
          {/* Billing Cycle Switch */}
          <div className="flex items-center justify-center space-x-3 py-4">
            <Label htmlFor="billing-cycle" className={`font-medium ${billingCycle === 'annual' ? 'text-foreground' : 'text-muted-foreground'}`}>
              Annual
            </Label>
            <Switch
              id="billing-cycle"
              checked={billingCycle === "lifetime"}
              onCheckedChange={(checked) => setBillingCycle(checked ? "lifetime" : "annual")}
            />
            <Label htmlFor="billing-cycle" className={`font-medium ${billingCycle === 'lifetime' ? 'text-foreground' : 'text-muted-foreground'}`}>
              Lifetime
            </Label>
          </div>

          {/* Main Glass Card */}
          <Card className="my-4 overflow-hidden border-white/10 bg-black/20 backdrop-blur-md py-0">
            {/* Tier Selector */}
            <div className="flex items-stretch border-b border-white/10 bg-black/20">
              {tiers.map((tier) => (
                <button
                  key={tier}
                  onClick={() => setSelectedTier(tier)}
                  className={`flex-1 p-3 text-center text-sm font-medium transition-colors sm:p-4 ${
                    selectedTier === tier
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-white/5"
                  }`}
                >
                  {currentPricingData[tier].title}
                </button>
              ))}
            </div>

            {/* Two-Column Content */}
            <CardContent className="p-6 md:p-8">
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-12">
                {/* Left Column: Price */}
                <div className="text-center md:text-left">
                  <p className="text-sm font-medium text-primary">PLAN</p>
                  <p className="mt-2 text-6xl font-bold tracking-tighter text-neutral-50 md:text-7xl">
                    {selectedTierData.price}
                  </p>
                  <p className="text-neutral-400">{selectedTierData.subtitle}</p>
                </div>

                {/* Right Column: Features */}
                <div className="border-t border-white/10 pt-8 md:border-l md:border-t-0 md:pl-8 md:pt-0">
                  <p className="mb-4 font-semibold text-neutral-200">
                    Includes full access to:
                  </p>
                  <ul className="space-y-3">
                    {selectedTierData.features.map((feature: string) => (
                      <li key={feature} className="flex items-start gap-3">
                        <Check className="h-5 w-5 flex-shrink-0 text-primary" />
                        <span className="text-neutral-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter className="shrink-0 border-t border-border p-6">
          <Button size="lg" className="w-full" disabled={selectedTier === 'free'}>
            {selectedTier === 'free' ? 'Your Current Plan' : `Subscribe to ${selectedTierData.title}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PricingDialog;