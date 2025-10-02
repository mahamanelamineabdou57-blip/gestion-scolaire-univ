import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EcueForm } from './ecue-form';

describe('EcueForm', () => {
  let component: EcueForm;
  let fixture: ComponentFixture<EcueForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EcueForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EcueForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
