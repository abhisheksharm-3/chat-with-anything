"use client"

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Search, Plus, Send } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";

const HistoryPage = () => {
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
              className="w-full bg-[#1a1a1a] border border-[#333] py-3 sm:py-4 pl-10 pr-10 text-sm text-gray-300 focus:outline-none rounded-xl"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="w-6 h-6 flex items-center justify-center rounded">
                <Send size={16} className='text-gray-500 cursor-pointer' />
              </div>
            </div>
          </div>
          
          {/* History Item Skeleton */}
          <div className="w-full border border-[#333] bg-[#1a1a1a] rounded-xl mb-6 sm:mb-16">
            <div className="flex flex-col sm:flex-row justify-between py-3 sm:py-2 px-4 sm:px-5 items-start sm:items-center gap-2 sm:gap-0">
              <Skeleton className="h-6 sm:h-8 w-24 sm:w-32 bg-[#333] rounded-xl" />
              <Skeleton className="h-4 sm:h-6 w-full sm:w-48 bg-[#333] rounded" />
            </div>
          </div>
          
          {/* Empty State */}
          <div className="flex flex-col items-center justify-center text-center px-4">
            <h3 className="text-base sm:text-lg font-medium mb-2">No chat yet</h3>
            <p className="text-xs sm:text-sm text-[#A9A9A9] font-medium text-center max-w-sm sm:max-w-md mb-6 sm:mb-8 leading-relaxed">
              Uh-oh! No chat to show here you would have to first upload a document to view anything here
            </p>
            
            <Link href="/choose">
              <Button className="bg-primary text-sm px-4 sm:px-6 py-2 sm:py-3 rounded-lg flex items-center gap-2 cursor-pointer hover:bg-primary/90 transition-colors">
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