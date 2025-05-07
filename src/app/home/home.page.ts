import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonMenuButton, IonList } from '@ionic/angular/standalone';
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
    TripListComponent
],
})
export class HomePage implements OnInit {
  trips = signal<TripCard[]>([]);
  private locationService = inject(LocationService);

  constructor() {}

  async ngOnInit() {
    await this.locationService.fetchLocations();

    const locations = this.locationService.locations();
    if (locations.length > 0) {
      this.trips.set(
        locations.map((loc) => ({
          country: loc.country,
          photoUrl: loc.photo_url,
        }))
      );
    }
  }

}
