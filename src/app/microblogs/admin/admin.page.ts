import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton, IonItem, IonThumbnail, IonLabel, IonList, ModalController } from '@ionic/angular/standalone';
import { Microblog } from '../microblogs.model';
import { SupabaseService } from 'src/app/services/supabase.service';
import { CreateMicroblogComponent } from '../create-microblog/create-microblog.component';
import { QuillModule } from 'ngx-quill';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss'],
  standalone: true,

  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonButtons, IonButton, IonItem, IonThumbnail, IonLabel, IonList, QuillModule]
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
    console.log(data);
    if (error) {
      console.error('Error loading microblogs:', error.message);
      this.microblogs = [];
    } else if (data && data.length > 0) {
      this.microblogs = data.map(microblog => ({
        ...microblog,
        content: microblog.content,
      }));
    } else {
      this.microblogs = [];
    }
  }

  getPlainTextPreview(content: any, maxChars = 50): string {
    if (!content || !content.ops || !Array.isArray(content.ops)) {
      return '';
    }
    let text = '';
    for (const op of content.ops) {
      if (typeof op.insert === 'string') {
        text += op.insert;
      }
      if (text.length >= maxChars) {
        return text.substring(0, maxChars) + '...';
      }
    }
    return text;
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

  getThumbnail(blog: Microblog): string {
    if (blog.file_urls && blog.file_urls.length > 0) {
      return blog.file_urls[0]; // first file as thumbnail
    }
    return 'https://via.placeholder.com/100'; // Fallback placeholder
  }

}
