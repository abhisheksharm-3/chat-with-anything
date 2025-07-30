// src/components/history/HistoryPageChatDropdown.tsx

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreVertical } from "lucide-react";
import { HistoryPageDropdownActions } from "@/constants/HistoryPage";
import { TypeHistoryPageChatDropdownProps } from "@/types/TypeUi";

/**
 * A themed dropdown menu for chat item actions.
 */
export const HistorypageChatDropdown = ({ chat, file }: TypeHistoryPageChatDropdownProps) => (
  <div className="absolute top-1/2 right-2 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100">
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {HistoryPageDropdownActions.map((action) => (
          <DropdownMenuItem
            key={action.label}
            onClick={(e) => action.handler(e, chat, file ?? undefined)}
            className="cursor-pointer"
          >
            <action.icon className="mr-2 h-4 w-4" />
            <span>{action.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
);