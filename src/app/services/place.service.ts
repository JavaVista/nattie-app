import { inject, Injectable, signal } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { env } from 'src/environments/env';
import { Place } from '../places/place.model';
import { LocationService } from './location.service';

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
    this.supabase = createClient(env.supabaseUrl, env.supabaseAnonKey);
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
    } catch (err) {
      console.error('Error fetching places:', err);
      this.error.set(
        err instanceof Error ? err.message : 'Unknown error occurred'
      );
    } finally {
      this.loading.set(false);
    }
  }

  async createPlace(place: Partial<Place>, locationId?: string) {
    const existingPlace = this.places().find(
      (loc) => loc.place_name.toLowerCase() === place.place_name?.toLowerCase()
    );

    if (existingPlace) {
      return { data: existingPlace, error: null };
    }

    const finalLocationId =
      locationId || this.locationService.getSelectedLocation()?.id;

    const placeWithLocation: Partial<Place> = {
      ...place,
      location_id: finalLocationId,
    };

    console.log(placeWithLocation)

    const { data, error } = await this.supabase
      .from('places')
      .insert(placeWithLocation)
      .select()
      .single();

    if (!error && data) {
      this.places.update((places) => [...places, data as Place]);
    }

    return { data, error };
  }
}
