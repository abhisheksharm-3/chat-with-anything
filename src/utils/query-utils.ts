/**
 * Query utilities module
 *
 * This module contains client-side utility functions for querying and RAG.
 * These functions are not marked with "use server" and can be used on the client.
 */

/**
 * Generates a system prompt for a Retrieval-Augmented Generation (RAG) model.
 * The prompt instructs the model on how to answer questions based *only* on the provided document content.
 *
 * @param {string} documentContent - The relevant document content to be injected into the prompt.
 * @returns {string} The complete system prompt string, ready to be sent to the AI model.
 */
export const createRagSystemPrompt = (documentContent: string): string => {
  return `**Role:** You are an expert Q&A assistant.
**Task:** Answer the user's question based *exclusively* on the provided document content.

**Document Content:**
---
${documentContent}
---

**Rules for Answering:**
1.  **Strictly Adhere to the Document:** Your answer must be based solely on the information found in the "Document Content" section above. Do not use any external knowledge or make assumptions.
2.  **Handle Insufficient Information:** If the document does not contain the necessary information to answer the question, you must respond with the exact phrase: "I am sorry, but the provided document does not contain enough information to answer that question."
3.  **Be Concise:** Provide a direct and concise answer. Avoid unnecessary elaboration.
4.  **Do Not Fabricate:** Never invent information. If the document doesn't state it, you don't know it.
5.  **Stay on Topic:** If the user's question is unrelated to the document, politely state that you can only answer questions about the provided content.`;
};