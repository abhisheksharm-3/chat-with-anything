"use server";

import { revalidatePath } from "next/cache";
import { ChatMessage, sendMessageToGemini, isConfigured } from "@/utils/gemini/client";
import { redirect } from "next/navigation";
import { supabaseBrowserClient } from "@/utils/supabase/client";

// Function to get file content from Supabase storage
async function getFileContent(fileId: string) {
  const supabase = supabaseBrowserClient() ;
  
  // First get the file metadata from the database
  const { data: file, error: fileError } = await supabase
    .from("files")
    .select("*")
    .eq("id", fileId)
    .single();
  
  if (fileError || !file) {
    console.error("Error fetching file metadata:", fileError);
    return null;
  }

  // For URL type files, return the URL directly
  if (file.file_type === 'web' || file.file_type === 'youtube') {
    return file.url;
  }
  
  // For other file types, get the content from storage
  const { data, error } = await supabase.storage
    .from("file-storage")
    .download(`${file.user_id}/${file.id}`);
  
  if (error || !data) {
    console.error("Error downloading file:", error);
    return null;
  }
  
  // Convert blob to text
  const content = await data.text();
  return content;
}

// Create a new chat
export async function createChat(fileId: string) {
  // Check if Gemini API is configured
  if (!isConfigured()) {
    throw new Error("Gemini API is not configured. Please set the GEMINI_API_KEY environment variable.");
  }

  const supabase = supabaseBrowserClient() ;
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect("/login");
  }
  
  const { data: file, error: fileError } = await supabase
    .from("files")
    .select("*")
    .eq("id", fileId)
    .single();
  
  if (fileError || !file) {
    console.error("Error fetching file:", fileError);
    throw new Error("File not found");
  }
  
  // Create a new chat in the database
  const { data: chat, error: chatError } = await supabase
    .from("chats")
    .insert({
      user_id: user.id,
      file_id: fileId,
      title: `Chat about ${file.name}`,
    })
    .select()
    .single();
  
  if (chatError || !chat) {
    console.error("Error creating chat:", chatError);
    throw new Error("Failed to create chat");
  }
  
  revalidatePath("/chat");
  return chat;
}

// Send a message to Gemini and save the conversation
export async function sendMessage(chatId: string, content: string) {
  // Check if Gemini API is configured
  if (!isConfigured()) {
    throw new Error("Gemini API is not configured. Please set the GEMINI_API_KEY environment variable.");
  }

  const supabase = supabaseBrowserClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect("/login");
  }
  
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
  
  // Save the user message
  const { data: userMessage, error: userMessageError } = await supabase
    .from("messages")
    .insert({
      chat_id: chatId,
      content,
      role: "user",
      user_id: user.id,
    })
    .select()
    .single();
  
  if (userMessageError || !userMessage) {
    console.error("Error saving user message:", userMessageError);
    throw new Error("Failed to save message");
  }
  
  try {
    // Format messages for Gemini
    const formattedMessages: ChatMessage[] = [
      ...(previousMessages || []).map((msg) => ({
        role: msg.role as "user" | "model",
        content: msg.content,
      })),
      { role: "user", content },
    ];
    
    // Get file content if it's the first message
    let fileContent = null;
    if (previousMessages?.length === 0 || !previousMessages) {
      fileContent = await getFileContent(chat.file_id);
    }
    
    // Get response from Gemini using the functional approach
    const response = await sendMessageToGemini(formattedMessages, fileContent);
    
    // Save the model's response
    const { data: modelMessage, error: modelMessageError } = await supabase
      .from("messages")
      .insert({
        chat_id: chatId,
        content: response,
        role: "model",
        user_id: user.id,
      })
      .select()
      .single();
    
    if (modelMessageError || !modelMessage) {
      console.error("Error saving model message:", modelMessageError);
      throw new Error("Failed to save model response");
    }
    
    revalidatePath(`/chat/${chatId}`);
    return { userMessage, modelMessage };
  } catch (error) {
    console.error("Error in sendMessage:", error);
    
    // Save error message
    await supabase.from("messages").insert({
      chat_id: chatId,
      content: "Sorry, I encountered an error processing your request. Please try again.",
      role: "model",
      user_id: user.id,
    });
    
    revalidatePath(`/chat/${chatId}`);
    throw new Error("Failed to get response from Gemini");
  }
} 