import React from 'react';
import { MobileTabsProps } from '@/types/chat';
import { ChevronsDown, ChevronsUp } from 'lucide-react';

export const MobileTabs: React.FC<MobileTabsProps> = ({ showPDF, setShowPDF }) => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowPDF(!showPDF);
  };

  return (
    <button
      className={`w-full flex items-center justify-center p-4 border-b border-[#333] bg-[#121212] z-10 ${
        showPDF
          ? 'fixed bottom-0 left-0 '
          : 'sticky top-0'
      }`}
      onClick={handleClick}
    >
      <div className="flex items-center justify-center gap-2 text-gray-400 rounded-xl bg-[#1d1d1d] px-4 py-6 w-full">
        {showPDF ? (
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
      </div>
    </button>
  );
};