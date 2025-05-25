import {
  AfterViewInit,
  Component,
  computed,
  effect,
  ElementRef,
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
  IonIcon,
  IonLabel,
  IonChip,
  IonSpinner,
} from '@ionic/angular/standalone';
import { SupabaseService } from 'src/app/services/supabase.service';
import { Microblog } from '../microblogs.model';
import { QuillModule, QuillEditorComponent } from 'ngx-quill';
import Quill, { Range } from 'quill';
import { AiService } from 'src/app/services/ai.service';
import { LocationSelectComponent } from 'src/app/locations/location-select/location-select.component';
import { Location } from 'src/app/locations/location.model';
import { PlaceSelectComponent } from 'src/app/places/place-select/place-select.component';
import { Place } from 'src/app/places/place.model';
import { PlaceService } from 'src/app/services/place.service';
import { MarkdownPipe } from 'src/app/shared/markdown.pipe';
import { FileUtilsService } from 'src/app/services/file-utils.service';

@Component({
  selector: 'app-create-microblog',
  templateUrl: './create-microblog.component.html',
  styleUrls: ['./create-microblog.component.scss'],
  standalone: true,
  imports: [
    IonChip,
    IonLabel,
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
    IonIcon,
    MarkdownPipe,
    IonSpinner
  ],
})
export class CreateMicroblogComponent implements OnInit, AfterViewInit {
  form!: FormGroup;
  isFormValid = signal(false);
  currentUser = computed(() => this.supabaseService.user());
  files = signal<File[]>([]);
  uploadProgress = signal(0);
  uselessFacts = signal<string[]>([]);
  isGeneratingFacts = signal(false);
  conversionProgress = signal<number[]>([]);

  selectedLocation = signal<Location | null>(null);
  selectedPlace = signal<Place | null>(null);
  placesLoaded = signal(false);
  imagePreviews = signal<string[]>([]);

  private modalCtrl = inject(ModalController);
  private supabaseService = inject(SupabaseService);
  private formBuilder = inject(FormBuilder);
  private aiService = inject(AiService);
  private placeService = inject(PlaceService);
  private fileUtils = inject(FileUtilsService);
  private toolbarOptions = [
    ['bold', 'italic', 'underline', 'blockquote'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    [{ script: 'sub' }, { script: 'super' }],
    [{ indent: '-1' }, { indent: '+1' }],
    ['table'],
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    [{ color: [] }, { background: [] }],
    [{ align: [] }],
    ['link', 'image'],
    ['clean'],
  ];

  @ViewChild(QuillEditorComponent) editorComponent?: QuillEditorComponent;
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

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
    this.placeService.fetchPlaces().then(() => {
      this.placesLoaded.set(true);
    });
    this.form = this.formBuilder.group({
      title: ['', [Validators.required, Validators.minLength(5)]],
      content: ['', [Validators.required]],
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
  }

  onLocationSelected(location: Location | null) {
    this.selectedLocation.set(location);
    this.selectedPlace.set(null);
    this.updateFormValidity();
  }

  onPlaceSelected(place: Place | null) {
    this.selectedPlace.set(place);
  }

  shouldDisableUselessFacts = computed(() => {
    return this.isGeneratingFacts() || this.selectedLocation() === null;
  });

  async generateUselessFacts() {
    const locationSelected = this.selectedLocation();
    const placeSelected = this.selectedPlace();

    if (!locationSelected) {
      console.warn('No location selected for generating facts');
      return;
    }

    const location = `${locationSelected.city}, ${locationSelected.country}`;
    const place = placeSelected?.place_name;

    this.isGeneratingFacts.set(true);

    this.aiService.generateUselessFacts(location, place).subscribe({
      next: (facts) => {
        this.uselessFacts.set(facts);
      },
      error: (err) => console.error('AI Generation error:', err),
      complete: () => this.isGeneratingFacts.set(false),
    });
  }

  triggerFileInput() {
    if (this.fileInput) {
      this.fileInput.nativeElement.click();
    }
  }

  async handleFileInput(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const originalFiles = Array.from(input.files);
    this.files.set(originalFiles);

    // Create arrays to store preview data
    const previews: string[] = [];
    const processedFiles: File[] = [];
    const progressArray: number[] = new Array(originalFiles.length).fill(0);

    this.conversionProgress.set(progressArray);

    // Process each file for preview
    for (let i = 0; i < originalFiles.length; i++) {
      const file = originalFiles[i];

      try {
        // Process HEIC files immediately for preview
        if (this.fileUtils.isHeicFile(file)) {
          const convertedFile = await this.fileUtils.convertHeicToJpeg(
            file,
            (progress) => {
              // Update progress for this specific file
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
          // For non-HEIC images, use directly
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
          // For non-image files (if any), placeholder
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
        // A placeholder on error
        processedFiles[i] = file;
        previews[i] = 'assets/images/file-error-placeholder.png';
        this.imagePreviews.set([...previews]);

        // Mark as complete with error immediately
        const updatedProgress = [...this.conversionProgress()];
        updatedProgress[i] = 100;
        this.conversionProgress.set(updatedProgress);
      }
    }

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
    // copies of the arrays to modify
    const updatedFiles = [...this.files()];
    const updatedPreviews = [...this.imagePreviews()];
    const updatedProgress = [...this.conversionProgress()];

    // Remove the file at the specified index
    updatedFiles.splice(index, 1);
    updatedPreviews.splice(index, 1);
    updatedProgress.splice(index, 1);

    // Update
    this.files.set(updatedFiles);
    this.imagePreviews.set(updatedPreviews);
    this.conversionProgress.set(updatedProgress);
  }

  async createMicroblog() {
    if (this.form.invalid || !this.selectedLocation()) {
      console.error(
        'Cannot create microblog: form invalid or no location selected',
        {
          formValid: this.form.valid,
          locationSelected: !!this.selectedLocation(),
        }
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
        try {
          // Convert HEIC to JPEG if needed - conversion should already be done in handleFileInput
          const processedFile = file; 

          const { publicUrl, error } = await this.supabaseService.uploadFile(
            'microblog-media',
            processedFile
          );

          if (error) {
            console.error('File upload failed:', error.message);
            return;
          }

          fileUrls.push(publicUrl!);
          uploadedCount++;
          this.uploadProgress.set(
            Math.round((uploadedCount / totalFiles) * 100)
          );
        } catch (err) {
          console.error('Unexpected error during file processing:', err);
          return;
        }
      }
    }

    const contentValue = this.form.get('content')?.value;
    const location = this.selectedLocation();
    const place = this.selectedPlace();

    const newMicroblog: Microblog = {
      user_id: userId,
      title: this.form.value.title,
      content: contentValue,
      location_id: location?.id,
      country: location?.country,
      useless_facts:
        this.uselessFacts().length > 0 ? this.uselessFacts() : undefined,
      file_urls: fileUrls.length > 0 ? fileUrls : undefined,
      created_at: new Date().toISOString(),
      place_id: place?.id || undefined,
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
