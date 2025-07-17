"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabaseBrowserClient } from "@/utils/supabase/client";
import { TypeFile } from "@/types/supabase";
import { useUser } from "./useUser";

// Define query keys as constants
export const FILES_QUERY_KEY = ["files"];

/**
 * Custom hook to fetch and manage user files
 */
export function useFiles() {
  const queryClient = useQueryClient();
  const supabase = supabaseBrowserClient();
  const { userId, isAuthenticated } = useUser();

  // Fetch all user files
  const filesQuery = useQuery({
    queryKey: FILES_QUERY_KEY,
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from("files")
        .select("*")
        .eq("user_id", userId)
        .order("uploaded_at", { ascending: false });

      if (error) throw error;
      return data as TypeFile[];
    },
    enabled: isAuthenticated && !!userId,
  });

  // Fetch a single file by ID
  const getFileById = (fileId: string) => {
    // Validate fileId
    const isValidFileId = !!fileId && typeof fileId === 'string' && fileId.trim() !== '';
    
    return useQuery({
      queryKey: [...FILES_QUERY_KEY, fileId],
      queryFn: async () => {
        if (!userId || !isValidFileId) return null;

        const { data, error } = await supabase
          .from("files")
          .select("*")
          .eq("id", fileId)
          .eq("user_id", userId)
          .single();

        if (error) return null; // Return null instead of throwing to handle missing files gracefully
        return data as TypeFile;
      },
      enabled: isAuthenticated && !!userId && isValidFileId,
      staleTime: 30000, // Consider data fresh for 30 seconds
    });
  };

  // Upload a new file
  const uploadFileMutation = useMutation({
    mutationFn: async ({
      file,
      fileData,
    }: {
      file: File;
      fileData: Omit<TypeFile, "id" | "user_id" | "uploaded_at" | "url">;
    }) => {
      if (!userId) {
        throw new Error("No authenticated user");
      }

      try {
        // For URL-type uploads, we don't need to upload an actual file
        let fileUrl = null;
        
        if (fileData.type !== 'url') {
          // 1. Upload the file to storage only if it's not a URL
          const filePath = `${userId}/${Date.now()}_${file.name}`;
          const { error: uploadError, data: uploadData } = await supabase.storage
            .from("file-storage")
            .upload(filePath, file, {
              cacheControl: "3600",
            });

          if (uploadError) {
            console.error("Storage upload error:", uploadError);
            throw new Error(`File upload failed: ${uploadError.message}`);
          }

          // 2. Get the public URL
          const { data: urlData } = supabase.storage.from("file-storage").getPublicUrl(filePath);
          fileUrl = urlData.publicUrl;
        }

        // 3. Create a record in the files table
        const newFileData = {
          ...fileData,
          user_id: userId,
          url: fileUrl,
          uploaded_at: new Date().toISOString(),
        };

        // Ensure user_id is explicitly set and matches the authenticated user
        console.log("Inserting file with user_id:", userId);
        
        // First, check if the user is authenticated
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session) {
          throw new Error("Authentication required: No active session found");
        }

        // Then insert the record with the user_id
        const { data, error } = await supabase
          .from("files")
          .insert({
            ...newFileData,
            user_id: userId, // Explicitly set user_id to match RLS policy
          })
          .select()
          .single();

        if (error) {
          console.error("Database insert error:", error);
          throw new Error(`Database record creation failed: ${error.message}`);
        }
        
        return data as TypeFile;
      } catch (error) {
        console.error("Upload process failed:", error);
        throw error;
      }
    },
    onSuccess: (newFile) => {
      // Update the files list in the cache
      queryClient.setQueryData(FILES_QUERY_KEY, (oldData: TypeFile[] | undefined) => {
        return oldData ? [newFile, ...oldData] : [newFile];
      });
    },
  });

  // Update an existing file
  const updateFileMutation = useMutation({
    mutationFn: async ({ fileId, fileData }: { fileId: string; fileData: Partial<TypeFile> }) => {
      if (!userId) {
        throw new Error("No authenticated user");
      }

      const { data, error } = await supabase
        .from("files")
        .update(fileData)
        .eq("id", fileId)
        .eq("user_id", userId)
        .select()
        .single();

      if (error) throw error;
      return data as TypeFile;
    },
    onSuccess: (updatedFile) => {
      // Update the specific file in the cache
      queryClient.setQueryData([...FILES_QUERY_KEY, updatedFile.id], updatedFile);

      // Update the file in the files list
      queryClient.setQueryData(FILES_QUERY_KEY, (oldData: TypeFile[] | undefined) => {
        if (!oldData) return [updatedFile];
        return oldData.map((file) => (file.id === updatedFile.id ? updatedFile : file));
      });
    },
  });

  // Delete a file
  const deleteFileMutation = useMutation({
    mutationFn: async (fileId: string) => {
      if (!userId) {
        throw new Error("No authenticated user");
      }

      // 1. Get the file to find its path
      const { data: file, error: fetchError } = await supabase
        .from("files")
        .select("url")
        .eq("id", fileId)
        .eq("user_id", userId)
        .single();

      if (fetchError) throw fetchError;

      // Extract the path from the URL
      if (file.url) {
        const url = new URL(file.url);
        const pathMatch = url.pathname.match(/\/file-storage\/([^?]+)/);
        const filePath = pathMatch ? pathMatch[1] : null;

        // 2. Delete from storage if we have a path
        if (filePath) {
          const { error: storageError } = await supabase.storage
            .from("file-storage")
            .remove([filePath]);

          if (storageError) {
            console.error("Storage deletion error:", storageError);
            // Continue with database deletion even if storage deletion fails
          }
        }
      }

      // 3. Delete the database record
      const { error } = await supabase
        .from("files")
        .delete()
        .eq("id", fileId)
        .eq("user_id", userId);

      if (error) throw error;
      return fileId;
    },
    onSuccess: (fileId) => {
      // Remove the file from the cache
      queryClient.removeQueries({ queryKey: [...FILES_QUERY_KEY, fileId] });

      // Update the files list in the cache
      queryClient.setQueryData(FILES_QUERY_KEY, (oldData: TypeFile[] | undefined) => {
        if (!oldData) return [];
        return oldData.filter((file) => file.id !== fileId);
      });
    },
  });

  return {
    // Queries
    files: filesQuery.data || [],
    isLoading: filesQuery.isLoading,
    isError: filesQuery.isError,
    error: filesQuery.error,
    getFileById,

    // Mutations
    uploadFile: uploadFileMutation.mutate,
    uploadFileAsync: uploadFileMutation.mutateAsync,
    isUploading: uploadFileMutation.isPending,

    updateFile: updateFileMutation.mutate,
    updateFileAsync: updateFileMutation.mutateAsync,
    isUpdating: updateFileMutation.isPending,

    deleteFile: deleteFileMutation.mutate,
    deleteFileAsync: deleteFileMutation.mutateAsync,
    isDeleting: deleteFileMutation.isPending,
  };
} 