import { Component, EventEmitter, inject, OnInit, Output, signal, Signal } from '@angular/core';
import {
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  ModalController,
SelectChangeEventDetail,
} from '@ionic/angular/standalone';
import { Place } from '../place.model';
import { SupabaseService } from 'src/app/services/supabase.service';
import { IonSelectCustomEvent } from '@ionic/core';

@Component({
  selector: 'app-place-select',
  templateUrl: './place-select.component.html',
  styleUrls: ['./place-select.component.scss'],
  standalone: true,
  imports: [IonItem, IonLabel, IonSelect, IonSelectOption],
})
export class PlaceSelectComponent implements OnInit {
  @Output() placeSelected = new EventEmitter<Place | null>();
  places: Signal<Place[]> = signal([]);
  selectedPlaceId = signal<string | null>(null);

  private supabase = inject(SupabaseService);
  private modalCtrl = inject(ModalController);

  constructor() {}

  ngOnInit() {}

  onPlaceChange($event: IonSelectCustomEvent<SelectChangeEventDetail<any>>) {
    throw new Error('Method not implemented.');
  }
}

