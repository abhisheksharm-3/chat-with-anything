"use client"

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Send, MoreVertical, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';

interface ChatMessage {
  id: string;
  content: string;
  isBot: boolean;
}

interface ChatInterfaceProps {
  title: string;
  source: string;
}

const ChatInterface = ({ title, source }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      content: 'Type in the chat box how can I help you today',
      isBot: true
    },
  ]);
  const [inputValue, setInputValue] = useState('');

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    
    // Add user message
    const newUserMessage: ChatMessage = {
      id: Date.now().toString(),
      content: inputValue,
      isBot: false
    };
    
    setMessages([...messages, newUserMessage]);
    setInputValue('');
    
    // Simulate bot response
    setTimeout(() => {
      const botResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: `This is a mockup interface for ${source} chat. Real responses will be implemented in the production version.`,
        isBot: true
      };
      setMessages(prev => [...prev, botResponse]);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="grid grid-cols-2 gap-2 h-full">
      {/* Left Panel - Document Viewer */}
      <div className="bg-[#181818] border rounded-xl border-[#333] flex flex-col">

        <div className="flex-1 flex items-center justify-center relative">
          <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
            <Search className="text-gray-500" size={16} />
            <span className="text-gray-500">40%</span>
          </div>
        </div>
      </div>

      {/* Right Panel - Chat Interface */}
      <div className="bg-[#181818] flex flex-col border rounded-xl px-4 py-2">
        <div className="p-3 border border-[#333] rounded-xl">
          <h2 className="text-sm text-center text-gray-400">// Chat with the doc here //</h2>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div key={message.id} className="mb-4">
              {message.isBot && (
                <div className="flex items-center gap-2 mb-4">
                  <div className='flex items-center justify-center bg-[#272626] rounded-xl p-2'>
                  <Image
                src="/logo.png"
                alt="Logo"
                className="object-contain"
                width={32}
                height={32}
                priority
            />
                  </div>
                  <div className="bg-[#272626] rounded-xl p-3 text-sm text-white">
                    {message.content}
                  </div>
                </div>
              )}
              
              {!message.isBot && (
                <div className="flex justify-end">
                  <div className="bg-primary rounded-xl p-3 text-sm text-white max-w-[80%]">
                    {message.content}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>


        {/* Chat Input */}
        <div className="p-4 border-t border-[#333] relative">
          <div className="relative">
            <input
              type="text"
              className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg py-3 pl-4 pr-12 text-white text-sm focus:outline-none"
              placeholder="Message"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
            />
            <Button 
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl w-10 h-10 p-0 bg-primary cursor-pointer hover:bg-primary/90 flex items-center justify-center"
              onClick={handleSendMessage}
            >
              <Send size={16} className="text-white" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface; 