"use server";

import { createGeminiEmbeddings } from "../gemini/embeddings";
import { PineconeStore } from "@langchain/pinecone";
import { getPineconeIndex, isPineconeConfigured } from "../pinecone";
import { Document } from "langchain/document";

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
    // First, check if there are any vectors in this namespace
    let namespaceExists = false;
    try {
      const stats = await pineconeIndex.describeIndexStats();
      console.log("Pinecone index stats:", JSON.stringify(stats));
      
      // Check if this namespace exists and has records
      const namespaces = stats.namespaces || {};
      if (namespaces[namespace] && namespaces[namespace].recordCount > 0) {
        console.log(`Found ${namespaces[namespace].recordCount} vectors in namespace ${namespace}`);
        namespaceExists = true;
      } else {
        // Even if not found in stats, we'll still try to query
        // Sometimes namespaces don't show up in stats right away
        console.log(`Namespace ${namespace} not found in stats or has 0 records, will try querying anyway`);
      }
    } catch (statsError) {
      console.warn("Could not get index stats:", statsError);
      // Continue anyway, this is just for debugging
    }
    
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
    
    if (resultsWithScores.length === 0) {
      console.warn("No documents found in the search results. This may indicate an issue with the index.");
      // Try to list some vectors to see if the namespace exists but search is failing
      try {
        // This is a simplified approach - in a real app you might want to implement
        // a more sophisticated diagnostic tool
        console.log("Attempting to diagnose empty results...");
        // You could add additional diagnostic code here
      } catch (diagError) {
        console.error("Error during diagnostics:", diagError);
      }
    }
    
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
    
    // First try to check via describeIndexStats
    try {
      const stats = await pineconeIndex.describeIndexStats();
      const namespaces = stats.namespaces || {};
      
      if (namespaces[namespace] && namespaces[namespace].recordCount > 0) {
        console.log(`Namespace ${namespace} exists with ${namespaces[namespace].recordCount} vectors`);
        return true;
      } else {
        console.log(`Namespace ${namespace} not found in stats or has 0 records, will try direct query`);
        // Continue with the fallback method even if not found in stats
        // Sometimes namespaces don't show up in stats right away
      }
    } catch (statsError) {
      console.warn("Could not get index stats:", statsError);
      // Continue with the fallback method
    }
    
    // Fallback method using embeddings and query
    const embeddings = await createGeminiEmbeddings();
    
    if (!embeddings) {
      console.log("Failed to create embeddings, assuming namespace doesn't exist");
      return false;
    }
    
    // Try to create a vector store with the namespace
    try {
      const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
        pineconeIndex,
        namespace,
      });
      
      // If we get here without error, the namespace exists
      // Let's try a simple query to see if it has documents
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
    } catch (vectorStoreError) {
      // If we can't create the vector store, the namespace doesn't exist
      console.log(`Namespace ${namespace} does not exist:`, vectorStoreError);
      return false;
    }
  } catch (error) {
    console.log(`Error checking if namespace ${namespace} exists:`, error);
    return false;
  }
} 