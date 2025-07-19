"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabaseBrowserClient } from "@/utils/supabase/client";
import { TypeFile } from "@/types/supabase";
import { useUser } from "./useUser";
import { processPdfDocument, processGenericDocument } from "@/utils/processors";

/** The base query key for all file-related queries in React Query. */
export const FILES_QUERY_KEY = ["files"];

/**
 * A custom hook for fetching and managing all of a user's files.
 * It handles fetching the list of files and provides mutations for uploading,
 * updating, and deleting files, including handling Supabase storage and database records.
 *
 * @returns {object} An object containing the file list, loading/error states, and mutation functions.
 * @property {TypeFile[]} files - The array of user files.
 * @property {boolean} isLoading - True if the files are being fetched.
 * @property {Error | null} error - The error object if fetching fails.
 * @property {(params: {file: File, fileData: Omit<TypeFile, 'id'|'user_id'|'uploaded_at'|'url'>}) => void} uploadFile - Mutation fn to upload a new file.
 * @property {(params: {file: File, fileData: Omit<TypeFile, 'id'|'user_id'|'uploaded_at'|'url'>}) => Promise<TypeFile>} uploadFileAsync - Async version of `uploadFile`.
 * @property {boolean} isUploading - True if a file upload is in progress.
 * @property {(params: {fileId: string, fileData: Partial<TypeFile>}) => void} updateFile - Mutation fn to update a file.
 * @property {boolean} isUpdating - True if a file update is in progress.
 * @property {(fileId: string) => void} deleteFile - Mutation fn to delete a file.
 * @property {boolean} isDeleting - True if a file deletion is in progress.
 */
export const useFiles = () => {
  const queryClient = useQueryClient();
  const supabase = supabaseBrowserClient();
  const { userId, isAuthenticated } = useUser();

  /** Query to fetch all files for the authenticated user. */
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

  /**
   * Mutation to handle the entire file upload process:
   * 1. Uploads the file to Supabase Storage (if applicable).
   * 2. Creates a corresponding record in the 'files' database table.
   * 3. Kicks off background processing/indexing for certain document types.
   */
  const uploadFileMutation = useMutation({
    mutationFn: async ({
      file,
      fileData,
    }: {
      file: File;
      fileData: Omit<TypeFile, "id" | "user_id" | "uploaded_at" | "url">;
    }) => {
      if (!userId) throw new Error("No authenticated user");

      try {
        let fileUrl = null;
        if (fileData.type === "url") {
          // If file is actually a URL object, ensure it has a 'url' property
          if (
            "url" in file &&
            typeof (file as { url?: string }).url === "string"
          ) {
            fileUrl = (file as { url: string }).url;
          }
        }

        if (
          fileData.type !== "url" &&
          fileData.type !== "web" &&
          fileData.type !== "youtube"
        ) {
          // 1. Upload the file to storage
          const filePath = `${userId}/${Date.now()}_${file.name}`;
          const { error: uploadError } = await supabase.storage
            .from("file-storage")
            .upload(filePath, file);
          if (uploadError)
            throw new Error(`File upload failed: ${uploadError.message}`);

          // 2. Get the public URL
          const { data: urlData } = supabase.storage
            .from("file-storage")
            .getPublicUrl(filePath);
          fileUrl = urlData.publicUrl;
        }

        // 3. Create a record in the files table
        const newFileData = {
          ...fileData,
          user_id: userId,
          url: fileUrl,
          uploaded_at: new Date().toISOString(),
        };
        const { data, error } = await supabase
          .from("files")
          .insert(newFileData)
          .select()
          .single();
        if (error)
          throw new Error(`Database record creation failed: ${error.message}`);

        // 4. Process document files for vector indexing (e.g., with Pinecone)
        if (data.id) {
          const processableDocTypes = [
            "doc",
            "docs",
            "sheet",
            "sheets",
            "slides",
          ];
          if (fileData.type === "pdf" || file.type === "application/pdf") {
            // Process PDFs
            try {
              await supabase
                .from("files")
                .update({ processing_status: "processing" })
                .eq("id", data.id);
              const result = await processPdfDocument(file, data.id);
              await supabase
                .from("files")
                .update({
                  processing_status: "completed",
                  indexed_chunks: result.numDocs,
                })
                .eq("id", data.id);
            } catch (indexError) {
              console.error("Error indexing PDF:", indexError);
              await supabase
                .from("files")
                .update({
                  processing_status: "failed",
                  processing_error: String(indexError),
                })
                .eq("id", data.id);
            }
          } else if (processableDocTypes.includes(fileData.type || "")) {
            // Process other document types
            try {
              await supabase
                .from("files")
                .update({ processing_status: "processing" })
                .eq("id", data.id);
              const result = await processGenericDocument(
                file,
                data.id,
                fileData.type!,
              );
              await supabase
                .from("files")
                .update({
                  processing_status: "completed",
                  indexed_chunks: result.numDocs,
                })
                .eq("id", data.id);
            } catch (indexError) {
              console.error(`Error indexing ${fileData.type}:`, indexError);
              await supabase
                .from("files")
                .update({
                  processing_status: "failed",
                  processing_error: String(indexError),
                })
                .eq("id", data.id);
            }
          }
        }

        // 5. For YouTube URLs, set status for later processing
        if (
          (fileData.type === "youtube" || fileData.type === "video") &&
          data.id &&
          data.url
        ) {
          try {
            await supabase
              .from("files")
              .update({ processing_status: "idle", type: "youtube" })
              .eq("id", data.id);
          } catch (youtubeError) {
            console.error("Error setting up YouTube processing:", youtubeError);
          }
        }

        return data as TypeFile;
      } catch (error) {
        console.error("Upload process failed:", error);
        throw error;
      }
    },
    onSuccess: (newFile) => {
      // Optimistically update the files list in the cache
      queryClient.setQueryData(
        FILES_QUERY_KEY,
        (oldData: TypeFile[] | undefined) =>
          oldData ? [newFile, ...oldData] : [newFile],
      );
    },
  });

  /** Mutation to update an existing file's metadata. */
  const updateFileMutation = useMutation({
    mutationFn: async ({
      fileId,
      fileData,
    }: {
      fileId: string;
      fileData: Partial<TypeFile>;
    }) => {
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
      queryClient.setQueryData(
        [...FILES_QUERY_KEY, updatedFile.id],
        updatedFile,
      );
      queryClient.setQueryData(
        FILES_QUERY_KEY,
        (oldData: TypeFile[] | undefined) =>
          oldData?.map((file) =>
            file.id === updatedFile.id ? updatedFile : file,
          ) || [updatedFile],
      );
    },
  });

  /** Mutation to delete a file from both storage and the database. */
  const deleteFileMutation = useMutation({
    mutationFn: async (fileId: string) => {
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
        const url = new URL(file.url);
        const pathMatch = url.pathname.match(/\/file-storage\/([^?]+)/);
        const filePath = pathMatch ? pathMatch[1] : null;
        if (filePath) {
          const { error: storageError } = await supabase.storage
            .from("file-storage")
            .remove([filePath]);
          if (storageError)
            console.error("Storage deletion error:", storageError);
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
 *
 * @param {string} fileId - The ID of the file to fetch. Can be an empty string if no file is selected.
 * @returns {import('@tanstack/react-query').UseQueryResult<TypeFile | null, Error>} The result object from React Query, containing the file data, loading states, and error states.
 */
export function useFileById(fileId: string) {
  const supabase = supabaseBrowserClient();
  const { userId, isAuthenticated } = useUser();

  const isValidFileId =
    !!fileId && typeof fileId === "string" && fileId.trim() !== "";

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
