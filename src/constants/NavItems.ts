import { Clock, FileText, Settings } from "lucide-react";

export const NAVIGATION_ITEMS = [
  { href: "/choose", icon: File },
  { href: "/history", icon: Clock },
] as const;

export const MOBILE_NAV_ITEMS = [
  {
    href: "/choose",
    icon: FileText,
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