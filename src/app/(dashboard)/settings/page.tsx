"use client"

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import PricingDialog from '@/components/dashboard/PricingDialog';
import LogoutDialog from '@/components/dashboard/LogoutDialog';
import { useUser, useIsMobile } from '@/hooks';
import { useRouter } from 'next/navigation';

const SettingsPage = () => {
  const { user, isLoading, updateUser, isUpdating } = useUser();
  const [isEditing, setIsEditing] = React.useState(false);
  const [name, setName] = React.useState("");
  const isMobile = useIsMobile();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  // Set mounted state after hydration
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Redirect to dashboard if on desktop, but only after client-side hydration
  useEffect(() => {
    if (isMounted && !isMobile) {
      router.push('/choose');
    }
  }, [isMobile, router, isMounted]);

  // Set name when user data is loaded
  React.useEffect(() => {
    if (user?.name) {
      setName(user.name);
    }
  }, [user?.name]);

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await updateUser({ name });
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update name:", error);
    }
  };

  // If on desktop, don't render the page content (but only after hydration)
  if (isMounted && !isMobile) {
    return null;
  }

  return (
    <div className="flex flex-col h-full bg-[#121212]">
      <div className="p-6 pb-4 border-b border-[#333]">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h1 className="text-lg font-semibold mt-1">Account Settings</h1>
            <p className="text-[#A9A9A9] text-sm">Everything about your account at one place</p>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col h-full">
        <div className="px-6 pb-6 space-y-6 font-medium text-lg flex-1">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="ml-2 text-sm text-gray-400">Loading account details...</span>
            </div>
          ) : (
            <>
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
                  <form onSubmit={handleUpdateName} className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="bg-[#1a1a1a] border border-gray-700 rounded px-2 py-1 text-sm w-full"
                      placeholder="Your name"
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
              
              <div className="space-y-1">
                <p className="text-[#A9A9A9] text-sm">Email Address</p>
                <p>{user?.email || "Not available"}</p>
              </div>
              
              <div className="space-y-1">
                <p className="text-[#A9A9A9] text-sm">Current Plan</p>
                <p>Free</p>
              </div>
              
              <div className="mt-4">
                <PricingDialog
                  trigger={
                    <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl py-5 w-full cursor-pointer">
                      Upgrade plan
                      <span className="ml-2 text-xs bg-primary-foreground/20 text-primary-foreground font-semibold px-1.5 py-0.5 rounded">PRO</span>
                    </Button>
                  }
                />
              </div>
            </>
          )}
        </div>
        
        {/* Logout button fixed at the bottom */}
        <div className="mt-auto px-6 pb-8 pt-4 border-t border-[#333]">
          <LogoutDialog
            trigger={
              <Button 
                variant="destructive" 
                className="w-full py-5 rounded-xl"
              >
                Log out
              </Button>
            }
          />
        </div>
      </div>
    </div>
  );
};

export default SettingsPage; 