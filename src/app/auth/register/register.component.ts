import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonItem, IonList, IonLabel, IonInput, IonButton, IonButtons, ModalController, IonSpinner, IonText } from '@ionic/angular/standalone';
import { SupabaseService } from 'src/app/services/supabase.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  standalone: true,
  imports: [IonText, IonSpinner, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonItem, IonList, IonLabel, IonInput, IonButton, IonButtons]
})
export class RegisterComponent {
  name = signal('');
  email = signal('');
  password = signal('');
  confirmPassword = signal('');
  errorMessage = signal('');
  isLoading = signal(false);

  private supabaseService = inject(SupabaseService);
  private modalController = inject(ModalController);
  private router = inject(Router);

  constructor() { }

  async signUp() {
    this.isLoading.set(true);
    this.errorMessage.set('');

    if (!this.name() || !this.email() || !this.password() || !this.confirmPassword()) {
      this.errorMessage.set('Please fill in all fields.');
      this.isLoading.set(false);
      return;
    }

    if (this.password() !== this.confirmPassword()) {
      this.errorMessage.set('Passwords do not match.');
      this.isLoading.set(false);
      return;
    }

    const { data, error } = await this.supabaseService.signUp(this.email(), this.password());

    if (error) {
      this.errorMessage.set(`Signup failed: ${error.message}`);
      this.isLoading.set(false);
      return;
    }

    const userId = data.user?.id;
    if (!userId) {
      this.errorMessage.set('Signup successful, but no user ID returned!');
      this.isLoading.set(false);
      return;
    }

    const { error: databaseError } = await this.supabaseService.insertUser(userId, this.email(), this.name());

    if (databaseError) {
      this.errorMessage.set(`Error saving user to database: ${databaseError.message}`);
      this.isLoading.set(false);
      return;
    }

    const { error: loginError } = await this.supabaseService.signIn(this.email(), this.password());

    if (loginError) {
      this.errorMessage.set(`Signup successful, but login failed: ${loginError.message}`);
      this.isLoading.set(false);
      return;
    }

    this.modalController.dismiss({
      email: this.email(),
      password: this.password()
    }, 'is registered');

    this.router.navigate(['/admin']);

    this.isLoading.set(false);
  }

  cancel() {
    this.modalController.dismiss(null, 'cancel');
  }

}
