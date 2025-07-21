"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ChatInterface from "@/components/chat/ChatInterface";
import { Loader2 } from "lucide-react";
import { useChats } from "@/hooks/useChats";

/**
 * Renders the page for an individual chat session.
 *
 * This component is responsible for fetching and displaying a specific chat
 * based on the ID provided in the URL. It handles loading states and provides
 * user feedback. If the chat doesn't exist or an error occurs while fetching,
 * it displays a message and redirects to the not-found page.
 *
 * @returns {React.ReactElement} The rendered chat page, or a loading/error state.
 */
const ChatPage = () => {
  const params = useParams();
  const router = useRouter();

  // Extracts the chat ID from the dynamic URL, handling different router return types.
  const chatId =
    typeof params.id === "string"
      ? params.id
      : Array.isArray(params.id)
        ? params.id[0]
        : "";

  // Fetches chat data and its loading/error status using a custom hook.
  const { chat, isChatLoading, isChatError } = useChats(chatId);

  // State to trigger the redirection after a brief delay.
  const [shouldRedirect, setShouldRedirect] = useState(false);

  /**
   * Sets up a delayed redirect if the chat is not found or an error occurs.
   * This provides a better user experience by showing a message before redirecting.
   */
  useEffect(() => {
    if (!isChatLoading && (isChatError || !chat)) {
      const timer = setTimeout(() => {
        setShouldRedirect(true);
      }, 2000); // Wait 2 seconds before redirecting.

      // Cleanup function to clear the timer if the component unmounts.
      return () => clearTimeout(timer);
    }
  }, [chat, isChatLoading, isChatError]);

  /**
   * Executes the redirection when the `shouldRedirect` state is updated.
   */
  useEffect(() => {
    if (shouldRedirect) {
      router.push("/not-found");
    }
  }, [shouldRedirect, router]);

  // Display a loading indicator while fetching chat data.
  if (isChatLoading || !chat) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-gray-400">Loading chat...</span>
      </div>
    );
  }

  // Display an error/redirect message if the chat could not be loaded.
  if (isChatError) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-gray-400">
          Chat not found, redirecting...
        </span>
      </div>
    );
  }

  // Render the main chat interface once data is successfully loaded.
  return (
    <div className="h-full">
      <ChatInterface
        title={chat.title || "Untitled Chat"}
        source={chat.type || "document"}
        chatId={chat.id}
      />
    </div>
  );
};

export default ChatPage;
