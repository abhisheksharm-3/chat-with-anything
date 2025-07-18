"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabaseBrowserClient } from "@/utils/supabase/client";
import { TypeUser } from "@/types/supabase";

export const USER_QUERY_KEY = ["user"];

export function useUser() {
  const queryClient = useQueryClient();
  const supabase = supabaseBrowserClient();

  const sessionQuery = useQuery({
    queryKey: [...USER_QUERY_KEY, "session"],
    queryFn: async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      return data.session;
    },
  });

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
        if (error.code === 'PGRST116') {
          console.warn("User profile not found in database");
          return null;
        }
        throw error;
      }
      
      return data as TypeUser;
    },
    enabled: !!sessionQuery.data?.user?.id,
  });

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
      queryClient.setQueryData([...USER_QUERY_KEY, "profile"], updatedUser);
    },
  });

  const signOutMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEY });
    },
  });

  const defaultUser: TypeUser | null = sessionQuery.data?.user ? {
    id: sessionQuery.data.user.id,
    email: sessionQuery.data.user.email || '',
    name: sessionQuery.data.user.user_metadata?.full_name || '',
    created_at: new Date().toISOString(),
  } : null;

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
}