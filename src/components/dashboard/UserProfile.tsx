"use client";

import { useState } from "react";
import { useUser } from "@/hooks";
import { Button } from "@/components/ui/button";
import { Loader2, User } from "lucide-react";

export default function UserProfile() {
  const { user, isLoading, isAuthenticated, updateUser, isUpdating } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || "");

  // Handle form submission to update user name
  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await updateUser({ name });
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update name:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="ml-2 text-sm text-gray-400">Loading profile...</span>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="p-4 text-center">
        <p className="text-sm text-gray-400">Please sign in to view your profile</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-[#1a1a1a] rounded-lg border border-gray-800">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Your Profile</h2>
        {!isEditing && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(true)}
            className="text-xs"
          >
            Edit
          </Button>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center">
            <User className="h-6 w-6 text-gray-400" />
          </div>
          <div>
            {isEditing ? (
              <form onSubmit={handleUpdateName} className="flex gap-2 items-center">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-[#252525] border border-gray-700 rounded px-2 py-1 text-sm"
                  placeholder="Your name"
                />
                <Button
                  type="submit"
                  size="sm"
                  disabled={isUpdating}
                  className="text-xs"
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsEditing(false);
                    setName(user.name || "");
                  }}
                  className="text-xs"
                  disabled={isUpdating}
                >
                  Cancel
                </Button>
              </form>
            ) : (
              <div className="font-medium">{user.name || "No name set"}</div>
            )}
            <div className="text-sm text-gray-400">{user.email}</div>
          </div>
        </div>

        <div className="text-sm">
          <div className="flex justify-between py-2 border-b border-gray-800">
            <span className="text-gray-400">User ID</span>
            <span className="font-mono text-xs truncate max-w-[200px]">{user.id}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-800">
            <span className="text-gray-400">Joined</span>
            <span>{new Date(user.created_at).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
} 