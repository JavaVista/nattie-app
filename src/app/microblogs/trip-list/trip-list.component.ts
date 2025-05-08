import {
  Component,
  computed,
  Input,
  OnChanges,
  signal,
  SimpleChanges,
} from '@angular/core';
import { TripCard } from '../trip-list.model';
import { RouterModule } from '@angular/router';
import {
  IonContent,
  IonList,
  IonCard,
  IonCardHeader,
  IonCardTitle,
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-trip-list',
  templateUrl: './trip-list.component.html',
  styleUrls: ['./trip-list.component.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonList,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    RouterModule,
  ],
})
export class TripListComponent implements OnChanges {
  @Input({ required: true }) locations!: TripCard[];
  tripLocations = signal<TripCard[]>([]);

  uniqueTrips = computed(() => {
    const uniqueMap = new Map<string, TripCard>();

    this.tripLocations().forEach((loc) => {
      if (!uniqueMap.has(loc.country)) {
        uniqueMap.set(loc.country, loc);
      }
    });

    return [...uniqueMap.values()];
  });

  constructor() {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['locations']) {
      console.log('TripListComponent received new locations:', this.locations);
      this.tripLocations.set(this.locations);
    }
  }
}
