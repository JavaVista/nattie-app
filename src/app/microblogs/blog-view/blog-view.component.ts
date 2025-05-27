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
import { FileUtilsService } from 'src/app/services/file-utils.service';
import { QuillUtils } from 'src/app/shared/quill-utils';

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
  private fileUtils = inject(FileUtilsService);

  datePipe = inject(DatePipe);

  heroImage = computed(
    () => this.blog().place?.place_photo || this.blog().location_image
  );

  formattedDate = computed(() =>
    this.datePipe.transform(this.blog().created_at, 'EEEE, MMMM d, y')
  );

  previewGallery = computed(() =>
    this.blog()
      .gallery_images.slice(0, 3)
      .map((url) => this.fileUtils.getDisplayUrl(url))
  );

  remainingCount = computed(() =>
    Math.max(this.blog().gallery_images.length - 3, 0)
  );

  // Compute the formatted content to ensure it's in Delta format
  formattedContent = computed(() => {
    return QuillUtils.ensureDeltaFormat(this.blog().content);
  });

  ngOnInit() {
    if (!this.blog) {
      console.error('BlogViewComponent: No blog data received');
    }
  }

  getDisplayUrl(url: string): string {
    return this.fileUtils.getDisplayUrl(url);
  }

  openGallery(index: number) {
    this.modalCtrl
      .create({
        component: BlogGalleryModalComponent,
        componentProps: {
          images: this.blog().gallery_images,
          startIndex: index,
          fileUtils: this.fileUtils,
        },
        breakpoints: [0, 1],
        initialBreakpoint: 1,
      })
      .then((modal) => modal.present());
  }
}
