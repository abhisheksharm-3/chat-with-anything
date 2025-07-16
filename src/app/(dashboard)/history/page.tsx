"use client"

import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Clock, MessageSquare, Search } from 'lucide-react';

// Mock data for chat history
const chatHistory = [
  {
    id: '1',
    title: 'My Journey',
    source: 'pdf',
    lastUpdated: '2 hours ago',
    progress: '40%'
  },
  {
    id: '2',
    title: 'Product Roadmap',
    source: 'docs',
    lastUpdated: '1 day ago',
    progress: '75%'
  },
  {
    id: '3',
    title: 'Research Paper',
    source: 'pdf',
    lastUpdated: '3 days ago',
    progress: '100%'
  },
  {
    id: '4',
    title: 'Tutorial Video',
    source: 'youtube',
    lastUpdated: '1 week ago',
    progress: '60%'
  },
  {
    id: '5',
    title: 'Company Website',
    source: 'web',
    lastUpdated: '2 weeks ago',
    progress: '85%'
  },
  {
    id: '6',
    title: 'Project Documentation',
    source: 'github',
    lastUpdated: '3 weeks ago',
    progress: '90%'
  },
  {
    id: '7',
    title: 'Design Mockup',
    source: 'image',
    lastUpdated: '1 month ago',
    progress: '100%'
  },
  {
    id: '8',
    title: 'Meeting Notes',
    source: 'notion',
    lastUpdated: '1 month ago',
    progress: '70%'
  }
];

const HistoryPage = () => {
  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-semibold text-white">Chat History</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search chats..."
            className="pl-10 pr-4 py-2 bg-gray-900 border border-gray-800 rounded-md text-white text-sm focus:outline-none focus:border-purple-600"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {chatHistory.map((chat) => (
          <Link key={chat.id} href={`/chat/${chat.id}`}>
            <Card className="p-4 bg-gray-900 border-gray-800 hover:border-purple-600 transition-colors cursor-pointer">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-white font-medium">{chat.title}</h3>
                  <div className="flex items-center text-gray-400 text-xs mt-1">
                    <MessageSquare size={12} className="mr-1" />
                    <span className="capitalize">{chat.source}</span>
                    <span className="mx-2">•</span>
                    <span>{chat.progress}</span>
                  </div>
                </div>
                <div className="flex items-center text-gray-400 text-xs">
                  <Clock size={12} className="mr-1" />
                  <span>{chat.lastUpdated}</span>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default HistoryPage; 