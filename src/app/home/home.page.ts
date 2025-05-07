import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonMenuButton,
  IonSpinner,
} from '@ionic/angular/standalone';
import { TripCard } from '../microblogs/trip-list.model';
import { LocationService } from '../services/location.service';
import { TripListComponent } from '../microblogs/trip-list/trip-list.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    FormsModule,
    IonButtons,
    IonMenuButton,
    IonSpinner,
    TripListComponent,
  ],
})
export class HomePage implements OnInit {
  trips = signal<TripCard[]>([]);
  private locationService = inject(LocationService);
  loading = signal<boolean>(true);

  constructor() {}

  ngOnInit() {
    this.fetchLocationData();
  }

  private async fetchLocationData() {
    try {
      this.loading.set(true);
      await this.locationService.fetchLocations();

      const locations = this.locationService.locations();

      if (locations.length > 0) {
        const mappedTrips = locations.map((loc) => ({
          country: loc.country,
          photoUrl: loc.photo_url,
        }));
        this.trips.set(mappedTrips);
      }
    } catch (error) {
      console.error('Error fetching locations:', error);
    } finally {
      this.loading.set(false);
    }
  }
}
