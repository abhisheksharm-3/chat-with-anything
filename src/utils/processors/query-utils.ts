/**
 * Query utilities module
 * 
 * This module contains client-side utility functions for querying and RAG.
 * These functions are not marked with "use server" and can be used on the client.
 */

/**
 * Create a system prompt for RAG
 */
export function createRagSystemPrompt(documentContent: string): string {
  return `You are a helpful assistant that answers questions based on the provided document content.
  
Here is the relevant document content to use when answering questions:

${documentContent}

When answering:
1. Only use information from the provided document content.
2. If the document doesn't contain the information needed to answer, say "I don't have enough information to answer that question based on the provided document."
3. Keep your answers concise and focused on the question.
4. Do not make up information that isn't in the document.
5. If asked about topics unrelated to the document, politely redirect the conversation back to the document content.`;
} 