"use client";
import Link from "next/link";
import Image from "next/image";
import { ChevronsLeft, Loader2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import PricingDialog from "@/components/dashboard/PricingDialog";
import { MobileNavItems } from "@/constants/NavItems";
import { TypeUser } from "@/types/TypeSupabase";
import { useUser } from "@/hooks/useUser";
import avatarImage from "@/assets/images/avatar.svg";
import { useSidebarState } from "@/hooks/useMobileSidebarState";
import { usePathname } from "next/navigation";

/**
 * Renders the list of navigation links for the mobile sidebar.
 * @component
 * @param {object} props - The component's properties.
 * @param {string} props.pathname - The current URL path to highlight the active link.
 * @param {() => void} props.onItemClick - Callback executed when a navigation item is clicked, used to close the sidebar.
 */
const MobileNavigation = ({ onItemClick }: { onItemClick: () => void }) => {
  const pathname = usePathname();
  return (
    <nav className="flex-1 p-6">
      <div className="space-y-1">
        {MobileNavItems.map(
          ({ href, icon: IconComponent, title, description }) => {
            const Icon = IconComponent as LucideIcon;
            const isActive = pathname === href;

            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-200 ${
                  isActive
                    ? "bg-[#2a2a2a] text-white shadow-sm"
                    : "text-gray-400 hover:text-white hover:bg-[#1f1f1f] active:bg-[#2a2a2a]"
                }`}
                onClick={onItemClick}
              >
                <div
                  className={`flex-shrink-0 w-10 h-10 rounded-full bg-[#181818] flex items-center justify-center ${
                    isActive ? "text-white" : "text-gray-400"
                  }`}
                >
                  <Icon size={20} strokeWidth={1.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <div
                    className={`text-base font-medium leading-5 ${
                      isActive ? "text-white" : "text-gray-300"
                    }`}
                  >
                    {title}
                  </div>
                  <div className="text-sm text-gray-500 leading-4 mt-0.5">
                    {description}
                  </div>
                </div>
              </Link>
            );
          },
        )}
      </div>
    </nav>
  );
};

/**
 * Displays the user's profile information, including an avatar with initials, name, and email.
 * It also shows a loading state while user data is being fetched.
 * @component
 * @param {object} props - The component's properties.
 * @param {TypeUser | null | undefined} props.user - The user object containing profile details.
 * @param {boolean} props.isLoading - If true, a loading indicator is displayed instead of the profile info.
 */
const UserProfile = ({
  user,
  isLoading,
}: {
  user: TypeUser | null | undefined;
  isLoading: boolean;
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
        <span className="text-gray-400 text-sm">Loading...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-6 flex-col justify-center w-screen">
      <div className="flex items-start gap-3 w-full">
        <div className="w-16 h-16 rounded-full flex items-center justify-center">
          <Image
            src={avatarImage}
            alt="User Avatar"
            className="object-contain"
            width={64}
            height={64}
            priority
          />
        </div>
        <div className="flex flex-col text-left gap-2">
          <div className="text-white text-lg font-bold">
            {user?.name || "User"}
          </div>
          <div className="text-gray-400 text-sm">
            {user?.email || "No email"}
          </div>
        </div>
        <div className="ml-auto">
          <span className="bg-primary text-xs px-2 py-1 rounded">FREE</span>
        </div>
      </div>
      <PricingDialog
        trigger={
          <Button className="w-full font-bold text-lg rounded-lg py-8">
            Upgrade to pro
          </Button>
        }
      />
    </div>
  );
};

/**
 * The main sidebar component for mobile views, which slides in from the left.
 * It contains the navigation, user profile, and other actions.
 * Now manages its own state for open/close functionality and fetches user data internally.
 * @component
 * @param {object} props - The component's properties.
 * @param {string} props.pathname - The current URL path, passed to the navigation component.
 */
export const DashboardMobileSidebar = () => {
  // User data fetching moved from layout to this component
  const { user, isLoading } = useUser();

  const { isOpen, closeSidebar } = useSidebarState();

  const handleClose = () => {
    closeSidebar();
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-[#121212] bg-opacity-50 z-40"
          onClick={handleClose}
        />
      )}
      {/* Sidebar */}
      <aside
        className={`md:hidden fixed left-0 top-0 h-full w-full bg-[#121212] z-50 transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
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
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="text-gray-400 hover:text-white border rounded-lg"
            >
              <ChevronsLeft className="size-8" />
            </Button>
          </div>
          <MobileNavigation onItemClick={handleClose} />
          <div className="p-4 border-t border-gray-700">
            <div className="flex mb-4 p-4 border rounded-lg">
              <UserProfile user={user} isLoading={isLoading} />
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
