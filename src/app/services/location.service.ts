import { Injectable, signal } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { env } from 'src/environments/env';
import { Location } from '../locations/location.model';

@Injectable({
  providedIn: 'root',
})
export class LocationService {
  private supabase: SupabaseClient;
  locations = signal<Location[]>([]);

  constructor() {
    this.supabase = createClient(env.supabaseUrl, env.supabaseAnonKey);
  }

  async fetchLocations() {
    const { data, error } = await this.supabase.from('locations').select('*');
    if (!error) {
      this.locations.set(data as Location[]);
    }
  }

  async createLocation(location: Partial<Location>) {
    const { data, error } = await this.supabase
      .from('locations')
      .insert(location)
      .select()
      .single();
    return { data, error };
  }
}
