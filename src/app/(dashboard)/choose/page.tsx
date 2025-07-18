"use client"

import React from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { fileTypes } from '@/constants/FileTypes';
import UploadModal from '@/components/upload/UploadModal';

const ChoosePage = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <h2 className="text-center text-gray-300 mb-8">
        Pick any file from below you want to chat with
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-w-2xl">
        {fileTypes.map((fileType) => (
          <div key={fileType.type} className="group">
            {fileType.comingSoon ? (
              <Card className="h-32 w-full hover:bg-muted/50 transition-colors">
                <CardContent className='flex flex-col items-center justify-center gap-3 h-full relative'>
                  <div className="h-12 w-12 flex items-center justify-center">
                    <Image
                      src={fileType.image}
                      alt={fileType.name}
                      width={40}
                      height={40}
                      className="opacity-50 object-contain"
                    />
                  </div>
                  <span className="text-sm text-center text-gray-300">{fileType.name}</span>
                  <div className="absolute bottom-2 left-0 right-0 flex justify-center translate-y-11">
                    <span className="text-xs bg-foreground text-primary px-2 py-1 rounded-xl tracking-tighter font-bold">
                      COMING SOON
                    </span>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <UploadModal 
                fileType={fileType.type}
                trigger={
                  <Card className="h-32 w-full hover:bg-muted/50 transition-colors cursor-pointer">
                    <CardContent className='flex flex-col items-center justify-center gap-3 h-full relative'>
                      <div className="h-12 w-12 flex items-center justify-center">
                        <Image
                          src={fileType.image}
                          alt={fileType.name}
                          width={40}
                          height={40}
                          className="object-contain"
                        />
                      </div>
                      <span className="text-sm text-center text-gray-300">{fileType.name}</span>
                    </CardContent>
                  </Card>
                }
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChoosePage;