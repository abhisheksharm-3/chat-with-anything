import { NextRequest, NextResponse } from 'next/server';
import { YoutubeTranscript } from 'youtube-transcript';

export const dynamic = 'force-dynamic';

// Define error types for better type safety
interface APIError {
  type: 'missing_parameter' | 'invalid_input' | 'no_transcript' | 'transcript_fetch_error' | 'internal_error';
  message: string;
}

interface APIResponse {
  available: boolean;
  videoId?: string;
  error?: APIError;
}

/**
 * Extracts video ID from various YouTube URL formats
 * Supports:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://youtube.com/watch?v=VIDEO_ID
 * - https://m.youtube.com/watch?v=VIDEO_ID
 * - Or just the video ID itself
 */
function extractVideoId(input: string): string | null {
  if (!input?.trim()) return null;
  
  const trimmedInput = input.trim();
  
  // If it's already just a video ID (11 characters, alphanumeric + dash/underscore)
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmedInput)) {
    return trimmedInput;
  }
  
  // Regular expression to match various YouTube URL formats
  const patterns = [
    // Standard watch URLs
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/,
    // Short URLs
    /(?:https?:\/\/)?youtu\.be\/([a-zA-Z0-9_-]{11})/,
    // Embed URLs
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
    // Old format
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/v\/([a-zA-Z0-9_-]{11})/,
    // Mobile URLs
    /(?:https?:\/\/)?m\.youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/
  ];
  
  for (const pattern of patterns) {
    const match = trimmedInput.match(pattern);
    if (match?.[1]) {
      return match[1];
    }
  }
  
  return null;
}

/**
 * Creates a standardized error response
 */
function createErrorResponse(error: APIError, status: number = 400): NextResponse {
  const response: APIResponse = {
    available: false,
    error
  };
  
  return NextResponse.json(response, { status });
}

/**
 * Creates a standardized success response
 */
function createSuccessResponse(videoId: string, available: boolean, error?: APIError): NextResponse {
  const response: APIResponse = {
    available,
    videoId,
    ...(error && { error })
  };
  
  return NextResponse.json(response);
}

/**
 * API endpoint to check if a YouTube video has available transcripts
 * GET /api/youtube/check-transcript?url=YOUTUBE_URL
 * GET /api/youtube/check-transcript?videoId=VIDEO_ID
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const urlParam = searchParams.get('url');
    const videoIdParam = searchParams.get('videoId');
    
    // Use whichever parameter is provided, prioritizing videoId
    const input = videoIdParam || urlParam;
    
    if (!input) {
      return createErrorResponse({
        type: 'missing_parameter',
        message: 'Missing required parameter: url or videoId'
      });
    }
    
    // Extract video ID from URL or use the provided video ID
    const videoId = extractVideoId(input);
    
    if (!videoId) {
      return createErrorResponse({
        type: 'invalid_input',
        message: 'Invalid YouTube URL or video ID format'
      });
    }
    
    console.log(`Checking transcript availability for YouTube video: ${videoId}`);
    
    try {
      // Try to fetch the transcript
      const transcript = await YoutubeTranscript.fetchTranscript(videoId);
      
      // Check if transcript exists and has meaningful content
      const hasTranscript = Array.isArray(transcript) && transcript.length > 0;
      
      if (hasTranscript) {
        console.log(`Transcript found for video ${videoId}: ${transcript.length} segments`);
        return createSuccessResponse(videoId, true);
      } else {
        console.log(`No transcript segments found for video ${videoId}`);
        return createSuccessResponse(videoId, false, {
          type: 'no_transcript',
          message: 'No transcript available for this video'
        });
      }
      
    } catch (transcriptError: unknown) {
      console.error(`Error fetching transcript for video ${videoId}:`, transcriptError);
      
      // Handle different types of transcript errors
      let errorMessage = 'No transcript available for this video';
      
      if (transcriptError instanceof Error) {
        const errorMsg = transcriptError.message.toLowerCase();
        
        if (errorMsg.includes('video unavailable') || errorMsg.includes('not found')) {
          errorMessage = 'Video not found or unavailable';
        } else if (errorMsg.includes('transcript') && errorMsg.includes('disabled')) {
          errorMessage = 'Transcripts are disabled for this video';
        } else if (errorMsg.includes('private') || errorMsg.includes('restricted')) {
          errorMessage = 'Video is private or restricted';
        } else {
          errorMessage = `Transcript fetch failed: ${transcriptError.message}`;
        }
      }
      
      return createSuccessResponse(videoId, false, {
        type: 'transcript_fetch_error',
        message: errorMessage
      });
    }
    
  } catch (error) {
    console.error('Unexpected error in YouTube transcript check:', error);
    
    return createErrorResponse({
      type: 'internal_error',
      message: error instanceof Error ? error.message : 'An unexpected error occurred'
    }, 500);
  }
}