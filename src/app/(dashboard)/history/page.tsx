"use client"

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Search, Plus, Send, Loader2, Trash2, MoreVertical, Edit, Download } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";
import { useChats } from '@/hooks';

const HistoryPage = () => {
  const { chats, isLoading, handleDeleteChat, deletingId } = useChats();
  const [searchQuery, setSearchQuery] = useState("");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Filter chats based on search query - calculated directly
  const filteredChats = chats.filter(chat => 
    chat.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleMenu = (chatId: string | null) => {
    setOpenMenuId(openMenuId === chatId ? null : chatId);
  };

  const handleMenuAction = (action: string, chatId: string) => {
    switch (action) {
      case 'edit':
        // TODO: Implement edit functionality
        console.log('Edit file name for chat:', chatId);
        break;
      case 'download':
        // TODO: Implement download functionality
        console.log('Download chat:', chatId);
        break;
      case 'delete':
        handleDeleteChat(chatId);
        break;
      default:
        break;
    }
    setOpenMenuId(null);
  };

  const renderLoadingSkeleton = () => (
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
  );

  const renderEmptyState = () => (
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
  );

  const renderChatList = () => (
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
            
            {/* Three dots menu */}
            <div className="relative ml-2" ref={openMenuId === chat.id ? menuRef : null}>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  toggleMenu(chat.id);
                }}
                className="text-gray-400 hover:text-gray-300 hover:bg-transparent p-2"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
              
              {/* Dropdown menu */}
              {openMenuId === chat.id && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-[#2a2a2a] border border-[#444] rounded-lg shadow-lg z-10">
                  <div className="py-1">
                    <button
                      onClick={() => handleMenuAction('edit', chat.id)}
                      className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-[#3a3a3a] flex items-center gap-3"
                    >
                      <Edit className="h-4 w-4" />
                      Edit file name
                    </button>
                    <button
                      onClick={() => handleMenuAction('download', chat.id)}
                      className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-[#3a3a3a] flex items-center gap-3"
                    >
                      <Download className="h-4 w-4" />
                      Download Chat
                    </button>
                    <button
                      onClick={() => handleMenuAction('delete', chat.id)}
                      disabled={deletingId === chat.id}
                      className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-[#3a3a3a] flex items-center gap-3 disabled:opacity-50"
                    >
                      {deletingId === chat.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                      Delete chat
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

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
          
          {/* Content */}
          {isLoading ? renderLoadingSkeleton() : 
           filteredChats.length === 0 ? renderEmptyState() : 
           renderChatList()}
        </div>
      </div>
    </div>
  );
};

export default HistoryPage;
