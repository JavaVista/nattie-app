import {
  Component,
  inject,
  Input,
  OnInit,
  signal,
  Signal,
} from '@angular/core';
import { Microblog } from '../microblogs.model';
import { SupabaseService } from 'src/app/services/supabase.service';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  ToastController,
  IonContent,
  IonButton,
  IonInput,
} from '@ionic/angular/standalone';
import {
  QuillModule,
  EditorChangeContent,
  EditorChangeSelection,
  QuillEditorComponent,
} from 'ngx-quill';

@Component({
  selector: 'app-edit-blog',
  templateUrl: './edit-blog.component.html',
  styleUrls: ['./edit-blog.component.scss'],
  standalone: true,
  imports: [ReactiveFormsModule, IonContent, IonButton, IonInput, QuillModule],
})
export class EditBlogComponent implements OnInit {
  @Input({ required: true }) blog!: Signal<Microblog>;

  private supabaseService = inject(SupabaseService);
  private formBuilder = inject(FormBuilder);
  private toastCtrl = inject(ToastController);

  form = this.formBuilder.group({
    title: ['', [Validators.required, Validators.minLength(5)]],
    content: ['', [Validators.required, Validators.minLength(10)]],
  });

  galleryImages = signal<string[]>([]);

  private toolbarOptions = [
    ['bold', 'italic', 'underline', 'blockquote'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    [{ script: 'sub' }, { script: 'super' }],
    [{ indent: '-1' }, { indent: '+1' }],
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    [{ color: [] }, { background: [] }],
    [{ align: [] }],
    ['link', 'image'],
    ['clean'],
  ];

  quillModules = {
    toolbar: this.toolbarOptions,
  };

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

    this.galleryImages.set(this.blog().file_urls || []);
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
      this.blog().id!,
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
