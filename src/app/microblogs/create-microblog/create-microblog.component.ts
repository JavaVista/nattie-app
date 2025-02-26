import { Component, computed, inject, OnInit, Signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonInput, IonHeader, IonTitle, IonButtons, IonButton, IonContent, IonCard, IonCardContent, IonTextarea, IonToolbar } from "@ionic/angular/standalone";
import { SupabaseService } from 'src/app/services/supabase.service';
import { ModalController } from '@ionic/angular/standalone';
import { Microblog } from '../microblogs.model';

@Component({
  selector: 'app-create-microblog',
  templateUrl: './create-microblog.component.html',
  styleUrls: ['./create-microblog.component.scss'],
  standalone: true,
  imports: [IonToolbar, IonInput, IonHeader, IonTitle, IonButtons, IonButton, IonContent, IonCard, IonCardContent, IonInput, IonTextarea, ReactiveFormsModule]
})
export class CreateMicroblogComponent implements OnInit {
  form!: FormGroup;
  isFormValid!: Signal<boolean>;

  private modalCtrl = inject(ModalController);
  private supabaseService = inject(SupabaseService);
  private formBuilder = inject(FormBuilder);

  constructor() { }

  ngOnInit() {
    this.form = this.formBuilder.group({
      title: ['', [Validators.required, Validators.minLength(5)]],
      content: ['', [Validators.required, Validators.minLength(10)]],
      imageUrl: ['']
    });

    this.isFormValid = computed(() => this.form.valid);
  }

  async createMicroblog() {
    if (this.form.invalid) return;

    const newMicroblog: Microblog = {
      userId: 'admin',
      title: this.form.value.title,
      content: this.form.value.content,
      imageUrl: this.form.value.imageUrl || '',
    };

    const { data, error } = await this.supabaseService.createMicroblog(newMicroblog);
    if (!error) {
      this.dismiss(true);
    } else {
      console.error('Error creating microblog:', error.message);
    }
  }

  dismiss(success = false) {
    this.modalCtrl.dismiss({ success });
  }

}
