"use client"

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Search, Plus, Send } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";

const HistoryPage = () => {
  return (
    <div className="flex flex-col h-full">
      <div className="w-full max-w-3xl mx-auto px-4">
        <div className="flex flex-col mt-8 items-center">
          <h2 className="text-xl font-normal mb-4">File History</h2>
          <p className="text-sm font-normal text-[#A9A9A9] mb-6">Review your chat history</p>
          
          <div className="relative w-full max-w-lg mb-8">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
            <input
              type="text"
              placeholder="Search chat"
              className="w-full bg-[#1a1a1a] border border-[#333] py-4 pl-10 pr-10 text-sm text-gray-300 focus:outline-none rounded-xl"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="w-6 h-6 flex items-center justify-center rounded">
                <Send size={16} className='text-gray-500 cursor-pointer' />
              </div>
            </div>
          </div>
          
          <div className="w-full border border-[#333] bg-[#1a1a1a] rounded-xl">
            <div className="flex justify-between py-2 px-5 items-center">
              <Skeleton className="h-8 w-32 bg-[#333] rounded-xl" />
              <Skeleton className="h-6 w-48 bg-[#333]" />
            </div>
          </div>
          
          <div className="flex flex-col items-center justify-center mt-16">
            <h3 className="text-lg font-medium mb-2">No chat yet</h3>
            <p className="text-sm text-[#A9A9A9] font-medium text-center max-w-md mb-8">
              Uh-oh! No chat to show here you would have to first upload a document to view anything here
            </p>
            
            <Link href="/choose" >
            <Button className="bg-primary text-sm px-4 py-2 rounded-lg flex items-center gap-2 cursor-pointer">
              <Plus size={16} />
              <span>New chat</span>
            </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistoryPage;