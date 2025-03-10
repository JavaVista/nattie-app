import { Component, OnInit, ViewChild, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonItem, IonList, IonLabel, IonInput, IonButton, AlertController, IonSpinner, ModalController } from '@ionic/angular/standalone';
import { SupabaseService } from 'src/app/services/supabase.service';
import { Router } from '@angular/router';
import { RegisterComponent } from '../register/register.component';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonItem, IonList, IonLabel, IonInput, IonButton, IonSpinner],
})
export class LoginPage implements OnInit {
  email = signal('');
  password = signal('');
  user: any;
  isLoading = signal(false);
  error = signal<string | null>(null);

  @ViewChild('emailInput', { static: false }) emailInput?: IonInput;
  @ViewChild('passwordInput', { static: false }) passwordInput?: IonInput;

  private supabaseService = inject(SupabaseService);
  private router = inject(Router);
  private alertController = inject(AlertController);
  private modalController = inject(ModalController);

  constructor() { }

  ngOnInit() {
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
          }
        }
      ]
    });
    await alert.present();
  }

  async onSignIn() {
    this.isLoading.set(true);
    this.error.set(null);

    const { data, error } = await this.supabaseService.signIn(this.email(), this.password());

    this.isLoading.set(false);

    if (error) {
      this.error.set('Invalid login credentials.');
      this.showAlert('Invalid login credentials.');
    } else {
      this.router.navigate(['/admin']);
    }
  }

  async signOut() {
    const { error } = await this.supabaseService.signOut();
    if (error) {
      console.error('Sign Out Error:', error.message);
    } else {
      console.log('User signed out');
    }
  }

  async getUser() {
    const { data, error } = await this.supabaseService.getUser();
    if (error) {
      console.error('Get User Error:', error.message);
    } else {
      console.log('Current User:', data);
    }
  }

  async onRegister() {
    const modal = await this.modalController.create({
      component: RegisterComponent
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
