import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';


@Injectable({
  providedIn: 'root',
})
export class AiService {
  private http = inject(HttpClient);
  private supabaseUrl = environment.supabaseUrl;
  private supabaseAnonKey = environment.supabaseAnonKey;

  constructor() {}

  generateUselessFacts(location: string, place?: string): Observable<string[]> {
    const prompt = `Give me 3, useless concise facts about the location ${location}${
      place ? `, specifically about the place ${place}` : ''
    }.`;

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.supabaseAnonKey}`
    });

   return this.http
     .post<{ facts: string[] }>(
       `${this.supabaseUrl}/functions/v1/generate-useless-facts`,
       { prompt },
       { headers }
     )
     .pipe(map((res) => res.facts));;
  }
}
