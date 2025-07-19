import { Clock, File, Settings } from "lucide-react";

export const NavigationItems = [
  { href: "/choose", icon: File },
  { href: "/history", icon: Clock },
] as const;

export const MobileNavItems = [
  {
    href: "/choose",
    icon: File,
    title: "New Note",
    description: "Record and create new note",
  },
  {
    href: "/history",
    icon: Clock,
    title: "History",
    description: "Record and create new note",
  },
  {
    href: "/settings",
    icon: Settings,
    title: "Account Settings",
    description: "Manage your account preferences",
  },
] as const;
