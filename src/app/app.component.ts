import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  IonMenu,
  IonContent,
  IonList,
  IonItem,
  IonIcon,
  IonLabel,
  IonHeader,
  IonToolbar,
  IonAvatar,
  IonRouterOutlet,
  IonRouterLink,
} from '@ionic/angular/standalone';
import { SupabaseService } from './services/supabase.service';
import { addIcons } from 'ionicons';
import {
  settingsOutline,
  homeOutline,
  logInOutline,
  logOutOutline,
  informationCircleOutline,
  createOutline,
  trashOutline,
  imagesOutline,
  cloudUploadOutline,
  images,
  addCircleOutline,
} from 'ionicons/icons';
import { register } from 'swiper/element/bundle';

register();

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  imports: [
    RouterLink,
    IonMenu,
    IonContent,
    IonList,
    IonItem,
    IonIcon,
    IonLabel,
    IonHeader,
    IonToolbar,
    IonAvatar,
    IonRouterLink,
    IonRouterOutlet,
  ],
})
export class AppComponent {
  private supabaseService = inject(SupabaseService);
  private router = inject(Router);
  isLoggedIn = this.supabaseService.isLoggedIn;
  username = computed(() => this.supabaseService.user()?.email || 'Guest');

  constructor() {
    addIcons({
      homeOutline,
      settingsOutline,
      logInOutline,
      logOutOutline,
      informationCircleOutline,
      createOutline,
      trashOutline,
      imagesOutline,
      cloudUploadOutline,
      images,
      addCircleOutline,
    });
  }

  async signOut() {
    await this.supabaseService.signOut();
    this.router.navigate(['/']);
  }
}
