import { Component, inject, OnInit, signal } from '@angular/core';
import { IonItem, IonHeader, IonTitle, IonToolbar, IonContent, IonInput, IonList, IonGrid, IonRow, IonCol, IonButtons, IonButton, ModalController } from '@ionic/angular/standalone';
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
export class CreateLocationModalComponent implements OnInit {
  private modalCtrl = inject(ModalController);
  private googlePlacesService = inject(GooglePlacesService);
  private locationService = inject(LocationService);

  searchResults = signal<any[]>([]);
  photos = signal<string[]>([]);
  selectedPhoto = signal<string>('');
  searchText = signal('');

  constructor() {}

  ngOnInit() {}

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

  async selectPlace(place: any) {
    this.googlePlacesService
      .getPlaceDetails(place.place_id)
      .subscribe((details) => {
        this.photos.set(
          details.photos?.map((p: any) =>
            this.googlePlacesService.getPhotoBlob(p.photo_reference)
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

    const { data } = await this.locationService.createLocation({
      city,
      country,
      photo_url: this.selectedPhoto(),
    });

    this.modalCtrl.dismiss({ location: data });
  }

  cancel() {
    this.modalCtrl.dismiss();
  }
}
