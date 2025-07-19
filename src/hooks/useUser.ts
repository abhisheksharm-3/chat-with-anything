"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabaseBrowserClient } from "@/utils/supabase/client";
import { TypeUser } from "@/types/supabase";

/** The base query key for all user-related queries in React Query. */
export const USER_QUERY_KEY = ["user"];

/**
 * A custom hook for managing the user's authentication session and profile data.
 *
 * It fetches the Supabase auth session and the user's public profile from the 'users' table.
 * It provides a unified user object, loading/error states, and mutations for updating the
 * user profile and signing out. It includes a fallback mechanism to provide basic user
 * details from the session while the full profile is loading.
 *
 * @returns {object} An object containing the user session, profile, auth status, and action handlers.
 * @property {TypeUser | null} user - The user's profile data. Falls back to basic session info while loading.
 * @property {Session | null} session - The raw Supabase auth session object.
 * @property {boolean} isLoading - True if the session or user profile is being fetched.
 * @property {boolean} isError - True if an error occurred during fetching.
 * @property {Error | null} error - The error object if an error occurred.
 * @property {boolean} isAuthenticated - A boolean flag indicating if the user is logged in.
 * @property {string | undefined} userId - The unique ID of the authenticated user.
 * @property {(userData: Partial<TypeUser>) => void} updateUser - Mutation function to update the user's profile.
 * @property {(userData: Partial<TypeUser>) => Promise<TypeUser>} updateUserAsync - Async version of updateUser.
 * @property {boolean} isUpdating - True if the user profile update is in progress.
 * @property {() => void} signOut - Mutation function to sign the user out.
 * @property {() => Promise<boolean>} signOutAsync - Async version of signOut.
 * @property {boolean} isSigningOut - True if the sign-out process is in progress.
 */
export const useUser = () => {
  const queryClient = useQueryClient();
  const supabase = supabaseBrowserClient();

  /** Query to fetch the current Supabase auth session. */
  const sessionQuery = useQuery({
    queryKey: [...USER_QUERY_KEY, "session"],
    queryFn: async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      return data.session;
    },
  });

  /** Query to fetch the user's public profile from the 'users' table. */
  const userQuery = useQuery({
    queryKey: [...USER_QUERY_KEY, "profile"],
    queryFn: async () => {
      if (!sessionQuery.data?.user?.id) return null;

      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", sessionQuery.data.user.id)
        .single();

      if (error) {
        // If no profile is found, it's not a hard error. The user might have just signed up.
        if (error.code === "PGRST116") {
          console.warn("User profile not found in database");
          return null;
        }
        throw error;
      }

      return data as TypeUser;
    },
    enabled: !!sessionQuery.data?.user?.id, // Only run this query if the user is authenticated
  });

  /** Mutation to update the user's profile in the 'users' table. */
  const updateUserMutation = useMutation({
    mutationFn: async (userData: Partial<TypeUser>) => {
      if (!sessionQuery.data?.user?.id)
        throw new Error("No authenticated user");

      const { data, error } = await supabase
        .from("users")
        .update(userData)
        .eq("id", sessionQuery.data.user.id)
        .select()
        .single();

      if (error) throw error;
      return data as TypeUser;
    },
    onSuccess: (updatedUser) => {
      // Optimistically update the user profile in the cache
      queryClient.setQueryData([...USER_QUERY_KEY, "profile"], updatedUser);
    },
  });

  /** Mutation to sign the user out from Supabase auth. */
  const signOutMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      // Invalidate all user-related queries to clear session and profile data
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEY });
    },
  });

  /** A fallback user object created from session data for a better UX while the full profile loads. */
  const defaultUser: TypeUser | null = sessionQuery.data?.user
    ? {
        id: sessionQuery.data.user.id,
        email: sessionQuery.data.user.email || "",
        name: sessionQuery.data.user.user_metadata?.full_name || "",
        created_at:
          sessionQuery.data.user.created_at || new Date().toISOString(),
      }
    : null;

  return {
    user: userQuery.data || defaultUser,
    session: sessionQuery.data,
    isLoading: sessionQuery.isLoading || userQuery.isLoading,
    isError: sessionQuery.isError || userQuery.isError,
    error: sessionQuery.error || userQuery.error,
    isAuthenticated: !!sessionQuery.data?.user,
    userId: sessionQuery.data?.user?.id,
    updateUser: updateUserMutation.mutate,
    updateUserAsync: updateUserMutation.mutateAsync,
    isUpdating: updateUserMutation.isPending,
    signOut: signOutMutation.mutate,
    signOutAsync: signOutMutation.mutateAsync,
    isSigningOut: signOutMutation.isPending,
  };
};
