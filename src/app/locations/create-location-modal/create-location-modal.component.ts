import { Component, inject, signal } from '@angular/core';
import {
  IonItem,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonContent,
  IonInput,
  IonList,
  IonGrid,
  IonRow,
  IonCol,
  IonButtons,
  IonButton,
  ModalController,
} from '@ionic/angular/standalone';
import { GooglePlacesService } from 'src/app/services/google-places.service';
import { LocationService } from 'src/app/services/location.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-create-location-modal',
  templateUrl: './create-location-modal.component.html',
  styleUrls: ['./create-location-modal.component.scss'],
  standalone: true,
  imports: [
    IonItem,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonContent,
    IonInput,
    IonList,
    IonGrid,
    IonRow,
    IonCol,
    IonButtons,
    IonButton,
    CommonModule,
  ],
})
export class CreateLocationModalComponent {
  private modalCtrl = inject(ModalController);
  private googlePlacesService = inject(GooglePlacesService);
  private locationService = inject(LocationService);

  searchResults = signal<any[]>([]);
  photos = signal<string[]>([]);
  selectedPhoto = signal<string>('');
  searchText = signal('');

  constructor() {}

  onSearchInput(event: Event) {
    const input = event.target as HTMLIonInputElement;
    this.searchText.set(input.value?.toString() || '');
    this.searchPlaces();
  }

  async searchPlaces() {
    if (this.searchText().length < 2) {
      this.searchResults.set([]);
      return;
    }

    this.googlePlacesService
      .autocomplete(this.searchText())
      .subscribe((results) => {
        this.searchResults.set(results);
      });
  }

  isValidLocation(): boolean {
    const parts = this.searchText().split(',');
    return (
      parts.length === 2 && parts[0].trim() !== '' && parts[1].trim() !== ''
    );
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

        const city =
          details.address_components.find((c: any) =>
            c.types.includes('locality')
          )?.long_name || '';

        const country =
          details.address_components.find((c: any) =>
            c.types.includes('country')
          )?.long_name || '';

        this.searchText.set(`${city}, ${country}`);
      });
  }

  async confirm() {
    const [city, country] = this.searchText()
      .split(',')
      .map((s) => s.trim());

    if (!city || !country || !this.selectedPhoto()) {
      return;
    }

    const { data, error } = await this.locationService.createLocation({
      city,
      country,
      photo_url: this.selectedPhoto(),
    });

    if (error) {
      console.error('Error creating location:', error);
      return;
    }

    this.modalCtrl.dismiss({ location: data });
  }

  cancel() {
    this.modalCtrl.dismiss();
  }
}
