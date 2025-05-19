import { computed, Injectable, signal } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { env } from 'src/environments/env';
import { Microblog } from '../microblogs/microblogs.model';

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  private supabase: SupabaseClient;
  private authState = signal<{ user: any | null; error: any | null }>({
    user: null,
    error: null,
  });
  public user = computed(() => this.authState().user);
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
      this.authState.set({ user: data.user, error: null });
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
    return { data, error };
  }

  async signIn(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (!error) {
      this.authState.set({ user: data.user, error: null });
    }
    return { data, error };
  }

  async signOut() {
    const { error } = await this.supabase.auth.signOut();
    if (!error) {
      this.authState.set({ user: null, error: null });
    }
    return { error };
  }

  async getUser() {
    const { data, error } = await this.supabase.auth.getUser();
    this.authState.set({ user: data.user, error });
    return { data, error };
  }

  async createMicroblog(microblog: Microblog) {
    const { data, error } = await this.supabase
      .from('microblogs')
      .insert([{ ...microblog }]);
    return { data, error };
  }

  async uploadFile(bucket: string, file: File) {
    const filePath = `microblogs/${Date.now()}-${file.name}`;

    const { data, error } = await this.supabase.storage
      .from(bucket)
      .upload(filePath, file);

    if (error) {
      console.error('Supabase file upload failed:', error.message);
      return { error };
    }

    const { data: publicUrlData } = this.supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return { publicUrl: publicUrlData.publicUrl };
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
    return this.supabase
      .from('microblogs')
      .select('*, places(*), locations(*)')
      .eq('id', id)
      .single();
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
