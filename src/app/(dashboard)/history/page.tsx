"use client";

import { useState } from "react";
import Link from "next/link";
import { useChats } from "@/hooks/useChats";
import { Button } from "@/components/ui/button";
import { Search, Plus, Send, AlertCircle, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { HistoryPageSkeletonItems } from "@/constants/HistoryPage";
import { HistoryChatlistSkeletonItem } from "@/components/history/HistoryPageSkeletonLoader";
import { HistoryPageChatItem } from "@/components/history/HistoryPageChatItem";
import { Alert, AlertDescription } from "@/components/ui/alert";

/**
 * Renders the user's chat history page.
 *
 * This component fetches chat data, handles loading and error states, and provides
 * a search interface to filter the chat list. It is designed to be robust,
 * with specific UI states for loading, fetch errors, empty results, and search errors.
 *
 * @returns {JSX.Element} The rendered history page.
 */
const HistoryPage = () => {
  const { chats, isLoading, isError, error, refetch } = useChats();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchError, setSearchError] = useState<string | null>(null);

  const filteredChats = (Array.isArray(chats) ? chats : []).filter(
    (chat) =>
      chat?.title &&
      chat.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchError(null); // Clear previous errors on new input
    setSearchQuery(e.target.value);
  };

  const handleSearch = () => {
    if (searchQuery.trim().length > 100) {
      setSearchError(
        "Search query is too long. Please use fewer than 100 characters."
      );
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // Main render function for the page content based on the data fetching state.
  const renderContent = () => {
    if (isError) {
      return (
        <div className="flex flex-col items-center justify-center text-center px-4 py-8 sm:py-12">
          <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
          <h3 className="text-sm sm:text-base font-medium mb-2 text-white">
            Failed to load chats
          </h3>
          <p className="text-xs sm:text-sm text-[#A9A9A9] font-medium text-center max-w-xs sm:max-w-md mb-4 sm:mb-6 leading-relaxed">
            {error instanceof Error
              ? `Error: ${error.message}`
              : "An unexpected error occurred."}
          </p>
          <Button
            onClick={() => refetch()}
            variant="destructive"
            className="px-3 sm:px-6 py-2 sm:py-3 rounded-lg gap-2 cursor-pointer transition-colors"
          >
            <RefreshCw size={14} className="sm:w-4 sm:h-4" />
            <span>Retry</span>
          </Button>
        </div>
      );
    }

    if (isLoading) {
      return (
        <div className="w-full space-y-2 sm:space-y-3">
          {HistoryPageSkeletonItems.map((item) => (
            <HistoryChatlistSkeletonItem key={item.id} />
          ))}
        </div>
      );
    }

    if (filteredChats.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center text-center px-4 py-8 sm:py-12">
          <h3 className="text-sm sm:text-base font-medium mb-2">
            No chats found
          </h3>
          <p className="text-xs sm:text-sm text-[#A9A9A9] font-medium text-center max-w-xs sm:max-w-md mb-4 sm:mb-6 leading-relaxed">
            {searchQuery
              ? "No chats match your search. Try a different term."
              : "You have no chats yet. Upload a document to start a new one."}
          </p>
          <Link href="/choose">
            <Button className="px-3 sm:px-6 py-2 sm:py-3 rounded-lg gap-2 cursor-pointer transition-colors">
              <Plus size={14} className="sm:w-4 sm:h-4" />
              <span>New chat</span>
            </Button>
          </Link>
        </div>
      );
    }

    return (
      <div className="w-full space-y-2 sm:space-y-3 px-3">
        {filteredChats.map((chat) =>
          chat?.id ? (
            <div
              key={chat.id}
              className="border border-[#333] rounded-lg overflow-hidden"
            >
              <HistoryPageChatItem chat={chat} />
            </div>
          ) : null
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen max-w-screen bg-[#0f0f0f]">
      <div className="w-full max-w-4xl mx-auto lg:px-8 flex-1">
        <div className="flex flex-col py-4 sm:py-6">
          {/* Header */}
          <div className="text-center mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-semibold mb-1 sm:mb-2 text-white">
              File History
            </h2>
            <p className="text-xs sm:text-sm font-normal text-[#A9A9A9]">
              Review your chat history
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative w-full max-w-sm sm:max-w-lg mx-auto mb-4 sm:mb-6">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
              size={16}
            />
            <Input
              type="text"
              placeholder="Search chat"
              value={searchQuery}
              onChange={handleSearchInputChange}
              onKeyDown={handleKeyPress}
              className="pl-10 pr-10 text-sm text-gray-300 bg-[#1a1a1a] border-[#333] focus:border-[#555] rounded-xl h-10 sm:h-12"
              maxLength={100}
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSearch}
                className="p-1 h-6 w-6 hover:bg-[#2a2a2a] rounded"
              >
                <Send
                  size={14}
                  className="text-gray-500 hover:text-gray-400 transition-colors"
                />
              </Button>
            </div>
          </div>

          {/* Search Error Alert */}
          {searchError && (
            <div className="w-full max-w-sm sm:max-w-lg mx-auto mb-4">
              <Alert className="border-red-500 bg-red-50/10">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <AlertDescription className="text-red-400">
                  {searchError}
                </AlertDescription>
              </Alert>
            </div>
          )}

          {/* Main Content */}
          <div className="w-full flex-1">{renderContent()}</div>
        </div>
      </div>
    </div>
  );
};

export default HistoryPage;