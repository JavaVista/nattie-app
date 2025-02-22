import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { SupabaseService } from 'src/app/services/supabase.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class LoginPage implements OnInit {
  email: string = '';
  password: string = '';
  user: any;
  private supabaseService = inject(SupabaseService);

  constructor() { }

  ngOnInit() {
    console.log('Login Page Initialized');
  }

  async signUp() {
    const { data, error } = await this.supabaseService.signUp(this.email, this.password);
    if (error) {
      console.error('Signup Error:', error.message);
    } else {
      console.log('User signed up:', data);
    }
  }

  async signIn() {
    const { data, error } = await this.supabaseService.signIn(this.email, this.password);
    if (error) {
      console.error('Login Error:', error.message);
    } else {
      console.log('User signed in:', data);
      this.user = data.user;
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

}
