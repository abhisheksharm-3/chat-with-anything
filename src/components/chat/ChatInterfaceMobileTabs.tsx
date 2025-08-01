import { TypeChatInterfaceMobileTabsProps } from "@/types/TypeChat";
import { ChevronsDown, ChevronsUp } from "lucide-react";
import { Button } from "../ui/button";

/**
 * A mobile-specific tab component that functions as a large toggle button.
 * It's designed to switch the view between a document/PDF viewer and the chat interface.
 * The button's text, icon, and positioning adapt based on the currently active view.
 *
 * @component
 * @param {TypeChatInterfaceMobileTabsProps} props - The properties for the component.
 * @param {boolean} props.showDocument - The current state indicating if the document viewer is visible.
 * @param {React.Dispatch<React.SetStateAction<boolean>>} props.setShowPDF - The state setter function to toggle the document's visibility.
 * @returns {JSX.Element} A button element that toggles the mobile view.
 */
export const ChatInterfaceMobileTabs: React.FC<
  TypeChatInterfaceMobileTabsProps
> = ({ showDocument, setShowDocument }) => {
  /**
   * Handles the click event on the button to toggle the view
   * and stops the event from propagating to parent elements.
   * @param {React.MouseEvent} e - The mouse event.
   */
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDocument(!showDocument);
  };

  return (
    <div
      className={`w-full z-10 mb-3 ${
        showDocument ? "fixed bottom-0 left-0 mx-3" : "sticky top-0 mx-auto"
      }`}
    >
      <Button
        variant="outline"
        className="w-full flex items-center justify-center border-none bg-[#121212] px-4 py-6 rounded-lg"
        onClick={handleClick}
      >
        <span className="flex items-center justify-center gap-2 text-gray-400 bg-[#1d1d1d] w-full">
          {showDocument ? (
            <>
              <ChevronsUp className="w-6 h-6" />
              <span className="text-sm">Click to Chat with the doc</span>
              <ChevronsUp className="w-6 h-6" />
            </>
          ) : (
            <>
              <ChevronsDown className="w-6 h-6" />
              <span className="text-sm">Click to view PDF</span>
              <ChevronsDown className="w-6 h-6" />
            </>
          )}
        </span>
      </Button>
    </div>
  );
};
