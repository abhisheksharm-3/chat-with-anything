"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabaseBrowserClient } from "@/utils/supabase/client";
import { TypeUser } from "@/types/supabase";
import { useEffect } from "react";

// Define query keys as constants
export const USER_QUERY_KEY = ["user"];

/**
 * Custom hook to fetch and manage the current user data
 */
export function useUser() {
  const queryClient = useQueryClient();
  const supabase = supabaseBrowserClient();

  // Fetch the current user session
  const sessionQuery = useQuery({
    queryKey: [...USER_QUERY_KEY, "session"],
    queryFn: async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      return data.session;
    },
  });

  // Fetch the user profile data from the users table
  const userQuery = useQuery({
    queryKey: [...USER_QUERY_KEY, "profile"],
    queryFn: async () => {
      // Only fetch if we have a session
      if (!sessionQuery.data?.user?.id) return null;

      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", sessionQuery.data.user.id)
        .single();

      if (error) {
        // If no user record exists, return null instead of creating one
        // User creation should happen in the signup flow via useAuth hook
        if (error.code === 'PGRST116') {
          console.warn("User profile not found in database. This might indicate an incomplete signup process.");
          return null;
        }
        throw error;
      }
      
      return data as TypeUser;
    },
    enabled: !!sessionQuery.data?.user?.id,
  });

  // Ensure user profile is fetched when session changes
  useEffect(() => {
    if (sessionQuery.data?.user?.id && !userQuery.data) {
      userQuery.refetch();
    }
  }, [sessionQuery.data?.user?.id, userQuery.data, userQuery.refetch]);

  // Update user profile mutation
  const updateUserMutation = useMutation({
    mutationFn: async (userData: Partial<TypeUser>) => {
      if (!sessionQuery.data?.user?.id) {
        throw new Error("No authenticated user");
      }

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
      // Update the user data in the cache
      queryClient.setQueryData([...USER_QUERY_KEY, "profile"], updatedUser);
    },
  });

  // Sign out mutation
  const signOutMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      // Clear user data from cache
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEY });
    },
  });

  // Default user data if not loaded yet (fallback from auth session)
  const defaultUser: TypeUser | null = sessionQuery.data?.user ? {
    id: sessionQuery.data.user.id,
    email: sessionQuery.data.user.email || '',
    name: sessionQuery.data.user.user_metadata?.full_name || '',
    created_at: new Date().toISOString(),
  } : null;

  return {
    // User data and loading states
    user: userQuery.data || defaultUser,
    session: sessionQuery.data,
    isLoading: sessionQuery.isLoading || userQuery.isLoading,
    isError: sessionQuery.isError || userQuery.isError,
    error: sessionQuery.error || userQuery.error,
    
    // Auth state helpers
    isAuthenticated: !!sessionQuery.data?.user,
    userId: sessionQuery.data?.user?.id,
    
    // Mutations
    updateUser: updateUserMutation.mutate,
    updateUserAsync: updateUserMutation.mutateAsync,
    isUpdating: updateUserMutation.isPending,
    
    // Sign out
    signOut: signOutMutation.mutate,
    signOutAsync: signOutMutation.mutateAsync,
    isSigningOut: signOutMutation.isPending,
  };
}