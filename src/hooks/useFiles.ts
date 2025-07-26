"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabaseBrowserClient } from "@/utils/supabase/client";
import { TypeFile } from "@/types/TypeSupabase";
import { useUser } from "./useUser";
import { processPdfDocument, processGenericDocument } from "@/utils/processors";
import { TypeUpdateFileParams, TypeUploadFileParams } from "@/types/TypeContent";

/** The base query key for all file-related queries in React Query. */
export const FILES_QUERY_KEY = ["files"];

// Constants for better maintainability
const ProcessableDocTypes = ["doc", "docs", "sheet", "sheets", "slides"] as const;
const UrlBasedTypes = ["url", "web", "youtube"] as const;
const StorageBucket = "file-storage";

/**
 * A custom hook for fetching and managing all of a user's files.
 * It handles fetching the list of files and provides mutations for uploading,
 * updating, and deleting files, including handling Supabase storage and database records.
 */
export const useFiles = () => {
  const queryClient = useQueryClient();
  const supabase = supabaseBrowserClient();
  const { userId, isAuthenticated } = useUser();

  /** Query to fetch all files for the authenticated user. */
  const filesQuery = useQuery({
    queryKey: FILES_QUERY_KEY,
    queryFn: async (): Promise<TypeFile[]> => {
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

  // Helper functions for better organization
  const uploadToStorage = async (file: File): Promise<string> => {
    const filePath = `${userId}/${Date.now()}_${file.name}`;
    
    const { error: uploadError } = await supabase.storage
      .from(StorageBucket)
      .upload(filePath, file);
    
    if (uploadError) {
      throw new Error(`File upload failed: ${uploadError.message}`);
    }

    const { data: urlData } = supabase.storage
      .from(StorageBucket)
      .getPublicUrl(filePath);
    
    return urlData.publicUrl;
  };

  const getFileUrl = (file: File, fileData: TypeUploadFileParams["fileData"]): string | null => {
    if (fileData.type === "url" && "url" in file && typeof (file as { url?: string }).url === "string") {
      return (file as { url: string }).url;
    }
    return null;
  };

  const createDatabaseRecord = async (
    fileData: TypeUploadFileParams["fileData"],
    fileUrl: string | null
  ): Promise<TypeFile> => {
    const newFileData = {
      ...fileData,
      user_id: userId!,
      url: fileUrl,
      uploaded_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("files")
      .insert(newFileData)
      .select()
      .single();

    if (error) {
      throw new Error(`Database record creation failed: ${error.message}`);
    }

    return data as TypeFile;
  };

  const updateProcessingStatus = async (
    fileId: string, 
    status: "processing" | "completed" | "failed" | "idle",
    additionalData?: { indexed_chunks?: number; processing_error?: string }
  ) => {
    const updateData = { processing_status: status, ...additionalData };
    
    await supabase
      .from("files")
      .update(updateData)
      .eq("id", fileId);
  };

  const processDocument = async (file: File, fileData: TypeUploadFileParams["fileData"], fileId: string) => {
    try {
      await updateProcessingStatus(fileId, "processing");

      let result;
      if (fileData.type === "pdf" || file.type === "application/pdf") {
        result = await processPdfDocument(file, fileId);
      } else if (ProcessableDocTypes.includes(fileData.type as typeof ProcessableDocTypes[number])) {
        result = await processGenericDocument(file, fileId, fileData.type!);
      } else {
        return; // No processing needed
      }

      await updateProcessingStatus(fileId, "completed", { 
        indexed_chunks: result.numDocs 
      });
    } catch (indexError) {
      console.error(`Error indexing ${fileData.type}:`, indexError);
      await updateProcessingStatus(fileId, "failed", { 
        processing_error: String(indexError) 
      });
    }
  };

  const setupYouTubeProcessing = async (fileData: TypeUploadFileParams["fileData"], fileId: string) => {
    if (!["youtube", "video"].includes(fileData.type || "")) return;

    try {
      await updateProcessingStatus(fileId, "idle");
      await supabase
        .from("files")
        .update({ type: "youtube" })
        .eq("id", fileId);
    } catch (youtubeError) {
      console.error("Error setting up YouTube processing:", youtubeError);
    }
  };

  /**
   * Mutation to handle the entire file upload process:
   * 1. Uploads the file to Supabase Storage (if applicable).
   * 2. Creates a corresponding record in the 'files' database table.
   * 3. Kicks off background processing/indexing for certain document types.
   */
  const uploadFileMutation = useMutation({
    mutationFn: async ({ file, fileData }: TypeUploadFileParams): Promise<TypeFile> => {
      if (!userId) throw new Error("No authenticated user");

      try {
        // 1. Handle file URL based on type
        let fileUrl = getFileUrl(file, fileData);
        
        // 2. Upload to storage if not a URL-based type
        if (!UrlBasedTypes.includes(fileData.type as typeof UrlBasedTypes[number]) && !fileUrl) {
          fileUrl = await uploadToStorage(file);
        }

        // 3. Create database record
        const newFile = await createDatabaseRecord(fileData, fileUrl);

        // 4. Process documents for indexing
        if (newFile.id) {
          await processDocument(file, fileData, newFile.id);
          await setupYouTubeProcessing(fileData, newFile.id);
        }

        return newFile;
      } catch (error) {
        console.error("Upload process failed:", error);
        throw error;
      }
    },
    onSuccess: (newFile) => {
      queryClient.setQueryData(
        FILES_QUERY_KEY,
        (oldData: TypeFile[] | undefined) =>
          oldData ? [newFile, ...oldData] : [newFile],
      );
    },
  });

  /** Mutation to update an existing file's metadata. */
  const updateFileMutation = useMutation({
    mutationFn: async ({ fileId, fileData }: TypeUpdateFileParams): Promise<TypeFile> => {
      if (!userId) throw new Error("No authenticated user");
      
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
      // Update both the specific file cache and the list cache
      queryClient.setQueryData([...FILES_QUERY_KEY, updatedFile.id], updatedFile);
      queryClient.setQueryData(
        FILES_QUERY_KEY,
        (oldData: TypeFile[] | undefined) =>
          oldData?.map((file) =>
            file.id === updatedFile.id ? updatedFile : file,
          ) || [updatedFile],
      );
    },
  });

  const extractFilePathFromUrl = (url: string): string | null => {
    try {
      const urlObj = new URL(url);
      const pathMatch = urlObj.pathname.match(/\/file-storage\/([^?]+)/);
      return pathMatch ? pathMatch[1] : null;
    } catch {
      return null;
    }
  };

  const deleteFromStorage = async (fileUrl: string) => {
    const filePath = extractFilePathFromUrl(fileUrl);
    if (!filePath) return;

    const { error: storageError } = await supabase.storage
      .from(StorageBucket)
      .remove([filePath]);
    
    if (storageError) {
      console.error("Storage deletion error:", storageError);
    }
  };

  /** Mutation to delete a file from both storage and the database. */
  const deleteFileMutation = useMutation({
    mutationFn: async (fileId: string): Promise<string> => {
      if (!userId) throw new Error("No authenticated user");

      // 1. Get the file to find its storage path
      const { data: file, error: fetchError } = await supabase
        .from("files")
        .select("url")
        .eq("id", fileId)
        .eq("user_id", userId)
        .single();
      
      if (fetchError) throw fetchError;

      // 2. Delete from storage if it has a URL
      if (file.url) {
        await deleteFromStorage(file.url);
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
      // Remove the file from all relevant caches
      queryClient.removeQueries({ queryKey: [...FILES_QUERY_KEY, fileId] });
      queryClient.setQueryData(
        FILES_QUERY_KEY,
        (oldData: TypeFile[] | undefined) =>
          oldData?.filter((file) => file.id !== fileId) || [],
      );
    },
  });

  return {
    // Queries
    files: filesQuery.data || [],
    isLoading: filesQuery.isLoading,
    isError: filesQuery.isError,
    error: filesQuery.error,

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