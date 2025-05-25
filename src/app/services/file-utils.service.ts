import { Injectable, inject } from '@angular/core';
import { FilePicker } from '@capawesome/capacitor-file-picker';
import { Platform } from '@ionic/angular/standalone';
import heic2any from 'heic2any';

@Injectable({
  providedIn: 'root',
})
export class FileUtilsService {
  private platform = inject(Platform);

  /**
   * Checks if a file is in HEIC format
   * @param file The file to check
   * @returns True if the file is in HEIC format
   */
  isHeicFile(file: File): boolean {
    return (
      file.type === 'image/heic' ||
      file.name.toLowerCase().endsWith('.heic') ||
      file.name.toLowerCase().endsWith('.heif')
    );
  }

  /**
   * Generates a consistent filename for converted HEIC files
   * @param originalFilename The original filename
   * @returns A consistent filename with jpg extension
   */
  private generateConvertedFilename(originalFilename: string): string {
    const dateStamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomStr = Math.random().toString(36).substring(2, 8);
    return `trip_${dateStamp}_${randomStr}.jpg`;
  }

  /**
   * Converts a HEIC file to JPEG format with progress reporting
   * @param file The HEIC file to convert
   * @param progressCallback Optional callback for conversion progress
   * @returns Promise with the converted JPEG File
   */
  async convertHeicToJpeg(
    file: File,
    progressCallback?: (progress: number) => void
  ): Promise<File> {
    // If not a HEIC file, return the original file
    if (!this.isHeicFile(file)) {
      console.log('Not a HEIC file, skipping conversion:', file.name);
      if (progressCallback) progressCallback(100);
      return file;
    }

    try {
      // start of conversion
      if (progressCallback) progressCallback(10);

      const newFilename = this.generateConvertedFilename(file.name);

      if (this.platform.is('hybrid')) {
        // Native mobile device conversion
        console.log('Converting HEIC to JPEG on mobile device:', file.name);

        // Report progress at different stages
        if (progressCallback) progressCallback(30);

        const base64 = await this.fileToBase64(file);

        if (progressCallback) progressCallback(50);

        const result = await FilePicker.convertHeicToJpeg({
          heicBase64: base64.split(',')[1],
        } as any);

        if (progressCallback) progressCallback(80);

        const convertedFile = this.base64ToFile(
          `data:image/jpeg;base64,${(result as any).jpegBase64}`,
          newFilename
        );

        if (progressCallback) progressCallback(100);

        return convertedFile;
      } else {
        // Browser-based conversion
        console.log('Converting HEIC to JPEG in browser:', file.name);

        if (progressCallback) progressCallback(30);

        const blob = await heic2any({
          blob: file,
          toType: 'image/jpeg',
          quality: 0.8,
        });

        if (progressCallback) progressCallback(80);

        // Convert the blob to a File object
        const jpegBlob = Array.isArray(blob) ? blob[0] : blob;
        const convertedFile = new File([jpegBlob], newFilename, {
          type: 'image/jpeg',
        });

        if (progressCallback) progressCallback(100);

        return convertedFile;
      }
    } catch (error) {
      console.error('Error converting HEIC to JPEG:', error);

      // Report error but mark as complete
      if (progressCallback) progressCallback(100);

      // If conversion fails, still use the consistent naming pattern
      const fallbackFilename = this.generateConvertedFilename(file.name);
      const renamedFile = new File([file], fallbackFilename, {
        type: 'image/jpeg',
      });
      return renamedFile;
    }
  }

  /**
   * Converts a File to base64 string
   * @param file The file to convert
   * @returns Promise with base64 string
   */
  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  }

  /**
   * Converts a base64 string to a File object
   * @param base64 The base64 string
   * @param filename The name for the file
   * @returns File object
   */
  private base64ToFile(base64: string, filename: string): File {
    const arr = base64.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }

    return new File([u8arr], filename, { type: mime });
  }
}
