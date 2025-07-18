/**
 * YouTube utilities module
 * 
 * This module contains client-side utility functions for working with YouTube videos.
 * These functions are not marked with "use server" and can be used on the client.
 */

/**
 * Helper function to extract YouTube video ID from URL
 */
export function extractYoutubeVideoId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

/**
 * Check if a URL is a YouTube URL
 */
export function isYoutubeUrl(url: string): boolean {
  return url.includes('youtube.com') || url.includes('youtu.be');
}

/**
 * Check if a YouTube video has available transcripts
 * This is a client-side function that calls the server-side function
 */
export async function checkYoutubeTranscriptAvailability(url: string): Promise<{ available: boolean; error?: string }> {
  try {
    // Extract video ID from URL
    const videoId = extractYoutubeVideoId(url);
    if (!videoId) {
      return { 
        available: false, 
        error: "Invalid YouTube URL. Could not extract video ID." 
      };
    }
    
    // Call the server action to check transcript availability
    const response = await fetch(`/api/youtube/check-transcript?videoId=${videoId}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      return { 
        available: false, 
        error: errorData.error || "Failed to check transcript availability" 
      };
    }
    
    const data = await response.json();
    return { 
      available: data.available,
      error: data.error
    };
  } catch (error) {
    console.error("Error checking YouTube transcript availability:", error);
    return { 
      available: false, 
      error: error instanceof Error ? error.message : "Unknown error checking transcript availability"
    };
  }
}

/**
 * Create a system prompt for YouTube videos
 */
export function createYoutubeSystemPrompt(transcriptContent: string): string {
  return `You are a helpful assistant that answers questions about a YouTube video based on its transcript.
  
Here is the relevant transcript content to use when answering questions:

${transcriptContent}

When answering:
1. Only use information from the provided transcript content.
2. If the transcript doesn't contain the information needed to answer, say "I don't have enough information to answer that question based on the video transcript."
3. Keep your answers concise and focused on the question.
4. Do not make up information that isn't in the transcript.
5. If asked about topics unrelated to the video, politely redirect the conversation back to the video content.`;
} 