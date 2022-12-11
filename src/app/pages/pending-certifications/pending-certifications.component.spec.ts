import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PendingCertificationsComponent } from './pending-certifications.component';

describe('PendingCertificationsComponent', () => {
  let component: PendingCertificationsComponent;
  let fixture: ComponentFixture<PendingCertificationsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PendingCertificationsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PendingCertificationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
