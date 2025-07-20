"use client";

import { TypeUploadModalErrorProps } from "@/types/upload";
import { AlertCircle } from "lucide-react";
import { Button } from "../ui/button";

/**
 * A presentational component used to display an error state after a file upload fails.
 *
 * It shows a specific error message passed via props and provides a "Try again"
 * button to allow the user to re-initiate the upload process.
 *
 * @component
 * @param {TypeUploadModalErrorProps} props - The properties for the component.
 * @param {string | null | undefined} props.error - The error message to display. A default message is used if not provided.
 * @param {() => void} props.handleRetry - The callback function to execute when the "Try again" button is clicked.
 * @returns {JSX.Element} The rendered error state component.
 */
const UploadModalError: React.FC<TypeUploadModalErrorProps> = ({
  error,
  handleRetry,
}) => {
  return (
    <div className="border border-dashed border-red-500 rounded-lg p-6 text-center mb-4">
      <div className="flex items-center justify-center mb-2">
        <AlertCircle className="text-red-500 h-5 w-5 mr-2" />
        <p className="text-sm text-red-500 font-medium">Upload Failed</p>
      </div>
      <p className="text-sm text-red-400">
        {error || "An error occurred during upload"}
      </p>
      <Button variant="outline" className="mt-3" onClick={handleRetry}>
        Try again
      </Button>
    </div>
  );
};

export default UploadModalError;
