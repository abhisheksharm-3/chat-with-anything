"use client"

import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Clock, MessageSquare } from 'lucide-react';

// Mock data for recent chats
const recentChats = [
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
  }
];

const DashboardPage = () => {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-xl font-semibold text-white mb-6">Recent Chats</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recentChats.map((chat) => (
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
      
      <div className="mt-8 text-center">
        <Link href="/choose">
          <div className="inline-flex items-center text-purple-500 hover:text-purple-400">
            <span className="mr-2">+</span>
            <span>Start a new chat</span>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default DashboardPage; 