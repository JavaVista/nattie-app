import {
  Component,
  EventEmitter,
  inject,
  Input,
  Output,
  signal,
  WritableSignal,
} from '@angular/core';
import { Microblog } from '../microblogs.model';
import {
  IonContent,
  IonButton,
  IonIcon,
  IonGrid,
  IonRow,
  IonCol,
  ToastController,
  LoadingController,
  AlertController,
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { FileUtilsService } from 'src/app/services/file-utils.service';
import { QuillUtils } from 'src/app/shared/quill-utils';
import { SupabaseService } from 'src/app/services/supabase.service';

@Component({
  selector: 'app-blog-selection-list',
  templateUrl: './blog-selection-list.component.html',
  styleUrls: ['./blog-selection-list.component.scss'],
  standalone: true,
  imports: [IonContent, IonButton, IonIcon, IonGrid, IonRow, IonCol],
})
export class BlogSelectionListComponent {
  // Convert to signal-based state management
  @Input() set microblogs(value: Microblog[]) {
    this.microblogsSignal.set(value);
  }

  get microblogs(): Microblog[] {
    return this.microblogsSignal();
  }

  microblogsSignal: WritableSignal<Microblog[]> = signal<Microblog[]>([]);

  @Input() isAdminView = false;

  @Output() editMicroblog = new EventEmitter<Microblog>();
  @Output() deleteMicroblog = new EventEmitter<string>();

  private router = inject(Router);
  private fileUtils = inject(FileUtilsService);
  private supabaseService = inject(SupabaseService);
  private toastCtrl = inject(ToastController);
  private loadingCtrl = inject(LoadingController);
  private alertCtrl = inject(AlertController);

  getThumbnail(blog: Microblog): string {
    if (blog.file_urls && blog.file_urls.length > 0) {
      return this.fileUtils.getDisplayUrl(blog.file_urls[0]);
    }
    return 'assets/images/EuroTrip.png';
  }

  getPlainTextPreview(content: any, maxCharacters: number): string {
    if (!content) return '';

    // Extract plain text from Quill Delta
    const text = QuillUtils.extractTextFromDelta(content);

    if (text.length > maxCharacters) {
      return text.substring(0, maxCharacters) + '...';
    }
    return text;
  }

  readMore(id: string) {
    this.router.navigate(['/microblog', id]);
  }

  onEdit(blog: Microblog) {
    this.editMicroblog.emit(blog);
  }

  async onDelete(id: string) {
    const alert = await this.alertCtrl.create({
      header: 'Are You Sure?',
      message:
        'Deleting this Blog will permanently remove the blog and all files.',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => {
            this.confirmDelete(id);
          },
        },
      ],
    });

    await alert.present();
  }

  private async confirmDelete(id: string) {
    try {
      const loading = await this.loadingCtrl.create({
        message: 'Deleting blog and files...',
      });
      await loading.present();

      const { error } = await this.supabaseService.deleteMicroblog(id);

      await loading.dismiss();

      if (error) {
        console.error('Error deleting blog:', error);
        const toast = await this.toastCtrl.create({
          message: `Error deleting blog: ${error.message}`,
          duration: 3000,
          color: 'danger',
          position: 'bottom',
        });
        await toast.present();
        return;
      }

      const updatedBlogs = this.microblogsSignal().filter(
        (blog) => blog.id !== id
      );
      this.microblogsSignal.set(updatedBlogs);

      console.log('Blog deleted successfully, updated local state');

      const toast = await this.toastCtrl.create({
        message: 'Blog deleted successfully',
        duration: 2000,
        color: 'success',
        position: 'bottom',
      });
      await toast.present();

      this.deleteMicroblog.emit(id);
    } catch (err) {
      console.error('Unexpected error during deletion:', err);
      const toast = await this.toastCtrl.create({
        message: `Unexpected error: ${
          err instanceof Error ? err.message : 'Unknown error'
        }`,
        duration: 3000,
        color: 'danger',
        position: 'bottom',
      });
      await toast.present();
    }
  }
}
