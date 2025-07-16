import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FileText, Clock, Settings, LogOut } from 'lucide-react';
import Image from 'next/image';
import SettingsDialog from '@/components/dashboard/SettingsDialog';
import PricingDialog from '@/components/dashboard/PricingDialog';
import LogoutDialog from '@/components/dashboard/LogoutDialog';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    // 1. Use theme variables. Add `relative` for positioning the sidebar.
    <div className="relative flex h-screen bg-[#121212] text-foreground">
      {/* 2. Floating Sidebar:
        - Made `absolute` to float over the content.
        - Centered vertically with `top-1/2 -translate-y-1/2`.
        - Styled with rounded corners and `bg-muted` for a distinct look.
        - Removed the right border.
      */}
      <aside className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-16 bg-[#181818] rounded-2xl flex flex-col items-center justify-between py-6 h-[calc(100vh-1rem)]">
        {/* Logo */}
        <Link href="/choose">
            <Image
                src="/logo.png" // Ensure you have a logo image at this path
                alt="Logo"
                className="object-contain"
                width={32}
                height={32}
                priority
            />
        </Link>
        
        {/* Navigation Icons */}
        <nav className="flex flex-col space-y-2">
          <Link href="/choose" className="p-2 rounded-md text-muted-foreground hover:bg-primary/10 hover:text-primary">
            <FileText size={20} />
          </Link>
          <Link href="/history" className="p-2 rounded-md text-muted-foreground hover:bg-primary/10 hover:text-primary">
            <Clock size={20} />
          </Link>
          <SettingsDialog 
            trigger={
              <button className="p-2 rounded-md text-muted-foreground hover:bg-primary/10 hover:text-primary">
                <Settings size={20} />
              </button>
            }
          />
        </nav>

        {/* Logout at the bottom */}
        <LogoutDialog
          trigger={
            <button className="p-2 rounded-md text-muted-foreground hover:text-destructive/20 hover:text-destructive">
              <LogOut size={20} />
            </button>
          }
        />
      </aside>
      
      {/* Main Content */}
      {/* 3. Added left padding `pl-24` to prevent content from going under the floating sidebar */}
      <div className="flex-1 flex flex-col pl-20">
        {/* Header */}
        {/* 4. Use theme variables for borders and button styles */}
        <header className="h-16 border-b border-border flex items-center justify-between px-6">
          {/* Using a simple div for the "New Note" tab as in the image */}
          <div className='flex items-center gap-2 border border-border rounded-t-md px-3 py-1.5 -mb-px border-b-background z-10'>
             <span className='text-primary'>
                <FileText size={16}/>
             </span>
             <span className='text-sm text-foreground'>New Note</span>
          </div>
          
          <PricingDialog
            trigger={
              <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                Upgrade plan
                <span className="ml-2 text-xs bg-primary-foreground/20 text-primary-foreground font-semibold px-1.5 py-0.5 rounded">PRO</span>
              </Button>
            }
          />
        </header>
        
        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;