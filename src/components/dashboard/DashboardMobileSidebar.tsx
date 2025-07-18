import Link from "next/link";
import Image from "next/image";
import { ChevronsLeft, Loader2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import PricingDialog from "@/components/dashboard/PricingDialog";
import { MOBILE_NAV_ITEMS } from "@/constants/NavItems";
import { TypeUser } from "@/types/supabase";
import { getUserInitials } from "@/utils/dashboard-utils";

/**
 * Renders the list of navigation links for the mobile sidebar.
 * @component
 * @param {object} props - The component's properties.
 * @param {string} props.pathname - The current URL path to highlight the active link.
 * @param {() => void} props.onItemClick - Callback executed when a navigation item is clicked, used to close the sidebar.
 */
const MobileNavigation = ({
  pathname,
  onItemClick,
}: {
  pathname: string;
  onItemClick: () => void;
}) => (
  <nav className="flex-1 p-4">
    <div className="space-y-2">
      {MOBILE_NAV_ITEMS.map(({ href, icon: IconComponent, title, description }) => {
        const Icon = IconComponent as LucideIcon;
        return (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
              pathname === href
                ? "bg-[#2a2a2a] text-white"
                : "text-gray-400 hover:text-white hover:bg-[#2a2a2a]"
            }`}
            onClick={onItemClick}
          >
            <Icon size={20} />
            <div>
              <div className="text-sm font-medium">{title}</div>
              <div className="text-xs text-gray-500">{description}</div>
            </div>
          </Link>
        );
      })}
    </div>
  </nav>
);

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
    <>
      <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
        <span className="text-white text-sm">{getUserInitials(user)}</span>
      </div>
      <div>
        <div className="text-white text-sm font-medium">
          {user?.name || "User"}
        </div>
        <div className="text-gray-400 text-xs">{user?.email || "No email"}</div>
      </div>
      <div className="ml-auto">
        <span className="bg-primary text-xs px-2 py-1 rounded">FREE</span>
      </div>
    </>
  );
};

/**
 * The main sidebar component for mobile views, which slides in from the left.
 * It contains the navigation, user profile, and other actions.
 * @component
 * @param {object} props - The component's properties.
 * @param {boolean} props.isOpen - Controls the visibility of the sidebar.
 * @param {() => void} props.onClose - Callback function to close the sidebar.
 * @param {string} props.pathname - The current URL path, passed to the navigation component.
 * @param {TypeUser | null | undefined} props.user - The user object, passed to the user profile component.
 * @param {boolean} props.isLoading - The user loading state, passed to the user profile component.
 */
export const DashboardMobileSidebar = ({
  isOpen,
  onClose,
  pathname,
  user,
isLoading,
}: {
  isOpen: boolean;
  onClose: () => void;
  pathname: string;
  user: TypeUser | null | undefined;
  isLoading: boolean;
}) => (
  <>
    {/* Overlay */}
    {isOpen && (
      <div
        className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />
    )}
    {/* Sidebar */}
    <aside
      className={`md:hidden fixed left-0 top-0 h-full w-full bg-[#181818] z-50 transform transition-transform duration-300 ${
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
              onClick={onClose}
              className="text-gray-400 hover:text-white border rounded-lg"
            >
              <ChevronsLeft size={20} />
            </Button>
        </div>
        <MobileNavigation pathname={pathname} onItemClick={onClose} />
        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <UserProfile user={user} isLoading={isLoading} />
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
  </>
);