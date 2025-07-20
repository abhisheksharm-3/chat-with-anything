"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, X } from "lucide-react";
import PricingDialog from "./PricingDialog";
import { useUser, useIsMobile } from "@/hooks";
import { useRouter } from "next/navigation";
import { TypeDialogProps } from "@/types/ui";
import { Input } from "../ui/input";

/**
 * A dialog for viewing and editing user account settings.
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
  const { user, isLoading, updateUser, isUpdating } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const isMobile = useIsMobile();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  /**
   * Effect to safely update state only after the component has mounted on the client.
   * This prevents hydration mismatches between server and client renders.
   */
  useEffect(() => {
    setIsMounted(true);
  }, []);

  /**
   * Effect to handle the mobile-specific behavior. If the dialog is triggered on a mobile
   * device, it closes itself and redirects to the full-page settings route.
   */
  useEffect(() => {
    if (isMounted && isMobile && open) {
      setOpen(false);
      router.push("/settings");
    }
  }, [isMobile, open, router, isMounted]);

  /**
   * Effect to populate the local name state once the user data is loaded.
   */
  useEffect(() => {
    if (user?.name) {
      setName(user.name);
    }
  }, [user?.name]);

  /**
   * Handles the form submission to update the user's display name.
   * @param {React.FormEvent} e - The form event.
   */
  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() === user?.name) {
      setIsEditing(false);
      return;
    }

    try {
      await updateUser({ name });
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update name:", error);
    }
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

        <div className="px-6 pb-6 space-y-6 font-medium text-lg">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="ml-2 text-sm text-gray-400">
                Loading account details...
              </span>
            </div>
          ) : (
            <>
              {/* Display Name Section */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-[#A9A9A9] text-sm">Display name</p>
                  {!isEditing && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                      className="text-xs text-primary hover:text-primary/90"
                    >
                      Edit
                    </Button>
                  )}
                </div>

                {isEditing ? (
                  <form
                    onSubmit={handleUpdateName}
                    className="flex gap-2 items-center"
                  >
                    <Input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="bg-[#1a1a1a] border border-gray-700 rounded px-2 py-1 text-sm w-full"
                      placeholder="Your name"
                      disabled={isUpdating}
                    />
                    <Button
                      type="submit"
                      size="sm"
                      disabled={isUpdating}
                      className="text-xs"
                    >
                      {isUpdating ? (
                        <>
                          <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Save"
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setIsEditing(false);
                        setName(user?.name || "");
                      }}
                      className="text-xs"
                      disabled={isUpdating}
                    >
                      Cancel
                    </Button>
                  </form>
                ) : (
                  <p>{user?.name || "Not set"}</p>
                )}
              </div>

              {/* Email Address Section */}
              <div className="space-y-1">
                <p className="text-[#A9A9A9] text-sm">Email Address</p>
                <p>{user?.email || "Not available"}</p>
              </div>

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
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsDialog;
