import { computed, Injectable, signal } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { env } from 'src/environments/env';
import { Microblog } from '../microblogs/microblogs.model';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;
  private authState = signal<{ user: any | null; error: any | null; }>({ user: null, error: null });
  public user = computed(() => this.authState().user);
  public isLoggedIn = computed(() => !!this.authState().user);

  constructor() {
    this.supabase = createClient(env.supabaseUrl, env.supabaseAnonKey);
    this.getUser().then(() => {
      console.log("authState initialized");
    });
  }

  async signUp(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signUp({ email, password });
    if (!error) {
      this.authState.set({ user: data.user, error: null });
    }
    return { data, error };
  }

  async signIn(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({ email, password });
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

  async getMicroblogs() {
    const { data, error } = await this.supabase
      .from('microblogs')
      .select('*')
      .order('createdAt', { ascending: false });
    return { data, error };
  }


  async updateMicroblog(id: string, updates: Partial<Microblog>) {
    const { data, error } = await this.supabase
      .from('microblogs')
      .update(updates)
      .match({ id });
    return { data, error };
  }

  async deleteMicroblog(id: string) {
    const { data, error } = await this.supabase
      .from('microblogs')
      .delete()
      .match({ id });
    return { data, error };
  }
}
