import { NextRequest, NextResponse } from 'next/server';
import { YoutubeTranscript } from 'youtube-transcript';

export const dynamic = 'force-dynamic';

/**
 * API endpoint to check if a YouTube video has available transcripts
 * GET /api/youtube/check-transcript?videoId=VIDEO_ID
 */
export async function GET(request: NextRequest) {
  try {
    // Get the video ID from the query parameters
    const { searchParams } = new URL(request.url);
    const videoId = searchParams.get('videoId');
    
    if (!videoId) {
      return NextResponse.json(
        { error: 'Missing videoId parameter' },
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
        error: hasTranscript ? undefined : 'No transcript available for this video'
      });
    } catch (transcriptError) {
      console.error("Error fetching transcript:", transcriptError);
      
      return NextResponse.json({
        available: false,
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