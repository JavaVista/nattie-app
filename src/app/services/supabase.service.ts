import { computed, Injectable, signal } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Microblog } from '../microblogs/microblogs.model';
import { AuthState, UserProfile } from '../auth/auth.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  private supabase: SupabaseClient;
  private authState = signal<AuthState>({
    user: null,
    error: null,
    profile: null,
  });

  public user = computed(() => this.authState().user);
  public userProfile = computed<UserProfile | null>(
    () => this.authState().profile
  );
  public isLoggedIn = computed(() => !!this.authState().user);

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseAnonKey);
    this.getUser();
  }

  async signUp(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
    });

    if (!error) {
      this.authState.set({
        user: data.user,
        error: null,
        profile: this.authState().profile,
      });

      if (data.user) {
        await this.fetchUserProfile(data.user.id);
      }
    }
    return { data, error };
  }

  async checkUserExists(userId: string): Promise<boolean> {
    const { data } = await this.supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .limit(1)
      .maybeSingle();

    return data ? true : false;
  }

  async insertUser(userId: string, email: string, name: string) {
    const { data, error } = await this.supabase
      .from('users')
      .insert([
        { id: userId, email, name, created_at: new Date().toISOString() },
      ]);

    if (!error) {
      this.authState.update((state) => ({
        ...state,
        profile: {
          id: userId,
          email,
          name,
        },
      }));
    }

    return { data, error };
  }

  async signIn(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (!error) {
      this.authState.set({
        user: data.user,
        error: null,
        profile: this.authState().profile,
      });

      if (data.user) {
        await this.fetchUserProfile(data.user.id);
      }
    }
    return { data, error };
  }

  async signOut() {
    const { error } = await this.supabase.auth.signOut();
    if (!error) {
      this.authState.set({ user: null, error: null, profile: null });
    }
    return { error };
  }

  async getUser() {
    const { data, error } = await this.supabase.auth.getUser();

    this.authState.set({
      user: data.user,
      error,
      profile: this.authState().profile,
    });

    if (data.user && !this.authState().profile) {
      await this.fetchUserProfile(data.user.id);
    }

    return { data, error };
  }

  /**
   * Fetches the user profile from the users table
   * @param userId The user ID to fetch the profile for
   */
  async fetchUserProfile(userId: string) {
    const { data, error } = await this.supabase
      .from('users')
      .select('id, email, name')
      .eq('id', userId)
      .single();

    if (!error && data) {
      // Update the auth state with the profile data
      this.authState.update((state) => ({
        ...state,
        profile: {
          id: data.id,
          email: data.email,
          name: data.name,
        },
      }));
    }

    return { data, error };
  }

  async createMicroblog(microblog: Microblog) {
    const { data, error } = await this.supabase
      .from('microblogs')
      .insert([{ ...microblog }]);
    return { data, error };
  }

  /**
   * Checks if a filename has problematic characters
   * @param filename The filename to check
   * @returns True if the filename has problematic characters
   */
  private hasProblematicCharacters(filename: string): boolean {
    // Check for characters that might cause issues with cloud storage
    const problematicRegex = /[^\w\-_.]/g;
    return problematicRegex.test(filename) || filename.length > 100;
  }

  /**
   * Generates a unique filename with timestamp and enhanced randomness
   * @param originalFilename The original filename
   * @param userId Optional user ID for additional uniqueness
   * @returns A unique sanitized filename
   */
  private generateUniqueFilename(
    originalFilename: string,
    userId?: string
  ): string {
    const extension = originalFilename.split('.').pop()?.toLowerCase() || '';
    const timestamp = Date.now(); // More precise than date string
    const randomStr = Math.random().toString(36).substring(2, 12); // Longer random string
    const userPrefix = userId ? `${userId.substring(0, 8)}_` : '';

    return `trip_${userPrefix}${timestamp}_${randomStr}.${extension}`;
  }

  /**
   * Sanitizes a filename only if it contains problematic characters
   * @param filename The original filename
   * @param userId Optional user ID for additional uniqueness
   * @returns Original filename if safe, or sanitized version if problematic
   */
  private sanitizeFilenameIfNeeded(filename: string, userId?: string): string {
    // If filename is safe, return it unchanged
    if (!this.hasProblematicCharacters(filename)) {
      return filename;
    }

    // Otherwise, create a sanitized version
    return this.generateUniqueFilename(filename, userId);
  }

  /**
   * Checks if a file exists in storage
   * @param bucket The storage bucket name
   * @param filePath The file path to check
   * @returns Boolean indicating if file exists
   */
  private async fileExists(bucket: string, filePath: string): Promise<boolean> {
    try {
      const { data, error } = await this.supabase.storage
        .from(bucket)
        .list('microblogs', {
          search: filePath.split('/').pop(), // Get just the filename
        });

      if (error) return false;

      return (
        data?.some((file) => file.name === filePath.split('/').pop()) || false
      );
    } catch {
      return false;
    }
  }

  /**
   * Generates a unique file path that doesn't conflict with existing files
   * @param bucket The storage bucket name
   * @param originalFilename The original filename
   * @param userId Optional user ID for additional uniqueness
   * @returns A unique file path
   */
  private async generateUniqueFilePath(
    bucket: string,
    originalFilename: string,
    userId?: string
  ): Promise<string> {
    let attempts = 0;
    const maxAttempts = 5;

    while (attempts < maxAttempts) {
      const filename =
        attempts === 0
          ? this.sanitizeFilenameIfNeeded(originalFilename, userId)
          : this.generateUniqueFilename(originalFilename, userId);

      const filePath = `microblogs/${filename}`;

      // Check if file exists
      const exists = await this.fileExists(bucket, filePath);

      if (!exists) {
        return filePath;
      }

      attempts++;
      // Add small delay to ensure timestamp differences
      await new Promise((resolve) => setTimeout(resolve, 10));
    }

    // Fallback: use current timestamp with high precision
    const fallbackFilename = this.generateUniqueFilename(
      originalFilename,
      userId
    );
    return `microblogs/${fallbackFilename}`;
  }

  /**
   * Uploads a file to Supabase storage with collision handling
   * @param bucket The storage bucket name
   * @param file The file to upload
   * @param userId Optional user ID for filename uniqueness
   * @returns Object containing the publicUrl or error
   */
  async uploadFile(bucket: string, file: File, userId?: string) {
    try {
      // Generate a unique file path
      const filePath = await this.generateUniqueFilePath(
        bucket,
        file.name,
        userId
      );

      console.log(`Uploading file to path: ${filePath}`);

      // Upload the file with the unique path
      const { error } = await this.supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false, // Keep false since we're handling uniqueness manually
        });

      if (error) {
        console.error('Supabase file upload failed:', error.message);

        // If it's still a duplicate error, try with upsert as fallback
        if (error.message.includes('already exists')) {
          console.log('Retrying with upsert enabled...');

          const { error: upsertError } = await this.supabase.storage
            .from(bucket)
            .upload(filePath, file, {
              cacheControl: '3600',
              upsert: true,
            });

          if (upsertError) {
            return { error: upsertError };
          }
        } else {
          return { error };
        }
      }

      const { data: publicUrlData } = this.supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      return { publicUrl: publicUrlData.publicUrl };
    } catch (err) {
      console.error('Unexpected error during file upload:', err);
      return {
        error: {
          message: err instanceof Error ? err.message : 'Unknown upload error',
        },
      };
    }
  }

  async getMicroblogs() {
    const { data, error } = await this.supabase
      .from('microblogs')
      .select('*')
      .order('created_at', { ascending: false });
    return { data, error };
  }

  async updateMicroblog(id: string, updates: Partial<Microblog>) {
    if (updates.file_urls !== undefined) {
      // Get the current blog to compare file URLs
      const { data: currentBlog } = await this.getMicroblogById(id);

      if (currentBlog && currentBlog.file_urls) {
        const currentUrls = new Set<string>(currentBlog.file_urls as string[]);
        const updatedUrls = new Set<string>(updates.file_urls);
        const removedUrls = [...currentUrls].filter(
          (url) => !updatedUrls.has(url)
        );

        if (removedUrls.length > 0) {
          const deleteResult = await this.deleteFiles(
            'microblog-media',
            removedUrls
          );
        } else {
          console.log('No files to delete');
        }
      } else {
        console.log('No current file_urls to compare with');
      }
    } else {
      console.log('No file_urls updates, skipping file deletion check');
    }

    // Proceed with the database update
    const { data, error } = await this.supabase
      .from('microblogs')
      .update(updates)
      .match({ id });

    if (error) {
      console.error('Error updating microblog in database:', error);
    } else {
      console.log('Microblog updated successfully in database');
    }

    return { data, error };
  }

  async getMicroblogById(id: string) {
    const { data, error } = await this.supabase
      .from('microblogs')
      .select('*, places(*), locations(*)')
      .eq('id', id)
      .single();

    return { data, error };
  }

  /**
   * Deletes a file from Supabase storage
   * @param bucket The storage bucket name
   * @param fileUrl The full URL of the file to delete
   * @returns Object containing success status or error
   */
  async deleteFile(bucket: string, fileUrl: string) {
    try {
      // Extract the file path from the URL
      // URLs look like: https://icymhxalnlyozdzmqltg.supabase.co/storage/v1/object/public/microblog-media/microblogs/filename.jpg
      const pathRegex = new RegExp(`public/${bucket}/(.+)`);
      const match = fileUrl.match(pathRegex);

      if (!match || !match[1]) {
        console.error('Could not extract file path from URL:', fileUrl);
        return { error: { message: 'Invalid file URL format' } };
      }

      const filePath = match[1];

      const { data, error } = await this.supabase.storage
        .from(bucket)
        .remove([filePath]);

      if (error) {
        console.error('Supabase returned error deleting file:', error);
        return { error };
      }

      return { success: true, data };
    } catch (err) {
      console.error('Unexpected error during file deletion:', err);
      return {
        error: {
          message:
            err instanceof Error ? err.message : 'Unknown deletion error',
        },
      };
    }
  }

  /**
   * Deletes multiple files from Supabase storage
   * @param bucket The storage bucket name
   * @param fileUrls Array of file URLs to delete
   * @returns Object containing success status or error
   */
  async deleteFiles(bucket: string, fileUrls: string[]) {
    try {
      const results = await Promise.all(
        fileUrls.map((url) => this.deleteFile(bucket, url))
      );

      // Check if any deletion failed
      const errors = results
        .filter((result) => result.error)
        .map((result) => result.error?.message);

      if (errors.length > 0) {
        console.error('Some files failed to delete:', errors);
        return {
          error: {
            message: `Some files failed to delete: ${errors.join(', ')}`,
          },
          partialSuccess: true,
        };
      }

      return { success: true };
    } catch (err) {
      console.error('Error in batch file deletion:', err);
      return {
        error: {
          message:
            err instanceof Error ? err.message : 'Unknown batch deletion error',
        },
      };
    }
  }

  async deleteMicroblog(id: string) {
    // First get the blog to retrieve file URLs
    const { data: blog, error: getBlogError } = await this.getMicroblogById(id);

    if (getBlogError || !blog) {
      console.error('Error retrieving blog for deletion:', getBlogError);
      return { error: getBlogError || { message: 'Blog not found' } };
    }

    // Delete files from storage if there are any
    if (blog.file_urls && blog.file_urls.length > 0) {
      const deleteResult = await this.deleteFiles(
        'microblog-media',
        blog.file_urls as string[]
      );

      if (deleteResult.error && !deleteResult.partialSuccess) {
        return { error: deleteResult.error };
      }
    } else {
      console.log('No files to delete for this blog');
    }

    const { data, error } = await this.supabase
      .from('microblogs')
      .delete()
      .match({ id });

    if (error) {
      console.error('Error deleting blog from database:', error);
    } else {
      console.log('Blog deleted successfully from database');
    }

    return { data, error };
  }

  async getBlogsByCountry(country: string) {
    const { data, error } = await this.supabase
      .from('microblogs')
      .select('*')
      .eq('country', country)
      .order('created_at', { ascending: false });

    return { data, error };
  }
}
