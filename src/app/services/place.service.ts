import { inject, Injectable, signal } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Place } from '../places/place.model';
import { LocationService } from './location.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class PlaceService {
  private supabase: SupabaseClient;
  places = signal<Place[]>([]);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);
  private locationService = inject(LocationService);

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseAnonKey);
  }

  async createPlace(place: Partial<Place>) {
    // Ensure a location_id is provided
    if (!place.location_id) {
      return {
        data: null,
        error: {
          message: 'A location must be selected before creating a place',
        },
      };
    }

    // Check if the place already exists for this location
    const existingPlace = this.places().find(
      (p) =>
        p.place_name.toLowerCase() === place.place_name?.toLowerCase() &&
        p.location_id === place.location_id
    );

    if (existingPlace) {
      return { data: existingPlace, error: null };
    }

    const { data, error } = await this.supabase
      .from('places')
      .insert(place)
      .select()
      .single();

    if (!error && data) {
      this.places.update((places) => [...places, data as Place]);
    }

    return { data, error };
  }

  async fetchPlaces() {
    try {
      this.loading.set(true);
      this.error.set(null);
      const { data, error } = await this.supabase.from('places').select('*');

      if (error) {
        throw error;
      }

      this.places.set(data as Place[]);
      return data;
    } catch (err) {
      console.error('Error fetching places:', err);
      this.error.set(
        err instanceof Error ? err.message : 'Unknown error occurred'
      );
      return [];
    } finally {
      this.loading.set(false);
    }
  }

  async fetchPlacesByLocationId(locationId: string): Promise<Place[]> {
    try {
      this.loading.set(true);
      this.error.set(null);

      const { data, error } = await this.supabase
        .from('places')
        .select('*')
        .eq('location_id', locationId); // Filter by locationId

      if (error) {
        throw error;
      }

      this.places.set(data as Place[]); // Update the places signal
      return data as Place[];
    } catch (err) {
      console.error('Error fetching places:', err);
      this.error.set(
        err instanceof Error ? err.message : 'Unknown error occurred'
      );
      return [];
    } finally {
      this.loading.set(false);
    }
  }
}
