"use server";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";

// Initialize embeddings with your API key
export const createGeminiEmbeddings = async (params?: {
  apiKey?: string;
  model?: string;
}) => {
  const apiKey = params?.apiKey || process.env.GEMINI_API_KEY || "";
  const model = params?.model || "text-embedding-004"; // Updated to latest model

  return new GoogleGenerativeAIEmbeddings({
    apiKey,
    model,
  });
};

// Function to get embeddings for multiple documents
export const embedDocuments = async (
  texts: string[],
  embeddings: GoogleGenerativeAIEmbeddings,
): Promise<number[][]> => {
  try {
    return await embeddings.embedDocuments(texts);
  } catch (error) {
    console.error("Error generating document embeddings:", error);
    const errorMessage =
      typeof error === "object" && error !== null && "message" in error
        ? (error as { message: string }).message
        : String(error);
    throw new Error(`Failed to generate embeddings: ${errorMessage}`);
  }
};

// Function to get embedding for a single query
export const embedQuery = async (
  text: string,
  embeddings: GoogleGenerativeAIEmbeddings,
): Promise<number[]> => {
  try {
    return await embeddings.embedQuery(text);
  } catch (error) {
    console.error("Error generating query embedding:", error);
    const errorMessage =
      typeof error === "object" && error !== null && "message" in error
        ? (error as { message: string }).message
        : String(error);
    throw new Error(`Failed to generate embedding: ${errorMessage}`);
  }
};
