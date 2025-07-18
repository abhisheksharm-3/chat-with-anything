/**
 * Upload utility functions
 */

export const isValidUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol.startsWith('http');
  } catch {
    return false;
  }
};

export const getUrlType = (url: string, fileType: string): string => {
  if (fileType === 'youtube' || url.includes('youtube.com') || url.includes('youtu.be')) {
    return 'youtube';
  }
  return 'web';
};

export const getErrorMessage = (error: unknown): string => {
  if (!(error instanceof Error)) return 'An unknown error occurred';
  
  const { message } = error;
  
  if (message.includes('NEXT_REDIRECT')) {
    return ''; // Not actually an error
  }
  
  if (message.includes('new row violates row-level security policy')) {
    return 'Permission denied: You do not have permission to upload files. Please check that you are properly logged in.';
  }
  
  if (message.includes('JWT')) {
    return 'Your session has expired. Please log in again.';
  }
  
  if (message.includes('bucket')) {
    return 'Storage error: The file storage system is not properly configured.';
  }
  
  return message;
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};