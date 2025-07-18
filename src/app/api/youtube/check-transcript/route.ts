import { NextRequest, NextResponse } from 'next/server';
import { YoutubeTranscript } from 'youtube-transcript';

export const dynamic = 'force-dynamic';

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
  if (!input) return null;
  
  // If it's already just a video ID (11 characters, alphanumeric + dash/underscore)
  if (/^[a-zA-Z0-9_-]{11}$/.test(input)) {
    return input;
  }
  
  // Regular expression to match various YouTube URL formats
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/
  ];
  
  for (const pattern of patterns) {
    const match = input.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return null;
}

/**
 * API endpoint to check if a YouTube video has available transcripts
 * GET /api/youtube/check-transcript?url=YOUTUBE_URL
 * GET /api/youtube/check-transcript?videoId=VIDEO_ID
 */
export async function GET(request: NextRequest) {
  try {
    // Get the URL or video ID from the query parameters
    const { searchParams } = new URL(request.url);
    const urlParam = searchParams.get('url');
    const videoIdParam = searchParams.get('videoId');
    
    // Use whichever parameter is provided
    const input = urlParam || videoIdParam;
    
    if (!input) {
      return NextResponse.json(
        { error: 'Missing url or videoId parameter' },
        { status: 400 }
      );
    }
    
    // Extract video ID from URL or use the provided video ID
    const videoId = extractVideoId(input);
    
    if (!videoId) {
      return NextResponse.json(
        { error: 'Invalid YouTube URL or video ID' },
        { status: 400 }
      );
    }
    
    console.log(`Checking transcript availability for YouTube video: ${videoId}`);
    
    try {
      // Try to fetch the transcript
      const transcript = await YoutubeTranscript.fetchTranscript(videoId);
      
      // Check if transcript exists and has content
      const hasTranscript = transcript && transcript.length > 0;
      
      return NextResponse.json({
        available: hasTranscript,
        videoId: videoId,
        error: hasTranscript ? undefined : 'No transcript available for this video'
      });
    } catch (transcriptError) {
      console.error("Error fetching transcript:", transcriptError);
      
      return NextResponse.json({
        available: false,
        videoId: videoId,
        error: 'No transcript available for this video. The video might not have captions, or they might be disabled.'
      });
    }
  } catch (error) {
    console.error('Error checking YouTube transcript:', error);
    
    return NextResponse.json(
      { 
        available: false,
        error: error instanceof Error ? error.message : 'Unknown error checking transcript availability' 
      },
      { status: 500 }
    );
  }
}