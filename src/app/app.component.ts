
import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { IonMenu, IonContent, IonList, IonItem, IonIcon, IonLabel, IonHeader, IonToolbar, IonTitle, IonAvatar, IonRouterOutlet, IonRouterLink } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { mailOutline, mailSharp, paperPlaneOutline, paperPlaneSharp, heartOutline, heartSharp, archiveOutline, archiveSharp, trashOutline, trashSharp, warningOutline, warningSharp, bookmarkOutline, bookmarkSharp } from 'ionicons/icons';
import { SupabaseService } from './services/supabase.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  imports: [RouterLink, IonMenu, IonContent, IonList, IonItem, IonIcon, IonLabel, IonHeader, IonToolbar, IonTitle, IonAvatar, IonRouterLink, IonRouterOutlet],
})
export class AppComponent implements OnInit {
  isLoggedIn = false;
  username = '';
  private supabaseService = inject(SupabaseService);
  private router = inject(Router);


  constructor() {
    addIcons({ mailOutline, mailSharp, paperPlaneOutline, paperPlaneSharp, heartOutline, heartSharp, archiveOutline, archiveSharp, trashOutline, trashSharp, warningOutline, warningSharp, bookmarkOutline, bookmarkSharp });
  }

  ngOnInit(): void {
    this.checkAuth();
  }
  
  async checkAuth() {
    const { data, error } = await this.supabaseService.getUser();
    if (error) {
      console.error('Error getting user:', error.message);
    } else {
      this.isLoggedIn = !!data.user;
      this.username = data.user.email || 'Guest';
    }
  }

  async signOut() {
    await this.supabaseService.signOut();
    this.isLoggedIn = false;
    this.router.navigate(['/home']);
  }
}
