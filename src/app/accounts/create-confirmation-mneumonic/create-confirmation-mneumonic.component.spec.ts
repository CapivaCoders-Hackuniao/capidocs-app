import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateConfirmationMneumonicComponent } from './create-confirmation-mneumonic.component';

describe('CreateConfirmationMneumonicComponent', () => {
  let component: CreateConfirmationMneumonicComponent;
  let fixture: ComponentFixture<CreateConfirmationMneumonicComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateConfirmationMneumonicComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateConfirmationMneumonicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
