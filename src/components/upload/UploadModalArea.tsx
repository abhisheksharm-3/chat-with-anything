"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { TypeUploadModalAreaProps } from "@/types/types";
import React from "react";

/**
 * A reusable component that renders a file upload area (a "drop zone").
 *
 * It provides a clickable and drag-and-drop-ready interface for file selection.
 * The specific file types, size limits, and handling logic are controlled by props,
 * making it adaptable for different upload scenarios.
 *
 * @component
 * @param {TypeUploadModalAreaProps} props - The properties for the component.
 * @param {object} props.fileTypeConfig - An object containing the configuration for the allowed file type.
 * @param {string} props.fileTypeConfig.name - The display name of the file type (e.g., "PDF").
 * @param {string} props.fileTypeConfig.accept - The `accept` attribute string for the file input (e.g., 'application/pdf').
 * @param {number} props.fileTypeConfig.maxSize - The maximum file size in bytes.
 * @param {File | null} props.selectedFile - The currently selected file, used to display its name.
 * @param {(event: React.ChangeEvent<HTMLInputElement>) => void} props.handleFileChange - The callback function triggered when a user selects a file.
 * @returns {JSX.Element} The rendered file upload area.
 */
const UploadModalArea: React.FC<TypeUploadModalAreaProps> = ({
  fileTypeConfig,
  selectedFile,
  handleFileChange,
}) => {
  return (
    <div className="border border-dashed border-[#333] rounded-lg p-6 text-center mb-4">
      <Label htmlFor="file-upload" className="cursor-pointer block">
        <Input
          type="file"
          id="file-upload"
          className="hidden"
          onChange={handleFileChange}
          accept={fileTypeConfig.accept}
        />
        <p className="text-sm">
          <span className="text-primary hover:text-primary/90 cursor-pointer">
            Click to upload
          </span>{" "}
          or drag and drop
        </p>
        <p className="text-xs text-gray-400 mt-1">
          {fileTypeConfig.name} (max. {fileTypeConfig.maxSize / (1024 * 1024)}
          MB)
        </p>
      </Label>
      {selectedFile && (
        <div className="mt-2 text-sm text-gray-300">
          Selected: {selectedFile.name}
        </div>
      )}
    </div>
  );
};

export default UploadModalArea;
