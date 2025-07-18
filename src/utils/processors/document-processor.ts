"use server";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { createGeminiEmbeddings } from "../gemini/embeddings";
import { PineconeStore } from "@langchain/pinecone";
import { getPineconeIndex, isPineconeConfigured } from "../pinecone";
import { Document } from "langchain/document";

// Constants for document processing
const CHUNK_SIZE = 1000;
const CHUNK_OVERLAP = 200;
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

/**
 * Process a PDF file and store its embeddings in Pinecone
 */
export async function processPdfDocument(
  fileBlob: Blob,
  namespace: string,
  apiKey?: string
): Promise<{ numDocs: number; success: boolean; error?: string }> {
  console.log(`Starting PDF processing for namespace: ${namespace}`);
  
  // Check if Pinecone is configured
  if (!(await isPineconeConfigured())) {
    console.error("Pinecone is not properly configured");
    throw new Error("Pinecone is not properly configured. Please check your environment variables.");
  }
  
  try {
    // Load PDF and extract text
    console.log("Loading PDF document...");
    const loader = new PDFLoader(fileBlob);
    const docs = await loader.load();
    
    if (!docs || docs.length === 0) {
      console.error("No content extracted from PDF");
      return {
        numDocs: 0,
        success: false,
        error: "No text content could be extracted from this PDF. The file might be empty, scanned, or protected."
      };
    }
    
    console.log(`Successfully extracted ${docs.length} pages from PDF`);

    // Split the documents into chunks
    console.log(`Splitting document into chunks (size: ${CHUNK_SIZE}, overlap: ${CHUNK_OVERLAP})...`);
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: CHUNK_SIZE,
      chunkOverlap: CHUNK_OVERLAP,
    });
    const chunkedDocs = await textSplitter.splitDocuments(docs);
    console.log(`Document split into ${chunkedDocs.length} chunks`);

    // Create embeddings using Gemini
    console.log("Creating Gemini embeddings...");
    const embeddings = await createGeminiEmbeddings({ apiKey });
    
    if (!embeddings) {
      throw new Error("Failed to create embeddings. Gemini API may not be configured properly.");
    }

    // Store documents in Pinecone with retry logic
    console.log(`Storing documents in Pinecone with namespace: ${namespace}...`);
    
    let retryCount = 0;
    let success = false;
    
    while (retryCount < MAX_RETRIES && !success) {
      try {
        const pineconeIndex = await getPineconeIndex();
        if (!pineconeIndex) {
          throw new Error("Pinecone index is not initialized");
        }
        
        // First, check if there are any existing vectors in this namespace
        try {
          const stats = await pineconeIndex.describeIndexStats();
          console.log("Pinecone index stats:", JSON.stringify(stats));
        } catch (statsError) {
          console.warn("Could not get index stats:", statsError);
          // Continue anyway, this is just for debugging
        }
        
        // Store the documents
        await PineconeStore.fromDocuments(chunkedDocs, embeddings, {
          pineconeIndex,
          namespace,
        });
        
        success = true;
        console.log(`Successfully stored ${chunkedDocs.length} document chunks in Pinecone`);
      } catch (storeError) {
        retryCount++;
        console.error(`Error storing documents in Pinecone (attempt ${retryCount}/${MAX_RETRIES}):`, storeError);
        
        if (retryCount < MAX_RETRIES) {
          console.log(`Retrying in ${RETRY_DELAY}ms...`);
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        } else {
          throw storeError;
        }
      }
    }

    return {
      numDocs: chunkedDocs.length,
      success: true,
    };
  } catch (error) {
    console.error("Error processing PDF document:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to process PDF: ${errorMessage}`);
  }
}

/**
 * Process a generic document (docs, sheets, slides)
 * Currently this is a placeholder that will be expanded as needed
 */
export async function processGenericDocument(
  fileBlob: Blob,
  namespace: string,
  documentType: string,
  apiKey?: string
): Promise<{ numDocs: number; success: boolean; error?: string }> {
  console.log(`Starting ${documentType} processing for namespace: ${namespace}`);
  
  // Check if Pinecone is configured
  if (!(await isPineconeConfigured())) {
    console.error("Pinecone is not properly configured");
    throw new Error("Pinecone is not properly configured. Please check your environment variables.");
  }
  
  try {
    // For now, we'll just extract text from the blob and create a document
    // In the future, we can add specific loaders for different document types
    const text = await fileBlob.text();
    
    if (!text || text.trim().length === 0) {
      console.error(`No content extracted from ${documentType}`);
      return {
        numDocs: 0,
        success: false,
        error: `No text content could be extracted from this ${documentType}. The file might be empty or in an unsupported format.`
      };
    }
    
    console.log(`Successfully extracted text from ${documentType}`);
    
    // Create a document from the text
    const docs = [
      new Document({
        pageContent: text,
        metadata: { source: namespace, type: documentType }
      })
    ];
    
    // Split the documents into chunks
    console.log(`Splitting document into chunks (size: ${CHUNK_SIZE}, overlap: ${CHUNK_OVERLAP})...`);
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: CHUNK_SIZE,
      chunkOverlap: CHUNK_OVERLAP,
    });
    const chunkedDocs = await textSplitter.splitDocuments(docs);
    console.log(`Document split into ${chunkedDocs.length} chunks`);
    
    // Create embeddings using Gemini
    console.log("Creating Gemini embeddings...");
    const embeddings = await createGeminiEmbeddings({ apiKey });
    
    if (!embeddings) {
      throw new Error("Failed to create embeddings. Gemini API may not be configured properly.");
    }
    
    // Store documents in Pinecone with retry logic
    console.log(`Storing document chunks in Pinecone with namespace: ${namespace}...`);
    
    let retryCount = 0;
    let success = false;
    
    while (retryCount < MAX_RETRIES && !success) {
      try {
        const pineconeIndex = await getPineconeIndex();
        if (!pineconeIndex) {
          throw new Error("Pinecone index is not initialized");
        }
        
        // First, check if there are any existing vectors in this namespace
        try {
          const stats = await pineconeIndex.describeIndexStats();
          console.log("Pinecone index stats:", JSON.stringify(stats));
        } catch (statsError) {
          console.warn("Could not get index stats:", statsError);
          // Continue anyway, this is just for debugging
        }
        
        // Store the documents
        await PineconeStore.fromDocuments(chunkedDocs, embeddings, {
          pineconeIndex,
          namespace,
        });
        
        success = true;
        console.log(`Successfully stored ${chunkedDocs.length} document chunks in Pinecone`);
      } catch (storeError) {
        retryCount++;
        console.error(`Error storing document in Pinecone (attempt ${retryCount}/${MAX_RETRIES}):`, storeError);
        
        if (retryCount < MAX_RETRIES) {
          console.log(`Retrying in ${RETRY_DELAY}ms...`);
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        } else {
          throw storeError;
        }
      }
    }
    
    return {
      numDocs: chunkedDocs.length,
      success: true,
    };
  } catch (error) {
    console.error(`Error processing ${documentType}:`, error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to process ${documentType}: ${errorMessage}`);
  }
}

/**
 * Extract text from a PDF file
 */
export async function extractTextFromPdf(fileBlob: Blob): Promise<string> {
  console.log("Extracting text from PDF...");
  
  try {
    const loader = new PDFLoader(fileBlob);
    const docs = await loader.load();
    
    if (!docs || docs.length === 0) {
      console.log("No content extracted from PDF");
      return "";
    }

    console.log(`Successfully extracted text from ${docs.length} pages`);
    
    // Combine all page content
    const combinedText = docs.map((doc) => doc.pageContent).join("\n\n");
    console.log(`Total extracted text length: ${combinedText.length} characters`);
    
    return combinedText;
  } catch (error) {
    console.error("Error extracting text from PDF:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to extract text from PDF: ${errorMessage}`);
  }
} 