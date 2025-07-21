import { useState, useEffect, useRef } from "react";
import {
  Loader2,
  FileText,
  Image as ImageIcon,
  ZoomIn,
  ZoomOut,
  MoreVertical,
  Download,
  ExternalLink,
} from "lucide-react";
import Image from "next/image";
import {
  TypeChatInterfaceDocumentViewerProps,
  TypeControlsProps,
} from "@/types/TypeChat";
import { Button } from "@/components/ui/button";

/**
 * A floating toolbar component providing controls for the document viewer.
 * It uses shadcn/ui Buttons and includes zoom controls and a dropdown menu for more actions.
 * The component is only rendered for supported file types (e.g., PDFs).
 * @component
 * @param {object} props - The properties for the component.
 * @param {number} props.zoomLevel - The current zoom level percentage of the document.
 * @param {() => void} props.onZoomIn - Callback function to handle zooming in.
 * @param {() => void} props.onZoomOut - Callback function to handle zooming out.
 * @param {() => void} props.onDownload - Callback function to download the file.
 * @param {() => void} props.onOpenInNewTab - Callback function to open the file in a new tab.
 * @param {boolean} props.showControls - A flag to control the visibility of the toolbar.
 * @param {FileObject | null} props.file - The file object being displayed.
 * @returns {JSX.Element | null} The controls toolbar or null if not applicable.
 */
const Controls: React.FC<TypeControlsProps> = ({
  zoomLevel,
  onZoomIn,
  onZoomOut,
  onDownload,
  onOpenInNewTab,
  showControls,
  file,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Effect to close the dropdown menu when clicking outside of it.
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Do not render controls for non-document types like images or videos.
  if (!file || ["youtube", "image"].includes(file.type || "")) return null;

  return (
    <div
      className={`absolute top-4 left-1/2 transform -translate-x-1/2 flex items-center gap-2 bg-gray-900/90 rounded-lg p-2 shadow-lg transition-opacity duration-300 z-50 ${
        showControls ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <Button
        variant="ghost"
        size="icon"
        onClick={onZoomOut}
        title="Zoom out"
        className="rounded"
      >
        <ZoomOut size={18} className="text-gray-300" />
      </Button>
      <span className="text-sm text-gray-300 min-w-[48px] text-center bg-gray-800 rounded px-2 py-1">
        {zoomLevel}%
      </span>
      <Button
        variant="ghost"
        size="icon"
        onClick={onZoomIn}
        title="Zoom in"
        className="rounded"
      >
        <ZoomIn size={18} className="text-gray-300" />
      </Button>
      <div className="w-px h-6 bg-gray-700 mx-1" />
      <div className="relative" ref={menuRef}>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowMenu(!showMenu)}
          title="More options"
          className="rounded"
        >
          <MoreVertical size={18} className="text-gray-300" />
        </Button>
        {showMenu && (
          <div className="absolute right-0 mt-2 w-48 bg-gray-900 rounded-md shadow-lg border border-gray-800">
            <div className="py-1">
              <Button
                variant="ghost"
                className="px-4 py-2 text-gray-300 hover:bg-gray-800 w-full justify-start"
                onClick={() => {
                  onDownload();
                  setShowMenu(false);
                }}
              >
                <Download size={16} className="mr-2" />
                Download
              </Button>
              <Button
                variant="ghost"
                className="px-4 py-2 text-gray-300 hover:bg-gray-800 w-full justify-start"
                onClick={() => {
                  onOpenInNewTab();
                  setShowMenu(false);
                }}
              >
                <ExternalLink size={16} className="mr-2" />
                Open in new tab
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * A versatile document viewer component for the chat interface.
 * It can render various file types including PDFs, images, YouTube videos, and web pages.
 * It also handles and displays different loading, processing, and error states.
 * @component
 * @param {TypeChatInterfaceDocumentViewerProps} props - The properties for the component.
 * @param {FileObject | null} props.file - The file object to display.
 * @param {boolean} props.isLoading - Flag indicating if the file is currently being loaded.
 * @param {boolean} props.isError - Flag indicating a general error during loading.
 * @param {string} props.title - A title to display when no document is attached.
 * @returns {JSX.Element} The rendered document viewer.
 */
export const ChatInterfaceDocumentViewer: React.FC<
  TypeChatInterfaceDocumentViewerProps
> = ({ file, isLoading, isError, title }) => {
  const [zoomLevel, setZoomLevel] = useState(100);
  const [showControls, setShowControls] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  // Effect to automatically hide the controls after 3 seconds of mouse inactivity.
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    const handleMouseMove = () => {
      setShowControls(true);
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    };
    const container = containerRef.current;
    if (container) {
      container.addEventListener("mousemove", handleMouseMove);
    }
    return () => {
      if (container) {
        container.removeEventListener("mousemove", handleMouseMove);
      }
      clearTimeout(timeoutId);
    };
  }, []);

  // --- Event Handlers ---
  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 10, 200));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 10, 20));

  const handleDownload = () => {
    if (file?.url) {
      const link = document.createElement("a");
      link.href = file.url;
      link.download = file.name;
      link.target = "_blank";
      link.click();
    }
  };

  const handleOpenInNewTab = () => {
    if (file?.url) {
      window.open(file.url, "_blank", "noopener,noreferrer");
    }
  };

  // --- Render States (Loading, Error, Empty) ---
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-gray-400">Loading document...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="bg-red-900/20 rounded-full p-4 mb-4">
          <FileText size={24} className="text-red-400" />
        </div>
        <h3 className="text-lg font-medium mb-2 text-red-400">
          Error loading document
        </h3>
        <p className="text-sm text-gray-400">
          Unable to load the document. Please try again.
        </p>
      </div>
    );
  }

  if (!file) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="bg-gray-800 rounded-full p-4 mb-4">
          <FileText size={24} className="text-gray-500" />
        </div>
        <h3 className="text-lg font-medium mb-2">{title}</h3>
        <p className="text-sm text-gray-400">No document attached</p>
      </div>
    );
  }

  // --- File Processing Status States ---
  if (file.processing_status === "failed") {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <div className="bg-red-900/20 rounded-full p-4 mb-4">
          <FileText size={24} className="text-red-400" />
        </div>
        <h3 className="text-lg font-medium mb-2 text-red-400">
          Document Processing Error
        </h3>
        <p className="text-sm text-gray-400 max-w-md">
          {file.processing_error ||
            "Unable to process this document. It might be empty, scanned, or in an unsupported format."}
        </p>
      </div>
    );
  }

  if (file.processing_status === "processing") {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="bg-blue-900/20 rounded-full p-4 mb-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
        </div>
        <h3 className="text-lg font-medium mb-2 text-blue-400">
          Processing Document
        </h3>
        <p className="text-sm text-gray-400">
          Please wait while we process your document...
        </p>
      </div>
    );
  }

  // --- File Type Specific Renderers ---
  if (file.type === "youtube") {
    const videoId = file.url?.match(
      /(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/watch\?.+&v=))([^&?]+)/,
    );
    if (videoId?.[1]) {
      return (
        <div className="flex items-center justify-center h-full p-4">
          <iframe
            src={`https://www.youtube.com/embed/${videoId[1]}`}
            className="w-full h-full max-w-4xl aspect-video border-0 rounded-lg"
            title="YouTube video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      );
    }
  }

  if (file.type === "web" || file.type === "url") {
    return (
      <div className="flex-1 p-2 overflow-auto">
        <iframe
          src={file.url || ""}
          className="w-full h-full border-0 rounded-lg bg-white"
          title={`Web content from ${file.url}`}
          sandbox="allow-same-origin allow-scripts"
          loading="lazy"
        />
      </div>
    );
  }

  if (
    file.type === "pdf" ||
    ["doc", "docx", "xls", "xlsx", "ppt", "pptx"].includes(file.type || "")
  ) {
    return (
      <div className="flex-1 h-full relative" ref={containerRef}>
        <Controls
          zoomLevel={zoomLevel}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onDownload={handleDownload}
          onOpenInNewTab={handleOpenInNewTab}
          showControls={showControls}
          file={file}
        />
        <div className="h-full w-full overflow-auto">
          <div
            style={{
              width: `${(100 / zoomLevel) * 100}%`,
              height: `${(100 / zoomLevel) * 100}%`,
              transform: `scale(${zoomLevel / 100})`,
              transformOrigin: "top",
            }}
          >
            {file.url && (
              <iframe
                src={`https://docs.google.com/viewer?url=${encodeURIComponent(file.url)}&embedded=true`}
                className="w-full h-full border-0"
                title={`Document: ${file.name}`}
              />
            )}
          </div>
        </div>
      </div>
    );
  }

  if (file.type === "image") {
    return (
      <div className="flex-1 flex items-center justify-center p-4 h-full">
        {file.url ? (
          <div className="relative w-full h-full">
            <Image
              src={file.url}
              alt={file.name}
              fill
              className="object-contain"
            />
          </div>
        ) : (
          <div className="text-center text-gray-500">
            <ImageIcon size={48} className="mx-auto mb-2" />
            <p>No image URL available</p>
          </div>
        )}
      </div>
    );
  }

  // --- Fallback View for Unsupported Types ---
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="bg-gray-800 rounded-full p-4 mb-4">
        <FileText size={24} className="text-gray-500" />
      </div>
      <h3 className="text-lg font-medium">{file.name}</h3>
      <p className="text-sm text-gray-400 mt-1">
        Unsupported file type for viewing
      </p>
    </div>
  );
};

export default ChatInterfaceDocumentViewer;
