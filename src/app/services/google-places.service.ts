import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map } from 'rxjs';
import { env } from 'src/environments/env';

@Injectable({
  providedIn: 'root',
})
export class GooglePlacesService {
  private http = inject(HttpClient);
  private apiKey = env.googlePlacesApiKey;

  constructor() {}

  autocomplete(input: string) {
    const params = new HttpParams()
      .set('input', input)
      .set('types', '(cities)') // you can change this to 'establishment' if needed for places
      .set('key', this.apiKey);

    return this.http
      .get<any>(
        'https://maps.googleapis.com/maps/api/place/autocomplete/json',
        { params }
      )
      .pipe(map((res) => res.predictions));
  }

  getPlaceDetails(placeId: string) {
    const params = new HttpParams()
      .set('place_id', placeId)
      .set('fields', 'name,photos,address_components,geometry')
      .set('key', this.apiKey);

    return this.http
      .get<any>('https://maps.googleapis.com/maps/api/place/details/json', {
        params,
      })
      .pipe(map((res) => res.result));
  }

  getPhotoUrl(photoReference: string, maxWidth = 400) {
    return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photoreference=${photoReference}&key=${this.apiKey}`;
  }
}
