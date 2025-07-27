"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabaseBrowserClient } from "@/utils/supabase/client";
import { TypeFile } from "@/types/TypeSupabase";
import { useUser } from "./useUser";
import { processPdfDocument, processGenericDocument } from "@/utils/processors";
import { TypeUpdateFileParams, TypeUploadFileParams } from "@/types/TypeContent";

/** The base query key for all file-related queries. */
export const FILES_QUERY_KEY = ["files"];

// --- Constants ---
const STORAGE_BUCKET = "file-storage";
const PROCESSABLE_DOC_TYPES = new Set(["pdf", "doc", "docs", "sheet", "sheets", "slides"]);
const URL_BASED_TYPES = new Set(["url", "web", "youtube"]);

/**
 * A custom hook for fetching and managing a user's files.
 * It provides the file list and mutations for uploading, updating, and deleting files.
 */
export const useFiles = () => {
  const queryClient = useQueryClient();
  const supabase = supabaseBrowserClient();
  const { userId } = useUser();

  /** Query to fetch all files for the authenticated user. */
  const { data: files = [], isLoading, isError, error } = useQuery({
    queryKey: FILES_QUERY_KEY,
    queryFn: async () => {
      if (!userId) return [];
      const { data, error: queryError } = await supabase
        .from("files")
        .select("*")
        .eq("user_id", userId)
        .order("uploaded_at", { ascending: false });
      if (queryError) throw queryError;
      return data as TypeFile[];
    },
    enabled: !!userId,
  });

  // --- Private Helper Functions for Mutations ---

  /** Handles the complete upload and processing workflow. @private */
  const _handleUpload = async ({ file, fileData }: TypeUploadFileParams): Promise<TypeFile> => {
    if (!userId) throw new Error("User not authenticated.");

    // 1. Upload to storage if it's not a URL-based type
    let fileUrl: string | null = null;
    if (!URL_BASED_TYPES.has(fileData.type || "")) {
      const filePath = `${userId}/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage.from(STORAGE_BUCKET).upload(filePath, file);
      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(filePath);
      fileUrl = urlData.publicUrl;
    }

    // 2. Create the file record in the database
    const { data: newFile, error: insertError } = await supabase
      .from("files")
      .insert({ ...fileData, user_id: userId, url: fileUrl, uploaded_at: new Date().toISOString() })
      .select()
      .single();
    if (insertError || !newFile) throw insertError || new Error("Failed to create file record.");

    // 3. Kick off background processing for documents (don't await this)
    if (PROCESSABLE_DOC_TYPES.has(newFile.type || "")) {
      const processor = newFile.type === 'pdf' ? processPdfDocument : processGenericDocument;
      processor(file, newFile.id, newFile.type!).catch(err => 
        console.error(`Background processing failed for ${newFile.id}:`, err)
      );
    }
    
    return newFile;
  };

  /** Handles the complete file deletion workflow. @private */
  const _handleDelete = async (fileId: string): Promise<string> => {
    if (!userId) throw new Error("User not authenticated.");

    // 1. Get the file to find its storage path
    const { data: file, error: fetchError } = await supabase
      .from("files").select("url").eq("id", fileId).single();
    if (fetchError) throw fetchError;

    // 2. Delete from storage if a URL exists
    if (file.url) {
      try {
        const filePath = new URL(file.url).pathname.split(`/${STORAGE_BUCKET}/`)[1];
        if (filePath) await supabase.storage.from(STORAGE_BUCKET).remove([filePath]);
      } catch (e) { console.error("Could not parse or delete file from storage:", e); }
    }

    // 3. Delete the database record
    const { error: deleteError } = await supabase.from("files").delete().eq("id", fileId);
    if (deleteError) throw deleteError;

    return fileId;
  };
  
  // --- Mutations ---

  /** Mutation to handle the entire file upload process. */
  const { mutate: uploadFile, mutateAsync: uploadFileAsync, isPending: isUploading } = useMutation({
    mutationFn: _handleUpload,
    onSuccess: (newFile) => {
      queryClient.setQueryData<TypeFile[]>(FILES_QUERY_KEY, (old = []) => [newFile, ...old]);
    },
  });

  /** Mutation to update a file's metadata. */
  const { mutate: updateFile, mutateAsync: updateFileAsync, isPending: isUpdating } = useMutation({
    mutationFn: async ({ fileId, fileData }: TypeUpdateFileParams) => {
      const { data, error: updateError } = await supabase
        .from("files").update(fileData).eq("id", fileId).select().single();
      if (updateError) throw updateError;
      return data as TypeFile;
    },
    onSuccess: (updatedFile) => {
      queryClient.setQueryData<TypeFile[]>(FILES_QUERY_KEY, (old = []) =>
        old.map(file => (file.id === updatedFile.id ? updatedFile : file))
      );
    },
  });

  /** Mutation to delete a file from storage and the database. */
  const { mutate: deleteFile, mutateAsync: deleteFileAsync, isPending: isDeleting } = useMutation({
    mutationFn: _handleDelete,
    onSuccess: (deletedFileId) => {
      queryClient.setQueryData<TypeFile[]>(FILES_QUERY_KEY, (old = []) =>
        old.filter(file => file.id !== deletedFileId)
      );
    },
  });

  return {
    files,
    isLoading,
    isError,
    error,
    uploadFile,
    uploadFileAsync,
    isUploading,
    updateFile,
    updateFileAsync,
    isUpdating,
    deleteFile,
    deleteFileAsync,
    isDeleting,
  };
};

/**
 * Custom hook to fetch a single file by its ID.
 * This is separated from `useFiles` for focused data fetching and to follow the rules of hooks.
 */
export function useFileById(fileId: string) {
  const supabase = supabaseBrowserClient();
  const { userId, isAuthenticated } = useUser();

  const isValidFileId = !!fileId && typeof fileId === "string" && fileId.trim() !== "";

  return useQuery({
    queryKey: [...FILES_QUERY_KEY, fileId],
    queryFn: async (): Promise<TypeFile | null> => {
      if (!userId || !isValidFileId) return null;
      
      const { data, error } = await supabase
        .from("files")
        .select("*")
        .eq("id", fileId)
        .eq("user_id", userId)
        .single();
      
      if (error) {
        // If the error is that no rows were found, it's not a hard error, just return null
        if (error.code === "PGRST116") return null;
        throw error;
      }
      
      return data as TypeFile;
    },
    enabled: isAuthenticated && !!userId && isValidFileId,
  });
}