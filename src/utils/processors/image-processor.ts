"use server";

/**
 * Image processor module
 * 
 * This module handles image processing for chat interactions.
 * Unlike document processors, images don't need to be chunked or indexed.
 * Instead, they are sent directly to the model with appropriate context.
 */

/**
 * Process an image for chat
 * Currently, we don't need to do any processing for images
 * as they are handled directly by the Gemini model
 */
export async function processImage(
  fileBlob: Blob,
  fileName: string
): Promise<{ success: boolean }> {
  console.log(`Processing image: ${fileName}`);
  
  try {
    // Validate that this is actually an image file
    if (!fileBlob.type.startsWith('image/')) {
      throw new Error(`File is not an image: ${fileBlob.type}`);
    }
    
    // For now, we don't need to do any processing for images
    // They are sent directly to the model with the appropriate context
    // This function exists for future expansion and consistency with other processors
    
    console.log(`Image processed successfully: ${fileName}`);
    
    return {
      success: true
    };
  } catch (error) {
    console.error("Error processing image:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to process image: ${errorMessage}`);
  }
}

/**
 * Get image file information
 * This is a placeholder for future expansion
 */
export async function getImageInfo(fileBlob: Blob): Promise<{ width: number; height: number; format: string }> {
  return new Promise((resolve, reject) => {
    try {
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(img.src);
        resolve({
          width: img.width,
          height: img.height,
          format: fileBlob.type.split('/')[1] || 'unknown'
        });
      };
      img.onerror = () => {
        URL.revokeObjectURL(img.src);
        reject(new Error('Failed to load image'));
      };
      img.src = URL.createObjectURL(fileBlob);
    } catch (error) {
      reject(error);
    }
  });
} 