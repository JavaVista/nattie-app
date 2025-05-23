import { Component, inject, OnInit } from '@angular/core';
import {
  IonMenuButton,
  IonIcon,
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonButton,
  IonSpinner,
  ModalController,
} from '@ionic/angular/standalone';
import { Microblog } from '../microblogs.model';
import { SupabaseService } from 'src/app/services/supabase.service';
import { CreateMicroblogComponent } from '../create-microblog/create-microblog.component';
import { BlogSelectionListComponent } from '../blog-selection-list/blog-selection-list.component';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss'],
  standalone: true,
  imports: [
    IonMenuButton,
    IonIcon,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButtons,
    IonButton,
    IonSpinner,
    BlogSelectionListComponent,
    RouterLink,
  ],
})
export class AdminPage implements OnInit {
  microblogs: Microblog[] = [];
  loading = true;
  errorMessage: string | null = null;

  private supabaseService = inject(SupabaseService);
  private modalCtrl = inject(ModalController);
  private router = inject(Router);

  ngOnInit() {
    this.loadMicroblogs();
  }

  async loadMicroblogs() {
    try {
      this.loading = true;
      this.errorMessage = null;

      const { data, error } = await this.supabaseService.getMicroblogs();

      if (error) {
        throw error;
      } else if (data && data.length > 0) {
        this.microblogs = data.map((microblog) => ({
          ...microblog,
          content: microblog.content,
        }));
      } else {
        this.microblogs = [];
      }
    } catch (err) {
      console.error('Error loading microblogs:', err);
      this.errorMessage =
        err instanceof Error ? err.message : 'Failed to load blogs';
      this.microblogs = [];
    } finally {
      this.loading = false;
    }
  }

  async deleteMicroblog(id: string) {
    try {
      const { error } = await this.supabaseService.deleteMicroblog(id);
      if (error) throw error;
      this.microblogs = this.microblogs.filter((blog) => blog.id !== id);
    } catch (err) {
      console.error('Error deleting microblog:', err);
    }
  }

  async editMicroblog(blog: Microblog) {
    console.log(' AdminPage 👉 blog:', blog);
    this.router.navigate(['/microblog', blog.id], {
      queryParams: {
        mode: 'edit',
      },
    });
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
