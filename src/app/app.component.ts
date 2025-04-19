
import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { IonMenu, IonContent, IonList, IonItem, IonIcon, IonLabel, IonHeader, IonToolbar, IonTitle, IonAvatar, IonRouterOutlet, IonRouterLink } from '@ionic/angular/standalone';
import { SupabaseService } from './services/supabase.service';
import { addIcons } from 'ionicons';
import { settings, home, logIn, logOut } from 'ionicons/icons';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  imports: [RouterLink, IonMenu, IonContent, IonList, IonItem, IonIcon, IonLabel, IonHeader, IonToolbar, IonTitle, IonAvatar, IonRouterLink, IonRouterOutlet],
})
export class AppComponent {
  private supabaseService = inject(SupabaseService);
  private router = inject(Router);
  isLoggedIn = this.supabaseService.isLoggedIn;
  username = computed(() => this.supabaseService.user()?.email || 'Guest');

  constructor() {
    addIcons({ home, settings, logIn, logOut });
  }



  async signOut() {
    await this.supabaseService.signOut();
    this.router.navigate(['/']);
  }
}
