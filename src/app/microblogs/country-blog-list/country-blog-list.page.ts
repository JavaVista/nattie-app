import { Component, inject, OnInit, signal } from '@angular/core';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonSpinner,
} from '@ionic/angular/standalone';
import { Microblog } from '../microblogs.model';
import { BlogSelectionListComponent } from '../blog-selection-list/blog-selection-list.component';
import { ActivatedRoute } from '@angular/router';
import { SupabaseService } from 'src/app/services/supabase.service';

@Component({
  selector: 'app-country-blog-list',
  templateUrl: './country-blog-list.page.html',
  styleUrls: ['./country-blog-list.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonSpinner,
    BlogSelectionListComponent,
  ],
})
export class CountryBlogListPage implements OnInit {
  blogs = signal<Microblog[]>([]);
  country = signal<string>('');
  loading = signal<boolean>(true);
  error = signal<string | null>(null);

  private route = inject(ActivatedRoute);
  private supabaseService = inject(SupabaseService);

  constructor() {}

  ngOnInit() {
    this.loadMicroblogs();
  }

  async loadMicroblogs() {
    try {
      const countryParam = this.route.snapshot.paramMap.get('country');

      if (!countryParam) {
        throw new Error('Country parameter is missing');
      }

      this.country.set(countryParam);

      const { data, error } = await this.supabaseService.getBlogsByCountry(
        countryParam
      );

      if (error) {
        throw error;
      }

      if (data) {
        this.blogs.set(data);
      }
    } catch (err) {
      console.error('Error fetching blogs by country:', err);
      this.error.set(
        err instanceof Error ? err.message : 'Failed to load blogs'
      );
    } finally {
      this.loading.set(false);
    }
  }
}
