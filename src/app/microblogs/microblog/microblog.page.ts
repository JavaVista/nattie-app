import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonSpinner,
  IonButtons,
  IonBackButton,
  IonMenuButton,
  IonButton,
  IonIcon,
  IonTitle
} from '@ionic/angular/standalone';
import { SupabaseService } from 'src/app/services/supabase.service';
import { Microblog } from '../microblogs.model';
import { BlogViewComponent } from '../blog-view/blog-view.component';
import { EditBlogComponent } from '../edit-blog/edit-blog.component';

@Component({
  selector: 'app-microblog',
  templateUrl: './microblog.page.html',
  styleUrls: ['./microblog.page.scss'],
  standalone: true,
  imports: [
    IonButton,
    IonContent,
    IonHeader,
    IonToolbar,
    IonSpinner,
    BlogViewComponent,
    IonButtons,
    IonBackButton,
    IonMenuButton,
    IonIcon,
    RouterLink,
    EditBlogComponent,
    IonTitle
  ],
})
export class MicroblogPage implements OnInit {
  private route = inject(ActivatedRoute);
  private supabase = inject(SupabaseService);
  private mode = this.route.snapshot.queryParamMap.get('mode');

  isEditMode = computed(() => this.mode === 'edit');
  blog = signal<Microblog | null>(null);
  isLoading = signal(true);
  error = signal<string | null>(null);

  transformedBlog = computed(() => {
    if (!this.blog()) return null;

    const blog = this.blog();

    const locationImage =
      blog?.places?.photo_url || // First try place photo
      blog?.locations?.photo_url || // Then location photo
      blog?.file_urls?.[0] || // Then first uploaded file
      'assets/images/EuroTrip.png'; // Default fallback

    return signal({
      id: blog?.id || '',
      location_image: locationImage,
      title: blog?.title || '',
      city: blog?.locations?.city || '',
      country: blog?.country || '',
      created_at: blog?.created_at || new Date(),
      content: blog?.content || {},
      useless_facts: blog?.useless_facts || [],
      place: blog?.places
        ? {
            place_name: blog.places.place_name,
            place_photo: blog.places.photo_url,
          }
        : undefined,
      gallery_images: blog?.file_urls || [],
    });
  });

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

      if (!data) {
        throw new Error('Blog not found');
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
