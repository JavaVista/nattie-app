import { computed, Injectable, signal } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { env } from 'src/environments/env';
import { Microblog } from '../microblogs/microblogs.model';
import { AuthState, UserProfile } from '../auth/auth.model';

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
    this.supabase = createClient(env.supabaseUrl, env.supabaseAnonKey);
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
   * Sanitizes a filename only if it contains problematic characters
   * @param filename The original filename
   * @returns Original filename if safe, or sanitized version if problematic
   */
  private sanitizeFilenameIfNeeded(filename: string): string {
    // If filename is safe, return it unchanged
    if (!this.hasProblematicCharacters(filename)) {
      return filename;
    }

    // Otherwise, create a sanitized version
    const extension = filename.split('.').pop()?.toLowerCase() || '';
    const dateStamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomStr = Math.random().toString(36).substring(2, 8);

    return `trip_${dateStamp}_${randomStr}.${extension}`;
  }

  /**
   * Uploads a file to Supabase storage
   * @param bucket The storage bucket name
   * @param file The file to upload
   * @returns Object containing the publicUrl or error
   */
  async uploadFile(bucket: string, file: File) {
    try {
      // Check if the filename needs sanitization
      const finalFilename = this.sanitizeFilenameIfNeeded(file.name);
      const filePath = `microblogs/${finalFilename}`;

      // Upload the file with the sanitized name if needed
      const { error } = await this.supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        console.error('Supabase file upload failed:', error.message);
        return { error };
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
    const { data, error } = await this.supabase
      .from('microblogs')
      .update(updates)
      .match({ id });

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

  async deleteMicroblog(id: string) {
    const { data, error } = await this.supabase
      .from('microblogs')
      .delete()
      .match({ id });
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
