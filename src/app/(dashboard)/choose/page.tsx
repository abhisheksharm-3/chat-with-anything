// src/app/dashboard/page.tsx

import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import UploadModal from "@/components/upload/UploadModal";
import { Metadata } from "next";
import { FileTypes } from "@/constants/FileTypes"; // Assuming this is your import

export const metadata: Metadata = {
  title: "New Chat - Inquora",
  description: "Select a source to start a new conversation.",
};

/**
 * Renders the file type selection page with a beautiful "glass" UI.
 */
const ChoosePage = () => {
  return (
    <div className="flex h-full flex-col items-center justify-center">
      {/* Themed header with gradient text */}
      <div className="text-center">
        <h1 className="text-5xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-neutral-50 to-neutral-300 md:text-6xl">
          Start a New Conversation
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-neutral-300">
          Choose a source from below to begin uploading your data and chat with our intelligent AI.
        </p>
      </div>

      <div className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:max-w-4xl lg:gap-6">
        {FileTypes.map((fileType) => (
          <div key={fileType.type}>
            {fileType.comingSoon ? (
              // Disabled "glass" card for upcoming features
              <Card className="relative h-36 w-full cursor-not-allowed overflow-hidden rounded-2xl border border-white/10 bg-black/20 p-4 opacity-50 backdrop-blur-lg">
                <CardContent className="flex h-full flex-col items-center justify-center gap-3">
                  <Image src={fileType.image} alt={fileType.name} width={40} height={40} />
                  <span className="text-sm font-medium text-center text-neutral-300">
                    {fileType.name}
                  </span>
                  <Badge variant="outline" className="absolute top-2 right-2 border-primary/50 bg-primary/10 text-primary">
                    SOON
                  </Badge>
                </CardContent>
              </Card>
            ) : (
              // Active "glass" card that triggers the upload modal
              <UploadModal
                fileType={fileType.type}
                trigger={
                  <Card className="group h-36 w-full cursor-pointer overflow-hidden rounded-2xl border border-white/10 bg-black/20 p-4 backdrop-blur-lg transition-all duration-300 hover:border-white/20 hover:bg-white/10 hover:-translate-y-1">
                    <CardContent className="flex h-full flex-col items-center justify-center gap-3">
                      <Image src={fileType.image} alt={fileType.name} width={40} height={40} className="transition-transform duration-300 group-hover:scale-110" />
                      <span className="text-sm font-medium text-center text-neutral-200">
                        {fileType.name}
                      </span>
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