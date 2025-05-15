import {
  Component,
  effect,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
  signal,
  Signal,
} from '@angular/core';
import {
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  ModalController,
  SelectChangeEventDetail,
} from '@ionic/angular/standalone';
import { Place } from '../place.model';
import { PlaceService } from 'src/app/services/place.service';
import { CreatePlaceModalComponent } from '../create-place-modal/create-place-modal.component';

@Component({
  selector: 'app-place-select',
  templateUrl: './place-select.component.html',
  styleUrls: ['./place-select.component.scss'],
  standalone: true,
  imports: [IonItem, IonLabel, IonSelect, IonSelectOption],
})
export class PlaceSelectComponent implements OnInit {
  private placeService = inject(PlaceService);
  private modalCtrl = inject(ModalController);

  @Input() selectedLocationId?: string;
  @Output() placeSelected = new EventEmitter<Place | null>();

  selectedPlaceId = signal<string | null>(null);
  filteredPlaces = signal<Place[]>([]);

  constructor() {
    effect(() => {
      if (this.selectedLocationId && this.placeService.places().length > 0) {
        // Filter places by location_id
        this.filteredPlaces.set(
          this.placeService
            .places()
            .filter((place) => place.location_id === this.selectedLocationId)
        );
      } else {
        this.filteredPlaces.set([]);
      }
    });
  }

  ngOnInit() {
    this.placeService.fetchPlaces();
  }

  async onPlaceChange(event: CustomEvent<SelectChangeEventDetail>) {
    const value = event.detail.value;
    if (value === 'create') {
      this.selectedPlaceId.set(null);
      this.placeSelected.emit(null);

      if (!this.selectedLocationId) {
        console.warn('Cannot create place: No location selected');

        const selectElement = event.target as HTMLIonSelectElement;
        if (selectElement) {
          selectElement.value = null;
        }

        return;
      }

      const modal = await this.modalCtrl.create({
        component: CreatePlaceModalComponent,
        componentProps: {
          locationId: this.selectedLocationId,
        },
      });

      await modal.present();

      const { data } = await modal.onWillDismiss();
      if (data?.place) {
        await this.placeService.fetchPlaces();

        this.selectedPlaceId.set(data.place.id);
        this.placeSelected.emit(data.place);
      } else {
        const selectElement = event.target as HTMLIonSelectElement;
        if (selectElement) {
          selectElement.value = null;
        }
      }
    } else {
      const selectedPlace = this.filteredPlaces().find(
        (plc) => plc.id === value
      );
      if (selectedPlace) {
        this.selectedPlaceId.set(selectedPlace.id);
        this.placeSelected.emit(selectedPlace);
      } else {
        this.selectedPlaceId.set(null);
        this.placeSelected.emit(null);
      }
    }
  }
}
