import ChatInterface from "@/components/chat/ChatInterface";

/**
 * Server component for rendering individual chat sessions.
 * 
 * This component receives the chat ID from the URL params and passes it
 * to the ChatInterface component, which handles all client-side logic.
 * 
 * @param {ChatPageProps} props - The props containing URL parameters
 * @returns {React.ReactElement} The chat interface component
 */
const ChatPage = ({ params }: { params: { id: string } }) => {
  const chatId = params.id;

  return (
    <div className="h-full">
      <ChatInterface chatId={chatId} />
    </div>
  );
};

export default ChatPage;