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
    <div className="flex h-screen bg-black text-white">
      {/* Sidebar */}
      <div className="w-16 border-r border-gray-800 flex flex-col items-center justify-between py-6 space-y-8">
        {/* Logo */}
        <Image
            src="/logo.png"
            alt="Logo"
            className="object-contain"
            width={32}
            height={32}
            priority
          />
        
        {/* Navigation Icons */}
        <div className="flex flex-col space-y-6">
          <Link href="/choose" className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white">
            <FileText size={20} />
          </Link>
          <Link href="/history" className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white">
            <Clock size={20} />
          </Link>
          <SettingsDialog 
            trigger={
              <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white">
                <Settings size={20} />
              </button>
            }
          />
        </div>

        <LogoutDialog
          trigger={
            <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white">
              <LogOut size={20} />
            </button>
          }
        />
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-16 border-b border-gray-800 flex items-center justify-between px-6">
          <h1 className="text-white text-sm font-medium">Home screen</h1>
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" className="bg-transparent border-gray-700 text-gray-300 hover:bg-gray-800">
              <span className="mr-2">+</span> New Note
            </Button>
            <PricingDialog
              trigger={
                <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white">
                  Upgrade plan <span className="ml-1 text-xs bg-purple-500 px-1 rounded">$10</span>
                </Button>
              }
            />
          </div>
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