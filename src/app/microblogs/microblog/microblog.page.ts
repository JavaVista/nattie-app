import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonSpinner,
} from '@ionic/angular/standalone';
import { SupabaseService } from 'src/app/services/supabase.service';
import { Microblog } from '../microblogs.model';

@Component({
  selector: 'app-microblog',
  templateUrl: './microblog.page.html',
  styleUrls: ['./microblog.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, IonSpinner],
})
export class MicroblogPage implements OnInit {
  private route = inject(ActivatedRoute);
  private supabase = inject(SupabaseService);

  blog = signal<Microblog | null>(null);
  isLoading = signal(true);
  error = signal<string | null>(null);

  ngOnInit() {
    this.loadMicroblog();
  }

  async loadMicroblog() {
    try {
      const id = this.route.snapshot.paramMap.get('id');

      if (!id) {
        throw new Error('No blog ID provided.');
      }

      const { data, error } = await this.supabase.getMicroblogById(id);

      if (error) {
        throw error;
      }

      this.blog.set(data);
    } catch (err) {
      console.error('Error fetching microblog:', err);
      this.error.set(
        err instanceof Error ? err.message : 'Failed to load microblog'
      );
    } finally {
      this.isLoading.set(false);
    }
  }
}
