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
export const getGeminiModel = () => genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Check if the API is configured
export const isConfigured = () => !!API_KEY;

// Function to create a chat session
export const createChatSession = () => {
  const model = getGeminiModel();
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
    history: [],
  });
};

// Function to send a message to Gemini
export const sendMessageToGemini = async (messages: ChatMessage[], fileContent?: string) => {
  try {
    if (!isConfigured()) {
      throw new Error("Gemini API key is not configured");
    }

    // Create chat session
    const chat = createChatSession();

    // Add file content as system message if provided
    if (fileContent) {
      await chat.sendMessage([
        {
          text: `Here is the content of the file I want to chat about. Please use this information to answer my questions:\n\n${fileContent}`,
        },
      ]);
    }

    // Process chat messages
    const formattedMessages = messages.map(msg => ({
      text: msg.content
    }));

    // Send the last user message to get a response
    const lastUserMessage = formattedMessages[formattedMessages.length - 1];
    const result = await chat.sendMessage([lastUserMessage]);

    const response = result.response;
    return response.text();
  } catch (error) {
    console.error("Error in Gemini chat:", error);
    throw new Error("Failed to get response from Gemini");
  }
}; 