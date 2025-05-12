import {
  Component,
  EventEmitter,
  inject,
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

  @Output() placeSelected = new EventEmitter<Place | null>();

  selectedPlaceId = signal<string | null>(null);
  places = this.placeService.places;

  constructor() {}

  ngOnInit() {
    this.placeService.fetchPlaces();
  }

  async onPlaceChange(event: CustomEvent<SelectChangeEventDetail>) {
    const value = event.detail.value;
    if (value === 'create') {
      this.selectedPlaceId.set(null);
      this.placeSelected.emit(null);

      const modal = await this.modalCtrl.create({
        component: CreatePlaceModalComponent,
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
      const selectedPlace = this.places().find((plc) => plc.id === value);
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
