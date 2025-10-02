import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SecuriteAccesForm } from './securite-acces-form';

describe('SecuriteAccesForm', () => {
  let component: SecuriteAccesForm;
  let fixture: ComponentFixture<SecuriteAccesForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SecuriteAccesForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SecuriteAccesForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
