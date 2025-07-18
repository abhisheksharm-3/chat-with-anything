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
import { TypeDialogProps } from '@/types/types';

/**
 * A modal dialog component that prompts the user for confirmation before signing out.
 * This is a client component that utilizes hooks to handle state and the sign-out process.
 *
 * @component
 * @param {TypeDialogProps} props - The properties for the component.
 * @param {React.ReactNode} props.trigger - The clickable element that opens the dialog.
 * @param {boolean} [props.defaultOpen=false] - If true, the dialog will be open on initial render.
 * @returns {JSX.Element} The rendered dialog component.
 */
const LogoutDialog = ({ trigger, defaultOpen = false }: TypeDialogProps) => {
  const [open, setOpen] = useState(defaultOpen);
  const router = useRouter();
  const { signOut, isSigningOut } = useUser();

  /**
   * Handles the user logout process, redirects to the login page on success,
   * and logs any errors.
   */
  const handleLogout = async () => {
    try {
      await signOut();
      setOpen(false);
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  /**
   * Closes the dialog without logging out.
   */
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
            aria-label="Close dialog"
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