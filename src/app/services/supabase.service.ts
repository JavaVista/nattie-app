import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { env } from 'src/environments/env';
import { Microblog } from '../microblogs/microblogs.model';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(env.supabaseUrl, env.supabaseAnonKey);
  }

  async signUp(email: string, password: string) {
    return await this.supabase.auth.signUp({ email, password });
  }
  async signIn(email: string, password: string) {
    return await this.supabase.auth.signInWithPassword({ email, password });
  }

  async signOut() {
    return await this.supabase.auth.signOut();
  }

  async getUser() {
    return await this.supabase.auth.getUser();
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
