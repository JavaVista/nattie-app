import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CreateMicroblogComponent } from './create-microblog.component';

describe('CreateMicroblogComponent', () => {
  let component: CreateMicroblogComponent;
  let fixture: ComponentFixture<CreateMicroblogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [CreateMicroblogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateMicroblogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
