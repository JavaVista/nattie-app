import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MicroblogPage } from './microblog.page';

describe('MicroblogPage', () => {
  let component: MicroblogPage;
  let fixture: ComponentFixture<MicroblogPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MicroblogPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
