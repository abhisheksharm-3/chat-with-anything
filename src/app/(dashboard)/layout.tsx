"use client";
import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Clock,
  Settings,
  LogOut,
  File,
  Plus,
  ChevronsRight,
  ChevronsLeft,
} from "lucide-react";
import Image from "next/image";
import SettingsDialog from "@/components/dashboard/SettingsDialog";
import PricingDialog from "@/components/dashboard/PricingDialog";
import LogoutDialog from "@/components/dashboard/LogoutDialog";
import { usePathname } from "next/navigation";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const pathname = usePathname();
  const isHistoryPage = pathname === "/history";
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="relative flex h-screen bg-[#121212] text-foreground">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 z-20 w-12 bg-[#181818] rounded-xl flex-col items-center justify-between py-2 px-2 h-[calc(100vh-1rem)]">
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
          <Link
            href="/choose"
            className={`p-2 rounded-md transition-colors ${
              pathname === "/choose"
                ? "text-white"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <File size={20} />
          </Link>
          <Link
            href="/history"
            className={`p-2 rounded-md transition-colors ${
              pathname === "/history"
                ? "text-white"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
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

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`md:hidden fixed left-0 top-0 h-full w-full bg-[#181818] z-50 transform transition-transform duration-300 ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Mobile Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-[#121212]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                <Image
                  src="/logo.png"
                  alt="Logo"
                  className="object-contain"
                  width={44}
                  height={40}
                  priority
                />
              </div>
              <span className="text-white font-medium">chatwithanything</span>
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 text-gray-400 hover:text-white border rounded-lg"
            >
              <ChevronsLeft size={20} />
            </button>
          </div>

          {/* Mobile Navigation */}
          <nav className="flex-1 p-4">
            <div className="space-y-2">
              <Link
                href="/choose"
                className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                  pathname === "/choose"
                    ? "bg-[#2a2a2a] text-white"
                    : "text-gray-400 hover:text-white hover:bg-[#2a2a2a]"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <FileText size={20} />
                <div>
                  <div className="text-sm font-medium">New Note</div>
                  <div className="text-xs text-gray-500">
                    Record and create new note
                  </div>
                </div>
              </Link>

              <Link
                href="/history"
                className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                  pathname === "/history"
                    ? "bg-[#2a2a2a] text-white"
                    : "text-gray-400 hover:text-white hover:bg-[#2a2a2a]"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Clock size={20} />
                <div>
                  <div className="text-sm font-medium">History</div>
                  <div className="text-xs text-gray-500">
                    Record and create new note
                  </div>
                </div>
              </Link>

              <SettingsDialog
                trigger={
                  <button className="flex items-center gap-3 p-3 rounded-lg transition-colors text-gray-400 hover:text-white hover:bg-[#2a2a2a] w-full text-left">
                    <Settings size={20} />
                    <div>
                      <div className="text-sm font-medium">
                        Account Settings
                      </div>
                      <div className="text-xs text-gray-500">
                        Record and create new note
                      </div>
                    </div>
                  </button>
                }
              />
            </div>
          </nav>

          {/* Mobile Footer */}
          <div className="p-4 border-t border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm">SK</span>
              </div>
              <div>
                <div className="text-white text-sm font-medium">Shaunak K</div>
                <div className="text-gray-400 text-xs">shaunak@gmail.com</div>
              </div>
              <div className="ml-auto">
                <span className="bg-primary text-xs px-2 py-1 rounded">
                  FREE
                </span>
              </div>
            </div>

            <PricingDialog
              trigger={
                <Button className="w-full bg-primary hover:bg-primary/90 text-white rounded-lg py-3">
                  Upgrade to pro
                </Button>
              }
            />
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col md:pl-14">
        {/* Mobile Header */}
        <header className="md:hidden h-16 flex items-center justify-between px-4">
          <div className="flex items-center gap-3 bg-[#181818] rounded-lg border">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-1 text-gray-400 hover:text-white"
            >
              <ChevronsRight />
            </button>
          </div>
          <div className="w-8 h-8 flex items-center justify-center">
            <Image
              src="/logo.png"
              alt="Logo"
              className="object-contain"
              width={44}
              height={40}
              priority
            />
          </div>
          <div className="flex items-center gap-2">
            <PricingDialog
              trigger={
                <Button
                  size="sm"
                  className="bg-primary hover:bg-primary/90 text-white rounded-lg px-3 py-1"
                >
                  Upgrade
                </Button>
              }
            />
          </div>
        </header>

        {/* Desktop Header */}
        <header className="hidden md:flex h-16 items-center justify-between px-6">
          {!isHistoryPage && (
            <div className="flex items-center">
              {/* New Note Tab - Active with purple left border */}
              <div className="flex items-center gap-2 bg-[#2a2a2a] px-4 py-2 rounded-l-md border-l-4 border-l-purple-500">
                <span className="text-white">
                  <FileText size={16} />
                </span>
                <span className="text-sm text-white">New Note</span>
              </div>

              {/* PDF Tab - Inactive */}
              <div className="flex items-center gap-2 px-4 py-2 bg-[#1a1a1a]">
                <span className="text-sm text-gray-400">PDF</span>
              </div>

              {/* Add Tab Button */}
              <button className="flex items-center justify-center px-3 py-2 rounded-r-md bg-[#1a1a1a] hover:bg-[#2a2a2a] transition-colors">
                <Plus size={16} className="text-gray-400 hover:text-white" />
              </button>
            </div>
          )}

          {isHistoryPage && <div></div>}

          <PricingDialog
            trigger={
              <Button
                size="sm"
                className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl py-5 cursor-pointer"
              >
                Upgrade plan
                <span className="ml-2 text-xs bg-primary-foreground/20 text-primary-foreground font-semibold px-1.5 py-0.5 rounded">
                  PRO
                </span>
              </Button>
            }
          />
        </header>

        <main className="flex-1 overflow-auto p-2">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
