import { Component, EventEmitter, inject, OnInit, Output } from '@angular/core';
import { LocationService } from 'src/app/services/location.service';
import { ModalController } from '@ionic/angular';
import { Location } from '../location.model';
import { IonItem, IonLabel, IonSelect, IonSelectOption } from '@ionic/angular/standalone';
import { CreateLocationModalComponent } from '../create-location-modal/create-location-modal.component';

@Component({
  selector: 'app-location-select',
  templateUrl: './location-select.component.html',
  styleUrls: ['./location-select.component.scss'],
  standalone: true,
  imports: [IonItem, IonLabel, IonSelect, IonSelectOption],
})
export class LocationSelectComponent implements OnInit {
  private locationService = inject(LocationService);
  private modalCtrl = inject(ModalController);

  @Output() locationSelected = new EventEmitter<Location>();

  locations = this.locationService.locations;

  constructor() {}

  ngOnInit() {
    this.locationService.fetchLocations();
  }

  async onLocationChange(event: any) {
    const value = event.detail.value;
    if (value === 'create') {
      const modal = await this.modalCtrl.create({
        component: CreateLocationModalComponent,
      });
      await modal.present();

      const { data } = await modal.onWillDismiss();
      if (data?.location) {
        this.locationSelected.emit(data.location);
      }
    } else {
      const selectedLocation = this.locations().find((loc) => loc.id === value);
      if (selectedLocation) {
        this.locationSelected.emit(selectedLocation);
      }
    }
  }
}
