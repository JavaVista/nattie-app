import { effect, Injectable, signal } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { env } from 'src/environments/env';
import { Location } from '../locations/location.model';

@Injectable({
  providedIn: 'root',
})
export class LocationService {
  private supabase: SupabaseClient;
  locations = signal<Location[]>([]);
  selectedLocation = signal<Location | null>(null);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  constructor() {
    this.supabase = createClient(env.supabaseUrl, env.supabaseAnonKey);
  }

  async fetchLocations() {
    try {
      this.loading.set(true);
      this.error.set(null);

      const { data, error } = await this.supabase.from('locations').select('*');

      if (error) {
        throw error;
      }

      this.locations.set(data as Location[]);
      return data;
    } catch (err) {
      console.error('Error fetching locations:', err);
      this.error.set(
        err instanceof Error ? err.message : 'Unknown error occurred'
      );
      return [];
    } finally {
      this.loading.set(false);
    }
  }

  async createLocation(location: Partial<Location>) {
    const existingLocation = this.locations().find(
      (loc) =>
        loc.city.toLowerCase() === location.city?.toLowerCase() &&
        loc.country.toLowerCase() === location.country?.toLowerCase()
    );

    if (existingLocation) {
      return { data: existingLocation, error: null };
    }

    const { data, error } = await this.supabase
      .from('locations')
      .insert(location)
      .select()
      .single();

    if (!error && data) {
      const updatedLocations = [...this.locations(), data as Location];
      this.locations.set(updatedLocations);
    }

    return { data, error };
  }

  setSelectedLocation(location: Location) {
    this.selectedLocation.set(location);
  }

  getSelectedLocation(): Location | null {
    return this.selectedLocation();
  }
}
