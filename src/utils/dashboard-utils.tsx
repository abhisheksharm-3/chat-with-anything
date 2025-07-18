import { FileText, FileIcon } from "lucide-react";
import { TypeUser } from "@/types/supabase";

// Utility functions for dashboard layout
export const getFileTypeIcon = (type: string | null | undefined) => {
  const iconMap = {
    pdf: <FileText size={16} className="text-red-500" />,
    doc: <FileText size={16} className="text-blue-500" />,
    image: <FileIcon size={16} className="text-green-500" />,
    web: <FileIcon size={16} className="text-purple-500" />,
    url: <FileIcon size={16} className="text-purple-500" />,
    sheet: <FileIcon size={16} className="text-green-500" />,
    slides: <FileIcon size={16} className="text-orange-500" />,
    default: <FileText size={16} className="text-gray-500" />,
  };

  return iconMap[type as keyof typeof iconMap] || iconMap.default;
};

export const getUserInitials = (user: TypeUser | null | undefined): string => {
  if (!user?.name) return "U";

  const nameParts = user.name.split(" ");
  if (nameParts.length === 1) return nameParts[0].charAt(0).toUpperCase();

  return (
    nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)
  ).toUpperCase();
};