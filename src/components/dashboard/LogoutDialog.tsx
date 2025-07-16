"use client"

import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent,
  DialogTrigger
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface LogoutDialogProps {
  trigger?: React.ReactNode;
  defaultOpen?: boolean;
}

const LogoutDialog = ({ trigger, defaultOpen = false }: LogoutDialogProps) => {
  const [open, setOpen] = useState(defaultOpen);
  const router = useRouter();

  const handleLogout = () => {
    // Here you would typically handle the actual logout logic
    // For now, we'll just redirect to the home page
    setOpen(false);
    router.push('/');
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
          >
            Cancel
          </Button>
          <Button
            onClick={handleLogout}
            className="flex-1 py-6 text-center bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium cursor-pointer"
          >
            Yes, Logout
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LogoutDialog; 