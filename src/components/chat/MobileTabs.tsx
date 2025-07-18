import React from 'react';

interface MobileTabsProps {
  showPDF: boolean;
  setShowPDF: (show: boolean) => void;
}

export const MobileTabs: React.FC<MobileTabsProps> = ({ showPDF, setShowPDF }) => {
  return (
    <div className="flex border-b border-[#333] sticky top-0 bg-[#121212] z-10">
      <button
        className={`flex-1 py-2 text-center text-sm border-b-2 ${
          !showPDF
            ? "border-primary text-white"
            : "border-transparent text-gray-400"
        }`}
        onClick={() => setShowPDF(false)}
      >
        Chat
      </button>
      <button
        className={`flex-1 py-2 text-center text-sm border-b-2 ${
          showPDF
            ? "border-primary text-white"
            : "border-transparent text-gray-400"
        }`}
        onClick={() => setShowPDF(true)}
      >
        Document
      </button>
    </div>
  );
};