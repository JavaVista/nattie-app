import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { Microblog } from '../microblogs.model';
import {
  IonContent,
  IonButton,
  IonIcon,
  IonGrid,
  IonRow,
  IonCol,
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { FileUtilsService } from 'src/app/services/file-utils.service';

@Component({
  selector: 'app-blog-selection-list',
  templateUrl: './blog-selection-list.component.html',
  styleUrls: ['./blog-selection-list.component.scss'],
  standalone: true,
  imports: [IonContent, IonButton, IonIcon, IonGrid, IonRow, IonCol],
})
export class BlogSelectionListComponent {
  @Input() microblogs: Microblog[] = [];
  @Input() isAdminView = false;

  @Output() editMicroblog = new EventEmitter<Microblog>();
  @Output() deleteMicroblog = new EventEmitter<string>();

  private router = inject(Router);
  private fileUtils = inject(FileUtilsService);

  getThumbnail(blog: Microblog): string {
    if (blog.file_urls && blog.file_urls.length > 0) {
      return this.fileUtils.getDisplayUrl(blog.file_urls[0]);
    }
    return 'assets/images/EuroTrip.png';
  }

  getPlainTextPreview(content: any, maxCharacters: number): string {
    console.log(' BlogSelectionListComponent 👉 content:', content);

    if (!content) return '';

    let text = '';

    // Check if content is a Quill Delta
    if (content.ops && Array.isArray(content.ops)) {
      for (const op of content.ops) {
        console.log(' BlogSelectionListComponent 👉 op:', op);
        if (typeof op.insert === 'string') {
          text += op.insert;
        }
      }
    }
    // Check if content is HTML string
    else if (typeof content === 'string') {
      //  HTML stripping logic
      text = content
        .replace(/<[^>]*>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/\s+/g, ' ');
    }

    text = text.trim();
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

  onDelete(id: Microblog['id']) {
    this.deleteMicroblog.emit(id);
  }
}
