"use client"

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import ChatInterface from '@/components/dashboard/ChatInterface';
import { notFound } from 'next/navigation';

// Mock data for chats
const MOCK_CHATS = [
  {
    id: 'pdf',
    title: 'My Journey',
    source: 'pdf',
    lastUpdated: '2 hours ago',
    progress: '40%'
  },
  {
    id: 'docs',
    title: 'Product Roadmap',
    source: 'docs',
    lastUpdated: '1 day ago',
    progress: '75%'
  },
  {
    id: 'youtube',
    title: 'Tutorial Video',
    source: 'youtube',
    lastUpdated: '1 week ago',
    progress: '60%'
  },
  {
    id: 'web',
    title: 'Company Website',
    source: 'web',
    lastUpdated: '2 weeks ago',
    progress: '85%'
  },
  {
    id: 'github',
    title: 'Project Documentation',
    source: 'github',
    lastUpdated: '3 weeks ago',
    progress: '90%'
  },
  {
    id: 'image',
    title: 'Design Mockup',
    source: 'image',
    lastUpdated: '1 month ago',
    progress: '100%'
  },
  {
    id: 'notion',
    title: 'Meeting Notes',
    source: 'notion',
    lastUpdated: '1 month ago',
    progress: '70%'
  }
];

const ChatPage = () => {
  const params = useParams();
  const id = params.id as string;
  const [chat, setChat] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Simulate fetching chat data
    const fetchChat = () => {
      setLoading(true);
      
      // Find chat by ID in mock data
      const foundChat = MOCK_CHATS.find(chat => chat.id === id);
      
      // Simulate API delay
      setTimeout(() => {
        if (foundChat) {
          setChat(foundChat);
        }
        setLoading(false);
      }, 500);
    };
    
    fetchChat();
  }, [id]);
  
  // Show 404 if chat not found after loading
  if (!loading && !chat) {
    notFound();
  }
  
  return (
    <div className="h-full">
      {loading ? (
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-600"></div>
        </div>
      ) : (
        <ChatInterface title={chat.title} source={chat.source} />
      )}
    </div>
  );
};

export default ChatPage; 