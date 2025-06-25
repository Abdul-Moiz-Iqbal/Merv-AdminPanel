// utils/cloudinary.ts
import cloudinary from '@/lib/cloudinary';

export interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  width: number;
  height: number;
  format: string;
  resource_type: string;
}

export interface CloudinaryUploadOptions {
  folder?: string;
  transformation?: {
    width?: number;
    height?: number;
    crop?: string;
    quality?: string | number;
  };
  resource_type?: 'image' | 'video' | 'raw' | 'auto';
}

/**
 * Upload a file to Cloudinary
 * @param file - File buffer or base64 string
 * @param options - Upload options
 * @returns Promise with upload result
 */
export async function uploadToCloudinary(
  file: Buffer | string,
  options: CloudinaryUploadOptions = {}
): Promise<CloudinaryUploadResult> {
  try {
    const uploadOptions = {
      folder: options.folder || 'companies',
      resource_type: options.resource_type || 'auto',
      transformation: options.transformation || {
        width: 500,
        height: 500,
        crop: 'fill',
        quality: 'auto',
      },
    };

    const result = await cloudinary.uploader.upload(file.toString(), uploadOptions);
    
    return {
      public_id: result.public_id,
      secure_url: result.secure_url,
      width: result.width,
      height: result.height,
      format: result.format,
      resource_type: result.resource_type,
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Failed to upload image to Cloudinary');
  }
}

/**
 * Delete a file from Cloudinary
 * @param publicId - The public ID of the file to delete
 * @param resourceType - Type of resource (image, video, raw)
 * @returns Promise with deletion result
 */
export async function deleteFromCloudinary(
  publicId: string,
  resourceType: 'image' | 'video' | 'raw' = 'image'
): Promise<{ result: string }> {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
    
    return result;
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw new Error('Failed to delete image from Cloudinary');
  }
}

/**
 * Get optimized image URL from Cloudinary
 * @param publicId - The public ID of the image
 * @param options - Transformation options
 * @returns Optimized image URL
 */
export function getOptimizedImageUrl(
  publicId: string,
  options: {
    width?: number;
    height?: number;
    crop?: string;
    quality?: string | number;
    format?: string;
  } = {}
): string {
  return cloudinary.url(publicId, {
    ...options,
    secure: true,
  });
}

/**
 * Extract public ID from Cloudinary URL
 * @param url - Cloudinary URL
 * @returns Public ID or null if invalid URL
 */
export function extractPublicIdFromUrl(url: string): string | null {
  try {
    const regex = /\/(?:image|video|raw)\/upload\/(?:v\d+\/)?(.+?)(?:\.[^.]+)?$/;
    const match = url.match(regex);
    return match ? match[1] : null;
  } catch (error) {
    console.error('Error extracting public ID:', error);
    return null;
  }
}