import { TypeUser } from "@/types/TypeSupabase";


export const getUserInitials = (user: TypeUser | null | undefined): string => {
  if (!user?.name) return "U";

  const nameParts = user.name.split(" ");
  if (nameParts.length === 1) return nameParts[0].charAt(0).toUpperCase();

  return (
    nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)
  ).toUpperCase();
};