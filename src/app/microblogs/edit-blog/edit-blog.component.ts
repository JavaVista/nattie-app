import {
  Component,
  inject,
  Input,
  OnInit,
  signal,
  Signal,
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
} from '@ionic/angular/standalone';
import {
  QuillModule,
  EditorChangeContent,
  EditorChangeSelection,
} from 'ngx-quill';

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

  private supabaseService = inject(SupabaseService);
  private formBuilder = inject(FormBuilder);
  private toastCtrl = inject(ToastController);

  form = this.formBuilder.group({
    title: ['', [Validators.required, Validators.minLength(5)]],
    content: ['', [Validators.required, Validators.minLength(10)]],
  });

  galleryImages = signal<string[]>([]);

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

  onEditorChange(event: EditorChangeContent | EditorChangeSelection) {
    if (event.event !== 'text-change') return;

    const deltaContent = event['editor'].getContents();
    console.log(' EditBlogComponent 👉 deltaContent:', deltaContent);

    this.form.controls['content'].setValue(JSON.stringify(deltaContent));

    this.form.controls['content'].markAsTouched();
    this.form.controls['content'].markAsDirty();
  }

  removeImage(index: number) {
    const updated = [...this.galleryImages()];
    updated.splice(index, 1);
    this.galleryImages.set(updated);
  }

  async saveChanges() {
    if (this.form.invalid) return;

    const updates = {
      title: this.form.value.title ?? undefined,
      content: this.form.value.content ?? undefined,
      file_urls: this.galleryImages(),
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
  }
}
