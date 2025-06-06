import { supabase } from '../auth/supabaseClient';
import { v4 as uuidv4 } from 'uuid';

export interface ImageUploadResult {
  url: string;
  publicUrl: string;
  path: string;
}

export class ImageStorage {
  private static readonly BUCKET_NAME = 'post-images';
  
  /**
   * Upload multiple images to Supabase Storage
   */
  static async uploadImages(files: File[], userId: string): Promise<ImageUploadResult[]> {
    const uploadPromises = files.map(file => this.uploadSingleImage(file, userId));
    return Promise.all(uploadPromises);
  }

  /**
   * Upload a single image to Supabase Storage
   */
  static async uploadSingleImage(file: File, userId: string): Promise<ImageUploadResult> {
    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${uuidv4()}.${fileExt}`;
    
    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(this.BUCKET_NAME)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      throw new Error(`Failed to upload image: ${error.message}`);
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from(this.BUCKET_NAME)
      .getPublicUrl(fileName);

    return {
      url: data.path,
      publicUrl: publicUrlData.publicUrl,
      path: fileName
    };
  }

  /**
   * Delete an image from Supabase Storage
   */
  static async deleteImage(path: string): Promise<void> {
    const { error } = await supabase.storage
      .from(this.BUCKET_NAME)
      .remove([path]);

    if (error) {
      throw new Error(`Failed to delete image: ${error.message}`);
    }
  }

  /**
   * Delete multiple images from Supabase Storage
   */
  static async deleteImages(paths: string[]): Promise<void> {
    const { error } = await supabase.storage
      .from(this.BUCKET_NAME)
      .remove(paths);

    if (error) {
      throw new Error(`Failed to delete images: ${error.message}`);
    }
  }

  /**
   * Get the public URL for an image
   */
  static getPublicUrl(path: string): string {
    const { data } = supabase.storage
      .from(this.BUCKET_NAME)
      .getPublicUrl(path);
    
    return data.publicUrl;
  }
}
