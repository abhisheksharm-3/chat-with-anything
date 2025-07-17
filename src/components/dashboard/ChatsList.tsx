"use client";

import { useState } from "react";
import { useChats } from "@/hooks";
import { Button } from "@/components/ui/button";
import { Loader2, MessageSquare, Plus, Trash2 } from "lucide-react";
import Link from "next/link";

export default function ChatsList() {
  const { chats, isLoading, createChat, deleteChat, isCreating, isDeleting } = useChats();
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newChatTitle, setNewChatTitle] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Handle creating a new chat
  const handleCreateChat = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newChatTitle.trim()) return;
    
    try {
      setIsCreatingNew(true);
      await createChat({
        title: newChatTitle,
        type: null,
        file_id: null,
      });
      setNewChatTitle("");
      setIsCreatingNew(false);
    } catch (error) {
      console.error("Failed to create chat:", error);
      setIsCreatingNew(false);
    }
  };

  // Handle deleting a chat
  const handleDeleteChat = async (chatId: string) => {
    try {
      setDeletingId(chatId);
      await deleteChat(chatId);
      setDeletingId(null);
    } catch (error) {
      console.error("Failed to delete chat:", error);
      setDeletingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="ml-2 text-gray-400">Loading chats...</span>
      </div>
    );
  }

  return (
    <div className="p-4 bg-[#1a1a1a] rounded-lg border border-gray-800">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Your Chats</h2>
        <Button
          size="sm"
          onClick={() => setIsCreatingNew(!isCreatingNew)}
          className="text-xs"
        >
          <Plus className="h-4 w-4 mr-1" />
          New Chat
        </Button>
      </div>

      {isCreatingNew && (
        <form onSubmit={handleCreateChat} className="mb-4 flex gap-2">
          <input
            type="text"
            value={newChatTitle}
            onChange={(e) => setNewChatTitle(e.target.value)}
            className="flex-1 bg-[#252525] border border-gray-700 rounded px-3 py-2 text-sm"
            placeholder="Chat title"
            autoFocus
          />
          <Button
            type="submit"
            size="sm"
            disabled={isCreating || !newChatTitle.trim()}
          >
            {isCreating ? (
              <>
                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                Creating...
              </>
            ) : (
              "Create"
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setIsCreatingNew(false);
              setNewChatTitle("");
            }}
            disabled={isCreating}
          >
            Cancel
          </Button>
        </form>
      )}

      {chats.length === 0 ? (
        <div className="text-center py-8">
          <MessageSquare className="h-12 w-12 mx-auto text-gray-500 mb-2" />
          <p className="text-gray-400">No chats yet</p>
          <p className="text-sm text-gray-500 mt-1">
            Create a new chat to get started
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {chats.map((chat) => (
            <div
              key={chat.id}
              className="flex items-center justify-between p-3 bg-[#252525] rounded-lg hover:bg-[#2a2a2a] transition-colors"
            >
              <Link
                href={`/chat/${chat.id}`}
                className="flex-1 truncate"
              >
                <div className="font-medium truncate">
                  {chat.title || "Untitled Chat"}
                </div>
                <div className="text-xs text-gray-400">
                  {new Date(chat.created_at).toLocaleString()}
                </div>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDeleteChat(chat.id)}
                disabled={isDeleting && deletingId === chat.id}
                className="text-gray-400 hover:text-red-500 hover:bg-transparent"
              >
                {isDeleting && deletingId === chat.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 