"use server";

import { Pinecone } from "@pinecone-database/pinecone";
import { Index } from "@pinecone-database/pinecone";

// Singleton instance
let pineconeClientInstance: Pinecone | null = null;
let pineconeIndexInstance: Index | null = null;

// Get Pinecone client using singleton pattern
export async function getPineconeClient() {
  if (pineconeClientInstance) return pineconeClientInstance;

  const PINECONE_API_KEY = process.env.PINECONE_API_KEY ?? "";

  if (!PINECONE_API_KEY) {
    console.error("PINECONE_API_KEY environment variable is not set");
    return null;
  }

  try {
    pineconeClientInstance = new Pinecone({
      apiKey: PINECONE_API_KEY,
    });
    return pineconeClientInstance;
  } catch (error) {
    console.error("Failed to initialize Pinecone client:", error);
    return null;
  }
}

// Get Pinecone index using singleton pattern
export async function getPineconeIndex() {
  if (pineconeIndexInstance) return pineconeIndexInstance;

  const client = await getPineconeClient();
  if (!client) return null;

  const PINECONE_INDEX_NAME = process.env.PINECONE_INDEX_NAME ?? "";

  if (!PINECONE_INDEX_NAME) {
    console.error("PINECONE_INDEX_NAME environment variable is not set");
    return null;
  }

  console.log(`Initializing Pinecone with index: ${PINECONE_INDEX_NAME}`);

  try {
    pineconeIndexInstance = client.Index(PINECONE_INDEX_NAME);
    console.log("Pinecone index initialized successfully");
    return pineconeIndexInstance;
  } catch (error) {
    console.error("Failed to initialize Pinecone index:", error);
    return null;
  }
}

// Helper function to check if Pinecone is properly configured
export async function isPineconeConfigured(): Promise<boolean> {
  const PINECONE_API_KEY = process.env.PINECONE_API_KEY ?? "";
  const PINECONE_INDEX_NAME = process.env.PINECONE_INDEX_NAME ?? "";
  return !!PINECONE_API_KEY && !!PINECONE_INDEX_NAME;
}
