import {
  Component,
  EventEmitter,
  inject,
  OnInit,
  Output,
  signal,
} from '@angular/core';
import { LocationService } from 'src/app/services/location.service';
import { Location } from '../location.model';
import {
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  ModalController,
} from '@ionic/angular/standalone';
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

  @Output() locationSelected = new EventEmitter<Location | null>();

  selectedLocationId = signal<string | null>(null);
  locations = this.locationService.locations;

  constructor() {}

  ngOnInit() {
    this.locationService.fetchLocations();
  }

  async onLocationChange(event: any) {
    const value = event.detail.value;
    if (value === 'create') {
      this.selectedLocationId.set(null);
      this.locationSelected.emit(null);

      const modal = await this.modalCtrl.create({
        component: CreateLocationModalComponent,
      });
      await modal.present();

      const { data } = await modal.onWillDismiss();
      if (data?.location) {
        await this.locationService.fetchLocations();

        this.selectedLocationId.set(data.location.id);
        this.locationSelected.emit(data.location);
      } else {
        const selectElement = event.target;
        if (selectElement) {
          selectElement.value = null;
        }
      }
    } else {
      const selectedLocation = this.locations().find((loc) => loc.id === value);
      if (selectedLocation) {
        this.selectedLocationId.set(selectedLocation.id);
        this.locationSelected.emit(selectedLocation);
      } else {
        this.selectedLocationId.set(null);
        this.locationSelected.emit(null);
      }
    }
  }
}
