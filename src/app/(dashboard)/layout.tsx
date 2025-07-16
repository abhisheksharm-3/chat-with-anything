"use client"
import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FileText, Clock, Settings, LogOut, File, Plus } from 'lucide-react';
import Image from 'next/image';
import SettingsDialog from '@/components/dashboard/SettingsDialog';
import PricingDialog from '@/components/dashboard/PricingDialog';
import LogoutDialog from '@/components/dashboard/LogoutDialog';
import { usePathname } from 'next/navigation';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const pathname = usePathname();
  const isHistoryPage = pathname === '/history';
  
  return (
    <div className="relative flex h-screen bg-[#121212] text-foreground">
      <aside className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-12 bg-[#181818] rounded-xl flex flex-col items-center justify-between py-2 px-2 h-[calc(100vh-1rem)]">
        <Link href="/choose">
            <Image
                src="/logo.png"
                alt="Logo"
                className="object-contain"
                width={32}
                height={32}
                priority
            />
        </Link>
        
        <nav className="flex flex-col space-y-2">
          <Link href="/choose" className={`p-2 rounded-md transition-colors ${
            pathname === '/choose' 
              ? 'text-white' 
              : 'text-muted-foreground hover:text-foreground'
          }`}>
            <File size={20} />
          </Link>
          <Link href="/history" className={`p-2 rounded-md transition-colors ${
            pathname === '/history' 
              ? 'text-white' 
              : 'text-muted-foreground hover:text-foreground'
          }`}>
            <Clock size={20} />
          </Link>
          <SettingsDialog 
            trigger={
              <button className="p-2 rounded-md text-muted-foreground hover:text-foreground cursor-pointer">
                <Settings size={20} />
              </button>
            }
          />
        </nav>
        <LogoutDialog
          trigger={
            <button className="p-2 rounded-md text-muted-foreground hover:text-destructive cursor-pointer">
              <LogOut size={20} />
            </button>
          }
        />
      </aside>
      
      <div className="flex-1 flex flex-col pl-14">
        <header className="h-16 flex items-center justify-between px-6">
          {!isHistoryPage && (
            <div className='flex items-center'>
               {/* New Note Tab - Active with purple left border */}
               <div className='flex items-center gap-2 bg-[#2a2a2a] px-4 py-2 rounded-l-md border-l-4 border-l-purple-500'>
                  <span className='text-white'>
                     <FileText size={16}/>
                  </span>
                  <span className='text-sm text-white'>New Note</span>
               </div>
               
               {/* PDF Tab - Inactive */}
               <div className='flex items-center gap-2 px-4 py-2 bg-[#1a1a1a]'>
                  <span className='text-sm text-gray-400'>PDF</span>
               </div>
               
               {/* Add Tab Button */}
               <button className='flex items-center justify-center px-3 py-2 rounded-r-md bg-[#1a1a1a] hover:bg-[#2a2a2a] transition-colors'>
                  <Plus size={16} className='text-gray-400 hover:text-white' />
               </button>
            </div>
          )}
          
          {isHistoryPage && <div></div>}
          
          <PricingDialog
            trigger={
              <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl py-5 cursor-pointer">
                Upgrade plan
                <span className="ml-2 text-xs bg-primary-foreground/20 text-primary-foreground font-semibold px-1.5 py-0.5 rounded">PRO</span>
              </Button>
            }
          />
        </header>
        
        <main className="flex-1 overflow-auto p-2">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;