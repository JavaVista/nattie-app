import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map } from 'rxjs';
import { env } from 'src/environments/env';

@Injectable({
  providedIn: 'root',
})
export class GooglePlacesService {
  private http = inject(HttpClient);
  private readonly proxyUrl = `${env.supabaseUrl}/functions/v1/places-proxy`;

  private readonly headers = new HttpHeaders({
    'Content-Type': 'application/json',
  });

  constructor() {}

  autocomplete(input: string) {
    return this.http
      .post<any>(
        this.proxyUrl,
        {
          endpoint: 'autocomplete',
          input,
        },
        { headers: this.headers }
      )
      .pipe(map((res) => res.predictions));
  }

  getPlaceDetails(placeId: string) {
    return this.http
      .post<any>(
        this.proxyUrl,
        {
          endpoint: 'details',
          place_id: placeId,
        },
        { headers: this.headers }
      )
      .pipe(map((res) => res.result));
  }

  getPhotoUrl(photoReference: string, maxWidth = 400) {
    return `${this.proxyUrl}?endpoint=photo&photo_reference=${photoReference}&maxwidth=${maxWidth}`;
  }
}
