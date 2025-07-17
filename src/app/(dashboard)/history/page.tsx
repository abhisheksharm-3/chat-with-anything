"use client"

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Search, Plus, Send, Loader2, Trash2 } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";
import { useChats } from '@/hooks';

const HistoryPage = () => {
  const { chats, isLoading, deleteChat, isDeleting } = useChats();
  const [searchQuery, setSearchQuery] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Filter chats based on search query
  const filteredChats = chats.filter(chat => 
    chat.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  return (
    <div className="flex flex-col h-full">
      <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col mt-4 sm:mt-8 items-center">
          {/* Title Section */}
          <div className="text-center mb-6 sm:mb-8">
            <h2 className="text-lg sm:text-xl font-normal mb-2 sm:mb-4">File History</h2>
            <p className="text-xs sm:text-sm font-normal text-[#A9A9A9]">Review your chat history</p>
          </div>
          
          {/* Search Bar */}
          <div className="relative w-full max-w-lg mb-6 sm:mb-8">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
            <input
              type="text"
              placeholder="Search chat"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#1a1a1a] border border-[#333] py-3 sm:py-4 pl-10 pr-10 text-sm text-gray-300 focus:outline-none rounded-xl"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="w-6 h-6 flex items-center justify-center rounded">
                <Send size={16} className='text-gray-500 cursor-pointer' />
              </div>
            </div>
          </div>
          
          {isLoading ? (
            /* Loading Skeleton */
            <div className="w-full">
              {[1, 2, 3].map((item) => (
                <div key={item} className="w-full border border-[#333] bg-[#1a1a1a] rounded-xl mb-4">
                  <div className="flex flex-col sm:flex-row justify-between py-3 sm:py-2 px-4 sm:px-5 items-start sm:items-center gap-2 sm:gap-0">
                    <Skeleton className="h-6 sm:h-8 w-24 sm:w-32 bg-[#333] rounded-xl" />
                    <Skeleton className="h-4 sm:h-6 w-full sm:w-48 bg-[#333] rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredChats.length === 0 ? (
            /* Empty State */
            <div className="flex flex-col items-center justify-center text-center px-4">
              <h3 className="text-base sm:text-lg font-medium mb-2">No chat yet</h3>
              <p className="text-xs sm:text-sm text-[#A9A9A9] font-medium text-center max-w-sm sm:max-w-md mb-6 sm:mb-8 leading-relaxed">
                {searchQuery 
                  ? "No chats match your search query. Try a different search term." 
                  : "Uh-oh! No chat to show here you would have to first upload a document to view anything here"}
              </p>
              
              <Link href="/choose">
                <Button className="bg-primary text-sm px-4 sm:px-6 py-2 sm:py-3 rounded-lg flex items-center gap-2 cursor-pointer hover:bg-primary/90 transition-colors">
                  <Plus size={16} />
                  <span>New chat</span>
                </Button>
              </Link>
            </div>
          ) : (
            /* Chat List */
            <div className="w-full space-y-4">
              {filteredChats.map((chat) => (
                <div key={chat.id} className="w-full border border-[#333] bg-[#1a1a1a] rounded-xl hover:bg-[#252525] transition-colors">
                  <div className="flex justify-between py-3 sm:py-4 px-4 sm:px-5 items-center">
                    <Link href={`/chat/${chat.id}`} className="flex-1">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 sm:gap-4">
                        <h3 className="font-medium text-sm sm:text-base">
                          {chat.title || "Untitled Chat"}
                        </h3>
                        <p className="text-xs text-[#A9A9A9]">
                          {new Date(chat.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteChat(chat.id)}
                      disabled={isDeleting && deletingId === chat.id}
                      className="text-gray-400 hover:text-red-500 hover:bg-transparent ml-2"
                    >
                      {isDeleting && deletingId === chat.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoryPage;