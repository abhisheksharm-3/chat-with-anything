"use client"

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { SendIcon, MessageSquareIcon } from 'lucide-react';

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
    {
      id: '2',
      content: 'Please ask more specific question',
      isBot: true
    }
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
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
        <div className="flex items-center">
          <h2 className="text-sm font-medium text-white">{title}</h2>
          <span className="ml-2 px-1.5 py-0.5 text-xs bg-gray-800 text-gray-400 rounded">40%</span>
        </div>
        <Button size="sm" variant="ghost" className="text-gray-400">
          <svg width="20" height="20" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3.625 7.5C3.625 8.12132 3.12132 8.625 2.5 8.625C1.87868 8.625 1.375 8.12132 1.375 7.5C1.375 6.87868 1.87868 6.375 2.5 6.375C3.12132 6.375 3.625 6.87868 3.625 7.5ZM8.625 7.5C8.625 8.12132 8.12132 8.625 7.5 8.625C6.87868 8.625 6.375 8.12132 6.375 7.5C6.375 6.87868 6.87868 6.375 7.5 6.375C8.12132 6.375 8.625 6.87868 8.625 7.5ZM13.625 7.5C13.625 8.12132 13.1213 8.625 12.5 8.625C11.8787 8.625 11.375 8.12132 11.375 7.5C11.375 6.87868 11.8787 6.375 12.5 6.375C13.1213 6.375 13.625 6.87868 13.625 7.5Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
          </svg>
        </Button>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}>
            <div className={`max-w-[80%] rounded-lg p-3 ${message.isBot ? 'bg-gray-800 text-white' : 'bg-purple-600 text-white'}`}>
              {message.isBot && (
                <div className="flex items-center mb-1">
                  <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center mr-2">
                    <MessageSquareIcon size={14} />
                  </div>
                </div>
              )}
              <p className="text-sm">{message.content}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Chat Input */}
      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center">
          <div className="flex-1 bg-gray-800 rounded-lg p-2">
            <textarea
              className="w-full bg-transparent border-0 focus:ring-0 text-white resize-none"
              placeholder="Message..."
              rows={1}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
            />
          </div>
          <Button 
            className="ml-2 rounded-full w-8 h-8 p-0 bg-purple-600 hover:bg-purple-700 flex items-center justify-center"
            onClick={handleSendMessage}
          >
            <SendIcon size={14} />
          </Button>
        </div>
        <div className="flex justify-end mt-2">
          <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white text-xs">
            What's in the {source.toUpperCase()} <span className="ml-1 bg-purple-500 px-1.5 py-0.5 rounded text-[10px]">5K</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface; 