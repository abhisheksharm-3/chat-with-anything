"use client"

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import ChatInterface from '@/components/dashboard/ChatInterface';
import { useRouter } from 'next/navigation';
import { useChats } from '@/hooks';
import { Loader2 } from 'lucide-react';

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const chatId = typeof params.id === 'string' ? params.id : Array.isArray(params.id) ? params.id[0] : '';
  const { chat, isChatLoading, isChatError } = useChats(chatId);
  const [shouldRedirect, setShouldRedirect] = useState(false);

  // Debug logging
  useEffect(() => {
    console.log('Chat page rendered:', { 
      chatId, 
      chat: !!chat, 
      isChatLoading, 
      isChatError,
      shouldRedirect
    });
  }, [chatId, chat, isChatLoading, isChatError, shouldRedirect]);

  useEffect(() => {
    // Only redirect if we're not loading and there's no chat
    if (!isChatLoading && (isChatError || !chat)) {
      console.log('Setting up redirect due to missing chat:', { isChatLoading, isChatError, hasChat: !!chat });
      // Set a delay before redirecting to avoid immediate redirects
      // This gives time for the chat to load if it exists
      const timer = setTimeout(() => {
        setShouldRedirect(true);
      }, 2000); // 2 seconds delay
      
      return () => clearTimeout(timer);
    }
  }, [chat, isChatLoading, isChatError]);

  useEffect(() => {
    // Only redirect after the delay
    if (shouldRedirect) {
      console.log('Redirecting to not-found page');
      router.push('/not-found');
    }
  }, [shouldRedirect, router]);

  // Show loading state while we wait for the chat data
  if (isChatLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-gray-400">Loading chat...</span>
      </div>
    );
  }
  
  // If we have an error or no chat, show a loading state until the redirect happens
  if (isChatError || !chat) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-gray-400">Chat not found, redirecting...</span>
      </div>
    );
  }
  
  // We have a valid chat, render the chat interface
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