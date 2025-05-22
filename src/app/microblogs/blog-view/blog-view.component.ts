import { DatePipe } from '@angular/common';
import {
  Component,
  computed,
  inject,
  Input,
  OnInit,
  Signal,
} from '@angular/core';
import { IonContent, ModalController } from '@ionic/angular/standalone';
import { QuillViewComponent } from 'ngx-quill';
import { MarkdownPipe } from 'src/app/shared/markdown.pipe';
import { BlogGalleryModalComponent } from '../blog-gallery-modal/blog-gallery-modal.component';

@Component({
  selector: 'app-blog-view',
  templateUrl: './blog-view.component.html',
  styleUrls: ['./blog-view.component.scss'],
  standalone: true,
  imports: [IonContent, QuillViewComponent, MarkdownPipe],
  providers: [DatePipe],
})
export class BlogViewComponent implements OnInit {
  @Input() blog!: Signal<{
    location_image: string;
    title: string;
    city: string;
    country: string;
    created_at: string | Date;
    content: any;
    useless_facts: string[];
    place?: { place_name: string; place_photo?: string };
    gallery_images: string[];
  }>;

  private modalCtrl = inject(ModalController);

  datePipe = inject(DatePipe);

  heroImage = computed(
    () => this.blog().place?.place_photo || this.blog().location_image
  );

  formattedDate = computed(() =>
    this.datePipe.transform(this.blog().created_at, 'EEEE, MMMM d, y')
  );

  previewGallery = computed(() => this.blog().gallery_images.slice(0, 3));

  remainingCount = computed(() =>
    Math.max(this.blog().gallery_images.length - 3, 0)
  );

  ngOnInit() {
    if (!this.blog) {
      console.error('BlogViewComponent: No blog data received');
    }
  }

  openGallery(index: number) {
    console.log('BlogViewComponent: Opening gallery with index:', index);
    this.modalCtrl
      .create({
        component: BlogGalleryModalComponent,
        componentProps: {
          images: this.blog().gallery_images,
          startIndex: index,
        },
        breakpoints: [0, 1],
        initialBreakpoint: 1,
      })
      .then((modal) => modal.present());
  }
}
