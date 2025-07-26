"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Check } from "lucide-react";
import { PricingData } from "@/constants/PricingData";
import { TypeDialogProps } from "@/types/TypeUi";
import { TypePricingTier } from "@/types/TypeContent";

type PricingTier = "free" | "personal" | "pro";
type BillingCycle = "annual" | "lifetime";

/**
 * A client-side modal dialog for displaying and selecting from various pricing plans.
 * It allows users to toggle between 'annual' and 'lifetime' billing cycles and
 * select a specific pricing tier (e.g., Free, Personal, Pro).
 */
const PricingDialog = ({ trigger, defaultOpen = false }: TypeDialogProps) => {
  const [open, setOpen] = useState(defaultOpen);
  const [selectedPlan, setSelectedPlan] = useState<BillingCycle>("annual");
  const [selectedPricing, setSelectedPricing] = useState<PricingTier>("personal");
  const [expandedPlan, setExpandedPlan] = useState<PricingTier>("personal");

  const handleClose = () => setOpen(false);
  const currentPricing = PricingData[selectedPlan];

  const handleMobilePlanClick = (tier: PricingTier) => {
    setExpandedPlan(tier);
    setSelectedPricing(tier);
  };

  const getCardClassName = (tier: PricingTier, isSelected: boolean) => {
    const baseClasses = "border rounded-lg p-4 relative cursor-pointer transition-all";
    return `${baseClasses} ${
      isSelected
        ? "border-primary bg-gray-900"
        : "border-gray-700 hover:border-primary"
    }`;
  };

  const getMobileCardClassName = (isSelected: boolean) => {
    const baseClasses = "border rounded-xl transition-all";
    return `${baseClasses} ${
      isSelected ? "border-primary" : "border-gray-700"
    }`;
  };

  const getRadioButtonClassName = (isSelected: boolean) => {
    const baseClasses = "w-5 h-5 rounded-full border-2 flex items-center justify-center";
    return `${baseClasses} ${
      isSelected ? "border-primary bg-primary" : "border-gray-500"
    }`;
  };

  const getPlanButtonClassName = (plan: BillingCycle, isSelected: boolean) => {
    const baseClasses = "px-4 sm:px-6 py-2 rounded-xl text-sm font-medium transition-colors";
    return `${baseClasses} ${
      isSelected
        ? "bg-primary shadow-sm"
        : "text-gray-400 hover:text-white"
    }`;
  };

  const PricingHeader = ({ tier, tierData }: { tier: PricingTier; tierData: TypePricingTier }) => (
    <div>
      <h3 className="text-xl font-semibold">{tierData.price}</h3>
      <p className="text-gray-400 text-sm">{tierData.subtitle}</p>
      {tier === "pro" && selectedPlan === "annual" && (
        <p className="text-gray-500 text-xs mt-1">5000mins/month</p>
      )}
      {tierData.billingNote && (
        <p className="text-gray-500 text-xs mt-1">{tierData.billingNote}</p>
      )}
    </div>
  );

  const RadioButton = ({ isSelected }: { isSelected: boolean }) => (
    <div className={getRadioButtonClassName(isSelected)}>
      {isSelected && <Check size={12} className="text-white" />}
    </div>
  );

  const FeatureList = ({ features }: { features: string[] }) => (
    <div className="space-y-3">
      {features.map((feature, index) => (
        <div key={index} className="flex items-start gap-3">
          <Check size={16} className="text-primary mt-0.5 flex-shrink-0" />
          <span className="text-sm">{feature}</span>
        </div>
      ))}
    </div>
  );

  const DesktopPricingCard = ({ tier, tierData }: { tier: PricingTier; tierData: TypePricingTier }) => {
    const isSelected = selectedPricing === tier;

    return (
      <div
        className={getCardClassName(tier, isSelected)}
        onClick={() => setSelectedPricing(tier)}
      >
        <div className="flex items-start justify-between mb-4">
          <PricingHeader tier={tier} tierData={tierData} />
          <RadioButton isSelected={isSelected} />
        </div>
        <FeatureList features={tierData.features} />
      </div>
    );
  };

  const MobilePricingCard = ({ tier, tierData }: { tier: PricingTier; tierData: TypePricingTier }) => {
    const isSelected = selectedPricing === tier;
    const isExpanded = expandedPlan === tier;

    return (
      <div className={getMobileCardClassName(isSelected)}>
        <div className="p-4 cursor-pointer" onClick={() => handleMobilePlanClick(tier)}>
          <div className="flex items-start justify-between">
            <PricingHeader tier={tier} tierData={tierData} />
            <RadioButton isSelected={isSelected} />
          </div>
        </div>

        {isExpanded && (
          <div className="px-4 pb-4 border-t border-gray-700 pt-4">
            <FeatureList features={tierData.features} />
          </div>
        )}
      </div>
    );
  };

  const PlanSelector = () => (
    <div className="flex justify-center mb-6">
      <div className="bg-gray-800 rounded-xl p-1 inline-flex">
        {(["annual", "lifetime"] as const).map((plan) => (
          <button
            key={plan}
            className={getPlanButtonClassName(plan, selectedPlan === plan)}
            onClick={() => setSelectedPlan(plan)}
          >
            {plan.charAt(0).toUpperCase() + plan.slice(1)}
          </button>
        ))}
      </div>
    </div>
  );

  const tiers: PricingTier[] = ["free", "personal", "pro"];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent
        className="bg-[#121212] text-foreground sm:max-w-4xl max-w-[95vw] p-0 rounded-xl overflow-hidden max-h-[90vh] overflow-y-auto"
        showCloseButton={false}
      >
        <div className="p-4 sm:p-6 flex items-center justify-between border-b border-gray-800">
          <div>
            <DialogTitle className="tracking-tight">Select plan</DialogTitle>
            <p className="text-muted-foreground text-sm">
              Simple and flexible per-user pricing.
            </p>
          </div>
          <Button
            onClick={handleClose}
            variant="ghost"
            className="text-muted-foreground hover:text-foreground"
            aria-label="Close dialog"
          >
            <X size={20} />
          </Button>
        </div>

        <div className="p-4 sm:p-6">
          <PlanSelector />

          {/* Mobile view - accordion style */}
          <div className="md:hidden space-y-3">
            {tiers.map((tier) => (
              <MobilePricingCard key={tier} tier={tier} tierData={currentPricing[tier]} />
            ))}
          </div>

          {/* Desktop view - show all pricing cards */}
          <div className="hidden md:grid md:grid-cols-3 gap-4">
            {tiers.map((tier) => (
              <DesktopPricingCard key={tier} tier={tier} tierData={currentPricing[tier]} />
            ))}
          </div>
        </div>

        <div className="p-4 sm:p-6 border-t border-gray-800 flex flex-col gap-3">
          <Button
            className="w-full py-3 rounded-xl hover:bg-primary-dark"
            size="lg"
            disabled={selectedPricing === "free"}
          >
            {selectedPricing === "free" ? "Current Plan" : "Subscribe now"}
          </Button>
          <Button
            variant="outline"
            className="w-full py-3 rounded-xl border-gray-600 hover:bg-gray-800"
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