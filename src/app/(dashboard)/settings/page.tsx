// src/app/settings/page.tsx

"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import PricingDialog from "@/components/dashboard/PricingDialog";
import LogoutDialog from "@/components/dashboard/LogoutDialog";
import { useUser } from "@/hooks/useUser";
import { SettingsLoadingSkeleton } from "@/components/settings/SettingsLoadingSkeleton";
import { MobileSettingsSections } from "@/constants/SettingsData";
import Image from "next/image";
import avatarImage from "@/assets/images/avatar.svg";

/**
 * A beautiful and responsive page for managing user account settings.
 * This page is now designed to work perfectly on both mobile and desktop.
 */
const SettingsPage = () => {
  const { user, isLoading } = useUser();

  if (isLoading) {
    // A simple, centered loader is better for this page than a full skeleton
    return <SettingsLoadingSkeleton isMobile={false} />;
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-12">
      {/* Page Header */}
      <div className="text-center">
        <h1 className="text-5xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-neutral-50 to-neutral-300 md:text-6xl">
          Account Settings
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-neutral-300">
          Manage your profile, subscription, and account details all in one place.
        </p>
      </div>

      {/* Main Content Grid - Responsive */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left Column: User Profile & Details */}
        <div className="lg:col-span-2 space-y-8">
          {/* User Profile Card */}
          <Card className="border-white/10 bg-black/20 backdrop-blur-md">
            <CardHeader className="flex-row items-center gap-4">
              <Image src={avatarImage} alt="User Avatar" width={64} height={64} className="rounded-full border-2 border-primary/50" />
              <div>
                <CardTitle>{user?.name || "Anonymous User"}</CardTitle>
                <CardDescription>{user?.email}</CardDescription>
              </div>
            </CardHeader>
          </Card>

          {/* Account Details Card */}
          <Card className="border-white/10 bg-black/20 backdrop-blur-md">
            <CardHeader>
              <CardTitle>Account Details</CardTitle>
              <CardDescription>Your personal information.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {MobileSettingsSections.map((section) => (
                <div key={section.id} className="flex items-baseline justify-between border-b border-white/10 pb-2">
                  <p className="text-muted-foreground">{section.label}</p>
                  <p className="font-medium text-foreground">{section.getUserValue(user)}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Subscription & Logout */}
        <div className="lg:col-span-1 space-y-8">
          {/* Subscription Card */}
          <Card className="border-white/10 bg-black/20 backdrop-blur-md">
            <CardHeader>
              <CardTitle>Subscription</CardTitle>
              <CardDescription>Your current plan details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border border-border bg-background/50 p-4">
                <div>
                  <p className="font-semibold text-foreground">Free Plan</p>
                </div>
                <Badge variant="secondary">ACTIVE</Badge>
              </div>
              <PricingDialog
                trigger={<Button className="w-full">Upgrade to Pro</Button>}
              />
            </CardContent>
          </Card>
          
          {/* Danger Zone Card */}
          <Card className="border-destructive/30 bg-destructive/10 backdrop-blur-md">
             <CardHeader>
                <CardTitle className="text-destructive">Danger Zone</CardTitle>
                <CardDescription className="text-destructive/80">Manage critical account actions.</CardDescription>
             </CardHeader>
             <CardContent>
                <LogoutDialog
                    trigger={<Button variant="destructive" className="w-full">Log Out</Button>}
                />
             </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;