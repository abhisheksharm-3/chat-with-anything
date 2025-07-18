"use server";

import { YoutubeTranscript } from 'youtube-transcript';
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { createGeminiEmbeddings } from "../gemini/embeddings";
import { PineconeStore } from "@langchain/pinecone";
import { getPineconeIndex, isPineconeConfigured } from "../pinecone";
import { Document } from "langchain/document";
import { extractYoutubeVideoId } from "../gemini/youtube-utils";
import { supabaseBrowserClient } from "../supabase/client";

// Constants for transcript processing
const CHUNK_SIZE = 1000;
const CHUNK_OVERLAP = 200;
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

/**
 * Process YouTube video transcript and store its embeddings in Pinecone
 */
export async function processYoutubeVideo(
  videoUrl: string,
  namespace: string,
  apiKey?: string
): Promise<{ numDocs: number; success: boolean; error?: string }> {
  console.log(`Starting YouTube transcript processing for namespace: ${namespace}`);
  const supabase = supabaseBrowserClient();
  
  // Check if Pinecone is configured
  if (!(await isPineconeConfigured())) {
    console.error("Pinecone is not properly configured");
    throw new Error("Pinecone is not properly configured. Please check your environment variables.");
  }
  
  try {
    // Update processing status to 'processing'
    await supabase
      .from("files")
      .update({ processing_status: 'processing' })
      .eq("id", namespace);
      
    // Extract video ID from URL
    const videoId = extractYoutubeVideoId(videoUrl);
    if (!videoId) {
      // Update processing status to 'failed'
      await supabase
        .from("files")
        .update({ 
          processing_status: 'failed',
          processing_error: 'Invalid YouTube URL. Could not extract video ID.'
        })
        .eq("id", namespace);
        
      throw new Error("Invalid YouTube URL. Could not extract video ID.");
    }
    
    // Fetch transcript
    console.log(`Fetching transcript for YouTube video: ${videoId}`);
    let transcript;
    
    try {
      transcript = await YoutubeTranscript.fetchTranscript(videoId);
    } catch (transcriptError) {
      console.error("Error fetching transcript:", transcriptError);
      
      // Update processing status to 'failed'
      await supabase
        .from("files")
        .update({ 
          processing_status: 'failed',
          processing_error: 'No transcript available for this YouTube video. The video might not have captions, or they might be disabled.'
        })
        .eq("id", namespace);
        
      return {
        numDocs: 0,
        success: false,
        error: "No transcript available for this YouTube video. The video might not have captions, or they might be disabled."
      };
    }
    
    if (!transcript || transcript.length === 0) {
      console.error("No transcript available for this YouTube video");
      
      // Update processing status to 'failed'
      await supabase
        .from("files")
        .update({ 
          processing_status: 'failed',
          processing_error: 'No transcript available for this YouTube video. The video might not have captions, or they might be disabled.'
        })
        .eq("id", namespace);
        
      return {
        numDocs: 0,
        success: false,
        error: "No transcript available for this YouTube video. The video might not have captions, or they might be disabled."
      };
    }
    
    // Combine transcript parts into a single text
    const transcriptText = transcript
      .map(item => item.text)
      .join(" ");
    
    console.log(`Successfully extracted transcript with ${transcriptText.length} characters`);
    
    // Create document from transcript
    const docs = [
      new Document({
        pageContent: transcriptText,
        metadata: { source: videoUrl, type: "youtube" }
      })
    ];
    
    // Split the documents into chunks
    console.log(`Splitting transcript into chunks (size: ${CHUNK_SIZE}, overlap: ${CHUNK_OVERLAP})...`);
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: CHUNK_SIZE,
      chunkOverlap: CHUNK_OVERLAP,
    });
    const chunkedDocs = await textSplitter.splitDocuments(docs);
    console.log(`Transcript split into ${chunkedDocs.length} chunks`);
    
    // Create embeddings using Gemini
    console.log("Creating Gemini embeddings...");
    const embeddings = await createGeminiEmbeddings({ apiKey });
    
    if (!embeddings) {
      // Update processing status to 'failed'
      await supabase
        .from("files")
        .update({ 
          processing_status: 'failed',
          processing_error: 'Failed to create embeddings. Gemini API may not be configured properly.'
        })
        .eq("id", namespace);
        
      throw new Error("Failed to create embeddings. Gemini API may not be configured properly.");
    }
    
    // Store documents in Pinecone with retry logic
    console.log(`Storing transcript chunks in Pinecone with namespace: ${namespace}...`);
    
    let retryCount = 0;
    let success = false;
    
    while (retryCount < MAX_RETRIES && !success) {
      try {
        const pineconeIndex = await getPineconeIndex();
        if (!pineconeIndex) {
          throw new Error("Pinecone index is not initialized");
        }
        
        await PineconeStore.fromDocuments(chunkedDocs, embeddings, {
          pineconeIndex,
          namespace,
        });
        success = true;
        console.log(`Successfully stored ${chunkedDocs.length} transcript chunks in Pinecone`);
      } catch (storeError) {
        retryCount++;
        console.error(`Error storing transcript in Pinecone (attempt ${retryCount}/${MAX_RETRIES}):`, storeError);
        
        if (retryCount < MAX_RETRIES) {
          console.log(`Retrying in ${RETRY_DELAY}ms...`);
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        } else {
          // Update processing status to 'failed'
          await supabase
            .from("files")
            .update({ 
              processing_status: 'failed',
              processing_error: `Failed to store transcript in Pinecone: ${storeError instanceof Error ? storeError.message : String(storeError)}`
            })
            .eq("id", namespace);
            
          throw storeError;
        }
      }
    }
    
    // Update processing status to 'completed'
    await supabase
      .from("files")
      .update({ 
        processing_status: 'completed',
        indexed_chunks: chunkedDocs.length,
        full_text: transcriptText // Store the transcript text for future use
      })
      .eq("id", namespace);
      
    return {
      numDocs: chunkedDocs.length,
      success: true,
    };
  } catch (error) {
    console.error("Error processing YouTube video:", error);
    
    // Update processing status to 'failed' if not already done
    try {
      await supabase
        .from("files")
        .update({ 
          processing_status: 'failed',
          processing_error: error instanceof Error ? error.message : String(error)
        })
        .eq("id", namespace);
    } catch (updateError) {
      console.error("Error updating processing status:", updateError);
    }
    
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to process YouTube video: ${errorMessage}`);
  }
}

/**
 * Get YouTube video information
 * This is a placeholder for future expansion
 */
export async function getYoutubeVideoInfo(videoId: string): Promise<{ title: string; channel: string; duration: number }> {
  // In a real implementation, this would use the YouTube API
  // For now, we'll just return placeholder data
  return {
    title: `YouTube Video ${videoId}`,
    channel: 'Unknown Channel',
    duration: 0
  };
}