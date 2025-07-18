"use client"

import React from 'react';

const UploadProgress: React.FC = () => {
  return (
    <div className="border border-dashed border-[#333] rounded-lg p-6 text-center mb-4 flex flex-col items-center justify-center">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-2"></div>
      <p className="text-sm text-gray-400">Upload in progress</p>
    </div>
  );
};

export default UploadProgress; 