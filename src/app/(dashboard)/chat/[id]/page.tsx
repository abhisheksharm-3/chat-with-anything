import ChatInterface from "@/components/chat/ChatInterface";
import { generateChatMetadata, validateChatId } from "@/utils/chat-utils";
import { Metadata } from "next";
import { notFound } from "next/navigation";

/**
 * Generate dynamic metadata for the chat page
 */
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  return generateChatMetadata(params.id);
}

/**
 * Server component for rendering individual chat sessions.
 * 
 * This component receives the chat ID from the URL params and passes it
 * to the ChatInterface component, which handles all client-side logic.
 * The metadata is generated dynamically based on the chat content.
 */
const ChatPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id: chatId } = await params;

  // Server-side validation
  if (!validateChatId(chatId)) {
    notFound();
  }

  return (
    <div className="h-full">
      <ChatInterface chatId={chatId} />
    </div>
  );
};

export default ChatPage;