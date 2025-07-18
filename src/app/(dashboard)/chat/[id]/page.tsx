"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ChatInterface from '@/components/dashboard/ChatInterface';
import { useChats } from '@/hooks';
import { Loader2 } from 'lucide-react';

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const chatId = typeof params.id === 'string' ? params.id : Array.isArray(params.id) ? params.id[0] : '';
  const { chat, isChatLoading, isChatError } = useChats(chatId);
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    if (!isChatLoading && (isChatError || !chat)) {
      const timer = setTimeout(() => {
        setShouldRedirect(true);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [chat, isChatLoading, isChatError]);

  useEffect(() => {
    if (shouldRedirect) {
      router.push('/not-found');
    }
  }, [shouldRedirect, router]);

  if (isChatLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-gray-400">Loading chat...</span>
      </div>
    );
  }
  
  if (isChatError || !chat) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-gray-400">Chat not found, redirecting...</span>
      </div>
    );
  }
  
  return (
    <div className="h-full">
      <ChatInterface 
        title={chat.title || "Untitled Chat"} 
        source={chat.type || "document"} 
        chatId={chat.id} 
      />
    </div>
  );
}