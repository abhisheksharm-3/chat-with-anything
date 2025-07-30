// src/components/dashboard/LogoutDialog.tsx

"use client";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import { TypeDialogProps } from "@/types/TypeUi";

const LogoutDialog = ({ trigger }: TypeDialogProps) => {
  const [open, setOpen] = useState(false);
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
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you sure you want to logout?</DialogTitle>
          <DialogDescription>
            This action will end your current session and you will need to sign in again.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4">
          <DialogClose asChild><Button variant="outline" disabled={isSigningOut}>Cancel</Button></DialogClose>
          <Button variant="destructive" onClick={handleLogout} disabled={isSigningOut}>
            {isSigningOut && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Yes, Logout
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
export default LogoutDialog;