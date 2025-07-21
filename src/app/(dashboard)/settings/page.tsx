"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import PricingDialog from "@/components/dashboard/PricingDialog";
import LogoutDialog from "@/components/dashboard/LogoutDialog";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import useIsMobile from "@/hooks/useIsMobile";
import { SettingsLoadingSkeleton } from "@/components/settings/SettingsLoadingSkeleton";
import { MobileSettingsSections } from "@/constants/SettingsData";

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
  const { user, isLoading } = useUser();
  const [, setName] = useState("");
  const isMobile = useIsMobile();
  const router = useRouter();
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
  useEffect(() => {
    if (user?.name) {
      setName(user.name);
    }
  }, [user?.name]);

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
      {isLoading ? (
        <SettingsLoadingSkeleton isMobile={true} />
      ) : (
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="w-full max-w-md space-y-6 font-medium text-lg text-center">
            {/* Render settings sections using array */}
            {MobileSettingsSections.map((section) => (
              <div key={section.id} className="space-y-1 text-lg">
                <p className="text-[#A9A9A9]">{section.label}</p>
                <p>{section.getUserValue(user)}</p>
              </div>
            ))}

            {/* Upgrade Plan Button */}
            <div className="mt-10">
              <PricingDialog
                trigger={
                  <Button className="rounded-xl py-6 cursor-pointer font-bold w-fit">
                    Upgrade plan
                    <span className="text-xs bg-primary-foreground/20 text-primary-foreground font-semibold px-1.5 py-0.5 rounded">
                      PRO
                    </span>
                  </Button>
                }
              />
            </div>
          </div>
        </div>
      )}

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
