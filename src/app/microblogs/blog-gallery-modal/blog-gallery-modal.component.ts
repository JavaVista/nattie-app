import {
  AfterViewInit,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  ElementRef,
  inject,
  Input,
  ViewChild,
} from '@angular/core';
import {
  ModalController,
  IonContent,
  IonButton,
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-blog-gallery-modal',
  templateUrl: './blog-gallery-modal.component.html',
  styleUrls: ['./blog-gallery-modal.component.scss'],
  standalone: true,
  imports: [IonContent, IonButton],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class BlogGalleryModalComponent implements AfterViewInit {
  @Input() images: string[] = [];
  @Input() startIndex: number = 0;

  @ViewChild('swiperContainer') swiperContainer!: ElementRef;

  private modalCtrl = inject(ModalController);

  ngAfterViewInit() {
    this.swiperContainer.nativeElement.swiper.slideTo(this.startIndex, 0);
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }
}
