import { Injectable, signal } from '@angular/core';
import { Coordinates } from '../locations/coordinates';

@Injectable({
  providedIn: 'root',
})
export class LocationCoordinatesService {
  private coordinates = signal<Coordinates | null>(null);

  constructor() {}

  setCoordinates(coords: Coordinates | null): void {
    this.coordinates.set(coords);
  }

  getCoordinates(): Coordinates | null {
    return this.coordinates();
  }

  clearCoordinates(): void {
    this.coordinates.set(null);
  }
}
