import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map } from 'rxjs';
import { environment } from 'src/environments/environment';


@Injectable({
  providedIn: 'root',
})
export class GooglePlacesService {
  private http = inject(HttpClient);
  private readonly proxyUrl = `${environment.supabaseUrl}/functions/v1/places-proxy`;

  private readonly headers = new HttpHeaders({
    'Content-Type': 'application/json',
  });

  constructor() {}

  autocomplete(
    input: string,
    type?: string,
    locationCoords?: { lat: number; lng: number }
  ) {
    const payload: any = {
      endpoint: 'autocomplete',
      input,
    };

    if (type) {
      payload.type = type;
    }

    // location coordinates if provided
    if (locationCoords) {
      payload.location = locationCoords;
    }

    return this.http
      .post<any>(this.proxyUrl, payload, { headers: this.headers })
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
      .pipe(
        map((res) => {
          const result = res.result;

          // get coordinates if they exist
          let coordinates = null;
          if (result.geometry?.location) {
            coordinates = {
              lat: result.geometry.location.lat,
              lng: result.geometry.location.lng,
            };
          }

          return {
            ...result,
            coordinates,
          };
        })
      );
  }

  getPhotoUrl(photoReference: string, maxWidth = 400) {
    return `${this.proxyUrl}?endpoint=photo&photo_reference=${photoReference}&maxwidth=${maxWidth}`;
  }
}
