"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import PricingDialog from "@/components/dashboard/PricingDialog";
import LogoutDialog from "@/components/dashboard/LogoutDialog";
import { useUser, useIsMobile } from "@/hooks";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";

/**
 * Renders the user account settings page, designed specifically for mobile devices.
 *
 * This component allows users to view their account details, edit their display name,
 * upgrade their plan, and log out. It includes logic to redirect desktop users
 * to the main dashboard to ensure a mobile-optimized experience.
 *
 * @returns {React.ReactElement | null} The rendered settings page or null if on a desktop device.
 */
const SettingsPage = () => {
  const { user, isLoading, updateUser, isUpdating } = useUser();
  const [isEditing, setIsEditing] = React.useState(false);
  const [name, setName] = React.useState("");
  const isMobile = useIsMobile();
  const router = useRouter();
  // State to track if the component has mounted on the client, preventing hydration errors.
  const [isMounted, setIsMounted] = useState(false);

  /**
   * Effect to confirm that the component has mounted on the client side.
   * This is crucial for running client-only logic like device detection.
   */
  useEffect(() => {
    setIsMounted(true);
  }, []);

  /**
   * Effect to handle redirection for non-mobile users.
   * If the component is mounted and the device is not mobile, it redirects
   * to the '/choose' page, making this view mobile-only.
   */
  useEffect(() => {
    if (isMounted && !isMobile) {
      router.push("/choose");
    }
  }, [isMobile, router, isMounted]);

  /**
   * Effect to synchronize the local 'name' state with the user data once it loads.
   */
  React.useEffect(() => {
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

    try {
      await updateUser({ name });
      setIsEditing(false); // Exit editing mode on success
    } catch (error) {
      console.error("Failed to update name:", error);
    }
  };

  // Avoid rendering the page on the server or on desktop to prevent a UI flash before redirect.
  if (!isMounted || (isMounted && !isMobile)) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-[90vh] bg-[#121212]">
      {/* Header */}
      <div className="p-6 pb-4 text-center mb-2">
        <h1 className="text-lg mt-1">Account Settings</h1>
        <p className="text-[#A9A9A9] text-sm">
          Everything about your account at one place
        </p>
      </div>

      {/* Main content area - centered */}
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-md space-y-6 font-medium text-lg text-center">
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
              <div className="space-y-1 text-lg">
                <p className="text-[#A9A9A9]">Display name</p>
                <p>{user?.name || "Not set"}</p>
              </div>

              {/* Email and Plan Sections */}
              <div className="space-y-1 text-lg">
                <p className="text-[#A9A9A9]">Email Address</p>
                <p>{user?.email || "Not available"}</p>
              </div>
              <div className="space-y-1 text-lg">
                <p className="text-[#A9A9A9]">Current Plan</p>
                <p>Free</p>
              </div>

              {/* Upgrade Plan Button */}
              <div className="mt-10">
                <PricingDialog
                  trigger={
                    <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl py-6 cursor-pointer font-bold text-sm w-fit">
                      Upgrade plan
                      <span className="text-xs bg-primary-foreground/20 text-primary-foreground font-semibold px-1.5 py-0.5 rounded">
                        PRO
                      </span>
                    </Button>
                  }
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Logout button fixed at the bottom */}
      <div className="px-12 pb-16 pt-4">
        <LogoutDialog
          trigger={
            <Button
              variant="outline"
              className="w-full py-5 font-semibold text-lg text-destructive border-1 !border-destructive bg-[#1e1e1f] rounded-xl"
            >
              Log out
            </Button>
          }
        />
      </div>
    </div>
  );
};

export default SettingsPage;
