"use server";

import { revalidatePath } from "next/cache";
import { ChatMessage, sendMessageToGemini, isConfigured } from "@/utils/gemini/client";
import { redirect } from "next/navigation";
import { supabaseBrowserClient } from "@/utils/supabase/client";
import { queryDocuments, checkNamespaceExists } from "@/utils/document-processor";
import { Document } from "langchain/document";

// Function to get file content from Supabase storage
async function getFileContent(fileId: string) {
  const supabase = supabaseBrowserClient();
  
  // First get the file metadata from the database without filtering by user_id
  console.log("Getting file content for fileId:", fileId);
  const { data: file, error: fileError } = await supabase
    .from("files")
    .select("*")
    .eq("id", fileId)
    .single();
  
  if (fileError || !file) {
    console.error("Error fetching file metadata:", fileError);
    return null;
  }

  console.log("File data for content extraction:", file);

  // For URL type files, return the URL directly
  if (file.type === 'web' || file.type === 'youtube' || file.type === 'url') {
    console.log("Returning URL as content:", file.url);
    return file.url;
  }
  
  // If we already have extracted text, use that
  if (file.full_text) {
    console.log("Using pre-extracted text");
    return file.full_text;
  }
  
  // For PDF files, try to query from Pinecone
  if (file.type === 'pdf') {
    try {
      console.log("Checking if PDF content exists in Pinecone");
      const namespaceExists = await checkNamespaceExists(file.id);
      
      if (namespaceExists) {
        console.log("PDF content found in Pinecone, returning placeholder");
        // Return a placeholder - the actual content will be retrieved during query
        return "PDF content will be retrieved from Pinecone during query";
      } else {
        console.log("PDF content not found in Pinecone");
      }
    } catch (pineconeError) {
      console.error("Error checking Pinecone:", pineconeError);
      // Continue to try other methods if Pinecone check fails
    }
  }
  
  // For other file types, get the content from storage
  try {
    // Try different path formats
    let data;
    
    // Try with direct URL if available
    if (file.url && file.url.includes('file-storage')) {
      try {
        // Extract path from URL
        const urlObj = new URL(file.url);
        const pathMatch = urlObj.pathname.match(/\/file-storage\/([^?]+)/);
        const filePath = pathMatch ? pathMatch[1] : null;
        
        if (filePath) {
          console.log("Trying to download using path from URL:", filePath);
          const result = await supabase.storage
            .from("file-storage")
            .download(filePath);
            
          if (!result.error && result.data) {
            data = result.data;
          }
        }
      } catch (urlError) {
        console.error("Error extracting path from URL:", urlError);
      }
    }
    
    // If that failed, try alternative paths
    if (!data) {
      // Try with user_id/filename format (if we have user_id)
      if (file.user_id) {
        const filePath1 = `${file.user_id}/${Date.now()}_${file.name}`;
        console.log("Trying path 1:", filePath1);
        const result1 = await supabase.storage
          .from("file-storage")
          .download(filePath1);
          
        if (!result1.error && result1.data) {
          data = result1.data;
        }
      }
      
      // If still no data, try with just the file ID
      if (!data) {
        // Try with various path formats
        const possiblePaths = [
          `${file.user_id || 'unknown'}/${file.id}`,
          `${file.id}`,
          `uploads/${file.id}`,
          `${file.name}`
        ];
        
        for (const path of possiblePaths) {
          console.log(`Trying path: ${path}`);
          const result = await supabase.storage
            .from("file-storage")
            .download(path);
            
          if (!result.error && result.data) {
            data = result.data;
            break;
          }
        }
        
        // If we still don't have data and have a URL, try to fetch it
        if (!data && file.url && (file.url.startsWith('http://') || file.url.startsWith('https://'))) {
          console.log("Trying to fetch from URL:", file.url);
          try {
            const response = await fetch(file.url);
            if (response.ok) {
              return await response.text();
            }
          } catch (fetchError) {
            console.error("Error fetching from URL:", fetchError);
          }
        }
        
        if (!data) {
          console.error("All download attempts failed");
          return "Unable to extract content from this file.";
        }
      }
    }
    
    // Convert blob to text
    const content = await data.text();
    return content;
  } catch (downloadError) {
    console.error("Error downloading file:", downloadError);
    return "Error extracting content from this file.";
  }
}

// Create a new chat
export async function createChat(fileId: string, userId?: string) {
  console.log("createChat called with:", { fileId, userId });
  
  // Check if Gemini API is configured
  if (!isConfigured()) {
    console.error("Gemini API not configured");
    throw new Error("Gemini API is not configured. Please set the GEMINI_API_KEY environment variable.");
  }

  // Use the userId passed from the client component
  if (!userId) {
    console.error("No userId provided to createChat");
    throw new Error("Authentication required. Please log in to continue.");
  }
  
  const supabase = supabaseBrowserClient();
  
  try {
    // First check if the file exists without any user_id filter
    console.log("Checking if file exists with ID:", fileId);
    const { data: fileCheck, error: fileCheckError } = await supabase
      .from("files")
      .select("id, user_id, name, type")
      .eq("id", fileId)
      .maybeSingle();
    
    if (fileCheckError) {
      console.error("Error checking file existence:", fileCheckError);
      throw new Error(`Error checking file: ${fileCheckError.message}`);
    }
    
    if (!fileCheck) {
      console.error("File not found in database:", fileId);
      throw new Error(`File not found with ID: ${fileId}`);
    }
    
    console.log("File found:", fileCheck);
    
    // Use the file we already found instead of querying again with user_id filter
    const file = fileCheck;
    
    // Create a new chat in the database
    console.log("Creating chat with user_id:", userId);
    const { data: chat, error: chatError } = await supabase
      .from("chats")
      .insert({
        user_id: userId,
        file_id: fileId,
        title: `Chat about ${file.name || 'file'}`,
        type: file.type,
      })
      .select()
      .single();
    
    if (chatError) {
      console.error("Error creating chat:", chatError);
      throw new Error(`Failed to create chat: ${chatError.message}`);
    }
    
    if (!chat) {
      console.error("No chat data returned after creation");
      throw new Error("Failed to create chat: No data returned");
    }
    
    console.log("Chat created successfully:", chat);
    revalidatePath("/chat");
    return chat;
  } catch (error) {
    console.error("Error in createChat function:", error);
    throw error;
  }
}

// Send a message to Gemini and save the conversation
export async function sendMessage(chatId: string, content: string, userId?: string) {
  // Check if Gemini API is configured
  if (!isConfigured()) {
    throw new Error("Gemini API is not configured. Please set the GEMINI_API_KEY environment variable.");
  }

  // Use the userId passed from the client component
  if (!userId) {
    throw new Error("Authentication required. Please log in to continue.");
  }
  
  const supabase = supabaseBrowserClient();
  
  // Get the chat
  const { data: chat, error: chatError } = await supabase
    .from("chats")
    .select("*, files(*)")
    .eq("id", chatId)
    .single();
  
  if (chatError || !chat) {
    console.error("Error fetching chat:", chatError);
    throw new Error("Chat not found");
  }
  
  // Verify the chat belongs to the user
  if (chat.user_id !== userId) {
    console.error("User does not own this chat:", { chatUserId: chat.user_id, userId });
    throw new Error("You do not have permission to access this chat");
  }
  
  // Get previous messages
  const { data: previousMessages, error: messagesError } = await supabase
    .from("messages")
    .select("*")
    .eq("chat_id", chatId)
    .order("created_at", { ascending: true });
  
  if (messagesError) {
    console.error("Error fetching messages:", messagesError);
    throw new Error("Failed to fetch messages");
  }
  
  // Save the user message - removing user_id field as it doesn't exist in the schema
  const { data: userMessage, error: userMessageError } = await supabase
    .from("messages")
    .insert({
      chat_id: chatId,
      content,
      role: "user",
      // Removed user_id field as it doesn't exist in the schema
    })
    .select()
    .single();
  
  if (userMessageError || !userMessage) {
    console.error("Error saving user message:", userMessageError);
    throw new Error("Failed to save message");
  }
  
  try {
    // Format previous messages for Gemini
    const formattedMessages: ChatMessage[] = previousMessages.map((msg) => ({
      role: msg.role === "user" ? "user" : "model",
      content: msg.content,
    }));
    
    // Add the new user message
    formattedMessages.push({
      role: "user",
      content,
    });
    
    let fileContent = null;
    let response = "";
    
    // For PDF files, try to get relevant content from Pinecone based on the query
    if (chat.files && chat.files.type === 'pdf' && chat.files.id) {
      try {
        console.log("Checking if PDF has been indexed in Pinecone");
        const namespaceExists = await checkNamespaceExists(chat.files.id);
        
        if (namespaceExists) {
          console.log("PDF is indexed in Pinecone, querying for relevant content");
          const results = await queryDocuments(content, chat.files.id, 5);
          
          if (results && results.length > 0) {
            // Combine the content from the retrieved chunks
            fileContent = results.map((doc: Document) => doc.pageContent).join("\n\n");
            console.log(`Retrieved ${results.length} relevant chunks from Pinecone`);
            console.log("Sample content:", fileContent.substring(0, 100) + "...");
          } else {
            console.log("No relevant content found in Pinecone, falling back to full content");
            fileContent = await getFileContent(chat.files.id);
          }
        } else {
          console.log("PDF not indexed in Pinecone, using full content");
          fileContent = await getFileContent(chat.files.id);
        }
      } catch (pineconeError) {
        console.error("Error querying Pinecone:", pineconeError);
        // Fall back to getting the full file content
        console.log("Falling back to full file content due to Pinecone error");
        fileContent = await getFileContent(chat.files.id);
      }
    } else if (chat.files && chat.files.id) {
      // For other file types, get the full content
      console.log(`Getting content for non-PDF file type: ${chat.files.type}`);
      fileContent = await getFileContent(chat.files.id);
    }
    
    // Get response from Gemini
    console.log("Sending message to Gemini with context");
    response = await sendMessageToGemini(formattedMessages, fileContent);
    console.log("Received response from Gemini");
    
    // Save the assistant response - removing user_id field as it doesn't exist in the schema
    console.log("Saving assistant response to database");
    const { error: responseError } = await supabase
      .from("messages")
      .insert({
        chat_id: chatId,
        content: response,
        role: "assistant",
        // Removed user_id field as it doesn't exist in the schema
      });
    
    if (responseError) {
      console.error("Error saving assistant response:", responseError);
      throw new Error("Failed to save assistant response");
    }
    
    console.log("Message flow completed successfully");
    revalidatePath(`/chat/${chatId}`);
    return { userMessage, assistantMessage: response };
  } catch (error) {
    console.error("Error in sendMessage:", error);
    
    // Save an error message as the assistant response - removing user_id field
    await supabase.from("messages").insert({
      chat_id: chatId,
      content: "I'm sorry, I encountered an error processing your request. Please try again.",
      role: "assistant",
      // Removed user_id field as it doesn't exist in the schema
    });
    
    throw error;
  }
} 