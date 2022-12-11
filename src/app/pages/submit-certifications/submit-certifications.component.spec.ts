import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SubmitCertificationsComponent } from './submit-certifications.component';

describe('SubmitCertificationsComponent', () => {
  let component: SubmitCertificationsComponent;
  let fixture: ComponentFixture<SubmitCertificationsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SubmitCertificationsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SubmitCertificationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
