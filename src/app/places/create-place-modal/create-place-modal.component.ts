import { Component, inject, Input, OnInit, signal } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonContent,
  IonItem,
  IonInput,
  IonList,
  IonGrid,
  IonRow,
  IonCol,
  ModalController,
} from '@ionic/angular/standalone';
import { GooglePlacesService } from 'src/app/services/google-places.service';
import { PlaceService } from 'src/app/services/place.service';
import { LocationCoordinatesService } from 'src/app/services/location-coordinates.service';

@Component({
  selector: 'app-create-place-modal',
  templateUrl: './create-place-modal.component.html',
  styleUrls: ['./create-place-modal.component.scss'],
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonContent,
    IonItem,
    IonInput,
    IonList,
    IonGrid,
    IonRow,
    IonCol,
  ],
})
export class CreatePlaceModalComponent implements OnInit {
  private modalCtrl = inject(ModalController);
  private googlePlacesService = inject(GooglePlacesService);
  private placeService = inject(PlaceService);
  private coordsService = inject(LocationCoordinatesService);

  searchResults = signal<any[]>([]);
  photos = signal<string[]>([]);
  selectedPhoto = signal<string>('');
  searchText = signal('');

  @Input() locationId?: string;
  @Input() locationCoordinates: { lat: number; lng: number } | null = null;

  constructor() {}

  ngOnInit() {}

  onSearchInput(event: Event) {
    const input = event.target as HTMLIonInputElement;
    this.searchText.set(input.value?.toString() || '');
    this.searchPlace();
  }

  private async searchPlace() {
    if (this.searchText().length < 2) {
      this.searchResults.set([]);
      return;
    }

    // get coordinates from the service if available
    const locationCoords = this.coordsService.getCoordinates() || undefined;

    // use a general 'point_of_interest' type which includes landmarks and attractions
    this.googlePlacesService
      .autocomplete(this.searchText(), 'point_of_interest', locationCoords)
      .subscribe((results) => {
        this.searchResults.set(results);
      });
  }

  isValidPlace(): boolean {
    return this.searchText().trim().length > 0;
  }

  async selectPlace(place: any) {
    this.googlePlacesService
      .getPlaceDetails(place.place_id)
      .subscribe((details) => {
        this.photos.set(
          details.photos?.map((p: any) =>
            this.googlePlacesService.getPhotoUrl(p.photo_reference)
          ) || []
        );
        const landmark = details.name;
        this.searchText.set(landmark);
      });
  }

  async confirm() {
    const place = this.searchText().trim();
    if (!place || !this.selectedPhoto()) {
      return;
    }

    const { data, error } = await this.placeService.createPlace({
      place_name: place,
      photo_url: this.selectedPhoto(),
    }, this.locationId);

    if (error) {
      console.error('Error creating place:', error);
      return;
    }

    this.modalCtrl.dismiss(data);
  }

  cancel() {
    this.modalCtrl.dismiss();
  }
}
