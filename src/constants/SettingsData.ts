import { TypeUser } from "@/types/TypeSupabase";

export const SettingsSections = [
  {
    id: "displayName",
    label: "Display name",
    key: "name" as keyof TypeUser,
    placeholder: "Your name",
    editable: true,
    fallback: "Not set",
  },
  {
    id: "email",
    label: "Email Address",
    key: "email" as keyof TypeUser,
    editable: false,
    fallback: "Not available",
  },
];

export const MobileSettingsSections = [
  {
    id: "displayName",
    label: "Display name",
    getUserValue: (user: TypeUser | null) => user?.name || "Not set",
  },
  {
    id: "email",
    label: "Email Address",
    getUserValue: (user: TypeUser | null) => user?.email || "Not available",
  },
  {
    id: "plan",
    label: "Current Plan",
    getUserValue: () => "Free", // Static value for now
  },
];
