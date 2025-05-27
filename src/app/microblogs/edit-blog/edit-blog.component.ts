import {
  Component,
  ElementRef,
  inject,
  Input,
  OnInit,
  signal,
  Signal,
  ViewChild,
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
  IonSpinner,
} from '@ionic/angular/standalone';
import { QuillModule } from 'ngx-quill';
import { Router } from '@angular/router';
import { FileUtilsService } from 'src/app/services/file-utils.service';
import { QuillUtils } from 'src/app/shared/quill-utils';

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
    IonSpinner,
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
  private fileUtils = inject(FileUtilsService);

  form = this.formBuilder.group({
    title: ['', [Validators.required, Validators.minLength(5)]],
    content: ['', [Validators.required]],
  });

  galleryImages = signal<string[]>([]);
  files = signal<File[]>([]);
  uploadProgress = signal(0);
  imagePreviews = signal<string[]>([]);
  conversionProgress = signal<number[]>([]);

  quillStyles = {
    height: '200px',
    background: 'white',
    borderRadius: '5px',
  };

  ngOnInit() {
    if (this.blog()) {
      console.log('Initializing form with blog data:', {
        title: this.blog().title,
        contentType: typeof this.blog().content,
        content: this.blog().content,
      });

      // Ensure content is in proper Delta format
      const formattedContent = QuillUtils.ensureDeltaFormat(
        this.blog().content
      );

      this.form.patchValue({
        title: this.blog().title,
        content: formattedContent,
      });

      this.galleryImages.set(this.blog().gallery_images || []);
    } else {
      console.error('Blog data is missing or undefined');
    }
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

  async handleFileInput(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    // Store the original
    const originalFiles = Array.from(input.files);
    this.files.set(originalFiles);

    // Create arrays to store preview data
    const previews: string[] = [];
    const processedFiles: File[] = [];
    const progressArray: number[] = new Array(originalFiles.length).fill(0);

    // Update the progress
    this.conversionProgress.set(progressArray);

    // Process each file for preview
    for (let i = 0; i < originalFiles.length; i++) {
      const file = originalFiles[i];

      try {
        // Process HEIC files immediately
        if (this.fileUtils.isHeicFile(file)) {
          const convertedFile = await this.fileUtils.convertHeicToJpeg(
            file,
            (progress) => {
              // Update progress for this file
              const updatedProgress = [...this.conversionProgress()];
              updatedProgress[i] = progress;
              this.conversionProgress.set(updatedProgress);
            }
          );
          processedFiles[i] = convertedFile;

          // Generate preview from the converted file
          const reader = new FileReader();
          reader.onload = (e: any) => {
            previews[i] = e.target.result;
            this.imagePreviews.set([...previews]);
          };
          reader.readAsDataURL(convertedFile);
        } else if (file.type.startsWith('image/')) {
          // For non-HEIC images, use them directly
          processedFiles[i] = file;

          const reader = new FileReader();
          reader.onload = (e: any) => {
            previews[i] = e.target.result;
            this.imagePreviews.set([...previews]);
          };
          reader.readAsDataURL(file);

          // Mark as complete immediately
          const updatedProgress = [...this.conversionProgress()];
          updatedProgress[i] = 100;
          this.conversionProgress.set(updatedProgress);
        } else {
          // For non-image files (if any), use placeholder
          processedFiles[i] = file;
          previews[i] = 'assets/images/file-placeholder.png';
          this.imagePreviews.set([...previews]);

          // Mark as complete immediately
          const updatedProgress = [...this.conversionProgress()];
          updatedProgress[i] = 100;
          this.conversionProgress.set(updatedProgress);
        }
      } catch (error) {
        console.error('Error processing file for preview:', error);
        // Use a placeholder on error
        processedFiles[i] = file;
        previews[i] = 'assets/images/file-error-placeholder.png';
        this.imagePreviews.set([...previews]);

        // Mark as complete with error
        const updatedProgress = [...this.conversionProgress()];
        updatedProgress[i] = 100;
        this.conversionProgress.set(updatedProgress);
      }
    }

    // Update the files array with processed files
    this.files.set(processedFiles);
  }

  clearSelectedFiles() {
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
    this.files.set([]);
    this.imagePreviews.set([]);
    this.conversionProgress.set([]);
  }

  getImagePreviewUrl(file: File): string {
    const index = this.files().indexOf(file);
    return this.imagePreviews()[index] || '';
  }

  getFileConversionProgress(index: number): number {
    return this.conversionProgress()[index] || 0;
  }

  removeSelectedFile(index: number) {
    // Create copies of the arrays to modify
    const updatedFiles = [...this.files()];
    const updatedPreviews = [...this.imagePreviews()];
    const updatedProgress = [...this.conversionProgress()];

    // Remove the file at the specified index
    updatedFiles.splice(index, 1);
    updatedPreviews.splice(index, 1);
    updatedProgress.splice(index, 1);

    // Update the signals
    this.files.set(updatedFiles);
    this.imagePreviews.set(updatedPreviews);
    this.conversionProgress.set(updatedProgress);
  }

  async saveChanges() {
    if (this.form.invalid) return;

    // Upload new images if any
    const newFileUrls: string[] = [];

    if (this.files().length > 0) {
      const totalFiles = this.files().length;
      let uploadedCount = 0;

      for (const file of this.files()) {
        try {
          // Convert HEIC to JPEG if needed
          const processedFile = await this.fileUtils.convertHeicToJpeg(file);

          const { publicUrl, error } = await this.supabaseService.uploadFile(
            'microblog-media',
            processedFile
          );

          if (error) {
            console.error('File upload failed:', error.message);
            const toast = await this.toastCtrl.create({
              message: `Error uploading image: ${error.message}`,
              duration: 3000,
              color: 'danger',
              position: 'bottom',
            });
            await toast.present();
            return;
          }

          newFileUrls.push(publicUrl!);
          uploadedCount++;
          this.uploadProgress.set(
            Math.round((uploadedCount / totalFiles) * 100)
          );
        } catch (err) {
          console.error('Unexpected error during file processing:', err);
          const toast = await this.toastCtrl.create({
            message: `Error processing image: ${
              err instanceof Error ? err.message : 'Unknown error'
            }`,
            duration: 3000,
            color: 'danger',
            position: 'bottom',
          });
          await toast.present();
          return;
        }
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
      this.conversionProgress.set([]);

      // Update the gallery images to include the new uploads
      this.galleryImages.set(combinedGalleryImages);

      // Navigate back to admin page after successful save
      this.router.navigate(['/admin']);
    }
  }

  getDisplayUrl(url: string): string {
    return this.fileUtils.getDisplayUrl(url);
  }
}
