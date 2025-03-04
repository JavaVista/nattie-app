import { AfterViewInit, Component, computed, inject, OnInit, Signal } from '@angular/core';
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
  isFormValid = computed(() => this.form.valid);
  currentUser = computed(() => this.supabaseService.user());
  files = computed<File[]>(() => []);
  uploadProgress = computed(() => 0);

  private modalCtrl = inject(ModalController);
  private supabaseService = inject(SupabaseService);
  private formBuilder = inject(FormBuilder);

  toolbarOptions = [
    ['bold', 'italic', 'underline'],
    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
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
  }

  ngAfterViewInit() {
    const quillElement = document.querySelector('.ql-editor') as HTMLElement;
    quillElement?.focus();
  }

  onEditorChange(event: EditorChangeContent | EditorChangeSelection) {
    this.form.controls['content'].setValue(event['editor']['root'].innerHTML);
  }

  handleFileInput(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.files = computed(() => Array.from(input.files!));
    }
  }

  async createMicroblog() {
    if (this.form.invalid) return;

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
      userId: this.currentUser()?.id,
      title: this.form.value.title,
      content: this.form.value.content,
      fileUrls,
      created_at: new Date().toISOString(),
    };

    const { error } = await this.supabaseService.createMicroblog(newMicroblog);
    if (!error) {
      this.dismiss(true);
    } else {
      console.error('Error saving microblog:', error.message);
    }
  }

  dismiss(success = false) {
    this.modalCtrl.dismiss({ success });
  }


}
