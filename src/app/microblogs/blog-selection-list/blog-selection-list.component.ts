import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Microblog } from '../microblogs.model';
import { IonList, IonItem, IonLabel, IonButton, IonThumbnail } from "@ionic/angular/standalone";

@Component({
  selector: 'app-blog-selection-list',
  templateUrl: './blog-selection-list.component.html',
  styleUrls: ['./blog-selection-list.component.scss'],
  standalone: true,
  imports: [IonList, IonItem, IonLabel, IonButton, IonThumbnail],
})
export class BlogSelectionListComponent {
  @Input() microblogs: Microblog[] = [];
  @Input() editMicroblog!: (blog: Microblog) => void;
  @Output() deleteMicroblog = new EventEmitter<string>();
  @Input() isAdminView = false;

  constructor() {}

  getThumbnail(blog: Microblog): string {
    return blog.file_urls && blog.file_urls.length > 0
      ? blog.file_urls[0]
      : 'assets/images/EuroTrip.png';
  }

  getPlainTextPreview(content: any, maxCharacters: number): string {
    if (!content || !content.ops || !Array.isArray(content.ops)) return '';
    let text = '';
    for (const op of content.ops) {
      if (typeof op.insert === 'string') {
        text += op.insert;
      }
      if (text.length >= maxCharacters) {
        return text.substring(0, maxCharacters) + '...';
      }
    }
    return text;
  }
  onDelete(id: Microblog['id']) {
    this.deleteMicroblog.emit(id);
  }
}
