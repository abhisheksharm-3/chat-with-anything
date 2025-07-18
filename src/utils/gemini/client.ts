import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

// Initialize the Gemini API with the API key from environment variables
// Use server-side environment variable instead of NEXT_PUBLIC
const API_KEY = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);

export interface ChatMessage {
  role: "user" | "model";
  content: string;
}

// Get the Gemini model
export const getGeminiModel = () => genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

// Check if the API is configured
export const isConfigured = () => !!API_KEY;

// Function to create a chat session
export const createChatSession = () => {
  const model = getGeminiModel();
  
  // Create chat without any history - we'll handle system prompts differently
  return model.startChat({
    generationConfig: {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 8192,
    },
    safetySettings: [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
    ],
    history: [], // Always start with empty history
  });
};

// Function to create a system prompt for RAG
export const createRagSystemPrompt = (documentContent: string): string => {
  return `You are a helpful assistant that answers questions based on the provided document content.
  
Here is the relevant document content to use when answering questions:

${documentContent}

When answering:
1. Only use information from the provided document content.
2. If the document doesn't contain the information needed to answer, say "I don't have enough information to answer that question based on the provided document."
3. Keep your answers concise and focused on the question.
4. Do not make up information that isn't in the document.
5. If asked about topics unrelated to the document, politely redirect the conversation back to the document content.`;
};

// Function to send a message to Gemini
export const sendMessageToGemini = async (messages: ChatMessage[], fileContent?: string) => {
  try {
    if (!isConfigured()) {
      throw new Error("Gemini API key is not configured");
    }

    console.log("Sending message to Gemini...");
    console.log(`Has file content: ${!!fileContent}`);
    console.log(`Number of messages: ${messages.length}`);
    
    // Create chat session (always with empty history)
    const chat = createChatSession();
    
    // If we have file content, send it as a user message first
    if (fileContent) {
      console.log("Creating RAG context with document content");
      const systemPrompt = createRagSystemPrompt(fileContent);
      
      // Send the system prompt as a user message first
      const systemResult = await chat.sendMessage([
        {
          text: "I need you to act as a document assistant with the following instructions: " + systemPrompt
        }
      ]);
      
      // Get the response to acknowledge the system prompt
      const systemResponse = systemResult.response;
      console.log("System prompt acknowledged:", systemResponse.text().substring(0, 50) + "...");
    }
    
    // Process previous messages if there are any (excluding the last one)
    if (messages.length > 1) {
      for (let i = 0; i < messages.length - 1; i++) {
        const msg = messages[i];
        const result = await chat.sendMessage([{ text: msg.content }]);
        // We get the response but don't need to do anything with it
        result.response.text();
      }
    }

    // Send the last user message to get a response
    const lastUserMessage = messages[messages.length - 1];
    console.log("Sending user message to Gemini:", lastUserMessage.content.substring(0, 50) + "...");
    
    const result = await chat.sendMessage([{ text: lastUserMessage.content }]);
    const response = result.response;
    
    console.log("Received response from Gemini");
    return response.text();
  } catch (error) {
    console.error("Error in Gemini chat:", error);
    throw new Error("Failed to get response from Gemini");
  }
};