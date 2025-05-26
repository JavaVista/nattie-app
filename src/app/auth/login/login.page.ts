import { Component, ViewChild, inject, signal, OnInit } from '@angular/core';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonItem,
  IonList,
  IonLabel,
  IonInput,
  IonButton,
  AlertController,
  IonSpinner,
  ModalController,
} from '@ionic/angular/standalone';
import { SupabaseService } from 'src/app/services/supabase.service';
import { Router } from '@angular/router';
import { RegisterComponent } from '../register/register.component';
import { UserProfile } from '../auth.model';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonItem,
    IonList,
    IonLabel,
    IonInput,
    IonButton,
    IonSpinner,
  ],
})
export class LoginPage implements OnInit {
  email = signal('');
  password = signal('');
  isLoading = signal(false);
  error = signal<string | null>(null);
  currentUserProfile = signal<UserProfile | null>(null);

  @ViewChild('emailInput', { static: false }) emailInput?: IonInput;
  @ViewChild('passwordInput', { static: false }) passwordInput?: IonInput;

  private supabaseService = inject(SupabaseService);
  private router = inject(Router);
  private alertController = inject(AlertController);
  private modalController = inject(ModalController);

  ngOnInit() {
    if (this.supabaseService.isLoggedIn()) {
      this.currentUserProfile.set(this.supabaseService.userProfile());
    }
  }

  async showAlert(message: string) {
    const alert = await this.alertController.create({
      header: 'Login Error',
      message: message,
      buttons: [
        {
          text: 'OK',
          handler: () => {
            if (this.email().length > 0 && this.password().length === 0) {
              this.passwordInput?.setFocus();
            } else {
              this.emailInput?.setFocus();
            }
          },
        },
      ],
    });
    await alert.present();
  }

  async onSignIn() {
    this.isLoading.set(true);
    this.error.set(null);

    const { data, error } = await this.supabaseService.signIn(
      this.email(),
      this.password()
    );

    if (error) {
      this.error.set('Invalid login credentials.');
      this.showAlert('Invalid login credentials.');
      this.isLoading.set(false);
      return;
    }

    const userId = data.user?.id;
    if (userId) {
      const userExists = await this.supabaseService.checkUserExists(userId);

      if (!userExists) {
        const newUserProfile: UserProfile = {
          id: userId,
          email: this.email(),
          name: 'Unknown',
          created_at: new Date().toISOString(),
        };

        const { error: insertError } = await this.supabaseService.insertUser(
          userId,
          this.email(),
          'Unknown'
        );

        if (insertError) {
          console.error('Error inserting missing user:', insertError.message);
        } else {
          this.currentUserProfile.set(newUserProfile);
        }
      } else {
        this.currentUserProfile.set(this.supabaseService.userProfile());
      }
    }

    this.isLoading.set(false);
    this.router.navigate(['/admin']);
  }

  displayUsername(): string {
    const profile = this.currentUserProfile();
    return profile?.name || profile?.email || 'User';
  }

  async onRegister() {
    const modal = await this.modalController.create({
      component: RegisterComponent,
    });
    await modal.present();

    const { data, role } = await modal.onWillDismiss();

    if (role === 'is registered') {
      this.email.set(data.email);
      this.password.set(data.password);
      this.onSignIn();
    }
  }

  onCancel() {
    this.router.navigate(['/']);
  }
}
