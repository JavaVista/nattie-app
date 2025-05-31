import { Component, computed, inject, OnDestroy, OnInit } from '@angular/core';
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
import { PwaService } from './services/pwa.service';

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
export class AppComponent implements OnInit, OnDestroy {
  private supabaseService = inject(SupabaseService);
  isLoggedIn = this.supabaseService.isLoggedIn;
  private router = inject(Router);
  private menuCtrl = inject(MenuController);
  private pwaService = inject(PwaService);

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

  ngOnInit() {
    // 🚀 Initialize PWA updates on app start
    this.pwaService.initPwaPrompt();

    console.log('Nattie initialized! 🌍');
  }

  ngOnDestroy() {
    this.pwaService.destroy();
  }

  closeMenu() {
    this.menuCtrl.close('main');
  }

  async signOut() {
    await this.supabaseService.signOut();
    this.router.navigate(['/']);
  }
}
