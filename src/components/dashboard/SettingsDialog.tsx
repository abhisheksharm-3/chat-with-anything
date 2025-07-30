// src/components/dashboard/SettingsDialog.tsx

"use client";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import PricingDialog from "./PricingDialog";
import { useRouter } from "next/navigation";
import { TypeDialogProps } from "@/types/TypeUi";
import { useUser } from "@/hooks/useUser";
import useIsMobile from "@/hooks/useIsMobile";
import { SettingsSections } from "@/constants/SettingsData";
import { Skeleton } from "../ui/skeleton";

const SettingsLoadingSkeleton = () => (
  <div className="px-6 py-6 space-y-6">
    {Array.from({ length: 3 }).map((_, i) => (
      <div key={i} className="space-y-2">
        <Skeleton className="h-4 w-24 bg-muted" />
        <Skeleton className="h-5 w-48 bg-muted" />
      </div>
    ))}
  </div>
);

const SettingsDialog = ({ trigger }: TypeDialogProps) => {
  const [open, setOpen] = useState(false);
  const { user, isLoading } = useUser();
  const isMobile = useIsMobile();
  const router = useRouter();

  useEffect(() => {
    if (isMobile && open) {
      setOpen(false);
      router.push("/settings");
    }
  }, [isMobile, open, router]);

  if (isMobile) return trigger ? <>{trigger}</> : null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-lg p-0">
        <DialogHeader className="p-6">
          <DialogTitle>Account Settings</DialogTitle>
          <DialogDescription>View and manage your account details.</DialogDescription>
        </DialogHeader>
        {isLoading ? (
          <SettingsLoadingSkeleton />
        ) : (
          <div className="px-6 pb-6 space-y-6 text-sm">
            {SettingsSections.map((section) => (
              <div key={section.id}>
                <p className="text-muted-foreground">{section.label}</p>
                <p className="font-medium text-foreground">{user?.[section.key] || section.fallback}</p>
              </div>
            ))}
            <div className="flex items-center justify-between rounded-lg border border-border bg-card p-4">
                <div>
                  <p className="font-medium text-foreground">Current Plan</p>
                  <p className="text-muted-foreground">Free Tier</p>
                </div>
                <PricingDialog trigger={<Button size="sm">Upgrade</Button>} />
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
export default SettingsDialog;