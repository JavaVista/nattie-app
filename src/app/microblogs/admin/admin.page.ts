import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton, IonItem, IonThumbnail, IonLabel, IonList } from '@ionic/angular/standalone';
import { Microblog } from '../microblogs.model';
import { SupabaseService } from 'src/app/services/supabase.service';
import { ModalController } from '@ionic/angular/standalone';
import { CreateMicroblogComponent } from '../create-microblog/create-microblog.component';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss'],
  standalone: true,

  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonButtons, IonButton, IonItem, IonThumbnail, IonLabel, IonList]
})
export class AdminPage implements OnInit {
  microblogs: Microblog[] = [];
  private supabaseService = inject(SupabaseService);
  private modalCtrl = inject(ModalController);
  constructor() { }

  ngOnInit() {
    this.loadMicroblogs();
  }

  async loadMicroblogs() {
    const { data, error } = await this.supabaseService.getMicroblogs();
    if (error) {
      console.error('Error loading microblogs:', error.message);
    } else {
      this.microblogs = data || [];
    }
  }

  async createMicroblog() {
    const newMicroblog: Microblog = {
      userId: 'admin',
      title: 'New Microblog',
      content: 'This is a new post.',
      imageUrl: '',
    };

    const { data, error } = await this.supabaseService.createMicroblog(newMicroblog);
    if (!error && data) {
      this.microblogs.unshift(data);
    }
  }

  async deleteMicroblog(id: string) {
    const { error } = await this.supabaseService.deleteMicroblog(id);
    if (!error) {
      this.microblogs = this.microblogs.filter(blog => blog.id !== id);
    }
  }

  async editMicroblog(blog: Microblog) {
    const updatedBlog = { ...blog, title: 'Updated Title' };
    await this.supabaseService.updateMicroblog(blog.id!, updatedBlog);
    await this.loadMicroblogs();
  }

  async openCreateModal() {
    const modal = await this.modalCtrl.create({
      component: CreateMicroblogComponent,
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (data?.success) {
      await this.loadMicroblogs();
    }
  }

}
