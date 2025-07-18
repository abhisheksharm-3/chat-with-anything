/**
 * Image utilities module
 * 
 * This module contains client-side utility functions for working with images.
 * These functions are not marked with "use server" and can be used on the client.
 */

/**
 * Prepare image context for chat
 * This creates a context message to be sent to the model
 */
export function createImageContext(fileName: string, userQuery: string, imageUrl?: string): string {
  if (imageUrl) {
    // If we have an image URL, include it in the context
    return `I'm looking at an image file named "${fileName}" with URL: ${imageUrl}. ${userQuery}`;
  }
  
  // Otherwise, just use the file name
  return `I'm looking at an image file named "${fileName}". ${userQuery}`;
}

/**
 * Check if a file is an image based on its MIME type
 */
export function isImageFile(mimeType: string): boolean {
  return mimeType.startsWith('image/');
} 