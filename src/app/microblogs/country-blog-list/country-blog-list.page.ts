import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-country-blog-list',
  templateUrl: './country-blog-list.page.html',
  styleUrls: ['./country-blog-list.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class CountryBlogListPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
