import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CountryBlogListPage } from './country-blog-list.page';

describe('CountryBlogListPage', () => {
  let component: CountryBlogListPage;
  let fixture: ComponentFixture<CountryBlogListPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CountryBlogListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
