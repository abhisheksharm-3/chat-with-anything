import { TypeHistoryPageChatDropdownProps } from "@/types/ui";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { MoreVertical } from "lucide-react";
import { HistoryPageDropdownActions } from "@/constants/HistoryPage";

export const HistorypageChatDropdown = ({ chat, file }: TypeHistoryPageChatDropdownProps) => (
  <div className="absolute top-3 right-3 sm:top-4 sm:right-4 transition-opacity">
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-gray-400 hover:text-gray-300 hover:bg-[#2a2a2a] p-1.5 h-7 w-7 sm:h-8 sm:w-8"
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="bg-[#1d1d1d] border-[#272626] w-40 rounded-xl shadow-lg"
      >
        {HistoryPageDropdownActions.map((action) => {
          const IconComponent = action.icon;
          return (
            <DropdownMenuItem
              key={action.label}
              onClick={(e) => action.handler(e, chat, file ?? undefined)}
              className="cursor-pointer hover:bg-[#3a3a3a] focus:bg-[#3a3a3a] text-sm"
            >
              <IconComponent className="mr-3 h-4 w-4" />
              {action.label}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
);