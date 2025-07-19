"use client"

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Search, Plus, Send, MoreVertical, Trash2, Download } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useChats, useFileById } from '@/hooks';
import { TypeChat } from '@/types/supabase';
import { formatFileSize, formatTimeAgo } from '@/utils/history-page-utils';
import { Input } from '@/components/ui/input';

/**
 * Renders a single item in the chat history list.
 * It displays chat metadata and links to the specific chat page.
 * @param {{ chat: TypeChat }} props - The component props.
 * @param {TypeChat} props.chat - The chat object containing its details.
 * @returns {React.ReactElement} A linkable list item for a single chat.
 */
const ChatItem = ({ chat }: { chat: TypeChat }) => {
  const { data: file } = useFileById(chat.file_id || '');

  const handleDownload = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Download file:', file?.name);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Share file:', file?.name);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Delete chat:', chat.id);
  };

  return (
    <div className="max-w-sm lg:max-w-screen px-2 bg-[#1a1a1a] hover:bg-[#252525] transition-colors relative group">
      <Link href={`/chat/${chat.id}`} className="block">
        <div className="p-3 sm:p-4">
          {/* Mobile Layout */}
          <div className="flex sm:hidden items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-normal text-sm text-white truncate">
                  {chat.title || file?.name || "Untitled Chat"}
                </h3>
                <span className="text-[10px] text-[#A9A9A9] uppercase bg-[#2a2a2a] px-1.5 py-0.5 rounded whitespace-nowrap">
                  {file?.type?.toUpperCase() || 'FILE'}
                </span>
              </div>
              <div className="flex items-center gap-3 text-[10px] text-[#A9A9A9]">
                {file?.size && (
                  <span>{formatFileSize(file.size)}</span>
                )}
                <span>{formatTimeAgo(chat.created_at)}</span>
              </div>
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden sm:flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <h3 className="font-normal text-base text-white truncate">
                {chat.title || file?.name || "Untitled Chat"}
              </h3>
              <span className="text-xs text-[#A9A9A9] uppercase bg-[#2a2a2a] px-2 py-1 rounded whitespace-nowrap">
                {file?.type?.toUpperCase() || 'FILE'}
              </span>
            </div>
            
            <div className="flex items-center gap-6 flex-shrink-0 pr-10">
              {file?.size && (
                <span className="text-xs text-[#A9A9A9]">
                  {formatFileSize(file.size)}
                </span>
              )}
              <span className="text-xs text-[#A9A9A9]">
                {formatTimeAgo(chat.created_at)}
              </span>
            </div>
          </div>
        </div>
      </Link>
      
      {/* More button - positioned absolutely to avoid overlap */}
      <div className="absolute top-3 right-3 sm:top-4 sm:right-4 transition-opacity">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-gray-300 hover:bg-[#2a2a2a] p-1.5 h-7 w-7 sm:h-8 sm:w-8"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            align="end" 
            className="bg-[#1d1d1d] border-[#272626] text-white w-40 rounded-xl shadow-lg"
          >
            <DropdownMenuItem 
              onClick={handleDownload}
              className="cursor-pointer hover:bg-[#3a3a3a] focus:bg-[#3a3a3a] text-sm"
            >
              <Download className="mr-3 h-4 w-4" />
              Download file
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={handleShare}
              className="cursor-pointer hover:bg-[#3a3a3a] focus:bg-[#3a3a3a] text-sm"
            >
              <Send className="mr-3 h-4 w-4" />
              Share file
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={handleDelete}
              className="cursor-pointer hover:bg-[#3a3a3a] focus:bg-[#3a3a3a] text-sm"
            >
              <Trash2 className="mr-3 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

/**
 * Displays the user's complete chat history with search and filtering capabilities.
 * It handles loading, empty, and data-filled states.
 * @returns {React.ReactElement} The chat history page.
 */
const HistoryPage = () => {
  const { chats, isLoading } = useChats();
  const [searchQuery, setSearchQuery] = useState("");

  // Filters chats client-side based on the search query matching the chat title.
  const filteredChats = chats.filter(chat => 
    chat.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  /** Renders a loading skeleton UI while chat data is being fetched. */
  const renderLoadingSkeleton = () => (
    <div className="w-full space-y-2 sm:space-y-3">
      {[1, 2, 3].map((item) => (
        <div key={item} className="w-full bg-[#1a1a1a] p-3 sm:p-4 rounded-lg border border-[#333]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3 flex-1">
              <Skeleton className="h-4 w-32 sm:w-48 bg-[#333] rounded" />
              <Skeleton className="h-4 w-12 bg-[#333] rounded" />
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="flex flex-col items-end gap-0.5 sm:hidden">
                <Skeleton className="h-2 w-12 bg-[#333] rounded" />
                <Skeleton className="h-2 w-16 bg-[#333] rounded" />
              </div>
              <div className="hidden sm:flex items-center gap-4">
                <Skeleton className="h-3 w-12 bg-[#333] rounded" />
                <Skeleton className="h-3 w-20 bg-[#333] rounded" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  /** Renders an empty state message when no chats are available or found. */
  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center text-center px-4 py-8 sm:py-12">
      <h3 className="text-sm sm:text-base font-medium mb-2">No chat yet</h3>
      <p className="text-xs sm:text-sm text-[#A9A9A9] font-medium text-center max-w-xs sm:max-w-md mb-4 sm:mb-6 leading-relaxed">
        {searchQuery 
          ? "No chats match your search query. Try a different search term." 
          : "Uh-oh! No chat to show here you would have to first upload a document to view anything here"}
      </p>
      
      <Link href="/choose">
        <Button className="bg-primary text-xs sm:text-sm px-3 sm:px-6 py-2 sm:py-3 rounded-lg flex items-center gap-2 cursor-pointer hover:bg-primary/90 transition-colors">
          <Plus size={14} className="sm:w-4 sm:h-4" />
          <span>New chat</span>
        </Button>
      </Link>
    </div>
  );

  /** Renders the list of filtered chat items. */
  const renderChatList = () => (
    <div className="w-full space-y-2 sm:space-y-3">
      {filteredChats.map((chat) => (
        <div key={chat.id} className="border border-[#333] rounded-lg overflow-hidden">
          <ChatItem chat={chat} />
        </div>
      ))}
    </div>
  );

  const handleSearch = () => {
    // You can add search submission logic here if needed
    console.log('Search for:', searchQuery);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="flex flex-col min-h-screen max-w-screen bg-[#0f0f0f]">
      <div className="w-full max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 flex-1">
        <div className="flex flex-col py-4 sm:py-6">
          {/* Title Section */}
          <div className="text-center mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-semibold mb-1 sm:mb-2 text-white">File History</h2>
            <p className="text-xs sm:text-sm font-normal text-[#A9A9A9]">Review your chat history</p>
          </div>
          
          {/* Search Bar */}
          <div className="relative w-full max-w-sm sm:max-w-lg mx-auto mb-4 sm:mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={16} />
            <Input
              type="text"
              placeholder="Search chat"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="pl-10 pr-10 text-sm text-gray-300 bg-[#1a1a1a] border-[#333] focus:border-[#555] rounded-xl h-10 sm:h-12"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSearch}
                className="p-1 h-6 w-6 hover:bg-[#2a2a2a] rounded"
              >
                <Send size={14} className='text-gray-500 hover:text-gray-400 transition-colors' />
              </Button>
            </div>
          </div>
          
          {/* Content area that conditionally renders based on state */}
          <div className="w-full flex-1">
            {isLoading ? renderLoadingSkeleton() : 
             filteredChats.length === 0 ? renderEmptyState() : 
             renderChatList()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistoryPage;