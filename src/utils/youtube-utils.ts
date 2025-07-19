/**
 * YouTube utilities module
 *
 * This module contains client-side utility functions for working with YouTube videos.
 * These functions are not marked with "use server" and can be used on the client.
 */

/**
 * Helper function to extract YouTube video ID from URL
 */
export const extractYoutubeVideoId = (url: string): string | null => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
};

/**
 * Check if a URL is a YouTube URL
 */
export const isYoutubeUrl = (url: string): boolean => {
  return url.includes("youtube.com") || url.includes("youtu.be");
};

/**
 * Check if a YouTube video has available transcripts
 * This function validates the URL format but defers actual transcript checking to server-side processing
 */
export const checkYoutubeTranscriptAvailability = async (
  url: string,
): Promise<{ available: boolean; error?: string }> => {
  try {
    // Extract video ID from URL
    const videoId = extractYoutubeVideoId(url);
    if (!videoId) {
      return {
        available: false,
        error: "Invalid YouTube URL. Could not extract video ID.",
      };
    }

    // Basic validation - check if it's a valid YouTube URL format
    if (!isYoutubeUrl(url)) {
      return {
        available: false,
        error: "Invalid YouTube URL format.",
      };
    }

    // For now, we'll assume the video is valid and let the server-side processing handle transcript availability
    // This avoids the API call issue and lets the actual transcript processing determine availability
    return {
      available: true,
    };
  } catch (error) {
    console.error("Error checking YouTube transcript availability:", error);
    return {
      available: false,
      error:
        error instanceof Error
          ? error.message
          : "Unknown error checking transcript availability",
    };
  }
};

/**
 * Create a system prompt for YouTube videos
 */
export const createYoutubeSystemPrompt = (
  transcriptContent: string,
): string => {
  return `You are a helpful assistant that answers questions about a YouTube video based on its transcript.
  
Here is the relevant transcript content to use when answering questions:

${transcriptContent}

When answering:
1. Only use information from the provided transcript content.
2. If the transcript doesn't contain the information needed to answer, say "I don't have enough information to answer that question based on the video transcript."
3. Keep your answers concise and focused on the question.
4. Do not make up information that isn't in the transcript.
5. If asked about topics unrelated to the video, politely redirect the conversation back to the video content.`;
};
