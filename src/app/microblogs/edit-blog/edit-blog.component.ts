import {
  Component,
  ElementRef,
  inject,
  Input,
  OnInit,
  signal,
  Signal,
  ViewChild,
  computed,
} from '@angular/core';
import { SupabaseService } from 'src/app/services/supabase.service';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  ToastController,
  IonContent,
  IonButton,
  IonInput,
  IonIcon,
  IonCard,
  IonCardContent,
  IonLabel,
  IonChip,
  IonProgressBar,
} from '@ionic/angular/standalone';
import { QuillModule } from 'ngx-quill';
import { Router } from '@angular/router';

@Component({
  selector: 'app-edit-blog',
  templateUrl: './edit-blog.component.html',
  styleUrls: ['./edit-blog.component.scss'],
  standalone: true,
  imports: [
    IonIcon,
    ReactiveFormsModule,
    IonContent,
    IonButton,
    IonInput,
    IonCard,
    IonCardContent,
    IonLabel,
    QuillModule,
    IonChip,
    IonProgressBar,
  ],
})
export class EditBlogComponent implements OnInit {
  @Input() blog!: Signal<{
    id: string;
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

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  private supabaseService = inject(SupabaseService);
  private formBuilder = inject(FormBuilder);
  private toastCtrl = inject(ToastController);
  private router = inject(Router);

  form = this.formBuilder.group({
    title: ['', [Validators.required, Validators.minLength(5)]],
    content: ['', [Validators.required]],
  });

  galleryImages = signal<string[]>([]);
  files = signal<File[]>([]);
  uploadProgress = signal(0);
  private imagePreviews = signal<string[]>([]);

  quillStyles = {
    height: '200px',
    background: 'white',
    borderRadius: '5px',
  };

  ngOnInit() {
    this.form.patchValue({
      title: this.blog().title,
      content: this.blog().content,
    });

    this.galleryImages.set(this.blog().gallery_images || []);
  }

  removeImage(index: number) {
    const updated = [...this.galleryImages()];
    updated.splice(index, 1);
    this.galleryImages.set(updated);
  }

  triggerFileInput() {
    if (this.fileInput) {
      this.fileInput.nativeElement.click();
    }
  }

  handleFileInput(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      // Store the files
      this.files.set(Array.from(input.files));

      // Generate previews
      const previews: string[] = [];
      Array.from(input.files).forEach((file) => {
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = (e: any) => {
            previews.push(e.target.result);
            this.imagePreviews.set([...previews]);
          };
          reader.readAsDataURL(file);
        }
      });
    }
  }

  clearSelectedFiles() {
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
    this.files.set([]);
    this.imagePreviews.set([]);
  }

  getImagePreviewUrl(file: File): string {
    const index = this.files().indexOf(file);
    return this.imagePreviews()[index] || '';
  }

  async saveChanges() {
    if (this.form.invalid) return;

    // Upload new images if any
    const newFileUrls: string[] = [];

    if (this.files().length > 0) {
      const totalFiles = this.files().length;
      let uploadedCount = 0;

      for (const file of this.files()) {
        const { publicUrl, error } = await this.supabaseService.uploadFile(
          'microblog-media',
          file
        );
        if (error) {
          console.error('File upload failed:', error.message);
          const toast = await this.toastCtrl.create({
            message: `Error uploading image: ${error.message}`,
            duration: 2000,
            color: 'danger',
          });
          await toast.present();
          return;
        }
        newFileUrls.push(publicUrl!);
        uploadedCount++;
        this.uploadProgress.set(Math.round((uploadedCount / totalFiles) * 100));
      }
    }

    // Combine existing and new images
    const combinedGalleryImages = [...this.galleryImages(), ...newFileUrls];

    const updates = {
      title: this.form.value.title ?? undefined,
      content: this.form.value.content ?? undefined,
      file_urls: combinedGalleryImages,
    };

    const { error } = await this.supabaseService.updateMicroblog(
      this.blog().id,
      updates
    );

    const toast = await this.toastCtrl.create({
      message: error
        ? `Error: ${error.message}`
        : 'Changes saved successfully!',
      duration: 2000,
      color: error ? 'danger' : 'success',
    });

    await toast.present();

    if (!error) {
      // Reset file uploads after successful save
      this.files.set([]);
      this.imagePreviews.set([]);
      this.uploadProgress.set(0);

      // Update the gallery images to include the new uploads
      this.galleryImages.set(combinedGalleryImages);

      // Navigate back to admin page after successful save
      this.router.navigate(['/admin']);
    }
  }
}
