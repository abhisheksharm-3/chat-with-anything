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
import { TypeDialogProps } from "@/types/ui";
import { TypePricingTier } from "@/types/content";

/**
 * A client-side modal dialog for displaying and selecting from various pricing plans.
 * It allows users to toggle between 'annual' and 'lifetime' billing cycles and
 * select a specific pricing tier (e.g., Free, Personal, Pro).
 *
 * @component
 * @param {TypeDialogProps} props - The properties for the component.
 * @param {React.ReactNode} props.trigger - The clickable element that opens the dialog.
 * @param {boolean} [props.defaultOpen=false] - If true, the dialog will be open on initial render.
 * @returns {JSX.Element} The rendered pricing dialog component.
 */
const PricingDialog = ({ trigger, defaultOpen = false }: TypeDialogProps) => {
  const [open, setOpen] = useState(defaultOpen);
  const [selectedPlan, setSelectedPlan] = useState<"annual" | "lifetime">(
    "annual",
  );
  const [selectedPricing, setSelectedPricing] = useState<
    "free" | "personal" | "pro"
  >("personal");
  const [expandedPlan, setExpandedPlan] = useState<"free" | "personal" | "pro">(
    "personal",
  );

  const handleClose = () => setOpen(false);

  // Get the pricing data based on the selected billing cycle (annual/lifetime)
  const currentPricing = PricingData[selectedPlan];

  /**
   * Handle plan selection on mobile - expands the clicked plan and selects it
   */
  const handleMobilePlanClick = (tier: "free" | "personal" | "pro") => {
    if (expandedPlan === tier) {
      // If clicking the already expanded plan, just update selection
      setSelectedPricing(tier);
    } else {
      // Expand the new plan and select it
      setExpandedPlan(tier);
      setSelectedPricing(tier);
    }
  };

  /**
   * A helper function to render a single pricing tier card for desktop.
   */
  const renderDesktopPricingCard = (
    tier: "free" | "personal" | "pro",
    tierData: TypePricingTier,
  ) => {
    const isSelected = selectedPricing === tier;

    return (
      <div
        key={tier}
        className={`border rounded-lg p-4 relative cursor-pointer transition-all ${
          isSelected
            ? "border-primary bg-gray-900"
            : "border-gray-700 hover:border-primary"
        }`}
        onClick={() => setSelectedPricing(tier)}
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold">{tierData.price}</h3>
            <p className="text-gray-400 text-sm">{tierData.subtitle}</p>
            {tier === "pro" && selectedPlan === "annual" && (
              <p className="text-gray-500 text-xs mt-1">5000mins/month</p>
            )}
            {tierData.billingNote && (
              <p className="text-gray-500 text-xs mt-1">
                {tierData.billingNote}
              </p>
            )}
          </div>
          <div className="flex items-center">
            <div
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                isSelected ? "border-primary bg-primary" : "border-gray-500"
              }`}
            >
              {isSelected && <Check size={12} className="text-white" />}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {tierData.features.map((feature, index) => (
            <div key={index} className="flex items-start gap-3">
              <Check size={16} className="text-primary mt-0.5 flex-shrink-0" />
              <span className="text-sm">{feature}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  /**
   * A helper function to render a single pricing tier card for mobile with accordion behavior.
   */
  const renderMobilePricingCard = (
    tier: "free" | "personal" | "pro",
    tierData: TypePricingTier,
  ) => {
    const isSelected = selectedPricing === tier;
    const isExpanded = expandedPlan === tier;

    return (
      <div
        key={tier}
        className={`border rounded-xl transition-all ${
          isSelected ? "border-primary" : "border-gray-700"
        }`}
      >
        {/* Header - Always visible */}
        <div
          className="p-4 cursor-pointer"
          onClick={() => handleMobilePlanClick(tier)}
        >
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-xl font-semibold">{tierData.price}</h3>
              <p className="text-gray-400 text-sm">{tierData.subtitle}</p>
              {tier === "pro" && selectedPlan === "annual" && (
                <p className="text-gray-500 text-xs mt-1">5000mins/month</p>
              )}
              {tierData.billingNote && (
                <p className="text-gray-500 text-xs mt-1">
                  {tierData.billingNote}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  isSelected ? "border-primary bg-primary" : "border-gray-500"
                }`}
              >
                {isSelected && <Check size={12} className="text-white" />}
              </div>
            </div>
          </div>
        </div>

        {/* Expandable content - Features */}
        {isExpanded && (
          <div className="px-4 pb-4 border-t border-gray-700 pt-4">
            <div className="space-y-3">
              {tierData.features.map((feature, index) => (
                <div key={index} className="flex items-start gap-3">
                  <Check
                    size={16}
                    className="text-primary mt-0.5 flex-shrink-0"
                  />
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent
        className="bg-[#121212] text-foreground sm:max-w-4xl max-w-[95vw] p-0 rounded-xl overflow-hidden max-h-[90vh] overflow-y-auto"
        showCloseButton={false}
      >
        <div className="p-4 sm:p-6 flex items-center justify-between border-b border-gray-800">
          <div>
            <DialogTitle className="tracking-tight">
              Select plan
            </DialogTitle>
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
          {/* Plan selector */}
          <div className="flex justify-center mb-6">
            <div className="bg-gray-800 rounded-xl p-1 inline-flex">
              <button
                className={`px-4 sm:px-6 py-2 rounded-xl text-sm font-medium transition-colors ${
                  selectedPlan === "annual"
                    ? "bg-primary shadow-sm"
                    : "text-gray-400 hover:text-white"
                }`}
                onClick={() => setSelectedPlan("annual")}
              >
                Annual
              </button>
              <button
                className={`px-4 sm:px-6 py-2 rounded-xl text-sm font-medium transition-colors ${
                  selectedPlan === "lifetime"
                    ? "bg-primary shadow-sm"
                    : "text-gray-400 hover:text-white"
                }`}
                onClick={() => setSelectedPlan("lifetime")}
              >
                Lifetime
              </button>
            </div>
          </div>

          {/* Mobile view - accordion style */}
          <div className="md:hidden space-y-3">
            {renderMobilePricingCard("free", currentPricing.free)}
            {renderMobilePricingCard("personal", currentPricing.personal)}
            {renderMobilePricingCard("pro", currentPricing.pro)}
          </div>

          {/* Desktop view - show all pricing cards */}
          <div className="hidden md:grid md:grid-cols-3 gap-4">
            {renderDesktopPricingCard("free", currentPricing.free)}
            {renderDesktopPricingCard("personal", currentPricing.personal)}
            {renderDesktopPricingCard("pro", currentPricing.pro)}
          </div>
        </div>

        <div className="p-4 sm:p-6 border-t border-gray-800 flex flex-col gap-3">
          <Button
            className="w-full py-3 text-sm font-medium rounded-xl hover:bg-primary-dark"
            size="lg"
            disabled={selectedPricing === "free"}
          >
            {selectedPricing === "free" ? "Current Plan" : "Subscribe now"}
          </Button>
          <Button
            variant="outline"
            className="w-full py-3 text-sm font-medium rounded-xl border-gray-600 hover:bg-gray-800"
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
