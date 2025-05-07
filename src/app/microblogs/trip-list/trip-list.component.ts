import { Component, computed, Input, Signal } from '@angular/core';
import { TripCard } from '../trip-list.model';
import {IonContent, IonList, IonCard, IonCardHeader, IonCardTitle } from '@ionic/angular/standalone';

@Component({
  selector: 'app-trip-list',
  templateUrl: './trip-list.component.html',
  styleUrls: ['./trip-list.component.scss'],
  standalone: true,
  imports: [IonContent, IonList, IonCard, IonCardHeader, IonCardTitle],
})
export class TripListComponent {
  @Input({ required: true }) locations!: TripCard[];

  uniqueTrips: Signal<TripCard[]> = computed(() => {
    const uniqueMap = new Map<string, TripCard>();
    this.locations?.forEach((loc) => {
      if (!uniqueMap.has(loc.country)) {
        uniqueMap.set(loc.country, loc);
      }
    });
    return [...uniqueMap.values()];
  });

  constructor() { }

}
