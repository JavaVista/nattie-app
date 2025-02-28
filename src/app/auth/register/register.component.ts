import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonItem, IonList, IonLabel, IonInput, IonButton, IonButtons, ModalController, IonSpinner } from '@ionic/angular/standalone';
import { SupabaseService } from 'src/app/services/supabase.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  standalone: true,
  imports: [IonSpinner, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonItem, IonList, IonLabel, IonInput, IonButton, IonButtons]
})
export class RegisterComponent implements OnInit {
  email = signal('');
  password = signal('');
  confirmPassword = signal('');
  isLoading = signal(false);
  error = signal<string | null>(null);

  private supabaseService = inject(SupabaseService);
  private modalController = inject(ModalController);

  constructor() { }

  ngOnInit() { }

  async signUp() {
    this.isLoading.set(true);
    this.error.set(null);

    if (this.password() !== this.confirmPassword()) {
      this.error.set('Passwords do not match');
      this.isLoading.set(false);
      return;
    }

    const { data, error } = await this.supabaseService.signUp(this.email(), this.password());
    this.isLoading.set(false);

    if (error) {
      this.error.set(error.message);
    } else {
      await this.modalController.dismiss({ email: this.email() }, 'is registered');
    }
  }

  cancel() {
    this.modalController.dismiss(null, 'cancel');
  }

}
