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
  IonButtons,
  IonButton,
  MenuController,
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
  closeCircleOutline,
} from 'ionicons/icons';
import { register } from 'swiper/element/bundle';
import { UserProfile } from './auth/auth.model';

register();

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  imports: [
    IonButtons,
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
    IonButtons,
    IonButton,
  ],
})
export class AppComponent {
  private supabaseService = inject(SupabaseService);
  private router = inject(Router);
  isLoggedIn = this.supabaseService.isLoggedIn;
  private menuCtrl = inject(MenuController);

  username = computed(() => {
    const profile: UserProfile | null = this.supabaseService.userProfile();
    if (profile?.name) {
      return profile.name;
    }
    return this.supabaseService.user()?.email || 'Guest';
  });

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
      closeCircleOutline,
    });
  }

  closeMenu() {
    this.menuCtrl.close('main');
  }

  async signOut() {
    await this.supabaseService.signOut();
    this.router.navigate(['/']);
  }
}
