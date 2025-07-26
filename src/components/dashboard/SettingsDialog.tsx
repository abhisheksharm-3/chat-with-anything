"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import PricingDialog from "./PricingDialog";
import { useRouter } from "next/navigation";
import { TypeDialogProps } from "@/types/TypeUi";
import { useUser } from "@/hooks/useUser";
import useIsMobile from "@/hooks/useIsMobile";
import { SettingsSections } from "@/constants/SettingsData";
import { SettingsLoadingSkeleton } from "../settings/SettingsLoadingSkeleton";

/**
 * A dialog for viewing user account settings.
 *
 * This component exhibits responsive behavior:
 * - On desktop, it opens as a modal dialog.
 * - On mobile, clicking the trigger redirects the user to the dedicated '/settings' page
 * instead of showing the dialog. This is handled by client-side logic after hydration.
 *
 * @component
 * @param {TypeDialogProps} props - The properties for the component.
 * @param {React.ReactNode} props.trigger - The clickable element that opens the dialog or initiates the redirect on mobile.
 * @param {boolean} [props.defaultOpen=false] - If true, the dialog attempts to open on initial render (on desktop).
 * @returns {JSX.Element | null} The rendered dialog component for desktop, or just the trigger for mobile.
 */
const SettingsDialog = ({ trigger, defaultOpen = false }: TypeDialogProps) => {
  const [open, setOpen] = useState(defaultOpen);
  const { user, isLoading } = useUser();
  const [isMounted, setIsMounted] = useState(false);
  const isMobile = useIsMobile();
  const router = useRouter();

  // Handle client-side mounting to prevent hydration mismatches
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Handle mobile redirect behavior
  useEffect(() => {
    if (isMounted && isMobile && open) {
      setOpen(false);
      router.push("/settings");
    }
  }, [isMobile, open, router, isMounted]);

  /**
   * Renders a settings section based on configuration
   */
  const renderSettingsSection = (section: (typeof SettingsSections)[0]) => {
    const value = user?.[section.key] || section.fallback;

    return (
      <div className="space-y-1" key={section.id}>
        <p className="text-[#A9A9A9] text-sm">{section.label}</p>
        <p>{value}</p>
      </div>
    );
  };

  // On mobile, render only the trigger. The redirection is handled by the useEffect hook.
  if (isMounted && isMobile) {
    return trigger ? <>{trigger}</> : null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent
        className="bg-[#121212] border border-[#333] max-w-lg p-0 rounded-lg"
        showCloseButton={false}
      >
        {/* Header */}
        <div className="p-6 pb-4 border-b border-[#333]">
          <div className="flex items-start justify-between mb-2">
            <div>
              <DialogTitle className="text-lg font-semibold mt-1">
                Account Settings
              </DialogTitle>
              <p className="text-[#A9A9A9] text-sm">
                Everything about your account at one place
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setOpen(false)}
              className="text-gray-400 hover:text-white mt-2"
              aria-label="Close settings dialog"
            >
              <X size={24} />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="font-medium text-lg">
          {isLoading ? (
            <SettingsLoadingSkeleton isMobile={false} />
          ) : (
            <div className="px-6 pb-6 space-y-6">
              {/* Settings sections */}
              {SettingsSections.map(renderSettingsSection)}

              {/* Current Plan Section */}
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <p className="text-[#A9A9A9] text-sm">Current Plan</p>
                  <p>Free</p>
                </div>

                <PricingDialog
                  trigger={
                    <Button
                      size="sm"
                      className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl py-5 cursor-pointer"
                    >
                      Upgrade plan
                      <span className="ml-2 text-xs bg-primary-foreground/20 text-primary-foreground font-semibold px-1.5 py-0.5 rounded">
                        PRO
                      </span>
                    </Button>
                  }
                />
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsDialog;