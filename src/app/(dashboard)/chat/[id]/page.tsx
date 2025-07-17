"use client"

import React, { useEffect } from 'react';
import { useParams } from 'next/navigation';
import ChatInterface from '@/components/dashboard/ChatInterface';
import { notFound, useRouter } from 'next/navigation';
import { useChats } from '@/hooks';
import { Loader2 } from 'lucide-react';

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params.id === 'string' ? params.id : Array.isArray(params.id) ? params.id[0] : '';
 const { chat, getChatById } = useChats(id);

  useEffect(() => {
    // If there's an error or no chat after loading, redirect to 404
    if (!chat) {
      router.push('/not-found');
    }
  }, [chat, router]);

  if (!chat) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-gray-400">Loading chat...</span>
      </div>
    );
  }
  
  if (!chat) {
    return null; // Will redirect in the useEffect
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