import {
  AfterViewInit,
  Component,
  computed,
  effect,
  inject,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  IonInput,
  IonHeader,
  IonTitle,
  IonButtons,
  IonButton,
  IonContent,
  IonCard,
  IonCardContent,
  IonToolbar,
  ModalController,
  IonProgressBar,
  IonCardHeader,
  IonCardTitle,
} from '@ionic/angular/standalone';
import { SupabaseService } from 'src/app/services/supabase.service';
import { Microblog } from '../microblogs.model';
import {
  QuillModule,
  EditorChangeContent,
  EditorChangeSelection,
  QuillEditorComponent,
} from 'ngx-quill';
import Quill, { Range } from 'quill';
import { AiService } from 'src/app/services/ai.service';
import { LocationSelectComponent } from 'src/app/locations/location-select/location-select.component';
import { Location } from 'src/app/locations/location.model';
import { PlaceSelectComponent } from 'src/app/places/place-select/place-select.component';
import { Place } from 'src/app/places/place.model';

@Component({
  selector: 'app-create-microblog',
  templateUrl: './create-microblog.component.html',
  styleUrls: ['./create-microblog.component.scss'],
  standalone: true,
  imports: [
    IonProgressBar,
    IonToolbar,
    IonInput,
    IonHeader,
    IonTitle,
    IonButtons,
    IonButton,
    IonContent,
    IonCard,
    IonCardContent,
    IonInput,
    IonCardHeader,
    IonCardTitle,
    ReactiveFormsModule,
    QuillModule,
    LocationSelectComponent,
    PlaceSelectComponent,
  ],
})
export class CreateMicroblogComponent implements OnInit, AfterViewInit {
  form!: FormGroup;
  isFormValid = signal(false);
  currentUser = computed(() => this.supabaseService.user());
  files = computed<File[]>(() => []);
  uploadProgress = computed(() => 0);
  uselessFacts = signal<string[]>([]);
  isGeneratingFacts = signal(false);

  selectedLocation = signal<Location | null>(null);
  selectedPlaceId = signal<string | null>(null);

  private modalCtrl = inject(ModalController);
  private supabaseService = inject(SupabaseService);
  private formBuilder = inject(FormBuilder);
  private aiService = inject(AiService);

  @ViewChild(QuillEditorComponent) editorComponent?: QuillEditorComponent;

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

  constructor() {
    effect(() => {
      this.updateFormValidity();
    });
  }

  ngOnInit() {
    this.form = this.formBuilder.group({
      title: ['', [Validators.required, Validators.minLength(5)]],
      content: ['', [Validators.required, Validators.minLength(10)]],
    });
  }

  ngAfterViewInit() {
    if (this.editorComponent) {
      this.editorComponent.onEditorCreated.subscribe((editor) => {
        this.setupImageHandler(editor);
      });
    }
  }

  private setupImageHandler(editor: Quill) {
    const imageHandler = async () => {
      const input = document.createElement('input');
      input.setAttribute('type', 'file');
      input.setAttribute('accept', 'image/*');
      input.click();

      input.onchange = async () => {
        const file = input.files?.[0];
        if (!file) return;

        const { publicUrl, error } = await this.supabaseService.uploadFile(
          'microblog-media',
          file
        );
        if (error) {
          console.error('File upload failed:', error.message);
          return;
        }

        const range: Range | null = editor.getSelection();
        if (range) {
          editor.insertEmbed(range.index, 'image', publicUrl);
          editor.setSelection(range.index + 1);
        }
      };
    };

    (editor.getModule('toolbar') as any).addHandler('image', imageHandler);
  }

  updateFormValidity() {
    const hasValidLocation = this.selectedLocation() !== null;
    this.isFormValid.set(this.form.valid && hasValidLocation);
    // For debugging
    // console.log('Form validity updated:', {
    //   valid: this.form.valid,
    //   titleErrors: this.form.get('title')?.errors,
    //   contentErrors: this.form.get('content')?.errors,
    //   titleValue: this.form.get('title')?.value,
    //   contentValue: this.form.get('content')?.value?.length
    // });
  }

  onLocationSelected(location: Location | null) {
    this.selectedLocation.set(location);
    this.updateFormValidity();
  }

  onEditorChange(event: EditorChangeContent | EditorChangeSelection) {
    if (event.event !== 'text-change') return;
    // HTML & Text (for storing and rendering later)
    const htmlContent = event['editor']['root'].innerHTML;
    const plainTextContent = event['editor'].getText().trim();
    const deltaContent = event['editor'].getContents();

    this.form.controls['content'].setValue(JSON.stringify(deltaContent));

    this.form.controls['content'].markAsTouched();
    this.form.controls['content'].markAsDirty();
    this.updateFormValidity();
  }

  onPlaceSelected(place: Place) {
    this.selectedPlaceId.set(place.id);
  }

  // async uploadImageFromEditor(editor: any) {
  //   const input = document.createElement('input');
  //   input.setAttribute('type', 'file');
  //   input.setAttribute('accept', 'image/*');
  //   input.click();

  //   input.onchange = async () => {
  //     const file = input.files?.[0];
  //     if (!file) return;

  //     const { publicUrl, error } = await this.supabaseService.uploadFile('microblog-media', file);
  //     if (error) {
  //       console.error('File upload failed:', error.message);
  //       return;
  //     }

  //     const range = editor.getSelection();
  //     editor.insertEmbed(range.index, 'image', publicUrl);
  //   };
  // }

  async generateUselessFacts() {
    const location = this.selectedLocation();

    if (!location) {
      console.warn('No location selected for generating facts');
      return;
    }

    const title = `${location.city}, ${location.country}`;

    this.isGeneratingFacts.set(true);

    this.aiService.generateUselessFacts(title, location.city).subscribe({
      next: (facts) => {
        this.uselessFacts.set(facts);
      },
      error: (err) => console.error('AI Generation error:', err),
      complete: () => this.isGeneratingFacts.set(false),
    });
  }

  handleFileInput(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.files = computed(() => Array.from(input.files!));
    }
  }

  async createMicroblog() {
    if (this.form.invalid || !this.selectedLocation()) {
      console.error(
        'Cannot create microblog: form invalid or no location selected'
      );
      return;
    }

    const userId = this.currentUser()?.id;

    if (!userId) {
      console.error('User ID is missing! Cannot create microblog.');
      return;
    }

    const fileUrls: string[] = [];

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
          return;
        }
        fileUrls.push(publicUrl!);
        uploadedCount++;
        this.uploadProgress = computed(() =>
          Math.round((uploadedCount / totalFiles) * 100)
        );
      }
    }

    const deltaContent = JSON.parse(this.form.value.content);
    const location = this.selectedLocation();

    const newMicroblog: Microblog = {
      user_id: userId,
      title: this.form.value.title,
      content: deltaContent,
      location_id: location?.id,
      country: location?.country,
      useless_facts:
        this.uselessFacts().length > 0 ? this.uselessFacts() : undefined,
      file_urls: fileUrls.length > 0 ? fileUrls : undefined,
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
