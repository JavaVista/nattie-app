import { AfterViewInit, Component, computed, effect, inject, OnInit, signal, Signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonInput, IonHeader, IonTitle, IonButtons, IonButton, IonContent, IonCard, IonCardContent, IonToolbar, ModalController, IonProgressBar } from "@ionic/angular/standalone";
import { SupabaseService } from 'src/app/services/supabase.service';
import { Microblog } from '../microblogs.model';
import { QuillModule, EditorChangeContent, EditorChangeSelection } from 'ngx-quill';

@Component({
  selector: 'app-create-microblog',
  templateUrl: './create-microblog.component.html',
  styleUrls: ['./create-microblog.component.scss'],
  standalone: true,
  imports: [IonProgressBar, IonToolbar, IonInput, IonHeader, IonTitle, IonButtons, IonButton, IonContent, IonCard, IonCardContent, IonInput, ReactiveFormsModule, QuillModule]
})
export class CreateMicroblogComponent implements OnInit, AfterViewInit {
  form!: FormGroup;
  isFormValid = signal(false);
  currentUser = computed(() => this.supabaseService.user());
  files = computed<File[]>(() => []);
  uploadProgress = computed(() => 0);

  private modalCtrl = inject(ModalController);
  private supabaseService = inject(SupabaseService);
  private formBuilder = inject(FormBuilder);

  toolbarOptions = [
    ['bold', 'italic', 'underline', 'blockquote'],
    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
    [{ 'script': 'sub' }, { 'script': 'super' }],
    [{ 'indent': '-1' }, { 'indent': '+1' }],
    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
    [{ 'color': [] }, { 'background': [] }],
    [{ 'align': [] }],
    ['link', 'image', 'video'],
    ['clean']
  ];

  quillModules = {
    toolbar: this.toolbarOptions
  };

  quillStyles = {
    height: '200px',
    background: 'white',
    borderRadius: '5px'
  };

  constructor() { }

  ngOnInit() {
    this.form = this.formBuilder.group({
      title: ['', [Validators.required, Validators.minLength(5)]],
      content: ['', [Validators.required, Validators.minLength(10)]],
    });

    effect(() => {
      this.updateFormValidity();
    });
  }

  ngAfterViewInit() {
    const quillElement = document.querySelector('.ql-editor') as HTMLElement;
    quillElement?.focus();
  }

  updateFormValidity() {
    this.isFormValid.set(this.form.valid);
    // For debugging
    // console.log('Form validity updated:', {
    //   valid: this.form.valid,
    //   titleErrors: this.form.get('title')?.errors,
    //   contentErrors: this.form.get('content')?.errors,
    //   titleValue: this.form.get('title')?.value,
    //   contentValue: this.form.get('content')?.value?.length
    // });
  }

  onEditorChange(event: EditorChangeContent | EditorChangeSelection) {
    if (event.event !== 'text-change') return;
    // HTML (for storing and rendering rich text later)
    const htmlContent = event['editor']['root'].innerHTML;

    const plainTextContent = event['editor'].getText().trim();
    this.form.controls['content'].setValue(plainTextContent);

    this.form.controls['content'].markAsTouched();
    this.form.controls['content'].markAsDirty();
    this.updateFormValidity();
  }

  handleFileInput(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.files = computed(() => Array.from(input.files!));
    }
  }

  async createMicroblog() {
    if (this.form.invalid) return;

    const userId = this.currentUser()?.id;

    if (!userId) {
      console.error("User ID is missing! Cannot create microblog.");
      return;
    }

    const fileUrls: string[] = [];

    if (this.files().length > 0) {
      const totalFiles = this.files().length;
      let uploadedCount = 0;

      for (const file of this.files()) {
        const { publicUrl, error } = await this.supabaseService.uploadFile('microblog-media', file);
        if (error) {
          console.error('File upload failed:', error.message);
          return;
        }
        fileUrls.push(publicUrl!);
        uploadedCount++;
        this.uploadProgress = computed(() => Math.round((uploadedCount / totalFiles) * 100));
      }
    }

    const newMicroblog: Microblog = {
      user_id: userId,
      title: this.form.value.title,
      content: this.form.value.content,
      file_urls: fileUrls.length > 0 ? fileUrls : undefined,
      created_at: new Date().toISOString(),
    };

    const { error } = await this.supabaseService.createMicroblog(newMicroblog);
    if (!error) {
      this.dismiss(true);
    } else {
      console.error('Error saving microblog:', error.message);
    }
    console.log(' CreateMicroblogComponent 👉 newMicroblog:', newMicroblog);
  }

  dismiss(success = false) {
    this.modalCtrl.dismiss({ success });
  }


}
