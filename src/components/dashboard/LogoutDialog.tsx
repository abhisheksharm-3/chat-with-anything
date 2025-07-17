"use client"

import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent,
  DialogTrigger
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/hooks';

interface LogoutDialogProps {
  trigger?: React.ReactNode;
  defaultOpen?: boolean;
}

const LogoutDialog = ({ trigger, defaultOpen = false }: LogoutDialogProps) => {
  const [open, setOpen] = useState(defaultOpen);
  const router = useRouter();
  const { signOut, isSigningOut } = useUser();

  const handleLogout = async () => {
    try {
      await signOut();
      setOpen(false);
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleCancel = () => {
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="bg-[#121212] border border-[#333] max-w-md p-6 rounded-xl gap-2" showCloseButton={false}>
        <div className="flex justify-between items-start">
          <h2 className="text-lg font-semibold">Logout?</h2>
          <button 
            onClick={handleCancel}
            className="text-gray-400 hover:text-white cursor-pointer"
            disabled={isSigningOut}
          >
            <X size={24} />
          </button>
        </div>
        
        <p className="text-gray-400 text-sm mb-6">
          Are you sure you want to logout? This action cannot be undone.
        </p>
        
        <div className="flex gap-3">
          <Button
            onClick={handleCancel}
            className="flex-1 py-6 text-center bg-[#1a1a1a] hover:bg-[#252525] text-white border border-[#333] rounded-xl font-medium cursor-pointer"
            disabled={isSigningOut}
          >
            Cancel
          </Button>
          <Button
            onClick={handleLogout}
            className="flex-1 py-6 text-center bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium cursor-pointer"
            disabled={isSigningOut}
          >
            {isSigningOut ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Logging out...
              </>
            ) : (
              "Yes, Logout"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LogoutDialog; 