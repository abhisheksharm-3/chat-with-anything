// src/app/history/page.tsx

"use client";

import { useState } from "react";
import Link from "next/link";
import { useChats } from "@/hooks/useChats";
import { Button } from "@/components/ui/button";
import { Search, Plus, AlertCircle, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { HistoryChatlistSkeletonItem } from "@/components/history/HistoryPageSkeletonLoader";
import { HistoryPageChatItem } from "@/components/history/HistoryPageChatItem";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

/**
 * Renders the user's chat history page with a redesigned, themed UI.
 */
const HistoryPage = () => {
  const { chats, isLoading, isError, error, refetch } = useChats();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredChats = (Array.isArray(chats) ? chats : []).filter(
    (chat) =>
      chat?.title &&
      chat.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderContent = () => {
    if (isError) {
      return (
        <div className="mt-16 text-center">
          <Alert variant="destructive" className="mx-auto max-w-md">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Failed to load chats</AlertTitle>
            <AlertDescription>
              {error instanceof Error ? error.message : "An unexpected error occurred."}
            </AlertDescription>
          </Alert>
          <Button onClick={() => refetch()} variant="secondary" className="mt-6">
            <RefreshCw className="mr-2 h-4 w-4" /> Retry
          </Button>
        </div>
      );
    }
    if (isLoading) {
      return (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <HistoryChatlistSkeletonItem key={i} />)}
        </div>
      );
    }
    if (filteredChats.length === 0) {
      return (
        <div className="mt-16 flex flex-col items-center text-center">
          <h3 className="text-xl font-semibold text-foreground">No Chats Found</h3>
          <p className="mt-2 max-w-md text-muted-foreground">
            {searchQuery
              ? "No chats match your search. Try a different term."
              : "You have no chats yet. Create one to get started."}
          </p>
          <Button asChild className="mt-6">
            <Link href="/dashboard">
              <Plus className="mr-2 h-4 w-4" /> New Chat
            </Link>
          </Button>
        </div>
      );
    }
    return (
      <div className="space-y-3">
        {filteredChats.map((chat) =>
          chat?.id ? <HistoryPageChatItem key={chat.id} chat={chat} /> : null
        )}
      </div>
    );
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">
          Chat History
        </h1>
        <p className="mt-2 text-muted-foreground">
          Review, search, and manage your past conversations.
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative mx-auto mb-8 w-full max-w-lg">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search by chat title..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-11 w-full pl-10"
        />
      </div>

      {/* Main Content */}
      {renderContent()}
    </div>
  );
};

export default HistoryPage;