"use server";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { createGeminiEmbeddings } from "./gemini/embeddings";
import { PineconeStore } from "@langchain/pinecone";
import { getPineconeIndex, isPineconeConfigured } from "./pinecone";
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
): Promise<{ numDocs: number; success: boolean }> {
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
      throw new Error("No content extracted from PDF");
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
 * Query documents from Pinecone
 */
export async function queryDocuments(
  query: string,
  namespace: string,
  topK: number = 5,
  apiKey?: string
): Promise<Document[]> {
  console.log(`Querying documents for: "${query}" in namespace: ${namespace}`);
  
  // Check if Pinecone is configured
  if (!(await isPineconeConfigured())) {
    console.error("Pinecone is not properly configured");
    throw new Error("Pinecone is not properly configured. Please check your environment variables.");
  }
  
  const pineconeIndex = await getPineconeIndex();
  if (!pineconeIndex) {
    throw new Error("Pinecone index is not initialized");
  }
  
  try {
    console.log("Creating Gemini embeddings for query...");
    const embeddings = await createGeminiEmbeddings({ apiKey });
    
    if (!embeddings) {
      throw new Error("Failed to create embeddings. Gemini API may not be configured properly.");
    }

    // Create vector store from existing index
    console.log(`Connecting to Pinecone index with namespace: ${namespace}...`);
    const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
      pineconeIndex,
      namespace,
    });

    // Embed the user's query into a vector
    console.log("Generating embedding for query...");
    const queryVector = await embeddings.embedQuery(query);
    console.log("Query embedding generated successfully");

    // Search for similar documents using the query vector
    console.log(`Searching for top ${topK} similar documents...`);
    const resultsWithScores = await vectorStore.similaritySearchVectorWithScore(
      queryVector,
      topK
    );
    
    console.log(`Found ${resultsWithScores.length} documents`);
    
    // Log similarity scores for debugging
    resultsWithScores.forEach(([doc, score], i) => {
      console.log(`Result ${i+1}: Score ${score.toFixed(4)}, Content: "${doc.pageContent.substring(0, 50)}..."`);
    });

    // Extract just the documents from the results
    const results = resultsWithScores.map(([doc]) => doc);

    return results;
  } catch (error) {
    console.error("Error querying documents:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to query documents: ${errorMessage}`);
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

/**
 * Check if a namespace exists in Pinecone
 */
export async function checkNamespaceExists(namespace: string): Promise<boolean> {
  // Check if Pinecone is configured
  if (!(await isPineconeConfigured())) {
    console.log("Pinecone is not properly configured, assuming namespace doesn't exist");
    return false;
  }
  
  const pineconeIndex = await getPineconeIndex();
  if (!pineconeIndex) {
    console.log("Pinecone index is not initialized, assuming namespace doesn't exist");
    return false;
  }
  
  try {
    console.log(`Checking if namespace ${namespace} exists in Pinecone...`);
    const embeddings = await createGeminiEmbeddings();
    
    if (!embeddings) {
      console.log("Failed to create embeddings, assuming namespace doesn't exist");
      return false;
    }
    
    // Try to create a vector store with the namespace
    const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
      pineconeIndex,
      namespace,
    });
    
    // If we get here, the namespace exists, but let's check if it has documents
    try {
      // Try to query with a simple placeholder
      const queryVector = await embeddings.embedQuery("test");
      const resultsWithScores = await vectorStore.similaritySearchVectorWithScore(
        queryVector,
        1
      );
      
      const exists = resultsWithScores.length > 0;
      console.log(`Namespace ${namespace} exists with documents: ${exists}`);
      return exists;
    } catch (queryError) {
      // If the query fails but the vector store was created, the namespace exists but is empty
      console.log(`Namespace ${namespace} exists but may be empty`);
      return true;
    }
  } catch (error) {
    console.log(`Namespace ${namespace} does not exist or is empty:`, error);
    return false;
  }
}