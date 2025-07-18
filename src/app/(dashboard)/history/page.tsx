"use client"

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Search, Plus, Send, MoreVertical } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";
import { useChats } from '@/hooks';
import { useFileById } from '@/hooks';
import { TypeChat } from '@/types/supabase';

// Helper function to format file size
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

// Helper function to format time ago
const formatTimeAgo = (dateString: string): string => {
  const now = new Date();
  const date = new Date(dateString);
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  
  return date.toLocaleDateString();
};

// Individual chat item component
const ChatItem = ({ chat }: { chat: TypeChat }) => {
  const { data: file } = useFileById(chat.file_id || '');

  return (
    <Link href={`/chat/${chat.id}`}>
      <div className="w-full bg-[#1a1a1a] hover:bg-[#252525] transition-colors p-3 sm:p-4 flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
          <h3 className="font-normal text-sm sm:text-base text-white truncate">
            {chat.title || file?.name || "Untitled Chat"}
          </h3>
          <span className="text-[10px] sm:text-xs text-[#A9A9A9] uppercase bg-[#2a2a2a] px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-center whitespace-nowrap">
            {file?.type?.toUpperCase() || 'FILE'}
          </span>
        </div>
        
        <div className="flex items-center gap-3 sm:gap-6 flex-shrink-0">
          {file?.size && (
            <span className="text-[10px] sm:text-xs text-[#A9A9A9] hidden sm:block">
              {formatFileSize(file.size)}
            </span>
          )}
          
          <div className="flex flex-col sm:flex-row items-end sm:items-center gap-1 sm:gap-0">
            {file?.size && (
              <span className="text-[10px] text-[#A9A9A9] sm:hidden">
                {formatFileSize(file.size)}
              </span>
            )}
            <span className="text-[10px] sm:text-xs text-[#A9A9A9]">
              {formatTimeAgo(chat.created_at)}
            </span>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            className="text-gray-400 hover:text-gray-300 hover:bg-[#2a2a2a] p-1.5 sm:p-2 h-6 w-6 sm:h-8 sm:w-8"
          >
            <MoreVertical className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
        </div>
      </div>
    </Link>
  );
};

const HistoryPage = () => {
  const { chats, isLoading } = useChats();
  const [searchQuery, setSearchQuery] = useState("");

  // Filter chats based on search query
  const filteredChats = chats.filter(chat => 
    chat.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderLoadingSkeleton = () => (
    <div className="w-full space-y-1">
      {[1, 2, 3].map((item) => (
        <div key={item} className="w-full bg-[#1a1a1a] p-3 sm:p-4 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3 flex-1">
            <Skeleton className="h-3 sm:h-4 w-32 sm:w-48 bg-[#333] rounded" />
            <Skeleton className="h-3 sm:h-4 w-8 sm:w-12 bg-[#333] rounded" />
          </div>
          <div className="flex items-center gap-3 sm:gap-6">
            <Skeleton className="h-2 sm:h-3 w-8 sm:w-12 bg-[#333] rounded hidden sm:block" />
            <Skeleton className="h-2 sm:h-3 w-12 sm:w-20 bg-[#333] rounded" />
            <Skeleton className="h-5 w-5 sm:h-6 sm:w-6 bg-[#333] rounded" />
          </div>
        </div>
      ))}
    </div>
  );

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

  const renderChatList = () => (
    <div className="w-full space-y-2 sm:space-y-3">
      {filteredChats.map((chat) => (
        <div key={chat.id} className="border border-[#333] rounded-lg overflow-hidden">
          <ChatItem chat={chat} />
        </div>
      ))}
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      <div className="w-full max-w-4xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex flex-col mt-3 sm:mt-6">
          {/* Title Section */}
          <div className="text-center mb-4 sm:mb-6">
            <h2 className="text-base sm:text-lg font-normal mb-1 sm:mb-2">File History</h2>
            <p className="text-xs sm:text-sm font-normal text-[#A9A9A9]">Review your chat history</p>
          </div>
          
          {/* Search Bar */}
          <div className="relative w-full max-w-sm sm:max-w-lg mx-auto mb-4 sm:mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={16} />
            <input
              type="text"
              placeholder="Search chat"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#1a1a1a] border border-[#333] py-2.5 sm:py-3 pl-10 pr-10 text-sm text-gray-300 focus:outline-none focus:border-[#555] rounded-xl transition-colors"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center rounded">
                <Send size={14} className='sm:w-4 sm:h-4 text-gray-500 cursor-pointer hover:text-gray-400 transition-colors' />
              </div>
            </div>
          </div>
          
          {/* Content */}
          <div className="w-full">
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