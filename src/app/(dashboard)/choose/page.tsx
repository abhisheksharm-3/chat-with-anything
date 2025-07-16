"use client"

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

// Import images
import pdfIcon from '@/assets/images/logos/pdf.png';
import docsIcon from '@/assets/images/logos/docs.png';
import sheetsIcon from '@/assets/images/logos/sheets.png';
import slidesIcon from '@/assets/images/logos/slides.png';
import imageIcon from '@/assets/images/logos/flat-color-icons_image-file.png';
import youtubeIcon from '@/assets/images/logos/youtube.png';
import githubIcon from '@/assets/images/logos/github.png';
import notionIcon from '@/assets/images/logos/notion.png';
import webIcon from '@/assets/images/logos/web.png';

// File type options with their respective images
const fileTypes = [
  {
    id: 'pdf',
    name: 'PDF',
    image: pdfIcon,
  },
  {
    id: 'youtube',
    name: 'Youtube Video',
    image: youtubeIcon,
  },
  {
    id: 'web',
    name: 'Web',
    image: webIcon,
  },
  {
    id: 'docs',
    name: 'Google Doc',
    image: docsIcon,
  },
  {
    id: 'notion',
    name: 'Notion Page',
    image: notionIcon,
  },
  {
    id: 'github',
    name: 'Github Repo',
    image: githubIcon,
  },
  {
    id: 'image',
    name: 'Image',
    image: imageIcon,
  },
  {
    id: 'slides',
    name: 'Google Slide',
    image: slidesIcon,
    comingSoon: true,
  },
  {
    id: 'sheets',
    name: 'Google Sheet',
    image: sheetsIcon,
    comingSoon: true,
  },
];

// Function to generate a new unique chat ID
const generateNewChatId = (sourceType: string) => {
  // In a real app, this would be handled by the backend
  // For now, we'll just use a timestamp + random number
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `new-${sourceType}-${timestamp}-${random}`;
};

export default function ChoosePage() {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <h2 className="text-center text-gray-300 mb-8">
        Pick any file from below you want to chat with
      </h2>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-w-2xl">
        {fileTypes.map((fileType) => (
          <Link 
            key={fileType.id}
            href={fileType.comingSoon ? '#' : `/chat/${generateNewChatId(fileType.id)}`}
            className="group"
          >
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 flex flex-col items-center justify-center h-32 hover:border-gray-700 transition-colors relative">
              <div className="w-12 h-12 mb-2 relative">
                <Image
                  src={fileType.image} 
                  alt={fileType.name} 
                  width={48}
                  height={48}
                  className={fileType.comingSoon ? "opacity-50" : ""}
                />
              </div>
              <span className="text-sm text-center text-gray-300">{fileType.name}</span>
              
              {fileType.comingSoon && (
                <div className="absolute bottom-2 left-0 right-0 flex justify-center">
                  <span className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full">
                    Coming soon
                  </span>
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
} 